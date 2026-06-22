/**
 * SYLVE Source — Pipeline de réponse sourcée (Phase 2, NIVEAU 1 strict)
 *
 * Cœur PARTAGÉ entre la route serveur (app/api/source/ask) et le harnais
 * d'éval (scripts/eval.ts) : les deux DOIVENT exécuter exactement le même
 * pipeline, sinon l'éval ne teste pas la prod.
 *
 *   embed question (Voyage, input_type "query")
 *     -> match_source_chunks (top-K multi-documents)
 *     -> filtre seuil de similarité
 *     -> si rien ne passe : « hors base » SANS appeler Claude
 *     -> sinon : contexte numéroté [1..N] -> synthèse Claude (strict)
 *
 * Les clients Supabase (service-role) et Anthropic sont injectés en
 * dépendances pour que la route et l'éval réutilisent le même code.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type Anthropic from "@anthropic-ai/sdk";
import {
  EMBED_MODEL,
  CLAUDE_MODEL,
  TOP_K,
  SIMILARITY_THRESHOLD,
  OUT_OF_BASE_MESSAGE,
  SYSTEM_PROMPT,
} from "./prompt";

export type SourceCitation = {
  n: number;
  id: number;
  document: string;
  page: number;
  article: string | null;
  chunk_text: string;
  article_full_text: string | null;
  chunk_start: number | null;
  chunk_end: number | null;
  similarity: number;
};

export type AskResult = {
  answer: string; // markdown avec marqueurs [n]
  out_of_base: boolean;
  sources: SourceCitation[];
};

type MatchRow = {
  id: number;
  document: string;
  page: number;
  article: string | null;
  chunk_text: string;
  similarity: number;
};

/** Embedding d'une question via Voyage (REST). input_type = "query". */
async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: [text], model: EMBED_MODEL, input_type: "query" }),
  });
  if (!res.ok) throw new Error(`Voyage ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data: { embedding: number[] }[] };
  return json.data[0].embedding;
}

/** Construit le bloc d'extraits numérotés passé à Claude. */
function buildContext(sources: SourceCitation[]): string {
  return sources
    .map((s) => {
      const cite = `${s.document}, p.${s.page}${s.article ? `, ${s.article}` : ""}`;
      return `[${s.n}] (${cite})\n${s.chunk_text.replace(/\s+/g, " ").trim()}`;
    })
    .join("\n\n");
}

/** Extrait le texte d'une réponse Claude (concatène les blocs texte). */
function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

export async function runSourcePipeline(
  question: string,
  deps: { supabase: SupabaseClient; anthropic: Anthropic }
): Promise<AskResult> {
  const { supabase, anthropic } = deps;

  // 1. Embedding de la question.
  const embedding = await embedQuery(question);

  // 2. Recherche top-K multi-documents.
  const { data: matches, error } = await supabase.rpc("match_source_chunks", {
    query_embedding: embedding,
    match_count: TOP_K,
  });
  if (error) throw new Error(`match_source_chunks: ${error.message}`);

  // 3. Filtre par seuil de similarité.
  const kept = ((matches ?? []) as MatchRow[]).filter(
    (m) => m.similarity >= SIMILARITY_THRESHOLD
  );

  // 4. Rien ne passe le seuil -> « hors base » SANS appeler Claude.
  if (kept.length === 0) {
    return { answer: OUT_OF_BASE_MESSAGE, out_of_base: true, sources: [] };
  }

  // 5. Récupère les colonnes nécessaires au panneau (la fonction SQL ne les
  //    renvoie pas) : texte intégral de la page + offsets du passage cité.
  const ids = kept.map((m) => m.id);
  const { data: fullRows, error: fullErr } = await supabase
    .from("source_chunks")
    .select("id, article_full_text, chunk_start, chunk_end")
    .in("id", ids);
  if (fullErr) throw new Error(`fetch full chunks: ${fullErr.message}`);

  const fullById = new Map(
    (fullRows ?? []).map((r) => [
      r.id as number,
      r as { article_full_text: string | null; chunk_start: number | null; chunk_end: number | null },
    ])
  );

  // 6. Sources numérotées [1..N] dans l'ordre de pertinence.
  const sources: SourceCitation[] = kept.map((m, i) => {
    const extra = fullById.get(m.id);
    return {
      n: i + 1,
      id: m.id,
      document: m.document,
      page: m.page,
      article: m.article,
      chunk_text: m.chunk_text,
      article_full_text: extra?.article_full_text ?? null,
      chunk_start: extra?.chunk_start ?? null,
      chunk_end: extra?.chunk_end ?? null,
      similarity: m.similarity,
    };
  });

  // 7. Synthèse Claude STRICTEMENT à partir des extraits.
  const userMessage = `Question : ${question}\n\nExtraits :\n\n${buildContext(sources)}`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const answer = extractText(message);

  return { answer, out_of_base: false, sources };
}

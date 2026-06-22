/**
 * SYLVE Source — Test de recherche (Phase 1, point de contrôle)
 *
 * Embeddings d'une question -> recherche pgvector (match_source_chunks) ->
 * affiche les passages les plus proches AVEC leur citation exacte
 * (document + page + article), pour vérification manuelle.
 *
 * Lancement : npx tsx scripts/search.ts "ta question ici"
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const EMBED_MODEL = "voyage-3";
const TOP_K = 6;

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

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) {
    console.error('Usage : npx tsx scripts/search.ts "ta question"');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  console.log(`\n🔎 ${query}\n`);
  const embedding = await embedQuery(query);

  const { data, error } = await supabase.rpc("match_source_chunks", {
    query_embedding: embedding,
    match_count: TOP_K,
  });
  if (error) throw error;

  if (!data?.length) {
    console.log("Aucun résultat (la base est-elle ingérée ?).");
    return;
  }

  for (const [i, r] of data.entries()) {
    const cite = `${r.document}, p.${r.page}${r.article ? `, ${r.article}` : ""}`;
    console.log(`── [${i + 1}] similarité ${r.similarity.toFixed(3)} ──`);
    console.log(`   📄 ${cite}`);
    console.log(`   ${r.chunk_text.replace(/\s+/g, " ").slice(0, 320)}…\n`);
  }
}

main().catch((e) => {
  console.error("\n❌", e);
  process.exit(1);
});

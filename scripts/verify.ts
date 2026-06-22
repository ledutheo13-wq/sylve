/**
 * SYLVE Source — Vérification ADVERSARIALE des citations (Phase 3)
 *
 * « 0 hallucination » ne peut pas se déduire du seul rapport d'éval : celui-ci
 * dit QUELLES sources sont citées, pas si chaque affirmation est FIDÈLE à
 * l'extrait qu'elle invoque. Ce script comble ce trou.
 *
 * Pour chaque question :
 *   1. exécute le pipeline de prod (embed -> match -> synthèse) ;
 *   2. si « hors base » -> rien à vérifier (la porte déterministe est sûre) ;
 *   3. sinon, un 2e appel Claude ADVERSARIAL décompose la réponse en
 *      affirmations factuelles et juge, pour chacune, si l'extrait cité [n] la
 *      soutient TEXTUELLEMENT (supported / partial / unsupported), et repère les
 *      affirmations factuelles SANS citation.
 *
 * Le verdict du juge est forcé en sortie structurée (tool_use). Défaut strict :
 * en cas de doute -> "unsupported". Aucune connaissance externe.
 *
 * Lancement : npx tsx scripts/verify.ts
 * Sortie     : scripts/verify-report-<date>.md
 */

import dotenv from "dotenv";
import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { runSourcePipeline, type SourceCitation } from "../lib/source/pipeline";
import { CLAUDE_MODEL } from "../lib/source/prompt";

dotenv.config({ path: ".env.local" });

type Question = { id: string; theme: string; question: string; type: string; sources_attendues: string };

type Assertion = {
  text: string;
  citations: number[];
  verdict: "supported" | "partial" | "unsupported";
  reason: string;
};
type Judgment = { assertions: Assertion[]; uncited_factual_claims: string[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const VERIFIER_SYSTEM = `Tu es un VÉRIFICATEUR ADVERSARIAL de fidélité documentaire. On te donne une RÉPONSE (avec des marqueurs de citation [n]) et les EXTRAITS numérotés qui étaient censés la justifier.

Ta tâche : pour CHAQUE affirmation FACTUELLE de la réponse (un chiffre, une distance, une épaisseur, une obligation, une condition, une référence normative, une définition), vérifier si le ou les extraits cités [n] la soutiennent TEXTUELLEMENT.

Règles STRICTES :
- Tu juges UNIQUEMENT d'après les extraits fournis. AUCUNE connaissance externe : même si une affirmation est vraie « dans la réalité », si l'extrait cité ne la contient pas, c'est "unsupported".
- En cas de doute -> "unsupported".
- "supported" = l'extrait cité contient explicitement l'information. "partial" = en partie (ex. valeur approchée, contexte manquant). "unsupported" = l'extrait cité ne dit pas ça, ou aucune citation pertinente.
- Ignore les phrases NON factuelles (formules de prudence, plan, « ce n'est pas dans ma base », invitations à consulter le local). Ne les compte pas comme affirmations.
- Repère séparément les affirmations FACTUELLES qui ne portent AUCUNE citation [n].

Réponds en appelant l'outil "rapport".`;

const REPORT_TOOL: Anthropic.Tool = {
  name: "rapport",
  description: "Verdict de vérification des affirmations.",
  input_schema: {
    type: "object",
    properties: {
      assertions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string", description: "L'affirmation factuelle, citée mot pour mot ou résumée." },
            citations: { type: "array", items: { type: "integer" }, description: "Numéros [n] portés par l'affirmation." },
            verdict: { type: "string", enum: ["supported", "partial", "unsupported"] },
            reason: { type: "string", description: "Justification courte fondée sur l'extrait." },
          },
          required: ["text", "citations", "verdict", "reason"],
        },
      },
      uncited_factual_claims: {
        type: "array",
        items: { type: "string" },
        description: "Affirmations factuelles SANS aucune citation [n].",
      },
    },
    required: ["assertions", "uncited_factual_claims"],
  },
};

function buildExtracts(sources: SourceCitation[]): string {
  return sources
    .map((s) => `[${s.n}] (${s.document}, p.${s.page})\n${s.chunk_text.replace(/\s+/g, " ").trim()}`)
    .join("\n\n");
}

async function judge(
  anthropic: Anthropic,
  question: string,
  answer: string,
  sources: SourceCitation[]
): Promise<Judgment> {
  const userMessage = `QUESTION : ${question}\n\nRÉPONSE À VÉRIFIER :\n${answer}\n\nEXTRAITS DISPONIBLES :\n\n${buildExtracts(sources)}`;
  const msg = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: VERIFIER_SYSTEM,
    tools: [REPORT_TOOL],
    tool_choice: { type: "tool", name: "rapport" },
    messages: [{ role: "user", content: userMessage }],
  });
  const block = msg.content.find((b) => b.type === "tool_use") as Anthropic.ToolUseBlock | undefined;
  const input = (block?.input ?? {}) as Partial<Judgment>;
  return {
    assertions: Array.isArray(input.assertions) ? input.assertions : [],
    uncited_factual_claims: Array.isArray(input.uncited_factual_claims)
      ? input.uncited_factual_claims
      : [],
  };
}

async function main() {
  const questions: Question[] = JSON.parse(await readFile("scripts/eval-questions.json", "utf8"));

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  type Row = {
    q: Question;
    out_of_base: boolean;
    judgment?: Judgment;
    error?: string;
  };
  const rows: Row[] = [];

  for (const q of questions) {
    process.stdout.write(`▶ ${q.id} — ${q.question.slice(0, 55)}…\n`);
    try {
      const r = await runSourcePipeline(q.question, { supabase, anthropic });
      if (r.out_of_base) {
        rows.push({ q, out_of_base: true });
      } else {
        await sleep(800);
        const j = await judge(anthropic, q.question, r.answer, r.sources);
        rows.push({ q, out_of_base: false, judgment: j });
      }
    } catch (e) {
      rows.push({ q, out_of_base: false, error: e instanceof Error ? e.message : String(e) });
    }
    await sleep(1000);
  }

  // --- Agrégats --------------------------------------------------------------
  let nSupported = 0,
    nPartial = 0,
    nUnsupported = 0,
    nUncited = 0,
    nAssertions = 0;
  const flagged: { id: string; kind: string; text: string; citations: number[]; reason: string }[] = [];

  for (const r of rows) {
    if (!r.judgment) continue;
    for (const a of r.judgment.assertions) {
      nAssertions++;
      if (a.verdict === "supported") nSupported++;
      else if (a.verdict === "partial") {
        nPartial++;
        flagged.push({ id: r.q.id, kind: "PARTIAL", text: a.text, citations: a.citations, reason: a.reason });
      } else {
        nUnsupported++;
        flagged.push({ id: r.q.id, kind: "UNSUPPORTED", text: a.text, citations: a.citations, reason: a.reason });
      }
    }
    for (const c of r.judgment.uncited_factual_claims) {
      nUncited++;
      flagged.push({ id: r.q.id, kind: "SANS CITATION", text: c, citations: [], reason: "" });
    }
  }

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const out = `scripts/verify-report-${stamp}.md`;
  const L: string[] = [];

  L.push(`# SYLVE Source — Vérification adversariale des citations (${stamp})`);
  L.push("");
  L.push(`Juge : \`${CLAUDE_MODEL}\` (sortie structurée forcée, défaut strict = "unsupported").`);
  L.push("");
  L.push("## Synthèse");
  L.push("");
  L.push(`- Affirmations factuelles vérifiées : **${nAssertions}**`);
  L.push(`- ✅ supported : **${nSupported}**`);
  L.push(`- 🟡 partial : **${nPartial}**`);
  L.push(`- 🔴 unsupported (hallucination potentielle) : **${nUnsupported}**`);
  L.push(`- 🔴 affirmations factuelles SANS citation : **${nUncited}**`);
  const clean = nUnsupported === 0 && nUncited === 0;
  L.push("");
  L.push(
    clean
      ? "> ✅ **Aucune affirmation non soutenue ni non citée détectée par le juge.** (à confirmer par l'expert sur les cas 🟡)"
      : "> 🔴 **Des affirmations non soutenues / non citées ont été détectées — à examiner en priorité ci-dessous.**"
  );
  L.push("");

  if (flagged.length) {
    L.push("## ⚠️ À examiner (par priorité)");
    L.push("");
    L.push("| Q | Type | Affirmation | Cit. | Raison du juge |");
    L.push("|---|------|-------------|------|----------------|");
    for (const f of flagged) {
      const t = f.text.replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 140);
      const reason = f.reason.replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 160);
      L.push(`| ${f.id} | ${f.kind} | ${t} | ${f.citations.join(",") || "—"} | ${reason} |`);
    }
    L.push("");
  }

  L.push("---");
  L.push("");
  L.push("## Détail par question");
  L.push("");
  for (const r of rows) {
    L.push(`### ${r.q.id} — ${r.q.theme}`);
    L.push(`_${r.q.question}_`);
    L.push("");
    if (r.error) {
      L.push(`> ⚠️ ERREUR : ${r.error}`);
    } else if (r.out_of_base) {
      L.push("> « hors base » — porte déterministe (aucun appel de synthèse), rien à vérifier.");
    } else if (r.judgment) {
      const j = r.judgment;
      L.push(`Affirmations : ${j.assertions.length} · sans citation : ${j.uncited_factual_claims.length}`);
      L.push("");
      for (const a of j.assertions) {
        const icon = a.verdict === "supported" ? "✅" : a.verdict === "partial" ? "🟡" : "🔴";
        L.push(`- ${icon} [${a.citations.join(",") || "—"}] ${a.text}`);
        if (a.verdict !== "supported") L.push(`    - _${a.reason}_`);
      }
      for (const c of j.uncited_factual_claims) L.push(`- 🔴 [SANS CITATION] ${c}`);
    }
    L.push("");
    L.push("---");
    L.push("");
  }

  await writeFile(out, L.join("\n"), "utf8");
  console.log(`\n✅ Rapport de vérification : ${out}`);
  console.log(
    `   ${nAssertions} affirmations · ${nSupported} ok · ${nPartial} partielles · ${nUnsupported} non soutenues · ${nUncited} sans citation`
  );
}

main().catch((e) => {
  console.error("\n❌", e);
  process.exit(1);
});

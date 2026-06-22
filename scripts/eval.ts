/**
 * SYLVE Source — Harnais d'éval (Phase 2)
 *
 * Rejoue, pour chaque question de scripts/eval-questions.json, EXACTEMENT le
 * même pipeline que la route serveur (lib/source/pipeline.ts) :
 *   embed -> match -> seuil -> synthèse Claude.
 *
 * Le script COLLECTE, il ne JUGE PAS : il produit un rapport markdown avec une
 * ligne par question et trois colonnes VIDES à remplir à la main par l'expert
 * (« Source OK ? » / « Réponse OK ? » / « Hallucination ? »).
 *
 * Lancement : npx tsx scripts/eval.ts
 * Sortie    : scripts/eval-report-<date>.md
 */

import dotenv from "dotenv";
import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { runSourcePipeline } from "../lib/source/pipeline";
import { SIMILARITY_THRESHOLD, TOP_K, CLAUDE_MODEL } from "../lib/source/prompt";

dotenv.config({ path: ".env.local" });

type Question = {
  id: string;
  theme: string;
  question: string;
  type: string;
  sources_attendues: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Sources réellement citées [n] dans la réponse -> "document p.X" dédupliqués. */
function citedSources(
  answer: string,
  sources: { n: number; document: string; page: number }[]
): string[] {
  const ns = new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  const cited = sources
    .filter((s) => ns.has(s.n))
    .map((s) => `${s.document} p.${s.page}`);
  return [...new Set(cited)];
}

async function main() {
  const questions: Question[] = JSON.parse(
    await readFile("scripts/eval-questions.json", "utf8")
  );

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  type Row = {
    q: Question;
    answer: string;
    out_of_base: boolean;
    retrieved: number;
    cited: string[];
    topSim: number | null;
    error?: string;
  };

  const rows: Row[] = [];

  for (const q of questions) {
    process.stdout.write(`▶ ${q.id} — ${q.question.slice(0, 60)}…\n`);
    try {
      const r = await runSourcePipeline(q.question, { supabase, anthropic });
      rows.push({
        q,
        answer: r.answer,
        out_of_base: r.out_of_base,
        retrieved: r.sources.length,
        cited: citedSources(r.answer, r.sources),
        topSim: r.sources.length ? Math.max(...r.sources.map((s) => s.similarity)) : null,
      });
    } catch (e) {
      rows.push({
        q,
        answer: "",
        out_of_base: false,
        retrieved: 0,
        cited: [],
        topSim: null,
        error: e instanceof Error ? e.message : String(e),
      });
    }
    await sleep(1200); // throttle (Voyage tier gratuit + API Claude)
  }

  // --- Rapport markdown ------------------------------------------------------
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  const out = `scripts/eval-report-${stamp}.md`;

  const lines: string[] = [];
  lines.push(`# SYLVE Source — Rapport d'éval (${stamp})`);
  lines.push("");
  lines.push(
    `Modèle : \`${CLAUDE_MODEL}\` · top-K : ${TOP_K} · seuil similarité : ${SIMILARITY_THRESHOLD}`
  );
  lines.push("");
  lines.push(
    "> Base ACTUELLE = 2 docs (Fascicule 35 + UNEP pc1). Attendu Phase 2 : tout ce qui n'est pas couvert par ces 2 docs doit ressortir « hors base », **zéro fabrication**."
  );
  lines.push("");
  lines.push(
    "## Synthèse à remplir (l'expert tranche — le script ne juge pas)"
  );
  lines.push("");
  lines.push(
    "| ID | Thème | Type | Hors base ? | Sim. max | Sources citées | Source OK ? | Réponse OK ? | Hallucination ? |"
  );
  lines.push(
    "|----|-------|------|-------------|----------|----------------|-------------|--------------|-----------------|"
  );
  for (const r of rows) {
    const hb = r.error ? "ERREUR" : r.out_of_base ? "OUI" : "non";
    const sim = r.topSim != null ? r.topSim.toFixed(3) : "—";
    const cited = r.cited.length ? r.cited.join(" ; ") : r.error ? r.error : "—";
    lines.push(
      `| ${r.q.id} | ${r.q.theme} | ${r.q.type} | ${hb} | ${sim} | ${cited} |  |  |  |`
    );
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## Détail des réponses (pour lecture pendant le jugement)");
  lines.push("");
  for (const r of rows) {
    lines.push(`### ${r.q.id} — ${r.q.theme}`);
    lines.push("");
    lines.push(`**Question :** ${r.q.question}`);
    lines.push("");
    lines.push(`**Sources attendues (si doc ingéré) :** ${r.q.sources_attendues}`);
    lines.push("");
    lines.push(
      `**Type :** ${r.q.type} · **out_of_base :** ${r.out_of_base} · **extraits retenus :** ${r.retrieved} · **sim. max :** ${r.topSim != null ? r.topSim.toFixed(3) : "—"}`
    );
    lines.push("");
    if (r.error) {
      lines.push(`> ⚠️ ERREUR : ${r.error}`);
    } else {
      lines.push("**Réponse :**");
      lines.push("");
      lines.push(r.answer || "_(vide)_");
      lines.push("");
      lines.push(`**Sources citées :** ${r.cited.length ? r.cited.join(" ; ") : "aucune"}`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  await writeFile(out, lines.join("\n"), "utf8");
  console.log(`\n✅ Rapport écrit : ${out}`);
}

main().catch((e) => {
  console.error("\n❌", e);
  process.exit(1);
});

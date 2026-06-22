/**
 * SYLVE Source — Script d'ingestion (Phase 3 : corpus complet)
 *
 * Pipeline : PDF -> extraction texte (table-aware) -> nettoyage -> chunks avec
 * métadonnées (document, page, article par famille) -> embeddings Voyage ->
 * insertion pgvector. L'EXTRACTION vit dans scripts/extract.ts (partagée avec
 * scripts/preview.ts).
 *
 * Conserve, pour chaque chunk : le TEXTE INTÉGRAL de la page (article_full_text)
 * et la POSITION du chunk dedans (offsets) -> panneau de sources façon NotebookLM.
 *
 * Lancement :  npx tsx scripts/ingest.ts            (ingère les docs manquants)
 *              npx tsx scripts/ingest.ts --reset     (vide la table d'abord)
 *
 * Reprise : sans --reset, les documents DÉJÀ en base sont sautés (idempotent),
 * pour reprendre après une coupure (rate limit Voyage tier gratuit).
 *
 * Secrets : .env.local (SUPABASE_SERVICE_ROLE_KEY, VOYAGE_API_KEY) — jamais commités.
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { extractPages, cleanPages, chunkDocument } from "./extract";
import { MANIFEST } from "./manifest";

dotenv.config({ path: ".env.local" });

// --- Réglages embeddings -----------------------------------------------------
const EMBED_BATCH = 24; // inputs par appel Voyage (petit lot = compatible tier gratuit)
const EMBED_MODEL = "voyage-3"; // 1024 dimensions (cf. table source_chunks)
const MAX_RETRY = 8; // tentatives sur 429 (rate limit)

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function embedBatch(batch: string[], inputType: "document" | "query"): Promise<number[][]> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: batch, model: EMBED_MODEL, input_type: inputType }),
    });
    if (res.ok) {
      const json = (await res.json()) as { data: { embedding: number[] }[] };
      return json.data.map((d) => d.embedding);
    }
    // 429 = rate limit (tier gratuit) : backoff exponentiel plafonné, puis retry.
    if (res.status === 429 && attempt < MAX_RETRY) {
      const wait = Math.min(60000, 20000 * Math.pow(1.5, attempt));
      process.stdout.write(`\n  ⏳ rate limit, nouvelle tentative dans ${Math.round(wait / 1000)}s…`);
      await sleep(wait);
      continue;
    }
    throw new Error(`Voyage ${res.status}: ${await res.text()}`);
  }
}

async function embed(texts: string[], inputType: "document" | "query"): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += EMBED_BATCH) {
    const batch = texts.slice(i, i + EMBED_BATCH);
    out.push(...(await embedBatch(batch, inputType)));
    process.stdout.write(`  embeddings ${Math.min(i + EMBED_BATCH, texts.length)}/${texts.length}\r`);
    await sleep(1000); // throttle léger entre lots
  }
  process.stdout.write("\n");
  return out;
}

// --- Main --------------------------------------------------------------------
async function main() {
  const reset = process.argv.includes("--reset");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  if (reset) {
    console.log("Reset : vidage de source_chunks…");
    const { error } = await supabase.from("source_chunks").delete().neq("id", 0);
    if (error) throw error;
  }

  // Reprise idempotente : on saute les documents déjà présents en base.
  const { data: existingRows } = await supabase
    .from("source_chunks")
    .select("document");
  const existing = new Set((existingRows ?? []).map((r) => r.document as string));

  for (const doc of MANIFEST) {
    if (existing.has(doc.document)) {
      console.log(`\n⏭  déjà en base : ${doc.document}`);
      continue;
    }
    console.log(`\n▶ ${doc.document}`);
    const rawPages = await extractPages(doc.path);
    const pages = cleanPages(rawPages);
    const chunks = chunkDocument(doc.document, pages, doc.family);
    console.log(`  ${pages.length} pages -> ${chunks.length} chunks`);

    const vectors = await embed(chunks.map((c) => c.chunk_text), "document");

    const rows = chunks.map((c, i) => ({ ...c, echelle: "national", embedding: vectors[i] }));
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await supabase.from("source_chunks").insert(rows.slice(i, i + 200));
      if (error) throw error;
    }
    console.log(`  ✓ ${rows.length} chunks insérés`);
  }

  const { count } = await supabase
    .from("source_chunks")
    .select("*", { count: "exact", head: true });
  console.log(`\n✅ Terminé. Total en base : ${count} chunks.`);
}

main().catch((e) => {
  console.error("\n❌", e);
  process.exit(1);
});

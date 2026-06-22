/**
 * SYLVE Source — Estimation & contrôle d'extraction (Phase 3, avant gros run)
 *
 * Extrait TOUT le manifeste (sans embeddings ni écriture en base) pour :
 *  - compter pages/chunks par doc et le TOTAL (→ estimation temps d'embedding),
 *  - repérer tout doc à 0 chunk (PDF scanné/illisible) AVANT le run complet.
 *
 * Lancement : npx tsx scripts/count.ts
 */

import { extractPages, cleanPages, chunkDocument } from "./extract";
import { MANIFEST } from "./manifest";

async function main() {
  let totalChunks = 0;
  let totalPages = 0;
  const empty: string[] = [];

  console.log(`\nContrôle d'extraction — ${MANIFEST.length} documents\n`);
  for (const doc of MANIFEST) {
    try {
      const pages = cleanPages(await extractPages(doc.path));
      const chunks = chunkDocument(doc.document, pages, doc.family);
      const withArticle = new Set(
        chunks.filter((c) => c.article).map((c) => c.page)
      ).size;
      totalChunks += chunks.length;
      totalPages += pages.length;
      if (chunks.length === 0) empty.push(doc.document);
      console.log(
        `  ${chunks.length === 0 ? "⚠️ " : "  "}${String(chunks.length).padStart(4)} chunks · ${String(pages.length).padStart(3)} p · art ${withArticle}/${pages.length}  ${doc.document}`
      );
    } catch (e) {
      empty.push(`${doc.document} (ERREUR)`);
      console.log(`  ❌ ERREUR  ${doc.document} : ${e instanceof Error ? e.message : e}`);
    }
  }

  // Estimation embeddings : EMBED_BATCH=24, ~1s throttle entre lots (hors 429).
  const batches = Math.ceil(totalChunks / 24);
  const minMinutes = Math.round((batches * 1.8) / 60);

  console.log(`\n──────────────────────────────────────`);
  console.log(`TOTAL : ${totalChunks} chunks · ${totalPages} pages · ${batches} lots Voyage`);
  console.log(`Temps embedding estimé (sans rate-limit) : ~${minMinutes} min`);
  console.log(`(avec 429 du tier gratuit : potentiellement bien plus ; le run reprend où il s'arrête)`);
  if (empty.length) {
    console.log(`\n⚠️  ${empty.length} doc(s) à 0 chunk / erreur :`);
    empty.forEach((d) => console.log(`   - ${d}`));
  } else {
    console.log(`\n✅ Aucun doc vide : les ${MANIFEST.length} docs extraient du texte.`);
  }
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});

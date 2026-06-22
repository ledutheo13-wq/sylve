/**
 * SYLVE Source — Script d'ingestion (Phase 1, POC perso, offline)
 *
 * Pipeline : PDF -> extraction texte par page -> nettoyage (en-têtes/pieds/
 * filigranes répétés) -> découpage en chunks avec métadonnées de source
 * (document, page, article/§) -> embeddings Voyage -> insertion pgvector.
 *
 * Conserve, pour chaque chunk : le TEXTE INTÉGRAL de la page (article_full_text)
 * et la POSITION du chunk dedans (offsets) -> panneau de sources façon NotebookLM.
 *
 * Lancement :  npx tsx scripts/ingest.ts            (ingère le manifeste)
 *              npx tsx scripts/ingest.ts --reset     (vide la table d'abord)
 *
 * Stack : Node + tsx, lecture des PDF directement depuis OneDrive (pas de copie).
 * Secrets : .env.local (SUPABASE_SERVICE_ROLE_KEY, VOYAGE_API_KEY) — jamais commités.
 */

import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

dotenv.config({ path: ".env.local" });

// --- Corpus de test (Phase 1 = 2 documents) ----------------------------------
const BIB =
  "C:/Users/Tledu/OneDrive/Projet-pro/02_SYLVE/04_Bibliotheque-reglementaire";

const MANIFEST: { path: string; document: string }[] = [
  {
    path: `${BIB}/03_FASCICULES/fascicule_ndeg35_amenagements-paysagers.pdf`,
    document: "Fascicule 35 — Aménagements paysagers",
  },
  {
    path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/mise-en-oeuvre-plantes/pc1-ro-travaux-des-sols-supports-de-paysage.pdf`,
    document: "Règle UNEP P.C.1 — Travaux des sols supports de paysage",
  },
];

// --- Réglages chunking -------------------------------------------------------
const CHUNK_SIZE = 1200; // caractères par chunk
const CHUNK_OVERLAP = 150; // recouvrement entre chunks
const EMBED_BATCH = 24; // inputs par appel Voyage (petit lot = compatible tier gratuit)
const EMBED_MODEL = "voyage-3"; // 1024 dimensions (cf. table source_chunks)
const MAX_RETRY = 6; // tentatives sur 429 (rate limit)

// Détection d'un en-tête d'article/section (best-effort, FR réglementaire).
const ARTICLE_RE =
  /^(?:ARTICLE\s+[\dIVX.]+|Article\s+[\dIVX.]+|CHAPITRE\s+[\dIVX]+|§\s*[\d.]+|\d+(?:\.\d+){1,3}\s+[A-ZÀ-Ÿ])/;

type Chunk = {
  document: string;
  page: number;
  article: string | null;
  chunk_text: string;
  article_full_text: string;
  chunk_start: number;
  chunk_end: number;
};

// --- Extraction texte par page (gère les mises en page 1 ou 2 colonnes) ------
type Item = { str: string; x: number; y: number };

// Reconstruit le texte d'un groupe d'items : lignes par position Y, puis
// tri intra-ligne par position X (ordre de lecture correct).
function groupToText(group: Item[]): string {
  const lines = new Map<number, Item[]>();
  for (const it of group) {
    const y = Math.round(it.y);
    if (!lines.has(y)) lines.set(y, []);
    lines.get(y)!.push(it);
  }
  return [...lines.entries()]
    .sort((a, b) => b[0] - a[0]) // haut -> bas
    .map(([, parts]) =>
      parts
        .sort((a, b) => a.x - b.x) // gauche -> droite
        .map((q) => q.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .join("\n");
}

async function extractPages(path: string): Promise<string[]> {
  const data = new Uint8Array(await readFile(path));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const width = page.getViewport({ scale: 1 }).width;
    const content = await page.getTextContent();

    const items: Item[] = (content.items as { str: string; transform: number[] }[])
      .filter((it) => it.str && it.str.trim())
      .map((it) => ({ str: it.str, x: it.transform[4], y: it.transform[5] }));

    // Détection 2 colonnes : assez d'items des deux côtés du milieu de page.
    const mid = width / 2;
    const left = items.filter((it) => it.x < mid);
    const right = items.filter((it) => it.x >= mid);
    const twoCol =
      items.length > 30 &&
      left.length > items.length * 0.25 &&
      right.length > items.length * 0.25;

    // 2 colonnes : colonne gauche entière, PUIS colonne droite.
    pages.push(twoCol ? `${groupToText(left)}\n${groupToText(right)}` : groupToText(items));
  }
  return pages;
}

// --- Nettoyage : retire les lignes répétées (en-têtes/pieds/filigranes) -------
function cleanPages(pages: string[]): string[] {
  const freq = new Map<string, number>();
  for (const page of pages) {
    for (const line of new Set(page.split("\n"))) {
      const norm = line.trim().toLowerCase();
      if (norm.length < 60) freq.set(norm, (freq.get(norm) ?? 0) + 1);
    }
  }
  const threshold = Math.max(3, Math.floor(pages.length * 0.4));
  const noise = new Set(
    [...freq.entries()].filter(([, n]) => n >= threshold).map(([l]) => l)
  );
  const watermark =
    /batip[ée]dia|reproduction interdite|©|tous droits r[ée]serv[ée]s|afnor|cstb|page\s+\d+\s*\/?\s*\d*/i;

  // Lignes de sommaire (pointillés + n° de page) : « B.9. Jeunes plants ..... 22 »
  const tocLine = /\.{4,}\s*\d{1,3}\s*$/;

  return pages.map((page) =>
    page
      .split("\n")
      .filter((line) => {
        const norm = line.trim().toLowerCase();
        if (!norm) return false;
        if (noise.has(norm)) return false;
        if (tocLine.test(line)) return false;
        if (watermark.test(line) && line.trim().length < 80) return false;
        return true;
      })
      .join("\n")
  );
}

// --- Découpage en chunks avec métadonnées ------------------------------------
function chunkDocument(document: string, pages: string[]): Chunk[] {
  const chunks: Chunk[] = [];

  pages.forEach((pageText, idx) => {
    const pageNum = idx + 1;

    // Article = en-tête détecté SUR CETTE PAGE (pas de report d'une page à
    // l'autre, pour éviter d'afficher un article faux). Sinon null.
    let currentArticle: string | null = null;
    for (const line of pageText.split("\n")) {
      const t = line.trim();
      if (t.length <= 80 && !/\.{4,}/.test(t) && ARTICLE_RE.test(t)) {
        currentArticle = t.slice(0, 100);
        break; // premier en-tête de la page
      }
    }

    if (pageText.trim().length === 0) return;

    // Fenêtre glissante sur le texte de la page (= article_full_text du chunk).
    let start = 0;
    while (start < pageText.length) {
      const end = Math.min(start + CHUNK_SIZE, pageText.length);
      const slice = pageText.slice(start, end).trim();
      if (slice.length > 40) {
        chunks.push({
          document,
          page: pageNum,
          article: currentArticle,
          chunk_text: slice,
          article_full_text: pageText,
          chunk_start: start,
          chunk_end: end,
        });
      }
      if (end >= pageText.length) break;
      start = end - CHUNK_OVERLAP;
    }
  });

  return chunks;
}

// --- Embeddings Voyage (REST) ------------------------------------------------
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
    // 429 = rate limit (tier gratuit) : on attend et on réessaie.
    if (res.status === 429 && attempt < MAX_RETRY) {
      const wait = 22000 + attempt * 5000;
      process.stdout.write(`\n  ⏳ rate limit, nouvelle tentative dans ${wait / 1000}s…`);
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

  for (const doc of MANIFEST) {
    console.log(`\n▶ ${doc.document}`);
    const rawPages = await extractPages(doc.path);
    const pages = cleanPages(rawPages);
    const chunks = chunkDocument(doc.document, pages);
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

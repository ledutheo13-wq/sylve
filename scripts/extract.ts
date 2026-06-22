/**
 * SYLVE Source — Extraction PDF (Phase 3)
 *
 * Module réutilisé par scripts/ingest.ts (gros run) ET scripts/preview.ts
 * (échantillons sans embeddings). Sépare l'EXTRACTION (ici) de l'EMBEDDING +
 * INSERT (ingest.ts), pour valider la qualité du parsing avant le run complet.
 *
 * Améliorations Phase 3 :
 *  - TABLEAUX : lignes reconstruites avec tolérance verticale + séparateur de
 *    colonne « | » inséré quand un grand espace horizontal sépare deux cellules
 *    (sinon « vrac » illisible). But : un chunk de tableau reste requêtable.
 *  - ARTICLE : détection PAR FAMILLE de document (fascicule, UNEP, NF, DTU,
 *    CCAG/CCP, arrêté, CSTB). Si l'article n'est pas sûr -> NULL (jamais inventé) ;
 *    document + page restent la citation fiable par défaut.
 */

import { readFile } from "node:fs/promises";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

export const CHUNK_SIZE = 1200; // caractères par chunk
export const CHUNK_OVERLAP = 150; // recouvrement entre chunks

export type Family =
  | "fascicule"
  | "unep"
  | "nf"
  | "dtu"
  | "ccag-ccp"
  | "arrete"
  | "cstb";

export type Chunk = {
  document: string;
  page: number;
  article: string | null;
  chunk_text: string;
  article_full_text: string;
  chunk_start: number;
  chunk_end: number;
};

// --- Extraction texte par page (table-aware) ---------------------------------
type Item = { str: string; x: number; y: number; w: number; h: number };

const Y_TOL = 3; // px : items à moins de 3px en Y = même ligne (cellules)

/**
 * Reconstruit le texte d'un groupe d'items : regroupe en lignes par position Y
 * (avec tolérance), trie chaque ligne par X, et insère « | » quand l'espace
 * horizontal entre deux cellules dépasse un seuil (= séparation de colonnes).
 */
function groupToText(group: Item[]): string {
  const sorted = [...group].sort((a, b) => b.y - a.y); // haut -> bas

  const rows: Item[][] = [];
  for (const it of sorted) {
    const last = rows[rows.length - 1];
    if (last && Math.abs(last[0].y - it.y) <= Y_TOL) last.push(it);
    else rows.push([it]);
  }

  return rows
    .map((row) => {
      const parts = row.sort((a, b) => a.x - b.x);
      let line = "";
      for (let i = 0; i < parts.length; i++) {
        const cur = parts[i];
        if (i > 0) {
          const prev = parts[i - 1];
          const gap = cur.x - (prev.x + prev.w);
          // Seuil de colonne : ~1.4x la hauteur de police (un large blanc).
          const thr = Math.max(8, 1.4 * (cur.h || prev.h || 8));
          line += gap > thr ? " | " : " ";
        }
        line += cur.str;
      }
      return line.replace(/[ \t]{2,}/g, " ").trim();
    })
    .filter(Boolean)
    .join("\n");
}

export async function extractPages(path: string): Promise<string[]> {
  const data = new Uint8Array(await readFile(path));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;

  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const width = page.getViewport({ scale: 1 }).width;
    const content = await page.getTextContent();

    const items: Item[] = (
      content.items as { str: string; transform: number[]; width: number; height: number }[]
    )
      .filter((it) => it.str && it.str.trim())
      .map((it) => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
        w: it.width,
        h: it.height,
      }));

    // Détection 2 colonnes : assez d'items des deux côtés du milieu de page.
    const mid = width / 2;
    const left = items.filter((it) => it.x < mid);
    const right = items.filter((it) => it.x >= mid);
    const twoCol =
      items.length > 30 &&
      left.length > items.length * 0.25 &&
      right.length > items.length * 0.25;

    pages.push(twoCol ? `${groupToText(left)}\n${groupToText(right)}` : groupToText(items));
  }
  return pages;
}

// --- Nettoyage : retire les lignes répétées (en-têtes/pieds/filigranes) -------
export function cleanPages(pages: string[]): string[] {
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

  // Boilerplate Batipédia/MUGO (tatouage d'achat) : à retirer quelle que soit
  // la longueur de ligne (sinon pollue le 1er chunk des NF/DTU/CCP/CSTB).
  const boilerplate =
    /usage exclusif et non collectif|mugo paysage|t[ée]l[ée]charg[ée] le\s*:|prot[ée]g[ée] par le droit d.auteur|constitue une contrefa[çc]on|n[°o]\s*client\s*:|soci[ée]t[ée]\s*:/i;

  // Lignes de sommaire (pointillés + n° de page) : « B.9. Jeunes plants ..... 22 »
  const tocLine = /\.{4,}\s*\d{1,3}\s*$/;

  return pages.map((page) =>
    page
      .split("\n")
      .filter((line) => {
        const norm = line.trim().toLowerCase();
        if (!norm) return false;
        if (noise.has(norm)) return false;
        if (boilerplate.test(line)) return false;
        if (tocLine.test(line)) return false;
        if (watermark.test(line) && line.trim().length < 80) return false;
        return true;
      })
      .join("\n")
  );
}

// --- Détection d'article PAR FAMILLE -----------------------------------------
// Heuristiques best-effort. En cas de doute -> null (jamais d'invention).
const ARTICLE_PATTERNS: Record<Family, RegExp[]> = {
  // Fascicules CCTG : « Article 5 », « ARTICLE II.3 », sections « 3.2.1 Titre ».
  fascicule: [
    /^(?:ARTICLE|Article)\s+[\dIVX]+(?:\.\d+)*/,
    /^\d+(?:\.\d+){1,3}\s+\p{Lu}/u,
  ],
  // UNEP : codes « P.C.2 », « C.C.7 », « B.C.4 », « P.E.1 » ; sections numérotées.
  unep: [
    /^[PCB]\.[CE]\.\d+\b/i,
    /^\d+(?:\.\d+){1,3}\s+\p{Lu}/u,
  ],
  // Normes NF : sections numérotées « 5.2.1 Titre » ; parfois « Article N ».
  nf: [
    /^\d+(?:\.\d+){0,3}\s+\p{Lu}/u,
    /^(?:Article|ARTICLE)\s+\d+/,
  ],
  // DTU : parties/clauses numérotées ; « Article N ».
  dtu: [
    /^\d+(?:\.\d+){0,3}\s+\p{Lu}/u,
    /^(?:ARTICLE|Article)\s+[\d.]+/,
  ],
  // CCAG / Code commande publique : « Article 12 », « Art. 3 », refs « L. 2431-1 »
  // ou « L2431-1 » (sans espace ni point, format Légifrance/Batipédia).
  "ccag-ccp": [
    /^(?:ARTICLE|Article|Art\.)\s+[LR]?\.?\s?\d/,
    /^[LR]\.?\s?\d{3,}-\d+/,
  ],
  // Arrêté : « Article 1er », « Art. 2 ».
  arrete: [/^(?:Article|Art\.)\s+\d+(?:er)?/, /^Article\s+[\dA-Z]/],
  // Guide CSTB : chapitres / sections numérotées.
  cstb: [
    /^(?:Chapitre|CHAPITRE)\s+[\dIVX]+/,
    /^\d+(?:\.\d+){1,3}\s+\p{Lu}/u,
  ],
};

/** Premier en-tête d'article détecté sur la page, selon la famille. Sinon null. */
export function detectArticle(pageText: string, family: Family): string | null {
  const patterns = ARTICLE_PATTERNS[family];
  for (const raw of pageText.split("\n")) {
    const t = raw.trim();
    if (t.length === 0 || t.length > 90) continue;
    if (/\.{4,}/.test(t)) continue; // ligne de sommaire
    if (patterns.some((re) => re.test(t))) return t.slice(0, 100);
  }
  return null;
}

// --- Découpage en chunks avec métadonnées ------------------------------------
export function chunkDocument(
  document: string,
  pages: string[],
  family: Family
): Chunk[] {
  const chunks: Chunk[] = [];

  pages.forEach((pageText, idx) => {
    const pageNum = idx + 1;
    if (pageText.trim().length === 0) return;

    const currentArticle = detectArticle(pageText, family);

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

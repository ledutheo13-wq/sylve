/**
 * SYLVE Source — Aperçu d'extraction (Phase 3, étape 1)
 *
 * Valide la QUALITÉ du parsing AVANT le gros run : pour 1 document par famille,
 * extrait + nettoie + chunk (SANS embeddings ni écriture en base) et écrit un
 * rapport markdown : nb pages/chunks, articles détectés, et un exemple de page
 * « tableau » linéarisée (colonnes séparées par « | »).
 *
 * Lancement : npx tsx scripts/preview.ts
 * Sortie     : scripts/extract-preview.md
 */

import { writeFile } from "node:fs/promises";
import { extractPages, cleanPages, chunkDocument, type Family } from "./extract";

const BIB =
  "C:/Users/Tledu/OneDrive/Projet-pro/02_SYLVE/04_Bibliotheque-reglementaire";

// 1 document REPRÉSENTATIF par famille.
const SAMPLES: { document: string; path: string; family: Family }[] = [
  {
    family: "fascicule",
    document: "Fascicule 35 (CCTG) — Aménagements paysagers",
    path: `${BIB}/03_FASCICULES/fascicule_ndeg35_amenagements-paysagers.pdf`,
  },
  {
    family: "unep",
    document: "Règle pro UNEP P.C.2 — Plantation d'arbres et arbustes",
    path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/mise-en-oeuvre-plantes/pc2-r0-Travaux-de-plantation-arbres-arbustes.pdf`,
  },
  {
    family: "nf",
    document: "NF P98-332 — Distances entre réseaux enterrés et végétaux",
    path: `${BIB}/01_NORMES-NF/NF_P98-332_Chaussees-et-dependances-distances-reseaux-enterres-entre-voisinage-vegetaux.pdf`,
  },
  {
    family: "dtu",
    document: "NF DTU 43.1 — Étanchéité des toitures-terrasses (guide de conception)",
    path: `${BIB}/02_DTU/NF_DTU_43-1_P3_Etancheite-toitures-terrasses-et-inclinees-Plaine-Guide-de-conception.pdf`,
  },
  {
    family: "ccag-ccp",
    document: "Code de la commande publique — Maîtrise d'œuvre privée",
    path: `${BIB}/04_REGLEMENTATION/CODE-COMMANDE-PUBLIQUE/2_Marches_publics/CCP_PartLegReg_T3_C1C2_Maitrise-oeuvre-privee.pdf`,
  },
  {
    family: "cstb",
    document: "CSTB — L'arbre en milieu urbain (guide pratique)",
    path: `${BIB}/07_REGLES-PROFESSIONNELLES/CSTB-CSFE/CSTB-arbre-en-milieu-urbain-Guide-pratique.pdf`,
  },
  {
    family: "arrete",
    document: "Arrêté du 15 janvier 2007 — Accessibilité de la voirie",
    path: `${BIB}/04_REGLEMENTATION/ACCESSIBILITE/arrete_15-janvier-2007_accessibilite-voirie-espaces-publics.pdf`,
  },
];

/** Page avec le plus de séparateurs « | » = meilleure candidate « tableau ». */
function bestTablePage(pages: string[]): { page: number; text: string } | null {
  let best = { page: -1, pipes: 0, text: "" };
  pages.forEach((t, i) => {
    const pipes = (t.match(/\|/g) ?? []).length;
    if (pipes > best.pipes) best = { page: i + 1, pipes, text: t };
  });
  return best.pipes >= 4 ? { page: best.page, text: best.text } : null;
}

async function main() {
  const out: string[] = [];
  out.push("# SYLVE Source — Aperçu d'extraction (Phase 3, étape 1)");
  out.push("");
  out.push(
    "Extraction améliorée (tables + détection d'article par famille) sur 1 doc/famille. **Sans embeddings ni écriture en base.** À valider avant le gros run des 35."
  );
  out.push("");

  for (const s of SAMPLES) {
    out.push(`## ${s.document}`);
    out.push(`_famille : \`${s.family}\`_`);
    out.push("");
    try {
      const raw = await extractPages(s.path);
      const pages = cleanPages(raw);
      const chunks = chunkDocument(s.document, pages, s.family);

      const articles = [
        ...new Map(
          chunks
            .filter((c) => c.article)
            .map((c) => [`${c.page}|${c.article}`, c])
        ).values(),
      ];
      const pagesWithArticle = new Set(
        chunks.filter((c) => c.article).map((c) => c.page)
      ).size;

      out.push(
        `- **${pages.length} pages → ${chunks.length} chunks** · articles détectés sur **${pagesWithArticle}/${pages.length}** pages`
      );
      out.push("");

      // Articles détectés (échantillon des 12 premiers)
      out.push("**Articles détectés (échantillon) :**");
      out.push("");
      if (articles.length === 0) {
        out.push("> _aucun — citation = document + page (NULL assumé)_");
      } else {
        for (const c of articles.slice(0, 12)) {
          out.push(`- p.${c.page} → \`${c.article}\``);
        }
        if (articles.length > 12) out.push(`- … (+${articles.length - 12})`);
      }
      out.push("");

      // Exemple de tableau linéarisé
      const tbl = bestTablePage(pages);
      out.push("**Exemple de page « tableau » linéarisée :**");
      out.push("");
      if (tbl) {
        const excerpt = tbl.text
          .split("\n")
          .filter((l) => l.includes("|"))
          .slice(0, 14)
          .join("\n");
        out.push(`_(page ${tbl.page})_`);
        out.push("");
        out.push("```");
        out.push(excerpt);
        out.push("```");
      } else {
        out.push("> _aucune page nettement tabulaire détectée dans ce doc_");
      }
      out.push("");

      // Échantillon de texte courant (1er chunk significatif)
      const sample = chunks.find((c) => c.chunk_text.length > 300);
      out.push("**Échantillon de texte courant (début d'un chunk) :**");
      out.push("");
      out.push("```");
      out.push((sample?.chunk_text ?? chunks[0]?.chunk_text ?? "").slice(0, 500));
      out.push("```");
    } catch (e) {
      out.push(`> ⚠️ ERREUR : ${e instanceof Error ? e.message : String(e)}`);
    }
    out.push("");
    out.push("---");
    out.push("");
  }

  await writeFile("scripts/extract-preview.md", out.join("\n"), "utf8");
  console.log("✅ Aperçu écrit : scripts/extract-preview.md");
}

main().catch((e) => {
  console.error("❌", e);
  process.exit(1);
});

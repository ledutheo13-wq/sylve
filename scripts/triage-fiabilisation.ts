/** Triage de fiabilisation — isole les valeurs SUSPECTES parmi les champs « compilé — à vérifier ».
 *  LECTURE SEULE : ne modifie aucune donnée.   npx tsx scripts/triage-fiabilisation.ts */
import v2raw from "@/lib/plantes-v2.json";
import sesameRaw from "@/lib/base-sesame.json";
import provA4 from "@/lib/plantes-v1-provenance-A4.json";
import provJ2 from "@/lib/plantes-v1-provenance-A4-JEU2.json";
import type { Plante } from "@/types/plantes";
import { writeFileSync } from "fs";

const v2 = v2raw as Plante[];
const sesame = (sesameRaw as { especes: Record<string, unknown>[] }).especes;
const A4 = provA4 as Record<string, { ecologie: string; horticole: string }>;
const J2 = provJ2 as Record<string, Record<string, string>>;
const TOVERIFY = "compilé — à vérifier";

const byId = new Map(v2.map((p) => [p.id, p]));
const norm = (s: string) => {
  const t = s.replace(/'[^']*'/g, "").replace(/×/g, "x").replace(/\s+/g, " ").trim().toLowerCase().split(" ");
  return t.length >= 3 && t[1] === "x" ? t.slice(0, 3).join(" ") : t.slice(0, 2).join(" ");
};
const sesameBy = new Map(sesame.map((e) => [String(e.cle_jointure), e]));

// ═══ PHASE 1 — INVENTAIRE ═══
type Item = { id: string; nom: string; champ: string; valeur: unknown; provenance: string };
const inv: Item[] = [];
const HORTI = ["rusticite_usda", "rusticite_celsius", "hauteur_min_cm", "hauteur_max_cm"];
for (const [id, pv] of Object.entries(A4)) {
  const p = byId.get(id); if (!p) continue;
  if (pv.horticole === TOVERIFY) for (const c of HORTI) inv.push({ id, nom: p.nom_latin, champ: c, valeur: (p as never)[c], provenance: "A4/horticole" });
  if (pv.ecologie === TOVERIFY) for (const c of ["exposition", "besoins_hydriques", "ph_sol", "humidite_sol"]) inv.push({ id, nom: p.nom_latin, champ: c, valeur: (p as never)[c], provenance: "A4/ecologie" });
}
for (const [id, champs] of Object.entries(J2)) {
  const p = byId.get(id); if (!p) continue;
  for (const [c, prov] of Object.entries(champs)) if (prov.startsWith(TOVERIFY)) inv.push({ id, nom: p.nom_latin, champ: c, valeur: (p as never)[c], provenance: "JEU2" });
}
const cat = (c: string) => c.startsWith("rusticite") ? "rusticité" : c.startsWith("hauteur") ? "hauteurs" : "écologie";
const counts: Record<string, number> = {};
for (const i of inv) counts[cat(i.champ)] = (counts[cat(i.champ)] || 0) + 1;
console.log("═══ PHASE 1 — INVENTAIRE « à vérifier » ═══");
console.log(`  total champs : ${inv.length}`);
for (const [k, n] of Object.entries(counts)) console.log(`    ${k.padEnd(10)} ${n}`);
const espRust = new Set(inv.filter((i) => i.champ.startsWith("rusticite")).map((i) => i.id));
const espHaut = new Set(inv.filter((i) => i.champ.startsWith("hauteur")).map((i) => i.id));
console.log(`  espèces concernées : rusticité ${espRust.size} · hauteurs ${espHaut.size}`);

// ═══ PHASE 2 — CONTRÔLES DE PLAUSIBILITÉ ═══
const ZONE_C: Record<number, number> = { 2: -45, 3: -40, 4: -34, 5: -29, 6: -23, 7: -18, 8: -12, 9: -7, 10: -1, 11: 4 };
// Bandes élargies après triage du 23/07/2026 (suppression du bruit — arbitrage fondateur).
// NB : la règle « contradiction rusticité ↔ resistance_gel SESAME » a été SUPPRIMÉE :
// resistance_gel est relatif au contexte méditerranéen (BdR), pas un équivalent USDA absolu.
// aquatique & grimpante : volontairement SANS bande de hauteur (port très variable).
// arbuste : bande NON élargie — les grands arbustes sont gérés par le tag « validé ».
const BAND: Record<string, [number, number]> = {
  arbre_grand: [1500, 6000], arbre_moyen: [800, 2000], arbre_petit: [100, 1000],
  arbuste: [50, 600], vivace: [10, 250], "graminée": [10, 400],
  "couvre-sol": [2, 80], bulbe: [5, 250], "fougère": [10, 200],
};
// Tags de confiance : une entrée taguée « validé » ou « N/A » n'est plus re-flaguée.
const tagsFor = (id: string): string[] => [
  ...Object.values((A4 as Record<string, Record<string, string>>)[id] || {}),
  ...Object.values(J2[id] || {}),
];
const isValide = (id: string) => tagsFor(id).some((t) => /validé/i.test(t));
const isNA = (id: string) => tagsFor(id).some((t) => /N\/A/i.test(t));
type Susp = { nom: string; id: string; champ: string; valeur: unknown; raison: string; ref?: string };
const suspRust: Susp[] = [], suspHaut: Susp[] = [];
const zoneNum = (z: string) => { const m = /^Z(\d+)/.exec(z || ""); return m ? parseInt(m[1]) : null; };

for (const id of espRust) {
  if (isNA(id) || isValide(id)) continue;           // tag de confiance → pas de re-flag
  const p = byId.get(id)!; const z = zoneNum(p.rusticite_usda); const c = p.rusticite_celsius;
  const add = (raison: string, ref?: string) => suspRust.push({ nom: p.nom_latin, id, champ: "rusticite", valeur: `${p.rusticite_usda}/${c}°C`, raison, ref });
  if (!p.rusticite_usda || c == null) { add("valeur vide"); continue; }
  if (z == null) { add("zone illisible"); continue; }
  if (z < 2 || z > 11) add(`hors bande Z2–Z11 (Z${z})`);
  const exp = ZONE_C[z];
  if (exp != null && Math.abs(exp - c) > 3) add(`°C incohérent avec la zone (Z${z} ⇒ ${exp}°C, trouvé ${c}°C)`);
  // cultivar vs espèce-type
  if (/'/.test(p.nom_latin)) {
    const type = v2.find((x) => x.id !== p.id && !/'/.test(x.nom_latin) && norm(x.nom_latin) === norm(p.nom_latin));
    if (type && type.rusticite_celsius != null && Math.abs(type.rusticite_celsius - c) > 5)
      add(`écart >1 zone avec l'espèce-type (${type.nom_latin} ${type.rusticite_celsius}°C)`, `${type.nom_latin}: ${type.rusticite_usda}`);
  }
}
const SANS_BANDE = new Set(["aquatique", "grimpante"]);   // port trop variable
for (const id of espHaut) {
  if (isValide(id)) continue;                        // ex. « arbuste grand développement — hauteur validée »
  const p = byId.get(id)!; const mn = p.hauteur_min_cm, mx = p.hauteur_max_cm;
  const add = (raison: string, ref?: string) => suspHaut.push({ nom: p.nom_latin, id, champ: "hauteur", valeur: `${mn}–${mx} cm`, raison, ref });
  if (mn == null && mx == null) {
    // hauteur non renseignée : légitime pour les aquatiques flottantes/submergées
    if (!SANS_BANDE.has(p.strate)) add("valeur vide");
    continue;
  }
  if (mn == null || mx == null) { add("hauteur partielle (min ou max manquant)"); continue; }
  if (SANS_BANDE.has(p.strate)) continue;
  if (mn >= mx) add(`min ≥ max (${mn} ≥ ${mx})`);
  if (mx < 5 || mx > 6000) add(`magnitude suspecte (confusion cm/m ?) max=${mx}`);
  const b = BAND[p.strate];
  if (b && (mx < b[0] || mx > b[1])) add(`hors bande ${p.strate} (${b[0]}–${b[1]} cm), max=${mx}`);
  const s = sesameBy.get(norm(p.nom_latin));
  if (s && typeof s.hauteur_max === "number") {
    const ref = (s.hauteur_max as number) * 100;
    if (ref > 0 && (mx > ref * 2 || mx < ref / 2)) add(`écart >×2 avec SESAME (${ref} cm)`, `SESAME: ${ref} cm`);
  }
}

// ═══ PHASE 3 — RAPPORT ═══
const uniq = (a: Susp[]) => new Set(a.map((s) => s.id)).size;
console.log("\n═══ PHASE 3 — TRIAGE ═══");
console.log(`  RUSTICITÉ : ${suspRust.length} flags sur ${uniq(suspRust)} espèces (/${espRust.size}) → plausibles ${espRust.size - uniq(suspRust)}`);
const rr: Record<string, number> = {}; for (const s of suspRust) { const k = s.raison.split("(")[0].trim(); rr[k] = (rr[k] || 0) + 1; }
for (const [k, n] of Object.entries(rr).sort((a, b) => b[1] - a[1])) console.log(`     ${String(n).padStart(4)}  ${k}`);
console.log(`  HAUTEURS  : ${suspHaut.length} flags sur ${uniq(suspHaut)} espèces (/${espHaut.size}) → plausibles ${espHaut.size - uniq(suspHaut)}`);
const rh: Record<string, number> = {}; for (const s of suspHaut) { const k = s.raison.split("(")[0].trim(); rh[k] = (rh[k] || 0) + 1; }
for (const [k, n] of Object.entries(rh).sort((a, b) => b[1] - a[1])) console.log(`     ${String(n).padStart(4)}  ${k}`);

console.log("\n── Échantillon SUSPECTS rusticité ──");
suspRust.slice(0, 12).forEach((s) => console.log(`   ${s.nom.padEnd(34)} ${String(s.valeur).padEnd(12)} ${s.raison}`));
console.log("\n── Échantillon SUSPECTS hauteurs ──");
suspHaut.slice(0, 12).forEach((s) => console.log(`   ${s.nom.padEnd(34)} ${String(s.valeur).padEnd(14)} ${s.raison}`));

writeFileSync("scripts/triage-suspects.json", JSON.stringify({ rusticite: suspRust, hauteurs: suspHaut }, null, 2), "utf-8");
console.log(`\n→ scripts/triage-suspects.json écrit (${suspRust.length + suspHaut.length} flags). AUCUNE donnée modifiée.`);

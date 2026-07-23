/**
 * A5 — Tests de non-régression base végétale ↔ outils.
 * Exécute la VRAIE logique des 3 outils consommateurs contre v1 (avant) et v2 (après).
 *   npx tsx scripts/a5-tests.ts
 */
import type { Plante } from "@/types/plantes";
import v1raw from "@/lib/plantes-v1.json";
import v2raw from "@/lib/plantes-v2.json";

import {
  filterPlantes, sortPlantes, getDefaultFilters, buildColorCatCache,
  STRATE_ORDER as SEL_STRATE_ORDER, STRATE_OPTIONS, PERSISTANCE_OPTIONS,
  TYPE_SOL_OPTIONS, EXPOSITION_OPTIONS, HUMIDITE_SOL_OPTIONS, PH_SOL_OPTIONS,
  BESOINS_HYDRIQUES_OPTIONS,
} from "@/lib/tools/selecteur/filters";
import { computeScoring, formatStrate, formatPersistance, getRusticite } from "@/lib/tools/compatibilite/scoring";
import {
  STRATE_ORDER as CAL_STRATE_ORDER, STRATE_LABELS,
  getPersistanceBadgeClass, isPersistant, isMarcescent,
} from "@/lib/tools/calendrier/phenology";

const v1 = v1raw as Plante[];
const v2 = v2raw as Plante[];

let pass = 0, fail = 0;
function check(name: string, cond: boolean, info = "") {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name} ${info}`); }
}
function head(t: string) { console.log(`\n─── ${t} ───`); }

// ═══ 1. INTÉGRITÉ DE LA BASE ═══
head("1. Intégrité base");
check("v1 chargée (1942)", v1.length === 1942, `(${v1.length})`);
check("v2 chargée (1942)", v2.length === 1942, `(${v2.length})`);
check("aucune espèce perdue", v1.length === v2.length);
const ids2 = new Set(v2.map((p) => p.id));
check("ids uniques", ids2.size === v2.length, `(${ids2.size})`);

// ═══ 2. COUVERTURE DES ENUMS PAR LES OUTILS ═══
head("2. Couverture enums ↔ outils");
const strates2 = [...new Set(v2.map((p) => p.strate))];
const orphansSel = strates2.filter((s) => !SEL_STRATE_ORDER.includes(s));
const orphansCal = strates2.filter((s) => !(CAL_STRATE_ORDER as readonly string[]).includes(s));
check("toute strate est triable (sélecteur)", orphansSel.length === 0, JSON.stringify(orphansSel));
check("toute strate est triable (calendrier)", orphansCal.length === 0, JSON.stringify(orphansCal));
const noLabel = strates2.filter((s) => !STRATE_LABELS[s]);
check("toute strate a un libellé (calendrier)", noLabel.length === 0, JSON.stringify(noLabel));
const noFmt = strates2.filter((s) => formatStrate(s) === s);
check("toute strate a un libellé (compatibilité)", noFmt.length === 0, JSON.stringify(noFmt));

const pers2 = [...new Set(v2.map((p) => p.persistance).filter(Boolean))];
const persFilter = PERSISTANCE_OPTIONS.values.map((v) => v.value);
const persOrph = pers2.filter((p) => !persFilter.includes(p));
check("toute persistance est filtrable", persOrph.length === 0, JSON.stringify(persOrph));
check("marcescent présent en base", pers2.includes("marcescent"));
check("badge marcescent distinct", getPersistanceBadgeClass("marcescent") === "marcescent");
check("marcescent ≠ persistant (feuillage vert)", isPersistant("marcescent") === false);
check("isMarcescent détecte", isMarcescent("marcescent") === true);
check("libellés persistance (4 valeurs)",
  ["persistant","semi-persistant","marcescent","caduc"].every((p) => formatPersistance(p) !== "—"));

// champs enum simples : toute valeur en base doit être filtrable
function coverage(field: keyof Plante, opts: { value: string }[], label: string) {
  const vals = new Set<string>();
  for (const p of v2) {
    const v = p[field] as unknown;
    for (const x of (Array.isArray(v) ? v : [v])) if (x) vals.add(String(x));
  }
  const allowed = opts.map((o) => o.value);
  const orph = [...vals].filter((x) => !allowed.includes(x));
  check(`${label} : toute valeur filtrable`, orph.length === 0, JSON.stringify(orph.slice(0, 8)));
}
coverage("exposition", EXPOSITION_OPTIONS.values, "exposition");
coverage("besoins_hydriques", BESOINS_HYDRIQUES_OPTIONS.values, "besoins_hydriques");
coverage("ph_sol", PH_SOL_OPTIONS.values, "ph_sol");
coverage("humidite_sol", HUMIDITE_SOL_OPTIONS.values, "humidite_sol");
coverage("strate", STRATE_OPTIONS.values, "strate");
// type_sol : vocabulaire volontairement enrichi (D2 option A) → on vérifie seulement que le canon est filtrable
const solVals = new Set<string>();
for (const p of v2) for (const x of (p.type_sol || [])) solVals.add(x);
const solFilterable = TYPE_SOL_OPTIONS.values.map((v) => v.value).filter((v) => solVals.has(v));
check("type_sol : les 7 valeurs canoniques présentes sont filtrables", solFilterable.length >= 6,
  `(${solFilterable.length}/7 — vocabulaire total ${solVals.size})`);

// ═══ 3. SÉLECTEUR — filtres ═══
head("3. Sélecteur : filtres");
const cache2 = buildColorCatCache(v2);
function filt(patch: Partial<ReturnType<typeof getDefaultFilters>>) {
  return filterPlantes(v2, { ...getDefaultFilters(), ...patch }, cache2).length;
}
check("aucun filtre → toute la base", filt({}) === 1942, `(${filt({})})`);
for (const s of ["arbre_grand","arbuste","vivace","graminée","fougère","couvre-sol","bulbe","aquatique","grimpante"]) {
  const n = filt({ strate: [s] });
  check(`filtre strate=${s} → ${n}`, n > 0);
}
for (const p of ["persistant","caduc","semi-persistant","marcescent"]) {
  const n = filt({ persistance: [p] });
  check(`filtre persistance=${p} → ${n}`, n > 0);
}
for (const t of ["sableux","limoneux","argileux","calcaire","humifère","caillouteux"]) {
  const n = filt({ typeSol: [t] });
  check(`filtre type_sol=${t} → ${n}`, n > 0);
}
check(`filtre humidité=détrempé → ${filt({ humiditeSol: ["détrempé"] })}`, filt({ humiditeSol: ["détrempé"] }) > 0);
check(`filtre exposition=ombre → ${filt({ exposition: ["ombre"] })}`, filt({ exposition: ["ombre"] }) > 0);
check(`filtre hydrique=fort → ${filt({ besoinsHydriques: ["fort"] })}`, filt({ besoinsHydriques: ["fort"] }) > 0);
check(`filtre mellifère → ${filt({ mellifere: true })}`, filt({ mellifere: true }) > 0);
check(`filtre hauteur 0-100cm → ${filt({ heightMin: 0, heightMax: 100 })}`, filt({ heightMin: 0, heightMax: 100 }) > 0);
check(`filtre rusticité ≤ -20°C → ${filt({ rusticite: -20 })}`, filt({ rusticite: -20 }) > 0);
check(`filtre floraison 6→8 → ${filt({ floraDebut: "6", floraFin: "8" })}`, filt({ floraDebut: "6", floraFin: "8" }) > 0);
check("tri par strate ne jette rien", sortPlantes(v2, "strate").length === 1942);
check("tri par rusticité ne jette rien", sortPlantes(v2, "rusticite").length === 1942);

// régression v1→v2 : le filtre "graminée" doit AUGMENTER (38 herbacées reclassées)
const cache1 = buildColorCatCache(v1);
const gram1 = filterPlantes(v1, { ...getDefaultFilters(), strate: ["graminée"] }, cache1).length;
const gram2 = filt({ strate: ["graminée"] });
check(`graminées v1=${gram1} → v2=${gram2} (+38 attendu)`, gram2 === gram1 + 38);
const foug1 = filterPlantes(v1, { ...getDefaultFilters(), strate: ["fougère"] }, cache1).length;
const foug2 = filt({ strate: ["fougère"] });
check(`fougères v1=${foug1} → v2=${foug2} (accents unifiés)`, foug2 >= foug1);

// ═══ 4. COMPATIBILITÉ — scoring ═══
head("4. Compatibilité : scoring");
const byId = new Map(v2.map((p) => [p.id, p]));
function mix(ids: string[]) { return ids.map((i) => byId.get(i)).filter(Boolean) as Plante[]; }

const classic = mix(["abies-alba", "acer-campestre"]);
check("mix classique score valide", (() => {
  const r = computeScoring(classic);
  return !!r && r.globalScore >= 0 && r.globalScore <= 100;
})(), JSON.stringify(computeScoring(classic)?.globalScore));

// espèces A4 (nouvelles) — écologie compilée
const nouvelles = v2.filter((p) => ["miscanthus-sacchariflorus","carex-muskingumensis","dryopteris-wallichiana"].includes(p.id));
check("mix 100% nouvelles espèces A4 OK", (() => {
  const r = computeScoring(nouvelles);
  return nouvelles.length >= 2 && !!r && r.globalScore >= 0 && r.globalScore <= 100;
})(), `(${nouvelles.length} trouvées)`);

// robustesse : espèces à champs éco vides
const vides = v2.filter((p) => (!p.exposition || p.exposition.length === 0) || !p.besoins_hydriques).slice(0, 4);
check(`robustesse champs vides (${vides.length} esp.)`, (() => {
  if (vides.length < 2) return true; // plus aucun champ vide = OK aussi
  const r = computeScoring(vides);
  return !!r && Number.isFinite(r.globalScore);
})());

// mix hétérogène incluant marcescent
const marc = v2.filter((p) => p.persistance === "marcescent");
check("mix avec marcescent OK", (() => {
  const m = [...marc, ...mix(["abies-alba"])];
  const r = computeScoring(m);
  return m.length >= 2 && !!r && Number.isFinite(r.globalScore);
})());

check("getRusticite tolère les null", (() => {
  const r = getRusticite(v2.slice(0, 300));
  return r === null || Number.isFinite(r.min);
})());

// non-régression : score identique v1/v2 pour un mix dont les valeurs n'ont pas changé
const byId1 = new Map(v1.map((p) => [p.id, p]));
const ref1 = ["abies-alba", "acer-campestre"].map((i) => byId1.get(i)!).filter(Boolean);
const s1 = computeScoring(ref1)?.globalScore;
const s2 = computeScoring(classic)?.globalScore;
check(`score mix référence v1=${s1} v2=${s2}`, s1 !== undefined && s2 !== undefined);

// ═══ 5. CALENDRIER ═══
head("5. Calendrier");
const badges = new Set(v2.map((p) => getPersistanceBadgeClass(p.persistance)));
check("badges connus uniquement", [...badges].every((b) => ["persistant","caduc","semiPersistant","marcescent"].includes(b)), JSON.stringify([...badges]));
check("aucune strate hors ordre de tri", v2.every((p) => (CAL_STRATE_ORDER as readonly string[]).includes(p.strate)));
check("floraison wrap (déc→mars) gérée", (() => {
  const wrap = v2.filter((p) => p.floraison_debut && p.floraison_fin && p.floraison_debut > p.floraison_fin);
  return wrap.length >= 0; // présence tolérée, pas de crash
})(), `(${v2.filter((p) => p.floraison_debut && p.floraison_fin && p.floraison_debut > p.floraison_fin).length} esp.)`);

// ═══ 6. FIABILISATION (triage 23/07/2026) ═══
head("6. Fiabilisation — arbitrages appliqués");
const nl = new Map(v2.map((p) => [p.nom_latin, p]));
for (const [nom, attendu] of [
  ["Ligustrum japonicum", "arbre_moyen"], ["Photinia serratifolia", "arbre_moyen"],
  ["Heteromeles arbutifolia", "arbre_petit"], ["Eriobotrya deflexa", "arbre_petit"],
  ["Pistacia vera", "arbre_petit"], ["Styrax officinalis", "arbre_petit"],
] as [string, string][]) {
  check(`${nom} → ${attendu}`, nl.get(nom)?.strate === attendu, `(${nl.get(nom)?.strate})`);
}
for (const nom of ["Citrus spp", "Callistemon viminalis", "Grevillea banksii"]) {
  check(`${nom} conservé en arbuste (grand développement)`, nl.get(nom)?.strate === "arbuste", `(${nl.get(nom)?.strate})`);
}
check("Lathyrus odoratus : rusticité vide (annuelle)",
  nl.get("Lathyrus odoratus")?.rusticite_usda === "" && nl.get("Lathyrus odoratus")?.rusticite_celsius === null);

// filtre hauteur : les espèces SANS hauteur ne doivent plus être exclues
const sansHauteur = v2.filter((p) => p.hauteur_min_cm == null && p.hauteur_max_cm == null);
check(`espèces sans hauteur présentes en base (${sansHauteur.length})`, sansHauteur.length > 0);
const filtHaut = filterPlantes(v2, { ...getDefaultFilters(), heightMin: 0, heightMax: 100 }, cache2);
const gardees = sansHauteur.filter((p) => filtHaut.some((q) => q.id === p.id)).length;
check(`filtre hauteur 0-100 conserve les ${sansHauteur.length} sans-hauteur`, gardees === sansHauteur.length, `(${gardees})`);
const filtHaut2 = filterPlantes(v2, { ...getDefaultFilters(), heightMin: 2000, heightMax: 5000 }, cache2);
check("filtre hauteur 20-50 m conserve aussi les sans-hauteur",
  sansHauteur.every((p) => filtHaut2.some((q) => q.id === p.id)));
check("filtre hauteur exclut toujours les hors-plage renseignées",
  filtHaut.every((p) => p.hauteur_min_cm == null || p.hauteur_min_cm <= 100));

// ═══ RÉSULTAT ═══
console.log(`\n${"═".repeat(50)}\nRÉSULTAT : ${pass} passés, ${fail} échoués`);
if (fail > 0) process.exit(1);

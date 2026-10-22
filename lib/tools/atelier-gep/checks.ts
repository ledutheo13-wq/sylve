// ═══════════════════════════════════════════════════════════
//  ATELIER GEP — cas de test du MOTEUR (Phase 1)
//  Lancement : npx tsx lib/tools/atelier-gep/checks.ts
//  Aucune dépendance de test ajoutée : harnais minimal maison.
//  Valeurs attendues calculées à la main (voir commentaires).
// ═══════════════════════════════════════════════════════════

import { calculerSurfaces } from "./surfaces";
import { hauteurMontana } from "./montana";
import { calculerVolumeAGerer, volumeAGererNumerique } from "./pluies";
import { debitInfiltrationM3H, debitInfiltrationLS } from "./infiltration";
import { sectionNoue, volumePoreux } from "./geometrie";
import { debitManning } from "./manning";
import { capaciteMaxToiture, volumeAbattementToiture } from "./toiture";
import { indiceThermique, etpAnnuelle, etpMensuelle } from "./etp";
import { capaciteOuvrage, infiltrationProjet, type Ouvrage, type ContexteSite } from "./ouvrages";
import { calculerBilan } from "./bilan";
import type { JeuMontana } from "./types";

let passed = 0;
let failed = 0;

function ok(nom: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${nom}`);
  } else {
    failed++;
    console.log(`  ✗ ${nom}  ${detail}`);
  }
}

function near(nom: string, got: number, exp: number, tol: number) {
  ok(nom, Math.abs(got - exp) <= tol, `→ obtenu ${got.toFixed(4)}, attendu ${exp} (±${tol})`);
}

// ── Jeu Montana de référence pour les tests ──
const JEU: JeuMontana = { a: 5.9, b: 0.59, tMinMinutes: 6, tMaxMinutes: 120, periodeRetour: 10 };

console.log("\n1. Surface active");
{
  const r = calculerSurfaces([
    { nature: "toiture", surface: 1000, cr: 0.95 },
    { nature: "voirie", surface: 500, cr: 0.95 },
    { nature: "ev", surface: 1500, cr: 0.15 },
  ]);
  near("Sa = 1650 m²", r.surfaceActive, 1650, 1e-6);
  near("coef pondéré = 0,55", r.coefPondere, 0.55, 1e-6);
}

console.log("\n2. Hauteur de Montana");
near("h(60 min) ≈ 31,6 mm", hauteurMontana(JEU, 60), 31.615, 0.05);

console.log("\n3. Volume à gérer (méthode des pluies, sans infiltration)");
{
  const e = { surfaceActive: 1650, jeu: JEU, debitFuiteM3H: 10.8, debitInfiltrationM3H: 0 };
  const r = calculerVolumeAGerer(e);
  // t* = (9,735·0,41/0,18)^(1/0,59) ≈ 191,1 min ; V ≈ 49,49 m³ ; vidange ≈ 4,58 h
  near("volume ≈ 49,5 m³", r.volumeAGerer, 49.49, 0.3);
  near("durée critique ≈ 191 min", r.dureeCritiqueMinutes, 191.1, 1);
  near("temps de vidange ≈ 4,58 h", r.tempsVidangeHeures, 4.58, 0.1);
  ok("durée critique hors plage Montana (t* > 120 min)", r.horsPlageMontana === true);

  // Cohérence analytique vs balayage numérique
  const num = volumeAGererNumerique(e);
  near("analytique ≈ numérique (volume)", r.volumeAGerer, num.volume, 0.1);
  near("analytique ≈ numérique (durée)", r.dureeCritiqueMinutes, num.duree, 1.5);
}

console.log("\n4. Sections de noue (4 profils)");
near("rectangulaire (b=1, h=0,4) = 0,400 m²", sectionNoue({ profil: "rectangulaire", hauteur: 0.4, largeurFond: 1 }), 0.4, 1e-9);
near("trapézoïdal (b=1, h=0,4, β=45°) = 0,560 m²", sectionNoue({ profil: "trapezoidal", hauteur: 0.4, largeurFond: 1, angleBerge: 45 }), 0.56, 1e-9);
near("asymétrique (b=1, h=0,4, β=45°) = 0,480 m²", sectionNoue({ profil: "asymetrique", hauteur: 0.4, largeurFond: 1, angleBerge: 45 }), 0.48, 1e-9);
near("circulaire (D=1, h=0,5) = π/8 ≈ 0,3927 m²", sectionNoue({ profil: "circulaire", hauteur: 0.5, diametre: 1 }), Math.PI / 8, 1e-6);

console.log("\n5. Infiltration");
{
  const p = { kMetresParSeconde: 1e-5, coefSecurite: 0.5, surfaceInfiltration: 100 };
  near("Q_inf = 1,8 m³/h", debitInfiltrationM3H(p), 1.8, 1e-6);
  near("Q_inf = 0,5 l/s", debitInfiltrationLS(p), 0.5, 1e-9);
}

console.log("\n6. Volume poreux (structure réservoir)");
near("300 m² × 0,40 m × 0,30 = 36 m³", volumePoreux(300, 0.4, 0.3), 36, 1e-9);

console.log("\n7. Toiture végétalisée (conversion CME → mm)");
{
  // 10 cm à 35 %vol = 35 mm = 35 L/m² (conversion exacte, cf. recherche)
  near("capacité max (10 cm, 35 %vol) = 35 mm", capaciteMaxToiture({ cmePourcent: 35, epaisseurCm: 10 }), 35, 1e-9);
  // abattement événementiel = 35 × 0,40 = 14 mm ; sur 500 m² → 7 m³
  near("volume abattement (500 m²) = 7 m³", volumeAbattementToiture({ cmePourcent: 35, epaisseurCm: 10 }, 500), 7, 1e-9);
}

console.log("\n8. Manning-Strickler (débit capable indicatif)");
{
  // noue trapézoïdale S=0,56 m², P = 1 + 2·(0,4/sin45) = 2,1314 m, Rh=0,2627
  // K=25, I=0,005 → Q = 25·0,56·0,2627^(2/3)·√0,005 ≈ 0,406 m³/s
  const q = debitManning({ geom: { profil: "trapezoidal", hauteur: 0.4, largeurFond: 1, angleBerge: 45 }, strickler: 25, pente: 0.005 });
  ok("débit capable dans un ordre plausible (0,2–0,7 m³/s)", q > 0.2 && q < 0.7, `→ ${q.toFixed(3)} m³/s`);
}

console.log("\n9. ETP Thornthwaite (plausibilité, France tempérée)");
{
  const T = [4, 5, 8, 11, 15, 18, 20, 20, 16, 12, 7, 5];
  const I = indiceThermique(T);
  near("indice thermique I ≈ 47,8", I, 47.84, 0.5);
  const mens = etpMensuelle(T, 46.5);
  const annuel = etpAnnuelle(T, 46.5);
  ok("ETP annuelle plausible (600–900 mm)", annuel > 600 && annuel < 900, `→ ${annuel.toFixed(0)} mm`);
  ok("ETP juillet > ETP janvier", mens[6] > mens[0]);
  ok("tous les mois ≥ 0", mens.every((v) => v >= 0));
}

console.log("\n10. Infiltration des ouvrages — source unique (cas de Nantes, T100)");
{
  // Nantes T100 (montana-coefficients.json) ; Sa = 840·0,95 + 789·0,95 + 1096·0,15 + 1349·0,5 = 2386,45 m²
  const JEU_NANTES: JeuMontana = { a: 9.658, b: 0.6675, tMinMinutes: 60, tMaxMinutes: 1440, periodeRetour: 100 };
  const Sa = calculerSurfaces([
    { nature: "toiture", surface: 840, cr: 0.95 },
    { nature: "voirie", surface: 789, cr: 0.95 },
    { nature: "ev", surface: 1096, cr: 0.15 },
    { nature: "stabilisé", surface: 1349, cr: 0.5 },
  ]).surfaceActive;
  const QF = 10.8; // 3 l/s
  const ouvragesNantes = (bassinInfiltrant: boolean): Ouvrage[] => [
    { id: "sr", type: "structure_reservoir", nom: "Structure réservoir", emprise: 186, epaisseur: 0.4, porosite: 0.3, infiltrant: false },
    { id: "b", type: "bassin", nom: "Bassin", surfaceFond: 220, profondeur: 0.3, fruit: 1, infiltrant: bassinInfiltrant },
    { id: "c", type: "cuve", nom: "Cuve", volumeUtile: 30 },
  ];
  const chaine = (ouvrages: Ouvrage[], kMs: number, surfaceManuelle: number | null = null) => {
    const inf = infiltrationProjet({ ouvrages, kMs, coefSecuriteK: 0.5, surfaceManuelle });
    const vol = calculerVolumeAGerer({ surfaceActive: Sa, jeu: JEU_NANTES, debitFuiteM3H: QF, debitInfiltrationM3H: inf.debitM3H });
    const site: ContexteSite = { kMs, coefSecuriteK: 0.5, temperatures: Array(12).fill(10), latitude: 47, dureeCritiqueMin: vol.dureeCritiqueMinutes };
    const bilan = calculerBilan({ volumeAGerer: vol.volumeAGerer, debitFuiteM3H: QF, debitInfiltrationM3H: inf.debitM3H, dureeCritiqueMin: vol.dureeCritiqueMinutes, ouvrages, site });
    return { inf, vol, bilan, site };
  };

  // (b) sans ouvrage infiltrant : identique à la référence d'avant correction
  {
    const { inf, vol, bilan } = chaine(ouvragesNantes(false), 1e-6);
    near("(b) S_inf = 0", inf.surfaceInfiltration, 0, 1e-12);
    near("(b) volume = 99,68 m³ (référence)", vol.volumeAGerer, 99.6826, 0.001);
    near("(b) durée critique = 275,9 min (référence)", vol.dureeCritiqueMinutes, 275.859, 0.01);
    near("(b) vidange = 9,23 h (référence)", vol.tempsVidangeHeures, 9.2299, 0.001);
    near("(b) rejet régulé = 49,65 m³ (référence)", bilan.parExutoire.rejet, 49.6546, 0.001);
    near("(b) réutilisation = 30 m³ (référence)", bilan.parExutoire.reutilisation, 30, 1e-9);
    near("(b) stocké = 20,03 m³ (référence)", bilan.parExutoire.stockage, 20.028, 0.001);
    near("(b) infiltration = 0", bilan.parExutoire.infiltration, 0, 1e-12);
  }

  // (a) bassin infiltrant : Q_inf = 1e-6 · 0,5 · 220 = 1,1e-4 m³/s = 0,396 m³/h = 0,11 l/s
  {
    const { inf, vol, bilan, site } = chaine(ouvragesNantes(true), 1e-6);
    near("(a) S_inf calculée = 220 m² (fond du bassin)", inf.surfaceInfiltration, 220, 1e-9);
    near("(a) Q_inf = 0,396 m³/h", inf.debitM3H, 0.396, 1e-9);
    near("(a) évacuation = 11,196 m³/h (3,11 l/s)", vol.debitTotalM3H, 11.196, 1e-9);
    ok("(a) volume < référence 99,68 m³", vol.volumeAGerer < 99.6826, `→ ${vol.volumeAGerer.toFixed(3)}`);
    near("(a) analytique ≈ numérique", vol.volumeAGerer, volumeAGererNumerique({ surfaceActive: Sa, jeu: JEU_NANTES, debitFuiteM3H: QF, debitInfiltrationM3H: inf.debitM3H }, 1, 1440).volume, 0.1);
    near("(a) carte du bassin = part du projet (0,396 m³/h)", capaciteOuvrage(ouvragesNantes(true)[1], site).debitInfiltrationM3H, inf.debitM3H, 1e-12);
    const ev = bilan.parExutoire.rejet + bilan.parExutoire.infiltration;
    near("(a) infiltration = évacué · Q_inf / Q_total", bilan.parExutoire.infiltration, ev * (0.396 / 11.196), 1e-9);
    ok("(a) part d'infiltration visible (3–4 % de l'évacué)", bilan.parExutoire.infiltration / ev > 0.03 && bilan.parExutoire.infiltration / ev < 0.04);
    near("(a) camembert bouclé sur V", ev + bilan.parExutoire.reutilisation + bilan.parExutoire.stockage, vol.volumeAGerer, 1e-9);
  }

  // (c) deux ouvrages infiltrants : surfaces additionnées (220 + 186 = 406 m²)
  {
    const ouv = ouvragesNantes(true).map((o) => (o.type === "structure_reservoir" ? { ...o, infiltrant: true } : o));
    const { inf } = chaine(ouv, 1e-6);
    near("(c) S_inf = 406 m²", inf.surfaceInfiltration, 406, 1e-9);
    near("(c) Σ parts des ouvrages = Q_inf projet", inf.decomposition.reduce((s, p) => s + p.debitM3H, 0), inf.debitM3H, 1e-12);
  }

  // (d) saisie manuelle + ouvrage infiltrant : la saisie remplace, avertissement, pas de double compte
  {
    const { inf } = chaine(ouvragesNantes(true), 1e-6, 100);
    ok("(d) avertissement de conflit levé", inf.conflitManuelOuvrages === true);
    near("(d) S_inf = 100 m² (pas 320)", inf.surfaceInfiltration, 100, 1e-9);
    near("(d) Q_inf = 1e-6 · 0,5 · 100 · 3600 = 0,18 m³/h", inf.debitM3H, 0.18, 1e-9);
    near("(d) part du bassin non comptée", inf.decomposition[0].debitM3H, 0, 1e-12);
  }

  // (e) sol argileux (K = 1e-9) : infiltration non retenue, sorties = référence (b)
  {
    const { inf, vol, bilan } = chaine(ouvragesNantes(true), 1e-9);
    ok("(e) infiltration non retenue", inf.retenue === false);
    near("(e) Q_inf = 0", inf.debitM3H, 0, 1e-12);
    near("(e) volume = référence 99,68 m³", vol.volumeAGerer, 99.6826, 0.001);
    near("(e) infiltration au camembert = 0", bilan.parExutoire.infiltration, 0, 1e-12);
  }
}

// ── Bilan ──
console.log(`\n${"─".repeat(48)}`);
console.log(`RÉSULTAT : ${passed} réussis, ${failed} échoués`);
if (failed > 0) process.exit(1);

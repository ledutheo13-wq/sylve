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

// ── Bilan ──
console.log(`\n${"─".repeat(48)}`);
console.log(`RÉSULTAT : ${passed} réussis, ${failed} échoués`);
if (failed > 0) process.exit(1);

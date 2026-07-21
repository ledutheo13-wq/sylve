import { FACTEUR_ABATTEMENT_EVENEMENTIEL } from "./defaults";

// ═══════════════════════════════════════════════════════════
//  BLOC C/D — Toiture végétalisée : 3 sorties À NE JAMAIS FUSIONNER
//
//  (A) Capacité maximale     = CME(%vol)/100 · épaisseur(mm) + rétention drainage
//        → sert à la CHARGE STRUCTURELLE, PAS au dimensionnement pluvial.
//  (B) Abattement événementiel = facteur · (A)   (pluie courante, après période sèche)
//  (C) Abattement annuel (mm/an, %) via bilan intégré (ETP) — module annuel.
//
//  ⚠ Sur une pluie de projet (T10+), la doctrine (Règles Pro TTV, Annexe C.2)
//  n'autorise PAS à déduire cette rétention du volume à stocker en aval.
//  → l'outil affiche A/B/C mais NE soustrait PAS (B) du volume T10.
//
//  Conversion exacte (sans coefficient) :
//     Rétention (mm) = Rétention (L/m²) = CME(%vol)/100 × épaisseur(mm)
//     → 1 cm à 1 %vol = 0,1 mm.
//
//  Réf. : Règles Pro TTV éd. 3 (2018) annexes G ; calage FAVEUR (Cerema).
// ═══════════════════════════════════════════════════════════

export interface EntreeToiture {
  /** capacité maximale en eau du substrat, en % volumique */
  cmePourcent: number;
  /** épaisseur de substrat, en cm */
  epaisseurCm: number;
  /** rétention additionnelle d'une couche drainante-rétentrice, en L/m² (fiche produit) */
  retentionDrainageLm2?: number;
}

export interface ResultatToiture {
  /** (A) capacité maximale, en mm (= L/m²) */
  capaciteMaxMm: number;
  /** (B) abattement événementiel estimé, en mm */
  abattementEvenementielMm: number;
  /** facteur d'abattement appliqué (traçabilité) */
  facteurAbattement: number;
}

/** (A) capacité maximale théorique en mm (= L/m²). */
export function capaciteMaxToiture(e: EntreeToiture): number {
  const cme = Math.max(0, e.cmePourcent) / 100;
  const epaisseurMm = Math.max(0, e.epaisseurCm) * 10;
  const drainage = Math.max(0, e.retentionDrainageLm2 ?? 0);
  return cme * epaisseurMm + drainage;
}

/** Les 3 sorties (A et B ; C = module annuel via etp.ts). */
export function calculerToiture(e: EntreeToiture): ResultatToiture {
  const capaciteMaxMm = capaciteMaxToiture(e);
  const facteur = FACTEUR_ABATTEMENT_EVENEMENTIEL.valeur;
  return {
    capaciteMaxMm,
    abattementEvenementielMm: capaciteMaxMm * facteur,
    facteurAbattement: facteur,
  };
}

/** Volume d'abattement événementiel sur une toiture (m³) — jamais déduit du T10. */
export function volumeAbattementToiture(e: EntreeToiture, surfaceM2: number): number {
  return (calculerToiture(e).abattementEvenementielMm * Math.max(0, surfaceM2)) / 1000;
}

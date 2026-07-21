// ═══════════════════════════════════════════════════════════
//  ATELIER GEP — valeurs par défaut SOURCÉES (éditables dans l'UI)
//  Chaque valeur porte sa citation courte (infobulle-source).
//  Aucune valeur en dur non sourcée. Réf. complètes : biblio.ts
//  et REFERENCES-VALEURS-PAR-DEFAUT.md.
// ═══════════════════════════════════════════════════════════

import type { ValeurSourcee } from "./types";

// ── 1. Coefficients de ruissellement Cr par nature de surface ──
// Source : IT 1977 / Cerema-Wikhydro « Coefficient d'imperméabilisation ».
export interface NatureSurface {
  id: string;
  label: string;
  cr: number;
  source: string;
}

export const NATURES_SURFACE: NatureSurface[] = [
  { id: "toiture", label: "Toiture / béton / enrobé imperméable", cr: 0.95, source: "IT 1977 / Cerema-Wikhydro (0,90–1,00)" },
  { id: "voirie_imper", label: "Voirie / parking imperméabilisé", cr: 0.95, source: "IT 1977 / Cerema-Wikhydro (0,90–1,00)" },
  { id: "paves_joints", label: "Pavés à joints (sable/mortier)", cr: 0.65, source: "Tables hydrologie urbaine (0,60–0,70)" },
  { id: "voirie_stab", label: "Voirie stabilisée / grave compactée", cr: 0.5, source: "Tables hydrologie urbaine (0,40–0,60)" },
  { id: "revet_permeable", label: "Revêtement perméable / pavés drainants", cr: 0.35, source: "Cerema (0,30–0,40)" },
  { id: "ev_plat", label: "Espaces verts / pleine terre (pente faible)", cr: 0.1, source: "Ordres de grandeur usuels (0,05–0,10)" },
  { id: "ev_moyen", label: "Espaces verts (pente moyenne)", cr: 0.15, source: "Ordres de grandeur usuels (0,10–0,20)" },
  { id: "ev_fort", label: "Espaces verts (pente forte)", cr: 0.25, source: "Ordres de grandeur usuels (0,15–0,30)" },
  { id: "bassin", label: "Bassin / surface en eau", cr: 1.0, source: "Majorant (surface contributive directe)" },
];

// ── 2. Perméabilité K par nature de sol (m/s) ──
// Source : ADOPTA (via o2d-environnement) ; Cerema Wikigeotech.
export interface NatureSol {
  id: string;
  label: string;
  kMetresParSeconde: number;
  source: string;
}

export const NATURES_SOL: NatureSol[] = [
  { id: "argile", label: "Argile", kMetresParSeconde: 1e-9, source: "ADOPTA / géotechnique (< 10⁻⁹ m/s — infiltration déconseillée)" },
  { id: "limon", label: "Limon / silt", kMetresParSeconde: 5e-7, source: "Classifications géotechniques (10⁻⁷–10⁻⁶ m/s)" },
  { id: "sable_fin", label: "Sable fin", kMetresParSeconde: 1e-5, source: "Cerema Wikigeotech (~10⁻⁵ m/s)" },
  { id: "sable_moyen", label: "Sable moyen à grossier", kMetresParSeconde: 1e-4, source: "Cerema Wikigeotech (10⁻⁴–10⁻³ m/s)" },
  { id: "gravier", label: "Sable + gravier / gravier propre", kMetresParSeconde: 1e-2, source: "Géotechnique (10⁻²–10⁰ m/s)" },
];

/** Seuil d'aptitude à l'infiltration (guides GEP) : K ≥ 10⁻⁶ m/s. */
export const SEUIL_APTITUDE_INFILTRATION_MS = 1e-6;

/** Coefficient de sécurité sur K. Défaut 0,5 (K/2) ; 1 = position GRAIE argumentée. */
export const COEF_SECURITE_K: ValeurSourcee = {
  valeur: 0.5,
  source: "Guide GISER / GRAIE — 0,5 (K/2) par défaut ; 1 possible (voir infobulle)",
};

// ── 3. Indice de vide / porosité utile des matériaux de stockage ──
export const POROSITE_GRAVES: ValeurSourcee = {
  valeur: 0.3,
  source: "Cerema Wiklimat / LCPC — graves drainantes (25–50 %)",
};
export const POROSITE_SAUL: ValeurSourcee = {
  valeur: 0.95,
  source: "Guide LCPC/IFSTTAR — structures alvéolaires (90–100 %)",
};

// ── 4. Toitures végétalisées : CME par défaut (% volumique) ──
// Source : Règles Pro TTV éd. 3 (2018), Tableau 5 — minima réglementaires.
export interface TypeToiture {
  id: string;
  label: string;
  cmeParDefaut: number; // % volumique
  epaisseurDefautCm: number;
  source: string;
}

export const TYPES_TOITURE: TypeToiture[] = [
  { id: "extensive", label: "Toiture végétalisée extensive", cmeParDefaut: 35, epaisseurDefautCm: 10, source: "Règles Pro TTV 2018, Tab. 5 (≥ 35 %vol)" },
  { id: "semi_intensive", label: "Toiture semi-intensive", cmeParDefaut: 45, epaisseurDefautCm: 20, source: "Règles Pro TTV 2018, Tab. 5 (≥ 45 %vol)" },
  { id: "intensive", label: "Toiture végétalisée intensive", cmeParDefaut: 45, epaisseurDefautCm: 40, source: "Règles Pro TTV 2018 (justifier par CME labo)" },
];

/**
 * Facteur d'abattement ÉVÉNEMENTIEL appliqué à la capacité théorique
 * (CME × épaisseur) pour estimer la rétention réellement mobilisable sur
 * une pluie courante après période sèche.
 * Source : calage FAVEUR (Cerema), Règles Pro TTV Tab. 15 — ratios 0,35–0,44.
 */
export const FACTEUR_ABATTEMENT_EVENEMENTIEL: ValeurSourcee = {
  valeur: 0.4,
  source: "Calage FAVEUR / RP TTV Tab. 15 — abattement événementiel ≈ 0,40 × capacité",
};

// ── 5. Coefficients culturaux kc (FAO-56, Table 12) ──
export interface CoefCultural {
  id: string;
  label: string;
  kc: number;
  source: string;
}

export const COEFS_CULTURAUX: CoefCultural[] = [
  { id: "eau_libre", label: "Eau libre (plan d'eau peu profond)", kc: 1.05, source: "FAO-56 Tab. 12 — eau libre < 2 m" },
  { id: "helophytes", label: "Hélophytes / roselière en eau", kc: 1.2, source: "FAO-56 Tab. 12 — Reed Swamp" },
  { id: "gazon", label: "Gazon / pelouse", kc: 0.95, source: "FAO-56 Tab. 12 — turf (saison fraîche)" },
  { id: "prairie", label: "Prairie extensive", kc: 0.75, source: "FAO-56 Tab. 12 — pâture extensive" },
  { id: "sedum", label: "Sédum (toiture extensive)", kc: 0.4, source: "Ordre de grandeur CAM/crassulacées (à confirmer)" },
];

// ── 6. Temps de vidange (garde-fous) ──
export const VIDANGE_CIBLE_H = 24;
export const VIDANGE_LIMITE_H = 48;
export const VIDANGE_SOURCE = "Guides GEP / Cerema OASIS — 24 h (cible), 48 h (limite)";

// ── 7. Périodes de retour usuelles ──
export const PERIODES_RETOUR = [10, 30, 50, 100] as const;
export const PERIODE_RETOUR_DEFAUT = 10;
export const PERIODE_RETOUR_SOURCE =
  "Guides EP (DDT) — T10 (dégâts matériels) à T100 (sécurité des personnes) ; le règlement local prime";

// ── 8. Latitude par défaut (correction durée du jour Thornthwaite) ──
export const LATITUDE_DEFAUT_DEG = 46.5;
export const LATITUDE_SOURCE = "Centre France métropolitaine (éditable) — correction FAO-56";

// ── 9. Coefficient de Strickler (rugosité) pour noues végétalisées ──
export const STRICKLER_NOUE: ValeurSourcee = {
  valeur: 25,
  source: "Manning-Strickler — noue enherbée (K ≈ 20–30)",
};

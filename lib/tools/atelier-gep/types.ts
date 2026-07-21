// ═══════════════════════════════════════════════════════════
//  ATELIER GEP — types partagés du moteur de calcul
//  Construction clean-room : méthodes et valeurs issues de
//  références publiques uniquement (voir defaults.ts / biblio.ts).
// ═══════════════════════════════════════════════════════════

/** Les 4 destinations finales de l'eau (« exutoires »). Le STOCKAGE n'en est pas un. */
export type Exutoire = "atmosphere" | "infiltration" | "reutilisation" | "rejet";

/** Mécanisme par lequel un ouvrage agit sur l'eau (transit ou destination). */
export type Mecanisme = "stockage" | "infiltration" | "etp" | "reutilisation";

/** Une valeur par défaut sourcée (pour affichage en infobulle). */
export interface ValeurSourcee<T = number> {
  valeur: T;
  /** citation courte affichée dans l'UI, ex. « Cr — Cerema/Wikhydro » */
  source: string;
}

// ── Bloc A : surfaces ──────────────────────────────────────

export interface SurfaceLigne {
  nature: string;
  /** surface réelle en m² */
  surface: number;
  /** coefficient de ruissellement (0–1), éditable */
  cr: number;
}

export interface ResultatSurfaces {
  /** surface active Sa = Σ(surface_i × Cr_i), en m² */
  surfaceActive: number;
  /** somme des surfaces réelles, en m² */
  surfaceTotale: number;
  /** coefficient de ruissellement pondéré = Sa / surfaceTotale */
  coefPondere: number;
}

// ── Bloc A : Montana / pluviométrie ────────────────────────

/** Un jeu de coefficients de Montana valable sur une gamme de durées. */
export interface JeuMontana {
  a: number;
  b: number;
  /** borne basse de validité (min) */
  tMinMinutes: number;
  /** borne haute de validité (min) */
  tMaxMinutes: number;
  /** période de retour associée (ans) */
  periodeRetour: number;
}

// ── Bloc A : infiltration ──────────────────────────────────

/** Où prendre la surface d'infiltration effective (règle anti-colmatage). */
export type TypeSurfaceInfiltration = "fond" | "parois";

export interface ParamInfiltration {
  /** perméabilité K du sol à saturation, en m/s */
  kMetresParSeconde: number;
  /** coefficient de sécurité minorant sur K (0,5 par défaut ; 1 = position GRAIE) */
  coefSecurite: number;
  /** surface d'infiltration effective mobilisée, en m² */
  surfaceInfiltration: number;
}

// ── Bloc B : méthode des pluies ────────────────────────────

export interface ResultatVolume {
  /** volume à gérer = max_t ΔV(t), en m³ */
  volumeAGerer: number;
  /** instant du maximum (durée critique), en minutes */
  dureeCritiqueMinutes: number;
  /** temps de vidange complet V / Q_total, en heures */
  tempsVidangeHeures: number;
  /** débit total évacué pris en compte (fuite + infiltration), en m³/h */
  debitTotalM3H: number;
  /** true si la durée critique sort de la plage de validité du jeu Montana */
  horsPlageMontana: boolean;
  periodeRetour: number;
}

// ── Bloc C : ouvrages ──────────────────────────────────────

/** Capacité d'un ouvrage ventilée par mécanisme + destination(s). */
export interface CapaciteOuvrage {
  /** volume de stockage géométrique, en m³ */
  volumeStockage: number;
  /** débit d'infiltration de l'ouvrage, en m³/h (0 si non infiltrant) */
  debitInfiltrationM3H: number;
  /** volume évaporable (ETP) sur la période considérée, en m³ (0 si non évaporant) */
  volumeEtp: number;
  /** volume réutilisable (cuve), en m³ (0 sinon) */
  volumeReutilisation: number;
  /** débit capable Manning-Strickler si pertinent (noue/fossé), en m³/s */
  debitCapableM3S?: number;
}

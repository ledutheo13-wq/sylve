import type { GeomNoue } from "./geometrie";
import { sectionNoue, perimetreNoue } from "./geometrie";

// ═══════════════════════════════════════════════════════════
//  Manning-Strickler — débit capable à surface libre
//    Q = K · S · Rh^(2/3) · I^(1/2)
//  avec Rh = S / P (rayon hydraulique), I pente longitudinale (m/m),
//  K coefficient de Strickler (≈ 1/n de Manning).
//
//  V1 : sert à afficher le DÉBIT CAPABLE d'une noue à titre indicatif
//  (la vérification de conduite/réseau relève du débit de pointe → V2).
//
//  Réf. : Manning (1891), Strickler (1923) — domaine public.
// ═══════════════════════════════════════════════════════════

export interface EntreeManning {
  geom: GeomNoue;
  /** coefficient de Strickler K (m^{1/3}/s) */
  strickler: number;
  /** pente longitudinale I (m/m) */
  pente: number;
}

/** Débit capable en m³/s. */
export function debitManning(e: EntreeManning): number {
  const S = sectionNoue(e.geom);
  const P = perimetreNoue(e.geom);
  if (S <= 0 || P <= 0 || e.pente <= 0 || e.strickler <= 0) return 0;
  const rh = S / P;
  return e.strickler * S * Math.pow(rh, 2 / 3) * Math.sqrt(e.pente);
}

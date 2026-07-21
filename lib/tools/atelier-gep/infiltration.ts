import type { ParamInfiltration } from "./types";
import { SEUIL_APTITUDE_INFILTRATION_MS } from "./defaults";

// ═══════════════════════════════════════════════════════════
//  BLOC A/C — Infiltration
//
//  Débit d'infiltration : Q_inf = K_dim · S_inf
//    K_dim = K · coef_sécurité   (coef 0,5 par défaut ; 1 = position GRAIE)
//    S_inf = surface d'infiltration EFFECTIVE (règle anti-colmatage) :
//       • noue / bassin / structure réservoir  → le FOND
//       • puits / tranchée profonde            → les PAROIS (le fond colmate)
//
//  Réf. : Cerema-Wikhydro « Capacité d'infiltration » ; GRAIE (Chocat 2020).
//  ⚠ K tabulé ≠ K in situ (écart possible de 1–2 ordres de grandeur) :
//     une étude de sol locale reste indispensable au stade réglementaire.
// ═══════════════════════════════════════════════════════════

/** Débit d'infiltration en m³/h. */
export function debitInfiltrationM3H(p: ParamInfiltration): number {
  const kDim = Math.max(0, p.kMetresParSeconde) * Math.max(0, p.coefSecurite); // m/s
  const s = Math.max(0, p.surfaceInfiltration); // m²
  const qM3S = kDim * s; // (m/s)·m² = m³/s
  return qM3S * 3600;
}

/** Débit d'infiltration en l/s (pour affichage). */
export function debitInfiltrationLS(p: ParamInfiltration): number {
  return (debitInfiltrationM3H(p) / 3600) * 1000;
}

/** true si le sol est apte à l'infiltration (K ≥ 10⁻⁶ m/s). */
export function estApteInfiltration(kMetresParSeconde: number): boolean {
  return kMetresParSeconde >= SEUIL_APTITUDE_INFILTRATION_MS;
}

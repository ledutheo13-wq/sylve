import type { JeuMontana } from "./types";

// ═══════════════════════════════════════════════════════════
//  BLOC A — Pluviométrie : coefficients de Montana
//
//  Convention retenue (Météo-France, b donné POSITIF) :
//     intensité  i(t) = a · t^(−b)         (mm/min)
//     hauteur    h(t) = a · t^(1−b)        (mm)   [= i·t]
//  avec t en MINUTES. Équivalent à l'écriture h = a·t^(b'+1)
//  de la littérature où b' = −b (piège d'implémentation courant).
//
//  Réf. : Cerema-Wikhydro « Méthode des pluies » ; Météo-France (IDF).
//  ⚠ Un jeu (a,b) n'est valable que sur sa gamme de durées.
// ═══════════════════════════════════════════════════════════

/** Hauteur de pluie cumulée h(t) en mm, t en minutes. */
export function hauteurMontana(jeu: JeuMontana, tMinutes: number): number {
  if (tMinutes <= 0) return 0;
  return jeu.a * Math.pow(tMinutes, 1 - jeu.b);
}

/** Intensité moyenne i(t) en mm/min, t en minutes. */
export function intensiteMontana(jeu: JeuMontana, tMinutes: number): number {
  if (tMinutes <= 0) return 0;
  return jeu.a * Math.pow(tMinutes, -jeu.b);
}

/** true si la durée est hors de la plage de validité déclarée du jeu. */
export function estHorsPlage(jeu: JeuMontana, tMinutes: number): boolean {
  return tMinutes < jeu.tMinMinutes || tMinutes > jeu.tMaxMinutes;
}

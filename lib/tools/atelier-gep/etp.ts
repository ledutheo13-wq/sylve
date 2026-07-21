// ═══════════════════════════════════════════════════════════
//  BLOC D — Évapotranspiration potentielle (Thornthwaite 1948)
//
//  Indice thermique mensuel : i = (Tm/5)^1.514   (Tm > 0, sinon 0)
//  Indice annuel : I = Σ i
//  Exposant : a = 6,75e-7·I³ − 7,71e-5·I² + 1,792e-2·I + 0,49239
//  ETP non corrigée : PET0 = 16 · (10·Tm / I)^a    (mm/mois, Tm en °C)
//  Correction durée du jour / longueur du mois :
//     PET = PET0 · (N/12) · (jours/30)
//  N = durée d'ensoleillement max (h), calculée depuis la latitude (FAO-56).
//
//  kc cultural (FAO-56) module l'évaporation réelle de l'ouvrage :
//     V_atmosphère = S_ouvrage · (PET · kc) / 1000   (m³, PET en mm)
//
//  Réf. : Thornthwaite (1948) ; Allen et al. FAO-56 (durée du jour).
// ═══════════════════════════════════════════════════════════

const JOURS_MOIS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
/** jour de l'année au milieu de chaque mois (approx.) */
const JOUR_MILIEU = [15, 46, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349];

/** Durée d'ensoleillement maximale N (heures) pour un mois donné (FAO-56). */
export function dureeJour(latitudeDeg: number, moisIndex: number): number {
  const phi = (latitudeDeg * Math.PI) / 180;
  const J = JOUR_MILIEU[moisIndex];
  const decl = 0.409 * Math.sin((2 * Math.PI * J) / 365 - 1.39);
  // angle horaire au coucher ; borné pour éviter NaN aux hautes latitudes
  const x = Math.min(1, Math.max(-1, -Math.tan(phi) * Math.tan(decl)));
  const omega = Math.acos(x);
  return (24 / Math.PI) * omega;
}

/** Indice thermique annuel I à partir des 12 températures moyennes (°C). */
export function indiceThermique(temperatures: number[]): number {
  let I = 0;
  for (const t of temperatures) {
    if (t > 0) I += Math.pow(t / 5, 1.514);
  }
  return I;
}

/** Exposant a de Thornthwaite. */
export function exposantThornthwaite(I: number): number {
  return 6.75e-7 * I ** 3 - 7.71e-5 * I ** 2 + 1.792e-2 * I + 0.49239;
}

/** ETP mensuelle corrigée (mm) pour les 12 mois. */
export function etpMensuelle(temperatures: number[], latitudeDeg: number): number[] {
  const I = indiceThermique(temperatures);
  if (I <= 0) return new Array(12).fill(0);
  const a = exposantThornthwaite(I);
  return temperatures.map((t, m) => {
    if (t <= 0) return 0;
    // saturation au-delà de 26,5 °C (Thornthwaite) — table quadratique simplifiée
    const pet0 = 16 * Math.pow((10 * t) / I, a); // mm/mois (base 12h, 30j)
    const N = dureeJour(latitudeDeg, m);
    const corr = (N / 12) * (JOURS_MOIS[m] / 30);
    return Math.max(0, pet0 * corr);
  });
}

/** ETP annuelle (mm). */
export function etpAnnuelle(temperatures: number[], latitudeDeg: number): number {
  return etpMensuelle(temperatures, latitudeDeg).reduce((s, v) => s + v, 0);
}

/**
 * Volume évaporable annuel d'un ouvrage (m³).
 *   V = S · (ETP_annuelle · kc) / 1000
 */
export function volumeEtpAnnuel(
  surfaceM2: number,
  temperatures: number[],
  latitudeDeg: number,
  kc: number
): number {
  const etp = etpAnnuelle(temperatures, latitudeDeg);
  return (Math.max(0, surfaceM2) * etp * Math.max(0, kc)) / 1000;
}

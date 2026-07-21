import type { JeuMontana, ResultatVolume } from "./types";
import { hauteurMontana, estHorsPlage } from "./montana";

// ═══════════════════════════════════════════════════════════
//  BLOC B — Méthode des pluies (volume de rétention)
//
//  V_ruisselé(t) = Sa · h(t) / 1000              (m³ ; Sa en m², h en mm)
//  V_évacué(t)   = Q_total · (t / 60)            (m³ ; Q en m³/h, t en min)
//  ΔV(t)         = V_ruisselé(t) − V_évacué(t)
//  Volume à gérer = max_t ΔV(t)
//
//  Q_total = Q_fuite (rejet régulé) + Q_infiltration.  L'ajout de
//  l'infiltration au débit de vidange est la pratique du Cerema (OASIS :
//  Q = Q_REG + Q_INF, infiltration supposée constante).
//
//  Solution ANALYTIQUE de la durée critique (pas de durée saisie) :
//     ΔV(t) = C1·t^(1−b) − C2·t   avec C1 = Sa·a/1000, C2 = Q_total/60
//     t* = ( C1·(1−b) / C2 )^(1/b)
//
//  ⚠ La méthode des pluies MINORE les volumes (écart croissant avec T et
//  avec la faiblesse du débit de fuite) — avertissement à afficher.
//
//  Réf. : Cerema-Wikhydro « Méthode des pluies (HU) ».
// ═══════════════════════════════════════════════════════════

export interface EntreeVolume {
  /** surface active, en m² */
  surfaceActive: number;
  jeu: JeuMontana;
  /** débit de fuite réglementaire (rejet régulé), en m³/h */
  debitFuiteM3H: number;
  /** débit d'infiltration mobilisé, en m³/h (0 si aucune) */
  debitInfiltrationM3H: number;
}

export function calculerVolumeAGerer(e: EntreeVolume): ResultatVolume {
  const { surfaceActive: Sa, jeu, debitFuiteM3H, debitInfiltrationM3H } = e;
  const b = jeu.b;
  const debitTotalM3H = Math.max(0, debitFuiteM3H) + Math.max(0, debitInfiltrationM3H);

  const C1 = (Sa * jeu.a) / 1000; // m³ · min^-(1-b)
  const C2 = debitTotalM3H / 60; // m³/min

  // Volume à un instant t (minutes)
  const deltaV = (t: number) => C1 * Math.pow(t, 1 - b) - C2 * t;

  let dureeCritiqueMinutes: number;
  if (C2 <= 0) {
    // Sans évacuation : ΔV croît sans borne — on plafonne à la validité Montana.
    dureeCritiqueMinutes = jeu.tMaxMinutes;
  } else {
    // t* analytique ; garde-fou numérique si exposant dégénéré.
    dureeCritiqueMinutes = Math.pow((C1 * (1 - b)) / C2, 1 / b);
    if (!Number.isFinite(dureeCritiqueMinutes) || dureeCritiqueMinutes <= 0) {
      dureeCritiqueMinutes = jeu.tMaxMinutes;
    }
  }

  const volumeAGerer = Math.max(0, deltaV(dureeCritiqueMinutes));
  const tempsVidangeHeures =
    debitTotalM3H > 0 ? volumeAGerer / debitTotalM3H : Infinity;

  return {
    volumeAGerer,
    dureeCritiqueMinutes,
    tempsVidangeHeures,
    debitTotalM3H,
    horsPlageMontana: estHorsPlage(jeu, dureeCritiqueMinutes),
    periodeRetour: jeu.periodeRetour,
  };
}

/**
 * Vérification numérique indépendante (balayage) — sert de garde-fou de test
 * contre la solution analytique. Non utilisée en production.
 */
export function volumeAGererNumerique(
  e: EntreeVolume,
  pasMinutes = 1,
  tMaxMinutes = 2880
): { volume: number; duree: number } {
  const { surfaceActive: Sa, jeu, debitFuiteM3H, debitInfiltrationM3H } = e;
  const C1 = (Sa * jeu.a) / 1000;
  const C2 = (Math.max(0, debitFuiteM3H) + Math.max(0, debitInfiltrationM3H)) / 60;
  let best = 0;
  let bestT = 0;
  for (let t = pasMinutes; t <= tMaxMinutes; t += pasMinutes) {
    const v = C1 * Math.pow(t, 1 - jeu.b) - C2 * t;
    if (v > best) {
      best = v;
      bestT = t;
    }
  }
  return { volume: best, duree: bestT };
}

// (hauteurMontana réexporté pour les tests / l'UI)
export { hauteurMontana };

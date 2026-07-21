import data from "./montana-coefficients.json";
import type { JeuMontana } from "./types";

// ═══════════════════════════════════════════════════════════
//  Coefficients de Montana — jeu de villes calculé par SYLVE
//  d'après les pluies 6 min OPEN DATA Météo-France (Licence Ouverte).
//  Construction clean-room, aucune donnée tierce. Voir scripts/montana/.
// ═══════════════════════════════════════════════════════════

export interface RangeCoef {
  a: number;
  b: number;
  tmin: number;
  tmax: number;
  r2: number;
}

export interface VilleMontana {
  nom: string;
  dept: string;
  num_poste: number;
  station: string;
  lat: number;
  lon: number;
  n_annees: number;
  couverture: number;
  coefficients: Record<string, { court?: RangeCoef; long?: RangeCoef }>;
}

interface MontanaData {
  meta: { source: string; methode: string; attribution: string; periodes_retour: number[] };
  villes: VilleMontana[];
}

export const montana = data as MontanaData;

export const PERIODES_MONTANA = montana.meta.periodes_retour; // [5,10,20,30,50,100]
export const SOURCE_MONTANA = montana.meta.source;
export const ATTRIBUTION_MONTANA = montana.meta.attribution;

/** Villes triées alphabétiquement (pour le sélecteur). */
export const villesMontana: VilleMontana[] = [...montana.villes].sort((a, b) =>
  a.nom.localeCompare(b.nom, "fr")
);

/** Distance haversine (km) entre deux points. */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Ville de référence la plus proche de coordonnées données. */
export function villeLaPlusProche(lat: number, lon: number): VilleMontana {
  let best = villesMontana[0];
  let bestD = Infinity;
  for (const v of villesMontana) {
    const d = distanceKm(lat, lon, v.lat, v.lon);
    if (d < bestD) {
      bestD = d;
      best = v;
    }
  }
  return best;
}

/**
 * Construit un JeuMontana pour une ville + période de retour.
 * Plage « long » (1 h–24 h) par défaut = référence pour les volumes GEP ;
 * bascule sur « court » (6–60 min) si une durée cible < 60 min est fournie.
 */
export function jeuMontana(
  ville: VilleMontana,
  periodeRetour: number,
  dureeCibleMin?: number
): JeuMontana | null {
  const c = ville.coefficients[String(periodeRetour)];
  if (!c) return null;
  const useCourt = dureeCibleMin != null && dureeCibleMin < 60 && !!c.court;
  const r = useCourt ? c.court! : c.long ?? c.court!;
  if (!r) return null;
  return { a: r.a, b: r.b, tMinMinutes: r.tmin, tMaxMinutes: r.tmax, periodeRetour };
}

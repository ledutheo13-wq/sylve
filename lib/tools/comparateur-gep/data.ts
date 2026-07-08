import raw from "./ouvrages-gep.json";

// ═══════════════════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════════════════

export type FamilleId = "hydro" | "concept" | "paysage";

export interface Famille {
  id: FamilleId;
  nom: string;
  couleur: string;
  criteres: string[];
}

export interface Critere {
  code: string;
  nom: string;
  def: string;
}

export interface Ouvrage {
  code: string;
  nom: string;
  principe: string;
  fonctions: string;
  notes: Record<string, number>;
}

export interface ComparateurData {
  meta: { titre: string; source: string; sourceUrl?: string; echelle: string };
  familles: Famille[];
  criteres: Critere[];
  ouvrages: Ouvrage[];
}

// ═══════════════════════════════════════════════════════════
//  DATA (source de vérité : ouvrages-gep.json, valeurs figées MFE)
//  L'ordre des critères est VOULU : familles en arcs contigus sur le radar.
// ═══════════════════════════════════════════════════════════

export const comparateurData = raw as ComparateurData;

export const NOTE_MAX = 4;

/** Couleurs des courbes superposées, dans l'ordre de sélection (charte). */
export const COURBE_COLORS = ["#5E8B8F", "#A67C5B", "#C4973B"] as const;

/** Nombre max d'éléments superposables simultanément. */
export const MAX_SELECTION = 3;

/** Famille d'un critère par son code. */
export function familleOfCritere(code: string): Famille | undefined {
  return comparateurData.familles.find((f) => f.criteres.includes(code));
}

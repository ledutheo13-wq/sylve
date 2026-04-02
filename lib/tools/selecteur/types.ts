import type { Plante } from "@/types/plantes";

/** Active filter state */
export interface FilterState {
  strate: string[];
  exposition: string[];
  besoinsHydriques: string[];
  typeSol: string[];
  phSol: string[];
  humiditeSol: string[];
  persistance: string[];
  mellifere: boolean;
  indigenat: boolean;
  bioregion: "atlantique" | "continental" | "mediterraneen" | "alpin";
  rusticite: number;
  heightMin: number;
  heightMax: number;
  floraDebut: string;
  floraFin: string;
  couleurFloraison: string[];
  famille: string;
}

export type SortMode = "strate" | "alpha" | "rusticite" | "floraison";

/** A named group of essences in the palette */
export interface Melange {
  id: string;
  name: string;
  essenceIds: string[];
}

/** Pill filter definition */
export interface PillFilterDef {
  key: string;
  label: string;
  values: { value: string; label: string }[];
}

/** Export group for PNG generation */
export interface ExportGroup {
  name: string;
  ids: string[];
}

/** Color category mapping */
export type ColorCategoryMap = Record<string, string[]>;

/** Bioregion key type */
export type BioregionKey = keyof Plante["indigenat"];

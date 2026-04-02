import type { Plante } from "@/types/plantes";

/** A slot in the essences list: either a validated plant or null (empty) */
export type EssenceSlot = Plante | null;

/** Bioregion identifier */
export type Bioregion = "atlantique" | "continental" | "mediterraneen" | "alpin";

/** Scoring criterion key */
export type CriterionKey =
  | "exposition"
  | "besoins_hydriques"
  | "type_sol"
  | "ph_sol"
  | "humidite_sol";

/** Criterion configuration for scoring */
export interface CriterionConfig {
  key: CriterionKey;
  gradient: Record<string, number>;
  max: number;
  type: "array" | "string";
}

/** Per-criterion score detail */
export interface ScoreDetail {
  key: CriterionKey;
  label: string;
  score: number; // 0-100
}

/** Alert for a problematic plant */
export interface CompatAlert {
  plantIndex: number;
  plantName: string;
  criterion: CriterionKey;
  criterionLabel: string;
  message: string;
}

/** Full scoring result */
export interface CompatResult {
  globalScore: number; // 0-100
  criteriaScores: Record<CriterionKey, number>; // each 0-100
  alerts: CompatAlert[];
}

/** Advanced mode per-plant quantitative data */
export interface QuantRow {
  plant: Plante;
  pct: number;
  qty: number;
  effDensity: number | null;
}

/** Mix information */
export interface MixInfo {
  name: string;
  postalCode: string;
  bioregion: Bioregion | "";
}

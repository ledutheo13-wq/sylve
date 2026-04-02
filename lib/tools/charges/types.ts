export type MaterialType = "forfait" | "volumique";

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  value: number;
  min_ep?: number;
  max_ep?: number;
  default_ep?: number;
}

export interface Category {
  label: string;
  color: string;
  pattern: string;
  materials: Material[];
}

export type CategoryKey =
  | "protection"
  | "retention"
  | "drainage"
  | "filtration"
  | "substrat"
  | "paillage"
  | "vegetation";

export type Categories = Record<CategoryKey, Category>;

export interface Layer {
  id: number;
  catKey: CategoryKey;
  matId: string;
  thickness: number | null;
  customDensity: number | null;
  open: boolean;
}

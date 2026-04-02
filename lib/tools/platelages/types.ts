export interface Usage {
  label: string;
  qRep: number;
  qConc: number;
  desc: string;
}

export interface EssenceBois {
  name: string;
  classe: string;
  emploi: string;
  densite: number;
  exotique: boolean;
}

export type UsageKey = "S1" | "S2" | "S3";
export type EpaisseursKey = "21-23" | "24-27" | "28-32" | "33-39" | "40-45";
export type LargeurKey = 90 | 120 | 140;

export interface LambourdeRow {
  h_min: number;
  C18: number | null;
  C24: number | null;
  D18: number | null;
  D24: number | null;
  D30: number | null;
  D35: number | null;
  D40: number | null;
  D45_40: number | null;
  D45_45: number | null;
  D50: number | null;
}

export interface LameClasseValues {
  C18: number | null;
  C24: number | null;
  D18: number | null;
  D24: number | null;
  D30: number | null;
  D35: number | null;
  D40: number | null;
  D45: number | null;
  D50: number | null;
}

export interface ComputeResult {
  usage: UsageKey;
  epLames: EpaisseursKey;
  largLames: LargeurKey;
  classeLames: string;
  classeLamb: string;
  densiteLames: number;
  bLamb: number;
  hLamb: number;
  entraxeReel: number;
  entraxeMaxLamb: number | null;
  entraxeMaxLames: number | null;
  verdict: { color: string; bg: string; label: string } | null;
  visMin: number;
  prePercage: string;
  nbAppuis: number;
  conception: "courante" | "elaboree";
}

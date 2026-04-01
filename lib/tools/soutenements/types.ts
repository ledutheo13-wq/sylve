export interface WallType {
  name: string;
  epCm: number;
  semFactor: number | null;
  gammaMur: number;
  unit: "cm" | "mm";
  hasSemelle: boolean;
  fiche: boolean;
  metal?: boolean;
}

export interface SoilType {
  phi: number;
  gamma: number;
  c: number;
}

export interface ComputeResult {
  type: WallType;
  idx: number;
  H: number;
  e: number;
  L: number;
  phi: number;
  gammaSol: number;
  c: number;
  q: number;
  gammaMur: number;
  blocked: boolean;
  Ka: number;
  Pa_sol: number;
  Pa_q: number;
  Pa_total: number;
  y: number;
  Md: number;
  Ms: number;
  Fs_r: number | null;
  Fs_g: number | null;
  Fs_min: number | null;
  epRaw: number;
  Wmur: number;
  Wsem: number;
  Wterre: number;
  N: number;
  eSem: number;
}

export interface Verdict {
  color: string;
  bg: string;
  label: string;
}

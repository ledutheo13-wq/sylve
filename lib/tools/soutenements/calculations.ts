import type { WallType, ComputeResult, Verdict } from "./types";

export function compute(params: {
  type: WallType;
  idx: number;
  H: number;
  epRaw: number;
  L: number;
  phi: number;
  gammaSol: number;
  c: number;
  q: number;
}): ComputeResult {
  const { type: t, idx, H, epRaw, L, phi, gammaSol, c, q } = params;
  const gammaMur = t.gammaMur;
  const blocked = H > 2.0;
  const isMetallique = !!t.metal || t.fiche;

  // Conversion en metres
  const e = t.unit === "mm" ? epRaw / 1000 : epRaw / 100;

  // Epaisseur semelle
  const eSem = isMetallique ? e : 0.15;

  // 1. Poussee active
  const phiRad = (phi * Math.PI) / 180;
  const Ka = Math.pow(Math.tan(Math.PI / 4 - phiRad / 2), 2);

  const Pa_sol = 0.5 * Ka * gammaSol * H * H;
  const Pa_q = Ka * q * H;
  const Pa_total = Pa_sol + Pa_q;

  // Moment destabilisant
  const Md = Pa_sol * (H / 3) + Pa_q * (H / 2);

  // Point d'application
  const y = Pa_total > 0 ? Md / Pa_total : H / 3;

  // 2. Forces stabilisantes
  let Fs_r: number | null = null;
  let Fs_g: number | null = null;
  let Ms = 0;
  let Wmur = 0;
  let Wsem = 0;
  let Wterre = 0;
  let N = 0;

  if (!t.fiche && !blocked) {
    Wmur = gammaMur * e * H;
    const brasMur = e / 2;

    Wsem = gammaMur * L * eSem;
    const brasSem = L / 2;

    const L_terre = Math.max(L - e, 0);
    Wterre = gammaSol * H * L_terre;
    const brasTerre = e + L_terre / 2;

    Ms = Wmur * brasMur + Wsem * brasSem + Wterre * brasTerre;
    N = Wmur + Wsem + Wterre;

    Fs_r = Md > 0 ? Ms / Md : 99;

    const delta = (2 / 3) * phiRad;
    const resistance = N * Math.tan(delta) + c * L;
    Fs_g = Pa_total > 0 ? resistance / Pa_total : 99;
  }

  const Fs_min =
    Fs_r !== null && Fs_g !== null ? Math.min(Fs_r, Fs_g) : null;

  return {
    type: t,
    idx,
    H,
    e,
    L,
    phi,
    gammaSol,
    c,
    q,
    gammaMur,
    blocked,
    Ka,
    Pa_sol,
    Pa_q,
    Pa_total,
    y,
    Md,
    Ms,
    Fs_r,
    Fs_g,
    Fs_min,
    epRaw,
    Wmur,
    Wsem,
    Wterre,
    N,
    eSem,
  };
}

export function getVerdict(fs: number): Verdict {
  if (fs > 3.0)
    return {
      color: "#3B82F6",
      bg: "rgba(59,130,246,0.1)",
      label: "Surdimensionne — pourrait etre optimise",
    };
  if (fs >= 1.5)
    return {
      color: "#10B981",
      bg: "rgba(16,185,129,0.1)",
      label: "Conforme — dimensionnement adapte",
    };
  if (fs >= 1.2)
    return {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
      label: "Vigilance — marge de securite faible",
    };
  return {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.1)",
    label: "A risque — dimensionnement insuffisant",
  };
}

export function getFsColor(fs: number): string {
  if (fs > 3.0) return "#3B82F6";
  if (fs >= 1.5) return "#10B981";
  if (fs >= 1.2) return "#F59E0B";
  return "#EF4444";
}

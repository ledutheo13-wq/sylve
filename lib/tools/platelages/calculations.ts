import { lambourdesTables, lamesTables, USAGES, essencesLames } from "./constants";
import type { UsageKey, EpaisseursKey, LargeurKey, LambourdeRow, ComputeResult } from "./types";

function getClasseKey(classeStr: string): string {
  return classeStr.trim().toUpperCase();
}

function lookupInRow(row: LambourdeRow, classeLamb: string, bLamb: number): number | null {
  const cl = getClasseKey(classeLamb);
  if (cl === "D45") {
    const key = bLamb >= 45 ? "D45_45" : "D45_40";
    return row[key as keyof LambourdeRow] as number | null;
  }
  return (row[cl as keyof LambourdeRow] as number | null) ?? null;
}

export function lookupLambourdes(
  usage: UsageKey,
  epLames: string,
  classeLamb: string,
  hLamb: number,
  bLamb: number
): number | null {
  const table = lambourdesTables[usage];
  if (!table) return null;

  const row = table[epLames];
  if (!row) return null;

  if (hLamb < row.h_min) {
    const row55 = table[epLames + "_55"];
    if (row55 && hLamb >= row55.h_min) {
      return lookupInRow(row55, classeLamb, bLamb);
    }
    return null;
  }

  if (hLamb >= 55) {
    const row55 = table[epLames + "_55"];
    if (row55) return lookupInRow(row55, classeLamb, bLamb);
  }

  return lookupInRow(row, classeLamb, bLamb);
}

export function lookupLames(
  usage: UsageKey,
  epLames: string,
  largLames: number,
  classeLames: string
): number | null {
  const table = lamesTables[usage];
  if (!table) return null;

  const epRow = table[epLames];
  if (!epRow) return null;

  const largRow = epRow[largLames];
  if (!largRow) return null;

  const cl = getClasseKey(classeLames);
  return (largRow[cl as keyof typeof largRow] as number | null) ?? null;
}

export function getEpMid(epStr: string): number {
  const parts = epStr.split("-").map(Number);
  return Math.round((parts[0] + parts[1]) / 2);
}

export function compute(params: {
  usage: UsageKey;
  epLames: EpaisseursKey;
  largLames: LargeurKey;
  essLamesIdx: number;
  essLambIdx: number;
  classeLamesOverride: string;
  densiteLames: number;
  sectionStr: string;
  entraxeReel: number;
  nbAppuis: number;
  conception: "courante" | "elaboree";
}): ComputeResult {
  const {
    usage, epLames, largLames, essLamesIdx, essLambIdx,
    classeLamesOverride, densiteLames, sectionStr, entraxeReel,
    nbAppuis, conception,
  } = params;

  const essLames = essencesLames[essLamesIdx];
  const essLamb = essencesLames[essLambIdx];

  const classeLames = (essLames.classe || classeLamesOverride).trim().toUpperCase();
  const classeLamb = (essLamb.classe || classeLamesOverride).trim().toUpperCase();

  const [bLamb, hLamb] = sectionStr.split("x").map(Number);

  let entraxeMaxLamb = lookupLambourdes(usage, epLames, classeLamb, hLamb, bLamb);
  let entraxeMaxLames = lookupLames(usage, epLames, largLames, classeLames);

  // Apply 2-appuis reduction
  if (nbAppuis === 2) {
    if (entraxeMaxLamb !== null) entraxeMaxLamb = Math.round(entraxeMaxLamb * 0.75);
    if (entraxeMaxLames !== null) entraxeMaxLames = Math.round(entraxeMaxLames * 0.85);
  }

  // Verdict
  let verdict: ComputeResult["verdict"] = null;
  if (entraxeReel > 0 && entraxeMaxLamb !== null) {
    const ratio = entraxeReel / entraxeMaxLamb;
    if (ratio > 1) {
      verdict = { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "Non conforme DTU 51.4 — entraxe trop grand" };
    } else if (ratio > 0.9) {
      verdict = { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Limite — marge de securite faible" };
    } else if (ratio > 0.6) {
      verdict = { color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "Conforme DTU 51.4" };
    } else {
      verdict = { color: "#3B82F6", bg: "rgba(59,130,246,0.1)", label: "Surdimensionne — pourrait etre optimise" };
    }
  }

  // Prescriptions
  const epMid = getEpMid(epLames);
  const visMin = epMid <= 27 && densiteLames < 600 ? 5 : 6;
  const isFeuillu = classeLames.startsWith("D");
  const prePercage = isFeuillu ? "Partout" : "En extremite uniquement";

  return {
    usage, epLames, largLames, classeLames, classeLamb, densiteLames,
    bLamb, hLamb, entraxeReel,
    entraxeMaxLamb, entraxeMaxLames,
    verdict, visMin, prePercage, nbAppuis, conception,
  };
}

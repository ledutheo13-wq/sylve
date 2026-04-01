import type { WallType, SoilType } from "./types";

export const TYPES: WallType[] = [
  { name: "L beton prefabrique", epCm: 15, semFactor: 0.6, gammaMur: 25, unit: "cm", hasSemelle: true, fiche: false },
  { name: "Voile beton coule en place", epCm: 20, semFactor: 0.7, gammaMur: 25, unit: "cm", hasSemelle: true, fiche: false },
  { name: "Parpaings 20 cm", epCm: 20, semFactor: 0.5, gammaMur: 20, unit: "cm", hasSemelle: true, fiche: false },
  { name: "Parpaings 10 cm", epCm: 10, semFactor: 0.4, gammaMur: 20, unit: "cm", hasSemelle: true, fiche: false },
  { name: "Volige acier + semelle", epCm: 0.3, semFactor: 0.5, gammaMur: 78, unit: "mm", hasSemelle: true, fiche: false, metal: true },
  { name: "Volige alu + semelle", epCm: 0.3, semFactor: 0.5, gammaMur: 27, unit: "mm", hasSemelle: true, fiche: false, metal: true },
  { name: "Volige acier fichee", epCm: 0.5, semFactor: null, gammaMur: 78, unit: "mm", hasSemelle: false, fiche: true },
  { name: "Bac acier / bac fibres", epCm: 0.3, semFactor: null, gammaMur: 50, unit: "mm", hasSemelle: false, fiche: true },
];

export const SOLS: SoilType[] = [
  { phi: 35, gamma: 20, c: 0 },
  { phi: 30, gamma: 18, c: 0 },
  { phi: 25, gamma: 18, c: 5 },
  { phi: 20, gamma: 19, c: 10 },
];

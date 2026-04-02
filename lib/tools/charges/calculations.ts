import type { Layer } from "./types";
import { getMat } from "./materials";

const THIN_CATEGORIES = ["protection", "filtration"];

export function getLayerWeight(layer: Layer): number {
  const mat = getMat(layer);
  const density = layer.customDensity !== null ? layer.customDensity : mat.value;
  if (mat.type === "forfait") return density;
  const ep = layer.thickness || (mat.default_ep || 0);
  return (density * ep) / 100;
}

export function getTotalWeight(layers: Layer[]): number {
  return layers.reduce((sum, l) => sum + getLayerWeight(l), 0);
}

export function getTotalThickness(layers: Layer[]): number {
  return layers.reduce((sum, l) => {
    const mat = getMat(l);
    if (THIN_CATEGORIES.includes(l.catKey)) return sum;
    return sum + (mat.type === "volumique" ? (l.thickness || 0) : 8);
  }, 0);
}

export function getLayerDisplayH(
  layer: Layer,
  totalVisualH: number,
  totalT: number
): number {
  if (totalT === 0) return 0;
  if (THIN_CATEGORIES.includes(layer.catKey)) return 4;
  const mat = getMat(layer);
  const visualEp = mat.type === "volumique" ? (layer.thickness || 0) : 8;
  return (visualEp / totalT) * totalVisualH;
}

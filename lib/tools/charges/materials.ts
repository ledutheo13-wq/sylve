import type { Categories, CategoryKey, Material, Layer } from "./types";

export const CATEGORIES: Categories = {
  protection: {
    label: "Protection mecanique",
    color: "#C4B8A8",
    pattern: "dots",
    materials: [
      { id: "feutre-ap", name: "Feutre anti-poinconnement", type: "forfait", value: 0.5 },
      { id: "film-pe", name: "Film PE de protection", type: "forfait", value: 0.15 },
      { id: "natte-abs", name: "Natte absorbante", type: "forfait", value: 0.3 },
    ],
  },
  retention: {
    label: "Retention / stockage eau",
    color: "#6CA0B8",
    pattern: "waves",
    materials: [
      { id: "hydro-2", name: "Hydro-retenteur 2 cm", type: "volumique", value: 750, min_ep: 2, max_ep: 2, default_ep: 2 },
      { id: "hydro-4", name: "Hydro-retenteur 4 cm", type: "volumique", value: 750, min_ep: 4, max_ep: 4, default_ep: 4 },
      { id: "hydro-8", name: "Hydro-retenteur 8 cm", type: "volumique", value: 750, min_ep: 8, max_ep: 8, default_ep: 8 },
      { id: "hydro-12", name: "Hydro-retenteur 12 cm", type: "volumique", value: 750, min_ep: 12, max_ep: 12, default_ep: 12 },
    ],
  },
  drainage: {
    label: "Drainage",
    color: "#8FAFC7",
    pattern: "honeycomb",
    materials: [
      { id: "nid-abeille", name: "Nid d'abeille HDPE (gravier)", type: "volumique", value: 100, min_ep: 4, max_ep: 20, default_ep: 6 },
      { id: "billes-argile", name: "Billes d'argile expansee", type: "volumique", value: 420, min_ep: 5, max_ep: 30, default_ep: 8 },
      { id: "gravier", name: "Gravier 20/40", type: "volumique", value: 1700, min_ep: 5, max_ep: 30, default_ep: 8 },
      { id: "panneau-drainant", name: "Panneau drainant composite", type: "forfait", value: 8 },
      { id: "pouzzolane", name: "Pouzzolane", type: "volumique", value: 900, min_ep: 5, max_ep: 30, default_ep: 8 },
    ],
  },
  filtration: {
    label: "Filtration",
    color: "#B8C9A3",
    pattern: "lines",
    materials: [
      { id: "geotextile", name: "Geotextile filtrant", type: "forfait", value: 0.35 },
      { id: "nappe-sep", name: "Nappe de separation", type: "forfait", value: 0.2 },
    ],
  },
  substrat: {
    label: "Substrat / Terre",
    color: "#A67C5B",
    pattern: "granular",
    materials: [
      { id: "substrat-ext", name: "Substrat extensif", type: "volumique", value: 1050, min_ep: 5, max_ep: 30, default_ep: 8 },
      { id: "substrat-semi", name: "Substrat semi-intensif", type: "volumique", value: 1250, min_ep: 10, max_ep: 50, default_ep: 20 },
      { id: "substrat-int", name: "Substrat intensif", type: "volumique", value: 1450, min_ep: 15, max_ep: 80, default_ep: 30 },
      { id: "terre-veg", name: "Terre vegetale amendee", type: "volumique", value: 1750, min_ep: 15, max_ep: 100, default_ep: 40 },
      { id: "terre-alleg", name: "Terre vegetale allegee", type: "volumique", value: 1350, min_ep: 15, max_ep: 80, default_ep: 30 },
    ],
  },
  paillage: {
    label: "Paillage",
    color: "#C4A882",
    pattern: "organic",
    materials: [
      { id: "paillage-org", name: "Paillage organique (ecorce)", type: "volumique", value: 450, min_ep: 3, max_ep: 15, default_ep: 7 },
      { id: "paillage-min", name: "Paillage mineral (gravier)", type: "volumique", value: 1500, min_ep: 3, max_ep: 10, default_ep: 5 },
      { id: "paillage-bois", name: "Plaquettes de bois", type: "volumique", value: 300, min_ep: 5, max_ep: 15, default_ep: 7 },
    ],
  },
  vegetation: {
    label: "Vegetation",
    color: "#6B9E6B",
    pattern: "organic2",
    materials: [
      { id: "sedum", name: "Sedum / extensif", type: "forfait", value: 3.5 },
      { id: "vivaces", name: "Vivaces et graminees", type: "forfait", value: 5.5 },
      { id: "arbustes", name: "Arbustes", type: "forfait", value: 10 },
      { id: "gazon", name: "Gazon", type: "forfait", value: 4 },
    ],
  },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES) as CategoryKey[];

export function getMat(layer: Layer): Material {
  const cat = CATEGORIES[layer.catKey];
  return cat.materials.find((m) => m.id === layer.matId) || cat.materials[0];
}

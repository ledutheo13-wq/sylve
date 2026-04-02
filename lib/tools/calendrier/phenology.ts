// ═══════════════════════════════════════════════════════════
//  STRATE ORDERING & LABELS
// ═══════════════════════════════════════════════════════════

export const STRATE_ORDER = [
  "arbre_grand",
  "arbre_moyen",
  "arbre_petit",
  "arbuste",
  "grimpante",
  "vivace",
  "graminee",
  "fougere",
  "couvre_sol",
  "bulbe",
  "aquatique",
] as const;

export const STRATE_LABELS: Record<string, string> = {
  arbre_grand: "Arbre (grand)",
  arbre_moyen: "Arbre (moyen)",
  arbre_petit: "Arbre (petit)",
  arbuste: "Arbuste",
  sous_arbuste: "Sous-arbuste",
  grimpante: "Grimpante",
  vivace: "Vivace",
  graminee: "Graminee",
  fougere: "Fougere",
  couvre_sol: "Couvre-sol",
  bulbe: "Bulbe",
  bambou: "Bambou",
  palmier: "Palmier",
  aquatique: "Aquatique",
};

// ═══════════════════════════════════════════════════════════
//  MONTH LABELS
// ═══════════════════════════════════════════════════════════

export const MOIS_ABBREV = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];

export const MOIS_NOMS = [
  "Janvier",
  "Fevrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Septembre",
  "Octobre",
  "Novembre",
  "Decembre",
];

// ═══════════════════════════════════════════════════════════
//  FLOWER COLOR PARSER
// ═══════════════════════════════════════════════════════════

const BASE_COLORS: Record<string, string> = {
  blanc: "#F5F0EB",
  creme: "#FDF5E6",
  "cr\ème": "#FDF5E6",
  ivoire: "#FFFFF0",
  jaune: "#F0D060",
  citron: "#F5E050",
  or: "#DAA520",
  "dor\é": "#C5A55A",
  orange: "#E8863A",
  abricot: "#FBCEB1",
  apricot: "#FBCEB1",
  "p\êche": "#FFDAB9",
  saumon: "#FA8072",
  rouge: "#C44040",
  "\écarlate": "#FF2400",
  magenta: "#C71585",
  "carmin\é": "#960018",
  rose: "#E8A0B0",
  mauve: "#B08CB0",
  violet: "#7B5EA7",
  indigo: "#4B0082",
  pourpre: "#800080",
  lilas: "#C8A2C8",
  lavande: "#B57EDC",
  "am\éthyste": "#9966CC",
  bleu: "#6A8EB0",
  cobalt: "#0047AB",
  vert: "#6B8E6B",
  brun: "#8B6F47",
  marron: "#6B4226",
  bronze: "#CD7F32",
  rouille: "#B7410E",
  beige: "#D4C5A9",
  gris: "#A0A0A0",
  "argent\é": "#C0C0C0",
  argent: "#C0C0C0",
  noir: "#3D3D3D",
  multiple: "#B08CB0",
};

const MODIFIERS: Record<string, number> = {
  "p\âle": 0.3,
  pale: 0.3,
  clair: 0.25,
  tendre: 0.2,
  "ros\é": 0.15,
  vif: 0.0,
  "fonc\é": -0.3,
  fonce: -0.3,
  sombre: -0.25,
  profond: -0.2,
};

function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const adjust = (c: number) => {
    if (factor > 0) return Math.round(c + (255 - c) * factor);
    return Math.round(c * (1 + factor));
  };

  const rr = Math.min(255, Math.max(0, adjust(r)));
  const gg = Math.min(255, Math.max(0, adjust(g)));
  const bb = Math.min(255, Math.max(0, adjust(b)));

  return (
    "#" +
    [rr, gg, bb].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}

export function parseCouleurFloraison(
  couleurTexte: string | string[] | null
): string | null {
  if (!couleurTexte) return null;
  let text: string;
  if (Array.isArray(couleurTexte)) {
    text = couleurTexte[0];
  } else {
    text = couleurTexte;
  }
  if (!text) return null;

  const normalized = text
    .toLowerCase()
    .replace(/[-_,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let modifier = 0;
  for (const [mod, value] of Object.entries(MODIFIERS)) {
    if (normalized.includes(mod)) {
      modifier = value;
      break;
    }
  }

  let foundColor: string | null = null;
  for (const word of normalized.split(" ")) {
    const clean = word.normalize("NFD").replace(/[\̀-\ͯ]/g, "");
    for (const [key, hex] of Object.entries(BASE_COLORS)) {
      const keyClean = key.normalize("NFD").replace(/[\̀-\ͯ]/g, "");
      if (clean === keyClean || word === key) {
        foundColor = hex;
        break;
      }
    }
    if (foundColor) break;
  }

  if (!foundColor) return "#5E8B8F";

  if (modifier !== 0) {
    return adjustBrightness(foundColor, modifier);
  }

  return foundColor;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// ═══════════════════════════════════════════════════════════
//  SEARCH NORMALIZATION
// ═══════════════════════════════════════════════════════════

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\̀-\ͯ]/g, "");
}

// ═══════════════════════════════════════════════════════════
//  PERSISTENCE HELPERS
// ═══════════════════════════════════════════════════════════

export function getPersistanceBadgeClass(persistance: string): string {
  const persLow = (persistance || "").toLowerCase();
  if (persLow.startsWith("caduc") || persLow === "annuelle") return "caduc";
  if (persLow.startsWith("semi-persistant")) return "semiPersistant";
  return "persistant";
}

export function isPersistant(persistance: string): boolean {
  const pers = (persistance || "").toLowerCase();
  return pers.startsWith("persistant") || pers.startsWith("semi-persistant");
}

export const MAX_ESSENCES = 25;

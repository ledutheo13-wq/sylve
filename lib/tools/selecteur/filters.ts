import type { Plante } from "@/types/plantes";
import type { FilterState, SortMode, PillFilterDef, ColorCategoryMap } from "./types";

// ─── Filter definitions ───

export const STRATE_OPTIONS: PillFilterDef = {
  key: "strate",
  label: "Strate",
  values: [
    { value: "arbre_grand", label: "arbre_grand" },
    { value: "arbre_moyen", label: "arbre_moyen" },
    { value: "arbre_petit", label: "arbre_petit" },
    { value: "arbuste", label: "arbuste" },
    { value: "grimpante", label: "grimpante" },
    { value: "vivace", label: "vivace" },
    { value: "graminée", label: "graminée" },
    { value: "fougère", label: "fougère" },
    { value: "couvre-sol", label: "couvre-sol" },
    { value: "bulbe", label: "bulbe" },
    { value: "aquatique", label: "aquatique" },
  ],
};

export const EXPOSITION_OPTIONS: PillFilterDef = {
  key: "exposition",
  label: "Exposition",
  values: [
    { value: "soleil", label: "Soleil" },
    { value: "mi-ombre", label: "Mi-ombre" },
    { value: "ombre", label: "Ombre" },
  ],
};

export const BESOINS_HYDRIQUES_OPTIONS: PillFilterDef = {
  key: "besoinsHydriques",
  label: "Besoins hydriques",
  values: [
    { value: "faible", label: "Faible" },
    { value: "moyen", label: "Moyen" },
    { value: "fort", label: "Fort" },
  ],
};

export const TYPE_SOL_OPTIONS: PillFilterDef = {
  key: "typeSol",
  label: "Type de sol",
  values: [
    { value: "sableux", label: "Sableux" },
    { value: "limoneux", label: "Limoneux" },
    { value: "argileux", label: "Argileux" },
    { value: "calcaire", label: "Calcaire" },
    { value: "humifère", label: "Humifère" },
  ],
};

export const PH_SOL_OPTIONS: PillFilterDef = {
  key: "phSol",
  label: "pH du sol",
  values: [
    { value: "acide", label: "Acide" },
    { value: "neutre", label: "Neutre" },
    { value: "calcaire", label: "Calcaire" },
  ],
};

export const HUMIDITE_SOL_OPTIONS: PillFilterDef = {
  key: "humiditeSol",
  label: "Humidité du sol",
  values: [
    { value: "sec", label: "Sec" },
    { value: "frais", label: "Frais" },
    { value: "humide", label: "Humide" },
    { value: "détrempé", label: "Détrempé" },
  ],
};

export const PERSISTANCE_OPTIONS: PillFilterDef = {
  key: "persistance",
  label: "Persistance",
  values: [
    { value: "persistant", label: "Persistant" },
    { value: "caduc", label: "Caduc" },
    { value: "semi-persistant", label: "Semi-persistant" },
  ],
};

export const MELLIFERE_OPTIONS: PillFilterDef = {
  key: "mellifere",
  label: "Mellifère",
  values: [{ value: "true", label: "Mellifère uniquement" }],
};

export const COULEUR_FLORAISON_OPTIONS: PillFilterDef = {
  key: "couleurFloraison",
  label: "Couleur de floraison",
  values: [
    { value: "blanc", label: "Blanc" },
    { value: "jaune", label: "Jaune" },
    { value: "orange", label: "Orange" },
    { value: "rose", label: "Rose" },
    { value: "rouge", label: "Rouge" },
    { value: "bleu", label: "Bleu" },
    { value: "violet", label: "Violet" },
    { value: "mauve", label: "Mauve" },
    { value: "vert", label: "Vert" },
  ],
};

// ─── Month names ───

export const MOIS = [
  "",
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

export const MOIS_SELECT = [
  { value: "1", label: "Janvier" },
  { value: "2", label: "Février" },
  { value: "3", label: "Mars" },
  { value: "4", label: "Avril" },
  { value: "5", label: "Mai" },
  { value: "6", label: "Juin" },
  { value: "7", label: "Juillet" },
  { value: "8", label: "Août" },
  { value: "9", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

// ─── Strate order (for sorting) ───

export const STRATE_ORDER = [
  "arbre_grand",
  "arbre_moyen",
  "arbre_petit",
  "arbuste",
  "grimpante",
  "vivace",
  "graminée",
  "fougère",
  "couvre-sol",
  "bulbe",
  "aquatique",
];

// ─── Color parsing ───

const BASE_COLORS: Record<string, string> = {
  blanc: "#F5F0EB",
  crème: "#FDF5E6",
  creme: "#FDF5E6",
  ivoire: "#FFFFF0",
  jaune: "#F0D060",
  citron: "#F5E050",
  or: "#DAA520",
  doré: "#C5A55A",
  orange: "#E8863A",
  abricot: "#FBCEB1",
  apricot: "#FBCEB1",
  pêche: "#FFDAB9",
  saumon: "#FA8072",
  rouge: "#C44040",
  écarlate: "#FF2400",
  magenta: "#C71585",
  carminé: "#960018",
  rose: "#E8A0B0",
  mauve: "#B08CB0",
  violet: "#7B5EA7",
  indigo: "#4B0082",
  pourpre: "#800080",
  lilas: "#C8A2C8",
  lavande: "#B57EDC",
  améthyste: "#9966CC",
  bleu: "#6A8EB0",
  cobalt: "#0047AB",
  vert: "#6B8E6B",
  brun: "#8B6F47",
  marron: "#6B4226",
  bronze: "#CD7F32",
  rouille: "#B7410E",
  beige: "#D4C5A9",
  gris: "#A0A0A0",
  argenté: "#C0C0C0",
  argent: "#C0C0C0",
  noir: "#3D3D3D",
  multiple: "#B08CB0",
};

const MODIFIERS: Record<string, number> = {
  pâle: 0.3,
  pale: 0.3,
  clair: 0.25,
  tendre: 0.2,
  rosé: 0.15,
  vif: 0.0,
  foncé: -0.3,
  fonce: -0.3,
  sombre: -0.25,
  profond: -0.2,
};

const CATEGORIES_COULEUR: ColorCategoryMap = {
  blanc: ["blanc", "crème", "creme", "ivoire", "argenté", "argent"],
  jaune: ["jaune", "citron", "or", "doré"],
  orange: ["orange", "abricot", "apricot", "pêche", "saumon", "bronze", "rouille"],
  rose: ["rose", "magenta", "carminé"],
  rouge: ["rouge", "écarlate"],
  bleu: ["bleu", "cobalt"],
  violet: ["violet", "indigo", "pourpre", "lilas", "lavande", "améthyste"],
  mauve: ["mauve"],
  vert: ["vert"],
};

// ─── Utility functions ───

export function norm(s: string | null | undefined): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normExpo(e: string): string {
  const n = norm(e).replace(/_/g, " ");
  if (n === "plein soleil") return "soleil";
  return n;
}

function normPersist(p: string): string {
  const n = norm(p);
  if (n === "caduque") return "caduc";
  if (n === "persistante") return "persistant";
  if (n === "semi-persistante") return "semi-persistant";
  return n;
}

export function fmtHeight(cm: number | null | undefined): string {
  if (cm == null) return "?";
  if (cm >= 100)
    return (
      (cm / 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " m"
    );
  return cm + " cm";
}

function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const adj = (c: number) =>
    factor > 0
      ? Math.round(c + (255 - c) * factor)
      : Math.round(c * (1 + factor));
  return (
    "#" +
    [adj(r), adj(g), adj(b)]
      .map((c) =>
        Math.min(255, Math.max(0, c))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

export function parseCouleurFloraison(
  couleurTexte: string | null | undefined
): string | null {
  if (!couleurTexte) return null;
  let text = couleurTexte;
  if (Array.isArray(text)) text = text[0];
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
    const clean = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const [key, hex] of Object.entries(BASE_COLORS)) {
      const keyClean = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (clean === keyClean || word === key) {
        foundColor = hex;
        break;
      }
    }
    if (foundColor) break;
  }
  if (!foundColor) return "#5E8B8F";
  return modifier !== 0 ? adjustBrightness(foundColor, modifier) : foundColor;
}

export function getCategoriesCouleur(
  couleurTexte: string | null | undefined
): string[] {
  if (!couleurTexte) return [];
  let text = couleurTexte;
  if (Array.isArray(text)) text = text[0];
  if (!text) return [];
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_,]/g, " ");
  const categories: string[] = [];
  for (const [cat, mots] of Object.entries(CATEGORIES_COULEUR)) {
    for (const mot of mots) {
      const motClean = mot.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(motClean)) {
        categories.push(cat);
        break;
      }
    }
  }
  return categories.length > 0 ? categories : ["autre"];
}

// ─── Floraison overlap check ───

function floraisonChevauche(
  essDebut: number | null,
  essFin: number | null,
  filtreDebut: number,
  filtreFin: number
): boolean {
  if (!essDebut || !essFin) return false;
  function moisDansPlage(d: number, f: number): number[] {
    const m: number[] = [];
    if (d <= f) {
      for (let i = d; i <= f; i++) m.push(i);
    } else {
      for (let i = d; i <= 12; i++) m.push(i);
      for (let i = 1; i <= f; i++) m.push(i);
    }
    return m;
  }
  return moisDansPlage(essDebut, essFin).some((m) =>
    moisDansPlage(filtreDebut, filtreFin).includes(m)
  );
}

// ─── Build color category cache ───

export function buildColorCatCache(
  plantes: Plante[]
): Record<string, string[]> {
  const cache: Record<string, string[]> = {};
  plantes.forEach((p) => {
    cache[p.id] = getCategoriesCouleur(p.couleur_floraison);
  });
  return cache;
}

// ─── Build family list ───

export function buildFamilyList(plantes: Plante[]): string[] {
  const s = new Set<string>();
  plantes.forEach((p) => {
    if (p.famille) s.add(p.famille);
  });
  return [...s].sort();
}

// ─── Default filter state ───

export function getDefaultFilters(): FilterState {
  return {
    strate: [],
    exposition: [],
    besoinsHydriques: [],
    typeSol: [],
    phSol: [],
    humiditeSol: [],
    persistance: [],
    mellifere: false,
    indigenat: false,
    bioregion: "atlantique",
    rusticite: 0,
    heightMin: 0,
    heightMax: 5000,
    floraDebut: "",
    floraFin: "",
    couleurFloraison: [],
    famille: "",
  };
}

// ─── Main filter function ───

export function filterPlantes(
  plantes: Plante[],
  filters: FilterState,
  colorCatCache: Record<string, string[]>
): Plante[] {
  return plantes.filter((p) => {
    if (
      filters.strate.length &&
      !filters.strate.some((f) => norm(f) === norm(p.strate))
    )
      return false;

    if (filters.exposition.length) {
      const pExp = (p.exposition || []).map((e) => normExpo(e));
      if (!filters.exposition.some((f) => pExp.includes(norm(f)))) return false;
    }

    if (filters.besoinsHydriques.length) {
      if (
        !filters.besoinsHydriques.includes(norm(p.besoins_hydriques || ""))
      )
        return false;
    }

    if (filters.typeSol.length) {
      const pSol = (p.type_sol || []).map((s) => norm(s));
      if (!filters.typeSol.some((f) => pSol.includes(norm(f)))) return false;
    }

    if (filters.phSol.length) {
      const pPh = (p.ph_sol || []).map((s) => norm(s));
      if (!filters.phSol.some((f) => pPh.includes(norm(f)))) return false;
    }

    if (filters.humiditeSol.length) {
      const pH = (p.humidite_sol || []).map((s) => norm(s));
      if (!filters.humiditeSol.some((f) => pH.includes(norm(f)))) return false;
    }

    if (filters.rusticite < 0) {
      if (
        p.rusticite_celsius == null ||
        p.rusticite_celsius > filters.rusticite
      )
        return false;
    }

    if (filters.heightMin > 0 || filters.heightMax < 5000) {
      if (p.hauteur_max_cm == null || p.hauteur_min_cm == null) return false;
      if (
        !(
          p.hauteur_max_cm >= filters.heightMin &&
          p.hauteur_min_cm <= filters.heightMax
        )
      )
        return false;
    }

    if (filters.persistance.length) {
      if (!filters.persistance.includes(normPersist(p.persistance || "")))
        return false;
    }

    if (filters.mellifere && !p.mellifere) return false;

    if (filters.indigenat) {
      if (!p.indigenat || !p.indigenat[filters.bioregion]) return false;
    }

    if (filters.floraDebut && filters.floraFin) {
      if (
        !floraisonChevauche(
          p.floraison_debut,
          p.floraison_fin,
          parseInt(filters.floraDebut),
          parseInt(filters.floraFin)
        )
      )
        return false;
    }

    if (filters.couleurFloraison.length) {
      const cats = colorCatCache[p.id] || [];
      if (!filters.couleurFloraison.some((f) => cats.includes(f))) return false;
    }

    if (filters.famille) {
      if (!norm(p.famille || "").includes(norm(filters.famille))) return false;
    }

    return true;
  });
}

// ─── Sort function ───

export function sortPlantes(plantes: Plante[], mode: SortMode): Plante[] {
  const sorted = [...plantes];
  sorted.sort((a, b) => {
    if (mode === "strate") {
      const ia = STRATE_ORDER.findIndex((s) => norm(s) === norm(a.strate));
      const ib = STRATE_ORDER.findIndex((s) => norm(s) === norm(b.strate));
      const sa = ia === -1 ? 999 : ia;
      const sb = ib === -1 ? 999 : ib;
      if (sa !== sb) return sa - sb;
      return (a.nom_latin || "").localeCompare(b.nom_latin || "");
    }
    if (mode === "alpha")
      return (a.nom_latin || "").localeCompare(b.nom_latin || "");
    if (mode === "rusticite")
      return (a.rusticite_celsius || 0) - (b.rusticite_celsius || 0);
    if (mode === "floraison")
      return (a.floraison_debut || 13) - (b.floraison_debut || 13);
    return 0;
  });
  return sorted;
}

// ─── Exposition emoji mapping ───

export function expoEmoji(expo: string): string {
  const n = norm(expo);
  if (n === "soleil" || n === "plein soleil") return "\u2600";
  if (n === "mi-ombre") return "\u25D0";
  if (n === "ombre") return "\u25CF";
  return "";
}

// ─── Indicators for melange groups ───

export function buildIndicatorsText(
  ids: string[],
  plantes: Plante[]
): string {
  const plants = ids
    .map((id) => plantes.find((p) => p.id === id))
    .filter(Boolean) as Plante[];
  let persistant = 0;
  let caduc = 0;
  let semiP = 0;
  const allFloraMonths = new Set<number>();

  plants.forEach((p) => {
    const pers = norm(p.persistance || "");
    if (pers === "persistant") persistant++;
    else if (pers === "caduc") caduc++;
    else if (pers.includes("semi")) semiP++;
    if (p.floraison_debut && p.floraison_fin) {
      const d = p.floraison_debut;
      const f = p.floraison_fin;
      if (d <= f) {
        for (let m = d; m <= f; m++) allFloraMonths.add(m);
      } else {
        for (let m = d; m <= 12; m++) allFloraMonths.add(m);
        for (let m = 1; m <= f; m++) allFloraMonths.add(m);
      }
    }
  });

  let floraTxt = "Pas de floraison";
  if (allFloraMonths.size > 0) {
    const sorted = [...allFloraMonths].sort((a, b) => a - b);
    floraTxt =
      "Floraison : " +
      (MOIS[sorted[0]] || "?") +
      " \u2192 " +
      (MOIS[sorted[sorted.length - 1]] || "?");
  }

  const parts = [plants.length + " essences"];
  if (persistant > 0)
    parts.push(persistant + " persistante" + (persistant > 1 ? "s" : ""));
  if (caduc > 0) parts.push(caduc + " caduc" + (caduc > 1 ? "s" : ""));
  if (semiP > 0)
    parts.push(semiP + " semi-persistant" + (semiP > 1 ? "es" : "e"));
  parts.push(floraTxt);

  return parts.join(" \u00B7 ");
}

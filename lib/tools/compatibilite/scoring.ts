import type { Plante } from "@/types/plantes";
import type {
  CriterionKey,
  CriterionConfig,
  CompatResult,
  CompatAlert,
  Bioregion,
} from "./types";

// ═══════════════════════════════════════════════════════════
//  BIOREGIONS
// ═══════════════════════════════════════════════════════════

export const BIOREGIONS: Record<string, string[]> = {
  atlantique: [
    "14","22","29","35","44","50","56",
    "16","17","24","33","40","47","64","79","85","86",
    "49","53","72",
    "76","27",
    "59","62",
    "80",
  ],
  continental: [
    "02","08","10","21","25","39","51","52","54","55","57","58","67","68","70","71","88","89","90",
    "60",
    "75","77","78","91","92","93","94","95",
    "18","28","36","37","41","45",
    "01","03","42","69",
    "23","87","19","15","43","63",
    "46","12","48",
    "82","81","31","32","09","65",
    "61",
  ],
  mediterraneen: [
    "04","05","06","11","13","30","34","66","83","84",
    "07","26",
    "2A","2B",
    "971","972","973","974","976",
  ],
  alpin: ["73","74","38"],
};

export const DEPARTEMENTS_MIXTES: Record<string, string[]> = {
  "05": ["mediterraneen", "alpin"],
  "26": ["continental", "mediterraneen"],
  "07": ["continental", "mediterraneen"],
  "38": ["continental", "alpin"],
  "01": ["continental", "alpin"],
  "06": ["mediterraneen", "alpin"],
  "04": ["mediterraneen", "alpin"],
};

export const BIOREGION_LABELS: Record<string, string> = {
  atlantique: "Atlantique",
  continental: "Continental",
  mediterraneen: "Mediterran\éen",
  alpin: "Alpin",
};

export const BIOREGION_RUSTICITE: Record<string, number> = {
  atlantique: -10,
  continental: -20,
  mediterraneen: -5,
  alpin: -25,
};

export function getBioregionFromDept(dept: string): string[] {
  if (DEPARTEMENTS_MIXTES[dept]) return DEPARTEMENTS_MIXTES[dept];
  for (const [bio, depts] of Object.entries(BIOREGIONS)) {
    if (depts.includes(dept)) return [bio];
  }
  return [];
}

// ═══════════════════════════════════════════════════════════
//  GRADIENTS ORDINAUX
// ═══════════════════════════════════════════════════════════

const GRADIENT_EXPOSITION: Record<string, number> = {
  "ombre": 0, "mi-ombre": 1, "soleil": 2, "plein soleil": 2, "plein_soleil": 2,
};
const MAX_EXPOSITION = 2;

const GRADIENT_HYDRIQUES: Record<string, number> = {
  "faible": 0, "faibles": 0, "sec": 0,
  "moyen": 1, "modere": 1, "moderes": 1,
  "fort": 2, "abondant": 2, "importants": 2, "humide": 2, "eleve": 2,
};
const MAX_HYDRIQUES = 2;

const GRADIENT_SOL: Record<string, number> = {
  "sableux": 0, "caillouteux": 0, "rocheux": 0, "drainant": 0, "draine": 0,
  "bien draine": 0, "pauvre": 0, "siliceux": 0, "meuble": 0,
  "calcaire": 1, "crayeux": 1,
  "limoneux": 2, "fertile": 2, "riche": 2, "terreau": 2,
  "humifere": 3, "humide": 3, "acide": 0,
  "argileux": 4,
};
const MAX_SOL = 4;

const GRADIENT_PH: Record<string, number> = {
  "acide": 0, "neutre": 1, "calcaire": 2, "alcalin": 2, "basique": 2,
};
const MAX_PH = 2;

const GRADIENT_HUMIDITE: Record<string, number> = {
  "sec": 0, "bien_draine": 0, "frais": 1, "modere": 1, "normal": 1,
  "humide_bien_draine": 1, "humide": 2, "detrempe": 3,
};
const MAX_HUMIDITE = 3;

// ═══════════════════════════════════════════════════════════
//  COEFFICIENTS & LABELS
// ═══════════════════════════════════════════════════════════

export const COEFFICIENTS: Record<CriterionKey, number> = {
  exposition: 1.3,
  besoins_hydriques: 1.5,
  type_sol: 1.0,
  ph_sol: 0.5,
  humidite_sol: 1.5,
};

const SOMME_COEFFICIENTS = 5.8;

export const CRITERIA_LABELS: Record<CriterionKey, string> = {
  exposition: "Exposition",
  besoins_hydriques: "Besoins hydriques",
  type_sol: "Type de sol",
  ph_sol: "pH du sol",
  humidite_sol: "Humidit\é du sol",
};

const CRITERIA_CONFIG: CriterionConfig[] = [
  { key: "exposition", gradient: GRADIENT_EXPOSITION, max: MAX_EXPOSITION, type: "array" },
  { key: "besoins_hydriques", gradient: GRADIENT_HYDRIQUES, max: MAX_HYDRIQUES, type: "string" },
  { key: "type_sol", gradient: GRADIENT_SOL, max: MAX_SOL, type: "array" },
  { key: "ph_sol", gradient: GRADIENT_PH, max: MAX_PH, type: "array" },
  { key: "humidite_sol", gradient: GRADIENT_HUMIDITE, max: MAX_HUMIDITE, type: "array" },
];

// ═══════════════════════════════════════════════════════════
//  UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\̀-\ͯ]/g, "");
}

function resolveGrad(val: string | null | undefined, gradient: Record<string, number>): number | undefined {
  if (val == null) return undefined;
  const n = normalize(val).replace(/[-_]/g, " ").trim();
  if (gradient[n] !== undefined) return gradient[n];
  for (const [k, v] of Object.entries(gradient)) {
    if (normalize(k).replace(/[-_]/g, " ") === n) return v;
  }
  return undefined;
}

function parsePHNumeric(val: string): number | undefined {
  const m = val.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (!m) return undefined;
  const center = (parseFloat(m[1]) + parseFloat(m[2])) / 2;
  if (center < 6.5) return 0; // acide
  if (center <= 7.5) return 1; // neutre
  return 2; // calcaire/alcalin
}

// ═══════════════════════════════════════════════════════════
//  PAIR SCORING
// ═══════════════════════════════════════════════════════════

function scorePaireArray(
  valsA: string[],
  valsB: string[],
  gradient: Record<string, number>,
  maxDist: number,
  isPH: boolean
): number {
  const posA: number[] = [];
  const posB: number[] = [];
  const rawA: string[] = [];
  const rawB: string[] = [];

  for (const v of valsA) {
    let p = resolveGrad(v, gradient);
    if (p === undefined && isPH) p = parsePHNumeric(v);
    if (p !== undefined) { posA.push(p); rawA.push(normalize(v)); }
  }
  for (const v of valsB) {
    let p = resolveGrad(v, gradient);
    if (p === undefined && isPH) p = parsePHNumeric(v);
    if (p !== undefined) { posB.push(p); rawB.push(normalize(v)); }
  }

  if (posA.length === 0 || posB.length === 0) return 1; // missing data = neutral

  const centA = posA.reduce((a, b) => a + b, 0) / posA.length;
  const centB = posB.reduce((a, b) => a + b, 0) / posB.length;
  const distance = Math.abs(centA - centB) / maxDist;
  let score = 1 - distance;

  // Intersection penalty
  const hasCommon = rawA.some((a) => rawB.includes(a));
  if (!hasCommon) score *= 0.5;

  return score;
}

function scorePaireString(
  valA: string | undefined | null,
  valB: string | undefined | null,
  gradient: Record<string, number>,
  maxDist: number
): number {
  if (!valA || !valB) return 1;
  const posA = resolveGrad(valA, gradient);
  const posB = resolveGrad(valB, gradient);
  if (posA === undefined || posB === undefined) return 1;

  const distance = Math.abs(posA - posB) / maxDist;
  let score = 1 - distance;

  if (normalize(valA) !== normalize(valB) && Math.abs(posA - posB) === maxDist) {
    score *= 0.5;
  }

  return score;
}

// ═══════════════════════════════════════════════════════════
//  MAIN SCORING FUNCTION
// ═══════════════════════════════════════════════════════════

export function computeScoring(plants: Plante[]): CompatResult | null {
  const n = plants.length;
  if (n < 2) return null;

  // Generate all pairs
  const pairs: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      pairs.push([i, j]);
    }
  }

  const criteriaScores: Record<string, number> = {};
  const pairScoresByCriterion: Record<string, number[]> = {};

  for (const cfg of CRITERIA_CONFIG) {
    const scores = pairs.map(([i, j]) => {
      const a = plants[i];
      const b = plants[j];
      if (cfg.type === "string") {
        const valA = a[cfg.key as keyof Plante] as string | undefined;
        const valB = b[cfg.key as keyof Plante] as string | undefined;
        return scorePaireString(valA, valB, cfg.gradient, cfg.max);
      } else {
        const rawA = a[cfg.key as keyof Plante];
        const rawB = b[cfg.key as keyof Plante];
        const vA: string[] = Array.isArray(rawA) ? rawA : (rawA ? [rawA as string] : []);
        const vB: string[] = Array.isArray(rawB) ? rawB : (rawB ? [rawB as string] : []);
        return scorePaireArray(vA, vB, cfg.gradient, cfg.max, cfg.key === "ph_sol");
      }
    });
    pairScoresByCriterion[cfg.key] = scores;
    criteriaScores[cfg.key] = scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  // Weighted global score
  let weightedSum = 0;
  for (const [c, score] of Object.entries(criteriaScores)) {
    weightedSum += score * COEFFICIENTS[c as CriterionKey];
  }
  const globalScore = Math.round((weightedSum / SOMME_COEFFICIENTS) * 100);

  // Detect problematic plants
  const alerts: CompatAlert[] = [];
  for (const cfg of CRITERIA_CONFIG) {
    const allPairScores = pairScoresByCriterion[cfg.key];

    for (let e = 0; e < n; e++) {
      const withE: number[] = [];
      const withoutE: number[] = [];
      pairs.forEach(([i, j], idx) => {
        if (i === e || j === e) withE.push(allPairScores[idx]);
        else withoutE.push(allPairScores[idx]);
      });

      if (withoutE.length === 0) continue;

      const avgWithE = withE.reduce((a, b) => a + b, 0) / withE.length;
      const avgWithoutE = withoutE.reduce((a, b) => a + b, 0) / withoutE.length;

      if ((avgWithoutE - avgWithE) * 100 > 25) {
        const plant = plants[e];
        const raw = plant[cfg.key as keyof Plante];
        const plantVals = Array.isArray(raw) ? (raw as string[]).join("/") : String(raw ?? "");
        const otherVals = plants
          .filter((_, idx) => idx !== e)
          .map((p) => {
            const v = p[cfg.key as keyof Plante];
            return Array.isArray(v) ? (v as string[]).join("/") : String(v ?? "");
          });
        const uniqueOther = [...new Set(otherVals.flat())].join(", ");

        alerts.push({
          plantIndex: e,
          plantName: plant.nom_latin,
          criterion: cfg.key,
          criterionLabel: CRITERIA_LABELS[cfg.key],
          message: `${plant.nom_latin} \— ${CRITERIA_LABELS[cfg.key].toLowerCase()} (${plantVals}) en d\écalage avec le reste du m\élange (${uniqueOther})`,
        });
      }
    }
  }

  return {
    globalScore,
    criteriaScores: Object.fromEntries(
      Object.entries(criteriaScores).map(([k, v]) => [k, Math.round(v * 100)])
    ) as Record<CriterionKey, number>,
    alerts,
  };
}

// ═══════════════════════════════════════════════════════════
//  DISPLAY HELPERS
// ═══════════════════════════════════════════════════════════

export function scoreColor(score: number): string {
  if (score >= 80) return "var(--primary)";
  if (score >= 60) return "var(--gres)";
  if (score >= 40) return "var(--ocre)";
  return "var(--terre)";
}

export function scoreVerdict(score: number): string {
  if (score >= 80) return "M\élange coh\érent";
  if (score >= 60) return "Points d'attention";
  if (score >= 40) return "Incompatibilit\és \à corriger";
  return "M\élange probl\ématique";
}

export function formatStrate(s: string): string {
  const map: Record<string, string> = {
    arbre_grand: "Arbre (grand)",
    arbre_moyen: "Arbre (moyen)",
    arbre_petit: "Arbre (petit)",
    arbuste: "Arbuste",
    sous_arbuste: "Sous-arbuste",
    vivace: "Vivace",
    graminee: "Gramin\ée",
    couvre_sol: "Couvre-sol",
    grimpante: "Grimpante",
    bulbe: "Bulbe",
    fougere: "Foug\ère",
    bambou: "Bambou",
    palmier: "Palmier",
    aquatique: "Aquatique",
  };
  return map[s] || s;
}

export function formatExposition(expo: string | string[] | undefined): string {
  if (!expo) return "\—";
  const arr = Array.isArray(expo) ? expo : [expo];
  const labels: Record<string, string> = {
    ombre: "Ombre",
    "mi-ombre": "Mi-ombre",
    soleil: "Soleil",
    "plein soleil": "Soleil",
    plein_soleil: "Soleil",
  };
  return arr.map((v) => labels[v.toLowerCase()] || v).join(", ");
}

// ═══════════════════════════════════════════════════════════
//  FLOWER COLOR PARSING (for phenological calendar)
// ═══════════════════════════════════════════════════════════

const BASE_COLORS: Record<string, string> = {
  "blanc":"#F5F0EB","cr\ème":"#FDF5E6","creme":"#FDF5E6","ivoire":"#FFFFF0",
  "jaune":"#F0D060","citron":"#F5E050","or":"#DAA520","dor\é":"#C5A55A",
  "orange":"#E8863A","abricot":"#FBCEB1","apricot":"#FBCEB1","p\êche":"#FFDAB9",
  "saumon":"#FA8072","rouge":"#C44040","\écarlate":"#FF2400","magenta":"#C71585","carmin\é":"#960018",
  "rose":"#E8A0B0","mauve":"#B08CB0","violet":"#7B5EA7","indigo":"#4B0082","pourpre":"#800080",
  "lilas":"#C8A2C8","lavande":"#B57EDC","am\éthyste":"#9966CC",
  "bleu":"#6A8EB0","cobalt":"#0047AB",
  "vert":"#6B8E6B","brun":"#8B6F47","marron":"#6B4226","bronze":"#CD7F32","rouille":"#B7410E",
  "beige":"#D4C5A9","gris":"#A0A0A0","argent\é":"#C0C0C0","argent":"#C0C0C0","noir":"#3D3D3D",
  "multiple":"#B08CB0",
};

const MODIFIERS: Record<string, number> = {
  "p\âle": 0.30, "pale": 0.30, "clair": 0.25, "tendre": 0.20, "ros\é": 0.15,
  "vif": 0.00, "fonc\é": -0.30, "fonce": -0.30, "sombre": -0.25, "profond": -0.20,
};

function adjustBrightness(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const adj = (c: number) =>
    factor > 0 ? Math.round(c + (255 - c) * factor) : Math.round(c * (1 + factor));
  const cl = (c: number) => Math.min(255, Math.max(0, c));
  return (
    "#" +
    [cl(adj(r)), cl(adj(g)), cl(adj(b))]
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
  );
}

export function parseCouleurFloraison(couleurTexte: string | string[] | null): string {
  if (!couleurTexte) return "#5E8B8F";
  let text = Array.isArray(couleurTexte) ? couleurTexte[0] : couleurTexte;
  if (!text) return "#5E8B8F";

  const norm = text.toLowerCase().replace(/[-_,]/g, " ").replace(/\s+/g, " ").trim();

  let modifier = 0;
  for (const [mod, val] of Object.entries(MODIFIERS)) {
    if (norm.includes(mod)) { modifier = val; break; }
  }

  let foundColor: string | null = null;
  for (const word of norm.split(" ")) {
    const clean = word.normalize("NFD").replace(/[\̀-\ͯ]/g, "");
    for (const [key, hex] of Object.entries(BASE_COLORS)) {
      const keyClean = key.normalize("NFD").replace(/[\̀-\ͯ]/g, "");
      if (clean === keyClean || word === key) { foundColor = hex; break; }
    }
    if (foundColor) break;
  }

  if (!foundColor) return "#5E8B8F";
  if (modifier !== 0) return adjustBrightness(foundColor, modifier);
  return foundColor;
}

// ═══════════════════════════════════════════════════════════
//  PHENOLOGICAL CALENDAR HELPERS
// ═══════════════════════════════════════════════════════════

export function moisToNum(m: string | number | null): number | null {
  if (!m) return null;
  if (typeof m === "number") return m;
  const MOIS_MAP: Record<string, number> = {
    janvier: 1, "f\évrier": 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6,
    juillet: 7, "ao\ût": 8, aout: 8, septembre: 9, octobre: 10, novembre: 11,
    "d\écembre": 12, decembre: 12,
  };
  return MOIS_MAP[m.toLowerCase().trim()] || null;
}

export function isInRange(month: number, debut: number, fin: number): boolean {
  if (debut <= fin) return month >= debut && month <= fin;
  return month >= debut || month <= fin; // wrap around (e.g., Nov-Feb)
}

export function isMonthBefore(month: number, debut: number): boolean {
  const prev = debut === 1 ? 12 : debut - 1;
  return month === prev;
}

export function isMonthAfter(month: number, fin: number): boolean {
  const next = fin === 12 ? 1 : fin + 1;
  return month === next;
}

/** Get the rusticite threshold and the least hardy plant */
export function getRusticite(plants: Plante[]): { min: number; plantName: string } | null {
  let minRust = Infinity;
  let minRustPlant = "";
  for (const p of plants) {
    if (p.rusticite_celsius !== null && p.rusticite_celsius < minRust) {
      minRust = p.rusticite_celsius;
      minRustPlant = p.nom_latin;
    }
  }
  if (minRust === Infinity) return null;
  return { min: minRust, plantName: minRustPlant };
}

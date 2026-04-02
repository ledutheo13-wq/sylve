import type { VegType, SimpleMethod, DetailEquipment } from "./types";

export const MONTHS = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];
export const MONTHS_SHORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export const ETP_PROFILES: Record<string, number[]> = {
  oceanique:        [8, 11, 24, 48, 82, 112, 132, 122, 76, 36, 14, 8],
  semi_oceanique:   [10, 14, 28, 56, 94, 130, 152, 142, 88, 45, 19, 12],
  continental:      [9, 13, 27, 55, 92, 127, 149, 137, 86, 43, 17, 11],
  montagne:         [8, 10, 24, 48, 82, 112, 130, 120, 78, 42, 16, 9],
  semi_continental: [13, 17, 33, 64, 104, 142, 165, 155, 102, 54, 24, 15],
  atlantique_so:    [14, 19, 36, 66, 108, 148, 172, 160, 105, 56, 26, 16],
  transition_med:   [12, 16, 30, 58, 97, 133, 155, 145, 97, 52, 22, 13],
};

export const ETP_SPECIFIC: Record<string, number[]> = {
  "04": [18, 24, 42, 72, 115, 158, 188, 178, 122, 68, 36, 24],
  "06": [22, 28, 48, 80, 125, 165, 195, 185, 125, 72, 38, 26],
  "11": [25, 32, 54, 90, 138, 180, 210, 200, 138, 80, 44, 30],
  "13": [26, 33, 56, 92, 142, 185, 215, 205, 140, 82, 44, 30],
  "30": [26, 33, 56, 92, 142, 185, 215, 205, 140, 82, 44, 30],
  "34": [26, 33, 56, 92, 142, 185, 215, 205, 140, 82, 44, 30],
  "66": [20, 26, 46, 82, 132, 180, 210, 200, 135, 75, 40, 26],
  "83": [28, 35, 58, 95, 145, 190, 220, 210, 145, 85, 46, 32],
  "84": [24, 31, 54, 88, 138, 180, 210, 200, 135, 78, 42, 28],
  "2A": [24, 31, 54, 88, 138, 180, 210, 200, 135, 78, 42, 28],
  "2B": [22, 28, 48, 80, 125, 165, 195, 185, 125, 72, 38, 26],
  "971": [130, 128, 135, 140, 145, 150, 155, 158, 152, 140, 132, 130],
  "972": [135, 130, 140, 145, 155, 160, 162, 160, 150, 138, 128, 132],
  "973": [155, 158, 160, 155, 145, 140, 142, 145, 158, 165, 162, 160],
  "974": [145, 142, 138, 125, 110, 95, 92, 98, 115, 132, 142, 145],
  "976": [120, 118, 115, 110, 105, 95, 92, 100, 112, 125, 128, 125],
};

export const DEPT_ZONE: Record<string, string> = {};
["14", "22", "29", "35", "50", "56"].forEach((d) => (DEPT_ZONE[d] = "oceanique"));
["02", "10", "18", "28", "36", "37", "41", "44", "45", "49", "51", "52", "53", "61", "70", "71", "72", "75", "77", "78", "79", "85", "86", "88", "89", "90", "91", "92", "93", "94", "95"].forEach((d) => (DEPT_ZONE[d] = "semi_oceanique"));
["08", "21", "25", "27", "39", "54", "55", "57", "58", "59", "60", "62", "67", "68", "76", "80"].forEach((d) => (DEPT_ZONE[d] = "continental"));
["05", "09", "12", "15", "23", "43", "48", "63", "65", "73", "74"].forEach((d) => (DEPT_ZONE[d] = "montagne"));
["01", "03", "19", "38", "42", "69", "87"].forEach((d) => (DEPT_ZONE[d] = "semi_continental"));
["16", "17", "24", "31", "32", "33", "40", "46", "47", "64", "82"].forEach((d) => (DEPT_ZONE[d] = "atlantique_so"));
["07", "26", "81"].forEach((d) => (DEPT_ZONE[d] = "transition_med"));

export const DEPT_NAMES: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes",
  "06": "Alpes-Maritimes", "07": "Ardeche", "08": "Ardennes", "09": "Ariege", "10": "Aube",
  "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhone", "14": "Calvados", "15": "Cantal",
  "16": "Charente", "17": "Charente-Maritime", "18": "Cher", "19": "Correze", "21": "Cote-d'Or",
  "22": "Cotes-d'Armor", "23": "Creuse", "24": "Dordogne", "25": "Doubs", "26": "Drome",
  "27": "Eure", "28": "Eure-et-Loir", "29": "Finistere", "30": "Gard", "31": "Haute-Garonne",
  "32": "Gers", "33": "Gironde", "34": "Herault", "35": "Ille-et-Vilaine", "36": "Indre",
  "37": "Indre-et-Loire", "38": "Isere", "39": "Jura", "40": "Landes", "41": "Loir-et-Cher",
  "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot",
  "47": "Lot-et-Garonne", "48": "Lozere", "49": "Maine-et-Loire", "50": "Manche",
  "51": "Marne", "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle",
  "55": "Meuse", "56": "Morbihan", "57": "Moselle", "58": "Nievre", "59": "Nord", "60": "Oise",
  "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dome", "64": "Pyrenees-Atlantiques",
  "65": "Hautes-Pyrenees", "66": "Pyrenees-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin",
  "69": "Rhone", "70": "Haute-Saone", "71": "Saone-et-Loire", "72": "Sarthe", "73": "Savoie",
  "74": "Haute-Savoie", "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne",
  "78": "Yvelines", "79": "Deux-Sevres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne",
  "83": "Var", "84": "Vaucluse", "85": "Vendee", "86": "Vienne", "87": "Haute-Vienne",
  "88": "Vosges", "89": "Yonne", "90": "Territoire de Belfort", "91": "Essonne",
  "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis", "94": "Val-de-Marne",
  "95": "Val-d'Oise", "2A": "Corse-du-Sud", "2B": "Haute-Corse",
  "971": "Guadeloupe", "972": "Martinique", "973": "Guyane", "974": "Reunion", "976": "Mayotte",
};

export function getETP(dept: string): number[] {
  if (ETP_SPECIFIC[dept]) return [...ETP_SPECIFIC[dept]];
  if (DEPT_ZONE[dept]) return [...ETP_PROFILES[DEPT_ZONE[dept]]];
  return [10, 14, 28, 56, 94, 130, 152, 142, 88, 45, 19, 12]; // fallback semi-oceanique
}

export function getSortedDeptKeys(): string[] {
  return Object.keys(DEPT_NAMES).sort((a, b) => {
    const na = a.replace("A", "00").replace("B", "01");
    const nb = b.replace("A", "00").replace("B", "01");
    return na.localeCompare(nb, undefined, { numeric: true });
  });
}

export const VEG_TYPES: VegType[] = [
  { name: "Gazon d'agrement", kc: 0.80 },
  { name: "Gazon sportif", kc: 0.85 },
  { name: "Arbustes", kc: 0.50 },
  { name: "Vivaces et graminees", kc: 0.40 },
  { name: "Arbres isoles (jeunes 1-3 ans)", kc: 0.70 },
  { name: "Arbres isoles (installes >3 ans)", kc: 0.50 },
  { name: "Toiture extensive", kc: 0.30 },
  { name: "Toiture intensive", kc: 0.60 },
  { name: "Prairie naturelle", kc: 0.65 },
  { name: "Agriculture urbaine (potager)", kc: 0.85 },
];

export const ZONE_COLORS = [
  "#5E8B8F", "#C25C3A", "#8A8279", "#6B8E5A", "#9B6B8E",
  "#C2943A", "#5A7E8E", "#8E5A5A", "#5A8E6B", "#8E8E5A",
];

export const SIMPLE_METHODS: SimpleMethod[] = [
  { name: "Aspersion (generique)", eff: 0.75 },
  { name: "Goutte-a-goutte (generique)", eff: 0.90 },
  { name: "Micro-aspersion (generique)", eff: 0.80 },
  { name: "Arrosage manuel", eff: 0.60 },
  { name: "Aucun arrosage", eff: 0 },
];

export const DETAIL_EQUIPMENT: Record<string, DetailEquipment> = {
  tuyeres: {
    name: "Tuyeres (escamotables)",
    params: [
      { id: "debit", label: "Debit (L/min)", min: 2, max: 18, step: 0.5, def: 8 },
      { id: "pression", label: "Pression (bar)", min: 1.5, max: 3.0, step: 0.1, def: 2.0 },
      { id: "portee", label: "Portee (m)", min: 2, max: 5, step: 0.5, def: 3.5 },
      { id: "pluvio", label: "Pluviometrie (mm/h)", min: 15, max: 40, step: 1, def: 25 },
      { id: "eff", label: "Efficience", min: 0.70, max: 0.80, step: 0.01, def: 0.75 },
    ],
  },
  turbines: {
    name: "Turbines (escamotables)",
    params: [
      { id: "debit", label: "Debit (L/min)", min: 5, max: 75, step: 1, def: 20 },
      { id: "pression", label: "Pression (bar)", min: 2.0, max: 4.5, step: 0.1, def: 3.0 },
      { id: "portee", label: "Portee (m)", min: 5, max: 15, step: 0.5, def: 10 },
      { id: "pluvio", label: "Pluviometrie (mm/h)", min: 10, max: 25, step: 1, def: 15 },
      { id: "eff", label: "Efficience", min: 0.70, max: 0.80, step: 0.01, def: 0.75 },
    ],
  },
  gag: {
    name: "Goutte-a-goutte",
    params: [
      { id: "debit", label: "Debit/goutteur (L/h)", min: 1, max: 8, step: 0.5, def: 2 },
      { id: "espacement", label: "Espacement (cm)", min: 20, max: 50, step: 1, def: 33 },
      { id: "pression", label: "Pression (bar)", min: 0.5, max: 2.5, step: 0.1, def: 1.5 },
      { id: "pluvio", label: "Pluviometrie eq. (mm/h)", min: 3, max: 15, step: 0.5, def: 6 },
      { id: "eff", label: "Efficience", min: 0.85, max: 0.95, step: 0.01, def: 0.90 },
    ],
  },
  micro: {
    name: "Micro-asperseurs",
    params: [
      { id: "debit", label: "Debit (L/h)", min: 20, max: 150, step: 5, def: 50 },
      { id: "pression", label: "Pression (bar)", min: 1.0, max: 3.0, step: 0.1, def: 2.0 },
      { id: "portee", label: "Portee (m)", min: 1, max: 5, step: 0.5, def: 2.5 },
      { id: "pluvio", label: "Pluviometrie (mm/h)", min: 5, max: 20, step: 0.5, def: 10 },
      { id: "eff", label: "Efficience", min: 0.75, max: 0.85, step: 0.01, def: 0.80 },
    ],
  },
  manuel: {
    name: "Arrosage manuel",
    params: [
      { id: "debit", label: "Debit estime (L/h)", min: 500, max: 1500, step: 50, def: 900 },
      { id: "eff", label: "Efficience", min: 0.50, max: 0.70, step: 0.01, def: 0.60 },
    ],
  },
};

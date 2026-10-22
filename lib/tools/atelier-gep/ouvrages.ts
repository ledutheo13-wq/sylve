import type { CapaciteOuvrage } from "./types";
import {
  sectionNoue,
  volumeNoue,
  largeurFondNoue,
  volumePoreux,
  volumeBassin,
  type GeomNoue,
} from "./geometrie";
import { debitManning } from "./manning";
import {
  debitInfiltrationM3H,
  estApteInfiltration,
  estInfiltrationRetenue,
} from "./infiltration";
import { volumeEtpAnnuel } from "./etp";
import { calculerToiture, volumeAbattementToiture, type EntreeToiture } from "./toiture";

// ═══════════════════════════════════════════════════════════
//  BLOC C — Catalogue d'ouvrages : type + géométrie → capacité
//  ventilée par mécanisme + exutoire(s).
//
//  Règle de surface d'infiltration (anti-colmatage) :
//    • noue / bassin / structure réservoir → le FOND
//    • tranchée (profonde)                 → les PAROIS
//
//  Les TOITURES ne comptent PAS dans la couverture du volume T10
//  (doctrine Règles Pro TTV) : on expose leur abattement à part.
// ═══════════════════════════════════════════════════════════

export type TypeOuvrage =
  | "noue"
  | "tranchee"
  | "bassin"
  | "structure_reservoir"
  | "cuve"
  | "toiture_ext"
  | "toiture_semi"
  | "toiture_int";

export interface OuvrageBase {
  id: string;
  type: TypeOuvrage;
  nom: string;
}

export interface OuvrageNoue extends OuvrageBase {
  type: "noue";
  geom: GeomNoue;
  lineaire: number;
  pente: number;
  strickler: number;
  infiltrant: boolean;
}
export interface OuvrageTranchee extends OuvrageBase {
  type: "tranchee";
  longueur: number;
  largeur: number;
  profondeur: number;
  porosite: number;
  infiltrant: boolean;
}
export interface OuvrageBassin extends OuvrageBase {
  type: "bassin";
  surfaceFond: number;
  profondeur: number;
  fruit: number;
  infiltrant: boolean;
}
export interface OuvrageStructureReservoir extends OuvrageBase {
  type: "structure_reservoir";
  emprise: number;
  epaisseur: number;
  porosite: number;
  infiltrant: boolean;
}
export interface OuvrageCuve extends OuvrageBase {
  type: "cuve";
  volumeUtile: number;
}
export interface OuvrageToiture extends OuvrageBase {
  type: "toiture_ext" | "toiture_semi" | "toiture_int";
  surface: number;
  toit: EntreeToiture;
  /** kc cultural pour l'ETP annuelle */
  kc: number;
}

export type Ouvrage =
  | OuvrageNoue
  | OuvrageTranchee
  | OuvrageBassin
  | OuvrageStructureReservoir
  | OuvrageCuve
  | OuvrageToiture;

/** Contexte de site partagé pour les calculs d'infiltration / ETP. */
export interface ContexteSite {
  /** perméabilité K du sol, en m/s */
  kMs: number;
  /** coefficient de sécurité sur K */
  coefSecuriteK: number;
  /** températures moyennes mensuelles (12), pour l'ETP */
  temperatures: number[];
  /** latitude, en degrés */
  latitude: number;
  /** durée critique de l'événement, en minutes (pour le volume infiltré) */
  dureeCritiqueMin: number;
}

export function estToiture(o: Ouvrage): o is OuvrageToiture {
  return o.type === "toiture_ext" || o.type === "toiture_semi" || o.type === "toiture_int";
}

/** true si l'ouvrage porte une case « infiltrant » cochée. */
export function estInfiltrant(o: Ouvrage): boolean {
  return "infiltrant" in o && o.infiltrant;
}

/** Surface d'infiltration effective d'un ouvrage (m²), selon la typologie. */
export function surfaceInfiltrationOuvrage(o: Ouvrage): number {
  switch (o.type) {
    case "noue":
      return o.infiltrant ? largeurFondNoue(o.geom) * o.lineaire : 0; // FOND
    case "tranchee":
      return o.infiltrant ? 2 * (o.longueur + o.largeur) * o.profondeur : 0; // PAROIS
    case "bassin":
      return o.infiltrant ? o.surfaceFond : 0; // FOND
    case "structure_reservoir":
      return o.infiltrant ? o.emprise : 0; // FOND
    default:
      return 0;
  }
}

/** Capacité ventilée d'un ouvrage. */
export function capaciteOuvrage(o: Ouvrage, site: ContexteSite): CapaciteOuvrage {
  let volumeStockage = 0;
  let volumeReutilisation = 0;
  let volumeEtp = 0;
  let debitCapableM3S: number | undefined;

  switch (o.type) {
    case "noue":
      volumeStockage = volumeNoue(o.geom, o.lineaire);
      debitCapableM3S = debitManning({ geom: o.geom, strickler: o.strickler, pente: o.pente });
      break;
    case "tranchee":
      volumeStockage = volumePoreux(o.longueur * o.largeur, o.profondeur, o.porosite);
      break;
    case "bassin":
      volumeStockage = volumeBassin(o.surfaceFond, o.profondeur, o.fruit);
      break;
    case "structure_reservoir":
      volumeStockage = volumePoreux(o.emprise, o.epaisseur, o.porosite);
      break;
    case "cuve":
      volumeReutilisation = Math.max(0, o.volumeUtile);
      volumeStockage = volumeReutilisation; // la cuve stocke aussi ce volume
      break;
    default:
      // toitures : pas de stockage compté pour le T10 (doctrine) ; ETP annuelle
      if (estToiture(o)) {
        volumeEtp = volumeEtpAnnuel(o.surface, site.temperatures, site.latitude, o.kc);
      }
      break;
  }

  // Infiltration (m³/h) pour les ouvrages infiltrants — même formule que
  // infiltrationProjet(), dont c'est la part (non retenue sur sol argileux).
  const sInf = surfaceInfiltrationOuvrage(o);
  const debitInfiltrationM3H_ =
    sInf > 0 && estInfiltrationRetenue(site.kMs)
      ? debitInfiltrationM3H({
          kMetresParSeconde: site.kMs,
          coefSecurite: site.coefSecuriteK,
          surfaceInfiltration: sInf,
        })
      : 0;

  return {
    volumeStockage,
    debitInfiltrationM3H: debitInfiltrationM3H_,
    volumeEtp,
    volumeReutilisation,
    debitCapableM3S,
  };
}

// ═══════════════════════════════════════════════════════════
//  Infiltration du PROJET — source unique de vérité
//
//  S_inf = Σ surfaceInfiltrationOuvrage(o) sur les ouvrages « infiltrant »
//          (mode « calculée », par défaut)
//        = surface saisie au bloc A (mode « manuelle », esquisse sans
//          ouvrage détaillé) — elle REMPLACE la somme, jamais ne s'y ajoute.
//  Q_inf = K · coef_sécurité · S_inf   (0 si sol argileux : non retenue)
//
//  Ce Q_inf unique alimente le volume à gérer (Bloc B), la vidange,
//  l'évacuation affichée, la part de chaque carte et le camembert exutoires.
// ═══════════════════════════════════════════════════════════

export interface PartInfiltration {
  id: string;
  nom: string;
  /** surface d'infiltration effective de l'ouvrage, en m² */
  surface: number;
  /** part de l'ouvrage dans Q_inf, en m³/h (0 en mode manuel ou si non retenue) */
  debitM3H: number;
}

export interface EntreeInfiltrationProjet {
  ouvrages: Ouvrage[];
  kMs: number;
  coefSecuriteK: number;
  /** surface saisie manuellement au bloc A (m²) ; null = surface calculée depuis les ouvrages */
  surfaceManuelle: number | null;
}

export interface ResultatInfiltrationProjet {
  mode: "calculee" | "manuelle";
  /** surface d'infiltration retenue, en m² */
  surfaceInfiltration: number;
  /** somme des surfaces des ouvrages « infiltrant », en m² (quel que soit le mode) */
  surfaceOuvrages: number;
  /** ouvrages « infiltrant » cochés, avec leur surface et leur part de débit */
  decomposition: PartInfiltration[];
  /** Q_inf du projet, en m³/h */
  debitM3H: number;
  /** false si sol argileux : l'infiltration n'est pas retenue (Q_inf = 0) */
  retenue: boolean;
  /** true si K < 10⁻⁶ m/s (infiltration seule déconseillée) */
  sousSeuilAptitude: boolean;
  /** true si une surface manuelle coexiste avec des ouvrages infiltrants (non additionnés) */
  conflitManuelOuvrages: boolean;
}

export function infiltrationProjet(e: EntreeInfiltrationProjet): ResultatInfiltrationProjet {
  const retenue = estInfiltrationRetenue(e.kMs);
  const manuelle = e.surfaceManuelle !== null;
  const q = (s: number) =>
    retenue && s > 0
      ? debitInfiltrationM3H({ kMetresParSeconde: e.kMs, coefSecurite: e.coefSecuriteK, surfaceInfiltration: s })
      : 0;

  const decomposition: PartInfiltration[] = e.ouvrages.filter(estInfiltrant).map((o) => {
    const surface = surfaceInfiltrationOuvrage(o);
    return { id: o.id, nom: o.nom, surface, debitM3H: manuelle ? 0 : q(surface) };
  });
  const surfaceOuvrages = decomposition.reduce((s, p) => s + p.surface, 0);
  const surfaceInfiltration = manuelle ? Math.max(0, e.surfaceManuelle ?? 0) : surfaceOuvrages;

  return {
    mode: manuelle ? "manuelle" : "calculee",
    surfaceInfiltration,
    surfaceOuvrages,
    decomposition,
    debitM3H: q(surfaceInfiltration),
    retenue,
    sousSeuilAptitude: !estApteInfiltration(e.kMs),
    conflitManuelOuvrages: manuelle && surfaceOuvrages > 0,
  };
}

/** Abattement événementiel d'une toiture (m³) — informatif, jamais déduit du T10. */
export function abattementToiture(o: OuvrageToiture): number {
  return volumeAbattementToiture(o.toit, o.surface);
}

/** Capacité max (charge) d'une toiture, en mm. */
export function capaciteToitureMm(o: OuvrageToiture): number {
  return calculerToiture(o.toit).capaciteMaxMm;
}

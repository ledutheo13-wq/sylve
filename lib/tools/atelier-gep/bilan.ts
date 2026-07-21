import type { Exutoire } from "./types";
import {
  capaciteOuvrage,
  estToiture,
  abattementToiture,
  type Ouvrage,
  type ContexteSite,
} from "./ouvrages";

// ═══════════════════════════════════════════════════════════
//  BLOC D — Bilan & exutoires (2 camemberts)
//
//  Camembert 1 « par ouvrage » (ÉVÉNEMENT) : répartition du volume à gérer
//    entre les capacités de STOCKAGE des ouvrages + « reste à gérer ».
//    (Les toitures ne comptent pas ici — doctrine ; leur abattement est à part.)
//
//  Camembert 2 « par exutoire » (ÉVÉNEMENT) : devenir du volume à gérer par
//    DESTINATION, en distinguant le stockage (transit) des exutoires réels :
//      • rejet régulé    = Q_fuite · t_critique
//      • infiltration    = Σ Q_inf,ouvrage · t_critique
//      • réutilisation   = Σ volume utile des cuves
//      • stocké (transit)= le reste, « en cours de vidange » (pas une destination)
//    L'atmosphère (ETP) est négligeable sur l'événement → lecture annuelle à part.
//    Bilan volontairement NON forcé à 100 % au-delà du volume à gérer (cf. OASIS).
//
//  Réf. : Cerema OASIS (bilan hydrologique, refus de « boucler » à 100 %).
// ═══════════════════════════════════════════════════════════

export interface PartOuvrage {
  id: string;
  nom: string;
  volume: number; // m³ (stockage)
}

export interface BilanEvenement {
  volumeAGerer: number;
  /** camembert 1 : part de stockage par ouvrage */
  parOuvrage: PartOuvrage[];
  /** volume de stockage total fourni (m³) */
  stockageTotal: number;
  /** reste à gérer = max(0, volumeAGerer − stockageTotal) */
  resteAGerer: number;
  /** objectif couvert ? */
  couvert: boolean;
  /** camembert 2 : devenir par exutoire (m³) */
  parExutoire: Record<Exutoire | "stockage", number>;
  /** abattement événementiel cumulé des toitures (m³) — informatif, hors T10 */
  abattementToituresM3: number;
  /** ETP annuelle cumulée des ouvrages évaporants (m³/an) — lecture annuelle */
  etpAnnuelleM3: number;
}

export interface EntreeBilan {
  volumeAGerer: number;
  /** débit de fuite réglementaire, en m³/h */
  debitFuiteM3H: number;
  /** débit d'infiltration à la parcelle, en m³/h (crédité dans le Bloc B) */
  debitInfiltrationParcelleM3H: number;
  dureeCritiqueMin: number;
  ouvrages: Ouvrage[];
  site: ContexteSite;
}

export function calculerBilan(e: EntreeBilan): BilanEvenement {
  const tHeures = e.dureeCritiqueMin / 60;

  const parOuvrage: PartOuvrage[] = [];
  let stockageTotal = 0;
  // Infiltration créditée à la parcelle (source unique — évite le double comptage
  // avec l'infiltration par ouvrage, qui reste affichée à titre informatif).
  const infiltrationEvt = Math.max(0, e.debitInfiltrationParcelleM3H) * tHeures;
  let reutilisation = 0;
  let abattementToituresM3 = 0;
  let etpAnnuelleM3 = 0;

  for (const o of e.ouvrages) {
    const cap = capaciteOuvrage(o, e.site);
    if (estToiture(o)) {
      abattementToituresM3 += abattementToiture(o);
      etpAnnuelleM3 += cap.volumeEtp;
      continue; // hors couverture T10
    }
    if (cap.volumeStockage > 0) {
      parOuvrage.push({ id: o.id, nom: o.nom, volume: cap.volumeStockage });
      stockageTotal += cap.volumeStockage;
    }
    reutilisation += cap.volumeReutilisation;
  }

  const resteAGerer = Math.max(0, e.volumeAGerer - stockageTotal);
  const couvert = stockageTotal >= e.volumeAGerer && e.volumeAGerer > 0;

  // ── Camembert 2 : devenir du volume à gérer (bornage à volumeAGerer) ──
  const V = e.volumeAGerer;
  const rejet = Math.min(V, e.debitFuiteM3H * tHeures);
  const infiltration = Math.min(Math.max(0, V - rejet), infiltrationEvt);
  const reuse = Math.min(Math.max(0, V - rejet - infiltration), reutilisation);
  const stockage = Math.max(0, V - rejet - infiltration - reuse);

  return {
    volumeAGerer: V,
    parOuvrage,
    stockageTotal,
    resteAGerer,
    couvert,
    parExutoire: {
      rejet,
      infiltration,
      reutilisation: reuse,
      atmosphere: 0, // négligeable sur l'événement (voir bilan annuel)
      stockage,
    },
    abattementToituresM3,
    etpAnnuelleM3,
  };
}

/** Libellés & couleurs des exutoires (charte). */
export const EXUTOIRE_META: Record<
  Exutoire | "stockage",
  { label: string; couleur: string }
> = {
  atmosphere: { label: "Atmosphère (ETP)", couleur: "#5E8B8F" },
  infiltration: { label: "Infiltration", couleur: "#6F8FA0" },
  reutilisation: { label: "Réutilisation", couleur: "#C4973B" },
  rejet: { label: "Rejet régulé", couleur: "#8A8279" },
  stockage: { label: "Stocké (en cours de vidange)", couleur: "#C9C3BA" },
};

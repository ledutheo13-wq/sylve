/**
 * SYLVE Source — Manifeste du corpus (Phase 3 : 35 documents)
 *
 * Données partagées par scripts/ingest.ts (gros run) et scripts/count.ts
 * (estimation / contrôle d'extraction). Chemins OneDrive absolus, libellé
 * `document` lisible (= citation), famille pour la détection d'article.
 *
 * EXCLUSIONS (ne JAMAIS ingérer) : dossier 0_VRAC ; variante CCTG du Fasc.70-II ;
 * annexe « liste-plantes » de bc3 ; arrêté 15/01/2007 (PDF scanné, 0 texte natif).
 */

import type { Family } from "./extract";

const BIB =
  "C:/Users/Tledu/OneDrive/Projet-pro/02_SYLVE/04_Bibliotheque-reglementaire";

export type ManifestEntry = { document: string; path: string; family: Family };

export const MANIFEST: ManifestEntry[] = [
  { family: "unep", document: "Règle pro UNEP P.C.1 — Travaux des sols supports de paysage", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/mise-en-oeuvre-plantes/pc1-ro-travaux-des-sols-supports-de-paysage.pdf` },
  { family: "fascicule", document: "Fascicule 35 (CCTG) — Aménagements paysagers", path: `${BIB}/03_FASCICULES/fascicule_ndeg35_amenagements-paysagers.pdf` },
  { family: "cstb", document: "CSTB — L'arbre en milieu urbain (guide pratique)", path: `${BIB}/07_REGLES-PROFESSIONNELLES/CSTB-CSFE/CSTB-arbre-en-milieu-urbain-Guide-pratique.pdf` },
  { family: "unep", document: "Règle pro UNEP P.C.2 — Plantation d'arbres et arbustes", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/mise-en-oeuvre-plantes/pc2-r0-Travaux-de-plantation-arbres-arbustes.pdf` },
  { family: "unep", document: "Règle pro UNEP P.C.3 — Plantation de massifs", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/mise-en-oeuvre-plantes/pc3-r0-Travaux-de-plantation-massifs.pdf` },
  { family: "unep", document: "Règle pro UNEP P.C.4 — Mise en œuvre des gazons", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/mise-en-oeuvre-plantes/pc4-r0-mise-en-oeuvre-gazons.pdf` },
  { family: "unep", document: "Règle pro UNEP P.E.1 — Entretien des arbres", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/mise-en-oeuvre-plantes/pe1-r0-Travaux-entretien-des-arbres.pdf` },
  { family: "unep", document: "Règle pro UNEP P.C.6 — Conception des systèmes d'arrosage", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/mise-en-oeuvre-plantes/pc6-r0-conception-des-systemes-arrosage.pdf` },
  { family: "unep", document: "Règle pro UNEP P.C.7 — Mise en œuvre des systèmes d'arrosage", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/mise-en-oeuvre-plantes/pc7-r0-Travaux-de-mise-en-oeuvre-des-systemes-d-arrosage.pdf` },
  { family: "unep", document: "Règle pro UNEP C.C.7 — Gestion alternative des eaux pluviales", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/constructions-paysageres/cc7-r0-Travaux-gestion-alternative-eaux-pluviales.pdf` },
  { family: "fascicule", document: "Fascicule 70-II (CCTG) — Ouvrages de recueil, stockage et restitution des EP", path: `${BIB}/03_FASCICULES/fascicule_ndeg70-ii_Ouvrages-de-recueil-stockage-restitution-des-eaux-pluviales.pdf` },
  { family: "fascicule", document: "Fascicule 39 (CCTG) — Assainissement et drainage des terres agricoles", path: `${BIB}/03_FASCICULES/fascicule_ndeg39_Travaux-assainissement-et-drainage-des-terres-agricoles.pdf` },
  { family: "dtu", document: "NF DTU 40.5 — Travaux d'évacuation des eaux pluviales", path: `${BIB}/02_DTU/NF_DTU_40-5_Travaux-evacuation-eaux-pluviales-CCT.pdf` },
  { family: "nf", document: "NF P16-351 — Canalisations plastiques de drainage enterré", path: `${BIB}/01_NORMES-NF/NF_P16-351_Systeme-de-canalisations-plastiques-drainage-enterre.pdf` },
  { family: "nf", document: "NF P98-332 — Distances entre réseaux enterrés et végétaux", path: `${BIB}/01_NORMES-NF/NF_P98-332_Chaussees-et-dependances-distances-reseaux-enterres-entre-voisinage-vegetaux.pdf` },
  { family: "nf", document: "NF P98-331 — Tranchées : ouverture, remblayage, réfection", path: `${BIB}/01_NORMES-NF/NF_P98-331_Chaussees-et-dependances-tranchees-ouvertures-remblayage-refection.pdf` },
  { family: "unep", document: "Règle pro UNEP C.C.2 — Réalisation des réseaux", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/constructions-paysageres/cc2-r0-Realisation-des-reseaux.pdf` },
  { family: "fascicule", document: "Fascicule 2 (CCTG) — Terrassements", path: `${BIB}/03_FASCICULES/fascicule_ndeg2_Terrassements.pdf` },
  { family: "unep", document: "Règle pro UNEP C.C.1 — Terrassements", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/constructions-paysageres/cc1-r0-terrassements.pdf` },
  { family: "unep", document: "Règle pro UNEP B.C.4 — Toitures végétalisées (conception, réalisation, entretien)", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/vegetalisation-bati/bc4-r0-Conception-realisation-entretien-toitures-vegetalisee.pdf` },
  { family: "unep", document: "Règle pro UNEP B.C.3 — Façades et bardages végétalisés", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/vegetalisation-bati/bc3-r0-conception-realisation-facade-bardages-vegetalises.pdf` },
  { family: "unep", document: "Règle pro UNEP B.C.5 — Végétalisation de façades (plantes grimpantes)", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/vegetalisation-bati/bc5-r0-Conception-realisation-entretien-vegetalisation-facades-plantes-grimpantes.pdf` },
  { family: "dtu", document: "NF DTU 43.1 — Étanchéité des toitures-terrasses (guide de conception)", path: `${BIB}/02_DTU/NF_DTU_43-1_P3_Etancheite-toitures-terrasses-et-inclinees-Plaine-Guide-de-conception.pdf` },
  { family: "fascicule", document: "Fascicule 29 (CCTG) — Revêtements de voiries et espaces publics en produits modulaires", path: `${BIB}/03_FASCICULES/fascicule_ndeg29_Execution-des-revetements-de-voiries-et-espaces-publics-en-produits-modulaires.pdf` },
  { family: "nf", document: "NF P98-335 — Mise en œuvre des pavés (béton, terre cuite, pierre)", path: `${BIB}/01_NORMES-NF/NF_P98-335_Chaussees-urbaines-mise-en-oeuvre-paves-beton-terre-cuite-pierre-naturelle.pdf` },
  { family: "unep", document: "Règle pro UNEP C.C.3 — Revêtements, fondations, bordures, caniveaux", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/constructions-paysageres/cc3-r0-Revetements-fondations-bordures-caniveaux.pdf` },
  { family: "ccag-ccp", document: "CCAG-MOE — Cahier des clauses administratives générales (maîtrise d'œuvre)", path: `${BIB}/04_REGLEMENTATION/CCAG/AMCV-4-MOE.pdf` },
  { family: "ccag-ccp", document: "Code de la commande publique — Maîtrise d'œuvre privée (partie lég./régl.)", path: `${BIB}/04_REGLEMENTATION/CODE-COMMANDE-PUBLIQUE/2_Marches_publics/CCP_PartLegReg_T3_C1C2_Maitrise-oeuvre-privee.pdf` },
  { family: "ccag-ccp", document: "Code de la commande publique — Maîtrise d'ouvrage (partie lég.)", path: `${BIB}/04_REGLEMENTATION/CODE-COMMANDE-PUBLIQUE/2_Marches_publics/CCP_PartLeg_T2_C1C2_Maitrise-ouvrage.pdf` },
  { family: "unep", document: "Règle pro UNEP — Conception des constructions paysagères", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/constructions-paysageres/p-c-6-r0-conception-090516.pdf` },
  { family: "unep", document: "Règle pro UNEP C.C.4 — Murets, retenues de terre et escaliers paysagers", path: `${BIB}/07_REGLES-PROFESSIONNELLES/UNEP/constructions-paysageres/cc4-r0-mise-en-place-de-murets-paysagers-retenues-de-sol-et-escaliers.pdf` },
  { family: "nf", document: "NF P98-351 — Cheminements PMR : éveil de vigilance, dispositifs podotactiles", path: `${BIB}/01_NORMES-NF/NF_P98-351_Cheminements-insertion-PMR-eveil-de-vigilance-dispositifs-podotactiles.pdf` },
  { family: "nf", document: "NF P98-352 — Bandes de guidage tactile au sol", path: `${BIB}/01_NORMES-NF/NF_P98-352_Cheminements-bandes-guidage-tactile-au-sol.pdf` },
  { family: "nf", document: "NF P96-105 — Accessibilité PMR : conception, pictogrammes", path: `${BIB}/01_NORMES-NF/NF_P96-105_Accessibilite-aux-PMR-preconisation-conception-utilisation-pictogrammes.pdf` },
];

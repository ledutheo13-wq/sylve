// ═══════════════════════════════════════════════════════════
//  MANIFESTE DES OUTILS — source de vérité unique
//  Landing, hub /projet, pages familles, fil d'Ariane le lisent.
//  Réf. : 02_Roadmap-et-execution/reorganisation-familles/CADRAGE-…
//
//  ⚠ Les routes restent PLATES (/projet/<slug>). La famille est une
//  couche de navigation/affichage, jamais un segment d'URL.
//  L'accès réel (libre/compte) dépend de l'emplacement physique du
//  dossier (hors ou dans le groupe (protected)) ; ce champ pilote
//  l'AFFICHAGE (badges) et doit rester cohérent avec cet emplacement.
// ═══════════════════════════════════════════════════════════

export type Acces = "libre" | "compte";
export type Statut = "live" | "a-venir";
export type AffichageFamille = "plein" | "a-venir";

export interface Outil {
  slug: string;
  nom: string;
  emoji: string;
  famille: string; // id de famille
  acces: Acces;
  statut: Statut;
  description: string;
}

export interface Famille {
  id: string;
  nom: string;
  slug: string; // /projet/<slug>
  description: string;
  affichage: AffichageFamille;
  /** SEO de la page famille */
  seoTitle: string;
  seoDescription: string;
}

// ── Familles (ordre d'affichage) ──
export const FAMILLES: Famille[] = [
  {
    id: "vegetaux",
    nom: "Végétaux",
    slug: "vegetaux",
    description:
      "Composer et valider une palette végétale adaptée au site et au climat.",
    affichage: "plein",
    seoTitle: "Outils végétaux pour paysagiste concepteur — sylve",
    seoDescription:
      "Compatibilité végétale, calendrier phénologique, sélecteur d'essences : composez et validez une palette adaptée à votre site.",
  },
  {
    id: "ouvrages",
    nom: "Ouvrages",
    slug: "ouvrages",
    description:
      "Dimensionner et vérifier les ouvrages construits du projet de paysage.",
    affichage: "plein",
    seoTitle: "Outils de dimensionnement d'ouvrages paysagers — sylve",
    seoDescription:
      "Charges sur dalle, soutènements, platelages bois : dimensionnez les ouvrages construits de vos projets de paysage.",
  },
  {
    id: "irrigation",
    nom: "Irrigation",
    slug: "irrigation",
    description:
      "Estimer et dimensionner les besoins en eau des aménagements.",
    affichage: "plein",
    seoTitle: "Outils d'irrigation pour aménagements paysagers — sylve",
    seoDescription:
      "Estimez les besoins en eau de vos aménagements paysagers par zone et par mois.",
  },
  {
    id: "gestion-eaux-pluviales",
    nom: "Gestion des eaux pluviales",
    slug: "gestion-eaux-pluviales",
    description:
      "Concevoir et pré-dimensionner la gestion des eaux pluviales à la parcelle.",
    affichage: "plein",
    seoTitle: "Outils de gestion des eaux pluviales (GEP) — sylve",
    seoDescription:
      "Comparateur d'ouvrages GEP et atelier de pré-dimensionnement : concevez la gestion des eaux pluviales de vos projets.",
  },
  {
    id: "reglementaire",
    nom: "Réglementaire & environnement",
    slug: "reglementaire",
    description:
      "Vérifier la conformité réglementaire et environnementale du projet.",
    affichage: "a-venir",
    seoTitle: "Outils réglementaires & environnement — sylve",
    seoDescription:
      "CBS/IVB/SVP, boussole des labels, générateur CCTP : à venir dans sylve projet.",
  },
  {
    id: "biodiversite",
    nom: "Biodiversité",
    slug: "biodiversite",
    description: "Intégrer la biodiversité locale au projet de paysage.",
    affichage: "a-venir",
    seoTitle: "Outils biodiversité pour le projet de paysage — sylve",
    seoDescription:
      "Biodiversité locale (espèces et mesures) : à venir dans sylve projet.",
  },
];

// ── Outils LIVE (route plate /projet/<slug>) ──
export const OUTILS: Outil[] = [
  // Végétaux
  { slug: "compatibilite-vegetale", nom: "Compatibilité végétale", emoji: "🌿", famille: "vegetaux", acces: "libre", statut: "live", description: "Analysez la compatibilité botanique et écologique de vos mélanges végétaux." },
  { slug: "calendrier-phenologique", nom: "Calendrier phénologique", emoji: "📅", famille: "vegetaux", acces: "compte", statut: "live", description: "Générez un calendrier de floraison et de feuillage pour votre palette végétale. Export PNG." },
  { slug: "selecteur-essences", nom: "Sélecteur d'essences", emoji: "🌳", famille: "vegetaux", acces: "compte", statut: "live", description: "Trouvez les essences adaptées à votre site et composez votre palette par mélanges." },
  // Ouvrages
  { slug: "calculateur-charges", nom: "Calculateur de charges sur dalle", emoji: "⬜", famille: "ouvrages", acces: "libre", statut: "live", description: "Calcul du poids d'un complexe végétatif en kg/m², avec schéma en coupe interactif." },
  { slug: "soutenements", nom: "Calculateur de soutènements", emoji: "🧱", famille: "ouvrages", acces: "compte", statut: "live", description: "Vérifiez la stabilité de vos petits soutènements paysagers (poussée de terre, Rankine)." },
  { slug: "platelages", nom: "Calculateur de platelages bois", emoji: "🪵", famille: "ouvrages", acces: "compte", statut: "live", description: "Dimensionnez vos platelages extérieurs en bois conformément au DTU 51.4." },
  // Irrigation
  { slug: "arrosage", nom: "Calculateur d'arrosage", emoji: "💧", famille: "irrigation", acces: "libre", statut: "live", description: "Estimez les besoins en eau de vos aménagements paysagers par zone et par mois." },
  // Gestion des eaux pluviales
  { slug: "comparateur-ouvrages-gep", nom: "Comparateur d'ouvrages GEP", emoji: "🌧️", famille: "gestion-eaux-pluviales", acces: "libre", statut: "live", description: "Comparez les 16 techniques de gestion des eaux pluviales sur 15 critères. Radars superposables." },
  { slug: "atelier-gep", nom: "Atelier de gestion des eaux pluviales", emoji: "🌊", famille: "gestion-eaux-pluviales", acces: "compte", statut: "live", description: "Calculez le volume d'eau à gérer (méthode des pluies) et arbitrez une synergie d'ouvrages." },
];

// ── Items « à venir » par famille (non cliquables) ──
export interface AVenir {
  nom: string;
  famille: string;
  description: string;
}

export const A_VENIR: AVenir[] = [
  { nom: "Éditeur de palette (hub)", famille: "vegetaux", description: "Palette végétale partagée entre les outils." },
  { nom: "Palette adaptée au climat", famille: "vegetaux", description: "Sélection d'essences selon le climat local." },
  { nom: "Structure de sol selon usage", famille: "ouvrages", description: "Dimensionnement des structures de sol par usage." },
  { nom: "Besoins hydriques", famille: "irrigation", description: "Évolution de l'arrosage vers le bilan hydrique." },
  { nom: "Dimensionnement réseau", famille: "irrigation", description: "Dimensionnement des réseaux d'irrigation." },
  { nom: "Abattement EP", famille: "gestion-eaux-pluviales", description: "Abattement des eaux pluviales à la parcelle." },
  { nom: "CBS / IVB / SVP", famille: "reglementaire", description: "Coefficients de biotope et pleine terre par circonscription." },
  { nom: "Boussole des labels", famille: "reglementaire", description: "Vérification des exigences des labels (BiodiverCity, HQE…)." },
  { nom: "Générateur CCTP", famille: "reglementaire", description: "Rédaction assistée du CCTP paysage." },
  { nom: "Biodiversité locale", famille: "biodiversite", description: "Espèces et mesures de biodiversité par territoire." },
];

// ── Helpers ──
export function familleById(id: string): Famille | undefined {
  return FAMILLES.find((f) => f.id === id);
}
export function familleBySlug(slug: string): Famille | undefined {
  return FAMILLES.find((f) => f.slug === slug);
}
export function outilBySlug(slug: string): Outil | undefined {
  return OUTILS.find((o) => o.slug === slug);
}
export function outilsDeFamille(familleId: string): Outil[] {
  return OUTILS.filter((o) => o.famille === familleId);
}
export function aVenirDeFamille(familleId: string): AVenir[] {
  return A_VENIR.filter((a) => a.famille === familleId);
}
export function famillesPleines(): Famille[] {
  return FAMILLES.filter((f) => f.affichage === "plein");
}
export function famillesAVenir(): Famille[] {
  return FAMILLES.filter((f) => f.affichage === "a-venir");
}
export function href(slug: string): string {
  return `/projet/${slug}`;
}

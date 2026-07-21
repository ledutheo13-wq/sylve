// ═══════════════════════════════════════════════════════════
//  Bibliographie NF ISO 690 — section « Méthodes & références »
//  Sources publiques consultées le 8 juillet 2026 (construction clean-room).
// ═══════════════════════════════════════════════════════════

export interface RefBiblio {
  categorie: string;
  citation: string;
  url?: string;
}

export const BIBLIOGRAPHIE: RefBiblio[] = [
  {
    categorie: "Méthode des pluies",
    citation:
      "CEREMA. Méthode des pluies (HU) [en ligne]. Wikhydro, maj 31/07/2023. D'après CHOCAT B., CHERQUI S.",
    url: "http://wikhydro.developpement-durable.gouv.fr/index.php/M%C3%A9thode_des_pluies_(HU)",
  },
  {
    categorie: "Coefficients de Montana (IDF)",
    citation:
      "MÉTÉO-FRANCE. Statistiques des pluies extrêmes — coefficients de Montana (courbes intensité-durée-fréquence) [données par station].",
  },
  {
    categorie: "Écoulement à surface libre",
    citation:
      "MANNING R. On the flow of water in open channels and pipes. Transactions of the Institution of Civil Engineers of Ireland, 1891, vol. 20, p. 161-207. — STRICKLER A. Beiträge zur Frage der Geschwindigkeitsformel…, Mitteilungen n° 16. Bern, 1923.",
  },
  {
    categorie: "Évapotranspiration (Thornthwaite)",
    citation:
      "THORNTHWAITE C. W. An approach toward a rational classification of climate. Geographical Review, 1948, vol. 38, n° 1, p. 55-94.",
  },
  {
    categorie: "Coefficients culturaux (kc)",
    citation:
      "ALLEN R. G., PEREIRA L. S., RAES D., SMITH M. Crop evapotranspiration (FAO Irrigation and Drainage Paper 56) [en ligne]. Rome : FAO, 1998.",
    url: "https://www.fao.org/4/x0490e/x0490e0b.htm",
  },
  {
    categorie: "Coefficient de ruissellement / imperméabilisation",
    citation:
      "CEREMA. Coefficient d'imperméabilisation (HU) [en ligne]. Wikhydro. — Instruction technique du 22 juin 1977 (circulaire 77-284).",
    url: "http://wikhydro.developpement-durable.gouv.fr/index.php/Coefficient_d'imperm%C3%A9abilisation_(HU)",
  },
  {
    categorie: "Perméabilité des sols (K)",
    citation:
      "CEREMA. Wikigeotech : mesure de la perméabilité [en ligne]. — ADOPTA. Tableau des perméabilités par nature de sol, cité par O2D Environnement.",
    url: "http://wikhydro.developpement-durable.gouv.fr/index.php/Wikigeotech:Mesure_de_la_perm%C3%A9abilit%C3%A9",
  },
  {
    categorie: "Coefficient de sécurité / capacité d'infiltration",
    citation:
      "GRAIE. Quelle capacité d'infiltration retenir pour le dimensionnement des Techniques Alternatives ? (CHOCAT B., BRELOT E.) [en ligne]. Sept. 2020. — GISER (Wallonie), guide 2023.",
    url: "https://www.graie.org/graie/graiedoc/reseaux/pluvial/TA_FreinsAvantages/capacite_infiltration_sept20VF.pdf",
  },
  {
    categorie: "Dimensionnement à la source / temps de vidange",
    citation:
      "CEREMA. OASIS — outil d'aide au dimensionnement des ouvrages de gestion à la source : guide utilisateur [en ligne], v2, 08/11/2021.",
    url: "https://oasis.cerema.fr/resources/Guide_utilisateur.pdf",
  },
  {
    categorie: "Porosité des matériaux de stockage",
    citation:
      "CEREMA. Tranchée de stockage et d'infiltration des eaux pluviales (HU) [en ligne]. Wiklimat. — LCPC/IFSTTAR. Structures alvéolaires ultra-légères (SAUL), guide technique.",
    url: "http://wiklimat.developpement-durable.gouv.fr/index.php/Tranch%C3%A9e_de_stockage_et_d'infiltration_des_eaux_pluviales_(HU)",
  },
  {
    categorie: "Toitures végétalisées",
    citation:
      "ADIVET, CSFE, SNPP, UNEP. Règles professionnelles pour la conception et la réalisation des terrasses et toitures végétalisées, éd. 2018. — CEREMA. Les toitures végétalisées et la gestion des eaux pluviales, 2017.",
    url: "https://www.adivet.net/toitures-et-terrasses-vegetalisees",
  },
  {
    categorie: "Périodes de retour",
    citation:
      "DDT DE LOIRE-ATLANTIQUE. Guide de gestion des eaux pluviales [en ligne].",
    url: "https://www.loire-atlantique.gouv.fr/contenu/telechargement/4785/30989/file/410_GuideEauxPluviales2.pdf",
  },
];

export const AVERTISSEMENT_LEGAL =
  "Aide à la conception et au pré-dimensionnement — ne se substitue pas à une étude d'ingénierie spécialisée. Le dimensionnement réglementaire exige une étude de sol locale (essais Porchet / Lefranc) et la conformité au règlement d'assainissement de la collectivité.";

export const AVERTISSEMENT_METHODE =
  "La méthode des pluies minore les volumes (écart croissant avec la période de retour et avec la faiblesse du débit de fuite). Résultats à valider par une étude fluide en phase PRO.";

import Link from "next/link";
import type { Metadata } from "next";
import { Nav } from "../Nav";
import { ReferencesCarousel, type Cas, type Autre } from "./ReferencesCarousel";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "sylve conseil — l'expertise humaine derrière les outils",
  description:
    "Le tiers de confiance technique des projets de paysage. Audit, appui AMO, support MOE, études et notes techniques — Théo Le Du, ingénieur paysagiste.",
};

const MISSIONS = [
  {
    titre: "Audit & contrôle qualité",
    desc: "Dossiers en cours et chantiers, pour le compte de maîtres d'ouvrage.",
  },
  {
    titre: "Appui AMO",
    desc: "Faisabilité, cahiers des charges, arbitrages. Orientation vers la labellisation (BiodiverCity, ÉcoJardin) et les financements (agences de l'eau, ADEME, aides régionales).",
  },
  {
    titre: "Support MOE / MOEX",
    desc: "Technique, réglementaire, économie de projet, ACT, suivi de chantier.",
  },
  {
    titre: "Études et notes techniques",
    desc: "Calcul et dimensionnement d'ouvrages (complexes végétatifs, soutènements…), études économiques, cadrage méthodologique, pièces de PC, CCTP.",
  },
];

const CAS: Cas[] = [
  {
    titre: "Protéger le budget d'un maître d'ouvrage",
    domaine: "Appui MOA · sécurisation contractuelle",
    categorie: "Support MOE",
    probleme:
      "Une entreprise de travaux requalifiait les contraintes du site (classement environnemental Im3) pour imposer une protection anticorrosion en acier hors marché sur les costières et voliges d'une toiture végétalisée.",
    action:
      "Démonstration technique opposée : analyse de la norme de corrosivité, des conditions réelles de l'ouvrage (drainage, interface au substrat) et des clauses du CCTP ; exigence d'une note justificative d'un bureau corrosion accrédité sous délai ferme ; alternative drainante.",
    resultat:
      "Classement Im3 écarté, variante aluminium refusée (note de calcul : déformation plastique), acier du marché conservé. Environ 70 000 € HT de surcoût évité pour le maître d'ouvrage.",
    marqueurs: [
      "ISO 12944-2 (catégorie de corrosivité Im3)",
      "résistivité < 1000 Ω·cm",
      "CCTP art. 2.2.1.3 / 3.4.3.3",
      "DTU 43.1",
    ],
    ref: {
      src: "/references/ref-budget-voliges.png",
      titre: "Protéger le budget d'un maître d'ouvrage",
      legende: "Détail technique des costières et voliges, classement de corrosivité.",
    },
  },
  {
    titre: "Diagnostic paysager des 4 piliers",
    domaine: "Appui MOA · diagnostic",
    categorie: "Diagnostic",
    probleme:
      "Un square en cœur urbain dense nécessitait un état des lieux objectif avant intervention : eau, sol, végétation, biodiversité.",
    action:
      "Diagnostic chiffré des quatre piliers : capacité d'infiltration des sols, bilan de la canopée et de l'îlot de chaleur urbain, valeur écologique et leviers de gestion différenciée, contraintes réglementaires (espaces boisés classés, PLU).",
    resultat:
      "97 % de surface infiltrante caractérisée, canopée de 636 m² (32 %) préservée (0 abattage hors sécurité) ; un socle de décision factuel partagé entre maîtrise d'ouvrage et maîtrise d'œuvre.",
    marqueurs: [
      "perméabilité — loi de Darcy (v = K·i)",
      "K > 10⁻⁵ m/s",
      "97 % de surface infiltrante",
      "canopée 636 m² (32 %)",
      "îlot de chaleur urbain +5 °C",
      "espaces boisés classés (EBC)",
    ],
    ref: {
      src: "/references/ref-diagnostic-4piliers.png",
      titre: "Diagnostic paysager des 4 piliers",
      legende: "Tableau de synthèse du diagnostic des quatre piliers.",
    },
  },
  {
    titre: "Débloquer un permis recalé sur la gestion des eaux pluviales",
    domaine: "Eaux pluviales · gestion à la parcelle",
    categorie: "Eaux pluviales",
    probleme:
      "Au premier dépôt, la notice hydraulique du projet est refusée : l'abattement des eaux pluviales à la parcelle est jugé insuffisant. Le permis est bloqué.",
    action:
      "Conception d'une stratégie de gestion alternative des eaux pluviales intégrée au projet paysager : dimensionnement de deux ouvrages hydrauliques (cuve de rétention et tranchée drainante, raccordées en gravitaire) et maîtrise de leur impact réglementaire sur les surfaces végétalisées.",
    resultat:
      "Conformité au PLU bioclimatique préservée (SVP révisé à 69,45) et qualité du jardin maintenue ; permis obtenu.",
    marqueurs: [
      "abattement à la parcelle",
      "cuve de rétention + tranchée drainante",
      "écoulement gravitaire",
      "coefficient de pleine terre 0,8",
      "SVP 64,1 → 71,4 → 69,45",
    ],
    ref: {
      src: "/references/ref-eaux-pluviales-schema.svg",
      titre: "Débloquer un permis recalé sur la gestion des eaux pluviales",
      legende:
        "Schéma hydraulique — cuve de rétention et tranchée drainante en gravitaire.",
    },
  },
  {
    titre: "Concevoir et dimensionner un réseau d'arrosage",
    domaine: "Eaux & hydraulique · arrosage",
    categorie: "Eaux pluviales",
    probleme:
      "Un projet planté sur dalle exige un arrosage juste — ni sous-dimensionné (stress hydrique) ni sur-dimensionné (gaspillage) — et un réseau lisible, exploitable par l'entretien.",
    action:
      "Conception du synoptique du réseau d'arrosage (réseau primaire en charge, programmateur piloté par capteur pluviométrique, clapet anti-retour, électrovannes sectorisées, goutte-à-goutte / aspersion) et de sa variante de dédoublage, à partir du calcul des besoins hydriques.",
    resultat:
      "Un réseau dimensionné, sectorisé et tracé, cohérent avec la stratégie de gestion de l'eau du projet et contrôlable en exécution.",
    marqueurs: [
      "besoins hydriques — évapotranspiration (ETP, Penman-Monteith)",
      "coefficient cultural Kc",
      "réserve utile (RU)",
      "électrovannes / sectorisation",
      "clapet anti-retour",
      "goutte-à-goutte (entraxe 30 cm)",
    ],
    ref: {
      src: "/references/ref-arrosage-synoptique.png",
      titre: "Concevoir et dimensionner un réseau d'arrosage",
      legende: "Synoptique du réseau d'arrosage sectorisé.",
    },
  },
  {
    titre: "Arbitrer une spécification de substrat opposable au marché",
    domaine: "Sol & agronomie · arbitrage technique",
    categorie: "Sol & agronomie",
    probleme:
      "En phase d'exécution, l'entreprise propose un substrat allégé pour l'ensemble des volumes, y compris en pleine terre — en contradiction avec les pièces de marché, incompatible avec la palette indigène et les fortes épaisseurs de terre.",
    action:
      "Analyse agronomique et contractuelle : contradictions des pièces de marché, démonstration des risques du substrat allégé sur fortes épaisseurs (anaérobiose, tassement, incompatibilité racinaire), puis arbitrage multicritère de 5 spécifications sous contrainte de charge admissible et d'exigence de label.",
    resultat:
      "Spécification d'horizons composés retenue : la plus qualitative et écologique, sans surcoût, sans impact sur les indices réglementaires déposés.",
    marqueurs: [
      "DPGF art. 2.1.1",
      "CCTP art. 2.5.1–2.5.3",
      "charge admissible 1 500 kg/m²",
      "anaérobiose → méthanogenèse (CH₄)",
      "dénitrification (N₂O / NH₃)",
      "label Biodivercity (70 % d'indigénat)",
      "sans tourbe",
    ],
    ref: {
      src: "/references/ref-substrats-arbitrage.png",
      titre: "Arbitrer une spécification de substrat opposable au marché",
      legende: "Tableau multicritère d'arbitrage des spécifications de substrat.",
    },
  },
  {
    titre: "Arbitrer une interface technique complexe",
    domaine: "Support MOE · sécurisation",
    categorie: "Support MOE",
    probleme:
      "Sur un projet urbain dense, des arbres plantés sur dalle se trouvaient au droit de joints de dilatation de l'ouvrage : un conflit normatif (DTU 43.1, étanchéité) bloquait la validation.",
    action:
      "Définition d'un principe d'interface dessiné (adaptation de la motte et de son ancrage, substitution d'un grand sujet par plusieurs cépées de même espèce), argumentaire technique normé, validation par un bureau de contrôle.",
    resultat:
      "Avis favorable du bureau de contrôle, et solution alternative préservant l'intention paysagère.",
    marqueurs: [
      "DTU 43.1 (étanchéité des toitures-terrasses)",
      "joint de dilatation",
      "interface racinaire sur dalle",
      "validation bureau de contrôle",
    ],
    ref: {
      src: "/references/ref-arbre-joint-dilatation.png",
      titre: "Arbitrer une interface technique complexe",
      legende: "Principe d'interface arbre / joint de dilatation sur dalle.",
    },
  },
  {
    titre: "Obtenir un permis de construire en une seule itération",
    domaine: "Réglementaire · permis de construire",
    categorie: "Réglementaire",
    probleme:
      "Un dépôt de permis au volet paysager exposé au risque de rejet ou de demandes de compléments (conformité PLU bioclimatique, pleine terre, biodiversité).",
    action:
      "Dossier complet et étayé : notice PLU bioclimatique (Ville de Paris), calculs de surfaces pondérées et d'indices de végétalisation, carnet comparatif existant/projet, réponses anticipées aux services instructeurs.",
    resultat:
      "Permis obtenu sans demande de pièces complémentaires, en une seule itération.",
    marqueurs: [
      "PLU bioclimatique (Ville de Paris)",
      "surface végétalisée pondérée (SVP)",
      "indice de végétalisation du bâti — IVB = ΣS/SE",
      "IVB existant 2,61 → projet 2,70",
      "coefficient de pleine terre",
    ],
    ref: {
      src: "/references/ref-permis-ivb.png",
      titre: "Obtenir un permis de construire en une seule itération",
      legende:
        "Tableaux de calcul de l'indice de végétalisation (IVB) — états existant et projet.",
    },
  },
  {
    titre: "Résoudre un aléa de niveaux en exécution",
    domaine: "Support MOE · exécution (DET)",
    categorie: "Support MOE",
    probleme:
      "En chantier, les niveaux de dalle bruts ne correspondaient pas aux cotes NGF du géomètre retenues en conception : risque sur les calages d'assises, l'étanchéité et les revêtements.",
    action:
      "Reprise de l'ensemble des coupes techniques sur la base des relevés réels, adaptation des calages (tasseaux, bourrage, raccords), et amendement des données graphiques pour rétablir la cohérence cote par cote.",
    resultat: "Aléa résorbé sans reprise lourde d'ouvrage ; exécution sécurisée.",
    marqueurs: [
      "nivellement NGF",
      "coupes techniques A→F",
      "calage (tasseaux, bourrage laine de roche)",
      "interface faux-plafond",
    ],
    ref: {
      src: "/references/ref-alea-niveaux-ngf.png",
      titre: "Résoudre un aléa de niveaux en exécution",
      legende: "Coupe technique reprise sur les niveaux NGF relevés.",
    },
  },
  {
    titre: "Lever les réserves des services instructeurs",
    domaine: "Réglementaire · instruction",
    categorie: "Réglementaire",
    probleme:
      "Après dépôt, le projet paysager reçoit un avis d'attente et de réserves des services instructeurs (usagers/police administrative, écologie urbaine) : classification des essences, épaisseurs de substrat, ratio de surface végétalisée, conformité PLU bioclimatique.",
    action:
      "Analyse point par point du retour administratif, confrontation aux pièces déposées et au règlement, puis corrections (palette conforme, surfaces de massifs revues, indices recalculés) pour un re-dépôt maîtrisé.",
    resultat: "Réserves levées, permis obtenu.",
    marqueurs: [
      "avis DUPA / DEVE",
      "PLU bioclimatique art. UG.13.2.2",
      "ratio ≥ 50 % végétalisé",
      "IVB = 3,07",
      "toitures semi-intensives",
    ],
  },
  {
    titre: "Tenir la qualité jusqu'à la réception (suivi de chantier / DET)",
    domaine: "Support MOE · exécution",
    categorie: "Support MOE",
    probleme:
      "En phase travaux, l'écart entre le marché et l'exécution se joue dans le détail : épaisseurs de terre, conformité de l'arrosage, densité et conformité des plantations.",
    action:
      "Visites MOE régulières et comptes rendus formels : sondages d'épaisseurs de terre, contrôle du réseau d'arrosage, vérification des plantations, avec demandes de reprise traçables à l'entreprise.",
    resultat:
      "Non-conformités relevées et corrigées au fil du chantier ; la qualité tenue jusqu'à la réception.",
    marqueurs: [
      "DET",
      "réception des terres (30 cm foisonné)",
      "contrôle d'arrosage (entraxe 30 cm)",
      "conformité des plantations (taxons, densité)",
      "CR de visite MOE",
    ],
  },
  {
    titre: "Sécuriser la gestion des eaux pluviales par les essais",
    domaine: "Eaux pluviales · études techniques",
    categorie: "Eaux pluviales",
    probleme:
      "Justifier l'infiltration des eaux pluviales à la parcelle, sans données de sol fiables ni protocole d'essais.",
    action:
      "Rédaction du cahier des charges des essais de perméabilité (essais Porchet, noues, phytoépuration) et cadrage de la campagne de relevés.",
    resultat:
      "Une stratégie d'infiltration étayée par des mesures, défendable en instruction.",
    marqueurs: [
      "essais Porchet",
      "perméabilité (loi de Darcy)",
      "noue",
      "phytoépuration",
      "campagne de relevés géotechniques",
    ],
  },
];

const AUTRES: Autre[] = [
  {
    titre: "Conception de complexes végétatifs",
    desc: "Mise en synergie de la palette végétale, du substrat et du climat (toitures, dalles, pleine terre), calée sur les contraintes réglementaires et de labellisation.",
    marqueurs: [
      "complexe végétatif",
      "synergie sol–plante–climat",
      "indigénat & stratification",
      "épaisseurs de substrat & charges admissibles",
      "PLU bioclimatique",
      "label Biodivercity",
    ],
    ref: {
      src: "/references/ref-complexes-vegetatifs.png",
      titre: "Conception de complexes végétatifs",
      legende:
        "Planche : modules de plantation R1/R2/R3 et compositions d'espèces.",
    },
  },
  {
    titre: "Passage de réseaux près d'espaces plantés — séquence ÉRC",
    desc: "Étude Éviter-Réduire-Compenser : tracé, distances et protection du système racinaire.",
    marqueurs: ["NF P98-332", "zone de protection racinaire"],
  },
  {
    titre: "Études d'exécution & notes de calcul",
    desc: "Dimensionnements, calepinages et notes de calcul jusqu'à la réalisation.",
    marqueurs: ["EXE", "note de calcul", "calepinage"],
  },
];

export default function ConseilPage() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroEyebrow}>
            l&apos;expertise humaine derrière les outils sylve.eco
          </div>
          <div className={styles.heroLogo}>
            <span className={styles.heroLogoName}>sylve</span>
            <span className={styles.heroLogoDash}>·</span>
            <span className={styles.heroLogoSub}>conseil</span>
          </div>
          <div className={styles.heroDivider} />
          <h1 className={styles.heroAccroche}>
            Le tiers de confiance technique des projets de paysage.
          </h1>
          <p className={styles.heroIdentite}>
            Théo Le Du · Ingénieur paysagiste · Référent technique en paysage
          </p>
        </div>
      </section>

      {/* INTRO + EXPERTISE */}
      <section className={`${styles.section} ${styles.intro}`}>
        <div className={styles.sectionInner}>
          <p className={styles.introText}>
            J&apos;apporte aux maîtres d&apos;ouvrage, agences et bureaux
            d&apos;études l&apos;expertise technique, réglementaire et
            scientifique qui sécurise les projets de paysage. Quand un projet se
            complexifie — techniquement, réglementairement — j&apos;apporte des
            décisions claires et étayées.
          </p>
          <p className={styles.expertiseLine}>
            gestion des eaux pluviales · végétalisation du bâti · sol &amp;{" "}
            <span className={styles.expertiseAccent}>complexes végétatifs</span>{" "}
            · <span className={styles.expertiseAccent}>biodiversité</span> ·
            milieux urbains denses
          </p>
        </div>
      </section>

      {/* MISSIONS */}
      <section className={`${styles.section} ${styles.missions}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Missions</div>
          <div className={styles.missionsGrid}>
            {MISSIONS.map((m) => (
              <div key={m.titre} className={styles.missionCard}>
                <h3 className={styles.missionTitre}>{m.titre}</h3>
                <p className={styles.missionDesc}>{m.desc}</p>
              </div>
            ))}
          </div>
          <p className={styles.missionsNote}>
            Production graphique strictement technique — plans, coupes, détails
            d&apos;exécution, notes de calcul. La conception et l&apos;intention
            restent à la maîtrise d&apos;œuvre.
          </p>
        </div>
      </section>

      {/* PARCOURS */}
      <section className={`${styles.section} ${styles.parcours}`}>
        <div className={styles.parcoursInner}>
          <div className={styles.sectionLabel}>
            Du terrain à la maîtrise d&apos;œuvre
          </div>
          <p className={styles.parcoursText}>
            J&apos;ai exercé toute la chaîne du paysage — du jardinier au chef de
            projet en maîtrise d&apos;œuvre, en passant par les études
            techniques. Le terrain, la science et la réglementation réunis dans
            un même profil.{" "}
            <strong className={styles.parcoursStrong}>
              La rigueur de l&apos;ingénieur, au service du vivant.
            </strong>
          </p>
        </div>
      </section>

      {/* RÉFÉRENCES */}
      <section className={`${styles.section} ${styles.references}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Références</div>
          <h2 className={styles.sectionTitle}>Études de cas</h2>
          <ReferencesCarousel cas={CAS} autres={AUTRES} />
        </div>
      </section>

      {/* CONTACT */}
      <section className={`${styles.section} ${styles.contact}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Contact</div>
          <h2 className={styles.sectionTitle}>Discutons de votre projet</h2>
          <a href="mailto:tledu@sylve.eco" className={styles.contactBtn}>
            tledu@sylve.eco
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <p className={styles.contactNote}>Tarifs &amp; modalités sur demande</p>
        </div>
      </section>

      {/* PIED DE SECTION */}
      <section className={styles.retour}>
        <Link href="/" className={styles.retourLink}>
          Découvrez aussi les outils sylve →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>sylve</div>
        <p className={styles.footerCopy}>
          © 2026 sylve.eco — L&apos;intelligence numérique au service du paysage
        </p>
      </footer>
    </>
  );
}

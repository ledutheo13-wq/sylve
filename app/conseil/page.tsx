import Link from "next/link";
import type { Metadata } from "next";
import { Nav } from "../Nav";
import { CasCarousel } from "./CasCarousel";
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

const CAS = [
  {
    titre: "Obtenir un permis de construire en une seule itération",
    domaine: "Réglementaire · permis de construire",
    probleme:
      "Un dépôt de permis au volet paysage exposé au risque de rejet ou de demandes de compléments (conformité PLU, pleine terre, biodiversité).",
    action:
      "Dossier complet et étayé : notice PLU-biotope, calculs de surfaces pondérées et de coefficients (CBS/IVB), réponses anticipées aux services instructeurs.",
    resultat:
      "Permis obtenu sans demande de pièces complémentaires, en une seule itération.",
  },
  {
    titre: "Protéger le budget d'un maître d'ouvrage",
    domaine: "Appui MOA · sécurisation contractuelle",
    probleme:
      "Une entreprise de travaux demandait des prestations supplémentaires coûteuses, en requalifiant les contraintes du site pour imposer un matériau hors marché.",
    action:
      "Démonstration technique (normes de corrosion, exigences du CCTP) et mise en regard du dossier de marché, pièces à l'appui.",
    resultat:
      "Travaux supplémentaires écartés ; marché initial préservé, sans surcoût pour le maître d'ouvrage.",
  },
  {
    titre: "Auditer un dossier projet repris",
    domaine: "Audit & contrôle qualité",
    probleme:
      "Un dossier de projet (phase PRO / marché) repris en cours de route, avec des risques techniques, de coûts et de délais à clarifier.",
    action:
      "Audit complet : note de contrôle hiérarchisant les problématiques (qualité, coût, délai) et liste des pièces à corriger.",
    resultat:
      "Risques identifiés et priorisés, dossier remis sur des bases fiables avant de poursuivre.",
  },
  {
    titre: "Arbitrer une interface technique complexe",
    domaine: "Support MOE · sécurisation",
    probleme:
      "Sur un projet urbain dense, des arbres plantés sur dalle se trouvaient au droit de joints de dilatation de l'ouvrage : un conflit normatif (DTU 43.1, étanchéité) bloquait la validation.",
    action:
      "Définition d'un principe d'interface, argumentaire technique normé, validation par un bureau de contrôle.",
    resultat:
      "Avis favorable obtenu, et solution alternative préservant l'intention paysagère.",
  },
  {
    titre: "Diagnostic paysager des 4 piliers",
    domaine: "Appui MOA · diagnostic",
    probleme:
      "Un site sensible nécessitait un état des lieux objectif avant intervention : eau, sol, végétation, biodiversité.",
    action:
      "Diagnostic chiffré des quatre piliers : capacité d'infiltration des sols, état végétal, valeur écologique, leviers de gestion différenciée.",
    resultat:
      "Un socle de décision factuel, partagé entre maîtrise d'ouvrage et maîtrise d'œuvre.",
  },
  {
    titre: "Sécuriser la gestion des eaux pluviales",
    domaine: "Eaux pluviales · études techniques",
    probleme:
      "Justifier l'infiltration des eaux pluviales à la parcelle, sans données de sol fiables ni protocole d'essais.",
    action:
      "Rédaction du cahier des charges des essais de perméabilité (essais Porchet, noues, phytoépuration) et cadrage de la campagne de relevés.",
    resultat:
      "Une stratégie d'infiltration étayée par des mesures, défendable en instruction.",
  },
];

const AUTRES = [
  {
    titre: "Étude comparative de substrats",
    desc: "Analyse comparée de plusieurs solutions de substrats et terres pour fonder le choix technique le mieux adapté au projet.",
  },
  {
    titre: "Passage de réseaux près d'espaces plantés — séquence ÉRC",
    desc: "Étude Éviter-Réduire-Compenser : tracé, distances et protection du système racinaire (NF P98-332).",
  },
  {
    titre: "Études d'exécution & notes de calcul",
    desc: "Dimensionnements, calepinages et notes de calcul jusqu'à la réalisation.",
  },
  {
    titre: "Suivi de chantier (DET)",
    desc: "Détection et résolution des aléas en exécution (sols non ressuyés, drainage, pollutions) : la qualité tenue jusqu'à la réception.",
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
        </div>
        <CasCarousel cas={CAS} />

        <div className={styles.sectionInner}>
          <h3 className={styles.autresTitre}>Autres interventions</h3>
          <div className={styles.autresGrid}>
            {AUTRES.map((a) => (
              <div key={a.titre} className={styles.autreCard}>
                <h4 className={styles.autreTitre}>{a.titre}</h4>
                <p className={styles.autreDesc}>{a.desc}</p>
              </div>
            ))}
          </div>
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

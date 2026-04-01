import Link from "next/link";
import styles from "./page.module.css";
import { Nav } from "./Nav";

export default function Home() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>sylve.eco</div>
          <div className={styles.heroLogo}>sylve</div>
          <div className={styles.heroDivider} />
          <p className={styles.heroTagline}>
            L&apos;intelligence numérique
            <br />
            au service du paysage
          </p>

          <div className={styles.heroCtaGroup}>
            <Link href="/connexion" className={styles.btnPrimary}>
              Accéder aux outils
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                  stroke="white"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <span className={styles.heroNote}>
              Beta ouverte — Paysagistes professionnels
            </span>
          </div>
        </div>

        <div className={styles.scrollIndicator}>
          <span>Découvrir</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 2L7 12M7 12L2.5 7.5M7 12L11.5 7.5"
              stroke="#AAAAAA"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* MARQUES */}
      <section className={`${styles.section} ${styles.marques}`}>
        <div className={styles.sectionInner}>
          <div className={styles.marquesHeader}>
            <div className={styles.sectionLabel}>Les solutions</div>
            <h2 className={styles.sectionTitle}>
              Trois suites d&apos;outils,
              <br />
              un seul métier : le vôtre
            </h2>
            <p className={styles.sectionText}>
              Vous concevez des espaces, vous prescrivez, vous chiffrez, vous
              pilotez des missions. SYLVE vous accompagne à chaque étape.
            </p>
          </div>

          <div className={styles.marquesGrid}>
            {/* PROJET */}
            <div className={styles.marqueCard}>
              <div className={`${styles.marqueAccent} ${styles.accentGres}`} />
              <div className={styles.marqueLogo}>
                <span className={styles.marqueLogoName}>sylve</span>
                <span className={`${styles.marqueLogoSub} ${styles.subGres}`}>
                  projet
                </span>
              </div>
              <div className={styles.marqueTarget}>Concepteurs &amp; MOE</div>
              <p className={styles.marqueDesc}>
                Outils de conception et d&apos;aide technique pour le paysagiste
                maître d&apos;œuvre. De l&apos;esquisse au DCE.
              </p>
              <ul className={styles.marqueTools}>
                <li className={styles.marqueToolItem}>
                  Calculateurs techniques (charges, arrosage, soutènements,
                  platelages)
                </li>
                <li className={styles.marqueToolItem}>
                  Outils végétaux (palette, compatibilité, sélecteur)
                </li>
                <li className={styles.marqueToolItem}>
                  Générateur CCTP Paysage
                </li>
                <li className={styles.marqueToolItem}>Conformité PLU</li>
              </ul>
              <span className={`${styles.marqueBadge} ${styles.badgeActif}`}>
                Accès beta
              </span>
              <br />
              <Link
                href="/projet/compatibilite-vegetale"
                className={styles.vitrineLink}
              >
                Essayer la compatibilité végétale →
              </Link>
            </div>

            {/* PILOTE */}
            <div className={styles.marqueCard}>
              <div className={`${styles.marqueAccent} ${styles.accentTerre}`} />
              <div className={styles.marqueLogo}>
                <span className={styles.marqueLogoName}>sylve</span>
                <span className={`${styles.marqueLogoSub} ${styles.subTerre}`}>
                  pilote
                </span>
              </div>
              <div className={styles.marqueTarget}>
                Concepteurs &amp; indépendants
              </div>
              <p className={styles.marqueDesc}>
                Pilotez vos missions, suivez vos honoraires. Rentabilité, devis,
                tableau de bord — tout au même endroit.
              </p>
              <ul className={styles.marqueTools}>
                <li className={styles.marqueToolItem}>
                  Rentabilité missions (honoraires)
                </li>
                <li className={styles.marqueToolItem}>
                  Tableau de bord suivi missions
                </li>
                <li className={styles.marqueToolItem}>
                  Générateur devis honoraires
                </li>
              </ul>
              <span className={`${styles.marqueBadge} ${styles.badgeBientot}`}>
                Bientôt
              </span>
            </div>

            {/* SOURCE */}
            <div className={styles.marqueCard}>
              <div className={`${styles.marqueAccent} ${styles.accentOcre}`} />
              <div className={styles.marqueLogo}>
                <span className={styles.marqueLogoName}>sylve</span>
                <span className={`${styles.marqueLogoSub} ${styles.subOcre}`}>
                  source
                </span>
              </div>
              <div className={styles.marqueTarget}>
                Tous les professionnels
              </div>
              <p className={styles.marqueDesc}>
                Votre associé réglementaire. La bonne référence, au bon moment —
                NF, DTU, fascicules, règles professionnelles.
              </p>
              <ul className={styles.marqueTools}>
                <li className={styles.marqueToolItem}>
                  Questions en langage naturel
                </li>
                <li className={styles.marqueToolItem}>
                  Réponses sourcées (NF, DTU, fascicule 35)
                </li>
                <li className={styles.marqueToolItem}>
                  Lien direct vers le document
                </li>
              </ul>
              <span className={`${styles.marqueBadge} ${styles.badgeBientot}`}>
                Bientôt
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PROMESSE */}
      <section className={`${styles.section} ${styles.promesse}`}>
        <div className={styles.promesseInner}>
          <div
            className={styles.sectionLabel}
            style={{ textAlign: "center", marginBottom: 32 }}
          >
            La conviction
          </div>
          <p className={styles.promesseQuote}>
            &ldquo;En 10 minutes, pas en 2 jours.&rdquo;
          </p>
          <p className={styles.promesseAuthor}>
            Conçu par quelqu&apos;un qui a vécu le métier —
            <br />
            du terrain à la conception, du chantier à la MOE.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className={styles.ctaSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Accès</div>
          <h2 className={styles.sectionTitle}>Commencer à utiliser sylve</h2>
          <p className={styles.sectionText}>
            Créez un compte en quelques secondes. Email et mot de passe.
          </p>
          <Link
            href="/connexion"
            className={styles.btnPrimary}
            style={{ display: "inline-flex" }}
          >
            Accéder aux outils
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <p className={styles.ctaNote}>
            Beta ouverte — Paysagistes professionnels
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>sylve</div>
        <p className={styles.footerCopy}>
          © 2026 sylve.eco — L&apos;intelligence numérique au service du
          paysage
        </p>
      </footer>
    </>
  );
}

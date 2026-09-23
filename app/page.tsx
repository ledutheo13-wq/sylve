import Link from "next/link";
import styles from "./page.module.css";
import { Nav } from "./Nav";
import {
  famillesPleines,
  famillesAVenir,
  outilsDeFamille,
} from "@/lib/tools-catalog";

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
            L&apos;expertise et les outils
            <br />
            du projet de paysage
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

      {/* OUTILS DISPONIBLES */}
      <section
        id="outils"
        className={`${styles.section} ${styles.outilsSection}`}
      >
        <div className={styles.sectionInner}>
          <div className={styles.sectionLabel}>Les outils</div>
          <h2 className={styles.sectionTitle}>9 outils, par famille</h2>
          <p className={styles.outilsTagline}>
            Par un paysagiste, pour les paysagistes.
          </p>
          <p className={styles.sectionText}>
            Calculateurs, outils végétaux, gestion des eaux pluviales. Quatre
            outils en accès libre ; les autres sur simple compte.
          </p>

          {famillesPleines().map((fam) => (
            <div key={fam.id} className={styles.familleBlock}>
              <h3 className={styles.familleName}>{fam.nom}</h3>
              <div className={styles.outilsGrid}>
                {outilsDeFamille(fam.id).map((o) => {
                  const libre = o.acces === "libre";
                  return (
                    <Link
                      key={o.slug}
                      href={`/projet/${o.slug}`}
                      className={`${styles.outilCard} ${libre ? styles.outilCardVitrine : styles.outilCardLocked}`}
                    >
                      <div className={styles.outilCardTop}>
                        <span className={styles.outilIcon}>{o.emoji}</span>
                        <span
                          className={libre ? styles.outilBadgeEssayer : styles.outilBadgeLibre}
                        >
                          {libre ? "Accès libre" : "Compte requis"}
                        </span>
                      </div>
                      <div className={styles.outilName}>{o.nom}</div>
                      <div className={styles.outilDesc}>{o.description}</div>
                      <div className={styles.outilArrow}>Ouvrir l&apos;outil →</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className={styles.familleBlock}>
            <h3 className={styles.familleName}>À venir</h3>
            <div className={styles.teaserRow}>
              {famillesAVenir().map((fam) => (
                <span key={fam.id} className={styles.teaserChip}>
                  {fam.nom}
                </span>
              ))}
            </div>
          </div>

          <p className={styles.outilsCta}>
            <Link href="/projet">Explorer tous les outils par famille →</Link>
          </p>
        </div>
      </section>

      {/* MARQUES */}
      <section className={`${styles.section} ${styles.marques}`}>
        <div className={styles.sectionInner}>
          <div className={styles.marquesHeader}>
            <div className={styles.sectionLabel}>Les briques</div>
            <h2 className={styles.sectionTitle}>
              Ce que sylve
              <br />
              regroupe aujourd&apos;hui.
            </h2>
            <p className={styles.sectionText}>
              Concevoir, prescrire, chiffrer, vérifier — les briques techniques
              du projet de paysage, réunies au même endroit.
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
            </div>

            {/* PILOTE — retiré de la vitrine publique pour l'instant
                (produit non abandonné, carte réactivable)
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
            */}

            {/* SOURCE */}
            <div className={styles.marqueCard}>
              <div className={`${styles.marqueAccent} ${styles.accentOcre}`} />
              <div className={styles.marqueLogo}>
                <span className={styles.marqueLogoName}>sylve</span>
                <span className={`${styles.marqueLogoSub} ${styles.subOcre}`}>
                  source
                </span>
              </div>
              <div className={styles.marqueTarget}>Recherche réglementaire</div>
              <p className={styles.marqueDesc}>
                Retrouver la bonne référence, au bon moment — NF, DTU,
                fascicules, règles professionnelles.
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
            &ldquo;La technique du paysage, en 10 minutes.&rdquo;
          </p>
          <p className={styles.promesseAuthor}>
            Conçu par un paysagiste qui a vécu le métier —
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
        <nav className={styles.footerNav}>
          <a
            href="https://www.linkedin.com/in/theoledu"
            className={styles.footerLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </nav>
        <p className={styles.footerCopy}>
          © 2026 sylve.eco — projet personnel de Théo Le Du, ingénieur
          paysagiste
        </p>
      </footer>
    </>
  );
}

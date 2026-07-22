import Link from "next/link";
import { ProjetShell } from "@/components/layout/ProjetShell";
import {
  famillesPleines,
  famillesAVenir,
  outilsDeFamille,
  aVenirDeFamille,
} from "@/lib/tools-catalog";
import { OutilCard, AVenirRow } from "./_components/OutilCard";
import styles from "./projet.module.css";

export const metadata = {
  title: "Outils du projet de paysage, par famille — sylve projet",
  description:
    "Le hub des outils sylve projet, organisés par famille : végétaux, ouvrages, irrigation, gestion des eaux pluviales. Accès libre ou sur compte.",
};

// Hub public : un encart par famille (outils cliquables + « Voir la famille »).
export default function ProjetHubPage() {
  const pleines = famillesPleines();
  const aVenir = famillesAVenir();

  return (
    <ProjetShell>
      <main className={styles.page}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>sylve projet</div>
          <h1 className={styles.title}>Les outils, par famille</h1>
          <p className={styles.sub}>
            Des outils de conception et d&apos;aide technique pour le projet de
            paysage, de l&apos;esquisse au DCE. Cliquez un outil, ou explorez
            une famille.
          </p>
        </div>

        <div className={styles.familles}>
          {pleines.map((fam) => (
            <section key={fam.id} className={styles.familleCard}>
              <div className={styles.familleHead}>
                <h2 className={styles.familleNom}>{fam.nom}</h2>
                <Link href={`/projet/${fam.slug}`} className={styles.familleLink}>
                  Voir la famille &rarr;
                </Link>
              </div>
              <p className={styles.familleDesc}>{fam.description}</p>
              <div className={styles.outilsGrid}>
                {outilsDeFamille(fam.id).map((o) => (
                  <OutilCard key={o.slug} outil={o} />
                ))}
              </div>
              <AVenirRow items={aVenirDeFamille(fam.id)} />
            </section>
          ))}
        </div>

        {/* Familles à venir (teasers) */}
        <div className={styles.sectionLabel}>À venir</div>
        <div className={styles.familles}>
          {aVenir.map((fam) => (
            <section key={fam.id} className={styles.familleTeaser}>
              <div className={styles.familleHead}>
                <h2 className={styles.familleNom}>{fam.nom}</h2>
                <span className={styles.teaserBadge}>Bientôt</span>
              </div>
              <p className={styles.familleDesc}>{fam.description}</p>
              <AVenirRow items={aVenirDeFamille(fam.id)} />
            </section>
          ))}
        </div>
      </main>
    </ProjetShell>
  );
}

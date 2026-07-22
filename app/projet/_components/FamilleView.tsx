import { notFound } from "next/navigation";
import { ProjetShell } from "@/components/layout/ProjetShell";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { familleBySlug, outilsDeFamille, aVenirDeFamille } from "@/lib/tools-catalog";
import { OutilCard, AVenirRow } from "./OutilCard";
import styles from "../projet.module.css";

// Page famille : outils « en plein » + les « à venir » de la famille.
export function FamilleView({ familleSlug }: { familleSlug: string }) {
  const fam = familleBySlug(familleSlug);
  if (!fam) notFound();

  const outils = outilsDeFamille(fam.id);
  const aVenir = aVenirDeFamille(fam.id);

  return (
    <ProjetShell breadcrumb={<Breadcrumb familleSlug={fam.slug} />}>
      <main className={styles.page}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}>sylve projet · famille</div>
          <h1 className={styles.title}>{fam.nom}</h1>
          <p className={styles.sub}>{fam.description}</p>
        </div>

        <div className={styles.outilsGrid}>
          {outils.map((o) => (
            <OutilCard key={o.slug} outil={o} />
          ))}
        </div>

        {aVenir.length > 0 && (
          <>
            <div className={styles.sectionLabel}>À venir dans cette famille</div>
            <AVenirRow items={aVenir} />
          </>
        )}

        <div className={styles.cta}>
          <a href="/projet" className={styles.ctaLink}>
            &larr; Toutes les familles
          </a>
        </div>
      </main>
    </ProjetShell>
  );
}

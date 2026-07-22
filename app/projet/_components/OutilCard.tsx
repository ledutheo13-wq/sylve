import Link from "next/link";
import type { Outil, AVenir } from "@/lib/tools-catalog";
import { href } from "@/lib/tools-catalog";
import styles from "../projet.module.css";

// Carte d'un outil live, avec badge d'accès (libre / compte).
export function OutilCard({ outil }: { outil: Outil }) {
  const libre = outil.acces === "libre";
  return (
    <Link href={href(outil.slug)} className={styles.outilCard}>
      <div className={styles.outilTop}>
        <span className={styles.outilIcon} aria-hidden>
          {outil.emoji}
        </span>
        <span className={`${styles.badge} ${libre ? styles.badgeLibre : styles.badgeCompte}`}>
          {libre ? "Accès libre" : "Compte requis"}
        </span>
      </div>
      <div className={styles.outilNom}>{outil.nom}</div>
      <div className={styles.outilDesc}>{outil.description}</div>
      <div className={styles.outilArrow}>
        {libre ? "Ouvrir l'outil" : "Créer un compte"} &rarr;
      </div>
    </Link>
  );
}

// Rangée compacte des outils « à venir » d'une famille (non cliquables).
export function AVenirRow({ items }: { items: AVenir[] }) {
  if (items.length === 0) return null;
  return (
    <div className={styles.aVenirRow}>
      <span className={styles.aVenirLabel}>À venir</span>
      {items.map((a) => (
        <span key={a.nom} className={styles.aVenirChip} title={a.description}>
          {a.nom}
        </span>
      ))}
    </div>
  );
}

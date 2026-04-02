import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

const availableTools = [
  {
    emoji: "⬜",
    name: "Calculateur de charges sur dalle",
    desc: "Calcul du poids d\u2019un complexe végétatif en kg/m², avec schéma en coupe interactif et synchronisé.",
    href: "/projet/calculateur-charges",
  },
  {
    emoji: "💧",
    name: "Calculateur d\u2019arrosage",
    desc: "Estimez les besoins en eau de vos aménagements paysagers par zone et par mois.",
    href: "/projet/arrosage",
  },
  {
    emoji: "🧱",
    name: "Calculateur de soutènements",
    desc: "Vérifiez la stabilité de vos petits soutènements paysagers par calcul de poussée de terre (Rankine).",
    href: "/projet/soutenements",
  },
  {
    emoji: "🪵",
    name: "Calculateur de platelages bois",
    desc: "Dimensionnez vos platelages extérieurs en bois conformément au DTU 51.4.",
    href: "/projet/platelages",
  },
  {
    emoji: "🌿",
    name: "Compatibilité végétale",
    desc: "Analysez la compatibilité botanique et écologique de vos mélanges végétaux.",
    href: "/projet/compatibilite-vegetale",
  },
  {
    emoji: "📅",
    name: "Calendrier phénologique",
    desc: "Générez un calendrier de floraison et de feuillage pour votre palette végétale. Export PNG.",
    href: "/projet/calendrier-phenologique",
  },
  {
    emoji: "🌳",
    name: "Sélecteur d\u2019essences",
    desc: "Trouvez les essences adaptées à votre site et composez votre palette végétale par mélanges.",
    href: "/projet/selecteur-essences",
  },
];

const upcomingTools = [
  {
    emoji: "📐",
    name: "Calculateur conformité PLU",
    desc: "Vérification CBS, IVB, pourcentage d\u2019indigènes. Suggestions d\u2019optimisation par palier.",
  },
  {
    emoji: "📄",
    name: "Générateur CCTP + DPGF",
    desc: "Document vivant, synchronisation temps réel entre CCTP et DPGF. Codification unifiée.",
  },
];

export default async function ProjetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let prenom: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("prenom")
      .eq("id", user.id)
      .single();
    prenom = profile?.prenom || null;
  }

  return (
    <main className={styles.page}>
      {/* Intro */}
      <div className={styles.pageIntro}>
        <div className={styles.pageEyebrow}>Tableau de bord</div>
        <h1 className={styles.pageTitle}>
          {prenom ? `Bonjour ${prenom}` : "Vos outils"}
        </h1>
        <p className={styles.pageSub}>
          Outils techniques pour les professionnels du paysage. En accès libre pendant
          la phase beta.
        </p>
      </div>

      {/* Available tools */}
      <div className={styles.sectionLabel}>Outils disponibles</div>
      <div className={styles.toolsGrid}>
        {availableTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={styles.toolCard}
          >
            <div className={styles.toolCardTop}>
              <span className={styles.toolIcon}>{tool.emoji}</span>
              <span className={styles.toolTagGratuit}>Accès libre</span>
            </div>
            <div className={styles.toolName}>{tool.name}</div>
            <div className={styles.toolDesc}>{tool.desc}</div>
            <div className={styles.toolArrow}>Ouvrir l&apos;outil &rarr;</div>
          </Link>
        ))}
      </div>

      {/* Upcoming tools */}
      <div className={styles.sectionLabel}>&Agrave; venir</div>
      <div className={styles.toolsGrid}>
        {upcomingTools.map((tool) => (
          <div key={tool.name} className={styles.toolCardLocked}>
            <div className={styles.toolCardTop}>
              <span className={styles.toolIcon}>{tool.emoji}</span>
              <span className={styles.toolTagBientot}>Bient&ocirc;t</span>
            </div>
            <div className={styles.toolName}>{tool.name}</div>
            <div className={styles.toolDesc}>{tool.desc}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

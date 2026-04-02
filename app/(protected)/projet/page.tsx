import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

const availableTools = [
  {
    emoji: "\u2B1C",
    name: "Calculateur de charges sur dalle",
    desc: "Calcul du poids d\u2019un complexe v\u00e9g\u00e9tatif en kg/m\u00b2, avec sch\u00e9ma en coupe interactif et synchronis\u00e9.",
    href: "/projet/calculateur-charges",
  },
  {
    emoji: "\uD83D\uDCA7",
    name: "Calculateur d\u2019arrosage",
    desc: "Estimez les besoins en eau de vos am\u00e9nagements paysagers par zone et par mois.",
    href: "/projet/arrosage",
  },
  {
    emoji: "\uD83E\uDDF1",
    name: "Calculateur de sout\u00e8nements",
    desc: "V\u00e9rifiez la stabilit\u00e9 de vos petits sout\u00e8nements paysagers par calcul de pouss\u00e9e de terre (Rankine).",
    href: "/projet/soutenements",
  },
  {
    emoji: "\uD83E\uDEB5",
    name: "Calculateur de platelages bois",
    desc: "Dimensionnez vos platelages ext\u00e9rieurs en bois conform\u00e9ment au DTU 51.4.",
    href: "/projet/platelages",
  },
  {
    emoji: "\uD83C\uDF3F",
    name: "Compatibilit\u00e9 v\u00e9g\u00e9tale",
    desc: "Analysez la compatibilit\u00e9 botanique et \u00e9cologique de vos m\u00e9langes v\u00e9g\u00e9taux.",
    href: "/projet/compatibilite-vegetale",
  },
  {
    emoji: "\uD83D\uDCC5",
    name: "Calendrier ph\u00e9nologique",
    desc: "G\u00e9n\u00e9rez un calendrier de floraison et de feuillage pour votre palette v\u00e9g\u00e9tale. Export PNG.",
    href: "/projet/calendrier-phenologique",
  },
  {
    emoji: "\uD83C\uDF33",
    name: "S\u00e9lecteur d\u2019essences",
    desc: "Trouvez les essences adapt\u00e9es \u00e0 votre site et composez votre palette v\u00e9g\u00e9tale par m\u00e9langes.",
    href: "/projet/selecteur-essences",
  },
];

const upcomingTools = [
  {
    emoji: "\uD83D\uDCD0",
    name: "Calculateur conformit\u00e9 PLU",
    desc: "V\u00e9rification CBS, IVB, pourcentage d\u2019indig\u00e8nes. Suggestions d\u2019optimisation par palier.",
  },
  {
    emoji: "\uD83D\uDCC4",
    name: "G\u00e9n\u00e9rateur CCTP + DPGF",
    desc: "Document vivant, synchronisation temps r\u00e9el entre CCTP et DPGF. Codification unifi\u00e9e.",
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
          Outils techniques pour les professionnels du paysage. Gratuits pendant
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
              <span className={styles.toolTagGratuit}>Gratuit</span>
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

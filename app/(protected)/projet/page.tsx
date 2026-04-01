import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

const tools = [
  { name: "Calculateur de charges sur dalle", emoji: "📐", href: "/projet/calculateur-charges", active: true },
  { name: "Calculateur d'arrosage", emoji: "💧", href: "/projet/arrosage", active: true },
  { name: "Calculateur de soutènements", emoji: "🧱", href: "/projet/soutenements", active: true },
  { name: "Calculateur de platelages bois", emoji: "🪵", href: "/projet/platelages", active: true },
  { name: "Compatibilité végétale", emoji: "🌿", href: "/projet/compatibilite-vegetale", active: true },
  { name: "Calendrier phénologique", emoji: "📅", href: "/projet/calendrier-phenologique", active: true },
  { name: "Sélecteur d'essences", emoji: "🌳", href: "/projet/selecteur-essences", active: true },
  { name: "Calculateur conformité PLU", emoji: "📋", href: "#", active: false },
  { name: "Générateur CCTP + DPGF", emoji: "📄", href: "#", active: false },
];

export default function ProjetPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px" }}>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 400,
          marginBottom: 8,
          color: "var(--text)",
        }}
      >
        Outils SYLVE Projet
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          marginBottom: 32,
        }}
      >
        Conception et aide technique — de l&apos;esquisse au DCE
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {tools.map((t) => {
          const card = (
            <div
              key={t.name}
              style={{
                padding: 24,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                opacity: t.active ? 1 : 0.55,
                cursor: t.active ? "pointer" : "default",
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{t.emoji}</span>
                <Badge variant={t.active ? "beta" : "soon"}>
                  {t.active ? "Accès libre" : "Bientôt"}
                </Badge>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                {t.name}
              </h3>
            </div>
          );

          if (t.active) {
            return <Link key={t.name} href={t.href}>{card}</Link>;
          }
          return <div key={t.name}>{card}</div>;
        })}
      </div>
    </main>
  );
}

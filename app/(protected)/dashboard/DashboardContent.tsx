"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/Badge";

const tools = [
  {
    name: "SYLVE Projet",
    desc: "Conception et aide technique",
    href: "/projet",
    color: "var(--gres)",
    active: true,
  },
  {
    name: "SYLVE Pilote",
    desc: "Gestion de missions et honoraires",
    href: "/pilote",
    color: "var(--terre)",
    active: false,
  },
  {
    name: "SYLVE Source",
    desc: "Votre associé réglementaire",
    href: "/source",
    color: "var(--ocre)",
    active: false,
  },
];

export function DashboardContent({ prenom }: { prenom: string | null }) {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("sylve_welcome_seen")) {
      setShowWelcome(true);
      localStorage.setItem("sylve_welcome_seen", "true");
    }
  }, []);

  return (
    <>
      <AppHeader />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 32px" }}>
        {showWelcome && (
          <div
            style={{
              padding: 32,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Vous rejoignez la beta de SYLVE. Tous les outils sont en accès
              libre. Vos retours nous aident à construire les outils dont le
              métier a besoin.
            </p>
          </div>
        )}

        <h1
          style={{
            fontSize: 22,
            fontWeight: 400,
            marginBottom: 32,
            color: "var(--text)",
          }}
        >
          {prenom ? `Bonjour, ${prenom}` : "Vos outils"}
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {tools.map((t) => (
            <ToolCard key={t.name} tool={t} />
          ))}
        </div>
      </main>
    </>
  );
}

function ToolCard({
  tool,
}: {
  tool: (typeof tools)[number];
}) {
  const content = (
    <div
      style={{
        padding: 28,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        opacity: tool.active ? 1 : 0.6,
        cursor: tool.active ? "pointer" : "default",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: tool.color,
          }}
        >
          {tool.name}
        </h3>
        <Badge variant={tool.active ? "beta" : "soon"}>
          {tool.active ? "Accès beta" : "Bientôt"}
        </Badge>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {tool.desc}
      </p>
    </div>
  );

  if (tool.active) {
    return <Link href={tool.href}>{content}</Link>;
  }
  return content;
}

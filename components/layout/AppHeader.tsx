"use client";

import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export function AppHeader() {
  const { profile, supabase } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/connexion");
  }

  const prenom = profile?.prenom;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 32px",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Logo href="/dashboard" />
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {prenom && (
          <span style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Bonjour, <strong style={{ color: "var(--text)" }}>{prenom}</strong>
          </span>
        )}
        <button
          onClick={handleLogout}
          style={{
            fontSize: 13,
            color: "var(--text-light)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}

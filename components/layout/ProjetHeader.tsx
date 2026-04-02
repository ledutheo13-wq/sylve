"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

export function ProjetHeader() {
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
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 52,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
        <Link
          href="https://sylve.eco"
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 300,
            fontSize: "1.1rem",
            letterSpacing: "0.18em",
            color: "var(--primary)",
            textDecoration: "none",
          }}
        >
          sylve
        </Link>
        <span
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            color: "#8A8279",
            textTransform: "uppercase",
          }}
        >
          projet
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {prenom && (
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            Bonjour,{" "}
            <strong style={{ color: "var(--text)", fontWeight: 400 }}>
              {prenom}
            </strong>
          </span>
        )}
        <button
          onClick={handleLogout}
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: "0.72rem",
            color: "var(--text-light)",
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "4px 10px",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}

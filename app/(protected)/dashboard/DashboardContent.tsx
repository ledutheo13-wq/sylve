"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export function DashboardContent({ prenom }: { prenom: string | null }) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [ready, setReady] = useState(false);
  const { profile, supabase } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("sylve_welcome_seen")) {
      setShowWelcome(true);
    }
    setReady(true);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/connexion");
  }

  function dismissWelcome() {
    localStorage.setItem("sylve_welcome_seen", "true");
    setShowWelcome(false);
  }

  const displayName = prenom || profile?.prenom;

  if (!ready) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          padding: "1.4rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 300,
            fontSize: "1.15rem",
            letterSpacing: "0.18em",
            color: "var(--primary)",
            textDecoration: "none",
          }}
        >
          sylve
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {displayName || ""}
          </span>
          <button
            onClick={handleLogout}
            style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: "0.72rem",
              color: "var(--text-light)",
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "6px 12px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main */}
      <main className={styles.page}>
        {showWelcome ? (
          /* Welcome Screen */
          <div className={styles.welcomeOverlay}>
            <div className={styles.welcomeContent}>
              <div className={styles.welcomeLogo}>sylve</div>
              <h2 className={styles.welcomeTitle}>
                Vous rejoignez la beta de SYLVE
              </h2>
              <p className={styles.welcomeDesc}>
                Tous les outils sont en accès libre.
                <br />
                Vos retours nous aident à construire les outils dont vous avez
                besoin.
              </p>
              <button className={styles.welcomeBtn} onClick={dismissWelcome}>
                Accéder au dashboard
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                    stroke="white"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Dashboard */
          <div className={styles.container}>
            <div className={styles.eyebrow}>Vos outils</div>
            <h1 className={styles.title}>
              {displayName ? `Bonjour, ${displayName}` : "Vos outils"}
            </h1>

            <div className={styles.toolsGrid}>
              {/* SYLVE Projet */}
              <Link href="/projet" className={styles.toolCard}>
                <div className={styles.toolIcon} style={{ background: "#8A8279" }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div className={styles.toolName} style={{ color: "#8A8279" }}>
                  SYLVE Projet
                </div>
                <div className={styles.toolLabel}>
                  Conception et aide technique
                </div>
                <div className={styles.toolSub}>
                  Charges sur dalle · Arrosage · Soutènements · Platelages bois ·{" "}
                  <span className={styles.toolSubHighlight}>
                    Compatibilité végétale
                  </span>{" "}
                  <span className={styles.toolSubBadge}>Beta</span> ·{" "}
                  <span className={styles.toolSubHighlight}>
                    Calendrier phénologique
                  </span>{" "}
                  <span className={styles.toolSubBadge}>Beta</span> ·{" "}
                  <span className={styles.toolSubHighlight}>
                    Sélecteur d&apos;essences
                  </span>{" "}
                  <span className={styles.toolSubBadge}>Beta</span>
                </div>
              </Link>

              {/* SYLVE Pilote */}
              <div className={styles.toolCardDisabled}>
                <span className={styles.badgeSoon}>bientot</span>
                <div className={styles.toolIcon} style={{ background: "#A67C5B" }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20v-4" />
                  </svg>
                </div>
                <div className={styles.toolName} style={{ color: "#A67C5B" }}>
                  SYLVE Pilote
                </div>
                <div className={styles.toolLabel}>
                  Gestion de missions et honoraires
                </div>
              </div>

              {/* SYLVE Source */}
              <div className={styles.toolCardDisabled}>
                <span className={styles.badgeSoon}>bientot</span>
                <div className={styles.toolIcon} style={{ background: "#C4973B" }}>
                  <svg viewBox="0 0 24 24">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div className={styles.toolName} style={{ color: "#C4973B" }}>
                  SYLVE Source
                </div>
                <div className={styles.toolLabel}>
                  Votre associé réglementaire
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        sylve.eco — outils numériques pour les professionnels du paysage
      </footer>
    </div>
  );
}

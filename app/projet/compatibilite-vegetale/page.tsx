import { createClient } from "@/lib/supabase/server";
import { plantes } from "@/lib/plantes";
import { ProjetHeader } from "@/components/layout/ProjetHeader";
import { AuthProvider } from "@/components/auth/AuthProvider";
import CompatibiliteVegetale from "./CompatibiliteVegetale";

export default async function CompatibiliteVitrinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, show full version with auth context
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("prenom, email, entreprise, metier")
      .eq("id", user.id)
      .single();

    return (
      <AuthProvider user={user} profile={profile}>
        <ProjetHeader />
        <CompatibiliteVegetale plantes={plantes} />
      </AuthProvider>
    );
  }

  // Not logged in: vitrine mode (limited features)
  return (
    <>
      <VitrineHeader />
      <CompatibiliteVegetale plantes={plantes} vitrine />
    </>
  );
}

function VitrineHeader() {
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
        <a
          href="/"
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
        </a>
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
      <a
        href="/connexion"
        style={{
          fontFamily: "DM Sans, sans-serif",
          fontSize: "0.78rem",
          color: "var(--primary)",
          textDecoration: "none",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "6px 14px",
          transition: "all 0.15s",
        }}
      >
        Créer un compte
      </a>
    </header>
  );
}

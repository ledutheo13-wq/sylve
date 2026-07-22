import Link from "next/link";

// En-tête « vitrine » pour les pages projet publiques (visiteur non connecté).
export function VitrineHeader() {
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
        </Link>
        <Link
          href="/projet"
          style={{
            fontSize: "0.72rem",
            letterSpacing: "0.14em",
            color: "#8A8279",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          projet
        </Link>
      </div>
      <Link
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
      </Link>
    </header>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type View = "login" | "signup" | "forgot" | "recovery";

export default function ConnexionPage() {
  const supabase = createClient();
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email ou mot de passe incorrect."
          : error.message === "Email not confirmed"
            ? "Veuillez confirmer votre email avant de vous connecter."
            : error.message
      );
      return;
    }
    router.push("/dashboard");
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(`Un email de vérification a été envoyé à ${email}`);
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion?type=recovery`,
    });
    setLoading(false);
    setSuccess("Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.");
  }

  if (success) {
    return (
      <Container>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {success}
          </p>
          <button
            onClick={() => { setSuccess(""); setView("login"); }}
            style={{ ...linkStyle, marginTop: 24 }}
          >
            Retour à la connexion
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <span
        style={{
          fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
          fontWeight: 300,
          fontSize: 24,
          letterSpacing: 10,
          color: "var(--primary)",
          marginBottom: 32,
        }}
      >
        sylve
      </span>

      {error && (
        <p style={{ color: "var(--error)", fontSize: 13, marginBottom: 16 }}>{error}</p>
      )}

      {view === "login" && (
        <form onSubmit={handleLogin} style={formStyle}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "..." : "Se connecter"}
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <button type="button" onClick={() => { setError(""); setView("signup"); }} style={linkStyle}>Créer un compte</button>
            <button type="button" onClick={() => { setError(""); setView("forgot"); }} style={linkStyle}>Mot de passe oublié</button>
          </div>
        </form>
      )}

      {view === "signup" && (
        <form onSubmit={handleSignup} style={formStyle}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Mot de passe (8 caractères min.)" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="Confirmer le mot de passe" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required style={inputStyle} />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "..." : "Créer mon compte"}
          </button>
          <button type="button" onClick={() => { setError(""); setView("login"); }} style={linkStyle}>
            Déjà un compte ? Se connecter
          </button>
        </form>
      )}

      {view === "forgot" && (
        <form onSubmit={handleForgot} style={formStyle}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "..." : "Envoyer le lien"}
          </button>
          <button type="button" onClick={() => { setError(""); setView("login"); }} style={linkStyle}>
            Retour à la connexion
          </button>
        </form>
      )}
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 16px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontSize: 14,
  background: "var(--surface)",
  color: "var(--text)",
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  padding: "12px 24px",
  background: "var(--primary)",
  color: "var(--surface)",
  border: "none",
  borderRadius: "var(--radius)",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  marginTop: 4,
};

const linkStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--text-secondary)",
  cursor: "pointer",
  fontSize: 13,
};

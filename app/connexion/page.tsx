"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";

type View = "signup" | "login" | "forgot" | "recovery" | "signup-success";

export default function ConnexionPage() {
  const supabase = createClient();
  const router = useRouter();
  const [view, setView] = useState<View>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [resent, setResent] = useState(false);

  // Détecte les retours des liens email (récupération de mot de passe, lien invalide).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("type") === "recovery") {
      setView("recovery");
    } else if (params.get("error") === "lien_invalide") {
      setView("login");
      setError(
        "Le lien a expiré ou a déjà été utilisé. Connectez-vous, ou recréez un compte si besoin."
      );
    }
  }, []);

  async function handleResend() {
    setError("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: sentEmail,
    });
    if (error) setError(error.message);
    else setResent(true);
  }

  async function handleRecovery(e: React.FormEvent) {
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
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
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
    setSentEmail(email);
    setView("signup-success");
  }

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

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/connexion?type=recovery`,
    });
    setLoading(false);
    setSentEmail(email);
    setView("signup-success");
  }

  function switchView(v: View) {
    setError("");
    setView(v);
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.loginCard}>
          <Link href="/" className={styles.logo}>sylve</Link>

          <div className={styles.card}>
            {/* SIGNUP SUCCESS */}
            {view === "signup-success" && (
              <div className={styles.successView}>
                <div className={styles.successIcon}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M4 11L9 16L18 6" stroke="#5E8B8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className={styles.successTitle}>Vérifiez votre boîte mail</p>
                <p className={styles.successText}>
                  Un email de vérification a été envoyé à<br />
                  <span className={styles.successEmail}>{sentEmail}</span>
                </p>
                <p className={styles.successText}>Cliquez sur le lien pour activer votre compte.</p>
                <p className={styles.successNote}>Vérifiez vos courriers indésirables si vous ne le trouvez pas.</p>
                {sentEmail && (
                  <div className={styles.viewLinks}>
                    {resent ? (
                      <span className={styles.successNote}>Nouvel email envoyé.</span>
                    ) : (
                      <button type="button" className={styles.viewLink} onClick={handleResend}>
                        Pas reçu ? <span className={styles.viewLinkAccent}>Renvoyer l&apos;email</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* RECOVERY — définir un nouveau mot de passe */}
            {view === "recovery" && (
              <form onSubmit={handleRecovery}>
                <h1 className={styles.cardTitle}>Nouveau mot de passe</h1>
                <p className={styles.cardSubtitle}>Choisissez un nouveau mot de passe pour votre compte.</p>

                {error && <div className={`${styles.message} ${styles.messageError}`}>{error}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Nouveau mot de passe</label>
                  <input type="password" className={styles.input} placeholder="Minimum 8 caractères" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoFocus />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirmer le mot de passe</label>
                  <input type="password" className={styles.input} placeholder="Confirmer le mot de passe" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? "..." : "Définir le mot de passe"}
                </button>
              </form>
            )}

            {/* SIGNUP */}
            {view === "signup" && (
              <form onSubmit={handleSignup}>
                <h1 className={styles.cardTitle}>Créer un compte</h1>
                <p className={styles.cardSubtitle}>Aucun engagement. Accédez à tous les outils SYLVE.</p>

                {error && <div className={`${styles.message} ${styles.messageError}`}>{error}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Adresse email</label>
                  <input type="email" className={styles.input} placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mot de passe</label>
                  <input type="password" className={styles.input} placeholder="Minimum 8 caractères" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Confirmer le mot de passe</label>
                  <input type="password" className={styles.input} placeholder="Confirmer le mot de passe" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required />
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? "..." : "Créer mon compte"}
                </button>

                <div className={styles.viewLinks}>
                  <button type="button" className={styles.viewLink} onClick={() => switchView("login")}>
                    Déjà un compte ? <span className={styles.viewLinkAccent}>Se connecter</span>
                  </button>
                </div>
              </form>
            )}

            {/* LOGIN */}
            {view === "login" && (
              <form onSubmit={handleLogin}>
                <h1 className={styles.cardTitle}>Se connecter</h1>
                <p className={styles.cardSubtitle}>Accédez à vos outils.</p>

                {error && <div className={`${styles.message} ${styles.messageError}`}>{error}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Adresse email</label>
                  <input type="email" className={styles.input} placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Mot de passe</label>
                  <input type="password" className={styles.input} placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? "..." : "Se connecter"}
                </button>

                <div className={styles.viewLinks}>
                  <button type="button" className={styles.viewLink} onClick={() => switchView("signup")}>
                    Pas encore de compte ? <span className={styles.viewLinkAccent}>Créer un compte</span>
                  </button>
                  <br />
                  <button type="button" className={styles.viewLink} onClick={() => switchView("forgot")}>
                    Mot de passe oublié ?
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT */}
            {view === "forgot" && (
              <form onSubmit={handleForgot}>
                <h1 className={styles.cardTitle}>Mot de passe oublié</h1>
                <p className={styles.cardSubtitle}>Entrez votre email pour recevoir un lien de réinitialisation.</p>

                {error && <div className={`${styles.message} ${styles.messageError}`}>{error}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Adresse email</label>
                  <input type="email" className={styles.input} placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? "..." : "Envoyer le lien"}
                </button>

                <div className={styles.viewLinks}>
                  <button type="button" className={styles.viewLink} onClick={() => switchView("login")}>
                    Retour à la <span className={styles.viewLinkAccent}>connexion</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerBack}>← Retour à sylve.eco</Link>
        <span className={styles.footerCopy}>© 2026 sylve.eco</span>
      </footer>
    </>
  );
}

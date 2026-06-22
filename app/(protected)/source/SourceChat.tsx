"use client";

/**
 * SYLVE Source — Chat + panneau de sources (Phase 2, perso, minimal)
 *
 * Gauche : question -> réponse avec pastilles numérotées [n] cliquables.
 * Droite : panneau de sources (façon NotebookLM). Pour chaque source citée,
 * l'ARTICLE COMPLET avec le PASSAGE CITÉ SURLIGNÉ (offsets). Dégradation
 * gracieuse : si pas de texte intégral / offsets inexploitables, on affiche
 * l'extrait. Le panneau ne casse jamais.
 */

import { useRef, useState } from "react";
import styles from "./page.module.css";

type SourceCitation = {
  n: number;
  id: number;
  document: string;
  page: number;
  article: string | null;
  chunk_text: string;
  article_full_text: string | null;
  chunk_start: number | null;
  chunk_end: number | null;
  similarity: number;
};

type AskResult = {
  answer: string;
  out_of_base: boolean;
  sources: SourceCitation[];
};

export default function SourceChat() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResult | null>(null);
  const [activeN, setActiveN] = useState<number | null>(null);

  const sourceRefs = useRef<Record<number, HTMLDivElement | null>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveN(null);

    try {
      const res = await fetch("/api/source/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "Erreur.");
        return;
      }
      setResult(data as AskResult);
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  }

  function focusSource(n: number) {
    setActiveN(n);
    sourceRefs.current[n]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Réponse : transforme les marqueurs [n] en pastilles cliquables, préserve
  // les retours à la ligne (white-space: pre-wrap sur le conteneur).
  function renderAnswer(answer: string) {
    return answer.split(/(\[\d+\])/g).map((part, i) => {
      const m = part.match(/^\[(\d+)\]$/);
      if (m) {
        const n = Number(m[1]);
        return (
          <button
            key={i}
            type="button"
            className={styles.pill}
            onClick={() => focusSource(n)}
            title={`Voir la source ${n}`}
          >
            {n}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  // Corps d'une source : article complet + passage surligné, ou repli sur
  // l'extrait si le texte intégral / les offsets ne sont pas exploitables.
  function renderSourceBody(s: SourceCitation) {
    const full = s.article_full_text;
    const { chunk_start: start, chunk_end: end } = s;
    const offsetsOk =
      full != null &&
      start != null &&
      end != null &&
      end > start &&
      end <= full.length;

    if (!full || !offsetsOk) {
      return <p className={styles.sourceText}>{s.chunk_text}</p>;
    }
    return (
      <p className={styles.sourceText}>
        {full.slice(0, start!)}
        <mark className={styles.mark}>{full.slice(start!, end!)}</mark>
        {full.slice(end!)}
      </p>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>sylve source</h1>
        <p className={styles.subtitle}>
          Assistant réglementaire — répond uniquement à partir des documents
          ingérés, chaque affirmation est sourcée.
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <textarea
          className={styles.input}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Pose une question réglementaire…"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          }}
        />
        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? "Recherche…" : "Demander"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <div className={styles.layout}>
          <section className={styles.answer}>
            <div className={styles.answerBody}>{renderAnswer(result.answer)}</div>
          </section>

          <aside className={styles.panel}>
            <h2 className={styles.panelTitle}>
              Sources {result.sources.length > 0 && `(${result.sources.length})`}
            </h2>

            {result.sources.length === 0 && (
              <p className={styles.empty}>
                Aucune source — la réponse ne provient pas de la base.
              </p>
            )}

            {result.sources.map((s) => (
              <div
                key={s.n}
                ref={(el) => {
                  sourceRefs.current[s.n] = el;
                }}
                className={`${styles.source} ${activeN === s.n ? styles.sourceActive : ""}`}
              >
                <div className={styles.sourceHead}>
                  <span className={styles.sourceN}>{s.n}</span>
                  <span className={styles.sourceCite}>
                    {s.document} — p.{s.page}
                    {s.article ? `, ${s.article}` : ""}
                  </span>
                </div>
                {renderSourceBody(s)}
              </div>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}

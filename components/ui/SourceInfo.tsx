"use client";

import { useState, useRef } from "react";

// ═══════════════════════════════════════════════════════════
//  Sourçage réutilisable (modèle atelier GEP)
//  - <Info texte> : petite icône ⓘ cliquable → infobulle-source.
//  - <MethodesReferences> : rubrique repliable en bas d'outil
//    (synthèse de méthode optionnelle + bibliographie NF ISO 690 + note).
//  Styles inline (charte via variables CSS) pour fonctionner quel que
//  soit le module CSS de l'outil hôte.
// ═══════════════════════════════════════════════════════════

const TIP_W = 250;

export function Info({ texte }: { texte: string }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  // position fixe (échappe à tout overflow parent) : {top} sous le bouton,
  // ou {bottom} au-dessus si trop proche du bas de l'écran.
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number }>({ left: 0 });

  function toggle() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const w = typeof window !== "undefined" ? window.innerWidth : 1000;
      const h = typeof window !== "undefined" ? window.innerHeight : 800;
      let left = r.left;
      if (left + TIP_W > w - 8) left = w - TIP_W - 8;
      if (left < 8) left = 8;
      // flip au-dessus si le bouton est dans la moitié basse
      if (r.bottom > h * 0.6) setPos({ left, bottom: h - r.top + 6 });
      else setPos({ left, top: r.bottom + 6 });
    }
    setOpen((o) => !o);
  }

  return (
    <span style={{ display: "inline-block" }}>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label="Source"
        aria-expanded={open}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontSize: "0.72rem", padding: "0 0 0 0.2rem", lineHeight: 1, verticalAlign: "middle" }}
      >
        ⓘ
      </button>
      {open && (
        <>
          <span
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 39 }}
            aria-hidden
          />
          <span
            role="tooltip"
            style={{ position: "fixed", left: pos.left, top: pos.top, bottom: pos.bottom, zIndex: 40, width: TIP_W, maxWidth: "92vw", maxHeight: "50vh", overflowY: "auto", background: "#2D2D2D", color: "#fff", fontSize: "0.72rem", lineHeight: 1.45, padding: "9px 26px 9px 11px", borderRadius: 6, fontWeight: 400, textAlign: "left", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}
          >
            {texte}
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              style={{ position: "absolute", top: 3, right: 6, background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "0.9rem", opacity: 0.7 }}
            >
              ×
            </button>
          </span>
        </>
      )}
    </span>
  );
}

export interface RefBiblio {
  cat: string;
  ref: string;
  url?: string;
}

export function MethodesReferences({
  methode,
  biblio,
  note,
}: {
  methode?: React.ReactNode;
  biblio: RefBiblio[];
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "0",
        marginTop: "1.25rem",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", background: "none", border: "none", cursor: "pointer", font: "inherit", fontFamily: "Helvetica, Arial, sans-serif", fontSize: "0.68rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 500 }}
      >
        Méthodes &amp; références
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 18px 16px" }}>
          {methode && (
            <div style={{ fontSize: "0.8rem", color: "var(--text)", lineHeight: 1.5, marginBottom: "1rem" }}>
              {methode}
            </div>
          )}
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.7rem", padding: 0, margin: 0 }}>
            {biblio.map((b, i) => (
              <li key={i} style={{ borderTop: "1px solid var(--fond-warm)", paddingTop: "0.6rem" }}>
                <span style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.72rem", display: "block" }}>{b.cat}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.45 }}>
                  {b.ref}{" "}
                  {b.url && (
                    <a href={b.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)" }}>
                      [lien]
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {note && (
            <p style={{ fontSize: "0.72rem", color: "var(--text-light)", fontStyle: "italic", lineHeight: 1.5, marginTop: "1rem" }}>
              {note}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

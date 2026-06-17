"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { RefLightbox, type RefVisuel } from "./RefLightbox";

export type Cas = {
  titre: string;
  domaine: string;
  categorie: string;
  probleme: string;
  action: string;
  resultat: string;
  marqueurs: string[];
  ref?: RefVisuel;
};

export type Autre = {
  titre: string;
  desc: string;
  marqueurs: string[];
  ref?: RefVisuel;
};

const FILTRES = [
  "Tous",
  "Réglementaire",
  "Eaux pluviales",
  "Sol & agronomie",
  "Support MOE",
  "Diagnostic",
];

function Marqueurs({ items }: { items: string[] }) {
  return (
    <ul className={styles.marqueurs}>
      {items.map((m) => (
        <li key={m} className={styles.marqueur}>
          {m}
        </li>
      ))}
    </ul>
  );
}

function VoirRef({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.voirRef} onClick={onClick}>
      voir la référence
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path
          d="M3 6.5h6M9 6.5L6.2 3.7M9 6.5L6.2 9.3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function ReferencesCarousel({
  cas,
  autres,
}: {
  cas: Cas[];
  autres: Autre[];
}) {
  const [filtre, setFiltre] = useState("Tous");
  const [actif, setActif] = useState<RefVisuel | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Mouse drag-to-scroll state
  const drag = useRef({ down: false, moved: false, startX: 0, startScroll: 0 });

  const visibles =
    filtre === "Tous" ? cas : cas.filter((c) => c.categorie === filtre);

  // Reset scroll to start when the filter changes
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
  }, [filtre]);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-ref-card]");
    const amount = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByCard(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByCard(-1);
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return; // touch uses native scroll
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      down: true,
      moved: false,
      startX: e.clientX,
      startScroll: track.scrollLeft,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const track = trackRef.current;
    if (!d.down || !track) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    track.scrollLeft = d.startScroll - dx;
  }

  function endDrag() {
    drag.current.down = false;
  }

  // Suppress the click that follows a real drag (so buttons aren't triggered)
  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return (
    <>
      <div className={styles.filtres} role="group" aria-label="Filtrer par domaine">
        {FILTRES.map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.chip} ${filtre === f ? styles.chipActive : ""}`}
            aria-pressed={filtre === f}
            onClick={() => setFiltre(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        className={styles.carousel}
        role="region"
        aria-label="Études de cas — défilement horizontal"
      >
        <div
          ref={trackRef}
          className={styles.carouselTrack}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
        >
          {visibles.map((c) => (
            <article key={c.titre} className={styles.refCard} data-ref-card>
              <div className={styles.refDomaine}>{c.domaine}</div>
              <h4 className={styles.refTitre}>{c.titre}</h4>

              <div className={styles.refBlocs}>
                <div className={styles.refBloc}>
                  <span className={styles.refBlocLabel}>Problème</span>
                  <p className={styles.refBlocText}>{c.probleme}</p>
                </div>
                <div className={styles.refBloc}>
                  <span className={styles.refBlocLabel}>Action</span>
                  <p className={styles.refBlocText}>{c.action}</p>
                </div>
                <div className={styles.refBloc}>
                  <span className={styles.refBlocLabel}>Résultat</span>
                  <p className={styles.refBlocText}>{c.resultat}</p>
                </div>
              </div>

              <Marqueurs items={c.marqueurs} />

              {c.ref && <VoirRef onClick={() => setActif(c.ref!)} />}
            </article>
          ))}
        </div>

        <div className={styles.carouselNav}>
          <button
            type="button"
            className={styles.carouselArrow}
            onClick={() => scrollByCard(-1)}
            aria-label="Études de cas précédentes"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 3L5 8L10 13"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={styles.carouselArrow}
            onClick={() => scrollByCard(1)}
            aria-label="Études de cas suivantes"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M6 3L11 8L6 13"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <h3 className={styles.autresTitre}>Autres interventions</h3>
      <div className={styles.autresGrid}>
        {autres.map((a) => (
          <div key={a.titre} className={styles.autreCard}>
            <h4 className={styles.autreTitre}>{a.titre}</h4>
            <p className={styles.autreDesc}>{a.desc}</p>
            <Marqueurs items={a.marqueurs} />
            {a.ref && <VoirRef onClick={() => setActif(a.ref!)} />}
          </div>
        ))}
      </div>

      <RefLightbox visuel={actif} onClose={() => setActif(null)} />
    </>
  );
}

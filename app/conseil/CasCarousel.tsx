"use client";

import { useRef } from "react";
import styles from "./page.module.css";

type Cas = {
  titre: string;
  domaine: string;
  probleme: string;
  action: string;
  resultat: string;
};

export function CasCarousel({ cas }: { cas: Cas[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-cas-card]");
    const amount = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselTrack} ref={trackRef}>
        {cas.map((c) => (
          <article key={c.titre} className={styles.casCard} data-cas-card>
            <div className={styles.casDomaine}>{c.domaine}</div>
            <h4 className={styles.casTitre}>{c.titre}</h4>
            <div className={styles.casBlocs}>
              <div className={styles.casBloc}>
                <span className={styles.casBlocLabel}>Problème</span>
                <p className={styles.casBlocText}>{c.probleme}</p>
              </div>
              <div className={styles.casBloc}>
                <span className={styles.casBlocLabel}>Action</span>
                <p className={styles.casBlocText}>{c.action}</p>
              </div>
              <div className={styles.casBloc}>
                <span className={styles.casBlocLabel}>Résultat</span>
                <p className={styles.casBlocText}>{c.resultat}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.carouselNav}>
        <button
          type="button"
          className={styles.carouselArrow}
          onClick={() => scrollBy(-1)}
          aria-label="Étude de cas précédente"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
          onClick={() => scrollBy(1)}
          aria-label="Étude de cas suivante"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

export type RefVisuel = {
  src: string;
  titre: string;
  legende: string;
};

const ZOOM_LEVELS = [1, 2.2, 3.5];
const MAX_SCALE = 6;
const MIN_SCALE = 1;

export function RefLightbox({
  visuel,
  onClose,
}: {
  visuel: RefVisuel | null;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // Pan / tap tracking
  const drag = useRef({
    active: false,
    moved: false,
    onImg: false,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
  });

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  // Reset transform whenever a new image is opened
  useEffect(() => {
    if (visuel) reset();
  }, [visuel, reset]);

  // Esc to close, focus management, scroll lock
  useEffect(() => {
    if (!visuel) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        // Minimal focus trap: keep focus inside the dialog
        e.preventDefault();
        closeBtnRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previousFocus?.focus?.();
    };
  }, [visuel, onClose]);

  if (!visuel) return null;

  function clampScale(s: number) {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const next = clampScale(scale - e.deltaY * 0.0025 * scale);
    if (next === 1) {
      reset();
    } else {
      setScale(next);
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    const onImg = (e.target as HTMLElement).tagName === "IMG";
    if (onImg) (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = {
      active: true,
      moved: false,
      onImg,
      startX: e.clientX,
      startY: e.clientY,
      baseX: tx,
      baseY: ty,
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    if (scale > 1) {
      setTx(d.baseX + dx);
      setTy(d.baseY + dy);
    }
  }

  function onPointerUp() {
    const d = drag.current;
    d.active = false;
    if (d.moved) return;
    // A tap on empty space closes; a tap on the image cycles zoom levels
    if (!d.onImg) {
      onClose();
      return;
    }
    const idx = ZOOM_LEVELS.indexOf(scale);
    const nextIdx = idx === -1 ? 1 : (idx + 1) % ZOOM_LEVELS.length;
    const next = ZOOM_LEVELS[nextIdx];
    if (next === 1) reset();
    else setScale(next);
  }

  function onBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  const isSvg = visuel.src.toLowerCase().endsWith(".svg");

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={visuel.titre}
      ref={dialogRef}
      onMouseDown={onBackdropClick}
    >
      <button
        type="button"
        ref={closeBtnRef}
        className={styles.lightboxClose}
        onClick={onClose}
        aria-label="Fermer la référence"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M5 5L15 15M15 5L5 15"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div
        className={styles.lightboxStage}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={visuel.src}
          alt={visuel.legende || visuel.titre}
          className={styles.lightboxImg}
          draggable={false}
          decoding="async"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            cursor: scale > 1 ? "grab" : "zoom-in",
            // SVG needs an explicit box to render at a usable size
            ...(isSvg ? { width: "min(90vw, 1100px)" } : null),
          }}
        />
      </div>

      <figcaption className={styles.lightboxCaption}>
        <span className={styles.lightboxCaptionTitre}>{visuel.titre}</span>
        <span className={styles.lightboxCaptionLine}>{visuel.legende}</span>
        <span className={styles.lightboxHint}>
          cliquez / molette pour zoomer · glissez pour déplacer · Échap pour fermer
        </span>
      </figcaption>
    </div>
  );
}

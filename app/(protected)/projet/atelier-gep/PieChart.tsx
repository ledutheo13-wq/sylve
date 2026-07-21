"use client";

import { useState } from "react";
import styles from "./page.module.css";

// ═══════════════════════════════════════════════════════════
//  Camembert SVG maison — zéro dépendance
// ═══════════════════════════════════════════════════════════

export interface PiePart {
  label: string;
  value: number;
  couleur: string;
}

interface Props {
  parts: PiePart[];
  /** unité affichée (ex. "m³") */
  unite?: string;
  /** total de référence (si fourni, sert à afficher le % ; sinon somme des parts) */
  totalReference?: number;
  ariaLabel: string;
}

const R = 80;
const CX = 100;
const CY = 100;

function polar(angle: number, radius: number): [number, number] {
  const a = angle - Math.PI / 2; // départ en haut
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)];
}

export default function PieChart({ parts, unite = "m³", totalReference, ariaLabel }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const visibles = parts.filter((p) => p.value > 0);
  const somme = visibles.reduce((s, p) => s + p.value, 0);
  const total = totalReference && totalReference > 0 ? totalReference : somme;

  if (somme <= 0) {
    return (
      <div className={styles.pieEmpty} role="img" aria-label={ariaLabel}>
        Ajoutez des ouvrages pour visualiser la répartition.
      </div>
    );
  }

  let angle = 0;
  const arcs = visibles.map((p, i) => {
    const frac = p.value / total;
    const start = angle;
    const end = angle + frac * 2 * Math.PI;
    angle = end;
    const [x1, y1] = polar(start, R);
    const [x2, y2] = polar(end, R);
    const large = end - start > Math.PI ? 1 : 0;
    // cas part unique = disque complet
    const d =
      frac >= 0.9999
        ? `M ${CX} ${CY - R} A ${R} ${R} 0 1 1 ${CX - 0.01} ${CY - R} Z`
        : `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    return { d, part: p, index: i, pct: frac * 100 };
  });

  return (
    <div className={styles.pieWrap}>
      <svg viewBox="0 0 200 200" className={styles.pieSvg} role="img" aria-label={ariaLabel}>
        {arcs.map((a) => (
          <path
            key={a.index}
            d={a.d}
            fill={a.part.couleur}
            stroke="#fff"
            strokeWidth={1.5}
            opacity={hover === null || hover === a.index ? 1 : 0.4}
            onMouseEnter={() => setHover(a.index)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      <ul className={styles.pieLegend}>
        {arcs.map((a) => (
          <li
            key={a.index}
            className={styles.pieLegendItem}
            onMouseEnter={() => setHover(a.index)}
            onMouseLeave={() => setHover(null)}
            style={{ opacity: hover === null || hover === a.index ? 1 : 0.5 }}
          >
            <span className={styles.pieSwatch} style={{ background: a.part.couleur }} aria-hidden />
            <span className={styles.pieLabel}>{a.part.label}</span>
            <span className={styles.pieValue}>
              {a.part.value.toFixed(1)} {unite} · {a.pct.toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

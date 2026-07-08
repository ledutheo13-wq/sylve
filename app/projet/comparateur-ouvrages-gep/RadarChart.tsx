"use client";

import { useState } from "react";
import styles from "./page.module.css";

// ═══════════════════════════════════════════════════════════
//  RADAR SVG MAISON — zéro dépendance
//  N axes, 1..3 séries superposées, secteurs de familles optionnels.
// ═══════════════════════════════════════════════════════════

export interface RadarAxis {
  /** code court (ex. "EPC") — sert au tooltip */
  code: string;
  /** nom complet affiché autour du cercle */
  label: string;
}

export interface RadarSeries {
  /** libellé de la série (ouvrage ou critère) */
  label: string;
  color: string;
  /** une valeur par axe, dans l'ordre de `axes` */
  values: number[];
}

export interface RadarSector {
  couleur: string;
  /** indices d'axes contigus couverts par la famille */
  indices: number[];
  nom: string;
}

interface Props {
  axes: RadarAxis[];
  series: RadarSeries[];
  max: number;
  sectors?: RadarSector[];
  /** description a11y du graphe */
  ariaLabel: string;
}

const W = 640;
const H = 600;
const CX = 320;
const CY = 300;
const R = 178;
const LABEL_R = R + 14;

/** angle (rad) de l'axe i, démarrage en haut, sens horaire */
function angleOf(i: number, n: number): number {
  return -Math.PI / 2 + (i * 2 * Math.PI) / n;
}

function pointAt(i: number, n: number, radius: number): [number, number] {
  const a = angleOf(i, n);
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)];
}

/** découpe un libellé en lignes (max ~15 car., 3 lignes max) */
function wrapLabel(text: string, maxChars = 15, maxLines = 3): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur.length === 0) {
      cur = w;
    } else if ((cur + " " + w).length <= maxChars) {
      cur += " " + w;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = lines.slice(maxLines - 1).join(" ");
    return kept;
  }
  return lines;
}

export default function RadarChart({ axes, series, max, sectors, ariaLabel }: Props) {
  const n = axes.length;
  const [hover, setHover] = useState<{ s: number; a: number } | null>(null);

  const rings = Array.from({ length: max }, (_, k) => k + 1); // 1..max

  return (
    <div className={styles.radarWrap}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={styles.radarSvg}
        role="img"
        aria-label={ariaLabel}
      >
        {/* ── Secteurs de familles (fond très léger) ── */}
        {sectors?.map((sec) => {
          if (sec.indices.length === 0) return null;
          const half = Math.PI / n;
          const first = sec.indices[0];
          const last = sec.indices[sec.indices.length - 1];
          const aStart = angleOf(first, n) - half;
          const aEnd = angleOf(last, n) + half;
          const p1 = [CX + R * Math.cos(aStart), CY + R * Math.sin(aStart)];
          const p2 = [CX + R * Math.cos(aEnd), CY + R * Math.sin(aEnd)];
          const largeArc = aEnd - aStart > Math.PI ? 1 : 0;
          return (
            <path
              key={sec.nom}
              d={`M ${CX} ${CY} L ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} A ${R} ${R} 0 ${largeArc} 1 ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} Z`}
              fill={sec.couleur}
              fillOpacity={0.08}
              stroke="none"
            />
          );
        })}

        {/* ── Grille concentrique ── */}
        {rings.map((lvl) => {
          const r = (R * lvl) / max;
          const pts = axes
            .map((_, i) => {
              const [x, y] = pointAt(i, n, r);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke="var(--border)"
              strokeWidth={lvl === max ? 1.2 : 0.8}
            />
          );
        })}

        {/* ── Axes rayonnants ── */}
        {axes.map((_, i) => {
          const [x, y] = pointAt(i, n, R);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x.toFixed(1)}
              y2={y.toFixed(1)}
              stroke="var(--border)"
              strokeWidth={0.8}
            />
          );
        })}

        {/* ── Graduations (échelle 0..max au centre vers le haut) ── */}
        {rings.map((lvl) => (
          <text
            key={`g${lvl}`}
            x={CX + 4}
            y={CY - (R * lvl) / max}
            className={styles.radarGrad}
          >
            {lvl}
          </text>
        ))}

        {/* ── Séries (polygones superposés) ── */}
        {series.map((serie, si) => {
          const pts = serie.values
            .map((v, i) => {
              const [x, y] = pointAt(i, n, (R * v) / max);
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(" ");
          return (
            <polygon
              key={si}
              points={pts}
              fill={serie.color}
              fillOpacity={0.14}
              stroke={serie.color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          );
        })}

        {/* ── Sommets (points + zone de survol) ── */}
        {series.map((serie, si) =>
          serie.values.map((v, i) => {
            const [x, y] = pointAt(i, n, (R * v) / max);
            return (
              <circle
                key={`${si}-${i}`}
                cx={x.toFixed(1)}
                cy={y.toFixed(1)}
                r={hover && hover.s === si && hover.a === i ? 5 : 3}
                fill={serie.color}
                stroke="#fff"
                strokeWidth={1}
                onMouseEnter={() => setHover({ s: si, a: i })}
                onMouseLeave={() => setHover(null)}
                style={{ cursor: "pointer" }}
              />
            );
          })
        )}

        {/* ── Étiquettes d'axes (noms complets, multi-lignes) ── */}
        {axes.map((axis, i) => {
          const [x, y] = pointAt(i, n, LABEL_R);
          const cos = Math.cos(angleOf(i, n));
          const anchor = cos > 0.15 ? "start" : cos < -0.15 ? "end" : "middle";
          const lines = wrapLabel(axis.label);
          const lineH = 10.5;
          const y0 = y - ((lines.length - 1) * lineH) / 2;
          return (
            <text
              key={i}
              x={x.toFixed(1)}
              y={y0.toFixed(1)}
              textAnchor={anchor}
              dominantBaseline="middle"
              className={styles.radarAxisLabel}
            >
              {lines.map((ln, li) => (
                <tspan key={li} x={x.toFixed(1)} dy={li === 0 ? 0 : lineH}>
                  {ln}
                </tspan>
              ))}
            </text>
          );
        })}

        {/* ── Infobulle au survol ── */}
        {hover &&
          (() => {
            const serie = series[hover.s];
            const axis = axes[hover.a];
            const v = serie.values[hover.a];
            const [x, y] = pointAt(hover.a, n, (R * v) / max);
            const label = `${axis.code} · ${v}/${max}`;
            const boxW = Math.max(48, label.length * 6.2 + 12);
            const boxH = 20;
            const bx = Math.min(Math.max(x - boxW / 2, 4), W - boxW - 4);
            const by = y - boxH - 8 < 4 ? y + 8 : y - boxH - 8;
            return (
              <g pointerEvents="none">
                <rect
                  x={bx.toFixed(1)}
                  y={by.toFixed(1)}
                  width={boxW}
                  height={boxH}
                  rx={4}
                  fill="#2D2D2D"
                  fillOpacity={0.92}
                />
                <text
                  x={(bx + boxW / 2).toFixed(1)}
                  y={(by + boxH / 2 + 0.5).toFixed(1)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={styles.radarTip}
                >
                  {label}
                </text>
              </g>
            );
          })()}
      </svg>

      {/* ── Légende des séries ── */}
      <ul className={styles.radarLegend} aria-label="Légende">
        {series.map((serie, si) => (
          <li key={si} className={styles.radarLegendItem}>
            <span
              className={styles.radarLegendSwatch}
              style={{ background: serie.color }}
              aria-hidden
            />
            {serie.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { TYPES, SOLS } from "@/lib/tools/soutenements/constants";
import { compute, getVerdict, getFsColor } from "@/lib/tools/soutenements/calculations";
import type { ComputeResult } from "@/lib/tools/soutenements/types";
import styles from "./page.module.css";

export default function SoutenementsPage() {
  const [typeIdx, setTypeIdx] = useState(0);
  const [height, setHeight] = useState(1.0);
  const [epRaw, setEpRaw] = useState(15);
  const [semelle, setSemelle] = useState(0.6);
  const [solIdx, setSolIdx] = useState(1);
  const [phi, setPhi] = useState(30);
  const [gammaSol, setGammaSol] = useState(18);
  const [cohesion, setCohesion] = useState(0);
  const [surchargeVal, setSurchargeVal] = useState(0);
  const [qInput, setQInput] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const t = TYPES[typeIdx];

  // Auto-adjust metal thickness
  const getAutoThickness = useCallback(
    (h: number, wallType: typeof t) => {
      if (!wallType.metal) return wallType.epCm;
      return h > 0.7 ? 5 : 3;
    },
    []
  );

  // Auto-adjust semelle
  const getAutoSemelle = useCallback(
    (h: number, wallType: typeof t) => {
      if (!wallType.hasSemelle || !wallType.semFactor) return 0;
      return parseFloat((wallType.semFactor * h).toFixed(2));
    },
    []
  );

  // On type change
  useEffect(() => {
    const wallType = TYPES[typeIdx];
    if (wallType.unit === "mm") {
      setEpRaw(getAutoThickness(height, wallType));
    } else {
      setEpRaw(wallType.epCm);
    }
    setSemelle(getAutoSemelle(height, wallType));
  }, [typeIdx, height, getAutoThickness, getAutoSemelle]);

  // On sol change
  useEffect(() => {
    if (solIdx < 4) {
      const s = SOLS[solIdx];
      setPhi(s.phi);
      setGammaSol(s.gamma);
      setCohesion(s.c);
    }
  }, [solIdx]);

  // Compute result
  const result: ComputeResult = compute({
    type: t,
    idx: typeIdx,
    H: height,
    epRaw,
    L: t.hasSemelle ? semelle : 0,
    phi,
    gammaSol,
    c: cohesion,
    q: qInput,
  });

  // Draw SVG imperatively
  useEffect(() => {
    if (!svgRef.current) return;
    drawSVG(svgRef.current, result);
  }, [result]);

  function handleHeightChange(val: number) {
    setHeight(val);
  }

  function handleSurchargeSelect(val: string) {
    const v = parseFloat(val);
    setSurchargeVal(v);
    setQInput(v);
  }

  return (
    <>
      <div className={styles.pageTitleSection}>
        <h1>calculateur de soutenements</h1>
        <p>
          Verifiez la stabilite de vos petits soutenements paysagers par calcul
          de poussee de terre (Rankine).
        </p>
      </div>

      <div className={styles.app}>
        {/* PANNEAU GAUCHE */}
        <div className={styles.panelLeft}>
          <div className={styles.panelHeader}>Parametres</div>
          <div className={styles.panelBody}>
            {/* Type */}
            <div className={styles.sectionTitle}>Type de soutenement</div>
            <div className={styles.fieldGroup}>
              <select
                className={styles.select}
                value={typeIdx}
                onChange={(e) => setTypeIdx(parseInt(e.target.value))}
              >
                <optgroup label="Ouvrages beton">
                  <option value={0}>L beton prefabrique</option>
                  <option value={1}>Voile beton coule en place</option>
                  <option value={2}>Parpaings 20 cm (ciment classique)</option>
                  <option value={3}>Parpaings 10 cm (ciment classique)</option>
                </optgroup>
                <optgroup label="Ouvrages metalliques avec semelle">
                  <option value={4}>Volige acier + semelle</option>
                  <option value={5}>Volige aluminium + semelle</option>
                </optgroup>
                <optgroup label="Ouvrages fiches (ancrage dans le sol)">
                  <option value={6}>Volige acier fichee</option>
                  <option value={7}>Bac acier / bac fibres</option>
                </optgroup>
              </select>
            </div>

            {/* Geometrie */}
            <div className={styles.sectionTitle}>Geometrie</div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Hauteur de terre retenue (m)
              </label>
              <div className={styles.sliderRow}>
                <input
                  type="range"
                  className={styles.rangeInput}
                  min={0.2}
                  max={2.0}
                  step={0.05}
                  value={Math.min(height, 2.0)}
                  onChange={(e) => handleHeightChange(parseFloat(e.target.value))}
                />
                <input
                  type="number"
                  className={styles.inputNumber}
                  min={0.2}
                  max={3.0}
                  step={0.05}
                  value={height}
                  onChange={(e) =>
                    handleHeightChange(parseFloat(e.target.value) || 0.2)
                  }
                />
              </div>
              {height > 2.0 && (
                <div className={`${styles.notice} ${styles.noticeDanger}`}>
                  Au-dela de 2 m, nous recommandons de consulter un bureau
                  d&apos;etudes structure (BET).
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Epaisseur du mur ({t.unit})
              </label>
              <input
                type="number"
                className={styles.inputNumber}
                step={1}
                value={epRaw}
                onChange={(e) => setEpRaw(parseFloat(e.target.value) || 0)}
              />
              {t.metal && height > 0.7 && (
                <div className={styles.notice}>
                  Epaisseur de tole ajustee a 5 mm pour une hauteur &gt; 70 cm.
                </div>
              )}
            </div>

            {t.hasSemelle && (
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Longueur de semelle (m)</label>
                <input
                  type="number"
                  className={styles.inputNumber}
                  step={0.01}
                  value={semelle}
                  onChange={(e) =>
                    setSemelle(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            )}

            {/* Sol */}
            <div className={styles.sectionTitle}>Caracteristiques du sol</div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Type de sol</label>
              <select
                className={styles.select}
                value={solIdx}
                onChange={(e) => setSolIdx(parseInt(e.target.value))}
              >
                <option value={0}>Gravier</option>
                <option value={1}>Sableux</option>
                <option value={2}>Limoneux</option>
                <option value={3}>Argileux</option>
                <option value={4}>Personnalise</option>
              </select>
            </div>
            <div className={styles.fieldRow3}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>&#966; Angle frot. (&deg;)</label>
                <input
                  type="number"
                  className={styles.inputNumber}
                  min={0}
                  max={50}
                  step={1}
                  value={phi}
                  onChange={(e) => setPhi(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  &#947; Poids vol. (kN/m&#179;)
                </label>
                <input
                  type="number"
                  className={styles.inputNumber}
                  min={10}
                  max={25}
                  step={0.5}
                  value={gammaSol}
                  onChange={(e) =>
                    setGammaSol(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>c Cohesion (kPa)</label>
                <input
                  type="number"
                  className={styles.inputNumber}
                  min={0}
                  max={50}
                  step={1}
                  value={cohesion}
                  onChange={(e) =>
                    setCohesion(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            {/* Surcharge */}
            <div className={styles.sectionTitle}>Surcharge en crete</div>
            <div className={styles.fieldGroup}>
              <select
                className={styles.select}
                value={surchargeVal}
                onChange={(e) => handleSurchargeSelect(e.target.value)}
              >
                <option value={0}>Aucune surcharge</option>
                <option value={5}>Pieton (5 kN/m&#178;)</option>
                <option value={10}>Vehicule leger (10 kN/m&#178;)</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Valeur (kN/m&#178;)</label>
              <input
                type="number"
                className={styles.inputNumber}
                min={0}
                max={50}
                step={0.5}
                value={qInput}
                onChange={(e) => setQInput(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* PANNEAU DROIT */}
        <div className={styles.panelRight}>
          <div className={styles.svgCard}>
            <svg
              ref={svgRef}
              viewBox="0 0 500 400"
              xmlns="http://www.w3.org/2000/svg"
            />
          </div>
          <ResultsCard result={result} />
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════
   RESULTS CARD
   ════════════════════════════════════════════ */

function ResultsCard({ result: r }: { result: ComputeResult }) {
  if (r.blocked) {
    return (
      <div className={styles.resultsCard}>
        <div
          className={styles.verdictBox}
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
        >
          <div className={styles.verdictLabel}>Calcul bloque</div>
          <div className={styles.verdictFs}>H &gt; 2.00 m</div>
        </div>
        <div className={styles.ficheNotice}>
          Au-dela de 2 m, nous recommandons de consulter un bureau d&apos;etudes
          structure (BET).
        </div>
      </div>
    );
  }

  const rows: { label: string; formula: string; value: string }[] = [
    { label: "Ka — Coefficient de poussee", formula: "tan²(45° - φ/2)", value: r.Ka.toFixed(3) },
    { label: "Pa sol — Poussee due au sol", formula: "0.5 × γ × H² × Ka", value: r.Pa_sol.toFixed(2) + " kN/m" },
    { label: "Pa surcharge — Poussee due a q", formula: "q × H × Ka", value: r.Pa_q.toFixed(2) + " kN/m" },
    { label: "Pa totale — Poussee active", formula: "", value: r.Pa_total.toFixed(2) + " kN/m" },
    { label: "Point d'application", formula: "(Pa_sol×H/3 + Pa_q×H/2) / Pa", value: r.y.toFixed(2) + " m" },
  ];

  if (r.type.fiche) {
    return (
      <div className={styles.resultsCard}>
        <div
          className={styles.verdictBox}
          style={{ background: "rgba(94,139,143,0.1)", color: "var(--sylve-dark)" }}
        >
          <div className={styles.verdictLabel}>
            Ouvrage fiche — verification partielle
          </div>
          <div className={styles.verdictFs}>
            Pa = {r.Pa_total.toFixed(2)} kN/m
          </div>
        </div>
        <div className={styles.calcDetail}>
          {rows.map((row, i) => (
            <CalcRow key={i} {...row} />
          ))}
        </div>
        <div className={styles.ficheNotice}>
          La stabilite de cet ouvrage depend de la qualite et de la profondeur
          de l&apos;ancrage dans le sol. Pour un dimensionnement precis de la
          fiche, consultez un bureau d&apos;etudes structure.
        </div>
      </div>
    );
  }

  // Full results
  rows.push(
    { label: "W mur — Poids propre mur", formula: "γmur × e × H", value: r.Wmur.toFixed(2) + " kN/m" },
    { label: "W semelle — Poids propre semelle", formula: "γmur × e_sem × L", value: r.Wsem.toFixed(2) + " kN/m" },
    { label: "W terre — Poids terre sur semelle", formula: "γsol × H × (L - e)", value: r.Wterre.toFixed(2) + " kN/m" },
    { label: "Moment destabilisant Md", formula: "Pa_sol×H/3 + Pa_q×H/2", value: r.Md.toFixed(2) + " kN.m/m" },
    { label: "Moment stabilisant Ms", formula: "∑ Wi × bras_i", value: r.Ms.toFixed(2) + " kN.m/m" }
  );

  const verdict = r.Fs_min !== null ? getVerdict(r.Fs_min) : null;

  return (
    <div className={styles.resultsCard}>
      {verdict && r.Fs_min !== null && (
        <div
          className={styles.verdictBox}
          style={{ background: verdict.bg, color: verdict.color }}
        >
          <div className={styles.verdictLabel}>{verdict.label}</div>
          <div className={styles.verdictFs}>Fs = {r.Fs_min.toFixed(2)}</div>
        </div>
      )}
      <div className={styles.calcDetail}>
        {rows.map((row, i) => (
          <CalcRow key={i} {...row} />
        ))}
        <FsRow label="Fs renversement" formula="Ms / Md" fs={r.Fs_r} />
        <FsRow label="Fs glissement" formula="(N×tanδ + c×B) / Pa" fs={r.Fs_g} />
      </div>
    </div>
  );
}

function CalcRow({ label, formula, value }: { label: string; formula: string; value: string }) {
  return (
    <div className={styles.calcRow}>
      <div>
        <span className={styles.calcLabel}>{label}</span>
        {formula && (
          <>
            <br />
            <span className={styles.calcFormula}>{formula}</span>
          </>
        )}
      </div>
      <div className={styles.calcValue}>{value}</div>
    </div>
  );
}

function FsRow({ label, formula, fs }: { label: string; formula: string; fs: number | null }) {
  if (fs === null) return null;
  const clamped = Math.min(fs, 99);
  const color = getFsColor(clamped);
  const display = clamped >= 99 ? "> 99" : clamped.toFixed(2);
  return (
    <div className={styles.calcRow}>
      <div>
        <span className={styles.calcLabel}>{label}</span>
        <br />
        <span className={styles.calcFormula}>{formula}</span>
      </div>
      <div className={`${styles.calcValue} ${styles.fsBadge}`} style={{ background: color }}>
        {display}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   DRAW SVG (imperative — identical to vanilla)
   ════════════════════════════════════════════ */

function drawSVG(svg: SVGSVGElement, r: ComputeResult) {
  const verdict =
    r.Fs_min !== null
      ? getVerdict(r.Fs_min)
      : { color: "#5E8B8F", bg: "rgba(94,139,143,0.1)" };

  const svgW = 500,
    svgH = 400;
  const margin = 60;
  const drawH = svgH - margin * 2;
  const maxRealH = Math.max(r.H, 0.5);
  const scale = (drawH / maxRealH) * 0.7;

  const wallH = r.H * scale;
  const wallW = Math.max(r.e * scale, 4);
  const semHpx = r.type.hasSemelle ? Math.max(r.eSem * scale, 8) : 0;
  const semWpx = r.L * scale;

  const baseY = svgH - margin - semHpx;
  const wallX = margin + 60;
  const wallTopY = baseY - wallH;

  const semEndX = r.type.hasSemelle
    ? wallX + Math.max(semWpx, wallW)
    : wallX + wallW;

  const terreX = wallX + wallW;
  const terreEndX = semEndX + 60;
  const terreW = terreEndX - terreX;

  let html = "";

  html += `
    <defs>
      <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="8" stroke="#7A7672" stroke-width="0.6"/>
      </pattern>
      <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill="#EF4444"/></marker>
      <marker id="arrowBlk" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill="#2A2826"/></marker>
      <marker id="arrowOrg" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill="#F59E0B"/></marker>
      <marker id="arrowGrn" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0,0 8,3 0,6" fill="#10B981"/></marker>
    </defs>
  `;

  // Terre
  html += `<rect x="${terreX}" y="${wallTopY}" width="${terreW}" height="${wallH}" fill="url(#hatch)" stroke="#7A7672" stroke-width="0.5"/>`;

  // Semelle
  if (r.type.hasSemelle && r.L > 0) {
    html += `<rect x="${wallX}" y="${baseY}" width="${Math.max(semWpx, wallW)}" height="${semHpx}" fill="${verdict.bg}" stroke="#2A2826" stroke-width="1.2"/>`;
  }

  // Mur
  html += `<rect x="${wallX}" y="${wallTopY}" width="${wallW}" height="${wallH}" fill="${verdict.bg}" stroke="#2A2826" stroke-width="1.5"/>`;

  // Fiche
  if (r.type.fiche) {
    const ficheH = wallH * 0.4;
    html += `<rect x="${wallX}" y="${baseY}" width="${wallW}" height="${ficheH}" fill="none" stroke="#2A2826" stroke-width="1.2" stroke-dasharray="4,3"/>`;
    html += `<line x1="${margin}" y1="${baseY}" x2="${svgW - margin}" y2="${baseY}" stroke="#7A7672" stroke-width="1" stroke-dasharray="6,3"/>`;
  }

  // Diagramme de poussee
  if (r.Pa_total > 0) {
    const diagX = terreEndX + 5;
    const maxPressure = Math.min(60, Math.max(20, r.Pa_total * 3));

    const solMaxW = maxPressure * (r.Pa_sol / Math.max(r.Pa_total, 0.01));
    html += `<polygon points="${diagX},${wallTopY} ${diagX},${baseY} ${diagX + solMaxW},${baseY}" fill="rgba(239,68,68,0.08)" stroke="#EF4444" stroke-width="0.8"/>`;

    if (r.Pa_q > 0) {
      const qW = maxPressure * (r.Pa_q / Math.max(r.Pa_total, 0.01)) * 0.5;
      html += `<rect x="${diagX}" y="${wallTopY}" width="${qW}" height="${wallH}" fill="rgba(245,158,11,0.06)" stroke="#F59E0B" stroke-width="0.6"/>`;
    }

    const arrowY = baseY - r.y * scale;
    const arrStartX = diagX + maxPressure * 0.5;
    html += `<line x1="${arrStartX}" y1="${arrowY}" x2="${terreX + 2}" y2="${arrowY}" stroke="#EF4444" stroke-width="1.5" marker-end="url(#arrowRed)"/>`;
    html += `<text x="${arrStartX + 4}" y="${arrowY - 5}" font-family="'DM Mono', monospace" font-size="9" fill="#EF4444">Pa</text>`;
  }

  // Fleche poids mur
  const cgX = wallX + wallW / 2;
  const cgY = wallTopY + wallH / 2;
  html += `<line x1="${cgX}" y1="${cgY}" x2="${cgX}" y2="${cgY + 30}" stroke="#2A2826" stroke-width="1.2" marker-end="url(#arrowBlk)"/>`;
  html += `<text x="${cgX - 12}" y="${cgY + 18}" font-family="'DM Mono', monospace" font-size="8" fill="#2A2826">Wm</text>`;

  // Fleche poids terre
  if (r.type.hasSemelle && r.L > r.e) {
    const terreCenterX = wallX + wallW + (Math.max(semWpx, wallW) - wallW) / 2;
    const terreCenterY = wallTopY + wallH * 0.4;
    html += `<line x1="${terreCenterX}" y1="${terreCenterY}" x2="${terreCenterX}" y2="${terreCenterY + 30}" stroke="#10B981" stroke-width="1.2" marker-end="url(#arrowGrn)"/>`;
    html += `<text x="${terreCenterX + 5}" y="${terreCenterY + 18}" font-family="'DM Mono', monospace" font-size="8" fill="#10B981">Wt</text>`;
  }

  // Fleches surcharge
  if (r.q > 0) {
    const qX1 = terreX + 15;
    const qX2 = terreEndX - 15;
    const qMid = (qX1 + qX2) / 2;
    for (const qx of [qX1, qMid, qX2]) {
      html += `<line x1="${qx}" y1="${wallTopY - 20}" x2="${qx}" y2="${wallTopY - 2}" stroke="#F59E0B" stroke-width="1.2" marker-end="url(#arrowOrg)"/>`;
    }
    html += `<text x="${qMid}" y="${wallTopY - 25}" font-family="'DM Mono', monospace" font-size="9" fill="#F59E0B" text-anchor="middle">q = ${r.q} kN/m\²</text>`;
  }

  // Cotes
  const coteX = wallX - 10;
  html += `<line x1="${coteX}" y1="${wallTopY}" x2="${coteX}" y2="${baseY}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${coteX - 4}" y1="${wallTopY}" x2="${coteX + 4}" y2="${wallTopY}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${coteX - 4}" y1="${baseY}" x2="${coteX + 4}" y2="${baseY}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<text x="${coteX - 6}" y="${(wallTopY + baseY) / 2 + 3}" font-family="'DM Mono', monospace" font-size="10" fill="#2A2826" text-anchor="end">H=${r.H.toFixed(2)}m</text>`;

  const epLabel = r.type.unit === "mm" ? r.epRaw + "mm" : r.epRaw + "cm";
  const epCoteY = baseY + semHpx + 18;
  html += `<line x1="${wallX}" y1="${epCoteY}" x2="${wallX + wallW}" y2="${epCoteY}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${wallX}" y1="${epCoteY - 3}" x2="${wallX}" y2="${epCoteY + 3}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${wallX + wallW}" y1="${epCoteY - 3}" x2="${wallX + wallW}" y2="${epCoteY + 3}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<text x="${wallX + wallW / 2}" y="${epCoteY + 13}" font-family="'DM Mono', monospace" font-size="9" fill="#2A2826" text-anchor="middle">e=${epLabel}</text>`;

  if (r.type.hasSemelle && r.L > 0) {
    const semCoteY = baseY + semHpx + 35;
    html += `<line x1="${wallX}" y1="${semCoteY}" x2="${semEndX}" y2="${semCoteY}" stroke="#2A2826" stroke-width="0.7"/>`;
    html += `<line x1="${wallX}" y1="${semCoteY - 3}" x2="${wallX}" y2="${semCoteY + 3}" stroke="#2A2826" stroke-width="0.7"/>`;
    html += `<line x1="${semEndX}" y1="${semCoteY - 3}" x2="${semEndX}" y2="${semCoteY + 3}" stroke="#2A2826" stroke-width="0.7"/>`;
    html += `<text x="${(wallX + semEndX) / 2}" y="${semCoteY + 13}" font-family="'DM Mono', monospace" font-size="9" fill="#2A2826" text-anchor="middle">L=${r.L.toFixed(2)}m</text>`;
  }

  svg.innerHTML = html;
}

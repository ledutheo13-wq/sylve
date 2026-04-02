"use client";

import { useState, useEffect, useRef } from "react";
import { USAGES, essencesLames } from "@/lib/tools/platelages/constants";
import { compute, getEpMid } from "@/lib/tools/platelages/calculations";
import type { UsageKey, EpaisseursKey, LargeurKey, ComputeResult } from "@/lib/tools/platelages/types";
import styles from "./page.module.css";

const SECTIONS = [
  "40x60", "60x40", "40x70", "70x40", "45x60", "60x45", "45x75", "75x45", "60x60",
];

export default function PlatelagesPage() {
  const [usage, setUsage] = useState<UsageKey>("S1");
  const [essLamesIdx, setEssLamesIdx] = useState(2); // Douglas
  const [essLambIdx, setEssLambIdx] = useState(2);
  const [classeLamesOverride, setClasseLamesOverride] = useState("C24");
  const [densiteLames, setDensiteLames] = useState(530);
  const [conception, setConception] = useState<"courante" | "elaboree">("courante");
  const [epLames, setEpLames] = useState<EpaisseursKey>("24-27");
  const [largLames, setLargLames] = useState<LargeurKey>(120);
  const [sectionStr, setSectionStr] = useState("45x75");
  const [nbAppuis, setNbAppuis] = useState(3);
  const [entraxeReel, setEntraxeReel] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);

  // Sync essence lames fields
  useEffect(() => {
    const ess = essencesLames[essLamesIdx];
    if (ess.classe) setClasseLamesOverride(ess.classe);
    if (ess.densite) setDensiteLames(ess.densite);
  }, [essLamesIdx]);

  const result = compute({
    usage, epLames, largLames, essLamesIdx, essLambIdx,
    classeLamesOverride, densiteLames, sectionStr, entraxeReel,
    nbAppuis, conception,
  });

  // Draw SVG
  useEffect(() => {
    if (svgRef.current) drawSVG(svgRef.current, result, conception);
  });

  const essLames = essencesLames[essLamesIdx];
  const emploiBase = essLames.emploi;
  const classeRequise = conception === "elaboree" && parseFloat(emploiBase) >= 4 ? "3.2" : emploiBase;

  return (
    <>
      <div className={styles.pageTitleSection}>
        <h1>calculateur de platelages bois</h1>
        <p>Dimensionnez vos platelages exterieurs en bois conformement au DTU 51.4 — entraxes lambourdes et lames.</p>
      </div>

      <div className={styles.app}>
        {/* PANNEAU GAUCHE */}
        <div className={styles.panelLeft}>
          <div className={styles.panelHeader}>Parametres</div>
          <div className={styles.panelBody}>

            <div className={styles.sectionTitle}>Usage du platelage</div>
            <div className={styles.fieldGroup}>
              <select className={styles.select} value={usage} onChange={(e) => setUsage(e.target.value as UsageKey)}>
                <option value="S1">S1 — Residentiel (terrasse privative, balcon, abords piscine)</option>
                <option value="S2">S2 — ERP courant (ecole, cafe, restaurant, parc public)</option>
                <option value="S3">S3 — ERP forte frequentation (commerce, acces batiment, quai)</option>
              </select>
              <div className={styles.chargesInfo}>{USAGES[usage].desc}</div>
            </div>

            <div className={styles.sectionTitle}>Essence des lames</div>
            <div className={styles.fieldGroup}>
              <select className={styles.select} value={essLamesIdx} onChange={(e) => setEssLamesIdx(parseInt(e.target.value))}>
                {essencesLames.map((ess, i) => (
                  <option key={i} value={i}>{ess.name}{ess.exotique ? " 🌍" : ""}</option>
                ))}
              </select>
            </div>
            <div className={styles.fieldRow3}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Classe mecanique</label>
                <input type="text" className={styles.inputText || styles.select} value={classeLamesOverride} onChange={(e) => setClasseLamesOverride(e.target.value)} />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Classe emploi</label>
                <input type="text" className={styles.select} value={emploiBase} readOnly />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Densite (kg/m3)</label>
                <input type="number" className={styles.inputNumber} value={densiteLames} onChange={(e) => setDensiteLames(parseInt(e.target.value) || 0)} />
              </div>
            </div>

            <div className={styles.sectionTitle}>Conception</div>
            <div className={styles.fieldGroup}>
              <div className={styles.toggleRow}>
                <button className={`${styles.toggleBtn} ${conception === "courante" ? styles.toggleBtnActive : ""}`} onClick={() => setConception("courante")}>Courante</button>
                <button className={`${styles.toggleBtn} ${conception === "elaboree" ? styles.toggleBtnActive : ""}`} onClick={() => setConception("elaboree")}>Elaboree</button>
              </div>
              <div className={styles.tooltipText}>
                {conception === "courante"
                  ? "Standard, sans dispositifs anti-humidite specifiques."
                  : "Double lambourdage, pente \u22654%, RLDC, cales polymeres, ventilation 1/50."}
              </div>
              <div className={styles.notice} style={{ marginTop: "0.4rem" }}>
                Classe d&apos;emploi requise : <strong>{classeRequise}</strong>
              </div>
            </div>

            <div className={styles.sectionTitle}>Dimensions des lames</div>
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Epaisseur (mm)</label>
                <select className={styles.select} value={epLames} onChange={(e) => setEpLames(e.target.value as EpaisseursKey)}>
                  <option value="21-23">21 - 23 mm</option>
                  <option value="24-27">24 - 27 mm</option>
                  <option value="28-32">28 - 32 mm</option>
                  <option value="33-39">33 - 39 mm</option>
                  <option value="40-45">40 - 45 mm</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Largeur (mm)</label>
                <select className={styles.select} value={largLames} onChange={(e) => setLargLames(parseInt(e.target.value) as LargeurKey)}>
                  <option value={90}>90 mm</option>
                  <option value={120}>120 mm</option>
                  <option value={140}>140 mm</option>
                </select>
              </div>
            </div>

            <div className={styles.sectionTitle}>Lambourdes</div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Section lambourde (l x h mm)</label>
              <select className={styles.select} value={sectionStr} onChange={(e) => setSectionStr(e.target.value)}>
                {SECTIONS.map((s) => {
                  const [b, h] = s.split("x");
                  return <option key={s} value={s}>{b} x {h} mm (l x h)</option>;
                })}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Essence lambourde</label>
              <select className={styles.select} value={essLambIdx} onChange={(e) => setEssLambIdx(parseInt(e.target.value))}>
                {essencesLames.map((ess, i) => (
                  <option key={i} value={i}>{ess.name}{ess.exotique ? " 🌍" : ""}</option>
                ))}
              </select>
            </div>

            <div className={styles.sectionTitle}>Configuration</div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nombre d&apos;appuis</label>
              <div className={styles.toggleRow}>
                <button className={`${styles.toggleBtn} ${nbAppuis === 3 ? styles.toggleBtnActive : ""}`} onClick={() => setNbAppuis(3)}>3 appuis</button>
                <button className={`${styles.toggleBtn} ${nbAppuis === 2 ? styles.toggleBtnActive : ""}`} onClick={() => setNbAppuis(2)}>2 appuis</button>
              </div>
              {nbAppuis === 2 && (
                <div className={`${styles.notice} ${styles.noticeDanger}`} style={{ color: "#8B6A3F", background: "#FFF8F0", border: "1px solid #F0D8B8" }}>
                  2 appuis : reduction de 25% sur l&apos;entraxe lambourdes et 15% sur l&apos;entraxe lames.
                </div>
              )}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Entraxe lambourdes prevu (mm) — optionnel</label>
              <input type="number" className={styles.inputNumber} placeholder="Ex : 400" min={100} max={1200} step={10} value={entraxeReel || ""} onChange={(e) => setEntraxeReel(parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        {/* PANNEAU DROIT */}
        <div className={styles.panelRight}>
          <div className={styles.svgCard}>
            <svg ref={svgRef} viewBox="0 0 560 320" xmlns="http://www.w3.org/2000/svg" />
          </div>
          <ResultsCard result={result} classeRequise={classeRequise} />
        </div>
      </div>
    </>
  );
}

/* ═══ RESULTS ═══ */

function ResultsCard({ result: r, classeRequise }: { result: ComputeResult; classeRequise: string }) {
  const notAdmitted = r.entraxeMaxLamb === null || r.entraxeMaxLames === null;

  return (
    <div className={styles.resultsCard}>
      <div className={styles.resultRowGrid}>
        <div className={styles.resultBig}>
          <div className={styles.resultBigLabel}>Espacement max entre plots</div>
          <div className={styles.resultBigSublabel}>(portee admissible de la lambourde)</div>
          <div className={styles.resultBigValue}>
            {r.entraxeMaxLamb === null
              ? <span style={{ color: "#EF4444" }}>Non admis</span>
              : <>{r.entraxeMaxLamb} <span className={styles.resultBigUnit}>mm</span></>}
          </div>
        </div>
        <div className={styles.resultBig}>
          <div className={styles.resultBigLabel}>Espacement max entre lambourdes</div>
          <div className={styles.resultBigSublabel}>(portee admissible de la lame)</div>
          <div className={styles.resultBigValue}>
            {r.entraxeMaxLames === null
              ? <span style={{ color: "#EF4444" }}>Non admis</span>
              : <>{r.entraxeMaxLames} <span className={styles.resultBigUnit}>mm</span></>}
          </div>
        </div>
      </div>

      {notAdmitted && (
        <div className={styles.notAdmitted}>
          Configuration non admise par le DTU 51.4 — changez l&apos;epaisseur, la largeur ou la classe mecanique.
        </div>
      )}

      {!notAdmitted && r.verdict && (
        <div className={styles.verdictBox} style={{ background: r.verdict.bg, color: r.verdict.color }}>
          <div className={styles.verdictLabel}>{r.verdict.label}</div>
          <div className={styles.verdictFs}>{r.entraxeReel} / {r.entraxeMaxLamb} mm</div>
        </div>
      )}

      <div className={styles.noteBox}>
        L&apos;espacement entre lambourdes doit respecter la portee admissible de la lame.
        L&apos;espacement entre plots doit respecter la portee admissible de la lambourde.
        Le dimensionnement final retient la valeur la plus contraignante.
      </div>

      <div className={styles.calcDetail}>
        <CalcRow label="Usage" value={USAGES[r.usage].label} />
        <CalcRow label="Classe mecanique lames" value={r.classeLames} />
        <CalcRow label="Classe mecanique lambourdes" value={r.classeLamb} />
        <CalcRow label="Section lambourde" value={`${r.bLamb} x ${r.hLamb} mm`} />
        <CalcRow label="Epaisseur lames" value={`${r.epLames} mm`} />
        <CalcRow label="Largeur lames" value={`${r.largLames} mm`} />
        <CalcRow label="Nombre d'appuis" value={`${r.nbAppuis} appuis${r.nbAppuis === 2 ? " (reductions appliquees)" : ""}`} />
      </div>

      <div className={styles.prescriptions}>
        <strong>Prescriptions complementaires DTU 51.4</strong>
        <ul>
          <li>Classe d&apos;emploi requise : <strong>{classeRequise}</strong></li>
          <li>Jeu entre lames a la pose : 5 - 7 mm</li>
          <li>Jeu en bout de lame : 4 - 6 mm</li>
          <li>Hauteur de plenum minimale : 100 mm</li>
          <li>Diametre vis minimal : <strong>{r.visMin} mm</strong></li>
          <li>Pre-percage : <strong>{r.prePercage}</strong></li>
        </ul>
      </div>
    </div>
  );
}

function CalcRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.calcRow}>
      <span className={styles.calcLabel}>{label}</span>
      <span className={styles.calcValue}>{value}</span>
    </div>
  );
}

/* ═══ SVG DRAWING (imperative) ═══ */

function drawSVG(svg: SVGSVGElement, r: ComputeResult, conceptionMode: string) {
  const svgW = 560, svgH = 320;
  const lameColor = r.verdict ? r.verdict.color : "#5E8B8F";
  const lameBg = r.verdict ? r.verdict.bg : "rgba(94,139,143,0.12)";
  const scale = 2.5;
  const epMid = getEpMid(r.epLames);
  const lameH = Math.max(epMid * scale * 0.4, 10);
  const lambH = Math.max(r.hLamb * scale * 0.4, 18);
  const lambW = Math.max(r.bLamb * scale * 0.4, 14);
  const plotR = 8;
  const isDouble = conceptionMode === "elaboree";
  const lambGap = isDouble ? 4 : 0;

  const baseY = svgH - 60;
  const plotY = baseY;
  const lambTopY = plotY - plotR - 4 - lambH;
  const lameTopY = lambTopY - 4 - lameH;

  const entraxeDraw = r.entraxeMaxLames ? Math.min(r.entraxeMaxLames * 0.35, 180) : 140;
  const nLamb = 3;
  const totalW = entraxeDraw * (nLamb - 1);
  const startX = (svgW - totalW) / 2;

  const bandX1 = startX - 50;
  const bandX2 = startX + totalW + 50;
  const bandW = bandX2 - bandX1;

  let html = "";

  html += `<defs>
    <pattern id="grain" width="8" height="${lameH}" patternUnits="userSpaceOnUse">
      <line x1="0" y1="${lameH * 0.3}" x2="8" y2="${lameH * 0.3}" stroke="${lameColor}" stroke-width="0.4" opacity="0.25"/>
      <line x1="0" y1="${lameH * 0.6}" x2="8" y2="${lameH * 0.6}" stroke="${lameColor}" stroke-width="0.3" opacity="0.2"/>
    </pattern>
  </defs>`;

  // Lame
  html += `<rect x="${bandX1}" y="${lameTopY}" width="${bandW}" height="${lameH}" fill="${lameBg}" stroke="${lameColor}" stroke-width="1" rx="1"/>`;
  html += `<rect x="${bandX1}" y="${lameTopY}" width="${bandW}" height="${lameH}" fill="url(#grain)" rx="1"/>`;

  // Lambourdes
  for (let i = 0; i < nLamb; i++) {
    const cx = startX + i * entraxeDraw;
    if (isDouble) {
      const lx1 = cx - lambW - lambGap / 2;
      const lx2 = cx + lambGap / 2;
      html += `<rect x="${lx1}" y="${lambTopY}" width="${lambW}" height="${lambH}" fill="rgba(138,130,121,0.15)" stroke="#2A2826" stroke-width="1" rx="1"/>`;
      html += `<rect x="${lx2}" y="${lambTopY}" width="${lambW}" height="${lambH}" fill="rgba(138,130,121,0.15)" stroke="#2A2826" stroke-width="1" rx="1"/>`;
    } else {
      const lx = cx - lambW / 2;
      html += `<rect x="${lx}" y="${lambTopY}" width="${lambW}" height="${lambH}" fill="rgba(138,130,121,0.15)" stroke="#2A2826" stroke-width="1" rx="1"/>`;
    }
  }

  // Plots
  for (let i = 0; i < nLamb; i++) {
    const cx = startX + i * entraxeDraw;
    html += `<circle cx="${cx}" cy="${plotY}" r="${plotR}" fill="none" stroke="#7A7672" stroke-width="1.2"/>`;
    html += `<line x1="${cx - plotR}" y1="${plotY + plotR + 2}" x2="${cx + plotR}" y2="${plotY + plotR + 2}" stroke="#7A7672" stroke-width="1"/>`;
  }

  // Cotes
  const coteFont = `font-family="'DM Mono', monospace" font-size="9" fill="#2A2826"`;

  const coteLambY = plotY + plotR + 20;
  html += `<line x1="${startX}" y1="${coteLambY}" x2="${startX + entraxeDraw}" y2="${coteLambY}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${startX}" y1="${coteLambY - 3}" x2="${startX}" y2="${coteLambY + 3}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${startX + entraxeDraw}" y1="${coteLambY - 3}" x2="${startX + entraxeDraw}" y2="${coteLambY + 3}" stroke="#2A2826" stroke-width="0.7"/>`;
  const entraxeLabel = r.entraxeMaxLames !== null ? r.entraxeMaxLames + " mm max" : "\u2014 mm";
  html += `<text x="${startX + entraxeDraw / 2}" y="${coteLambY + 13}" ${coteFont} text-anchor="middle">entre lambourdes ${entraxeLabel}</text>`;

  // Epaisseur lame
  const coteEpX = bandX1 - 12;
  html += `<line x1="${coteEpX}" y1="${lameTopY}" x2="${coteEpX}" y2="${lameTopY + lameH}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${coteEpX - 3}" y1="${lameTopY}" x2="${coteEpX + 3}" y2="${lameTopY}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${coteEpX - 3}" y1="${lameTopY + lameH}" x2="${coteEpX + 3}" y2="${lameTopY + lameH}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<text x="${coteEpX - 5}" y="${lameTopY + lameH / 2 + 3}" ${coteFont} text-anchor="end">e=${epMid}mm</text>`;

  // Hauteur lambourde
  html += `<line x1="${coteEpX}" y1="${lambTopY}" x2="${coteEpX}" y2="${lambTopY + lambH}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${coteEpX - 3}" y1="${lambTopY}" x2="${coteEpX + 3}" y2="${lambTopY}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<line x1="${coteEpX - 3}" y1="${lambTopY + lambH}" x2="${coteEpX + 3}" y2="${lambTopY + lambH}" stroke="#2A2826" stroke-width="0.7"/>`;
  html += `<text x="${coteEpX - 5}" y="${lambTopY + lambH / 2 + 3}" ${coteFont} text-anchor="end">h=${r.hLamb}mm</text>`;

  // Plenum
  const plenumTop = lameTopY + lameH;
  const plenumBot = plotY + plotR;
  const plenumX = bandX2 + 15;
  html += `<line x1="${plenumX}" y1="${plenumTop}" x2="${plenumX}" y2="${plenumBot}" stroke="#7A7672" stroke-width="0.5" stroke-dasharray="3,2"/>`;
  html += `<text x="${plenumX + 4}" y="${(plenumTop + plenumBot) / 2 + 3}" font-family="'DM Mono', monospace" font-size="8" fill="#7A7672">\u2265100mm</text>`;

  // Titre
  const subtitle = isDouble ? "Coupe transversale — double lambourdage" : "Coupe transversale du platelage";
  html += `<text x="${svgW / 2}" y="18" font-family="'DM Sans', sans-serif" font-size="11" fill="#7A7672" text-anchor="middle" font-weight="300">${subtitle}</text>`;

  svg.innerHTML = html;
}

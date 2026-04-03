"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MONTHS,
  MONTHS_SHORT,
  DEPT_NAMES,
  VEG_TYPES,
  ZONE_COLORS,
  SIMPLE_METHODS,
  DETAIL_EQUIPMENT,
  getETP,
  getSortedDeptKeys,
} from "@/lib/tools/arrosage/constants";
import { calculate, drawChart } from "@/lib/tools/arrosage/calculations";
import type { Zone, ZoneResult, Mode } from "@/lib/tools/arrosage/types";
import styles from "./page.module.css";

export default function ArrosagePage() {
  const [dept, setDept] = useState("");
  const [currentETP, setCurrentETP] = useState<number[]>(new Array(12).fill(0));
  const [showEtp, setShowEtp] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [zoneIdCounter, setZoneIdCounter] = useState(0);
  const [mode, setMode] = useState<Mode>("simple");
  const [results, setResults] = useState<ZoneResult[] | null>(null);
  const [totalVol, setTotalVol] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deptKeys = useRef(getSortedDeptKeys());
  const newZoneRef = useRef<HTMLInputElement>(null);
  const shouldFocusNewZone = useRef(false);

  // Init with one zone on mount
  useEffect(() => {
    addZone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw chart when results change
  useEffect(() => {
    if (results && canvasRef.current) {
      drawChart(canvasRef.current, results, MONTHS_SHORT);
    }
  }, [results]);

  // Redraw chart on window resize
  useEffect(() => {
    function handleResize() {
      if (results && canvasRef.current) {
        drawChart(canvasRef.current, results, MONTHS_SHORT);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [results]);

  function addZone(focus = false) {
    if (focus) shouldFocusNewZone.current = true;
    setZoneIdCounter((prev) => {
      const newId = prev + 1;
      setZones((prevZones) => [
        ...prevZones,
        {
          id: newId,
          name: "Zone " + newId,
          surface: 100,
          vegType: 0,
          kc: VEG_TYPES[0].kc,
          simpleMethod: 0,
          detailEquip: "tuyeres",
          detailParams: {},
        },
      ]);
      return newId;
    });
  }

  // Focus le champ "nom" de la nouvelle zone après ajout
  useEffect(() => {
    if (shouldFocusNewZone.current && newZoneRef.current) {
      newZoneRef.current.focus();
      newZoneRef.current.select();
      shouldFocusNewZone.current = false;
    }
  }, [zones.length]);

  function removeZone(id: number) {
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  function updateZone(id: number, updates: Partial<Zone>) {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, ...updates } : z))
    );
  }

  function handleDeptChange(value: string) {
    setDept(value);
    if (!value) {
      setShowEtp(false);
      return;
    }
    const etp = getETP(value);
    setCurrentETP(etp);
    setShowEtp(true);
  }

  function handleEtpChange(index: number, value: number) {
    setCurrentETP((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  const handleCalculate = useCallback(() => {
    if (zones.length === 0) {
      alert("Ajoutez au moins une zone.");
      return;
    }
    if (!dept) {
      alert("Choisissez un departement.");
      return;
    }

    const res = calculate(zones, currentETP, mode);
    const total = res.reduce((a, r) => a + r.annualVol, 0);
    setResults(res);
    setTotalVol(total);

    // Scroll to results
    setTimeout(() => {
      document.getElementById("step-results")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [zones, currentETP, mode, dept]);

  const etpTotal = currentETP.reduce((a, b) => a + b, 0);

  return (
    <div className={styles.page}>
      <div className={styles.pageTitleSection}>
        <h1>calculateur d&apos;arrosage</h1>
        <p>Estimez les besoins en eau de vos amenagements paysagers par zone et par mois.</p>
      </div>

      {/* ═══ ETAPE 1 — ETP ═══ */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>Etape 1 — Evapotranspiration (ETP)</div>
        <div className={styles.card}>
          <div className={styles.fieldGroup} style={{ maxWidth: 360, marginBottom: "0.8rem" }}>
            <label className={styles.label} htmlFor="dept-select">Departement</label>
            <select
              id="dept-select"
              className={styles.select}
              value={dept}
              onChange={(e) => handleDeptChange(e.target.value)}
            >
              <option value="">— Choisir un departement —</option>
              {deptKeys.current.map((code) => (
                <option key={code} value={code}>
                  {code} — {DEPT_NAMES[code]}
                </option>
              ))}
            </select>
          </div>
          {showEtp && (
            <div>
              <table className={styles.etpTable}>
                <thead>
                  <tr>
                    {MONTHS.map((m) => (
                      <th key={m}>{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {currentETP.map((val, i) => (
                      <td key={i}>
                        <input
                          type="number"
                          className={styles.etpInput}
                          min={0}
                          max={300}
                          step={1}
                          value={val}
                          onChange={(e) => handleEtpChange(i, parseFloat(e.target.value) || 0)}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <div className={styles.etpTotal}>
                Total annuel : {etpTotal} mm
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ ETAPE 2 — ZONES ═══ */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>Etape 2 — Zones de vegetation</div>
        {zones.map((z, idx) => {
          const color = ZONE_COLORS[idx % ZONE_COLORS.length];
          return (
            <div key={z.id} className={styles.zoneCard}>
              <div className={styles.zoneHeader}>
                <div className={styles.zoneColor} style={{ background: color }} />
                <input
                  type="text"
                  className={styles.inputText}
                  value={z.name}
                  onChange={(e) => updateZone(z.id, { name: e.target.value })}
                  ref={idx === zones.length - 1 ? newZoneRef : undefined}
                />
                <button
                  className={styles.zoneDelete}
                  onClick={() => removeZone(z.id)}
                  title="Supprimer"
                >
                  &times;
                </button>
              </div>
              <div className={styles.zoneFields}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Surface (m&#178;)</label>
                  <input
                    type="number"
                    className={styles.inputNumber}
                    min={0}
                    step={1}
                    value={z.surface}
                    onChange={(e) =>
                      updateZone(z.id, { surface: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Type de vegetation</label>
                  <select
                    className={styles.select}
                    value={z.vegType}
                    onChange={(e) => {
                      const vegIdx = parseInt(e.target.value);
                      updateZone(z.id, {
                        vegType: vegIdx,
                        kc: VEG_TYPES[vegIdx].kc,
                      });
                    }}
                  >
                    {VEG_TYPES.map((v, i) => (
                      <option key={i} value={i}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Kc</label>
                  <input
                    type="number"
                    className={styles.inputNumber}
                    min={0}
                    max={1.5}
                    step={0.01}
                    value={z.kc}
                    onChange={(e) =>
                      updateZone(z.id, { kc: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
        <button className={styles.btnAdd} onClick={() => addZone(true)}>
          + Ajouter une zone
        </button>
      </div>

      {/* ═══ ETAPE 3 — MODE ═══ */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>Etape 3 — Mode d&apos;arrosage</div>
        <div className={styles.toggleWrap}>
          <button
            className={`${styles.toggleBtn} ${styles.toggleBtnFirst} ${mode === "simple" ? styles.toggleBtnActive : ""}`}
            onClick={() => setMode("simple")}
          >
            Simplifie
          </button>
          <button
            className={`${styles.toggleBtn} ${styles.toggleBtnLast} ${mode === "detail" ? styles.toggleBtnActive : ""}`}
            onClick={() => setMode("detail")}
          >
            Detaille
          </button>
        </div>
        {mode === "simple" && (
          <div className={styles.warningBox}>
            &#9888;&#65039; Mode simplifie — Les resultats sont bases sur des moyennes generales et des hypotheses d&apos;efficience standard.
            Ils sont adaptes aux phases amont (ESQ, APS) pour des estimations de consommation. Pour un dimensionnement precis, passez en mode detaille avec le materiel prevu.
          </div>
        )}
        <IrrigationConfig zones={zones} mode={mode} updateZone={updateZone} />
      </div>

      {/* ═══ CALCULER ═══ */}
      <div className={styles.calculateWrap}>
        <button className={styles.btnPrimary} onClick={handleCalculate}>
          Calculer les besoins en eau
        </button>
      </div>

      {/* ═══ ETAPE 4 — RESULTATS ═══ */}
      {results && (
        <div className={styles.step} id="step-results">
          <div className={styles.stepHeader}>Etape 4 — Resultats</div>
          <div className={styles.card} style={{ textAlign: "center", marginBottom: "1.2rem" }}>
            <div className={styles.resultLabel}>Volume annuel total</div>
            <div className={styles.resultBig}>
              {totalVol.toFixed(1)} <span className={styles.resultUnit}>m&#179;/an</span>
            </div>
          </div>
          <div className={`${styles.card} ${styles.chartContainer}`}>
            <canvas ref={canvasRef} height={300} />
          </div>
          <div className={styles.card} style={{ marginTop: "1rem", overflowX: "auto" }}>
            <table className={styles.recapTable}>
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Surface</th>
                  <th>Kc</th>
                  <th>Equipement</th>
                  <th>Efficience</th>
                  <th>Volume (m&#179;/an)</th>
                  {mode === "detail" && <th>Pic (h/sem)</th>}
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.zone.id}>
                    <td>
                      <span className={styles.recapDot} style={{ background: r.color }} />
                      {r.zone.name}
                    </td>
                    <td className={styles.mono}>{r.zone.surface} m&#178;</td>
                    <td className={styles.mono}>{r.zone.kc}</td>
                    <td>{r.equipName}</td>
                    <td className={styles.mono}>{r.eff.toFixed(2)}</td>
                    <td className={styles.mono}>{r.annualVol.toFixed(1)}</td>
                    {mode === "detail" && (
                      <td className={styles.mono}>
                        {r.peakHours !== null ? r.peakHours.toFixed(1) : "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   IRRIGATION CONFIG
   ════════════════════════════════════════════ */

function IrrigationConfig({
  zones,
  mode,
  updateZone,
}: {
  zones: Zone[];
  mode: Mode;
  updateZone: (id: number, updates: Partial<Zone>) => void;
}) {
  if (zones.length === 0) {
    return (
      <p className={styles.irrigEmpty}>
        Ajoutez au moins une zone pour configurer l&apos;arrosage.
      </p>
    );
  }

  return (
    <>
      {zones.map((z, idx) => {
        const color = ZONE_COLORS[idx % ZONE_COLORS.length];

        if (mode === "simple") {
          return (
            <div key={z.id} className={styles.zoneCard} style={{ marginBottom: "0.6rem" }}>
              <div className={styles.irrigZoneHeader}>
                <div className={styles.zoneColor} style={{ background: color }} />
                <span className={styles.irrigZoneName}>{z.name}</span>
              </div>
              <div className={`${styles.fieldGroup} ${styles.irrigMethodWrap}`}>
                <label className={styles.label}>Methode d&apos;arrosage</label>
                <select
                  className={styles.select}
                  value={z.simpleMethod}
                  onChange={(e) =>
                    updateZone(z.id, { simpleMethod: parseInt(e.target.value) })
                  }
                >
                  {SIMPLE_METHODS.map((m, i) => (
                    <option key={i} value={i}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        }

        // Detail mode
        const equipKeys = Object.keys(DETAIL_EQUIPMENT);
        const currentEquip = z.detailEquip || "tuyeres";
        const equipDef = DETAIL_EQUIPMENT[currentEquip];

        return (
          <div key={z.id} className={styles.zoneCard} style={{ marginBottom: "0.6rem" }}>
            <div className={styles.irrigZoneHeader}>
              <div className={styles.zoneColor} style={{ background: color }} />
              <span className={styles.irrigZoneName}>{z.name}</span>
            </div>
            <div className={`${styles.fieldGroup} ${styles.irrigSlidersWrap}`}>
              <label className={styles.label}>Type de materiel</label>
              <select
                className={styles.select}
                value={currentEquip}
                onChange={(e) =>
                  updateZone(z.id, { detailEquip: e.target.value, detailParams: {} })
                }
              >
                {equipKeys.map((k) => (
                  <option key={k} value={k}>{DETAIL_EQUIPMENT[k].name}</option>
                ))}
              </select>
            </div>
            {equipDef.params.map((p) => {
              const val =
                z.detailParams[p.id] !== undefined ? z.detailParams[p.id] : p.def;
              return (
                <div key={p.id} className={styles.sliderGroup}>
                  <div className={styles.sliderLabel}>
                    <span>{p.label}</span>
                    <span className={styles.sliderValue}>{val}</span>
                  </div>
                  <input
                    type="range"
                    className={styles.rangeInput}
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    value={val}
                    onChange={(e) => {
                      const newVal = parseFloat(e.target.value);
                      updateZone(z.id, {
                        detailParams: { ...z.detailParams, [p.id]: newVal },
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

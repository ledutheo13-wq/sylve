"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { Plante } from "@/types/plantes";
import type { EssenceSlot, Bioregion, CriterionKey } from "@/lib/tools/compatibilite/types";
import {
  computeScoring,
  scoreColor,
  scoreVerdict,
  formatStrate,
  formatExposition,
  parseCouleurFloraison,
  moisToNum,
  isInRange,
  isMonthBefore,
  isMonthAfter,
  getRusticite,
  getBioregionFromDept,
  BIOREGION_LABELS,
  BIOREGION_RUSTICITE,
  CRITERIA_LABELS,
} from "@/lib/tools/compatibilite/scoring";
import styles from "./page.module.css";

interface Props {
  plantes: Plante[];
}

// ═══════════════════════════════════════════════════════════
//  SEARCH UTILITY
// ═══════════════════════════════════════════════════════════

function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\̀-\ͯ]/g, "");
}

function searchPlantes(
  query: string,
  allPlantes: Plante[],
  selectedIds: Set<string>
): Plante[] {
  if (!query || query.length < 3 || allPlantes.length === 0) return [];
  const q = normalize(query);
  return allPlantes
    .filter((p) => {
      if (selectedIds.has(p.id)) return false;
      return normalize(p.nom_latin).includes(q) || normalize(p.nom_commun).includes(q);
    })
    .slice(0, 8);
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export default function CompatibiliteVegetale({ plantes }: Props) {
  // Mix info
  const [mixName, setMixName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [bioregion, setBioregion] = useState<Bioregion | "">("");
  const [bioregionAuto, setBioregionAuto] = useState<string>("");
  const [bioregionChoices, setBioregionChoices] = useState<string[]>([]);

  // Essences
  const [essences, setEssences] = useState<EssenceSlot[]>([null, null]);

  // Advanced mode
  const [advancedMode, setAdvancedMode] = useState(false);
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [globalDensity, setGlobalDensity] = useState<number>(0);
  const [surfaceTotal, setSurfaceTotal] = useState<number>(0);

  // Derived
  const selectedPlants = useMemo(() => essences.filter((e): e is Plante => e !== null), [essences]);
  const selectedIds = useMemo(() => new Set(selectedPlants.map((p) => p.id)), [selectedPlants]);
  const result = useMemo(() => computeScoring(selectedPlants), [selectedPlants]);

  // ── Bioregion from postal code ──
  const handlePostalCode = useCallback((val: string) => {
    setPostalCode(val);
    if (val.length >= 2) {
      let dept = val.substring(0, 2);
      if (val.startsWith("97") && val.length >= 3) dept = val.substring(0, 3);
      if (val.toUpperCase().startsWith("2A") || val.toUpperCase().startsWith("2B"))
        dept = val.substring(0, 2).toUpperCase();

      const bios = getBioregionFromDept(dept);
      if (bios.length === 1) {
        setBioregion(bios[0] as Bioregion);
        setBioregionAuto("Bior\égion : " + BIOREGION_LABELS[bios[0]]);
        setBioregionChoices([]);
      } else if (bios.length > 1) {
        setBioregionAuto("D\épartement \à cheval sur 2 bior\égions :");
        setBioregionChoices(bios);
        setBioregion("");
      } else {
        setBioregionAuto("");
        setBioregionChoices([]);
      }
    } else {
      setBioregionAuto("");
      setBioregionChoices([]);
    }
  }, []);

  // ── Essences management ──
  const addEssence = useCallback(() => {
    setEssences((prev) => (prev.length >= 12 ? prev : [...prev, null]));
  }, []);

  const removeEssence = useCallback((index: number) => {
    setEssences((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const selectPlant = useCallback((index: number, plant: Plante) => {
    setEssences((prev) => {
      const next = [...prev];
      next[index] = plant;
      return next;
    });
  }, []);

  const clearPlant = useCallback((index: number) => {
    setEssences((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  // ── Advanced mode ──
  const toggleAdvanced = useCallback(() => setAdvancedMode((p) => !p), []);

  const setPct = useCallback((id: string, val: number) => {
    setPercentages((prev) => ({ ...prev, [id]: val }));
  }, []);

  const pctTotal = useMemo(() => {
    return selectedPlants.reduce((sum, p) => sum + (percentages[p.id] || 0), 0);
  }, [selectedPlants, percentages]);

  // ── Recap stats ──
  const recapStats = useMemo(() => {
    if (selectedPlants.length === 0) return null;
    const nbPersist = selectedPlants.filter((p) => p.persistance === "persistant").length;
    const nbMelli = selectedPlants.filter((p) => p.mellifere).length;
    const nbIndig = bioregion
      ? selectedPlants.filter((p) => p.indigenat && p.indigenat[bioregion as keyof typeof p.indigenat]).length
      : 0;
    return {
      pctPersist: Math.round((nbPersist / selectedPlants.length) * 100),
      pctMelli: Math.round((nbMelli / selectedPlants.length) * 100),
      pctIndig: bioregion ? Math.round((nbIndig / selectedPlants.length) * 100) : null,
    };
  }, [selectedPlants, bioregion]);

  // ── Rusticite ──
  const rusticiteData = useMemo(() => getRusticite(selectedPlants), [selectedPlants]);

  const rusticiteAlert = useMemo(() => {
    if (!bioregion || !rusticiteData) return null;
    const threshold = BIOREGION_RUSTICITE[bioregion];
    if (rusticiteData.min > threshold) {
      return `Rusticit\é insuffisante pour la bior\égion ${BIOREGION_LABELS[bioregion]} (seuil recommand\é : ${threshold}\°C)`;
    }
    return null;
  }, [bioregion, rusticiteData]);

  // ── Problematic plant names (for recap table highlighting) ──
  const problematicNames = useMemo(() => {
    if (!result) return new Set<string>();
    return new Set(result.alerts.map((a) => a.plantName));
  }, [result]);

  // ── Alert display style ──
  const alertStyle = useMemo(() => {
    if (!result) return { color: "", bg: "", icon: "", title: "" };
    const s = result.globalScore;
    if (s >= 80) return { color: "#5E8B8F", bg: "rgba(94,139,143,0.05)", icon: "\•", title: "M\élange coh\érent" };
    if (s >= 60) return { color: "#C4973B", bg: "rgba(196,151,59,0.05)", icon: "\⚠", title: "Points d'attention" };
    if (s >= 40) return { color: "#C4973B", bg: "rgba(196,151,59,0.08)", icon: "\⚠", title: "Risque identifi\é" };
    return { color: "#A67C5B", bg: "rgba(166,124,91,0.08)", icon: "\⚠", title: "Risque \élev\é d'incompatibilit\é" };
  }, [result]);

  const showDashboard = selectedPlants.length >= 2 && result !== null;

  return (
    <>
      <div className={styles.pageTitleBar}>
        <h1>compatibilit\é v\ég\étale</h1>
        <p>Analysez la compatibilit\é botanique et \écologique de vos m\élanges v\ég\étaux.</p>
      </div>

      <div className={styles.app}>
        {/* ════ PANNEAU GAUCHE ════ */}
        <div className={styles.panelLeft}>
          {/* Section 1 - Mix info */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Informations du m\élange</div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Nom du m\élange</label>
              <input
                type="text"
                className={styles.input}
                placeholder="ex : Massif ombre \— R\ésidence Alma"
                value={mixName}
                onChange={(e) => setMixName(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Code postal du projet</label>
              <input
                type="text"
                className={styles.input}
                placeholder="ex : 75012"
                maxLength={5}
                value={postalCode}
                onChange={(e) => handlePostalCode(e.target.value)}
              />
              {bioregionAuto && (
                <div className={styles.bioregionHint}>{bioregionAuto}</div>
              )}
              {bioregionChoices.length > 0 && (
                <select
                  className={styles.select}
                  style={{ marginTop: "0.3rem" }}
                  value={bioregion}
                  onChange={(e) => setBioregion(e.target.value as Bioregion)}
                >
                  <option value="">Choisissez\…</option>
                  {bioregionChoices.map((b) => (
                    <option key={b} value={b}>{BIOREGION_LABELS[b]}</option>
                  ))}
                </select>
              )}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Ou choisir directement la bior\égion</label>
              <select
                className={styles.select}
                value={bioregionChoices.length > 0 ? "" : bioregion}
                onChange={(e) => {
                  setBioregion(e.target.value as Bioregion | "");
                  setBioregionAuto("");
                  setBioregionChoices([]);
                  setPostalCode("");
                }}
              >
                <option value="">\— Aucune \—</option>
                <option value="atlantique">Atlantique</option>
                <option value="continental">Continental</option>
                <option value="mediterraneen">M\éditerran\éen</option>
                <option value="alpin">Alpin</option>
              </select>
            </div>
          </div>

          {/* Section 2 - Essences */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionTitle}>Essences du m\élange</div>
            <div className={styles.dbStatus}>
              \✓ Base v\ég\étale : {plantes.length} essences
            </div>
            <div>
              {essences.map((plant, index) => (
                <EssenceRow
                  key={index}
                  index={index}
                  plant={plant}
                  allPlantes={plantes}
                  selectedIds={selectedIds}
                  onSelect={selectPlant}
                  onClear={clearPlant}
                  onRemove={removeEssence}
                />
              ))}
            </div>
            <button
              className={styles.btnAddEssence}
              onClick={addEssence}
              disabled={essences.length >= 12}
            >
              + Ajouter une essence
            </button>
            <div className={styles.essenceCounter}>
              {selectedPlants.length} / 12 essences
            </div>
          </div>

          {/* Section 3 - Advanced mode */}
          <div className={styles.sectionCard}>
            <button className={styles.advancedToggle} onClick={toggleAdvanced}>
              Mode avanc\é \— Quantitatif {advancedMode ? "\▴" : "\▾"}
            </button>
            {advancedMode && (
              <div className={styles.advancedContent}>
                {selectedPlants.map((p) => (
                  <div key={p.id} className={styles.densityRow}>
                    <span className={styles.densityName}>{p.nom_latin}</span>
                    <div className={styles.pctInputWrap}>
                      <input
                        type="number"
                        className={styles.inputNumber}
                        placeholder="ex : 25"
                        min={0}
                        max={100}
                        step={1}
                        value={percentages[p.id] || ""}
                        onChange={(e) => setPct(p.id, parseFloat(e.target.value) || 0)}
                      />
                      <span className={styles.pctSuffix}>%</span>
                    </div>
                  </div>
                ))}
                <PctTotalIndicator total={pctTotal} />
                <div className={styles.fieldGroup} style={{ marginTop: "0.8rem" }}>
                  <label className={styles.fieldLabel}>Densit\é globale (plants/m\²)</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="ex : 6"
                    min={0}
                    step={0.5}
                    value={globalDensity || ""}
                    onChange={(e) => setGlobalDensity(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Surface totale (m\²)</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="ex : 120"
                    min={0}
                    step={1}
                    value={surfaceTotal || ""}
                    onChange={(e) => setSurfaceTotal(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <p className={styles.advancedHint}>
                  Le mode avanc\é calcule les quantit\és, la densit\é globale et les pourcentages
                  pond\ér\és d&apos;indig\énat et de mellif\ère.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ════ PANNEAU DROIT ════ */}
        <div className={styles.panelRight}>
          {!showDashboard && (
            <div className={styles.resultCard}>
              <div className={styles.emptyState}>
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M32 56 C32 56 12 42 12 26 C12 16 20 8 32 8 C44 8 52 16 52 26 C52 42 32 56 32 56Z" />
                  <path d="M32 20 L32 40" />
                  <path d="M24 28 C28 24 32 28 32 28 C32 28 36 24 40 28" />
                </svg>
                <div className={styles.emptyTitle}>
                  Ajoutez au moins 2 essences pour analyser la compatibilit\é
                </div>
                <div className={styles.emptySub}>
                  L&apos;analyse se met \à jour en temps r\éel
                </div>
              </div>
            </div>
          )}

          {showDashboard && result && (
            <>
              {/* Header */}
              <div className={styles.resultCard} style={{ padding: "16px 20px" }}>
                <div className={styles.dashTitle}>{mixName || "M\élange sans nom"}</div>
                {bioregion && (
                  <div className={styles.dashBioregion}>
                    Bior\égion : {BIOREGION_LABELS[bioregion]}
                  </div>
                )}
              </div>

              {/* Score global */}
              <div className={styles.resultCard}>
                <ScoreCircle score={result.globalScore} />
              </div>

              {/* Detail par critere */}
              <div className={styles.resultCard}>
                <div className={styles.resultCardTitle}>D\étail par crit\ère</div>
                <div className={styles.criteriaList}>
                  {(Object.entries(CRITERIA_LABELS) as [CriterionKey, string][]).map(([key, label]) => {
                    const score = result.criteriaScores[key];
                    return (
                      <div key={key} className={styles.criteriaRow}>
                        <div className={styles.criteriaLabel}>{label}</div>
                        <div className={styles.criteriaBarWrap}>
                          <div
                            className={styles.criteriaBar}
                            style={{ width: `${score}%`, background: scoreColor(score) }}
                          />
                        </div>
                        <div className={styles.criteriaScore} style={{ color: scoreColor(score) }}>
                          {score}/100
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Alerts */}
              <div className={styles.resultCard}>
                <div
                  className={styles.resultCardTitle}
                  style={{ color: alertStyle.color }}
                >
                  {alertStyle.title}
                </div>
                <div>
                  {result.alerts.length > 0 ? (
                    result.alerts.map((a, i) => (
                      <div
                        key={i}
                        className={styles.alertItem}
                        style={{ background: alertStyle.bg, borderLeftColor: alertStyle.color }}
                      >
                        <span className={styles.alertIcon}>{alertStyle.icon}</span>
                        <span>{a.message}</span>
                      </div>
                    ))
                  ) : result.globalScore >= 80 ? (
                    <div
                      className={styles.alertItem}
                      style={{ background: alertStyle.bg, borderLeftColor: alertStyle.color }}
                    >
                      <span className={styles.alertIcon}>{alertStyle.icon}</span>
                      <span>Aucune incompatibilit\é d\étect\ée dans ce m\élange</span>
                    </div>
                  ) : (
                    <div
                      className={styles.alertItem}
                      style={{ background: alertStyle.bg, borderLeftColor: alertStyle.color }}
                    >
                      <span className={styles.alertIcon}>{alertStyle.icon}</span>
                      <span>Des \écarts sont d\étect\és entre les essences \— consultez le d\étail par crit\ère ci-dessus</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rusticite */}
              <div className={styles.resultCard}>
                <div className={styles.resultCardTitle}>Limite de rusticit\é du m\élange</div>
                <div className={styles.rusticiteValue}>
                  {rusticiteData ? `${rusticiteData.min}\°C` : "\—"}
                </div>
                {rusticiteData && (
                  <div className={styles.rusticiteDetail}>
                    ({rusticiteData.plantName} \— l&apos;essence la moins rustique)
                  </div>
                )}
                {rusticiteAlert && (
                  <div className={styles.rusticiteAlert}>\⚠ {rusticiteAlert}</div>
                )}
              </div>

              {/* Recap table */}
              <div className={styles.resultCard}>
                <div className={styles.resultCardTitle}>R\écapitulatif des essences</div>
                <div className={styles.tableWrap}>
                  <table className={styles.recapTable}>
                    <thead>
                      <tr>
                        <th>Nom latin</th>
                        <th>Famille</th>
                        <th>Strate</th>
                        <th>Persistance</th>
                        <th>Exposition</th>
                        <th>Mellif\ère</th>
                        <th>Indig\énat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPlants.map((p) => {
                        let indigenatCell: string;
                        if (bioregion) {
                          const isIndig = p.indigenat && p.indigenat[bioregion as keyof typeof p.indigenat];
                          indigenatCell = isIndig ? "\✓ Indig\ène" : "\✗ Exotique";
                        } else {
                          const parts: string[] = [];
                          for (const [bio, label] of Object.entries(BIOREGION_LABELS)) {
                            if (p.indigenat && p.indigenat[bio as keyof typeof p.indigenat]) {
                              parts.push(label.substring(0, 3) + ".");
                            }
                          }
                          indigenatCell = parts.length > 0 ? parts.join(" ") : "\✗";
                        }
                        return (
                          <tr
                            key={p.id}
                            className={problematicNames.has(p.nom_latin) ? styles.problematic : undefined}
                          >
                            <td className={styles.latin}>{p.nom_latin}</td>
                            <td>{p.famille}</td>
                            <td>{formatStrate(p.strate)}</td>
                            <td>{p.persistance === "persistant" ? "Persistant" : "Caduc"}</td>
                            <td>{formatExposition(p.exposition)}</td>
                            <td>{p.mellifere ? "\✓" : "\✗"}</td>
                            <td>{indigenatCell}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {recapStats && (
                  <div className={styles.recapStats}>
                    <span>% persistantes : <strong>{recapStats.pctPersist}%</strong></span>
                    <span>% mellif\ères : <strong>{recapStats.pctMelli}%</strong></span>
                    {recapStats.pctIndig !== null && bioregion && (
                      <span>% indig\ènes : <strong>{recapStats.pctIndig}%</strong> ({BIOREGION_LABELS[bioregion]})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Pheno calendar */}
              <div className={styles.resultCard}>
                <div className={styles.resultCardTitle}>Calendrier ph\énologique</div>
                <PhenoCalendar plants={selectedPlants} />
              </div>

              {/* Advanced results */}
              {advancedMode && (
                <div className={styles.resultCard}>
                  <div className={styles.resultCardTitle}>Mode avanc\é \— Quantitatif</div>
                  <AdvancedResults
                    plants={selectedPlants}
                    percentages={percentages}
                    globalDensity={globalDensity}
                    surfaceTotal={surfaceTotal}
                    bioregion={bioregion}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  ESSENCE ROW (with autocomplete)
// ═══════════════════════════════════════════════════════════

interface EssenceRowProps {
  index: number;
  plant: EssenceSlot;
  allPlantes: Plante[];
  selectedIds: Set<string>;
  onSelect: (index: number, plant: Plante) => void;
  onClear: (index: number) => void;
  onRemove: (index: number) => void;
}

function EssenceRow({
  index,
  plant,
  allPlantes,
  selectedIds,
  onSelect,
  onClear,
  onRemove,
}: EssenceRowProps) {
  const [query, setQuery] = useState(plant ? plant.nom_latin : "");
  const [acResults, setAcResults] = useState<Plante[]>([]);
  const [acOpen, setAcOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showNotFound, setShowNotFound] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const notFoundTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync query when plant changes externally (e.g. removal reindex)
  useEffect(() => {
    setQuery(plant ? plant.nom_latin : "");
  }, [plant]);

  // Close autocomplete on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAcOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleInput = useCallback(
    (val: string) => {
      setQuery(val);
      setShowNotFound(false);
      clearTimeout(notFoundTimer.current);

      // If user edits a validated field, invalidate
      if (plant && val !== plant.nom_latin) {
        onClear(index);
      }

      if (val.trim().length < 3) {
        setAcResults([]);
        setAcOpen(false);
        return;
      }

      const results = searchPlantes(val.trim(), allPlantes, selectedIds);
      setAcResults(results);
      setAcOpen(results.length > 0);
      setActiveIdx(-1);

      if (results.length === 0) {
        notFoundTimer.current = setTimeout(() => {
          if (val.trim().length >= 3 && !plant) {
            setShowNotFound(true);
          }
        }, 500);
      }
    },
    [plant, index, onClear, allPlantes, selectedIds]
  );

  const handleFocus = useCallback(() => {
    if (!plant && query.trim().length >= 3) {
      const results = searchPlantes(query.trim(), allPlantes, selectedIds);
      setAcResults(results);
      setAcOpen(results.length > 0);
    }
  }, [plant, query, allPlantes, selectedIds]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") setAcOpen(false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => {
          if (e.key === "ArrowDown") return Math.min(prev + 1, acResults.length - 1);
          return Math.max(prev - 1, 0);
        });
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (activeIdx >= 0 && activeIdx < acResults.length) {
          handleSelectPlant(acResults[activeIdx]);
        }
      }
    },
    [acResults, activeIdx]
  );

  const handleSelectPlant = useCallback(
    (p: Plante) => {
      setQuery(p.nom_latin);
      setAcOpen(false);
      setShowNotFound(false);
      onSelect(index, p);
    },
    [index, onSelect]
  );

  return (
    <div className={`${styles.essenceRow} ${plant ? styles.validated : ""}`}>
      <div className={styles.essenceSearchWrap} ref={wrapRef}>
        <input
          type="text"
          className={styles.essenceInput}
          placeholder="Rechercher une essence\…"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
        {plant && (
          <div className={styles.essenceMeta}>
            {formatStrate(plant.strate)} \· {plant.famille}
          </div>
        )}
        {showNotFound && !plant && (
          <div className={styles.essenceNotFound}>
            Essence non trouv\ée dans la base ({allPlantes.length.toLocaleString("fr-FR")} essences)
          </div>
        )}
        {acOpen && acResults.length > 0 && (
          <div className={styles.autocompleteList}>
            {acResults.map((p, i) => (
              <div
                key={p.id}
                className={`${styles.autocompleteItem} ${i === activeIdx ? styles.active : ""}`}
                onMouseDown={(e) => { e.preventDefault(); handleSelectPlant(p); }}
                onMouseEnter={() => setActiveIdx(i)}
              >
                <span className={styles.acLatin}>{p.nom_latin}</span>
                <span className={styles.acCommun}>\— {p.nom_commun}</span>
                <span className={styles.acStrate}>{formatStrate(p.strate)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {plant && <span className={styles.essenceBadge}>\✓</span>}
      <button className={styles.btnDeleteEssence} onClick={() => onRemove(index)}>
        \×
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  SCORE CIRCLE
// ═══════════════════════════════════════════════════════════

function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 58; // ~364.42
  const filled = (score / 100) * circumference;

  return (
    <div className={styles.scoreBlock}>
      <div className={styles.scoreCircleWrap}>
        <svg viewBox="0 0 140 140">
          <circle className={styles.scoreCircleBg} cx="70" cy="70" r="58" />
          <circle
            className={styles.scoreCircleFg}
            cx="70"
            cy="70"
            r="58"
            strokeDasharray={`${filled} ${circumference}`}
            stroke={scoreColor(score)}
          />
        </svg>
        <div className={styles.scoreNumber}>
          {score}<span> / 100</span>
        </div>
      </div>
      <div className={styles.scoreVerdict} style={{ color: scoreColor(score) }}>
        {scoreVerdict(score)}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PCT TOTAL INDICATOR
// ═══════════════════════════════════════════════════════════

function PctTotalIndicator({ total }: { total: number }) {
  if (total === 0) {
    return (
      <div className={styles.pctTotal} style={{ color: "var(--text-light)" }}>
        Saisissez les % de chaque essence (parts \égales par d\éfaut)
      </div>
    );
  }
  if (total === 100) {
    return (
      <div className={styles.pctTotal} style={{ color: "var(--primary)" }}>
        \✓ Total : <strong>100%</strong>
      </div>
    );
  }
  if (total > 100) {
    return (
      <div className={styles.pctTotal} style={{ color: "var(--ocre)" }}>
        \⚠ Total : <strong>{total}%</strong> / 100% \— sup\érieur \à 100%
      </div>
    );
  }
  return (
    <div className={styles.pctTotal} style={{ color: "var(--text-muted)" }}>
      Total : <strong>{total}%</strong> / 100%
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  PHENO CALENDAR
// ═══════════════════════════════════════════════════════════

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function PhenoCalendar({ plants }: { plants: Plante[] }) {
  return (
    <div className={styles.phenoTable}>
      <div className={`${styles.phenoRow} ${styles.phenoHeader}`}>
        <div className={styles.phenoName} />
        {MONTHS.map((m, i) => (
          <div key={i} className={styles.phenoMonth}>{m}</div>
        ))}
      </div>
      {plants.map((p) => {
        const color = parseCouleurFloraison(p.couleur_floraison);
        const debut = moisToNum(p.floraison_debut);
        const fin = moisToNum(p.floraison_fin);
        const isPersist = p.persistance === "persistant";

        return (
          <div key={p.id} className={styles.phenoRow}>
            <div className={styles.phenoName}>{p.nom_latin}</div>
            {Array.from({ length: 12 }, (_, i) => {
              const m = i + 1;
              const inFlower = debut !== null && fin !== null && isInRange(m, debut, fin);

              let style: React.CSSProperties;
              if (debut !== null && fin !== null && isMonthBefore(m, debut)) {
                style = isPersist
                  ? { background: `linear-gradient(to right, rgba(94,139,143,0.15) 50%, ${color}40 100%)` }
                  : { background: `linear-gradient(to right, transparent 50%, ${color}40 100%)` };
              } else if (debut !== null && fin !== null && isMonthAfter(m, fin)) {
                style = isPersist
                  ? { background: `linear-gradient(to right, ${color}40 0%, rgba(94,139,143,0.15) 50%)` }
                  : { background: `linear-gradient(to right, ${color}40 0%, transparent 50%)` };
              } else if (inFlower) {
                style = { background: color };
              } else if (isPersist) {
                style = { background: "rgba(94, 139, 143, 0.15)" };
              } else {
                style = { background: "transparent" };
              }

              return (
                <div key={m} className={styles.phenoCell}>
                  <div className={styles.phenoBar} style={style} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ADVANCED RESULTS
// ═══════════════════════════════════════════════════════════

interface AdvancedResultsProps {
  plants: Plante[];
  percentages: Record<string, number>;
  globalDensity: number;
  surfaceTotal: number;
  bioregion: Bioregion | "";
}

function AdvancedResults({
  plants,
  percentages,
  globalDensity,
  surfaceTotal,
  bioregion,
}: AdvancedResultsProps) {
  const n = plants.length;
  const defaultPct = n > 0 ? 100 / n : 0;
  const anyPctFilled = plants.some((p) => (percentages[p.id] || 0) > 0);

  let totalPlants = 0;
  let melliWeighted = 0;
  let indigWeighted = 0;

  const rows = plants.map((p) => {
    const pct = anyPctFilled ? (percentages[p.id] || 0) : defaultPct;
    const qty =
      globalDensity > 0 && surfaceTotal > 0
        ? Math.round(globalDensity * surfaceTotal * (pct / 100))
        : 0;
    const effDensity = globalDensity > 0 ? globalDensity * pct / 100 : null;

    totalPlants += qty;
    if (p.mellifere) melliWeighted += qty;
    if (bioregion && p.indigenat && p.indigenat[bioregion as keyof typeof p.indigenat]) {
      indigWeighted += qty;
    }

    return { plant: p, pct, qty, effDensity };
  });

  const pctMelli = totalPlants > 0 ? Math.round((melliWeighted / totalPlants) * 100) : 0;
  const pctIndig = totalPlants > 0 ? Math.round((indigWeighted / totalPlants) * 100) : 0;

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.quantTable}>
          <thead>
            <tr>
              <th>Essence</th>
              <th>% du m\élange</th>
              <th>Quantit\é totale</th>
              <th>Densit\é effective</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.plant.id}>
                <td>{r.plant.nom_latin}</td>
                <td>{r.pct > 0 ? `${r.pct.toFixed(0)}%` : "\—"}</td>
                <td>{r.qty || "\—"}</td>
                <td>{r.effDensity !== null ? `${r.effDensity.toFixed(1)} pl/m\²` : "\—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.quantSummary}>
        <div className={styles.quantStat}>
          Densit\é globale : <strong>{globalDensity || "\—"} plants/m\²</strong>
        </div>
        <div className={styles.quantStat}>
          Nombre total : <strong>{totalPlants || "\—"} plants</strong>
        </div>
        <div className={styles.quantStat}>
          % mellif\ères (pond\ér\é) : <strong>{pctMelli}%</strong>
        </div>
        <div className={styles.quantStat}>
          % indig\ènes (pond\ér\é) : <strong>{pctIndig}%</strong>
          {bioregion ? ` (${BIOREGION_LABELS[bioregion]})` : ""}
        </div>
      </div>
    </>
  );
}

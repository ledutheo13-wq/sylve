"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Plante } from "@/types/plantes";
import type { Mix, PlantInMix } from "@/lib/tools/calendrier/types";
import {
  STRATE_ORDER,
  STRATE_LABELS,
  MOIS_ABBREV,
  MOIS_NOMS,
  normalize,
  parseCouleurFloraison,
  hexToRgb,
  isPersistant,
  getPersistanceBadgeClass,
  MAX_ESSENCES,
} from "@/lib/tools/calendrier/phenology";
import styles from "./page.module.css";

interface Props {
  plantes: Plante[];
}

export default function CalendrierPhenologique({ plantes }: Props) {
  const [mixes, setMixes] = useState<Mix[]>([
    { id: 1, nom: "", essences: [] },
  ]);
  const [mixCounter, setMixCounter] = useState(1);
  const [calendarGenerated, setCalendarGenerated] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // ─── Helpers ───

  const getTotalEssences = useCallback(
    (currentMixes: Mix[]) =>
      currentMixes.reduce(
        (sum, m) => sum + m.essences.filter((e) => e.plante).length,
        0
      ),
    []
  );

  const getSelectedIds = useCallback(
    (currentMixes: Mix[]) => {
      const ids = new Set<string>();
      currentMixes.forEach((m) =>
        m.essences.forEach((e) => {
          if (e.plante) ids.add(e.plante.id);
        })
      );
      return ids;
    },
    []
  );

  const totalEssences = getTotalEssences(mixes);

  // ─── Mix Management ───

  function addMix() {
    const nextId = mixCounter + 1;
    setMixCounter(nextId);
    setMixes((prev) => [...prev, { id: nextId, nom: "", essences: [] }]);
  }

  function removeMix(id: number) {
    if (!confirm("Supprimer ce melange et toutes ses essences ?")) return;
    setMixes((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMixName(id: number, nom: string) {
    setMixes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, nom } : m))
    );
  }

  function addEssence(mixId: number) {
    if (totalEssences >= MAX_ESSENCES) return;
    setMixes((prev) =>
      prev.map((m) =>
        m.id === mixId
          ? {
              ...m,
              essences: [
                ...m.essences,
                { id: Date.now(), plante: null, searchText: "" },
              ],
            }
          : m
      )
    );
  }

  function removeEssence(mixId: number, essenceId: number) {
    setMixes((prev) =>
      prev.map((m) =>
        m.id === mixId
          ? { ...m, essences: m.essences.filter((e) => e.id !== essenceId) }
          : m
      )
    );
  }

  function selectEssence(mixId: number, essenceId: number, planteId: string) {
    const plante = plantes.find((p) => p.id === planteId);
    if (!plante) return;
    setMixes((prev) =>
      prev.map((m) =>
        m.id === mixId
          ? {
              ...m,
              essences: m.essences.map((e) =>
                e.id === essenceId
                  ? { ...e, plante, searchText: plante.nom_latin }
                  : e
              ),
            }
          : m
      )
    );
  }

  function resetEssence(mixId: number, essenceId: number) {
    setMixes((prev) =>
      prev.map((m) =>
        m.id === mixId
          ? {
              ...m,
              essences: m.essences.map((e) =>
                e.id === essenceId
                  ? { ...e, plante: null, searchText: "" }
                  : e
              ),
            }
          : m
      )
    );
  }

  function updateSearchText(
    mixId: number,
    essenceId: number,
    text: string
  ) {
    setMixes((prev) =>
      prev.map((m) =>
        m.id === mixId
          ? {
              ...m,
              essences: m.essences.map((e) =>
                e.id === essenceId ? { ...e, searchText: text } : e
              ),
            }
          : m
      )
    );
  }

  function sortByStrate(mixId: number) {
    setMixes((prev) =>
      prev.map((m) => {
        if (m.id !== mixId) return m;
        const sorted = [...m.essences].sort((a, b) => {
          const sa = a.plante
            ? STRATE_ORDER.indexOf(
                a.plante.strate as (typeof STRATE_ORDER)[number]
              )
            : 999;
          const sb = b.plante
            ? STRATE_ORDER.indexOf(
                b.plante.strate as (typeof STRATE_ORDER)[number]
              )
            : 999;
          return (sa === -1 ? 998 : sa) - (sb === -1 ? 998 : sb);
        });
        return { ...m, essences: sorted };
      })
    );
  }

  // ─── Calendar Generation ───

  function generateCalendar() {
    const hasEssences = mixes.some((m) =>
      m.essences.some((e) => e.plante)
    );
    if (!hasEssences) return;
    setCalendarGenerated(true);
  }

  // Fade-in effect
  useEffect(() => {
    if (calendarGenerated && calendarRef.current) {
      // Double rAF for CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          calendarRef.current?.classList.add(styles.calendarContainerVisible);
        });
      });
    }
  }, [calendarGenerated, mixes]);

  // ─── Export PNG ───

  async function exportPNG() {
    const el = exportRef.current;
    if (!el) return;

    const html2canvas = (await import("html2canvas")).default;

    el.style.padding = "32px";
    el.style.backgroundColor = "#FFFFFF";

    try {
      const canvas = await html2canvas(el, {
        scale: 3,
        backgroundColor: "#FFFFFF",
        useCORS: true,
        logging: false,
      });
      el.style.padding = "24px";
      const link = document.createElement("a");
      link.download = "calendrier-phenologique-sylve.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      el.style.padding = "24px";
      console.error("Export error", err);
    }
  }

  // ─── Render ───

  const selectedIds = getSelectedIds(mixes);

  return (
    <>
      <div className={styles.titleBar}>
        <h1>calendrier phenologique</h1>
        <p>
          Visualisez les periodes de floraison et de feuillage de votre palette
          vegetale sur 12 mois
        </p>
      </div>

      <div className={styles.inputZone}>
        <div className={styles.sectionLabel}>Melanges et essences</div>

        <div className={styles.essenceCounter}>
          <span
            className={
              totalEssences >= MAX_ESSENCES
                ? styles.essenceCountLimit
                : styles.essenceCount
            }
          >
            {totalEssences}
          </span>{" "}
          / {MAX_ESSENCES} essences
        </div>

        {mixes.map((mix, idx) => (
          <MixBlock
            key={mix.id}
            mix={mix}
            index={idx}
            plantes={plantes}
            selectedIds={selectedIds}
            totalEssences={totalEssences}
            onUpdateName={updateMixName}
            onRemoveMix={removeMix}
            onAddEssence={addEssence}
            onRemoveEssence={removeEssence}
            onSelectEssence={selectEssence}
            onResetEssence={resetEssence}
            onUpdateSearchText={updateSearchText}
            onSortByStrate={sortByStrate}
          />
        ))}

        <button className={styles.btnAddMelange} onClick={addMix}>
          + Ajouter un melange
        </button>

        <div className={styles.sectionLabel}>Actions</div>
        <div className={styles.actionsBar}>
          <button className={styles.btnPrimary} onClick={generateCalendar}>
            Generer le calendrier
          </button>
          {calendarGenerated && (
            <button className={styles.btnSecondary} onClick={exportPNG}>
              Exporter en PNG
            </button>
          )}
        </div>
      </div>

      {/* CALENDAR ZONE (visible) */}
      <div className={styles.calendarZone}>
        <div ref={calendarRef} className={styles.calendarContainer}>
          {!calendarGenerated ? (
            <EmptyState />
          ) : (
            <CalendarContent mixes={mixes} />
          )}
        </div>
      </div>

      {/* EXPORT CONTAINER (hidden off-screen, opacity 1 for html2canvas) */}
      {calendarGenerated && (
        <div
          ref={exportRef}
          className={styles.exportContainer}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2DED9",
            borderRadius: 8,
            padding: 24,
          }}
        >
          <CalendarContent mixes={mixes} />
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  MIX BLOCK
// ═══════════════════════════════════════════════════════════

interface MixBlockProps {
  mix: Mix;
  index: number;
  plantes: Plante[];
  selectedIds: Set<string>;
  totalEssences: number;
  onUpdateName: (id: number, nom: string) => void;
  onRemoveMix: (id: number) => void;
  onAddEssence: (mixId: number) => void;
  onRemoveEssence: (mixId: number, essenceId: number) => void;
  onSelectEssence: (
    mixId: number,
    essenceId: number,
    planteId: string
  ) => void;
  onResetEssence: (mixId: number, essenceId: number) => void;
  onUpdateSearchText: (
    mixId: number,
    essenceId: number,
    text: string
  ) => void;
  onSortByStrate: (mixId: number) => void;
}

function MixBlock({
  mix,
  index,
  plantes,
  selectedIds,
  totalEssences,
  onUpdateName,
  onRemoveMix,
  onAddEssence,
  onRemoveEssence,
  onSelectEssence,
  onResetEssence,
  onUpdateSearchText,
  onSortByStrate,
}: MixBlockProps) {
  return (
    <div className={styles.melangeBlock}>
      <div className={styles.melangeHeader}>
        <input
          type="text"
          className={styles.melangeNameInput}
          value={mix.nom}
          placeholder={`Melange ${index + 1}`}
          onChange={(e) => onUpdateName(mix.id, e.target.value)}
        />
        <button
          className={styles.btnDeleteMelange}
          onClick={() => onRemoveMix(mix.id)}
          title="Supprimer le melange"
          tabIndex={-1}
        >
          &times;
        </button>
      </div>

      {mix.essences.map((ess) => (
        <EssenceRow
          key={ess.id}
          essence={ess}
          mixId={mix.id}
          plantes={plantes}
          selectedIds={selectedIds}
          onSelect={onSelectEssence}
          onRemove={onRemoveEssence}
          onReset={onResetEssence}
          onUpdateSearch={onUpdateSearchText}
        />
      ))}

      <div className={styles.melangeFooter}>
        <button
          className={styles.btnAdd}
          onClick={() => onAddEssence(mix.id)}
          disabled={totalEssences >= MAX_ESSENCES}
        >
          + Ajouter une essence
        </button>
        {mix.essences.length > 1 && (
          <button
            className={styles.btnSort}
            onClick={() => onSortByStrate(mix.id)}
          >
            Trier par strate
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  ESSENCE ROW WITH AUTOCOMPLETE
// ═══════════════════════════════════════════════════════════

interface EssenceRowProps {
  essence: PlantInMix;
  mixId: number;
  plantes: Plante[];
  selectedIds: Set<string>;
  onSelect: (mixId: number, essenceId: number, planteId: string) => void;
  onRemove: (mixId: number, essenceId: number) => void;
  onReset: (mixId: number, essenceId: number) => void;
  onUpdateSearch: (mixId: number, essenceId: number, text: string) => void;
}

function EssenceRow({
  essence,
  mixId,
  plantes,
  selectedIds,
  onSelect,
  onRemove,
  onReset,
  onUpdateSearch,
}: EssenceRowProps) {
  const [showAC, setShowAC] = useState(false);
  const [results, setResults] = useState<Plante[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [noResult, setNoResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const noResultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInput(value: string) {
    // If validated, reset first
    if (essence.plante) {
      onReset(mixId, essence.id);
      return;
    }

    onUpdateSearch(mixId, essence.id, value);

    if (value.trim().length < 3) {
      setShowAC(false);
      setResults([]);
      setNoResult(false);
      return;
    }

    const nq = normalize(value.trim());
    const filtered: Plante[] = [];
    for (const p of plantes) {
      if (selectedIds.has(p.id)) continue;
      const nLatin = normalize(p.nom_latin || "");
      const nCommun = normalize(p.nom_commun || "");
      if (nLatin.includes(nq) || nCommun.includes(nq)) {
        filtered.push(p);
        if (filtered.length >= 8) break;
      }
    }

    if (noResultTimerRef.current) clearTimeout(noResultTimerRef.current);

    if (filtered.length === 0) {
      setResults([]);
      noResultTimerRef.current = setTimeout(() => {
        setNoResult(true);
        setShowAC(true);
      }, 500);
      return;
    }

    setNoResult(false);
    setResults(filtered);
    setActiveIdx(0);
    setShowAC(true);
  }

  function handleFocus() {
    if (!essence.plante && essence.searchText.trim().length >= 3) {
      handleInput(essence.searchText);
    }
  }

  function handleSelect(planteId: string) {
    onSelect(mixId, essence.id, planteId);
    setShowAC(false);
    setResults([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Tab" && showAC) {
      // Fermer la liste déroulante quand on Tab
      setShowAC(false);
    }
    if (!showAC || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIdx]) {
        handleSelect(results[activeIdx].id);
      }
    } else if (e.key === "Escape") {
      setShowAC(false);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.parentElement?.contains(e.target as Node)
      ) {
        setShowAC(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const p = essence.plante;

  return (
    <div className={styles.essenceRow}>
      <div className={styles.essenceSearchWrap}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.essenceSearch}${
            p ? ` ${styles.essenceSearchValidated}` : ""
          }`}
          value={p ? p.nom_latin : essence.searchText}
          placeholder="Rechercher une essence..."
          onChange={(e) => handleInput(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          readOnly={!!p}
        />

        <div
          className={`${styles.autocompleteList}${
            showAC ? ` ${styles.autocompleteListOpen}` : ""
          }`}
        >
          {noResult && results.length === 0 ? (
            <div className={styles.autocompleteNoresult}>
              Aucune essence trouvee
            </div>
          ) : (
            results.map((r, i) => (
              <div
                key={r.id}
                className={`${styles.autocompleteItem}${
                  i === activeIdx ? ` ${styles.autocompleteItemActive}` : ""
                }`}
                onMouseDown={() => handleSelect(r.id)}
              >
                <div className={styles.acLatin}>{r.nom_latin}</div>
                <div className={styles.acCommun}>{r.nom_commun || ""}</div>
                <div className={styles.acStrate}>
                  {STRATE_LABELS[r.strate] || r.strate || ""}
                </div>
              </div>
            ))
          )}
        </div>

        {p && (
          <div className={styles.essenceMeta}>
            <span>
              {STRATE_LABELS[p.strate] || p.strate || ""}
              {p.famille ? ` \— ${p.famille}` : ""}
            </span>
            <span
              className={`${styles.badgePersistance} ${
                styles[getPersistanceBadgeClass(p.persistance)]
              }`}
            >
              {p.persistance}
            </span>
          </div>
        )}
      </div>
      <button
        className={styles.btnDeleteEssence}
        onClick={() => onRemove(mixId, essence.id)}
        title="Supprimer"
        tabIndex={-1}
      >
        &times;
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  CALENDAR CONTENT
// ═══════════════════════════════════════════════════════════

function CalendarContent({ mixes }: { mixes: Mix[] }) {
  return (
    <>
      <div className={styles.calTitle}>Calendrier phenologique</div>
      <div className={styles.calMonthsHeader}>
        {MOIS_ABBREV.map((m, i) => (
          <div key={i} className={styles.calMonthLabel}>
            {m}
          </div>
        ))}
      </div>

      {mixes.map((mix, idx) => {
        const validEssences = mix.essences.filter((e) => e.plante);
        if (validEssences.length === 0) return null;
        const nomMelange = mix.nom || `Melange ${idx + 1}`;

        return (
          <div key={mix.id} className={styles.calMelangeGroup}>
            <div className={styles.calMelangeTitle}>{nomMelange}</div>
            {validEssences.map((ess) => (
              <EssenceLine key={ess.id} plante={ess.plante!} />
            ))}
          </div>
        );
      })}

      <div className={styles.calLegend}>
        <div className={styles.calLegendItem}>
          <div
            className={styles.calLegendSwatch}
            style={{ background: "#E8A0B0", opacity: 0.85 }}
          />
          Floraison
        </div>
        <div className={styles.calLegendItem}>
          <div
            className={styles.calLegendSwatch}
            style={{ background: "rgba(94,139,143,0.20)" }}
          />
          Feuillage persistant
        </div>
        <div className={styles.calLegendItem}>
          <div
            className={styles.calLegendSwatch}
            style={{ background: "rgba(140,191,140,0.25)" }}
          />
          Feuillage caduc
        </div>
      </div>

      <div className={styles.calFooter}>
        sylve.eco &mdash; Calendrier phenologique
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
//  ESSENCE LINE (calendar row)
// ═══════════════════════════════════════════════════════════

function EssenceLine({ plante: p }: { plante: Plante }) {
  const persistent = isPersistant(p.persistance);

  // Foliage band style
  let feuillageStyle: React.CSSProperties;
  if (persistent) {
    feuillageStyle = {
      left: 0,
      right: 0,
      background: "rgba(94,139,143,0.20)",
      borderRadius: 3,
    };
  } else {
    // Caduc: March-October with gradients
    // Using rgba(..., 0) instead of transparent for html2canvas
    feuillageStyle = {
      left: 0,
      right: 0,
      background:
        "linear-gradient(to right, rgba(140,191,140,0) 12.5%, rgba(140,191,140,0.25) 16.7%, rgba(140,191,140,0.25) 83.3%, rgba(140,191,140,0) 87.5%)",
      borderRadius: 3,
    };
  }

  // Flowering bands
  const floraisonBands: React.CSSProperties[] = [];
  const debut =
    typeof p.floraison_debut === "number"
      ? p.floraison_debut
      : parseInt(String(p.floraison_debut));
  const fin =
    typeof p.floraison_fin === "number"
      ? p.floraison_fin
      : parseInt(String(p.floraison_fin));

  if (debut && fin && !isNaN(debut) && !isNaN(fin)) {
    const floraisonColor = parseCouleurFloraison(p.couleur_floraison);
    if (floraisonColor) {
      const rgb = hexToRgb(floraisonColor);

      const makeGrad = (
        s: number,
        e: number
      ): React.CSSProperties => ({
        left: `${s}%`,
        width: `${e - s}%`,
        background: `linear-gradient(to right, rgba(${rgb.r},${rgb.g},${rgb.b},0) 0%, rgba(${rgb.r},${rgb.g},${rgb.b},0.85) 8%, rgba(${rgb.r},${rgb.g},${rgb.b},0.85) 92%, rgba(${rgb.r},${rgb.g},${rgb.b},0) 100%)`,
        borderRadius: 3,
      });

      if (debut <= fin) {
        const startPct = ((debut - 1) / 12) * 100;
        const endPct = (fin / 12) * 100;
        floraisonBands.push(makeGrad(startPct, endPct));
      } else {
        // Cross-year (e.g. Nov -> Feb)
        const startPct1 = ((debut - 1) / 12) * 100;
        floraisonBands.push(makeGrad(startPct1, 100));
        const endPct2 = (fin / 12) * 100;
        floraisonBands.push(makeGrad(0, endPct2));
      }
    }
  }

  // Tooltip content
  const strateLabel = STRATE_LABELS[p.strate] || p.strate || "";
  const persistanceLabel = p.persistance || "";
  let floraisonInfo = "Pas de floraison significative";
  if (p.floraison_debut && p.floraison_fin) {
    const couleurText = p.couleur_floraison
      ? Array.isArray(p.couleur_floraison)
        ? p.couleur_floraison[0]
        : p.couleur_floraison
      : "";
    floraisonInfo = `${MOIS_NOMS[p.floraison_debut - 1]} a ${
      MOIS_NOMS[p.floraison_fin - 1]
    }`;
    if (couleurText) floraisonInfo += ` \— ${couleurText}`;
  }

  const rusticite =
    p.rusticite_celsius != null
      ? `${p.rusticite_celsius}\°C (${p.rusticite_usda || ""})`
      : "";

  return (
    <div className={styles.calEssenceLine}>
      <div className={styles.calEssenceName} title={p.nom_latin}>
        {p.nom_latin}
      </div>
      <div className={styles.calBandContainer}>
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={styles.calMonthCell} />
        ))}
        <div className={styles.calFeuillageBand} style={feuillageStyle} />
        {floraisonBands.map((bandStyle, i) => (
          <div
            key={i}
            className={styles.calFloraisonBand}
            style={bandStyle}
          />
        ))}
      </div>
      <div className={styles.calTooltip}>
        <strong>{p.nom_latin}</strong>
        <br />
        {p.nom_commun || ""}
        <br />
        Strate : {strateLabel}
        <br />
        Persistance : {persistanceLabel}
        <br />
        Floraison : {floraisonInfo}
        {rusticite && (
          <>
            <br />
            Rusticite : {rusticite}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  EMPTY STATE
// ═══════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <div className={styles.calendarEmpty}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        stroke="#E2DED9"
        strokeWidth="1.2"
      >
        <rect x="6" y="10" width="36" height="32" rx="4" />
        <line x1="6" y1="18" x2="42" y2="18" />
        <line x1="16" y1="6" x2="16" y2="14" />
        <line x1="32" y1="6" x2="32" y2="14" />
        <circle cx="18" cy="28" r="3" />
        <circle cx="30" cy="28" r="3" />
        <line x1="20" y1="36" x2="28" y2="36" />
      </svg>
      <div className={styles.emptyTitle}>
        Ajoutez des essences et cliquez sur &quot;Generer le calendrier&quot;
      </div>
      <div className={styles.emptySub}>
        Le calendrier phenologique affiche les periodes de floraison et de
        feuillage de votre palette vegetale
      </div>
    </div>
  );
}

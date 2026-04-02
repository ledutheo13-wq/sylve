"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type DragEvent,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { Plante } from "@/types/plantes";
import type {
  FilterState,
  SortMode,
  Melange,
  ExportGroup,
  BioregionKey,
} from "@/lib/tools/selecteur/types";
import {
  filterPlantes,
  sortPlantes,
  buildColorCatCache,
  buildFamilyList,
  getDefaultFilters,
  parseCouleurFloraison,
  fmtHeight,
  expoEmoji,
  buildIndicatorsText,
  norm,
  MOIS,
  MOIS_SELECT,
  STRATE_ORDER,
  STRATE_OPTIONS,
  EXPOSITION_OPTIONS,
  BESOINS_HYDRIQUES_OPTIONS,
  TYPE_SOL_OPTIONS,
  PH_SOL_OPTIONS,
  HUMIDITE_SOL_OPTIONS,
  PERSISTANCE_OPTIONS,
  MELLIFERE_OPTIONS,
  COULEUR_FLORAISON_OPTIONS,
} from "@/lib/tools/selecteur/filters";
import styles from "./page.module.css";

const BATCH = 30;
const MAX_SEL = 50;

interface Props {
  plantes: Plante[];
}

export default function SelecteurEssences({ plantes }: Props) {
  // ─── State ───
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters);
  const [sortMode, setSortMode] = useState<SortMode>("strate");
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [melanges, setMelanges] = useState<Melange[]>([]);
  const [melangeCounter, setMelangeCounter] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [firstDragDone, setFirstDragDone] = useState(false);
  const [displayCount, setDisplayCount] = useState(BATCH);
  const [confirmState, setConfirmState] = useState<{
    msg: string;
    cb: () => void;
  } | null>(null);

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [acResults, setAcResults] = useState<Plante[]>([]);
  const [acIndex, setAcIndex] = useState(-1);
  const [acVisible, setAcVisible] = useState(false);

  // Family autocomplete
  const [familyQuery, setFamilyQuery] = useState("");
  const [familyDDVisible, setFamilyDDVisible] = useState(false);

  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropHoverId, setDropHoverId] = useState<string | null>(null);

  // Row menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Refs
  const resultsPanelRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const exportContainerRef = useRef<HTMLDivElement>(null);

  // ─── Memoized data ───
  const colorCatCache = useMemo(
    () => buildColorCatCache(plantes),
    [plantes]
  );
  const allFamilies = useMemo(() => buildFamilyList(plantes), [plantes]);

  const filtered = useMemo(() => {
    const result = filterPlantes(plantes, filters, colorCatCache);
    return sortPlantes(result, sortMode);
  }, [plantes, filters, colorCatCache, sortMode]);

  // Reset displayCount when filters change
  useEffect(() => {
    setDisplayCount(BATCH);
  }, [filters, sortMode]);

  const displayed = useMemo(
    () => filtered.slice(0, displayCount),
    [filtered, displayCount]
  );

  // ─── Infinite scroll ───
  useEffect(() => {
    const panel = resultsPanelRef.current;
    const sentinel = sentinelRef.current;
    if (!panel || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < filtered.length) {
          setDisplayCount((prev) => Math.min(prev + BATCH, filtered.length));
        }
      },
      { root: panel, rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [displayCount, filtered.length]);

  // ─── Close row menu on outside click ───
  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ─── Family matches ───
  const familyMatches = useMemo(() => {
    if (familyQuery.length < 2) return [];
    const q = norm(familyQuery);
    return allFamilies.filter((f) => norm(f).includes(q)).slice(0, 10);
  }, [familyQuery, allFamilies]);

  // ─── Filter update helpers ───
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const togglePill = useCallback(
    (key: keyof FilterState, value: string) => {
      setFilters((prev) => {
        const arr = prev[key] as string[];
        const next = arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value];
        return { ...prev, [key]: next };
      });
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters(getDefaultFilters());
    setFamilyQuery("");
    setSearchQuery("");
  }, []);

  // ─── Selection ───
  const toggleSelection = useCallback(
    (id: string) => {
      setSelection((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          // Also remove from melanges
          setMelanges((mels) =>
            mels.map((m) => ({
              ...m,
              essenceIds: m.essenceIds.filter((eid) => eid !== id),
            }))
          );
        } else {
          if (next.size >= MAX_SEL) return prev;
          next.add(id);
        }
        return next;
      });
    },
    []
  );

  // ─── Autocomplete ───
  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchQuery(value);
      const q = norm(value);
      if (q.length < 3) {
        setAcResults([]);
        setAcVisible(false);
        return;
      }
      const results = plantes
        .filter(
          (p) =>
            norm(p.nom_latin).includes(q) || norm(p.nom_commun).includes(q)
        )
        .slice(0, 8);
      setAcResults(results);
      setAcIndex(-1);
      setAcVisible(results.length > 0);
    },
    [plantes]
  );

  const selectAcItem = useCallback(
    (idx: number) => {
      const p = acResults[idx];
      if (p && !selection.has(p.id) && selection.size < MAX_SEL) {
        setSelection((prev) => new Set(prev).add(p.id));
      }
      setSearchQuery("");
      setAcVisible(false);
      setAcResults([]);
    },
    [acResults, selection]
  );

  const handleSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!acVisible || acResults.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setAcIndex((prev) => Math.min(prev + 1, acResults.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setAcIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && acIndex >= 0) {
        e.preventDefault();
        selectAcItem(acIndex);
      }
    },
    [acVisible, acResults, acIndex, selectAcItem]
  );

  // ─── Palette ───
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  // Close palette when selection is cleared
  useEffect(() => {
    if (selection.size === 0) setPaletteOpen(false);
  }, [selection.size]);

  // ─── Melange management ───
  const addMelange = useCallback(() => {
    setMelangeCounter((prev) => {
      const next = prev + 1;
      setMelanges((mels) => [
        ...mels,
        { id: "mel-" + next, name: "", essenceIds: [] },
      ]);
      return next;
    });
  }, []);

  const deleteMelange = useCallback(
    (melId: string) => {
      showConfirm(
        "Supprimer ce mélange ? Les essences retourneront dans Non classées.",
        () => {
          setMelanges((prev) => prev.filter((m) => m.id !== melId));
        }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const renameMelange = useCallback((melId: string, name: string) => {
    setMelanges((prev) =>
      prev.map((m) => (m.id === melId ? { ...m, name } : m))
    );
  }, []);

  const getUnclassifiedIds = useCallback(
    (sel: Set<string>, mels: Melange[]) => {
      const classified = new Set<string>();
      mels.forEach((m) => m.essenceIds.forEach((id) => classified.add(id)));
      return [...sel].filter((id) => !classified.has(id));
    },
    []
  );

  const unclassifiedIds = useMemo(
    () => getUnclassifiedIds(selection, melanges),
    [selection, melanges, getUnclassifiedIds]
  );

  const moveEssenceToMelange = useCallback(
    (essenceId: string, targetMelangeId: string) => {
      setMelanges((prev) => {
        const updated = prev.map((m) => ({
          ...m,
          essenceIds: m.essenceIds.filter((id) => id !== essenceId),
        }));
        if (targetMelangeId !== "__unclassified") {
          return updated.map((m) =>
            m.id === targetMelangeId && !m.essenceIds.includes(essenceId)
              ? { ...m, essenceIds: [...m.essenceIds, essenceId] }
              : m
          );
        }
        return updated;
      });
    },
    []
  );

  const removeFromSelection = useCallback(
    (id: string) => {
      setSelection((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setMelanges((prev) =>
        prev.map((m) => ({
          ...m,
          essenceIds: m.essenceIds.filter((eid) => eid !== id),
        }))
      );
    },
    []
  );

  const sortMelangesByStrate = useCallback(() => {
    setMelanges((prev) =>
      prev.map((m) => ({
        ...m,
        essenceIds: [...m.essenceIds].sort((a, b) => {
          const pa = plantes.find((p) => p.id === a);
          const pb = plantes.find((p) => p.id === b);
          const ia = STRATE_ORDER.indexOf(pa?.strate || "");
          const ib = STRATE_ORDER.indexOf(pb?.strate || "");
          const sa = ia === -1 ? 999 : ia;
          const sb = ib === -1 ? 999 : ib;
          if (sa !== sb) return sa - sb;
          return (pa?.nom_latin || "").localeCompare(pb?.nom_latin || "");
        }),
      }))
    );
  }, [plantes]);

  const clearAll = useCallback(() => {
    showConfirm(
      "Vider toute la sélection ? Cette action est irréversible.",
      () => {
        setSelection(new Set());
        setMelanges([]);
        setMelangeCounter(0);
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Confirm dialog ───
  function showConfirm(msg: string, cb: () => void) {
    setConfirmState({ msg, cb });
  }

  const handleConfirmOk = useCallback(() => {
    if (confirmState?.cb) confirmState.cb();
    setConfirmState(null);
  }, [confirmState]);

  const handleConfirmCancel = useCallback(() => {
    setConfirmState(null);
  }, []);

  // ─── Drag & Drop ───
  const handleDragStart = useCallback((essenceId: string) => {
    setDraggingId(essenceId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDropHoverId(null);
  }, []);

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>, melangeId: string) => {
      e.preventDefault();
      setDropHoverId(melangeId);
    },
    []
  );

  const handleDragLeave = useCallback(() => {
    setDropHoverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, melangeId: string) => {
      e.preventDefault();
      const essenceId = e.dataTransfer.getData("text/plain");
      if (essenceId) {
        moveEssenceToMelange(essenceId, melangeId);
        if (!firstDragDone) setFirstDragDone(true);
      }
      setDropHoverId(null);
    },
    [moveEssenceToMelange, firstDragDone]
  );

  // ─── Export PNG ───
  const doExport = useCallback(async () => {
    const container = exportContainerRef.current;
    if (!container) return;

    const groups: ExportGroup[] = [];
    melanges.forEach((m, i) => {
      if (m.essenceIds.length > 0) {
        groups.push({
          name: m.name || "Mélange " + (i + 1),
          ids: m.essenceIds,
        });
      }
    });
    const unclassified = getUnclassifiedIds(selection, melanges);
    if (unclassified.length > 0)
      groups.push({ name: "Non classées", ids: unclassified });
    if (groups.length === 0 && selection.size > 0)
      groups.push({ name: "", ids: [...selection] });

    // Build export HTML
    let html =
      '<div style="font-size:16px;color:#2A2826;font-weight:400;margin-bottom:20px;">S\ÉLECTION D\'ESSENCES' +
      (projectName ? " \— " + projectName : "") +
      "</div>";

    groups.forEach((g) => {
      if (g.name)
        html +=
          '<div style="font-size:13px;color:#5E8B8F;font-weight:400;padding-bottom:6px;border-bottom:1px solid #E2DED9;margin-bottom:0;margin-top:16px;">' +
          g.name +
          "</div>";
      html +=
        '<table style="width:100%;border-collapse:collapse;margin-bottom:12px;"><thead><tr>' +
        '<th style="font-size:11px;font-weight:500;color:#7A7672;background:#F7F6F4;padding:6px 10px;text-align:left;border-bottom:1px solid #E2DED9;">Nom latin</th>' +
        '<th style="font-size:11px;font-weight:500;color:#7A7672;background:#F7F6F4;padding:6px 10px;text-align:left;border-bottom:1px solid #E2DED9;">Nom commun</th>' +
        '<th style="font-size:11px;font-weight:500;color:#7A7672;background:#F7F6F4;padding:6px 10px;text-align:left;border-bottom:1px solid #E2DED9;">Famille</th>' +
        '<th style="font-size:11px;font-weight:500;color:#7A7672;background:#F7F6F4;padding:6px 10px;text-align:left;border-bottom:1px solid #E2DED9;">Strate</th>' +
        '<th style="font-size:11px;font-weight:500;color:#7A7672;background:#F7F6F4;padding:6px 10px;text-align:left;border-bottom:1px solid #E2DED9;">Persistance</th>' +
        '<th style="font-size:11px;font-weight:500;color:#7A7672;background:#F7F6F4;padding:6px 10px;text-align:left;border-bottom:1px solid #E2DED9;">Hauteur</th>' +
        '<th style="font-size:11px;font-weight:500;color:#7A7672;background:#F7F6F4;padding:6px 10px;text-align:left;border-bottom:1px solid #E2DED9;">Floraison</th>' +
        '<th style="font-size:11px;font-weight:500;color:#7A7672;background:#F7F6F4;padding:6px 10px;text-align:left;border-bottom:1px solid #E2DED9;">Rusticité</th>' +
        '<th style="font-size:11px;font-weight:500;color:#7A7672;background:#F7F6F4;padding:6px 10px;text-align:left;border-bottom:1px solid #E2DED9;">Indigénat</th>' +
        "</tr></thead><tbody>";

      g.ids.forEach((id) => {
        const p = plantes.find((pl) => pl.id === id);
        if (!p) return;
        let floraCell = "\—";
        if (p.floraison_debut && p.floraison_fin) {
          const color = parseCouleurFloraison(p.couleur_floraison);
          floraCell =
            '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;vertical-align:middle;margin-right:3px;background:' +
            (color || "#5E8B8F") +
            '"></span>' +
            (MOIS[p.floraison_debut] || "?") +
            " \— " +
            (MOIS[p.floraison_fin] || "?");
          if (p.couleur_floraison)
            floraCell += " (" + p.couleur_floraison + ")";
        }
        const bios: string[] = [];
        if (p.indigenat) {
          if (p.indigenat.atlantique) bios.push("Atl.");
          if (p.indigenat.continental) bios.push("Cont.");
          if (p.indigenat.mediterraneen) bios.push("Méd.");
          if (p.indigenat.alpin) bios.push("Alp.");
        }
        const bgStyle = (i: number) =>
          i % 2 === 1 ? 'background:#FAFAF9;' : '';
        const rowIdx = g.ids.indexOf(id);
        html +=
          "<tr>" +
          '<td style="font-size:11px;color:#2A2826;padding:5px 10px;border-bottom:1px solid #F0EFED;font-style:italic;' + bgStyle(rowIdx) + '">' +
          (p.nom_latin || "") +
          "</td>" +
          '<td style="font-size:11px;color:#2A2826;padding:5px 10px;border-bottom:1px solid #F0EFED;' + bgStyle(rowIdx) + '">' +
          (p.nom_commun || "") +
          "</td>" +
          '<td style="font-size:11px;color:#2A2826;padding:5px 10px;border-bottom:1px solid #F0EFED;' + bgStyle(rowIdx) + '">' +
          (p.famille || "") +
          "</td>" +
          '<td style="font-size:11px;color:#2A2826;padding:5px 10px;border-bottom:1px solid #F0EFED;' + bgStyle(rowIdx) + '">' +
          (p.strate || "") +
          "</td>" +
          '<td style="font-size:11px;color:#2A2826;padding:5px 10px;border-bottom:1px solid #F0EFED;' + bgStyle(rowIdx) + '">' +
          (p.persistance || "") +
          "</td>" +
          '<td style="font-size:11px;color:#2A2826;padding:5px 10px;border-bottom:1px solid #F0EFED;' + bgStyle(rowIdx) + '">' +
          fmtHeight(p.hauteur_min_cm) +
          " \— " +
          fmtHeight(p.hauteur_max_cm) +
          "</td>" +
          '<td style="font-size:11px;color:#2A2826;padding:5px 10px;border-bottom:1px solid #F0EFED;' + bgStyle(rowIdx) + '">' +
          floraCell +
          "</td>" +
          '<td style="font-size:11px;color:#2A2826;padding:5px 10px;border-bottom:1px solid #F0EFED;' + bgStyle(rowIdx) + '">' +
          (p.rusticite_celsius != null ? p.rusticite_celsius + " °C" : "") +
          "</td>" +
          '<td style="font-size:11px;color:#2A2826;padding:5px 10px;border-bottom:1px solid #F0EFED;' + bgStyle(rowIdx) + '">' +
          bios.join(", ") +
          "</td>" +
          "</tr>";
      });
      html += "</tbody></table>";
    });

    html +=
      '<div style="text-align:right;font-size:10px;color:#E2DED9;margin-top:20px;padding-top:8px;border-top:1px solid #F0EFED;">sylve.eco \— Sélecteur d\'essences</div>';

    container.innerHTML = html;
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.width = "1100px";
    container.style.zIndex = "9999";
    container.style.opacity = "1";
    container.style.pointerEvents = "none";
    container.style.transform = "translateY(-200vh)";

    await new Promise((resolve) => setTimeout(resolve, 100));

    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(container, {
      scale: 3,
      backgroundColor: "#FFFFFF",
      useCORS: true,
      logging: false,
    });
    const link = document.createElement("a");
    const nomProjet = projectName || "sylve";
    link.download =
      "selection-essences-" +
      nomProjet.replace(/\s+/g, "-").toLowerCase() +
      ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.transform = "";
    container.style.opacity = "";
    container.style.pointerEvents = "";
    container.style.zIndex = "";
    container.style.width = "";
  }, [melanges, selection, projectName, plantes, getUnclassifiedIds]);

  // ─── Height fill style ───
  const heightFillStyle = useMemo(() => {
    const lo = Math.min(filters.heightMin, filters.heightMax);
    const hi = Math.max(filters.heightMin, filters.heightMax);
    const pct1 = (lo / 5000) * 100;
    const pct2 = (hi / 5000) * 100;
    return { left: pct1 + "%", width: pct2 - pct1 + "%" };
  }, [filters.heightMin, filters.heightMax]);

  const heightLabel = useMemo(() => {
    const lo = Math.min(filters.heightMin, filters.heightMax);
    const hi = Math.max(filters.heightMin, filters.heightMax);
    return fmtHeight(lo) + " \— " + fmtHeight(hi);
  }, [filters.heightMin, filters.heightMax]);

  const rustLabel = useMemo(() => {
    return filters.rusticite === 0
      ? "0 °C (pas de filtre)"
      : filters.rusticite + " °C";
  }, [filters.rusticite]);

  // ─── Count text ───
  const countText = filtered.length + " essences correspondent à vos critères";
  const paletteCountText = selection.size + " / " + MAX_SEL;

  // ─── Render ───
  return (
    <div className={styles.mainContainer}>
      <div className={styles.splitPanel}>
        {/* ═══ LEFT: FILTERS ═══ */}
        <div className={styles.filtersPanel}>
          <div className={styles.dbStatusLoaded}>
            {"\✓"} Base végétale : {plantes.length} essences
          </div>

          {/* Search */}
          <div className={styles.searchBar}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Rechercher une essence (nom latin ou commun)..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => setTimeout(() => setAcVisible(false), 200)}
            />
            {acVisible && acResults.length > 0 && (
              <div className={styles.autocompleteList}>
                {acResults.map((p, i) => (
                  <div
                    key={p.id}
                    className={`${styles.acItem}${i === acIndex ? " " + styles.acItemActive : ""}`}
                    onMouseDown={() => selectAcItem(i)}
                  >
                    <span className={styles.acLatin}>{p.nom_latin}</span>
                    <span className={styles.acCommon}>
                      {" "}
                      — {p.nom_commun}
                    </span>
                    <span className={styles.acStrate}>({p.strate})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strate */}
          <PillGroup
            label={STRATE_OPTIONS.label}
            values={STRATE_OPTIONS.values}
            active={filters.strate}
            onToggle={(v) => togglePill("strate", v)}
          />

          {/* Exposition */}
          <PillGroup
            label={EXPOSITION_OPTIONS.label}
            values={EXPOSITION_OPTIONS.values}
            active={filters.exposition}
            onToggle={(v) => togglePill("exposition", v)}
          />

          {/* Besoins hydriques */}
          <PillGroup
            label={BESOINS_HYDRIQUES_OPTIONS.label}
            values={BESOINS_HYDRIQUES_OPTIONS.values}
            active={filters.besoinsHydriques}
            onToggle={(v) => togglePill("besoinsHydriques", v)}
          />

          {/* Type de sol */}
          <PillGroup
            label={TYPE_SOL_OPTIONS.label}
            values={TYPE_SOL_OPTIONS.values}
            active={filters.typeSol}
            onToggle={(v) => togglePill("typeSol", v)}
          />

          {/* pH */}
          <PillGroup
            label={PH_SOL_OPTIONS.label}
            values={PH_SOL_OPTIONS.values}
            active={filters.phSol}
            onToggle={(v) => togglePill("phSol", v)}
          />

          {/* Humidité */}
          <PillGroup
            label={HUMIDITE_SOL_OPTIONS.label}
            values={HUMIDITE_SOL_OPTIONS.values}
            active={filters.humiditeSol}
            onToggle={(v) => togglePill("humiditeSol", v)}
          />

          {/* Rusticité slider */}
          <div className={styles.filterGroup}>
            <label>Rusticité</label>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderValue}>{rustLabel}</span>
              <input
                type="range"
                className={styles.rangeInput}
                min={-40}
                max={0}
                value={filters.rusticite}
                step={1}
                onChange={(e) =>
                  updateFilter("rusticite", parseInt(e.target.value))
                }
              />
            </div>
          </div>

          {/* Height double slider */}
          <div className={styles.filterGroup}>
            <label>Hauteur</label>
            <div className={styles.sliderGroup}>
              <span className={styles.sliderValue}>{heightLabel}</span>
              <div className={styles.doubleRange}>
                <div className={styles.rangeTrack} />
                <div className={styles.rangeFill} style={heightFillStyle} />
                <input
                  type="range"
                  className={styles.rangeInput}
                  min={0}
                  max={5000}
                  value={filters.heightMin}
                  step={10}
                  onChange={(e) =>
                    updateFilter("heightMin", parseInt(e.target.value))
                  }
                />
                <input
                  type="range"
                  className={styles.rangeInput}
                  min={0}
                  max={5000}
                  value={filters.heightMax}
                  step={10}
                  onChange={(e) =>
                    updateFilter("heightMax", parseInt(e.target.value))
                  }
                />
              </div>
            </div>
          </div>

          {/* Persistance */}
          <PillGroup
            label={PERSISTANCE_OPTIONS.label}
            values={PERSISTANCE_OPTIONS.values}
            active={filters.persistance}
            onToggle={(v) => togglePill("persistance", v)}
          />

          {/* Mellifère */}
          <div className={styles.filterGroup}>
            <label>{MELLIFERE_OPTIONS.label}</label>
            <div className={styles.pills}>
              <span
                className={
                  filters.mellifere ? styles.pillActive : styles.pill
                }
                onClick={() => updateFilter("mellifere", !filters.mellifere)}
              >
                Mellifère uniquement
              </span>
            </div>
          </div>

          {/* Indigénat */}
          <div className={styles.filterGroup}>
            <label>Indigénat</label>
            <div className={styles.filterRow}>
              <span
                className={
                  filters.indigenat ? styles.pillActive : styles.pill
                }
                onClick={() =>
                  updateFilter("indigenat", !filters.indigenat)
                }
              >
                Indigène en
              </span>
              <select
                className={styles.filterSelect}
                disabled={!filters.indigenat}
                value={filters.bioregion}
                onChange={(e) =>
                  updateFilter(
                    "bioregion",
                    e.target.value as BioregionKey
                  )
                }
              >
                <option value="atlantique">Atlantique</option>
                <option value="continental">Continental</option>
                <option value="mediterraneen">Méditerranéen</option>
                <option value="alpin">Alpin</option>
              </select>
            </div>
          </div>

          {/* Période de floraison */}
          <div className={styles.filterGroup}>
            <label>Période de floraison</label>
            <div className={styles.filterRow}>
              <select
                className={styles.filterSelect}
                value={filters.floraDebut}
                onChange={(e) => updateFilter("floraDebut", e.target.value)}
              >
                <option value="">Début</option>
                {MOIS_SELECT.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                className={styles.filterSelect}
                value={filters.floraFin}
                onChange={(e) => updateFilter("floraFin", e.target.value)}
              >
                <option value="">Fin</option>
                {MOIS_SELECT.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Couleur de floraison */}
          <PillGroup
            label={COULEUR_FLORAISON_OPTIONS.label}
            values={COULEUR_FLORAISON_OPTIONS.values}
            active={filters.couleurFloraison}
            onToggle={(v) => togglePill("couleurFloraison", v)}
          />

          {/* Famille */}
          <div className={styles.filterGroup}>
            <label>Famille</label>
            <div className={styles.familyInputWrap}>
              <input
                type="text"
                className={styles.familyInput}
                placeholder="ex : Poaceae, Rosaceae..."
                autoComplete="off"
                value={familyQuery}
                onChange={(e) => {
                  setFamilyQuery(e.target.value);
                  updateFilter("famille", e.target.value.trim());
                  setFamilyDDVisible(true);
                }}
                onBlur={() =>
                  setTimeout(() => setFamilyDDVisible(false), 200)
                }
              />
              {familyDDVisible && familyMatches.length > 0 && (
                <div className={styles.familyDropdown}>
                  {familyMatches.map((f) => (
                    <div
                      key={f}
                      className={styles.famItem}
                      onMouseDown={() => {
                        setFamilyQuery(f);
                        updateFilter("famille", f);
                        setFamilyDDVisible(false);
                      }}
                    >
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles.filtersFooter}>
            <div className={styles.resultsCount}>{countText}</div>
            <button className={styles.btnReset} onClick={resetFilters}>
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        {/* ═══ RIGHT: RESULTS ═══ */}
        <div className={styles.resultsPanel} ref={resultsPanelRef}>
          <div className={styles.resultsHeader}>
            <span className={styles.count}>
              {filtered.length} essences
            </span>
            <select
              className={styles.sortSelect}
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
            >
              <option value="strate">Trier par : Strate</option>
              <option value="alpha">Trier par : Alphabétique</option>
              <option value="rusticite">Trier par : Rusticité</option>
              <option value="floraison">Trier par : Floraison</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                stroke="#E2DED9"
                strokeWidth="1.5"
              >
                <circle cx="20" cy="20" r="14" />
                <line x1="30" y1="30" x2="42" y2="42" />
              </svg>
              <div className={styles.emptyTitle}>
                Aucune essence ne correspond à ces critères
              </div>
              <div className={styles.emptySub}>
                Essayez d&apos;élargir vos filtres
              </div>
            </div>
          ) : (
            <>
              <div className={styles.resultsGrid}>
                {displayed.map((p) => (
                  <EssenceCard
                    key={p.id}
                    plante={p}
                    isSelected={selection.has(p.id)}
                    isDisabled={
                      !selection.has(p.id) && selection.size >= MAX_SEL
                    }
                    onToggle={() => toggleSelection(p.id)}
                    indigenatFilter={filters.indigenat}
                    bioregion={filters.bioregion}
                  />
                ))}
              </div>
              {displayCount < filtered.length && (
                <div className={styles.loadMore}>Chargement...</div>
              )}
            </>
          )}
          <div className={styles.loadMoreSentinel} ref={sentinelRef} />
        </div>
      </div>

      {/* ═══ PALETTE BAR (reduced) ═══ */}
      {selection.size > 0 && (
        <div className={styles.paletteBar}>
          <div className={styles.paletteBarSummary}>
            <span className={styles.paletteDot}>{"\●"}</span>
            <span>
              Ma palette ·{" "}
              <strong>{paletteCountText}</strong> essences
            </span>
            <span className={styles.paletteSpacer} />
            <button className={styles.btnSm} onClick={openPalette}>
              Organiser ▲
            </button>
            <button className={styles.btnPrimary} onClick={doExport}>
              Export PNG
            </button>
            <button className={styles.btnDanger} onClick={clearAll}>
              Vider
            </button>
          </div>
        </div>
      )}

      {/* ═══ PALETTE PANEL (expanded, overlay) ═══ */}
      {paletteOpen && (
        <>
          <div
            className={styles.paletteBackdrop}
            onClick={closePalette}
          />
          <div className={styles.palettePanel}>
            <div className={styles.palettePanelHeader}>
              <span>
                Ma palette ·{" "}
                <strong>{paletteCountText}</strong> essences
              </span>
              <span className={styles.paletteSpacer} />
              <button className={styles.btnSm} onClick={addMelange}>
                + Mélange
              </button>
              <button
                className={styles.btnSm}
                onClick={sortMelangesByStrate}
              >
                Trier strate
              </button>
              <button className={styles.btnSm} onClick={closePalette}>
                Fermer ▼
              </button>
            </div>
            <input
              type="text"
              className={styles.projectNameInput}
              placeholder="ex : Résidence Alma — Phase 2"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            {!firstDragDone && (
              <div className={styles.dragHint}>
                Glissez les essences dans vos mélanges pour organiser
                votre palette.
              </div>
            )}

            {/* Melanges */}
            {melanges.map((mel, i) => (
              <MelangeBlock
                key={mel.id}
                mel={mel}
                index={i}
                plantes={plantes}
                melanges={melanges}
                onRename={renameMelange}
                onDelete={deleteMelange}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMoveToMelange={moveEssenceToMelange}
                onRemoveFromSelection={removeFromSelection}
                draggingId={draggingId}
                dropHoverId={dropHoverId}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
              />
            ))}

            {/* Unclassified */}
            <div className={styles.melangeBlock}>
              <div
                className={styles.melangeHeader}
                style={{ opacity: 0.7 }}
              >
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Non classées
                </span>
                <span className={styles.melangeCount}>
                  {unclassifiedIds.length} essences
                </span>
              </div>
              <div
                className={`${styles.melangeDropzone}${draggingId ? " " + styles.melangeDropzoneActive : ""}${dropHoverId === "__unclassified" ? " " + styles.melangeDropzoneHover : ""}`}
                onDragOver={(e) => handleDragOver(e, "__unclassified")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "__unclassified")}
              >
                {unclassifiedIds.length === 0 ? (
                  <div className={styles.melangeDropzoneEmpty}>
                    Aucune essence non classée
                  </div>
                ) : (
                  unclassifiedIds.map((id) => (
                    <EssenceRow
                      key={id}
                      essenceId={id}
                      currentMelangeId="__unclassified"
                      plantes={plantes}
                      melanges={melanges}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onMoveToMelange={moveEssenceToMelange}
                      onRemoveFromSelection={removeFromSelection}
                      draggingId={draggingId}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                    />
                  ))
                )}
              </div>
              {unclassifiedIds.length > 0 && (
                <div className={styles.melangeIndicators}>
                  {buildIndicatorsText(unclassifiedIds, plantes)}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Confirm overlay */}
      {confirmState && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <p>{confirmState.msg}</p>
            <div className={styles.confirmBtns}>
              <button className={styles.btnSm} onClick={handleConfirmCancel}>
                Annuler
              </button>
              <button className={styles.btnDanger} onClick={handleConfirmOk}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden export container */}
      <div
        ref={exportContainerRef}
        className={styles.exportContainer}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// PillGroup — reusable filter pills
// ═══════════════════════════════════════════

function PillGroup({
  label,
  values,
  active,
  onToggle,
}: {
  label: string;
  values: { value: string; label: string }[];
  active: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className={styles.filterGroup}>
      <label>{label}</label>
      <div className={styles.pills}>
        {values.map((v) => (
          <span
            key={v.value}
            className={
              active.includes(v.value) ? styles.pillActive : styles.pill
            }
            onClick={() => onToggle(v.value)}
          >
            {v.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// EssenceCard — result card in grid
// ═══════════════════════════════════════════

function EssenceCard({
  plante: p,
  isSelected,
  isDisabled,
  onToggle,
  indigenatFilter,
  bioregion,
}: {
  plante: Plante;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
  indigenatFilter: boolean;
  bioregion: string;
}) {
  const expo = (p.exposition || []).map((e) => expoEmoji(e)).join(" ");

  let floraHTML: React.ReactNode;
  if (p.floraison_debut && p.floraison_fin) {
    const color = parseCouleurFloraison(p.couleur_floraison);
    floraHTML = (
      <>
        {MOIS[p.floraison_debut] || "?"} — {MOIS[p.floraison_fin] || "?"}
        <span
          className={styles.cardFloraisonDot}
          style={{ background: color || "#5E8B8F" }}
        />
      </>
    );
  } else {
    floraHTML = (
      <span style={{ color: "var(--text-light)" }}>
        Pas de floraison significative
      </span>
    );
  }

  let indText = "";
  if (indigenatFilter) {
    if (p.indigenat && p.indigenat[bioregion as keyof typeof p.indigenat])
      indText = "Indigène";
  } else if (p.indigenat) {
    const bios: string[] = [];
    if (p.indigenat.atlantique) bios.push("Atlantique");
    if (p.indigenat.continental) bios.push("Continental");
    if (p.indigenat.mediterraneen) bios.push("Méditerranéen");
    if (p.indigenat.alpin) bios.push("Alpin");
    if (bios.length) indText = "Indigène (" + bios.join(", ") + ")";
  }

  const cbClass = isSelected
    ? styles.cardCbChecked
    : isDisabled
      ? styles.cardCbDisabled
      : styles.cardCb;

  return (
    <div
      className={
        isSelected ? styles.essenceCardSelected : styles.essenceCard
      }
    >
      <div className={styles.cardTop}>
        <div
          className={cbClass}
          onClick={(e) => {
            e.stopPropagation();
            if (!isDisabled) onToggle();
          }}
          title={isDisabled ? "Limite de 50 essences atteinte" : undefined}
        />
        <span className={styles.cardNomLatin}>{p.nom_latin}</span>
      </div>
      <div className={styles.cardNomCommun}>{p.nom_commun}</div>
      <hr className={styles.cardSep} />
      <div className={styles.cardMeta}>
        <div className={styles.metaRow}>
          {p.strate} &middot; {p.famille}
        </div>
        <div className={styles.metaRow}>
          {expo}&nbsp;&nbsp;{p.besoins_hydriques}&nbsp;&nbsp;{p.persistance}
        </div>
        <div className={styles.metaRow}>
          <span className={styles.cardHeight}>
            {fmtHeight(p.hauteur_min_cm)} — {fmtHeight(p.hauteur_max_cm)}
          </span>
          &nbsp;&nbsp;
          <span className={styles.cardRusticite}>
            Rusticité :{" "}
            {p.rusticite_celsius != null
              ? p.rusticite_celsius + " °C"
              : "?"}
          </span>
        </div>
        <div className={styles.metaRow}>Floraison : {floraHTML}</div>
        {indText && <div className={styles.metaRow}>{indText}</div>}
        {p.mellifere && <div className={styles.metaRow}>Mellifère</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MelangeBlock — palette group
// ═══════════════════════════════════════════

function MelangeBlock({
  mel,
  index,
  plantes,
  melanges,
  onRename,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onMoveToMelange,
  onRemoveFromSelection,
  draggingId,
  dropHoverId,
  openMenuId,
  setOpenMenuId,
}: {
  mel: Melange;
  index: number;
  plantes: Plante[];
  melanges: Melange[];
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>, melangeId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>, melangeId: string) => void;
  onMoveToMelange: (essenceId: string, targetId: string) => void;
  onRemoveFromSelection: (id: string) => void;
  draggingId: string | null;
  dropHoverId: string | null;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
}) {
  return (
    <div className={styles.melangeBlock}>
      <div className={styles.melangeHeader}>
        <input
          type="text"
          className={styles.melangeNameInput}
          value={mel.name}
          placeholder={"Mélange " + (index + 1)}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onRename(mel.id, e.target.value)
          }
        />
        <span className={styles.melangeCount}>
          {mel.essenceIds.length} essences
        </span>
        <button
          className={styles.melangeDelete}
          onClick={() => onDelete(mel.id)}
        >
          &times;
        </button>
      </div>
      <div
        className={`${styles.melangeDropzone}${draggingId ? " " + styles.melangeDropzoneActive : ""}${dropHoverId === mel.id ? " " + styles.melangeDropzoneHover : ""}`}
        onDragOver={(e) => onDragOver(e, mel.id)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, mel.id)}
      >
        {mel.essenceIds.length === 0 ? (
          <div className={styles.melangeDropzoneEmpty}>
            Glissez des essences ici
          </div>
        ) : (
          mel.essenceIds.map((id) => (
            <EssenceRow
              key={id}
              essenceId={id}
              currentMelangeId={mel.id}
              plantes={plantes}
              melanges={melanges}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onMoveToMelange={onMoveToMelange}
              onRemoveFromSelection={onRemoveFromSelection}
              draggingId={draggingId}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
            />
          ))
        )}
      </div>
      {mel.essenceIds.length > 0 && (
        <div className={styles.melangeIndicators}>
          {buildIndicatorsText(mel.essenceIds, plantes)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// EssenceRow — condensed row in palette
// ═══════════════════════════════════════════

function EssenceRow({
  essenceId,
  currentMelangeId,
  plantes,
  melanges,
  onDragStart,
  onDragEnd,
  onMoveToMelange,
  onRemoveFromSelection,
  draggingId,
  openMenuId,
  setOpenMenuId,
}: {
  essenceId: string;
  currentMelangeId: string;
  plantes: Plante[];
  melanges: Melange[];
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onMoveToMelange: (essenceId: string, targetId: string) => void;
  onRemoveFromSelection: (id: string) => void;
  draggingId: string | null;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
}) {
  const p = plantes.find((pl) => pl.id === essenceId);
  if (!p) return null;

  let floraStr: React.ReactNode = "\—";
  if (p.floraison_debut && p.floraison_fin) {
    const color = parseCouleurFloraison(p.couleur_floraison);
    floraStr = (
      <>
        <span
          className={styles.rowDot}
          style={{ background: color || "#5E8B8F" }}
        />
        {(MOIS[p.floraison_debut] || "?").substring(0, 4)}–
        {(MOIS[p.floraison_fin] || "?").substring(0, 4)}
      </>
    );
  }

  const isDragging = draggingId === essenceId;
  const menuKey = essenceId + "-" + currentMelangeId;
  const isMenuOpen = openMenuId === menuKey;

  return (
    <div
      className={isDragging ? styles.essenceRowDragging : styles.essenceRow}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", essenceId);
        onDragStart(essenceId);
      }}
      onDragEnd={onDragEnd}
    >
      <span className={styles.rowLatin}>{p.nom_latin}</span>
      <span className={styles.rowBadge}>{p.strate}</span>
      <span className={styles.rowInfo}>{p.persistance}</span>
      <span className={styles.rowMono}>
        {fmtHeight(p.hauteur_min_cm)}–{fmtHeight(p.hauteur_max_cm)}
      </span>
      <span className={styles.rowInfo}>{floraStr}</span>
      <span className={styles.rowMono}>
        {p.rusticite_celsius != null ? p.rusticite_celsius + " °C" : ""}
      </span>
      <span className={styles.rowSpacer} />
      <button
        className={styles.rowMenuBtn}
        title="Menu"
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(isMenuOpen ? null : menuKey);
        }}
      >
        &#8942;
        {isMenuOpen && (
          <div className={styles.rowMenu}>
            {melanges
              .filter((m) => m.id !== currentMelangeId)
              .map((m, i) => (
                <div
                  key={m.id}
                  className={styles.rowMenuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToMelange(essenceId, m.id);
                    setOpenMenuId(null);
                  }}
                >
                  Déplacer vers{" "}
                  {m.name || "Mélange " + (melanges.indexOf(m) + 1)}
                </div>
              ))}
            {currentMelangeId !== "__unclassified" && (
              <div
                className={styles.rowMenuItem}
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToMelange(essenceId, "__unclassified");
                  setOpenMenuId(null);
                }}
              >
                Déplacer vers Non classées
              </div>
            )}
            <div
              className={styles.rowMenuItemDanger}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromSelection(essenceId);
                setOpenMenuId(null);
              }}
            >
              Retirer de la sélection
            </div>
          </div>
        )}
      </button>
    </div>
  );
}

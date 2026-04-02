"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CATEGORIES, CATEGORY_KEYS, getMat } from "@/lib/tools/charges/materials";
import { getLayerWeight, getTotalWeight, getTotalThickness, getLayerDisplayH } from "@/lib/tools/charges/calculations";
import type { Layer, CategoryKey } from "@/lib/tools/charges/types";
import styles from "./page.module.css";

// ═══════════════════════════════════════════════
//  SVG CONSTANTS
// ═══════════════════════════════════════════════
const SVG_W = 600;
const SVG_H = 760;
const SCHEMA_X = 80;
const SCHEMA_W = 300;
const DALLE_H = 30;
const MAX_COMPLEX_H = 340;
const VEG_ZONE_H = 220;
const LABEL_X = SCHEMA_X + SCHEMA_W + 14;

let nextId = 1;

function createLayer(catKey: CategoryKey, matId: string, thickness: number | null = null): Layer {
  const cat = CATEGORIES[catKey];
  const mat = cat.materials.find((m) => m.id === matId) || cat.materials[0];
  const ep = thickness !== null ? thickness : (mat.type === "volumique" ? (mat.default_ep ?? null) : null);
  return { id: nextId++, catKey, matId: mat.id, thickness: ep, customDensity: null, open: false };
}

function getDefaultLayers(): Layer[] {
  return [
    createLayer("protection", "feutre-ap"),
    createLayer("drainage", "nid-abeille", 6),
    createLayer("filtration", "geotextile"),
    createLayer("substrat", "substrat-ext", 8),
    createLayer("paillage", "paillage-org", 7),
    createLayer("vegetation", "sedum"),
  ];
}

export default function CalculateurChargesPage() {
  const [layers, setLayers] = useState<Layer[]>(() => getDefaultLayers());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCatKey, setModalCatKey] = useState<CategoryKey | null>(null);
  const [modalMatId, setModalMatId] = useState<string>("");
  const [dragCardId, setDragCardId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragStateRef = useRef<{
    layerId: number;
    startSvgY: number;
    startThickness: number;
    scaleY: number;
    svgRect: DOMRect;
    complexH: number;
    totalT: number;
  } | null>(null);

  const totalWeight = getTotalWeight(layers);

  // ═══════════════════════════════════════════════
  //  SVG RENDERING (imperative)
  // ═══════════════════════════════════════════════
  const renderSchema = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let html = "";

    // Defs: patterns
    html += `<defs>
      <pattern id="pattern-dalle" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="#000" stroke-width="0.8" stroke-opacity="0.5"/>
      </pattern>
      <pattern id="pattern-protection" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.6" fill="#000" fill-opacity="0.5"/>
      </pattern>
      <pattern id="pattern-drainage-hdpe" width="12" height="10" patternUnits="userSpaceOnUse">
        <path d="M6,0 L12,3 L12,7 L6,10 L0,7 L0,3 Z" fill="none" stroke="#000" stroke-width="0.7" stroke-opacity="0.5"/>
      </pattern>
      <pattern id="pattern-drainage-gravier" width="3" height="3" patternUnits="userSpaceOnUse">
        <circle cx="1.5" cy="1.5" r="0.8" fill="#000" fill-opacity="0.5"/>
      </pattern>
      <pattern id="pattern-drainage-autre" width="8" height="4" patternUnits="userSpaceOnUse">
        <line x1="0" y1="2" x2="8" y2="2" stroke="#000" stroke-width="0.6" stroke-opacity="0.5"/>
      </pattern>
      <pattern id="pattern-filtration" width="8" height="2" patternUnits="userSpaceOnUse">
        <line x1="0" y1="1" x2="8" y2="1" stroke="#000" stroke-width="0.4" stroke-opacity="0.5"/>
      </pattern>
      <pattern id="pattern-retention" width="5" height="5" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="5" stroke="#000" stroke-width="0.5" stroke-opacity="0.5"/>
        <line x1="0" y1="0" x2="5" y2="0" stroke="#000" stroke-width="0.5" stroke-opacity="0.5"/>
      </pattern>
      <pattern id="pattern-substrat" width="5" height="5" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.5" fill="#000" fill-opacity="0.5"/>
        <circle cx="3.5" cy="3.5" r="1" fill="#000" fill-opacity="0.4"/>
        <circle cx="4" cy="1.5" r="0.5" fill="#000" fill-opacity="0.3"/>
      </pattern>
      <pattern id="pattern-paillage-organique" width="20" height="5" patternUnits="userSpaceOnUse">
        <path d="M0,2.5 Q5,0.5 10,2.5 Q15,4.5 20,2.5" fill="none" stroke="#000" stroke-width="0.8" stroke-opacity="0.5"/>
      </pattern>
      <pattern id="pattern-paillage-mineral" width="4" height="4" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="4" stroke="#000" stroke-width="0.6" stroke-opacity="0.5"/>
        <line x1="0" y1="0" x2="4" y2="0" stroke="#000" stroke-width="0.6" stroke-opacity="0.5"/>
      </pattern>
      <pattern id="pattern-paillage-bois" width="12" height="6" patternUnits="userSpaceOnUse">
        <line x1="0" y1="3" x2="12" y2="3" stroke="#000" stroke-width="0.7" stroke-opacity="0.5"/>
        <line x1="3" y1="1" x2="3" y2="5" stroke="#000" stroke-width="0.7" stroke-opacity="0.5"/>
        <line x1="9" y1="1" x2="9" y2="5" stroke="#000" stroke-width="0.7" stroke-opacity="0.5"/>
      </pattern>
    </defs>`;

    if (layers.length === 0) {
      html += `<text x="${SVG_W / 2}" y="${SVG_H / 2}" text-anchor="middle" fill="#A09C98" font-family="DM Sans, sans-serif" font-size="13">Ajoutez des couches pour afficher le schema</text>`;
      svg.innerHTML = html;
      return;
    }

    const complexH = MAX_COMPLEX_H;
    let currentY = VEG_ZONE_H + 30;
    const displayLayers = [...layers].reverse();
    const totalT = getTotalThickness(layers);

    const nonVegLayers = displayLayers.filter((l) => l.catKey !== "vegetation");
    const vegLayer = displayLayers.find((l) => l.catKey === "vegetation");
    const complexTopY = currentY;

    // Draw non-vegetation layers
    nonVegLayers.forEach((layer) => {
      const mat = getMat(layer);
      const weight = getLayerWeight(layer);
      const h = totalT > 0 ? getLayerDisplayH(layer, complexH, totalT) : complexH / layers.length;
      const patId = getPatternId(layer.catKey, layer.matId);

      // White background
      html += `<rect x="${SCHEMA_X}" y="${currentY}" width="${SCHEMA_W}" height="${Math.max(h, 6)}" fill="#FFFFFF" rx="2"/>`;
      // Pattern overlay
      html += `<rect x="${SCHEMA_X}" y="${currentY}" width="${SCHEMA_W}" height="${Math.max(h, 6)}" fill="url(#${patId})" rx="2" stroke="#2D2D2D" stroke-width="0.5"/>`;

      // Right-side labels
      const labelY = currentY + h / 2;
      html += `<line x1="${SCHEMA_X + SCHEMA_W}" y1="${labelY}" x2="${LABEL_X - 2}" y2="${labelY}" stroke="#D0CBC5" stroke-width="0.7"/>`;

      if (mat.type === "volumique") {
        html += `<text x="${LABEL_X}" y="${labelY - 6}" fill="#2D2D2D" font-family="Helvetica, Arial, sans-serif" font-size="11">${mat.name}</text>`;
        html += `<text x="${LABEL_X}" y="${labelY + 7}" fill="#2D2D2D" font-family="Helvetica, Arial, sans-serif" font-size="11">${weight.toFixed(1)} kg/m\²</text>`;
        html += `<text x="${LABEL_X}" y="${labelY + 19}" fill="#2D2D2D" opacity="0.6" font-family="Helvetica, Arial, sans-serif" font-size="11">${layer.thickness || 0} cm</text>`;

        // Drag handle line
        html += `<line x1="${SCHEMA_X + 20}" y1="${currentY}" x2="${SCHEMA_X + SCHEMA_W - 20}" y2="${currentY}" stroke="rgba(0,0,0,0.15)" stroke-width="2" stroke-dasharray="4,3"/>`;
        // Invisible drag handle rect
        html += `<rect x="${SCHEMA_X}" y="${currentY - 5}" width="${SCHEMA_W}" height="10" fill="transparent" class="drag-handle" data-layer-id="${layer.id}" data-layer-y="${currentY}" data-complex-h="${complexH}"/>`;
      } else {
        html += `<text x="${LABEL_X}" y="${labelY - 1}" fill="#2D2D2D" font-family="Helvetica, Arial, sans-serif" font-size="11">${mat.name}</text>`;
        html += `<text x="${LABEL_X}" y="${labelY + 12}" fill="#2D2D2D" font-family="Helvetica, Arial, sans-serif" font-size="11">${weight.toFixed(1)} kg/m\²</text>`;
      }

      currentY += Math.max(h, 6);
    });

    const complexBottomY = currentY;

    // ── COTATION ──
    const complexLayers = layers.filter((l) => l.catKey !== "vegetation");
    const totalEp = complexLayers.reduce((sum, l) => {
      const mat = getMat(l);
      return sum + (mat.type === "volumique" ? (l.thickness || 0) : 0);
    }, 0);
    const cotX = SCHEMA_X - 22;

    html += `<line x1="${cotX}" y1="${complexTopY}" x2="${cotX}" y2="${complexBottomY}" stroke="#2D2D2D" stroke-width="0.8"/>`;
    html += `<line x1="${cotX - 4}" y1="${complexTopY}" x2="${cotX + 4}" y2="${complexTopY}" stroke="#2D2D2D" stroke-width="0.8"/>`;
    html += `<line x1="${cotX - 4}" y1="${complexBottomY}" x2="${cotX + 4}" y2="${complexBottomY}" stroke="#2D2D2D" stroke-width="0.8"/>`;
    const cotMidY = (complexTopY + complexBottomY) / 2;
    html += `<text x="${cotX - 8}" y="${cotMidY}" text-anchor="middle" fill="#2D2D2D" font-family="Helvetica, Arial, sans-serif" font-weight="300" font-size="11" transform="rotate(-90, ${cotX - 8}, ${cotMidY})">${totalEp} cm</text>`;

    // ── GROUND LINE ──
    const groundY = VEG_ZONE_H + 30;
    html += `<line x1="${SCHEMA_X - 10}" y1="${groundY}" x2="${SCHEMA_X + SCHEMA_W + 10}" y2="${groundY}" stroke="#8A8279" stroke-width="1.5"/>`;

    // ── VEGETATION SYMBOLS ──
    if (vegLayer) {
      const vegMat = getMat(vegLayer);
      const substratLayer = [...layers].reverse().find((l) => l.catKey === "substrat");
      const substratEp = substratLayer ? (substratLayer.thickness || getMat(substratLayer).default_ep || 20) : 20;
      const pxPerCm = complexH / (totalT || 1);
      const coeff = vegMat.id === "arbustes" ? 2.2 : 1.0;
      const vegH = Math.max(substratEp * pxPerCm * coeff, 16);

      html += buildVegetationSVG(vegMat.id, groundY, vegH, SCHEMA_X, SCHEMA_W);

      // Vegetation label
      const vegLabelY = groundY - vegH / 2;
      html += `<line x1="${SCHEMA_X + SCHEMA_W}" y1="${vegLabelY}" x2="${LABEL_X - 2}" y2="${vegLabelY}" stroke="#D0CBC5" stroke-width="0.7"/>`;
      html += `<text x="${LABEL_X}" y="${vegLabelY - 2}" fill="#2D2D2D" font-family="Helvetica, Arial, sans-serif" font-size="11">${vegMat.name}</text>`;
      html += `<text x="${LABEL_X}" y="${vegLabelY + 11}" fill="#2D2D2D" font-family="Helvetica, Arial, sans-serif" font-size="11">${getLayerWeight(vegLayer).toFixed(1)} kg/m\²</text>`;
    }

    // ── DALLE BASE ──
    html += `<rect x="${SCHEMA_X}" y="${currentY}" width="${SCHEMA_W}" height="${DALLE_H}" fill="#FFFFFF" rx="2"/>`;
    html += `<rect x="${SCHEMA_X}" y="${currentY}" width="${SCHEMA_W}" height="${DALLE_H}" fill="url(#pattern-dalle)" rx="2" stroke="#2D2D2D" stroke-width="0.5"/>`;
    html += `<text x="${SCHEMA_X + SCHEMA_W / 2}" y="${currentY + 19}" text-anchor="middle" fill="#2D2D2D" font-family="Helvetica, Arial, sans-serif" font-size="10" letter-spacing="0.08em">DALLE / \ÉTANCH\ÉIT\É</text>`;

    // ── TOTAL TEXT ──
    html += `<text x="${SVG_W / 2 - 10}" y="${currentY + DALLE_H + 24}" text-anchor="middle" fill="#2D2D2D" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="500">Total : ${getTotalWeight(layers).toFixed(1)} kg/m\²</text>`;
    html += `<text x="${SVG_W / 2 - 10}" y="${currentY + DALLE_H + 38}" text-anchor="middle" fill="#A09C98" font-family="Helvetica, Arial, sans-serif" font-size="9">\état satur\é \— pire cas</text>`;

    svg.innerHTML = html;

    // Attach drag handlers to SVG drag-handle rects
    svg.querySelectorAll<SVGRectElement>(".drag-handle").forEach((rect) => {
      const layerId = parseInt(rect.dataset.layerId || "0");
      const layerY = parseFloat(rect.dataset.layerY || "0");
      const cH = parseFloat(rect.dataset.complexH || "0");
      rect.addEventListener("mousedown", (e) => startSvgDrag(e, layerId, layerY, cH));
      rect.addEventListener("touchstart", (e) => startSvgDrag(e, layerId, layerY, cH), { passive: false });
    });
  }, [layers]);

  useEffect(() => {
    renderSchema();
  }, [renderSchema]);

  // ═══════════════════════════════════════════════
  //  SVG THICKNESS DRAG
  // ═══════════════════════════════════════════════
  const startSvgDrag = useCallback(
    (e: MouseEvent | TouchEvent, layerId: number, _layerTopY: number, complexH: number) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const svgRect = svg.getBoundingClientRect();
      const scaleY = SVG_H / svgRect.height;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const svgY = (clientY - svgRect.top) * scaleY;
      const layer = layers.find((l) => l.id === layerId);
      if (!layer) return;
      const mat = getMat(layer);
      dragStateRef.current = {
        layerId,
        startSvgY: svgY,
        startThickness: layer.thickness || mat.default_ep || 0,
        scaleY,
        svgRect,
        complexH,
        totalT: getTotalThickness(layers),
      };

      const onDrag = (ev: MouseEvent | TouchEvent) => {
        const ds = dragStateRef.current;
        if (!ds) return;
        ev.preventDefault();
        const cy = "touches" in ev ? ev.touches[0].clientY : ev.clientY;
        const sy = (cy - ds.svgRect.top) * ds.scaleY;
        const deltaY = sy - ds.startSvgY;
        const pxPerCm = ds.complexH / ds.totalT;
        const deltaThickness = -deltaY / pxPerCm;

        setLayers((prev) => {
          return prev.map((l) => {
            if (l.id !== ds.layerId) return l;
            const m = getMat(l);
            const minEp = m.min_ep || 1;
            const maxEp = m.max_ep || 100;
            const newThickness = Math.round(Math.max(minEp, Math.min(maxEp, ds.startThickness + deltaThickness)));
            return { ...l, thickness: newThickness };
          });
        });
      };

      const endDrag = () => {
        dragStateRef.current = null;
        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", endDrag);
        document.removeEventListener("touchmove", onDrag);
        document.removeEventListener("touchend", endDrag);
      };

      document.addEventListener("mousemove", onDrag);
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchmove", onDrag, { passive: false });
      document.addEventListener("touchend", endDrag);
    },
    [layers]
  );

  // ═══════════════════════════════════════════════
  //  LAYER ACTIONS
  // ═══════════════════════════════════════════════
  function toggleLayer(id: number) {
    setLayers((prev) => {
      const wasOpen = prev.find((l) => l.id === id)?.open;
      return prev.map((l) => ({
        ...l,
        open: l.id === id ? !wasOpen : false,
      }));
    });
  }

  function deleteLayer(id: number) {
    setLayers((prev) => prev.filter((l) => l.id !== id));
  }

  function changeMaterial(id: number, value: string) {
    const [catKey, matId] = value.split(":") as [CategoryKey, string];
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const cat = CATEGORIES[catKey];
        const mat = cat.materials.find((m) => m.id === matId) || cat.materials[0];
        return {
          ...l,
          catKey,
          matId: mat.id,
          customDensity: null,
          thickness: mat.type === "volumique" ? (mat.default_ep ?? null) : null,
        };
      })
    );
  }

  function changeDensity(id: number, val: number) {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, customDensity: val } : l))
    );
  }

  function changeThickness(id: number, val: number) {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, thickness: val } : l))
    );
  }

  // ═══════════════════════════════════════════════
  //  DRAG REORDER (cards)
  // ═══════════════════════════════════════════════
  function handleDragStart(e: React.DragEvent<HTMLDivElement>, id: number) {
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "SELECT") {
      e.preventDefault();
      return;
    }
    setDragCardId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>, id: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== dragCardId) setDragOverId(id);
  }

  function handleDragLeave() {
    setDragOverId(null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, targetId: number) {
    e.preventDefault();
    setDragOverId(null);
    if (targetId === dragCardId || dragCardId === null) return;

    setLayers((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((l) => l.id === dragCardId);
      const toIdx = arr.findIndex((l) => l.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr;
    });
  }

  function handleDragEnd() {
    setDragCardId(null);
    setDragOverId(null);
  }

  // ═══════════════════════════════════════════════
  //  MODAL
  // ═══════════════════════════════════════════════
  function openModal() {
    setModalCatKey(null);
    setModalMatId("");
    setModalOpen(true);
  }

  function selectModalType(key: CategoryKey) {
    setModalCatKey(key);
    setModalMatId(CATEGORIES[key].materials[0].id);
  }

  function addLayerFromModal() {
    if (!modalCatKey) return;
    setLayers((prev) => [...prev, createLayer(modalCatKey, modalMatId)]);
    setModalOpen(false);
  }

  // ═══════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════
  const displayLayers = [...layers].reverse();

  return (
    <>
      <div className={styles.pageTitleSection}>
        <h1>calculateur de charges sur dalle</h1>
        <p>
          Calcul du poids d&apos;un complexe vegetatif en kg/m&sup2; — etat sature.
          Glissez les couches pour les reordonner, ou faites glisser leur bord superieur sur le schema.
        </p>
      </div>

      <div className={styles.app}>
        {/* ── PANNEAU GAUCHE ── */}
        <div className={styles.panelLeft}>
          <div className={styles.panelHeader}>
            <span className={styles.panelHeaderTitle}>Composition du complexe</span>
            <button className={styles.btnAdd} onClick={openModal}>
              <span>+</span> Ajouter une couche
            </button>
          </div>

          <div className={styles.layersContainer}>
            {displayLayers.map((layer) => {
              const cat = CATEGORIES[layer.catKey];
              const mat = getMat(layer);
              const weight = getLayerWeight(layer);
              const isVolumic = mat.type === "volumique";
              const density = layer.customDensity !== null ? layer.customDensity : mat.value;
              const ep = layer.thickness || (mat.default_ep || 0);

              const cardClasses = [
                styles.layerCard,
                layer.open ? styles.layerCardActive : "",
                dragCardId === layer.id ? styles.layerCardDragging : "",
                dragOverId === layer.id ? styles.layerCardDragOver : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div
                  key={layer.id}
                  className={cardClasses}
                  draggable
                  onDragStart={(e) => handleDragStart(e, layer.id)}
                  onDragOver={(e) => handleDragOver(e, layer.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, layer.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div
                    className={styles.layerHeader}
                    onClick={() => toggleLayer(layer.id)}
                  >
                    <div className={styles.dragGrip} title="Glisser pour deplacer">
                      <span className={styles.dragGripLine} />
                      <span className={styles.dragGripLine} />
                      <span className={styles.dragGripLine} />
                    </div>
                    <div
                      className={styles.layerColorDot}
                      style={{ background: cat.color }}
                    />
                    <span className={styles.layerName}>{mat.name}</span>
                    <span className={styles.layerWeight}>
                      {weight.toFixed(1)} kg/m&sup2;
                    </span>
                    <button
                      className={styles.layerDelete}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLayer(layer.id);
                      }}
                    >
                      &times;
                    </button>
                  </div>

                  {layer.open && (
                    <div className={styles.layerBody}>
                      {/* Material select */}
                      <div className={styles.fieldRow}>
                        <span className={styles.fieldLabel}>Materiau</span>
                        <select
                          className={styles.select}
                          value={`${layer.catKey}:${layer.matId}`}
                          onChange={(e) => changeMaterial(layer.id, e.target.value)}
                        >
                          {CATEGORY_KEYS.map((cKey) => (
                            <optgroup key={cKey} label={CATEGORIES[cKey].label}>
                              {CATEGORIES[cKey].materials.map((m) => (
                                <option key={m.id} value={`${cKey}:${m.id}`}>
                                  {m.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      {isVolumic ? (
                        <>
                          {/* Density */}
                          <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>
                              Densite saturee (kg/m&sup3;)
                            </span>
                            <input
                              type="number"
                              className={styles.inputNumber}
                              value={density}
                              min={50}
                              max={2500}
                              step={10}
                              onChange={(e) =>
                                changeDensity(layer.id, parseFloat(e.target.value) || 0)
                              }
                            />
                            <div className={styles.infoRow}>
                              <span className={styles.densityNote}>
                                Valeur par defaut : {mat.value} kg/m&sup3;
                              </span>
                            </div>
                          </div>
                          {/* Thickness */}
                          <div className={styles.fieldRow}>
                            <span className={styles.fieldLabel}>Epaisseur (cm)</span>
                            <div className={styles.thicknessRow}>
                              <input
                                type="range"
                                className={styles.rangeInput}
                                min={mat.min_ep || 1}
                                max={mat.max_ep || 100}
                                value={ep}
                                step={1}
                                onChange={(e) =>
                                  changeThickness(layer.id, parseFloat(e.target.value) || 0)
                                }
                              />
                              <input
                                type="number"
                                className={styles.inputNumber}
                                value={ep}
                                min={mat.min_ep || 1}
                                max={mat.max_ep || 100}
                                step={1}
                                onChange={(e) =>
                                  changeThickness(layer.id, parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className={styles.fieldRow}>
                          <span className={styles.fieldLabel}>
                            Poids forfaitaire (kg/m&sup2;)
                          </span>
                          <input
                            type="number"
                            className={styles.inputNumber}
                            value={density}
                            min={0.1}
                            max={5000}
                            step={0.5}
                            onChange={(e) =>
                              changeDensity(layer.id, parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles.dalleBase}>
            <div className={styles.dalleBaseLabel}>Dalle / etancheite</div>
            <div className={styles.dalleBaseDesc}>
              Base du complexe — non incluse dans le calcul de charges
            </div>
          </div>

          <div className={styles.totalBar}>
            <div className={styles.totalLabel}>Charge totale</div>
            <div>
              <span className={styles.totalValue}>{totalWeight.toFixed(1)}</span>
              <span className={styles.totalUnit}>kg/m&sup2;</span>
            </div>
            <div className={styles.totalNote}>
              Calcule a l&apos;etat sature — pire cas pour l&apos;ingenieur structure
            </div>
          </div>
        </div>

        {/* ── PANNEAU DROIT ── */}
        <div className={styles.panelRight}>
          <div className={styles.schemaHeader}>
            <span className={styles.schemaHeaderTitle}>Coupe schematique</span>
            <span className={styles.schemaHint}>
              Glisser les couches pour reordonner · Tirer le bord des couches pour modifier l&apos;epaisseur
            </span>
          </div>
          <div className={styles.schemaContainer}>
            <svg
              ref={svgRef}
              className={styles.schemaSvg}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              preserveAspectRatio="xMidYMid meet"
            />
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      <div
        className={`${styles.modalOverlay} ${modalOpen ? styles.modalOverlayOpen : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
      >
        <div className={styles.modal}>
          <h3 className={styles.modalTitle}>Ajouter une couche</h3>
          <div className={styles.modalGrid}>
            {CATEGORY_KEYS.map((key) => (
              <button
                key={key}
                className={`${styles.modalTypeBtn} ${modalCatKey === key ? styles.modalTypeBtnSelected : ""}`}
                onClick={() => selectModalType(key)}
              >
                <div
                  className={styles.modalTypeDot}
                  style={{ background: CATEGORIES[key].color }}
                />
                {CATEGORIES[key].label}
              </button>
            ))}
          </div>
          {modalCatKey && (
            <div className={styles.modalMatRow}>
              <div className={styles.modalMatLabel}>Materiau</div>
              <select
                className={styles.select}
                value={modalMatId}
                onChange={(e) => setModalMatId(e.target.value)}
              >
                {CATEGORIES[modalCatKey].materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={styles.modalFooter}>
            <button className={styles.btnSecondary} onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button className={styles.btnPrimary} onClick={addLayerFromModal}>
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════
//  VEGETATION SVG BUILDER (returns SVG string)
// ═══════════════════════════════════════════════
function buildVegetationSVG(
  matId: string,
  groundY: number,
  vegH: number,
  schemaX: number,
  schemaW: number
): string {
  const W = schemaW;
  const X = schemaX;
  const Y = groundY;
  let svg = `<g stroke="#5E8B8F" fill="none" stroke-linecap="round" stroke-linejoin="round">`;

  if (matId === "sedum") {
    const positions = [0.08, 0.19, 0.31, 0.43, 0.54, 0.65, 0.76, 0.87, 0.95];
    positions.forEach((p, i) => {
      const x = X + p * W;
      const h = vegH * (0.75 + 0.25 * Math.sin(i * 2.1));
      svg += `<path d="M${x},${Y} C${x - 8},${Y - h * 0.6} ${x - 9},${Y - h} ${x},${Y - h} C${x + 9},${Y - h} ${x + 8},${Y - h * 0.6} ${x},${Y}" stroke-width="1.1"/>`;
      svg += `<line x1="${x}" y1="${Y - h * 0.25}" x2="${x}" y2="${Y - h * 0.82}" stroke-width="0.7" opacity="0.6"/>`;
      if (i % 2 === 0) {
        svg += `<path d="M${x - 3},${Y - h * 0.5} Q${x - 7},${Y - h * 0.58} ${x - 8},${Y - h * 0.55}" stroke-width="0.7" opacity="0.6"/>`;
        svg += `<path d="M${x + 3},${Y - h * 0.5} Q${x + 7},${Y - h * 0.58} ${x + 8},${Y - h * 0.55}" stroke-width="0.7" opacity="0.6"/>`;
      }
    });
  } else if (matId === "gazon") {
    const count = 20;
    for (let i = 0; i < count; i++) {
      const x = X + 8 + (i / (count - 1)) * (W - 16);
      const h = vegH * (0.82 + 0.18 * ((i % 3) / 2));
      const lean = (i % 2 === 0 ? -1 : 1) * (2 + (i % 3));
      svg += `<path d="M${x},${Y} Q${x + lean * 0.5},${Y - h * 0.5} ${x + lean},${Y - h}" stroke-width="1"/>`;
    }
  } else if (matId === "vivaces") {
    const groups = [
      { cx: X + W * 0.15, stems: [-6, 6], leafSide: 1 },
      { cx: X + W * 0.5, stems: [-8, 0, 8], leafSide: -1 },
      { cx: X + W * 0.82, stems: [-6, 6], leafSide: 1 },
    ];
    groups.forEach((grp) => {
      grp.stems.forEach((offset, si) => {
        const sx = grp.cx + offset;
        const sh = vegH * (0.82 + si * 0.08);
        const lean = offset * 0.8;
        svg += `<path d="M${sx},${Y} Q${sx + lean * 0.4},${Y - sh * 0.55} ${sx + lean},${Y - sh}" stroke-width="1.2"/>`;
        svg += `<ellipse cx="${sx + lean}" cy="${Y - sh - 5}" rx="2.5" ry="5.5" stroke-width="1"/>`;
        const lfY = Y - sh * 0.42;
        const lfX = sx + lean * 0.4;
        const side = grp.leafSide * 14;
        svg += `<path d="M${lfX},${lfY} Q${lfX + side * 0.6},${lfY - 8} ${lfX + side},${lfY - 3}" stroke-width="0.9"/>`;
      });
    });
  } else if (matId === "arbustes") {
    const drawShrub = (cx: number, h: number, scale: number) => {
      const by = Y;
      svg += `<path d="M${cx},${by} Q${cx - 1},${by - h * 0.28} ${cx},${by - h * 0.32}" stroke-width="${2.2 * scale}"/>`;
      const charpentes = [
        { fromY: 0.28, tx: -0.32, ty: 0.58 },
        { fromY: 0.24, tx: 0.3, ty: 0.55 },
        { fromY: 0.2, tx: -0.22, ty: 0.75 },
        { fromY: 0.18, tx: 0.18, ty: 0.78 },
        { fromY: 0.14, tx: -0.1, ty: 0.88 },
        { fromY: 0.14, tx: 0.1, ty: 0.9 },
      ];
      charpentes.forEach((br) => {
        const bx1 = cx;
        const by1 = by - h * br.fromY;
        const bx2 = cx + br.tx * h * 0.7;
        const by2 = by - h * br.ty;
        svg += `<path d="M${bx1},${by1} Q${(bx1 + bx2) / 2},${(by1 + by2) / 2 - 8 * scale} ${bx2},${by2}" stroke-width="${1.3 * scale}"/>`;
        [-1, 1].forEach((d) => {
          const sxx = bx2 + d * 9 * scale;
          const sy = by2 - 8 * scale;
          svg += `<path d="M${bx2},${by2} Q${(bx2 + sxx) / 2},${(by2 + sy) / 2 - 4 * scale} ${sxx},${sy}" stroke-width="${0.9 * scale}"/>`;
          svg += `<path d="M${sxx},${sy} Q${sxx - 5 * scale},${sy - 7 * scale} ${sxx - 3 * scale},${sy - 11 * scale}" stroke-width="${1.1 * scale}"/>`;
          svg += `<path d="M${sxx},${sy} Q${sxx + 4 * scale},${sy - 6 * scale} ${sxx + 5 * scale},${sy - 10 * scale}" stroke-width="${1.1 * scale}"/>`;
        });
      });
      const crownH = h * 0.72;
      const crownW = h * 0.55;
      svg += `<ellipse cx="${cx}" cy="${by - crownH}" rx="${crownW * 0.8}" ry="${crownH * 0.28}" stroke-width="${0.7 * scale}" stroke-dasharray="3,3" opacity="0.45"/>`;
    };
    drawShrub(X + W * 0.22, vegH * 0.82, 0.85);
    drawShrub(X + W * 0.52, vegH, 1.0);
    drawShrub(X + W * 0.78, vegH * 0.76, 0.8);
  } else {
    // Intensif: vivaces larges + ligneuse centrale
    const plantH = vegH;
    const lx = X + W * 0.5;
    svg += `<path d="M${lx},${Y} Q${lx - 1},${Y - plantH * 0.38} ${lx},${Y - plantH * 0.42}" stroke-width="2"/>`;
    const branches: [number, number][] = [
      [-0.18, 0.62], [0.16, 0.6], [-0.12, 0.78], [0.1, 0.8], [-0.06, 0.92], [0.06, 0.94],
    ];
    branches.forEach(([ox, oy]) => {
      const bx = lx + ox * plantH * 0.7;
      const by2 = Y - plantH * oy;
      svg += `<path d="M${lx},${Y - plantH * (oy - 0.15)} Q${(lx + bx) / 2},${Y - plantH * (oy - 0.08)} ${bx},${by2}" stroke-width="1.1"/>`;
      svg += `<path d="M${bx},${by2} Q${bx - 6},${by2 - 8} ${bx - 4},${by2 - 12}" stroke-width="1.1"/>`;
      svg += `<path d="M${bx},${by2} Q${bx + 5},${by2 - 7} ${bx + 6},${by2 - 11}" stroke-width="1.1"/>`;
    });
    svg += `<ellipse cx="${lx}" cy="${Y - plantH * 0.7}" rx="${plantH * 0.28}" ry="${plantH * 0.16}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.5"/>`;

    // Vivaces larges gauche et droite
    const vplants: [number, number][] = [
      [X + W * 0.2, 0.88], [X + W * 0.8, 0.84],
    ];
    vplants.forEach(([vx, ratio]) => {
      const vh = plantH * ratio;
      svg += `<line x1="${vx}" y1="${Y}" x2="${vx}" y2="${Y - vh * 0.5}" stroke-width="1.5"/>`;
      [-14, 14].forEach((side) => {
        svg += `<path d="M${vx},${Y - vh * 0.2} Q${vx + side * 0.6},${Y - vh * 0.46} ${vx + side},${Y - vh * 0.45}" stroke-width="1.2"/>`;
      });
      svg += `<circle cx="${vx}" cy="${Y - vh * 0.52}" r="4" stroke-width="1"/>`;
      [0, 60, 120, 180, 240, 300].forEach((a) => {
        const rad = (a * Math.PI) / 180;
        svg += `<line x1="${vx + Math.cos(rad) * 4}" y1="${Y - vh * 0.52 + Math.sin(rad) * 4}" x2="${vx + Math.cos(rad) * 8}" y2="${Y - vh * 0.52 + Math.sin(rad) * 8}" stroke-width="0.8"/>`;
      });
    });
  }

  svg += `</g>`;
  return svg;
}

// ═══════════════════════════════════════════════
//  PATTERN ID MAPPING
// ═══════════════════════════════════════════════
function getPatternId(catKey: CategoryKey, matId: string): string {
  if (catKey === "protection") return "pattern-protection";
  if (catKey === "drainage") {
    if (matId === "nid-abeille") return "pattern-drainage-hdpe";
    if (matId === "gravier" || matId === "billes-argile" || matId === "pouzzolane")
      return "pattern-drainage-gravier";
    return "pattern-drainage-autre";
  }
  if (catKey === "filtration") return "pattern-filtration";
  if (catKey === "retention") return "pattern-retention";
  if (catKey === "substrat") return "pattern-substrat";
  if (catKey === "paillage") {
    if (matId === "paillage-org") return "pattern-paillage-organique";
    if (matId === "paillage-min") return "pattern-paillage-mineral";
    if (matId === "paillage-bois") return "pattern-paillage-bois";
    return "pattern-paillage-organique";
  }
  return "pattern-protection";
}

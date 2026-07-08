"use client";

import { useMemo, useState } from "react";
import {
  comparateurData,
  NOTE_MAX,
  COURBE_COLORS,
  MAX_SELECTION,
  familleOfCritere,
  type ComparateurData,
} from "@/lib/tools/comparateur-gep/data";
import RadarChart, {
  type RadarAxis,
  type RadarSeries,
  type RadarSector,
} from "./RadarChart";
import styles from "./page.module.css";

type Mode = "ouvrage" | "critere";

interface Props {
  data?: ComparateurData;
}

export default function ComparateurGep({ data = comparateurData }: Props) {
  const { familles, criteres, ouvrages } = data;

  const [mode, setMode] = useState<Mode>("ouvrage");
  // Sélections indépendantes par mode (ordre = ordre des couleurs)
  const [selOuvrages, setSelOuvrages] = useState<string[]>(["JDP", "TVE", "FNO"]);
  const [selCriteres, setSelCriteres] = useState<string[]>(["INF", "ETP"]);
  const [ficheCode, setFicheCode] = useState<string>("JDP");
  const [glossaireOpen, setGlossaireOpen] = useState(false);

  const selection = mode === "ouvrage" ? selOuvrages : selCriteres;
  const setSelection = mode === "ouvrage" ? setSelOuvrages : setSelCriteres;
  const atLimit = selection.length >= MAX_SELECTION;

  function toggle(code: string) {
    setSelection((prev) => {
      if (prev.includes(code)) {
        const next = prev.filter((c) => c !== code);
        if (mode === "ouvrage" && code === ficheCode) {
          setFicheCode(next[0] ?? "");
        }
        return next;
      }
      if (prev.length >= MAX_SELECTION) return prev;
      if (mode === "ouvrage") setFicheCode(code);
      return [...prev, code];
    });
  }

  // ── Axes / séries / secteurs selon le mode ──
  const { axes, series, sectors } = useMemo(() => {
    if (mode === "ouvrage") {
      const axes: RadarAxis[] = criteres.map((c) => ({ code: c.code, label: c.nom }));
      const series: RadarSeries[] = selOuvrages.map((code, i) => {
        const o = ouvrages.find((x) => x.code === code)!;
        return {
          label: `${o.nom} (${o.code})`,
          color: COURBE_COLORS[i] ?? COURBE_COLORS[0],
          values: criteres.map((c) => o.notes[c.code] ?? 0),
        };
      });
      const sectors: RadarSector[] = familles.map((f) => ({
        couleur: f.couleur,
        nom: f.nom,
        indices: criteres
          .map((c, i) => (f.criteres.includes(c.code) ? i : -1))
          .filter((i) => i >= 0),
      }));
      return { axes, series, sectors };
    }
    // mode "critère"
    const axes: RadarAxis[] = ouvrages.map((o) => ({ code: o.code, label: o.nom }));
    const series: RadarSeries[] = selCriteres.map((code, i) => {
      const c = criteres.find((x) => x.code === code)!;
      return {
        label: `${c.nom} (${c.code})`,
        color: COURBE_COLORS[i] ?? COURBE_COLORS[0],
        values: ouvrages.map((o) => o.notes[code] ?? 0),
      };
    });
    return { axes, series, sectors: undefined };
  }, [mode, selOuvrages, selCriteres, criteres, ouvrages, familles]);

  const ariaLabel =
    mode === "ouvrage"
      ? `Radar comparant ${series.length} ouvrage(s) sur ${criteres.length} critères, échelle 0 à ${NOTE_MAX}.`
      : `Radar comparant ${series.length} critère(s) sur ${ouvrages.length} ouvrages, échelle 0 à ${NOTE_MAX}.`;

  const fiche = mode === "ouvrage" ? ouvrages.find((o) => o.code === ficheCode) : undefined;

  return (
    <div className={styles.page}>
      <div className={styles.titleBar}>
        <h1>comparateur d&apos;ouvrages gep</h1>
        <p>
          Comparez 16 techniques alternatives de gestion des eaux pluviales sur{" "}
          {criteres.length} critères. Sélectionnez 1 à {MAX_SELECTION} éléments pour
          superposer les profils.
        </p>
      </div>

      <div className={styles.app}>
        {/* ══ PANNEAU GAUCHE ══ */}
        <aside className={styles.panelLeft}>
          {/* Mode */}
          <div className={styles.modeToggle} role="tablist" aria-label="Mode de lecture">
            <button
              role="tab"
              aria-selected={mode === "ouvrage"}
              className={`${styles.modeBtn} ${mode === "ouvrage" ? styles.modeBtnActive : ""}`}
              onClick={() => setMode("ouvrage")}
            >
              Par ouvrage
            </button>
            <button
              role="tab"
              aria-selected={mode === "critere"}
              className={`${styles.modeBtn} ${mode === "critere" ? styles.modeBtnActive : ""}`}
              onClick={() => setMode("critere")}
            >
              Par critère
            </button>
          </div>

          <p className={styles.helpText}>
            {mode === "ouvrage"
              ? "Un axe = un critère. Chaque courbe = le profil d'un ouvrage sur les 15 critères."
              : "Un axe = un ouvrage. Chaque courbe = les notes de tous les ouvrages sur un critère."}
          </p>

          {/* Sélecteur */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionCardHead}>
              <span className={styles.sectionTitle}>
                {mode === "ouvrage" ? "Ouvrages" : "Critères"}
              </span>
              <span className={styles.counter}>
                {selection.length}/{MAX_SELECTION}
              </span>
            </div>

            {mode === "ouvrage" ? (
              <ul className={styles.selList}>
                {ouvrages.map((o, i) => {
                  const checked = selOuvrages.includes(o.code);
                  const colorIdx = selOuvrages.indexOf(o.code);
                  return (
                    <li key={o.code}>
                      <label
                        className={`${styles.selItem} ${!checked && atLimit ? styles.selItemDisabled : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!checked && atLimit}
                          onChange={() => toggle(o.code)}
                        />
                        <span
                          className={styles.selSwatch}
                          style={{
                            background: checked ? COURBE_COLORS[colorIdx] : "transparent",
                            borderColor: checked ? COURBE_COLORS[colorIdx] : "var(--border)",
                          }}
                          aria-hidden
                        />
                        <span className={styles.selName}>{o.nom}</span>
                        <span className={styles.selCode}>{o.code}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className={styles.selList}>
                {familles.map((f) => (
                  <li key={f.id}>
                    <div className={styles.familyLabel} style={{ color: f.couleur }}>
                      {f.nom}
                    </div>
                    <ul className={styles.selList}>
                      {criteres
                        .filter((c) => f.criteres.includes(c.code))
                        .map((c) => {
                          const checked = selCriteres.includes(c.code);
                          const colorIdx = selCriteres.indexOf(c.code);
                          return (
                            <li key={c.code}>
                              <label
                                className={`${styles.selItem} ${!checked && atLimit ? styles.selItemDisabled : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={!checked && atLimit}
                                  onChange={() => toggle(c.code)}
                                />
                                <span
                                  className={styles.selSwatch}
                                  style={{
                                    background: checked ? COURBE_COLORS[colorIdx] : "transparent",
                                    borderColor: checked ? COURBE_COLORS[colorIdx] : "var(--border)",
                                  }}
                                  aria-hidden
                                />
                                <span className={styles.selName}>{c.nom}</span>
                                <span className={styles.selCode}>{c.code}</span>
                              </label>
                            </li>
                          );
                        })}
                    </ul>
                  </li>
                ))}
              </ul>
            )}

            {atLimit && (
              <p className={styles.limitMsg}>
                Limite de {MAX_SELECTION} atteinte — décochez un élément pour en ajouter un autre.
              </p>
            )}
          </div>

          {/* Familles (légende) — mode ouvrage */}
          {mode === "ouvrage" && (
            <div className={styles.sectionCard}>
              <span className={styles.sectionTitle}>Familles de critères</span>
              <ul className={styles.familyLegend}>
                {familles.map((f) => (
                  <li key={f.id} className={styles.familyLegendItem}>
                    <span
                      className={styles.familyDot}
                      style={{ background: f.couleur }}
                      aria-hidden
                    />
                    {f.nom}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Note d'échelle */}
          <p className={styles.scaleNote}>
            Échelle 0–{NOTE_MAX} · <strong>4 = point fort</strong>,{" "}
            <strong>0 = sans objet</strong> (non applicable — pas « mauvais »).
          </p>
        </aside>

        {/* ══ PANNEAU DROIT ══ */}
        <section className={styles.panelRight}>
          {series.length === 0 ? (
            <div className={styles.emptyState}>
              Sélectionnez au moins un {mode === "ouvrage" ? "ouvrage" : "critère"} à gauche
              pour afficher le radar.
            </div>
          ) : (
            <RadarChart
              axes={axes}
              series={series}
              max={NOTE_MAX}
              sectors={sectors}
              ariaLabel={ariaLabel}
            />
          )}

          {/* Fiche ouvrage (mode ouvrage) */}
          {mode === "ouvrage" && selOuvrages.length > 0 && (
            <div className={styles.ficheCard}>
              <div className={styles.ficheTabs}>
                {selOuvrages.map((code, i) => {
                  const o = ouvrages.find((x) => x.code === code)!;
                  return (
                    <button
                      key={code}
                      className={`${styles.ficheTab} ${code === ficheCode ? styles.ficheTabActive : ""}`}
                      style={code === ficheCode ? { borderColor: COURBE_COLORS[i] } : undefined}
                      onClick={() => setFicheCode(code)}
                    >
                      {o.code}
                    </button>
                  );
                })}
              </div>

              {fiche && (
                <div className={styles.ficheBody}>
                  <h2 className={styles.ficheName}>
                    {fiche.nom} <span className={styles.ficheCode}>{fiche.code}</span>
                  </h2>
                  <p className={styles.ficheLine}>
                    <span className={styles.ficheLabel}>Principe</span> {fiche.principe}
                  </p>
                  <p className={styles.ficheLine}>
                    <span className={styles.ficheLabel}>Fonctions</span> {fiche.fonctions}
                  </p>
                  <div className={styles.notesGrid}>
                    {criteres.map((c) => {
                      const fam = familleOfCritere(c.code);
                      const v = fiche.notes[c.code] ?? 0;
                      return (
                        <div
                          key={c.code}
                          className={styles.notePill}
                          style={{ borderLeftColor: fam?.couleur }}
                          title={c.nom}
                        >
                          <span className={styles.notePillCode}>{c.code}</span>
                          <span className={styles.notePillVal}>
                            {v}
                            <span className={styles.notePillMax}>/{NOTE_MAX}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Glossaire */}
          <div className={styles.glossaire}>
            <button
              className={styles.glossaireToggle}
              onClick={() => setGlossaireOpen((v) => !v)}
              aria-expanded={glossaireOpen}
            >
              Glossaire des {criteres.length} critères
              <span aria-hidden>{glossaireOpen ? "−" : "+"}</span>
            </button>
            {glossaireOpen && (
              <dl className={styles.glossaireList}>
                {criteres.map((c) => {
                  const fam = familleOfCritere(c.code);
                  return (
                    <div key={c.code} className={styles.glossaireItem}>
                      <dt style={{ color: fam?.couleur }}>
                        {c.code} — {c.nom}
                      </dt>
                      <dd>{c.def}</dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>

          {/* Mention méthodo */}
          <p className={styles.methodo}>
            {data.meta.source}
            {data.meta.sourceUrl && (
              <>
                {" — "}
                <a
                  href={data.meta.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.methodoLink}
                >
                  consulter le mémoire (HAL)
                </a>
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}

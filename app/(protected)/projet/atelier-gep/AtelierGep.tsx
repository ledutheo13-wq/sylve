"use client";

import { useEffect, useMemo, useState } from "react";
import { calculerSurfaces } from "@/lib/tools/atelier-gep/surfaces";
import { calculerVolumeAGerer } from "@/lib/tools/atelier-gep/pluies";
import { calculerBilan, EXUTOIRE_META } from "@/lib/tools/atelier-gep/bilan";
import type { SurfaceLigne, JeuMontana } from "@/lib/tools/atelier-gep/types";
import type { Ouvrage, TypeOuvrage, ContexteSite, PartInfiltration, ResultatInfiltrationProjet } from "@/lib/tools/atelier-gep/ouvrages";
import { capaciteOuvrage, estToiture, capaciteToitureMm, infiltrationProjet } from "@/lib/tools/atelier-gep/ouvrages";
import {
  villesMontana,
  jeuMontana,
  PERIODES_MONTANA,
  SOURCE_MONTANA,
  ATTRIBUTION_MONTANA,
} from "@/lib/tools/atelier-gep/montana-villes";
import {
  NATURES_SURFACE,
  NATURES_SOL,
  COEF_SECURITE_K,
  POROSITE_GRAVES,
  VIDANGE_CIBLE_H,
  VIDANGE_LIMITE_H,
  LATITUDE_DEFAUT_DEG,
  STRICKLER_NOUE,
} from "@/lib/tools/atelier-gep/defaults";
import { BIBLIOGRAPHIE, AVERTISSEMENT_LEGAL, AVERTISSEMENT_METHODE } from "@/lib/tools/atelier-gep/biblio";
import PieChart, { type PiePart } from "./PieChart";
import styles from "./page.module.css";

// ── aides ──
let uid = 0;
const nextId = () => `ouv-${++uid}`;
const num = (v: string) => {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/** Saisie « propre » : entier ou décimal, virgule ou point (ex. 0,5 / 0.5). */
const SAISIE_COMPLETE = /^-?\d+([.,]\d+)?$/;

/**
 * Champ numérique qui conserve le texte en cours de frappe.
 * Sans ce brouillon, « 0, » ou « 0. » était aussitôt reconverti en 0 et le
 * séparateur décimal disparaissait : impossible de saisir 0,5 m.
 * Accepte la virgule comme le point ; la valeur numérique remonte à chaque frappe.
 */
function InputNum({
  value,
  onChange,
  ...rest
}: { value: number; onChange: (v: number) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  const [brouillon, setBrouillon] = useState(() => String(value));
  // Valeur modifiée de l'extérieur (préréglage, réinitialisation…) : on resynchronise.
  useEffect(() => {
    setBrouillon((b) => (num(b) === value ? b : String(value)));
  }, [value]);
  return (
    <input
      {...rest}
      inputMode="decimal"
      value={brouillon}
      onChange={(e) => {
        setBrouillon(e.target.value);
        onChange(num(e.target.value));
      }}
      onBlur={(e) => {
        // Saisie incomplète (« 0, », vide…) : on affiche la valeur retenue.
        if (!SAISIE_COMPLETE.test(brouillon.trim())) setBrouillon(String(value));
        rest.onBlur?.(e);
      }}
    />
  );
}

/** Infobulle-source CLIQUABLE (fonctionne au tactile, contrairement à `title`). */
function Info({ texte }: { texte: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className={styles.infoWrap}>
      <button
        type="button"
        className={styles.infoBtn}
        onClick={() => setOpen((o) => !o)}
        aria-label="Afficher la source"
        aria-expanded={open}
      >
        ⓘ
      </button>
      {open && (
        <span className={styles.infoPop} role="tooltip">
          {texte}
          <button className={styles.infoClose} onClick={() => setOpen(false)} aria-label="Fermer">
            ×
          </button>
        </span>
      )}
    </span>
  );
}

const SURFACES_INIT: SurfaceLigne[] = [
  { nature: "Toiture / béton / enrobé imperméable", surface: 1000, cr: 0.95 },
  { nature: "Voirie imperméabilisée", surface: 500, cr: 0.95 },
  { nature: "Espaces verts / pleine terre", surface: 1500, cr: 0.15 },
];
const TEMPERATURES_INIT = [4, 5, 8, 11, 15, 18, 20, 20, 16, 12, 7, 5];
const MOIS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function creerOuvrage(type: TypeOuvrage): Ouvrage {
  const id = nextId();
  switch (type) {
    case "noue":
      return { id, type, nom: "Noue", geom: { profil: "trapezoidal", hauteur: 0.4, largeurFond: 0.5, angleBerge: 45 }, lineaire: 30, pente: 0.005, strickler: STRICKLER_NOUE.valeur, infiltrant: true };
    case "tranchee":
      return { id, type, nom: "Tranchée drainante", longueur: 20, largeur: 1, profondeur: 0.8, porosite: POROSITE_GRAVES.valeur, infiltrant: true };
    case "bassin":
      return { id, type, nom: "Bassin", surfaceFond: 50, profondeur: 0.8, fruit: 1, infiltrant: true };
    case "structure_reservoir":
      return { id, type, nom: "Structure réservoir", emprise: 200, epaisseur: 0.4, porosite: POROSITE_GRAVES.valeur, infiltrant: false };
    case "cuve":
      return { id, type, nom: "Cuve de récupération", volumeUtile: 10 };
    case "toiture_ext":
      return { id, type, nom: "Toiture végétalisée extensive", surface: 300, toit: { cmePourcent: 35, epaisseurCm: 10 }, kc: 0.4 };
    case "toiture_semi":
      return { id, type, nom: "Toiture semi-intensive", surface: 300, toit: { cmePourcent: 45, epaisseurCm: 20 }, kc: 0.75 };
    case "toiture_int":
      return { id, type, nom: "Toiture végétalisée intensive", surface: 300, toit: { cmePourcent: 45, epaisseurCm: 40 }, kc: 0.95 };
  }
}

const TYPES_AJOUT: { type: TypeOuvrage; label: string }[] = [
  { type: "noue", label: "Noue / fossé" },
  { type: "tranchee", label: "Tranchée drainante" },
  { type: "bassin", label: "Bassin" },
  { type: "structure_reservoir", label: "Structure réservoir" },
  { type: "cuve", label: "Cuve de récupération" },
  { type: "toiture_ext", label: "Toiture végétalisée extensive" },
  { type: "toiture_semi", label: "Toiture semi-intensive" },
  { type: "toiture_int", label: "Toiture végétalisée intensive" },
];

export default function AtelierGep() {
  // ── Bloc A : surfaces ──
  const [surfaces, setSurfaces] = useState<SurfaceLigne[]>(SURFACES_INIT);
  const [natureAjout, setNatureAjout] = useState(NATURES_SURFACE[0].id);

  // ── Bloc A : pluviométrie ──
  const [villeNom, setVilleNom] = useState<string>("Paris");
  const [periodeRetour, setPeriodeRetour] = useState<number>(10);
  const [montanaManuel, setMontanaManuel] = useState(false);
  const [aMan, setAMan] = useState(5.9);
  const [bMan, setBMan] = useState(0.59);

  // ── Bloc A : rejet ──
  const [debitFuiteVal, setDebitFuiteVal] = useState(3);
  const [debitUnite, setDebitUnite] = useState<"ls" | "lsha">("ls");

  // ── Bloc A : sol / infiltration ──
  const [solId, setSolId] = useState(NATURES_SOL[2].id);
  const [kManuelActif, setKManuelActif] = useState(false);
  const [kManuel, setKManuel] = useState(1e-5);
  const [coefK, setCoefK] = useState(COEF_SECURITE_K.valeur);
  // Surface d'infiltration : calculée depuis les ouvrages « infiltrant » (défaut) ou saisie
  const [surfaceInfManuelleActive, setSurfaceInfManuelleActive] = useState(false);
  const [surfaceInfiltrationParcelle, setSurfaceInfiltrationParcelle] = useState(0);

  // ── Bloc A : climat ──
  const [latitude, setLatitude] = useState(LATITUDE_DEFAUT_DEG);
  const [temperatures, setTemperatures] = useState<number[]>(TEMPERATURES_INIT);
  const [climatOuvert, setClimatOuvert] = useState(false);

  // ── Bloc C ──
  const [ouvrages, setOuvrages] = useState<Ouvrage[]>([]);
  const [typeAjout, setTypeAjout] = useState<TypeOuvrage>("noue");
  const [biblioOuverte, setBiblioOuverte] = useState(false);

  const ville = villesMontana.find((v) => v.nom === villeNom) ?? villesMontana[0];
  const sol = NATURES_SOL.find((s) => s.id === solId)!;
  const kEff = kManuelActif ? kManuel : sol.kMetresParSeconde;

  // ── calculs ──
  const resSurfaces = useMemo(() => calculerSurfaces(surfaces), [surfaces]);
  const surfaceTotaleHa = resSurfaces.surfaceTotale / 10000;
  const debitFuiteLS = debitUnite === "lsha" ? debitFuiteVal * surfaceTotaleHa : debitFuiteVal;
  const debitFuiteM3H = Math.max(0, debitFuiteLS) * 3.6;

  // Jeu de Montana : ville (auto) ou saisie manuelle
  const jeu: JeuMontana = useMemo(() => {
    if (!montanaManuel) {
      const j = jeuMontana(ville, periodeRetour);
      if (j) return j;
    }
    return { a: aMan, b: bMan, tMinMinutes: 6, tMaxMinutes: 1440, periodeRetour };
  }, [montanaManuel, ville, periodeRetour, aMan, bMan]);

  // Infiltration du projet — source unique : alimente Bloc B, cartes et camembert
  const infProjet = useMemo(
    () =>
      infiltrationProjet({
        ouvrages,
        kMs: kEff,
        coefSecuriteK: coefK,
        surfaceManuelle: surfaceInfManuelleActive ? surfaceInfiltrationParcelle : null,
      }),
    [ouvrages, kEff, coefK, surfaceInfManuelleActive, surfaceInfiltrationParcelle]
  );
  const qInfParcelleM3H = infProjet.debitM3H;
  const qInfParcelleLS = (qInfParcelleM3H / 3600) * 1000;

  const resVolume = useMemo(
    () =>
      calculerVolumeAGerer({
        surfaceActive: resSurfaces.surfaceActive,
        jeu,
        debitFuiteM3H,
        debitInfiltrationM3H: qInfParcelleM3H,
      }),
    [resSurfaces.surfaceActive, jeu, debitFuiteM3H, qInfParcelleM3H]
  );

  const site: ContexteSite = useMemo(
    () => ({ kMs: kEff, coefSecuriteK: coefK, temperatures, latitude, dureeCritiqueMin: resVolume.dureeCritiqueMinutes }),
    [kEff, coefK, temperatures, latitude, resVolume.dureeCritiqueMinutes]
  );

  const bilan = useMemo(
    () =>
      calculerBilan({
        volumeAGerer: resVolume.volumeAGerer,
        debitFuiteM3H,
        debitInfiltrationM3H: qInfParcelleM3H,
        dureeCritiqueMin: resVolume.dureeCritiqueMinutes,
        ouvrages,
        site,
      }),
    [resVolume, debitFuiteM3H, qInfParcelleM3H, ouvrages, site]
  );

  const COUL = ["#5E8B8F", "#A67C5B", "#C4973B", "#6F8FA0", "#8A8279", "#9FB4A0"];
  const pieOuvrages: PiePart[] = [
    ...bilan.parOuvrage.map((p, i) => ({ label: p.nom, value: p.volume, couleur: COUL[i % COUL.length] })),
    ...(bilan.resteAGerer > 0 ? [{ label: "Reste à gérer", value: bilan.resteAGerer, couleur: "#D8C9BE" }] : []),
  ];
  const pieExutoires: PiePart[] = (["rejet", "infiltration", "reutilisation", "atmosphere", "stockage"] as const)
    .map((k) => ({ label: EXUTOIRE_META[k].label, value: bilan.parExutoire[k], couleur: EXUTOIRE_META[k].couleur }))
    .filter((p) => p.value > 0);

  // ── handlers ──
  const ajouterSurface = () => {
    const n = NATURES_SURFACE.find((x) => x.id === natureAjout)!;
    setSurfaces((s) => [...s, { nature: n.label, surface: 100, cr: n.cr }]);
  };
  const majSurface = (i: number, patch: Partial<SurfaceLigne>) =>
    setSurfaces((s) => s.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  const supprSurface = (i: number) => setSurfaces((s) => s.filter((_, j) => j !== i));
  const ajouterOuvrage = () => setOuvrages((o) => [...o, creerOuvrage(typeAjout)]);
  const majOuvrage = (id: string, patch: Partial<Ouvrage>) =>
    setOuvrages((o) => o.map((x) => (x.id === id ? ({ ...x, ...patch } as Ouvrage) : x)));
  const supprOuvrage = (id: string) => setOuvrages((o) => o.filter((x) => x.id !== id));

  const vidangeOk = resVolume.tempsVidangeHeures <= VIDANGE_LIMITE_H;
  const vidangeCible = resVolume.tempsVidangeHeures <= VIDANGE_CIBLE_H;
  const coefDispo = montanaManuel || !!ville.coefficients[String(periodeRetour)];

  return (
    <div className={styles.page}>
      <div className={styles.titleBar}>
        <h1>atelier de gestion des eaux pluviales</h1>
        <p>
          Calculez le volume d&apos;eau à gérer sur une parcelle, puis arbitrez une synergie
          d&apos;ouvrages jusqu&apos;à couvrir l&apos;objectif.
        </p>
        <p className={styles.disclaimer}>{AVERTISSEMENT_LEGAL}</p>
      </div>

      {/* ═══ BLOC A ═══ */}
      <section className={styles.bloc}>
        <div className={styles.blocHead}>
          <span className={styles.blocNum}>A</span>
          <h2>Contexte &amp; entrées</h2>
        </div>

        {/* Localisation — première ligne */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Localisation du projet</div>
          <div className={styles.grid3}>
            <label className={styles.field}>
              <span>Ville de référence (station Météo-France la plus proche)</span>
              <select className={styles.select} value={villeNom} onChange={(e) => setVilleNom(e.target.value)}>
                {villesMontana.map((v) => (
                  <option key={v.num_poste} value={v.nom}>{v.nom} ({v.dept})</option>
                ))}
              </select>
            </label>
            <div className={styles.field}>
              <span>Station retenue</span>
              <div className={styles.readout}>
                {ville.station} · {ville.n_annees} ans de mesures
              </div>
            </div>
            <label className={styles.field}>
              <span>Période de retour <Info texte="T10 = dégâts matériels ; T100 = sécurité des personnes. Le règlement d'assainissement local prime." /></span>
              <select className={styles.select} value={periodeRetour} onChange={(e) => setPeriodeRetour(num(e.target.value))}>
                {PERIODES_MONTANA.map((t) => <option key={t} value={t}>T{t} ({t} ans)</option>)}
              </select>
            </label>
          </div>

          {/* Montana : auto (ville) ou manuel */}
          <div className={styles.montanaRow}>
            <label className={styles.fieldCheck}>
              <input type="checkbox" checked={montanaManuel} onChange={(e) => setMontanaManuel(e.target.checked)} />
              <span>Saisir mes propres coefficients de Montana <Info texte="Si vous disposez de la fiche officielle Météo-France de votre station (recommandé pour un dossier réglementaire)." /></span>
            </label>
            {montanaManuel ? (
              <div className={styles.field2}>
                <label className={styles.field}><span>a</span><InputNum className={styles.inputNum} value={aMan} onChange={(n) => setAMan(n)} /></label>
                <label className={styles.field}><span>b</span><InputNum className={styles.inputNum} value={bMan} onChange={(n) => setBMan(n)} /></label>
              </div>
            ) : (
              <div className={styles.montanaAuto}>
                Coefficients T{periodeRetour} : <strong className={styles.mono}>a = {jeu.a.toFixed(2)}</strong>, <strong className={styles.mono}>b = {jeu.b.toFixed(3)}</strong>{" "}
                <span className={styles.hintInline}>(plage {jeu.tMinMinutes}–{jeu.tMaxMinutes} min)</span>
                <Info texte={`${SOURCE_MONTANA}. ${ATTRIBUTION_MONTANA}.`} />
              </div>
            )}
          </div>
          {!coefDispo && <p className={styles.warn}>Pas de coefficient pour cette période de retour à cette station — passez en saisie manuelle.</p>}
        </div>

        {/* Surfaces */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>Surfaces contributives</div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nature</th><th>Surface (m²)</th>
                <th>Cr <Info texte="Coefficient de ruissellement — IT 1977 / Cerema-Wikhydro." /></th>
                <th>S active</th><th></th>
              </tr>
            </thead>
            <tbody>
              {surfaces.map((l, i) => (
                <tr key={i}>
                  <td>{l.nature}</td>
                  <td><InputNum className={styles.inputNum} value={l.surface} onChange={(n) => majSurface(i, { surface: n })} /></td>
                  <td><InputNum className={styles.inputNum} value={l.cr} onChange={(n) => majSurface(i, { cr: n })} /></td>
                  <td className={styles.mono}>{(l.surface * l.cr).toFixed(0)}</td>
                  <td><button className={styles.btnSuppr} onClick={() => supprSurface(i)} aria-label="Supprimer">×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.addRow}>
            <select className={styles.select} value={natureAjout} onChange={(e) => setNatureAjout(e.target.value)}>
              {NATURES_SURFACE.map((n) => <option key={n.id} value={n.id}>{n.label} (Cr {n.cr})</option>)}
            </select>
            <button className={styles.btnSec} onClick={ajouterSurface}>+ Ajouter</button>
          </div>
          <div className={styles.resumeLine}>
            <span>Surface active <strong className={styles.mono}>{resSurfaces.surfaceActive.toFixed(0)} m²</strong></span>
            <span>Coef. pondéré <strong className={styles.mono}>{resSurfaces.coefPondere.toFixed(2)}</strong></span>
            <span>Surface totale <strong className={styles.mono}>{surfaceTotaleHa.toFixed(3)} ha</strong></span>
          </div>
        </div>

        {/* Rejet + sol */}
        <div className={styles.grid2}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Rejet réglementaire</div>
            <div className={styles.field2}>
              <label className={styles.field}>
                <span>Débit de fuite <Info texte="Issu du PLU / zonage pluvial / arrêté. Un débit réglementaire ne peut pas être dépassé en invoquant l'infiltration." /></span>
                <InputNum className={styles.inputNum} value={debitFuiteVal} onChange={(n) => setDebitFuiteVal(n)} />
              </label>
              <label className={styles.field}>
                <span>Unité</span>
                <select className={styles.select} value={debitUnite} onChange={(e) => setDebitUnite(e.target.value as "ls" | "lsha")}>
                  <option value="ls">l/s</option>
                  <option value="lsha">l/s/ha</option>
                </select>
              </label>
            </div>
            <p className={styles.hint}>
              {debitUnite === "lsha" ? `Soit ${debitFuiteLS.toFixed(2)} l/s pour ${surfaceTotaleHa.toFixed(3)} ha. ` : ""}
              Mettre 0 pour une gestion 100 % à la parcelle.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Sol &amp; infiltration</div>
            <label className={styles.field}>
              <span>Nature du sol <Info texte="Perméabilité K — ADOPTA / Cerema Wikigeotech. Valeur tabulée ≠ essai in situ." /></span>
              <select className={styles.select} value={solId} onChange={(e) => setSolId(e.target.value)} disabled={kManuelActif}>
                {NATURES_SOL.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <p className={styles.hintInline}>{sol.source}</p>
            <label className={styles.fieldCheck}>
              <input type="checkbox" checked={kManuelActif} onChange={(e) => setKManuelActif(e.target.checked)} />
              <span>Saisir mon K (étude d&apos;infiltration)</span>
            </label>
            {kManuelActif && (
              <label className={styles.field}><span>K (m/s)</span><InputNum className={styles.inputNum} value={kManuel} onChange={(n) => setKManuel(n)} /></label>
            )}
            <label className={styles.field}><span>Coef. sécurité K <Info texte="0,5 (K/2) par défaut ; 1 = position GRAIE (0,5 revient à doubler les surfaces d'infiltration)." /></span><InputNum className={styles.inputNum} value={coefK} onChange={(n) => setCoefK(n)} /></label>
            <div className={styles.field}>
              <span>Surface d&apos;infiltration (m²) <Info texte="Calculée : somme des surfaces des ouvrages cochés « infiltrant » au bloc C (noue, bassin, structure réservoir : le fond ; tranchée : les parois). Saisie manuelle : pour une esquisse sans ouvrage détaillé — elle remplace la somme des ouvrages, sans s'y ajouter. Q_inf = K × coef. sécurité × surface." /></span>
              {surfaceInfManuelleActive ? (
                <InputNum className={styles.inputNum} value={surfaceInfiltrationParcelle} onChange={(n) => setSurfaceInfiltrationParcelle(n)} />
              ) : (
                <div className={styles.readout}>
                  <strong className={styles.mono}>{infProjet.surfaceInfiltration.toFixed(0)} m²</strong>
                  {infProjet.surfaceOuvrages > 0
                    ? `, dont ${infProjet.decomposition.filter((p) => p.surface > 0).map((p) => `${p.nom} ${p.surface.toFixed(0)} m²`).join(", ")}`
                    : " (aucun ouvrage infiltrant au bloc C)"}
                </div>
              )}
            </div>
            <label className={styles.fieldCheck}>
              <input type="checkbox" checked={surfaceInfManuelleActive} onChange={(e) => setSurfaceInfManuelleActive(e.target.checked)} />
              <span>Saisir la surface manuellement (esquisse sans ouvrage détaillé)</span>
            </label>
            <p className={styles.hint}>
              Infiltration comptée : <strong className={styles.mono}>{qInfParcelleLS.toFixed(2)} l/s</strong>
              {infProjet.retenue && infProjet.surfaceInfiltration === 0 && !surfaceInfManuelleActive && " — cochez « infiltrant » sur un ouvrage du bloc C pour la prendre en compte."}
            </p>
            {infProjet.conflitManuelOuvrages && (
              <p className={styles.warn}>
                {`Surface saisie (${infProjet.surfaceInfiltration.toFixed(0)} m²) ≠ surface des ouvrages infiltrants (${infProjet.surfaceOuvrages.toFixed(0)} m²) : seule la saisie est comptée, les ouvrages ne s'y ajoutent pas. Décochez la saisie manuelle pour utiliser les ouvrages.`}
              </p>
            )}
            {!infProjet.retenue && (
              <p className={styles.warn}>Sol argileux : infiltration non retenue dans les calculs (Q_inf = 0).</p>
            )}
            {infProjet.retenue && infProjet.sousSeuilAptitude && infProjet.surfaceInfiltration > 0 && (
              <p className={styles.warn}>Sol peu perméable (K &lt; 10⁻⁶ m/s) : l&apos;infiltration seule est déconseillée (guides GEP) ; la conserver en complément d&apos;un rejet régulé et la confirmer par une étude.</p>
            )}
          </div>
        </div>

        {/* Climat */}
        <div className={styles.card}>
          <button className={styles.collapse} onClick={() => setClimatOuvert((v) => !v)} aria-expanded={climatOuvert}>
            Climat (pour le bilan ETP annuel) <span aria-hidden>{climatOuvert ? "−" : "+"}</span>
          </button>
          {climatOuvert && (
            <div className={styles.climat}>
              <label className={styles.field}><span>Latitude (°N) <Info texte="Correction de durée du jour (FAO-56) pour l'ETP Thornthwaite." /></span><InputNum className={styles.inputNum} value={latitude} onChange={(n) => setLatitude(n)} style={{ maxWidth: 90 }} /></label>
              <div className={styles.moisGrid}>
                {temperatures.map((t, m) => (
                  <label key={m} className={styles.moisCell}><span>{MOIS[m]}</span><InputNum className={styles.inputNum} value={t} onChange={(n) => setTemperatures((arr) => arr.map((v, j) => (j === m ? n : v)))} /></label>
                ))}
              </div>
              <p className={styles.hint}>Températures moyennes mensuelles (°C).</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ BLOC B ═══ */}
      <section className={styles.bloc}>
        <div className={styles.blocHead}><span className={styles.blocNum}>B</span><h2>Volume à gérer</h2></div>
        <div className={styles.grid3}>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Volume à gérer (T{periodeRetour})</div>
            <div className={styles.kpiValue}>{resVolume.volumeAGerer.toFixed(1)} <span>m³</span></div>
            <div className={styles.kpiSub}>durée critique {resVolume.dureeCritiqueMinutes.toFixed(0)} min</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Temps de vidange</div>
            <div className={`${styles.kpiValue} ${vidangeCible ? styles.ok : vidangeOk ? styles.warnTxt : styles.danger}`}>
              {Number.isFinite(resVolume.tempsVidangeHeures) ? resVolume.tempsVidangeHeures.toFixed(1) : "∞"} <span>h</span>
            </div>
            <div className={styles.kpiSub}>cible {VIDANGE_CIBLE_H} h · limite {VIDANGE_LIMITE_H} h</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Évacuation totale</div>
            <div className={styles.kpiValue}>{resVolume.debitTotalM3H.toFixed(1)} <span>m³/h</span></div>
            <div className={styles.kpiSub}>fuite {debitFuiteLS.toFixed(1)} l/s + infiltration {qInfParcelleLS.toFixed(2)} l/s</div>
          </div>
        </div>
        {resVolume.horsPlageMontana && (
          <p className={styles.warn}>⚠ La durée critique ({resVolume.dureeCritiqueMinutes.toFixed(0)} min) sort de la plage de validité des coefficients ({jeu.tMinMinutes}–{jeu.tMaxMinutes} min).</p>
        )}
        <p className={styles.methodeNote}>{AVERTISSEMENT_METHODE}</p>
      </section>

      {/* ═══ BLOC C ═══ */}
      <section className={styles.bloc}>
        <div className={styles.blocHead}><span className={styles.blocNum}>C</span><h2>Ouvrages (synergie)</h2></div>
        <div className={styles.addRow}>
          <select className={styles.select} value={typeAjout} onChange={(e) => setTypeAjout(e.target.value as TypeOuvrage)}>
            {TYPES_AJOUT.map((t) => <option key={t.type} value={t.type}>{t.label}</option>)}
          </select>
          <button className={styles.btnPrim} onClick={ajouterOuvrage}>+ Ajouter un ouvrage</button>
        </div>
        <div className={styles.ouvrages}>
          {ouvrages.length === 0 && <p className={styles.empty}>Aucun ouvrage. Ajoutez-en pour couvrir le volume à gérer.</p>}
          {ouvrages.map((o) => (
            <OuvrageCard key={o.id} ouvrage={o} site={site} infProjet={infProjet} onChange={(p) => majOuvrage(o.id, p)} onDelete={() => supprOuvrage(o.id)} />
          ))}
        </div>
      </section>

      {/* ═══ BLOC D ═══ */}
      <section className={styles.bloc}>
        <div className={styles.blocHead}><span className={styles.blocNum}>D</span><h2>Bilan &amp; exutoires</h2></div>
        <div className={styles.coverBar}>
          <div className={styles.coverInfo}>
            <span>Volume à gérer <strong className={styles.mono}>{resVolume.volumeAGerer.toFixed(1)} m³</strong></span>
            <span>Stockage fourni <strong className={styles.mono}>{bilan.stockageTotal.toFixed(1)} m³</strong></span>
            <span className={bilan.couvert ? styles.ok : styles.warnTxt}>{bilan.couvert ? "✓ Objectif couvert" : `Reste à gérer ${bilan.resteAGerer.toFixed(1)} m³`}</span>
          </div>
          <div className={styles.progress}>
            <div className={styles.progressFill} style={{ width: `${resVolume.volumeAGerer > 0 ? Math.min(100, (bilan.stockageTotal / resVolume.volumeAGerer) * 100) : 0}%` }} />
          </div>
        </div>
        <div className={styles.pies}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Par ouvrage (événement)</div>
            <PieChart parts={pieOuvrages} unite="m³" totalReference={Math.max(resVolume.volumeAGerer, bilan.stockageTotal)} ariaLabel="Répartition du volume par ouvrage" />
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Par exutoire (devenir de l&apos;eau) <Info texte="Évacué pendant la durée critique t* : min(V, (Q_fuite + Q_inf) × t*), réparti au prorata des débits — rejet régulé = évacué × Q_fuite / (Q_fuite + Q_inf) ; infiltration = évacué × Q_inf / (Q_fuite + Q_inf) (Cerema OASIS : Q = Q_rég + Q_inf). Puis la réutilisation (volume des cuves), le reste étant stocké. Le stockage est un transit, pas une destination. Bilan non forcé à 100 % (cf. Cerema OASIS)." /></div>
            <PieChart parts={pieExutoires} unite="m³" ariaLabel="Répartition du volume par exutoire" />
          </div>
        </div>
        {(bilan.abattementToituresM3 > 0 || bilan.etpAnnuelleM3 > 0) && (
          <div className={styles.card}>
            <div className={styles.cardTitle}>Toitures &amp; bilan annuel</div>
            {bilan.abattementToituresM3 > 0 && (
              <p className={styles.hint}>Abattement événementiel des toitures : <strong className={styles.mono}>{bilan.abattementToituresM3.toFixed(1)} m³</strong> — <em>non déduit du volume T10</em> (RP TTV, Annexe C.2).</p>
            )}
            {bilan.etpAnnuelleM3 > 0 && (
              <p className={styles.hint}>Évapotranspiration annuelle : <strong className={styles.mono}>{bilan.etpAnnuelleM3.toFixed(0)} m³/an</strong> (Thornthwaite × kc).</p>
            )}
          </div>
        )}
      </section>

      {/* Méthodes & références */}
      <section className={styles.bloc}>
        <div className={styles.card}>
          <button className={styles.collapse} onClick={() => setBiblioOuverte((v) => !v)} aria-expanded={biblioOuverte}>
            Méthodes &amp; références (NF ISO 690) <span aria-hidden>{biblioOuverte ? "−" : "+"}</span>
          </button>
          {biblioOuverte && (
            <ul className={styles.biblio}>
              <li><span className={styles.biblioCat}>Coefficients de Montana (sylve)</span><span>{SOURCE_MONTANA}. {ATTRIBUTION_MONTANA}.</span></li>
              {BIBLIOGRAPHIE.map((r, i) => (
                <li key={i}><span className={styles.biblioCat}>{r.categorie}</span><span>{r.citation} {r.url && <a href={r.url} target="_blank" rel="noopener noreferrer">[lien]</a>}</span></li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
//  Carte d'un ouvrage
// ═══════════════════════════════════════════════════════════

function OuvrageCard({ ouvrage, site, infProjet, onChange, onDelete }: { ouvrage: Ouvrage; site: ContexteSite; infProjet: ResultatInfiltrationProjet; onChange: (p: Partial<Ouvrage>) => void; onDelete: () => void }) {
  const cap = capaciteOuvrage(ouvrage, site);
  const o = ouvrage;
  const partInf: PartInfiltration | undefined = infProjet.decomposition.find((p) => p.id === o.id);
  return (
    <div className={styles.ouvrageCard}>
      <div className={styles.ouvrageHead}>
        <input className={styles.ouvrageNom} value={o.nom} onChange={(e) => onChange({ nom: e.target.value })} />
        <button className={styles.btnSuppr} onClick={onDelete} aria-label="Supprimer">×</button>
      </div>
      <div className={styles.ouvrageParams}>
        {o.type === "noue" && (
          <>
            <label className={styles.field}><span>Profil</span>
              <select className={styles.select} value={o.geom.profil} onChange={(e) => onChange({ geom: { ...o.geom, profil: e.target.value as typeof o.geom.profil } })}>
                <option value="rectangulaire">Rectangulaire</option><option value="trapezoidal">Trapézoïdal</option><option value="asymetrique">Asymétrique</option><option value="circulaire">Circulaire</option>
              </select>
            </label>
            <ChampNum label="Hauteur h (m)" value={o.geom.hauteur} onChange={(v) => onChange({ geom: { ...o.geom, hauteur: v } })} />
            {o.geom.profil !== "circulaire" && <ChampNum label="Largeur fond (m)" value={o.geom.largeurFond ?? 0} onChange={(v) => onChange({ geom: { ...o.geom, largeurFond: v } })} />}
            {(o.geom.profil === "trapezoidal" || o.geom.profil === "asymetrique") && <ChampNum label="Angle berge (°)" value={o.geom.angleBerge ?? 45} onChange={(v) => onChange({ geom: { ...o.geom, angleBerge: v } })} />}
            {o.geom.profil === "circulaire" && <ChampNum label="Diamètre (m)" value={o.geom.diametre ?? 1} onChange={(v) => onChange({ geom: { ...o.geom, diametre: v } })} />}
            <ChampNum label="Linéaire (m)" value={o.lineaire} onChange={(v) => onChange({ lineaire: v })} />
            <ChampNum label="Pente (m/m)" value={o.pente} onChange={(v) => onChange({ pente: v })} />
            <ChampCheck label="Infiltrant" checked={o.infiltrant} onChange={(v) => onChange({ infiltrant: v })} />
          </>
        )}
        {o.type === "tranchee" && (<>
          <ChampNum label="Longueur (m)" value={o.longueur} onChange={(v) => onChange({ longueur: v })} />
          <ChampNum label="Largeur (m)" value={o.largeur} onChange={(v) => onChange({ largeur: v })} />
          <ChampNum label="Profondeur (m)" value={o.profondeur} onChange={(v) => onChange({ profondeur: v })} />
          <ChampNum label="Porosité" value={o.porosite} onChange={(v) => onChange({ porosite: v })} />
          <ChampCheck label="Infiltrant (parois)" checked={o.infiltrant} onChange={(v) => onChange({ infiltrant: v })} />
        </>)}
        {o.type === "bassin" && (<>
          <ChampNum label="Surface fond (m²)" value={o.surfaceFond} onChange={(v) => onChange({ surfaceFond: v })} />
          <ChampNum label="Profondeur (m)" value={o.profondeur} onChange={(v) => onChange({ profondeur: v })} />
          <ChampNum label="Fruit berge" value={o.fruit} onChange={(v) => onChange({ fruit: v })} />
          <ChampCheck label="Infiltrant (fond)" checked={o.infiltrant} onChange={(v) => onChange({ infiltrant: v })} />
        </>)}
        {o.type === "structure_reservoir" && (<>
          <ChampNum label="Emprise (m²)" value={o.emprise} onChange={(v) => onChange({ emprise: v })} />
          <ChampNum label="Épaisseur (m)" value={o.epaisseur} onChange={(v) => onChange({ epaisseur: v })} />
          <ChampNum label="Porosité" value={o.porosite} onChange={(v) => onChange({ porosite: v })} />
          <ChampCheck label="Infiltrant (fond)" checked={o.infiltrant} onChange={(v) => onChange({ infiltrant: v })} />
        </>)}
        {o.type === "cuve" && <ChampNum label="Volume utile (m³)" value={o.volumeUtile} onChange={(v) => onChange({ volumeUtile: v })} />}
        {estToiture(o) && (<>
          <ChampNum label="Surface (m²)" value={o.surface} onChange={(v) => onChange({ surface: v })} />
          <ChampNum label="CME (%vol)" value={o.toit.cmePourcent} onChange={(v) => onChange({ toit: { ...o.toit, cmePourcent: v } })} />
          <ChampNum label="Épaisseur (cm)" value={o.toit.epaisseurCm} onChange={(v) => onChange({ toit: { ...o.toit, epaisseurCm: v } })} />
          <ChampNum label="Rétention drainage (L/m²)" value={o.toit.retentionDrainageLm2 ?? 0} onChange={(v) => onChange({ toit: { ...o.toit, retentionDrainageLm2: v } })} />
        </>)}
      </div>
      <div className={styles.ouvrageCap}>
        {estToiture(o) ? (<>
          <span>Capacité max <strong className={styles.mono}>{capaciteToitureMm(o).toFixed(0)} mm</strong> <Info texte="Charge structurelle (CME × épaisseur) — pas un volume de dimensionnement T10." /></span>
          <span>ETP annuelle <strong className={styles.mono}>{cap.volumeEtp.toFixed(0)} m³/an</strong></span>
        </>) : (<>
          <span>Stockage <strong className={styles.mono}>{cap.volumeStockage.toFixed(1)} m³</strong></span>
          {partInf && partInf.surface > 0 && (infProjet.mode === "manuelle" ? (
            <span className={styles.warnTxt}>Infiltration non comptée : surface saisie manuellement au bloc A</span>
          ) : !infProjet.retenue ? (
            <span className={styles.warnTxt}>Infiltration non retenue (sol argileux)</span>
          ) : (
            <span>Infiltration <strong className={styles.mono}>{partInf.debitM3H.toFixed(2)} m³/h</strong> <Info texte={`Part de cet ouvrage dans l'infiltration du projet : K × coef. sécurité × ${partInf.surface.toFixed(0)} m². Comptée dans le volume à gérer, la vidange et les exutoires.`} /></span>
          ))}
          {cap.volumeReutilisation > 0 && <span>Réutilisation <strong className={styles.mono}>{cap.volumeReutilisation.toFixed(1)} m³</strong></span>}
          {cap.debitCapableM3S !== undefined && cap.debitCapableM3S > 0 && <span>Débit capable <strong className={styles.mono}>{(cap.debitCapableM3S * 1000).toFixed(0)} l/s</strong> <Info texte="Manning-Strickler (indicatif) — vérification de conduite en V2." /></span>}
        </>)}
      </div>
    </div>
  );
}

function ChampNum({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <label className={styles.field}><span>{label}</span><InputNum className={styles.inputNum} value={value} onChange={(n) => onChange(n)} /></label>;
}
function ChampCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className={styles.fieldCheck}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span>{label}</span></label>;
}

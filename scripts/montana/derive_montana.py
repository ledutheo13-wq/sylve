# -*- coding: utf-8 -*-
"""
Dérivation des coefficients de Montana à partir des pluies 6 min OPEN DATA
Météo-France (Licence Ouverte Etalab, attribution « Météo-France »).

Construction clean-room : AUCUNE donnée tierce. Les coefficients produits
sont calculés par SYLVE et lui appartiennent (« coefficients de Montana » =
nom de la formule i = a·t^(-b), pas une marque).

Chaîne : séries 6 min -> cumuls glissants par durée -> maxima annuels
-> ajustement de Gumbel (méthode des moments) -> hauteurs par période de
retour -> régression log(h) = log(a) + (1-b)·log(t) sur 2 plages de durées
(6-60 min et 1 h-24 h, comme Météo-France).

Usage : python derive_montana.py cities.json montana_coefficients.json
"""
import gzip, io, json, os, sys, urllib.request
import numpy as np
import pandas as pd

# Console Windows en cp1252 -> forcer l'UTF-8 pour les accents / symboles.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

DATASET = "donnees-climatologiques-de-base-6-minutes"
API = f"https://www.data.gouv.fr/api/1/datasets/{DATASET}/"
DUREES = [6, 12, 18, 30, 60, 120, 180, 360, 720, 1440]  # minutes
RETOURS = [5, 10, 20, 30, 50, 100]
PLAGES = {"court": (6, 60), "long": (60, 1440)}
GAMMA = 0.5772156649
COUV_MIN = 0.80   # couverture annuelle minimale
ANNEES_MIN = 10   # nb minimal d'années pour ajuster


def log(msg):
    print(msg, flush=True)


def dept_url_map():
    """dépt -> [urls des fichiers 6 min] via l'API data.gouv."""
    with urllib.request.urlopen(API, timeout=60) as r:
        data = json.load(r)
    m = {}
    for res in data.get("resources", []):
        t = res.get("title", "")
        if "MIN_departement_" in t:
            dep = t.split("MIN_departement_")[1].split("_")[0]
            m.setdefault(dep, []).append(res["url"])
    return m


def charger_station(urls, hint):
    """Télécharge les fichiers d'un dépt, renvoie (série 6 min, meta) pour la
    station dont NOM_USUEL contient `hint` (celle qui a le plus de données)."""
    h = hint.upper()
    frames = []
    stations_vues = set()
    for u in urls:
        try:
            with urllib.request.urlopen(u, timeout=300) as resp:
                buf = io.BytesIO(resp.read())
            with gzip.open(buf, "rt", encoding="utf-8", errors="replace") as f:
                df = pd.read_csv(f, sep=";",
                                 usecols=["NUM_POSTE", "NOM_USUEL", "LAT", "LON", "AAAAMMJJHHMN", "RR"],
                                 dtype={"AAAAMMJJHHMN": str, "NOM_USUEL": str})
            stations_vues.update(df["NOM_USUEL"].dropna().unique())
            # filtre par station DÈS ce fichier (mémoire maîtrisée)
            frames.append(df[df["NOM_USUEL"].str.upper().str.contains(h, na=False)])
            del df
        except Exception as e:
            log(f"    ! échec téléchargement {u}: {e}")
    cand = pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()
    if cand.empty:
        log(f"    ! aucune station ne contient « {hint} ». Dispo : {sorted(stations_vues)[:25]}")
        return None, None
    # station la plus fournie
    best = cand.groupby("NUM_POSTE").size().idxmax()
    st = cand[cand["NUM_POSTE"] == best].copy()
    meta = {"num_poste": int(best), "station": st["NOM_USUEL"].iloc[0],
            "lat": float(st["LAT"].iloc[0]), "lon": float(st["LON"].iloc[0])}
    st["dt"] = pd.to_datetime(st["AAAAMMJJHHMN"], format="%Y%m%d%H%M", errors="coerce")
    st["RR"] = pd.to_numeric(st["RR"], errors="coerce")
    st = st.dropna(subset=["dt"]).set_index("dt").sort_index()
    serie = st["RR"].reindex(pd.date_range(st.index.min(), st.index.max(), freq="6min"))
    return serie, meta


def maxima_annuels(serie, k):
    roll = serie.rolling(window=k, min_periods=k).sum()
    mx = roll.groupby(roll.index.year).max()
    cov = serie.groupby(serie.index.year).apply(lambda s: s.notna().mean())
    return mx[(cov >= COUV_MIN)].dropna()


def gumbel_quantiles(x, retours):
    m, s = np.mean(x), np.std(x, ddof=1)
    beta = s * np.sqrt(6) / np.pi
    mu = m - GAMMA * beta
    return {T: float(mu - beta * np.log(-np.log(1 - 1.0 / T))) for T in retours}


def fit_montana(dvals, hvals, dmin, dmax):
    mask = (dvals >= dmin) & (dvals <= dmax)
    t = np.log(dvals[mask]); y = np.log(np.array(hvals)[mask])
    slope, intercept = np.polyfit(t, y, 1)
    a = float(np.exp(intercept)); b = float(1 - slope)
    yhat = slope * t + intercept
    r2 = float(1 - np.sum((y - yhat) ** 2) / np.sum((y - np.mean(y)) ** 2))
    return round(a, 3), round(b, 4), round(r2, 3)


def traiter_ville(ville, urls):
    serie, meta = charger_station(urls, ville["station_hint"])
    if serie is None:
        return None
    n_annees = None
    H = {T: [] for T in RETOURS}; dok = []
    for d in DUREES:
        x = maxima_annuels(serie, d // 6)
        if len(x) < ANNEES_MIN:
            continue
        dok.append(d); n_annees = len(x)
        q = gumbel_quantiles(x.values, RETOURS)
        for T in RETOURS:
            H[T].append(q[T])
    if len(dok) < 4:
        log(f"    ! trop peu de durées exploitables ({len(dok)})")
        return None
    dvals = np.array(dok)
    coeffs = {}
    for T in RETOURS:
        entry = {}
        for nom, (dmin, dmax) in PLAGES.items():
            if ((dvals >= dmin) & (dvals <= dmax)).sum() >= 3:
                a, b, r2 = fit_montana(dvals, H[T], dmin, dmax)
                entry[nom] = {"a": a, "b": b, "tmin": dmin, "tmax": dmax, "r2": r2}
        coeffs[str(T)] = entry
    return {**ville, **meta, "n_annees": int(n_annees),
            "couverture": round(float(serie.notna().mean()), 3),
            "coefficients": coeffs}


def main():
    cities_path, out_path = sys.argv[1], sys.argv[2]
    villes = json.load(open(cities_path, encoding="utf-8"))
    # reprise : on saute les villes déjà calculées
    done = {}
    if os.path.exists(out_path):
        prev = json.load(open(out_path, encoding="utf-8"))
        done = {v["nom"]: v for v in prev.get("villes", [])}
    log(f"Récupération de la carte départements -> fichiers…")
    urlmap = dept_url_map()
    resultats = list(done.values())
    for i, ville in enumerate(villes, 1):
        if ville["nom"] in done:
            log(f"[{i}/{len(villes)}] {ville['nom']} — déjà fait, saut")
            continue
        dep = ville["dept"]
        urls = urlmap.get(dep) or urlmap.get(dep.lstrip("0"))
        log(f"[{i}/{len(villes)}] {ville['nom']} (dépt {dep})…")
        if not urls:
            log(f"    ! pas de fichiers pour le dépt {dep}")
            continue
        try:
            r = traiter_ville(ville, urls)
        except Exception as e:
            log(f"    ! erreur : {e}")
            r = None
        if r:
            resultats.append(r)
            log(f"    ✓ {r['station']} (poste {r['num_poste']}, {r['n_annees']} ans)")
        # sauvegarde incrémentale
        out = {"meta": {
                   "source": "Coefficients de Montana calculés par SYLVE d'après les "
                             "pluies 6 min de Météo-France (open data, Licence Ouverte Etalab)",
                   "methode": "Maxima annuels par durée (6 min–24 h) ; ajustement de Gumbel "
                              "(méthode des moments) ; régression log(h)=log(a)+(1-b)·log(t) "
                              "sur 2 plages (6–60 min, 1 h–24 h).",
                   "attribution": "Données sources : Météo-France",
                   "periodes_retour": RETOURS},
               "villes": resultats}
        json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    log(f"\nTerminé : {len(resultats)}/{len(villes)} villes -> {out_path}")


if __name__ == "__main__":
    main()

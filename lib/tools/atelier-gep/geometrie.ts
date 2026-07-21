// ═══════════════════════════════════════════════════════════
//  BLOC C — Géométrie des ouvrages (sections & volumes)
//  Hydraulique à surface libre publique, re-dérivée.
//  Angles d'inclinaison β donnés depuis l'HORIZONTALE, en degrés.
// ═══════════════════════════════════════════════════════════

const deg2rad = (d: number) => (d * Math.PI) / 180;

export type ProfilNoue = "rectangulaire" | "trapezoidal" | "asymetrique" | "circulaire";

export interface GeomNoue {
  profil: ProfilNoue;
  /** hauteur d'eau (NPHE) ou tirant, en m */
  hauteur: number;
  /** largeur de fond, en m (profils rect./trap./asym.) */
  largeurFond?: number;
  /** angle des berges depuis l'horizontale, en ° (trap./asym.) */
  angleBerge?: number;
  /** diamètre, en m (profil circulaire) */
  diametre?: number;
}

/** Section mouillée S (m²) selon le profil. */
export function sectionNoue(g: GeomNoue): number {
  const h = Math.max(0, g.hauteur);
  const b = Math.max(0, g.largeurFond ?? 0);
  switch (g.profil) {
    case "rectangulaire":
      // S = b · h
      return b * h;
    case "trapezoidal": {
      // berges symétriques : S = (b + h/tanβ) · h
      const beta = deg2rad(g.angleBerge ?? 90);
      const cot = 1 / Math.tan(beta);
      return (b + h * cot) * h;
    }
    case "asymetrique": {
      // un côté vertical, un côté incliné : S = b·h + h²/(2·tanβ)
      const beta = deg2rad(g.angleBerge ?? 90);
      const cot = 1 / Math.tan(beta);
      return b * h + (h * h * cot) / 2;
    }
    case "circulaire": {
      // conduite partiellement pleine, tirant h dans diamètre D :
      // α = 2·arccos(1 − 2h/D) ; S = (D²/8)·(α − sin α)
      const D = Math.max(0, g.diametre ?? 0);
      if (D <= 0) return 0;
      const hc = Math.min(h, D);
      const alpha = 2 * Math.acos(1 - (2 * hc) / D);
      return ((D * D) / 8) * (alpha - Math.sin(alpha));
    }
  }
}

/** Périmètre mouillé P (m) — utile à Manning-Strickler. */
export function perimetreNoue(g: GeomNoue): number {
  const h = Math.max(0, g.hauteur);
  const b = Math.max(0, g.largeurFond ?? 0);
  switch (g.profil) {
    case "rectangulaire":
      return b + 2 * h;
    case "trapezoidal": {
      const beta = deg2rad(g.angleBerge ?? 90);
      const berge = h / Math.sin(beta);
      return b + 2 * berge;
    }
    case "asymetrique": {
      const beta = deg2rad(g.angleBerge ?? 90);
      const berge = h / Math.sin(beta);
      return b + h + berge; // fond + côté vertical + côté incliné
    }
    case "circulaire": {
      const D = Math.max(0, g.diametre ?? 0);
      if (D <= 0) return 0;
      const hc = Math.min(h, D);
      const alpha = 2 * Math.acos(1 - (2 * hc) / D);
      return (D / 2) * alpha;
    }
  }
}

/** Volume de stockage d'une noue = section × linéaire (m³). */
export function volumeNoue(g: GeomNoue, lineaireM: number): number {
  return sectionNoue(g) * Math.max(0, lineaireM);
}

/** Largeur de fond mouillé (m) — surface d'infiltration = largeurFond × linéaire. */
export function largeurFondNoue(g: GeomNoue): number {
  if (g.profil === "circulaire") {
    // corde au niveau du fond ≈ 0 ; on retient une largeur d'infiltration nulle
    // (l'infiltration d'une canalisation n'est pas pertinente ici).
    return 0;
  }
  return Math.max(0, g.largeurFond ?? 0);
}

// ── Volumes des ouvrages « boîte » ──

/** Tranchée / structure réservoir : V = emprise × épaisseur × porosité utile. */
export function volumePoreux(
  empriseM2: number,
  epaisseurM: number,
  porosite: number
): number {
  return Math.max(0, empriseM2) * Math.max(0, epaisseurM) * Math.min(1, Math.max(0, porosite));
}

/** Bassin à berges inclinées (tronc de pyramide) : V = h/3·(A_bas + A_haut + √(A_bas·A_haut)). */
export function volumeBassin(
  surfaceFondM2: number,
  profondeurM: number,
  fruitBerge = 0
): number {
  const h = Math.max(0, profondeurM);
  const aBas = Math.max(0, surfaceFondM2);
  if (fruitBerge <= 0) return aBas * h; // parois verticales
  // élargissement horizontal de chaque côté = fruit × h ; approximé sur base carrée
  const cote = Math.sqrt(aBas);
  const coteHaut = cote + 2 * fruitBerge * h;
  const aHaut = coteHaut * coteHaut;
  return (h / 3) * (aBas + aHaut + Math.sqrt(aBas * aHaut));
}

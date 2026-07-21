import type { SurfaceLigne, ResultatSurfaces } from "./types";

// ═══════════════════════════════════════════════════════════
//  BLOC A — Surface active
//  Sa = Σ (surface_i × Cr_i) ; coef pondéré = Sa / Σ surface_i
//  Réf. : IT 1977 / Cerema — raisonner par surface active raccordée.
// ═══════════════════════════════════════════════════════════

export function calculerSurfaces(lignes: SurfaceLigne[]): ResultatSurfaces {
  let surfaceActive = 0;
  let surfaceTotale = 0;
  for (const l of lignes) {
    const s = Number.isFinite(l.surface) ? Math.max(0, l.surface) : 0;
    const cr = Number.isFinite(l.cr) ? Math.min(1, Math.max(0, l.cr)) : 0;
    surfaceActive += s * cr;
    surfaceTotale += s;
  }
  const coefPondere = surfaceTotale > 0 ? surfaceActive / surfaceTotale : 0;
  return { surfaceActive, surfaceTotale, coefPondere };
}

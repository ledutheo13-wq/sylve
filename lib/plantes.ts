import type { Plante } from "@/types/plantes";

// ─────────────────────────────────────────────────────────────
//  BASE VÉGÉTALE — point de bascule unique (A5)
//  v2 = base enrichie (1942 esp.) + enums normalisés au canon
//       (cf. base-vegetale/NORMALISATION-ENUMS.md)
//
//  ROLLBACK : commenter la ligne v2, décommenter la ligne v1.
//  plantes-v1.json est conservé dans le repo à cette fin.
// ─────────────────────────────────────────────────────────────
import plantesData from "./plantes-v2.json";
// import plantesData from "./plantes-v1.json"; // ← rollback

export const plantes: Plante[] = plantesData as Plante[];

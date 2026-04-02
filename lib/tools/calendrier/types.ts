import type { Plante } from "@/types/plantes";

export interface PlantInMix {
  id: number;
  plante: Plante | null;
  searchText: string;
}

export interface Mix {
  id: number;
  nom: string;
  essences: PlantInMix[];
}

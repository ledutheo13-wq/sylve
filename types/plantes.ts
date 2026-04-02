export interface Plante {
  id: string;
  nom_latin: string;
  nom_commun: string;
  famille: string;
  strate: string;
  persistance: string;
  exposition: string[];
  besoins_hydriques: string;
  type_sol: string[];
  ph_sol: string[];
  humidite_sol: string[];
  rusticite_usda: string;
  rusticite_celsius: number;
  hauteur_min_cm: number;
  hauteur_max_cm: number;
  floraison_debut: number | null;
  floraison_fin: number | null;
  couleur_floraison: string | null;
  mellifere: boolean;
  indigenat: {
    atlantique: boolean;
    continental: boolean;
    mediterraneen: boolean;
    alpin: boolean;
  };
}

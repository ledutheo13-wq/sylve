import AtelierGep from "./AtelierGep";

export const metadata = {
  title: "Atelier de gestion des eaux pluviales — sylve projet",
  description:
    "Pré-dimensionnement GEP : volume d'eau à gérer (méthode des pluies) et arbitrage d'une synergie d'ouvrages, avec double camembert par ouvrage et par exutoire.",
};

// Page protégée : le layout (protected) assure l'auth + le ProjetHeader.
export default function AtelierGepPage() {
  return <AtelierGep />;
}

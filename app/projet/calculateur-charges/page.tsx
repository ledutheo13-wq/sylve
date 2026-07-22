import { ProjetShell } from "@/components/layout/ProjetShell";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import CalculateurCharges from "./CalculateurCharges";

export const metadata = {
  title: "Calculateur de charges sur dalle — sylve projet",
  description:
    "Calcul du poids d'un complexe végétatif en kg/m², avec schéma en coupe interactif. Accès libre.",
};

export default function CalculateurChargesPage() {
  return (
    <ProjetShell breadcrumb={<Breadcrumb slug="calculateur-charges" />}>
      <CalculateurCharges />
    </ProjetShell>
  );
}

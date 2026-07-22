import { ProjetShell } from "@/components/layout/ProjetShell";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import ComparateurGep from "./ComparateurGep";

export const metadata = {
  title: "Comparateur d'ouvrages GEP — sylve projet",
  description:
    "Comparateur visuel des 16 techniques alternatives de gestion des eaux pluviales, notées sur 15 critères. Radars superposables. Accès libre.",
};

export default function ComparateurGepPage() {
  return (
    <ProjetShell breadcrumb={<Breadcrumb slug="comparateur-ouvrages-gep" />}>
      <ComparateurGep />
    </ProjetShell>
  );
}

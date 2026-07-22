import { ProjetShell } from "@/components/layout/ProjetShell";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import Arrosage from "./Arrosage";

export const metadata = {
  title: "Calculateur d'arrosage — sylve projet",
  description:
    "Estimez les besoins en eau de vos aménagements paysagers par zone et par mois. Accès libre.",
};

export default function ArrosagePage() {
  return (
    <ProjetShell breadcrumb={<Breadcrumb slug="arrosage" />}>
      <Arrosage />
    </ProjetShell>
  );
}

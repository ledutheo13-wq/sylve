import { ProjetHeader } from "@/components/layout/ProjetHeader";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

export default function ProjetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProjetHeader />
      <Breadcrumb />
      {children}
    </>
  );
}

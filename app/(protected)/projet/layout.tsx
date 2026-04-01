import { ProjetHeader } from "@/components/layout/ProjetHeader";

export default function ProjetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProjetHeader />
      {children}
    </>
  );
}

import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProjetHeader } from "@/components/layout/ProjetHeader";
import { VitrineHeader } from "@/components/layout/VitrineHeader";

// ═══════════════════════════════════════════════════════════
//  Coquille des pages projet PUBLIQUES (hub, familles, outils
//  ouverts). getUser() → header adapté (connecté : ProjetHeader
//  + contexte auth ; visiteur : VitrineHeader). Slot breadcrumb.
// ═══════════════════════════════════════════════════════════

export async function ProjetShell({
  children,
  breadcrumb,
}: {
  children: React.ReactNode;
  breadcrumb?: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("prenom, email, entreprise, metier")
      .eq("id", user.id)
      .single();

    return (
      <AuthProvider user={user} profile={profile}>
        <ProjetHeader />
        {breadcrumb}
        {children}
      </AuthProvider>
    );
  }

  return (
    <>
      <VitrineHeader />
      {breadcrumb}
      {children}
    </>
  );
}

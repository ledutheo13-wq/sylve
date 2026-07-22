import { createClient } from "@/lib/supabase/server";
import { plantes } from "@/lib/plantes";
import { ProjetHeader } from "@/components/layout/ProjetHeader";
import { VitrineHeader } from "@/components/layout/VitrineHeader";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AuthProvider } from "@/components/auth/AuthProvider";
import CompatibiliteVegetale from "./CompatibiliteVegetale";

export default async function CompatibiliteVitrinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Connecté : version complète avec contexte auth
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("prenom, email, entreprise, metier")
      .eq("id", user.id)
      .single();

    return (
      <AuthProvider user={user} profile={profile}>
        <ProjetHeader />
        <Breadcrumb slug="compatibilite-vegetale" />
        <CompatibiliteVegetale plantes={plantes} />
      </AuthProvider>
    );
  }

  // Visiteur : mode vitrine (fonctionnalités limitées)
  return (
    <>
      <VitrineHeader />
      <Breadcrumb slug="compatibilite-vegetale" />
      <CompatibiliteVegetale plantes={plantes} vitrine />
    </>
  );
}

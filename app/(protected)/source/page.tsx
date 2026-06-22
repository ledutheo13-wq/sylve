/**
 * SYLVE Source — Page /source (Phase 2, perso mono-utilisateur)
 *
 * Sous (protected) : le middleware garantit déjà une session. Ici on AJOUTE
 * le gate fondateur : seul FOUNDER_USER_ID accède. Sinon -> /dashboard.
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SourceChat from "./SourceChat";

export const metadata = { title: "SYLVE Source" };

export default async function SourcePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.FOUNDER_USER_ID) {
    redirect("/dashboard");
  }

  return <SourceChat />;
}

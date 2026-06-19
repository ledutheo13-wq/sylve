import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Finalise les liens email de Supabase (confirmation d'inscription, récupération
 * de mot de passe). Le lien de l'email pointe ici avec un token_hash à usage
 * unique : on l'échange contre une session, puis on redirige.
 *
 * Templates Supabase attendus :
 *   - Confirm signup : {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 *   - Reset password : {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next");

  // Destination après confirmation (chemins internes uniquement).
  const next =
    rawNext && rawNext.startsWith("/")
      ? rawNext
      : type === "recovery"
        ? "/connexion?type=recovery"
        : "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Lien invalide / déjà utilisé / expiré
  return NextResponse.redirect(`${origin}/connexion?error=lien_invalide`);
}

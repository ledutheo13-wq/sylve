import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes: redirect to /connexion if not authenticated
  const path = request.nextUrl.pathname;

  // /projet est PUBLIC par défaut (hub, pages familles, outils en accès libre).
  // Seuls ces outils "compte requis" restent protégés (alignés sur les dossiers
  // physiquement dans le groupe (protected)/projet/).
  const COMPTE_ROUTES = [
    "/projet/calendrier-phenologique",
    "/projet/selecteur-essences",
    "/projet/soutenements",
    "/projet/platelages",
    "/projet/atelier-gep",
  ];
  const isCompteProjet = COMPTE_ROUTES.some(
    (r) => path === r || path.startsWith(r + "/")
  );

  const isProtected =
    path.startsWith("/dashboard") ||
    path.startsWith("/pilote") ||
    path.startsWith("/source") ||
    isCompteProjet;

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  // If authenticated user visits /connexion, redirect to dashboard
  // Exception : un utilisateur authentifié via le lien de récupération doit
  // pouvoir définir son nouveau mot de passe sur /connexion?type=recovery.
  const isRecovery = request.nextUrl.searchParams.get("type") === "recovery";
  if (path === "/connexion" && user && !isRecovery) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

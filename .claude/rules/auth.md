---
paths:
  - "lib/supabase/**"
  - "components/auth/**"
  - "middleware.ts"
  - "app/(protected)/**"
---
# Règles auth Supabase SSR

- Utiliser `getUser()` (pas `getSession()`) pour la validation server-side — plus sécurisé
- Le middleware redirige vers `/connexion` si pas de user sur les routes protégées
- Le middleware redirige vers `/dashboard` si user authentifié visite `/connexion`
- Le layout `(protected)` fetch le profil et le passe via `AuthProvider`
- Côté client : `useAuth()` donne `{ user, profile, supabase }`
- Table `profiles` : id, email, prenom, entreprise, metier (RLS activé)
- Logout : `supabase.auth.signOut()` + `router.push('/connexion')`

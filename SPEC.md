# SYLVE — Spec & Architecture Next.js

## Contexte

SYLVE est un SaaS pour paysagistes concepteurs/MOE en France. Le site actuel (`sylve-landing`) est en HTML/CSS/JS vanilla avec auth Supabase, 7 outils beta fonctionnels, et un design soigné. Les limites du vanilla (pas de middleware, pas de build system, duplication) bloquent l'évolution vers l'auth robuste, le paiement, et la scalabilité. On migre vers Next.js dans ce nouveau repo `sylve`.

---

## Stack

| Couche | Choix | Raison |
|--------|-------|--------|
| Framework | Next.js 15 (App Router) | SSR, middleware, API routes, Vercel-native |
| Auth + DB | Supabase (instance existante) | Déjà en place, RLS, profiles table |
| Auth SSR | @supabase/ssr | Pattern officiel Next.js App Router |
| Styling | CSS Modules + CSS Variables globales | Migration rapide, design existant préservé |
| Font | next/font/google (DM Sans) | Perf, pas de FOUT |
| Export PNG | html2canvas (dynamic import) | 3 outils l'utilisent déjà |
| Deploy | Vercel | Existant, domaine sylve.eco |
| Email | Resend (si besoin custom SMTP) | Transactional emails auth |
| Paiement | Stripe (Phase B, M8+) | Standard SaaS |

**Pas besoin de :** Tailwind, state management lib, ORM, monorepo, FastAPI (pour l'instant).

---

## Structure du projet

```
sylve/
├── .env.local                          # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
├── next.config.ts
├── package.json
├── tsconfig.json
├── middleware.ts                        # Protection routes /dashboard, /projet/*, /pilote/*, /source/*
│
├── public/
│   └── favicon.ico
│
├── app/
│   ├── layout.tsx                      # Root: <html lang="fr">, DM Sans, globals.css
│   ├── globals.css                     # Design tokens (:root), reset, base
│   │
│   ├── page.tsx                        # Landing (/) — Server component
│   ├── page.module.css
│   │
│   ├── connexion/
│   │   ├── page.tsx                    # Auth — Client component (4 vues: signup/login/forgot/recovery)
│   │   └── page.module.css
│   │
│   ├── conseil/                        # Route PUBLIQUE (hors auth) — vitrine "sylve conseil"
│   │   ├── page.tsx                    # One-pager conseil — Server component
│   │   ├── CasCarousel.tsx             # Carousel études de cas — Client component
│   │   └── page.module.css
│   │
│   ├── (protected)/                    # Route group: layout avec auth server-side
│   │   ├── layout.tsx                  # Valide session + fetch profile → AuthProvider
│   │   │
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Dashboard — Server component
│   │   │   └── page.module.css
│   │   │
│   │   ├── projet/
│   │   │   ├── layout.tsx              # Header "sylve projet" partagé
│   │   │   ├── layout.module.css
│   │   │   ├── page.tsx                # Hub outils — Server component
│   │   │   ├── page.module.css
│   │   │   │
│   │   │   ├── calculateur-charges/
│   │   │   │   ├── page.tsx            # Client wrapper (passe rien, tout est local)
│   │   │   │   └── page.module.css
│   │   │   │
│   │   │   ├── arrosage/
│   │   │   │   ├── page.tsx
│   │   │   │   └── page.module.css
│   │   │   │
│   │   │   ├── soutenements/
│   │   │   │   ├── page.tsx
│   │   │   │   └── page.module.css
│   │   │   │
│   │   │   ├── platelages/
│   │   │   │   ├── page.tsx
│   │   │   │   └── page.module.css
│   │   │   │
│   │   │   ├── compatibilite-vegetale/
│   │   │   │   ├── page.tsx            # Server: importe plantes, passe en prop
│   │   │   │   └── page.module.css
│   │   │   │
│   │   │   ├── calendrier-phenologique/
│   │   │   │   ├── page.tsx            # Server: importe plantes, passe en prop
│   │   │   │   └── page.module.css
│   │   │   │
│   │   │   └── selecteur-essences/
│   │   │       ├── page.tsx            # Server: importe plantes, passe en prop
│   │   │       └── page.module.css
│   │   │
│   │   ├── pilote/
│   │   │   └── page.tsx                # Placeholder "Bientôt"
│   │   │
│   │   └── source/
│   │       └── page.tsx                # Placeholder "Bientôt"
│   │
│   └── api/                            # Future: Stripe webhooks, Source RAG
│       └── .gitkeep
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   ├── Logo.tsx                    # "sylve" wordmark (Helvetica, letter-spacing 8px)
│   │   ├── Badge.tsx                   # "Beta" / "Bientôt"
│   │   └── Message.tsx                 # Success/error banners
│   │
│   ├── layout/
│   │   ├── Nav.tsx                     # Landing nav (sticky, blur, scroll)
│   │   ├── Nav.module.css
│   │   ├── AppHeader.tsx               # Dashboard header
│   │   ├── AppHeader.module.css
│   │   ├── ProjetHeader.tsx            # "sylve projet" + user greeting + logout
│   │   └── ProjetHeader.module.css
│   │
│   ├── landing/
│   │   ├── Hero.tsx + .module.css
│   │   ├── MarquesGrid.tsx + .module.css
│   │   ├── Promesse.tsx + .module.css
│   │   └── CtaSection.tsx + .module.css
│   │
│   ├── auth/
│   │   ├── AuthProvider.tsx            # Context: { user, profile, supabase }
│   │   ├── SignupForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── ForgotForm.tsx
│   │   ├── RecoveryForm.tsx
│   │   └── auth-forms.module.css
│   │
│   └── dashboard/
│       ├── ToolCard.tsx + .module.css
│       └── WelcomeScreen.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # createBrowserClient (client components)
│   │   ├── server.ts                   # createServerClient (server components)
│   │   └── middleware.ts               # createServerClient (middleware)
│   │
│   ├── plantes-v1.json                 # 1,301 espèces (source: Projet-pro/02_SYLVE/03_Produit/01_Projet/base-vegetale)
│   ├── plantes.ts                      # Import typé + export
│   │
│   ├── tools/
│   │   ├── charges/
│   │   │   ├── materials.ts            # CATEGORIES, matériaux, getMat()
│   │   │   ├── calculations.ts         # getLayerWeight, getTotalWeight
│   │   │   └── types.ts
│   │   ├── arrosage/
│   │   │   ├── constants.ts            # ETP_PROFILES, DEPT_ZONE, ETP_SPECIFIC
│   │   │   └── calculations.ts
│   │   ├── soutenements/
│   │   │   ├── constants.ts            # TYPES murs (8 types), SOLS (4 types)
│   │   │   └── calculations.ts         # Rankine (Ka, Fs)
│   │   ├── platelages/
│   │   │   ├── constants.ts            # DTU 51.4
│   │   │   └── calculations.ts
│   │   ├── compatibilite/
│   │   │   └── scoring.ts              # Algorithme compatibilité centroïde (5 critères pondérés)
│   │   ├── calendrier/
│   │   │   └── phenology.ts            # Mapping mois, couleurs floraison
│   │   └── selecteur/
│   │       └── filters.ts              # 14 filtres + logique
│   │
│   └── constants.ts                    # Metadata outils (slug, nom, emoji, status, href)
│
└── types/
    ├── supabase.ts                     # Types profiles table
    └── plantes.ts                      # Interface Plante (JSON schema)
```

---

## Design System

### Tokens CSS (globals.css)

```css
:root {
  /* Marque */
  --primary: #5E8B8F;
  --primary-hover: #4E7B7F;
  --sylve-light: #E8F0F1;
  --sylve-dark: #3d6366;

  /* Sous-marques */
  --gres: #8A8279;              /* Projet */
  --terre: #A67C5B;             /* Pilote */
  --ocre: #C4973B;              /* Source */

  /* Surfaces */
  --fond: #F7F6F4;
  --fond-warm: #EDECEA;
  --surface: #FFFFFF;
  --border: #E2DED9;

  /* Texte */
  --text: #2A2826;
  --text-muted: #7A7672;
  --text-light: #A09C98;

  /* Sémantique */
  --error: #C0705A;
  --danger: #C25C3A;

  /* Rayons */
  --radius: 6px;
  --radius-lg: 12px;
}
```

### Typographie

| Usage | Font | Weight | Taille |
|-------|------|--------|--------|
| Logo "sylve" | Helvetica | 300 | 18px, letter-spacing 8px |
| Titres landing | Helvetica | 300 | clamp(56px, 11vw, 96px) |
| Sous-titres | DM Sans | 300 | clamp(22px, 3.5vw, 34px) |
| Corps | DM Sans | 400 | 14-15px |
| Labels | DM Sans | 500 | 11-13px, uppercase, letter-spacing 2-3px |
| Nombres (outils) | DM Mono | 400 | Variable |

### Animations

- `fadeUp` : opacity 0→1 + translateY(20px→0), 0.6s ease
- `expandLine` : scaleX(0→1), 0.8s ease
- `scrollBounce` : translateY bounce infini
- Nav scroll effect : border-bottom apparaît quand scrollY > 20px

---

## Patterns architecturaux

### Auth (Supabase SSR)

```
middleware.ts
  → Protège: /dashboard, /projet/*, /pilote/*, /source/* (sauf vitrine /projet/compatibilite-vegetale)
  → Routes publiques: /, /connexion, /conseil, /api/*, /_next/*, fichiers statiques
  → supabase.auth.getUser() (server-side, sécurisé)
  → Pas de user → redirect('/connexion')
  → User OK → NextResponse.next()

(protected)/layout.tsx (Server Component)
  → Crée Supabase server client via cookies()
  → Fetch user + profile (SELECT prenom, email, entreprise, metier)
  → Wrap children dans <AuthProvider user={user} profile={profile}>

AuthProvider.tsx ("use client")
  → Context React: { user, profile, supabase }
  → supabase = createBrowserClient (pour logout, real-time futur)
  → Hook useAuth() exposé pour tous les composants enfants
```

### Schéma Supabase existant

```sql
-- Table profiles (RLS activé)
CREATE TABLE public.profiles (
  id         uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email      text NOT NULL,
  prenom     text,
  entreprise text,
  metier     text CHECK (metier IN ('be_moe', 'travaux', 'independant')),
  created_at timestamptz DEFAULT timezone('utc', now())
);

-- Policies: SELECT/UPDATE/INSERT WHERE auth.uid() = id
-- Trigger: handle_new_user() crée un profil vide au signup
```

### Chargement données plantes

```
lib/plantes-v1.json (1,301 espèces, ~1MB)
  → Importé statiquement dans les page.tsx SERVER des 3 outils végétaux
  → Passé en prop au composant CLIENT
  → Next.js sérialise dans le RSC payload (envoyé une fois, caché)
  → Pas de fetch client-side séparé

Outils concernés:
  - compatibilite-vegetale
  - calendrier-phenologique
  - selecteur-essences
```

### Migration pattern par outil

Chaque outil HTML vanilla suit le même process de migration :

1. **Extraire les constantes/data** du `<script>` → `lib/tools/[name]/constants.ts`
2. **Extraire la logique de calcul** → `lib/tools/[name]/calculations.ts`
3. **Copier les styles** du `<style>` → `page.module.css`
4. **Convertir HTML → JSX** dans un composant `"use client"`
5. **Remplacer DOM impératif** par React state + rendering déclaratif
6. **SVG/Canvas** : garder en impératif via `useRef` + `useEffect`
7. **html2canvas** : `const html2canvas = (await import('html2canvas')).default`
8. **Auth** : supprimer `<script src="/auth.js">`, utiliser `useAuth()` du context

---

## Inventaire des 7 outils à migrer

| # | Outil | Route | Complexité | Éléments clés |
|---|-------|-------|-----------|---------------|
| 1 | Soutènements | /projet/soutenements | Faible | Formulaire + calcul Rankine (Ka, Fs) |
| 2 | Platelages bois | /projet/platelages | Faible | Formulaire + DTU 51.4 |
| 3 | Arrosage | /projet/arrosage | Moyen | Canvas chart ETP, profils climatiques |
| 4 | Calendrier phéno | /projet/calendrier-phenologique | Moyen | Données plantes + export PNG (html2canvas) |
| 5 | Compatibilité végétale | /projet/compatibilite-vegetale | Élevé | Scoring centroïde, 5 critères pondérés, matrice |
| 6 | Calculateur charges | /projet/calculateur-charges | Élevé | SVG interactif, drag-drop couches, schéma procédural |
| 7 | Sélecteur essences | /projet/selecteur-essences | Élevé | 14 filtres, autocomplete, 1301 espèces, export PNG |

---

## Gating futur (Phase B — M8+)

```
1. Ajouter colonne à profiles:
   subscription_tier: 'free' | 'pro' | 'agency' (default 'free')

2. AuthProvider expose profile.tier

3. Outils payants vérifient le tier:
   if (tool.requiredTier === 'pro' && profile.tier === 'free')
     → <UpgradePrompt tool={tool} />

4. API routes Stripe:
   /api/stripe/checkout/route.ts    → Crée checkout session
   /api/stripe/webhook/route.ts     → Gère events (subscription.created, etc.)

5. Outils payants prévus:
   - CCTP Paysage (29-149€/mois)
   - Calculateur PC/PLU (19-79€/mois)
   - SYLVE Source Pro (9-49€/mois)
   - SYLVE Pilote (19-79€/mois)
```

---

## Ordre de construction

### Phase 1 — Fondations
1. Init Next.js 15 + TypeScript
2. `globals.css` avec design tokens
3. `next/font/google` DM Sans
4. `lib/supabase/` (client.ts, server.ts, middleware.ts)
5. `middleware.ts` protection routes
6. Composants partagés : Logo, Nav, AppHeader, ProjetHeader, Button, Badge
7. AuthProvider + hook useAuth()

### Phase 2 — Landing + Auth
8. Landing page `/` (Hero, MarquesGrid, Promesse, CTA)
9. Page `/connexion` (signup, login, forgot, recovery)
10. Deploy preview Vercel, test auth E2E

### Phase 3 — Dashboard + Hub
11. Dashboard `/dashboard` avec welcome screen + ToolCards
12. Hub outils `/projet` avec grille 7 actifs + 2 "bientôt"
13. Copier `plantes-v1.json` dans `lib/`

### Phase 4 — Outils (par complexité croissante)
14. Soutènements (formulaire simple)
15. Platelages (formulaire simple)
16. Arrosage (+ canvas chart)
17. Calendrier phénologique (+ plantes + export PNG)
18. Compatibilité végétale (+ scoring)
19. Calculateur charges (SVG drag-drop)
20. Sélecteur essences (14 filtres + export)

### Phase 5 — Cutover
21. QA complète
22. Config Vercel production
23. DNS switch sylve.eco → nouveau projet
24. Archiver ancien repo sylve-landing

---

## Checklist de vérification

- [ ] Auth : signup → email verification → login → session persistante → logout
- [ ] Middleware : accès /projet/* sans session redirige vers /connexion
- [ ] Landing : animations fadeUp, expandLine fonctionnent
- [ ] Dashboard : welcome screen au 1er login, greeting avec prénom
- [ ] Chaque outil : résultats de calcul identiques à la version vanilla
- [ ] Export PNG : calendrier + sélecteur produisent des images correctes
- [ ] Mobile : responsive sur tous les écrans
- [ ] Vercel : build + deploy sans erreur
- [ ] Performance : Lighthouse > 90 sur landing

---

## Références

- **Projet existant** : `C:\Users\Tledu\OneDrive\sylve-landing`
- **Docs métier** : `C:\Users\Tledu\OneDrive\Projet-pro\02_SYLVE`
- **Base végétale source** : `C:\Users\Tledu\OneDrive\Projet-pro\02_SYLVE\03_Produit\01_Projet\base-vegetale\plantes-v1.json`
- **Supabase** : `https://jbqgyfbjyulezaclvmwc.supabase.co`
- **Domaine** : `sylve.eco` (Vercel)

# SYLVE

SaaS pour paysagistes concepteurs/MOE en France. Migration de HTML/CSS/JS vanilla vers Next.js 15.

## Commandes
```
npm run dev       # Dev server (turbopack)
npm run build     # Build production (vérification types incluse)
```

## Architecture
| Dossier | Rôle |
|---------|------|
| `app/` | Pages Next.js App Router |
| `app/(protected)/` | Routes authentifiées (middleware + layout auth) |
| `components/` | React : ui/, layout/, auth/, landing/, dashboard/ |
| `lib/supabase/` | Clients Supabase SSR (client.ts, server.ts, middleware.ts) |
| `lib/tools/` | Logique métier extraite des outils (constantes, calculs) |
| `lib/plantes-v1.json` | Base végétale 1,301 espèces (JSON statique) |

## Conventions
- **Code en anglais**, contenu/UI en français
- **Composants outils** : toujours `"use client"` (interactifs)
- **Auth** : middleware server-side (`getUser()`) + `useAuth()` context client
- **Styling** : CSS Modules + CSS Variables globales (`app/globals.css`)
- **Pas de** : Tailwind, state management lib, ORM, over-engineering
- **Imports** : `@/` = racine projet
- **Fetch JSON** : toujours chemins absolus (jamais relatifs — bug trailing slash)

## Références externes (hors repo)
- **Bible métier** : `C:\Users\Tledu\OneDrive\MOE-Paysage` — source de vérité produit/stratégie/roadmap
- **Site vanilla** : `C:\Users\Tledu\OneDrive\sylve-landing` — référence design pixel-perfect + code 7 outils

Détails architecture : @SPEC.md
Bibliothèque réglementaire : @BIBLIOTHEQUE.md

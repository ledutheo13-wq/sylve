---
name: migrate-tool
description: Migre un outil SYLVE de HTML vanilla vers Next.js React component
argument-hint: "[slug-outil]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---
Migre l'outil `$ARGUMENTS` depuis le site vanilla vers Next.js.

## Source
Fichier HTML complet : `C:\Users\Tledu\OneDrive\sylve-landing\projet\$ARGUMENTS\index.html`
Fiche produit (si existe) : `C:\Users\Tledu\OneDrive\MOE-Paysage\04_SYLVE-PROJET\*\ETAT-DEV-*.md`

## Étapes

1. **Lire** le HTML source en entier (styles + script + markup)
2. **Identifier** : constantes/data, logique de calcul, interactions DOM, styles
3. **Créer** `lib/tools/[name]/constants.ts` avec les données extraites
4. **Créer** `lib/tools/[name]/calculations.ts` avec la logique pure (fonctions typées)
5. **Créer** `app/(protected)/projet/[slug]/page.module.css` depuis le `<style>` block
6. **Créer** `app/(protected)/projet/[slug]/page.tsx` — composant React `"use client"`
   - Si l'outil utilise `plantes-v1.json` : le page.tsx est un server component qui importe les plantes et les passe en prop à un composant client
7. **Vérifier** : `npm run build` passe sans erreur

## Règles
- Résultats de calcul IDENTIQUES (ne pas "améliorer" la logique)
- Design pixel-perfect (copier les styles, pas les réinventer)
- SVG/Canvas : `useRef` + `useEffect` (pas de réécriture en JSX)
- html2canvas : dynamic import
- Auth : `useAuth()` du context (pas de SYLVE_AUTH)
- Pas de types `any` — typer les données

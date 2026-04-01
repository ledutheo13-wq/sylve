---
paths:
  - "app/(protected)/projet/**"
  - "lib/tools/**"
---
# Règles migration outils

Chaque outil est migré depuis un fichier HTML vanilla dans `C:\Users\Tledu\OneDrive\sylve-landing\projet\[slug]\index.html`.

## Process de migration
1. Lire le HTML source complet (styles + script + markup)
2. Extraire constantes/data → `lib/tools/[name]/constants.ts`
3. Extraire logique de calcul → `lib/tools/[name]/calculations.ts`
4. Copier styles du `<style>` → `page.module.css` (adapter les sélecteurs en classes)
5. Convertir HTML → JSX dans un composant `"use client"`
6. Remplacer `document.getElementById` par React state + rendering
7. SVG/Canvas : garder en impératif via `useRef` + `useEffect`
8. html2canvas : `const html2canvas = (await import('html2canvas')).default`
9. Auth : supprimer `SYLVE_AUTH.*`, utiliser `useAuth()` du contexte

## Règles
- Résultats de calcul IDENTIQUES à la version vanilla (vérifier)
- Ne pas "améliorer" la logique métier pendant la migration
- Préserver le design pixel-perfect (comparer visuellement)
- Les 3 outils végétaux reçoivent `plantes` en prop depuis le server component parent

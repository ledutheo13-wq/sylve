---
paths:
  - "app/globals.css"
  - "app/page.tsx"
  - "app/page.module.css"
  - "components/landing/**"
  - "components/ui/**"
---
# Règles design

Le design system est défini dans `app/globals.css` et doit être préservé pixel-perfect depuis le site vanilla.

## Tokens obligatoires
- Primary: `--primary: #5E8B8F`
- Sous-marques: `--gres` (Projet), `--terre` (Pilote), `--ocre` (Source)
- Fond: `--fond: #F7F6F4`
- Texte: `--text: #2D2D2D`

## Typo
- Logo "sylve" : Helvetica Light 300, letter-spacing 8px, couleur --primary
- Titres : Helvetica 300, large letter-spacing
- Corps : DM Sans 400, 14-15px
- Labels : DM Sans 500, 11-13px, uppercase, letter-spacing 2-3px

## Animations
- fadeUp, fadeIn, expandLine (définis dans globals.css)
- Nav scroll effect : border-bottom apparaît quand scrollY > 20px
- Transitions : 0.15-0.3s ease

## Interdits
- Pas de dark mode
- Pas de gradients colorés
- Pas d'emojis dans l'UI (sauf icônes outils dans la grille)
- Pas de couleurs vives hors palette

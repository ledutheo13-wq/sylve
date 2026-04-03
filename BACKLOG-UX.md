# Backlog UX — Outils SYLVE

> Ce fichier centralise les améliorations UX identifiées et les retours utilisateurs.
> Chaque entrée est classée par outil et par priorité.

---

## Améliorations identifiées (audit interne — 03/04/2026)

### Soutènements

- [ ] **Indicateur de focus sur le slider de hauteur** — Quand on sélectionne le curseur au clavier, aucun repère visuel ne montre qu'il est actif. Ajouter un contour coloré au focus.
- [ ] **Labels sémantiques** — Les listes déroulantes (type de mur, sol) n'ont pas de label HTML associé. Améliorerait la navigation au clavier et l'accessibilité.

### Platelages

- [ ] **Indicateur de sélection clavier sur "Courante" / "Élaborée"** — Les boutons de choix de conception n'ont pas d'état visible au focus clavier.
- [ ] **Attribut aria-pressed** — Ajouter `aria-pressed` aux boutons toggle pour les lecteurs d'écran.

### Arrosage

- [ ] **Boutons "Simple" / "Détaillé" en vrai groupe radio** — Actuellement ce sont des boutons classiques. Les transformer en groupe radio permettrait de naviguer avec les flèches du clavier.
- [ ] **Indicateur d'étape** — Les 4 étapes du formulaire n'ont pas de barre de progression visuelle. Un indicateur "Étape 2/4" aiderait à se repérer.

### Calculateur charges

- [ ] **Animation slide-up de la modale cassée** — Le sélecteur CSS Modules composé ne fonctionne pas. La modale apparaît sans transition au lieu de glisser depuis le bas.
- [ ] **Alternative clavier au drag-drop** — Impossible de réordonner les couches au clavier. Ajouter des boutons haut/bas ou Shift+flèches.
- [ ] **Scroll molette dans les couches dépliées** — Le handler vanilla qui empêchait le scroll de la page quand le curseur est sur une couche ouverte n'a pas été migré.

### Sélecteur essences

- [ ] **Annonce chargement scroll infini** — Quand 30 nouvelles plantes se chargent en scrollant, rien ne l'indique visuellement.

### Compatibilité végétale

- [ ] **Retour visuel sur la détection du code postal** — Afficher plus clairement "Détecté : Atlantique" ou "2 biorégions possibles" après saisie du code postal.

### Tous les outils (transversal)

- [ ] **Focus visible sur les champs number** — Ajouter `outline` ou `border-color` au focus sur tous les inputs numériques.
- [ ] **Labels HTML explicites** — Vérifier que chaque champ de formulaire a un `<label htmlFor>` associé dans tous les outils.

---

## Retours utilisateurs

> Ajouter ici les retours reçus par les utilisateurs beta.
> Format : `- [ ] **[Outil]** Description du retour — *source (date)*`

*(aucun retour pour le moment)*

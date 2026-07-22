# base-sesame — Sources & attribution (NF ISO 690)

> Attribution obligatoire (Licence Ouverte 2.0) de la base `base-sesame.json`.
> Sous-phase **A1** : ancre = jeu ouvert **Sésame 13**. Les sous-phases suivantes
> (A2 : mining PDF d'autres territoires SESAME) ajouteront leurs propres sources ici.

---

## 1. Jeu de données source (A1)

**CEREMA, INRAE (Unité expérimentale Villa Thuret), CONSEIL DÉPARTEMENTAL DES BOUCHES-DU-RHÔNE.**
*Végétaux utilisables dans les aménagements urbains méditerranéens (base de données Sésame 13)*
[jeu de données en ligne]. Millésime du 4 juin 2024. Licence Ouverte 2.0 (Etalab).
[consulté le 22 juillet 2026]. Disponible sur DataSud à l'adresse :
https://www.datasud.fr/fr/dataset/datasets/3980/
Ressource CSV : https://www.datasud.fr/fr/dataset/datasets/3980/resource/4647/download/
Fiche catalogue (GeoNetwork) : https://www.datasud.fr/geonetwork/srv/api/records/1beab4cc-af1c-4668-b09c-5418a43d0d28

## 2. Schéma de données

**CEREMA.** *Schéma de données sur les végétaux — schema-vegetaux* [en ligne].
Standard normalisé de 73 champs (nomenclature POWO, identifiant GBIF).
Auteurs : INRAE Villa Thuret, Cerema, CD13. [consulté le 22 juillet 2026].
Disponible à l'adresse : https://github.com/CEREMA/schema-vegetaux

## 3. Projet SESAME (contexte)

**CEREMA.** *SESAME — Services ÉcoSystémiques rendus par les Arbres, Modulés selon l'Essence*
[en ligne]. [consulté le 22 juillet 2026]. Disponible à l'adresse : https://sesame.cerema.fr/
Projet Sésame 13 (INRAE Villa Thuret) : https://jardin-thuret.hub.inrae.fr/decouvrir-l-unite/projets/projet-sesame-13

---

## 4. Portée & posture

- **Réutilisation** : Licence Ouverte 2.0 → réutilisation et redistribution libres,
  **avec citation des auteurs et du millésime** (rempli ci-dessus).
- **Données intrinsèques** : `base-sesame` conserve les caractéristiques **propres à l'espèce**
  (résistances sécheresse/chaleur/gel/vent, salinité, morphologie, contraintes, services).
  L'**aptitude climatique locale** n'est **pas** recopiée : elle sera **recalculée** par l'outil-21
  (résistances × climat de l'utilisateur), conformément au cadrage produit.
- **Provenance** : chaque enregistrement porte `provenance = { jeu: "Sésame 13", millesime: "2024-06-04" }`.
- **Aucune donnée fabriquée** : seules les valeurs présentes dans le CSV source sont ingérées ;
  toute cellule vide (`""`, `NA`, `NaN`, `N/A`) devient un champ vide (`null` / `[]`).

# plantes-v1.json — Sources & provenance (NF ISO 690)

> Base végétale partagée (~20 champs) servie aux outils : compatibilité, calendrier, sélecteur, (palette).
> Compilation de faits multi-sources, vérifiée par le fondateur (voir aussi OneDrive `base-vegetale/SOURCES.md`).

## Socle historique (1301 esp., puis backport SESAME A3 → 1406)
- **INRAE Floriscope**, **Tela Botanica** (CC BY-SA), **INPN/TAXREF** (Licence Ouverte), catalogues horticoles de référence.
- Backport A3 : espèces **Sésame 13** (Cerema, INRAE Villa Thuret, CD13 — Licence Ouverte, millésime 2024-06-04) ; cf. `base-sesame.SOURCES.md`.

## Enrichissement A4 (+536 esp. → 1942) — provenance à deux voies
1. **Écologie sourcée Baseflor** (145 esp.) — valences écologiques Julve mappées vers les enums SYLVE :
   - JULVE, Ph. *Baseflor. Index botanique, écologique et chorologique de la Flore de France* [en ligne]. Programme Catminat. **Licence ODbL**. Version 07/03/2025. Disponible via Tela Botanica.
   - ⚠️ ODbL = *share-alike* (point juridique ouvert, à trancher avant diffusion large de la base).
2. **Écologie compilée « à vérifier »** (391 esp.) — **Option A** (décision fondateur 22/07/2026) : compilation assistée à partir de sources horticoles publiques (catalogues pépiniéristes FR), **à vérifier par le fondateur**. Méthode identique à la constitution d'origine de la base.
- **Horticole** (rusticité, hauteurs, nom commun, persistance, mellifère) : compilé « à vérifier » pour les 536.
- **Filtre d'inclusion** : disponibilité commerciale (espèces achetables en pépinière FR) ; invasives interdites UE (EEE) écartées.
- **Indigénat DIFFÉRÉ** : source visée TAXREF/INPN indisponible (cyberattaque MNHN) → `indigenat` all-false provisoire pour les 536.

## Provenance par espèce
Fichier `plantes-v1-provenance-A4.json` (par `id` : `{ecologie, horticole}`) — trace les 536 espèces A4 (Baseflor vs compilé).

## Bibliographie NF ISO 690
- INRAE. *Floriscope* [en ligne]. https://floriscope.io/
- TELA BOTANICA. *eFlore / Baseflor* [en ligne]. CC BY-SA / ODbL. https://www.tela-botanica.org/
- JULVE, Ph. *Baseflor — Index botanique, écologique et chorologique de la Flore de France*. Programme Catminat. ODbL.
- MUSÉUM NATIONAL D'HISTOIRE NATURELLE. *INPN / TAXREF* [en ligne]. Licence Ouverte. https://inpn.mnhn.fr/
- CEREMA, INRAE Villa Thuret, CD13. *Sésame 13* [jeu de données]. Licence Ouverte, 2024-06-04.

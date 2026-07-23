# Base végétale partagée — Sources & provenance (NF ISO 690)

> ⚠️ **Base servie en production : `plantes-v2.json`** (depuis A5) — même contenu que v1
> mais **enums normalisés au canon** (`base-vegetale/NORMALISATION-ENUMS.md`).
> `plantes-v1.json` est **conservé comme rollback** (voir l'en-tête de `lib/plantes.ts`).
>
> **A5 (hygiène)** : 1469 valeurs repliées sur le canon — `persistance` (caduque→caduc…),
> `exposition` (plein soleil→soleil), `besoins_hydriques` (modéré→moyen…), `ph_sol`
> (alcalin→calcaire + plages numériques converties), `humidite_sol` (normal/bien_draine/modéré→frais,
> repli **arbitré empiriquement contre Baseflor**), `strate` (39 `herbacée` reclassées :
> 38 graminées + *Helichrysum stoechas* en arbuste ; `fougere`→`fougère`), ajout de `marcescent`.
> `type_sol` conserve volontairement son vocabulaire enrichi (le scoring de compatibilité l'exploite).
> **Indigénat neutralisé côté UI** (« bientôt ») tant que TAXREF/INPN n'est pas rétabli.

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

## Complétion A4 « JEU 2 » — écologie des 105 espèces SESAME backportées en A3
Les 105 espèces versées en A3 avaient 7 champs laissés vides (SESAME ne les fournit pas). Complétés (735 champs) :
- **Baseflor** (Julve, ODbL) : exposition + pH (40 esp.), hydrique + humidité (39 esp.).
- **SESAME `resistance_secheresse`** (Licence Ouverte) : hydrique + humidité (34 esp.) — uniquement les termes non ambigus de l'échelle Julve (Xérophyte / Mésoxérophyte / Mésophyte). Le terme **« Résistant »** (37 esp.), hors échelle et contredit par les commentaires SESAME, a été **écarté** au profit de la compilation.
- **Compilé « à vérifier »** : rusticité (USDA + °C) et `hauteur_min_cm` pour les 105 (aucune source ne les fournit), + exposition/pH des 65 hors Baseflor.
- **Arbitrages tracés** : *Dorycnium pentaphyllum* — appariement Baseflor sur un infra-taxon distinct (subsp. *gracile*, méso-hygrophile) contredisant SESAME → hydrique SESAME retenu. *Cistus albidus* — Baseflor R=3 « acide » écarté sur arbitrage fondateur (taxon calcicole de garrigue) → `neutre/calcaire` compilé.

## Provenance par espèce
- `plantes-v1-provenance-A4.json` — les 536 espèces ajoutées en A4 (`{ecologie, horticole}`).
- `plantes-v1-provenance-A4-JEU2.json` — les 105 espèces complétées, **provenance champ par champ**.

## Bibliographie NF ISO 690
- INRAE. *Floriscope* [en ligne]. https://floriscope.io/
- TELA BOTANICA. *eFlore / Baseflor* [en ligne]. CC BY-SA / ODbL. https://www.tela-botanica.org/
- JULVE, Ph. *Baseflor — Index botanique, écologique et chorologique de la Flore de France*. Programme Catminat. ODbL.
- MUSÉUM NATIONAL D'HISTOIRE NATURELLE. *INPN / TAXREF* [en ligne]. Licence Ouverte. https://inpn.mnhn.fr/
- CEREMA, INRAE Villa Thuret, CD13. *Sésame 13* [jeu de données]. Licence Ouverte, 2024-06-04.

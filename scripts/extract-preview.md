# SYLVE Source — Aperçu d'extraction (Phase 3, étape 1)

Extraction améliorée (tables + détection d'article par famille) sur 1 doc/famille. **Sans embeddings ni écriture en base.** À valider avant le gros run des 35.

## Fascicule 35 (CCTG) — Aménagements paysagers
_famille : `fascicule`_

- **157 pages → 384 chunks** · articles détectés sur **3/157** pages

**Articles détectés (échantillon) :**

- p.10 → `Article 1. Objet et champ d’application du fascicule`
- p.11 → `Article 3. Documents de référence`
- p.12 → `Article 6. Sécheresse et restrictions d’arrosage`

**Exemple de page « tableau » linéarisée :**

_(page 157)_

```
Nom | Organisation
Juliette FAIVRE | MTE/DGALN/DHUP/QV2
Dorine LAVILLE | MTE/DGALN/DHUP/QV2
Eric LE GUERN | MTE/DGITM/DIT/MARRN
Audrey MILON | MTE/DGALN/DHUP/QV2
Dominique POUJEAUX | MTE/DGALN/DEB/EARM
Emmanuel STEINMANN | MTE/DGALN/DEB/GR4
Frédérique CREUSOT | MEFR/DAE/SPDSA/IMMO
Serge DOUMAIN | MEFR/DAJ/1C
Romain LEFEVRE | MEFR/DB/SD1/1BE
Flora VIGREUX | MEFR/DAJ/1C
Jean-Baptiste BUTLEN | MCTRCT/MTE
Régis TRIOLLET | MAA/DGER/BDAPI
Henri BAVA | FFP
```

**Échantillon de texte courant (début d'un chunk) :**

```
J.19. Installation d’un système d’arrosage
J.21. Rivières artificielles et plans d’eau
J.23. Installation de mobilier urbain non publicitaire et autres équipements
J.24. Opérations préalables à la réception
J.26. Garantie de parfait achèvement des ouvrages
J.27. Garantie des végétaux en l’absence de travaux de finalisation
J.28. Garantie des végétaux lorsque l’ensemble des travaux de finalisation est
Exemples de calendriers de travaux et garanties
J.29.1. Consistance des travaux de finalisation

```

---

## Règle pro UNEP P.C.2 — Plantation d'arbres et arbustes
_famille : `unep`_

- **16 pages → 36 chunks** · articles détectés sur **0/16** pages

**Articles détectés (échantillon) :**

> _aucun — citation = document + page (NULL assumé)_

**Exemple de page « tableau » linéarisée :**

_(page 16)_

```
UNEP | AFDJEVP | AITF | FFP | FNPHP | avril 2012
Validation des quantités | Commentaires
O/N | éventuelles
Nom des plantes | 1 | 2 | (Présence de branches cassées, taches
```

**Échantillon de texte courant (début d'un chunk) :**

```
Préambule
Les règles professionnelles sont la transcription et
l’identification du savoir-faire des entreprises du paysage.
Elles sont rédigées par des professionnels du paysage :
entreprises, | donneurs | d’ordre, | bureaux | d’étude,
enseignants, fournisseurs, experts.
Elles sont élaborées en tenant compte de l’état des lieux
des connaissances au moment de leur rédaction, et des
documents existants sur certains sujets spécifiques. Elles
constituent ainsi une photographie des “bonnes pratiques”
```

---

## NF P98-332 — Distances entre réseaux enterrés et végétaux
_famille : `nf`_

- **35 pages → 44 chunks** · articles détectés sur **6/35** pages

**Articles détectés (échantillon) :**

- p.6 → `1 Domaine d'application`
- p.29 → `4 Proximité entre réseaux enterrés et arbres`
- p.30 → `4.2 Conditions d'implantation planimétrique sans protection particulière`
- p.31 → `4.4.2 Plantation d'arbres lorsque les réseaux existent`
- p.32 → `5 Proximité entre réseaux aériens et arbres`
- p.33 → `5.2 Arbustes et taillis plantés sous les réseaux aériens`

**Exemple de page « tableau » linéarisée :**

_(page 4)_

```
M | AUDEBERT | SYNDICAT PROFESSIONNEL DES CANALISATEURS
M | CLOS | GDF
M | DESCHAMPS | SETRA
M | GROSJEAN | UNM (UNION NATIONALE DE LA MACONNERIE)
M | LEVANNIER | BUREAU VERITAS
```

**Échantillon de texte courant (début d'un chunk) :**

```
Chaussées et dépendances
Règles de distance entre les réseaux enterrés
et règles de voisinage entre les réseaux et les
végétaux
E : Roadways and ancillaries - rules for distance between buried (utilities) networks and
rules for proximity between networks and plants
D : Fahrbahnen und Nebenanlagen - Abstandregeln zwischen eingegrabenen Netzen und
Nachbarschaftregeln zwischen Netzen und Pflanzen
Statut
Norme française homologuée par décision du Directeur Général d'AFNOR le 20 janvier 2005 pour
pre
```

---

## NF DTU 43.1 — Étanchéité des toitures-terrasses (guide de conception)
_famille : `dtu`_

- **23 pages → 45 chunks** · articles détectés sur **10/23** pages

**Articles détectés (échantillon) :**

- p.7 → `1 Domaine d'application`
- p.9 → `3.2 Travaux ne relevant pas du lot étanchéité`
- p.10 → `4.2 Classement descriptif indicatif`
- p.11 → `6 Dispositions particulières aux jardinières transportables`
- p.12 → `8 Dimensionnement des dispositifs d'évacuation des eaux pluviales`
- p.15 → `9 Toiture avec retenue temporaire des eaux pluviales`
- p.16 → `9.1.3 Choix de la pluie d'orage type`
- p.19 → `9.1.4 Evaluation des performances des systèmes :`
- p.20 → `9.2 Exemple d'application`
- p.21 → `9.3 Simulations diverses`

**Exemple de page « tableau » linéarisée :**

_(page 4)_

```
M | ANDREI | ETANCHISOL
M | GUERIN | CPO
M | MORIN | AQC
```

**Échantillon de texte courant (début d'un chunk) :**

```
DTU 43.1 (FD P84-204-3) (septembre 2004) : Travaux de
bâtiment - Etanchéité des toitures-terrasses et toitures inclinées
avec éléments porteurs en maçonnerie en climat de plaine -
Partie 3 : Guide à l'intention du Maître d'Ouvrage +
Amendement A1 (août 2007) (Indice de classement : P84-204-
3)
Ce document est une consolidation de Normes, seules les Normes individuellement homologuées et composant cette compilation font foi.
```

---

## Code de la commande publique — Maîtrise d'œuvre privée
_famille : `ccag-ccp`_

- **12 pages → 37 chunks** · articles détectés sur **11/12** pages

**Articles détectés (échantillon) :**

- p.1 → `R2431-1 à R2432-7`
- p.2 → `Article R2432-1 à R2432-7`
- p.4 → `Article L2430-1`
- p.5 → `Article L2432-2`
- p.6 → `Article R2431-5`
- p.7 → `Article R2431-12`
- p.8 → `Article R2431-17`
- p.9 → `Article R2431-24`
- p.10 → `Article R2431-29`
- p.11 → `Article R2431-35`
- p.12 → `Article R2432-5`

**Exemple de page « tableau » linéarisée :**

> _aucune page nettement tabulaire détectée dans ce doc_

**Échantillon de texte courant (début d'un chunk) :**

```
CODE DE LA COMMANDE PUBLIQUE
(Partie Législative et Réglementaire)
2ème Partie : Marchés publics
Livre 4 Dispositions propres aux marchés publics liés à la maîtrise d'ouvrage
publique et à la maîtrise d'oeuvre privée
Titre 3 Maîtrise d'oeuvre privée
Articles L2430-1 à L2430-2
Chapitre 1 Mission de maîtrise d'oeuvre privée
Articles L2431-1 à L2431-3
Articles R2431-1 à R2431-37
Chapitre 2 Marché public de maîtrise d'oeuvre privée
Articles L2432-1 et L2432-2
Article R2432-1 à R2432-7
84, avenue Jea
```

---

## CSTB — L'arbre en milieu urbain (guide pratique)
_famille : `cstb`_

- **145 pages → 208 chunks** · articles détectés sur **0/145** pages

**Articles détectés (échantillon) :**

> _aucun — citation = document + page (NULL assumé)_

**Exemple de page « tableau » linéarisée :**

_(page 128)_

```
9 | Fourniture et mise en place de sol artificiel
a | – Jeunes plants racines nues
b | – Jeunes plants motte forestière
c | – Baliveaux
d | – Tiges racines nues | 10/12
e | – Tiges racines nues | 12/14
f | – Tiges racines nues | 14/18
g | – Tiges mottes | 18/20
h | – Tiges mottes | 20/25
i | – Tiges mottes | 25/30
j | – Tiges mottes | 30/35
k | – Gros sujets | 35/40
l | – Gros sujets | 40/45
m | – Gros sujets | 45/50
```

**Échantillon de texte courant (début d'un chunk) :**

```
Acteur public indépendant, au service de l'innovation dans le bâtiment,
le Centre Scientifique et Technique du Bâtiment (CSTB) exerce quatre activités clés
- recherche, expertise, évaluation, diffusion des connaissances - qui lui permettent de
répondre aux objectifs du développement durable pour les produits de construction,
les bâtiments et leur intégration dans les quartiers et les villes. Le CSTB contribue
de manière essentielle à la qualité et à la sécurité de la construction durable grâce a
```

---

## Arrêté du 15 janvier 2007 — Accessibilité de la voirie
_famille : `arrete`_

- **9 pages → 0 chunks** · articles détectés sur **0/9** pages

**Articles détectés (échantillon) :**

> _aucun — citation = document + page (NULL assumé)_

**Exemple de page « tableau » linéarisée :**

> _aucune page nettement tabulaire détectée dans ce doc_

**Échantillon de texte courant (début d'un chunk) :**

```

```

---

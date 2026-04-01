# Claude Code — Guide complet (mars 2026)
> Base sur la doc officielle Anthropic (code.claude.com/docs), les articles de reference (Hannah Stulberg, computingforgeeks), et l'experience terrain sur Betjok.
> Applicable a Claude Code en extension VSCode, terminal, et desktop app.

---

## 1. CLAUDE.md — Le fichier le plus important

### Ce que c'est
`CLAUDE.md` est charge **au debut de chaque session**. Chaque ligne consomme du contexte et impacte tout ce que Claude produit. C'est le seul mecanisme "always-on" garanti.

### Hierarchie de chargement (du plus general au plus specifique)
| Emplacement | Portee | Quand charge |
|---|---|---|
| `~/.claude/CLAUDE.md` | Preferences perso (tous les projets) | Toujours |
| `./CLAUDE.md` ou `./.claude/CLAUDE.md` | Projet (committer dans git) | Quand on travaille dans ce dossier |
| `./CLAUDE.local.md` | Projet local uniquement (gitignore) | Quand on travaille dans ce dossier |
| Dossiers enfants `foo/CLAUDE.md` | Sous-projet (monorepo) | Lazy-loaded quand Claude touche des fichiers dans `foo/` |
| Dossiers parents | Remonte jusqu'a la racine du workspace | Automatique |

Dans un monorepo, chaque niveau **ajoute** du contexte. Un fichier dans `mobile/lib/` chargera : `~/CLAUDE.md` + `betjok/CLAUDE.md` + `betjok-app/CLAUDE.md` + `mobile/CLAUDE.md`.

### Imports
Syntaxe `@path/to/file` pour inclure un autre fichier sans le dupliquer :
```markdown
See @README.md for project overview.
# Additional Instructions
- Git workflow: @docs/git-instructions.md
- Personal overrides: @~/.claude/my-project-instructions.md
```

### Regles d'or
1. **< 200 lignes** par fichier (consensus doc officielle). Au-dela, l'instruction-following degrade **uniformement** (pas seulement les nouvelles instructions — toutes).
2. **Budget total ~150 instructions** reparties sur tous les CLAUDE.md charges. Le system prompt de Claude Code en consomme deja ~50. Il reste ~100-150 pour toi.
3. **Ecrire ce que Claude ne peut pas deviner** en lisant le code : commandes de build, decisions d'archi, gotchas, conventions non-evidentes.
4. **Ne pas mettre** : style de code (utiliser un linter), documentation longue (linker plutot), principes generiques (SOLID, DRY — dans l'entrainement).
5. **Plus le niveau est haut, plus c'est court.** Le user CLAUDE.md doit etre le plus leger (~25 lignes). Le projet CLAUDE.md peut etre plus detaille.
6. **Verifier le chargement** : `/memory` affiche les fichiers charges dans la session.

### User CLAUDE.md (`~/.claude/CLAUDE.md`) — ce qui doit y etre
C'est "comment tu travailles", pas "ou tu travailles". Portable entre projets.
- Profil personnel (niveau, preferences d'apprentissage)
- Methode de travail (plan-first, confirmer avant d'agir)
- Communication (langue, ton, format)
- Securite (pas de .env, confirmer les actions destructives)

Ne PAS y mettre : conventions de projet, commandes de build, principes de code generiques.

### Projet CLAUDE.md — ce qui doit y etre
- Commandes essentielles (build, test, lint, dev server)
- Architecture (dossiers, roles, stack)
- Conventions non-evidentes (patterns Firestore, serialisation d'enums, etc.)
- Pointeurs vers les fichiers cles (`@path/to/model.dart`)
- Pointeurs vers les rules et skills

---

## 2. Rules — `.claude/rules/`

### Ce que c'est
Fichiers `.md` dans `.claude/rules/` charges **conditionnellement** selon les fichiers sur lesquels Claude travaille. Equivalent des linters pour le comportement de Claude.

### Path-scoped rules (SOTA)
```yaml
---
paths:
  - "src/api/**/*.ts"
---
# API Rules
- Toujours valider les inputs
- Format d'erreur standard
```
Le fichier n'est injecte que quand Claude travaille sur des fichiers matchant le glob. Supporte `**/*.ts`, `src/**/*`, `*.md`, etc.

### Bonnes pratiques
- **Un fichier = un sujet** (`testing.md`, `api-design.md`, pas un fourre-tout)
- **Noms descriptifs** — le nom du fichier doit indiquer le contenu
- **Pointeurs > copies** — referencer `@file:line` plutot que copier du code
- **Subdirectories** pour grouper : `rules/frontend/`, `rules/backend/`
- Symlinks possibles pour partager des rules entre projets

### Regles sans `paths:` frontmatter
Chargees a chaque session (equivalent "always-on"). Reserver aux regles **vraiment universelles** (git workflow, conventions de commit).

---

## 3. Skills — `.claude/skills/`

### Ce que c'est
Un skill est une **procedure packagee** invocable via `/skill-name`. Contrairement aux rules (comportement), un skill guide Claude a travers une tache specifique avec des etapes.

### Format SKILL.md
```yaml
---
name: fix-issue
description: Fix a GitHub issue
disable-model-invocation: true
argument-hint: "[issue-number]"
allowed-tools: Read, Grep, Glob, Bash
context: fork
---
Analyse et corrige le probleme : $ARGUMENTS.

1. Lire les details du probleme
2. Chercher les fichiers concernes
3. Implementer le fix
4. Verifier les tests
5. Creer un commit descriptif
```

### Frontmatter reference
| Champ | Role |
|---|---|
| `name` | Slug unique, invocable via `/name` |
| `description` | **Crucial** — Claude lit ca pour decider d'invoquer automatiquement le skill |
| `disable-model-invocation` | `true` → seul l'utilisateur peut invoquer (deploy, commit...) |
| `user-invocable` | `false` → seul Claude peut invoquer (contexte background) |
| `allowed-tools` | Restreindre les outils (ex: `Read, Grep, Glob` pour un skill read-only) |
| `context` | `fork` → s'execute en subagent isole, ne pollue pas le contexte principal |
| `argument-hint` | Placeholder affiche a l'utilisateur (`[filename] [format]`) |
| `model` | Forcer un modele (`sonnet`, `opus`, `haiku`) |
| `effort` | Niveau d'effort (`low`, `medium`, `high`, `max`) |
| `hooks` | Hooks specifiques au skill (ex: `PreToolUse` pour un security check) |

### Variables disponibles
- `$ARGUMENTS` — tout ce qui suit `/skill-name`
- `$ARGUMENTS[0]`, `$ARGUMENTS[1]`, `$N` — arguments positionnels
- `${CLAUDE_SESSION_ID}` — ID de la session
- `${CLAUDE_SKILL_DIR}` — dossier du skill (pour referencer des fichiers de support)

### Fichiers de support
```
my-skill/
  SKILL.md              # Instructions (requis)
  references/           # Docs de reference (charges a la demande)
  scripts/              # Scripts utilitaires (executes, pas charges)
  examples/             # Exemples de sortie attendue
```
Le `SKILL.md` doit pointer vers les fichiers de support avec des liens relatifs. Claude les lit **a la demande**, pas au chargement.

### Skills du package `skills` (Dart/Flutter)
Le package `skills` (pub.dev) installe automatiquement les skills des packages Flutter dans `.claude/skills/` :
```bash
dart pub add skills --dev
dart run skills get --ide claude
```
Registries : `flutter/skills` (22 skills officiels), `serverpod/skills-registry` (communautaire).

---

## 4. Subagents — `.claude/agents/`

### Ce que c'est
Des agents specialises avec leur propre system prompt, outils, et modele. Contrairement aux skills (procedure), un subagent est un **personnage** avec des capacites definies.

### Built-in subagents
| Type | Modele | Outils | Usage |
|---|---|---|---|
| Explore | Haiku (rapide) | Read-only | Decouverte de fichiers, recherche |
| Plan | Herite | Read-only | Recherche pour planification |
| General-purpose | Herite | Tous | Operations complexes, modifications |

### Custom subagents
```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
memory: user
---
You are a code reviewer. Analyze code and provide specific,
actionable feedback on quality, security, and best practices.
```

### Emplacements
| Scope | Emplacement |
|---|---|
| Projet (partage en equipe) | `.claude/agents/` |
| Personnel | `~/.claude/agents/` |

### Fonctionnalites avancees
- **`memory: user`** — memoire persistante entre sessions (`~/.claude/agent-memory/<name>/`)
- **`isolation: worktree`** — git worktree isole pour les modifications
- **`background: true`** — tourne en arriere-plan pendant que tu continues a travailler
- **`skills: [api-conventions]`** — precharge des skills dans le subagent
- **`mcpServers: [playwright]`** — scope des MCP servers au subagent
- **`permissionMode: dontAsk`** — auto-approuve les actions (attention)
- **`maxTurns: 50`** — limite le nombre de tours

### Invocation
- **Naturelle** : "utilise le code-reviewer pour verifier mes changements"
- **@-mention** : `@"code-reviewer (agent)"` — garantit l'execution
- **Session entiere** : `claude --agent code-reviewer`
- **Foreground** : bloque la conversation, les questions passent
- **Background** : `Ctrl+B` ou "fais ca en arriere-plan"

### Quand utiliser un subagent vs le contexte principal
| Subagent | Contexte principal |
|---|---|
| Output verbeux qu'on ne veut pas dans le contexte | Back-and-forth iteratif |
| Restrictions d'outils specifiques | Phases qui partagent du contexte |
| Tache autonome avec resume | Changement rapide et cible |

---

## 5. Hooks — `.claude/settings.json`

### Ce que c'est
Commandes shell executees a des moments precis du cycle de vie de Claude. **Deterministes** — pas de dependance au LLM pour les declencher.

### Evenements disponibles
| Event | Quand | Usage courant |
|---|---|---|
| `SessionStart` | Debut de session | Charger du contexte dynamique |
| `InstructionsLoaded` | Apres chargement CLAUDE.md + rules | Injecter du contexte supplementaire |
| `UserPromptSubmit` | Avant que Claude traite le prompt | Enrichir le prompt utilisateur |
| `PreToolUse` | Avant un appel d'outil | Bloquer/modifier des operations |
| `PostToolUse` | Apres un appel d'outil | Valider les resultats |
| `Stop` | Quand Claude veut s'arreter | Verifier la qualite avant d'arreter |
| `PreCompact` / `PostCompact` | Autour de la compaction | Preserver du contexte critique |
| `SubagentStart` / `SubagentStop` | Cycle de vie des subagents | Monitoring |

### Configuration
Dans `.claude/settings.json` :
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./scripts/security-check.sh"
          }
        ]
      }
    ]
  }
}
```

### Types de hooks
- **`command`** — script shell execute
- **`prompt`** — prompt envoye a Claude pour evaluation
- **`agent`** — delegue a un subagent
- **`http`** — appel HTTP externe

### Hooks dans les skills
Les skills peuvent definir leurs propres hooks dans le frontmatter :
```yaml
---
name: secure-operations
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

---

## 6. Gestion de session

### Commandes essentielles
| Commande | Usage |
|---|---|
| `/clear` | Reset le contexte entre deux taches distinctes |
| `/compact <instructions>` | Compresser le contexte (ex: `/compact Focus on the API changes`) |
| `/memory` | Voir les CLAUDE.md charges et l'auto-memoire |
| `/btw` | Question rapide en overlay, n'entre pas dans l'historique |
| `/rewind` | Revenir a un etat precedent (code + conversation) |
| `Esc` | Stopper Claude en cours d'action (contexte conserve) |
| `Esc Esc` | Ouvrir le menu rewind |
| `Ctrl+G` | Basculer en Plan Mode (exploration sans execution) |
| `Ctrl+B` | Passer une tache en arriere-plan |

### Plan Mode (`Ctrl+G`)
Force Claude a explorer et planifier sans executer. Utiliser pour :
- Comprendre le code avant de modifier
- Valider une approche avant de coder
- Interviews structurees (Claude pose des questions)

### Compaction
Quand le contexte est trop long, Claude compacte automatiquement (resume les messages).
- Ajouter dans CLAUDE.md : "When compacting, always preserve the full list of modified files and any test commands"
- Pour compacter manuellement avec focus : `/compact Focus on the API changes`
- Pour compacter partiellement : `Esc Esc` > selectionner un checkpoint > "Summarize from here"

### Auto-memoire
Claude sauvegarde automatiquement des learnings (commandes de build, patterns du projet) entre sessions.
- Voir : `/memory`
- Desactiver : `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`
- Stockage : `~/.claude/projects/<project>/memory/`

---

## 7. Anti-patterns et pieges

| Anti-pattern | Pourquoi c'est un probleme | Fix |
|---|---|---|
| CLAUDE.md trop long (> 200 lignes) | Instruction-following degrade sur TOUT | Decouvrir en rules path-scoped |
| Session fleuve sans `/clear` | Contexte pollue par des taches precedentes | `/clear` entre les taches |
| Corriger Claude en boucle | Contexte pollue par les echecs | Apres 2 echecs : `/clear` + reformuler |
| Tout mettre dans CLAUDE.md | Noie les instructions importantes | Rules pour le specifique, CLAUDE.md pour l'universel |
| Ne pas donner de moyen de verifier | Claude produit du code plausible mais faux | Toujours fournir tests, linter, typecheck |
| Explorer sans scope | Claude lit des centaines de fichiers | Scoper les investigations ou utiliser des subagents |
| Dupliquer entre CLAUDE.md et rules | Double bruit, risque de contradiction | Un seul endroit par information |
| Skills trop generiques sans `$ARGUMENTS` | Inutilisables en pratique | Arguments clairs + `argument-hint` |
| Ignorer l'auto-memoire | Memoires stales degradent les reponses | `/memory` pour auditer regulierement |

---

## 8. Bootstrap : demarrer Claude sur une grosse codebase existante

### Etape 1 — Le CLAUDE.md minimal (5 min)

Creer `CLAUDE.md` a la racine du projet. Ne PAS essayer d'etre exhaustif. Commencer avec **uniquement** ce que Claude ne peut pas deviner :

```markdown
# [Nom du projet]

[1 phrase : ce que fait le projet]

## Commandes
[les 4-5 commandes essentielles : dev, build, test, lint, deploy]

## Architecture
[tableau : dossier | role | stack — 3 a 6 lignes max]

## Conventions non-evidentes
[2-3 regles que le code seul ne revele pas]
```

Ca prend 5 minutes et c'est suffisant pour demarrer. Exemple reel :

```markdown
# Acme API

REST API interne pour la gestion de commandes.

## Commandes
npm run dev       # Dev server (port 3000)
npm run test      # Vitest
npm run build     # TypeScript compile
npm run db:migrate # Prisma migrations

## Architecture
- src/handlers/ : Endpoints Express
- src/middleware/ : Auth, validation, error handling
- src/types/ : Interfaces partagees
- prisma/ : Schema et migrations

## Conventions
- Toutes les reponses : { data, error, meta }
- Validation inputs : schemas zod obligatoires
- Tests : base de donnees locale reelle, pas de mocks
```

### Etape 2 — Laisser Claude explorer (10 min)

Ouvrir Claude Code et lui demander d'explorer. En **Plan Mode** (`Ctrl+G`) :

```
Explore ce projet en profondeur. Lis les fichiers principaux,
comprends l'architecture, les patterns, les conventions.
Liste-moi ensuite :
1. Les modules principaux et leurs roles
2. Les patterns recurrents (comment on cree un endpoint, un composant, etc.)
3. Les gotchas ou decisions d'archi non-evidentes
4. Ce que tu ajouterais au CLAUDE.md pour etre plus efficace
```

Claude va lire le code et te proposer des ameliorations pour le CLAUDE.md. Integrer ce qui est pertinent.

### Etape 3 — Creer les rules path-scoped (10 min)

```bash
mkdir -p .claude/rules
```

Pour chaque domaine qui a ses propres conventions, creer un fichier :

```bash
# Exemples
.claude/rules/api.md          # paths: ["src/api/**"]
.claude/rules/frontend.md     # paths: ["src/components/**", "src/pages/**"]
.claude/rules/database.md     # paths: ["prisma/**", "src/db/**"]
```

**Astuce** : demander a Claude de les generer apres l'exploration :

```
Genere-moi des fichiers .claude/rules/ avec paths: frontmatter
pour chaque domaine du projet que tu as identifie.
Format court, < 20 lignes chacun.
```

### Etape 4 — Creer 2-3 skills pour les taches repetitives (15 min)

Identifier les taches qu'on fait souvent dans cette codebase :
- Ajouter un endpoint / une page / un composant
- Lancer les tests et verifier
- Review de code avant commit

```bash
mkdir -p .claude/skills/add-endpoint
```

Demander a Claude de les generer :

```
Je veux un skill /add-endpoint qui cree un nouvel endpoint REST
dans cette codebase en suivant les patterns existants.
Analyse les endpoints existants et genere le SKILL.md.
```

### Etape 5 — Iterer (continu)

Apres 2-3 sessions de travail :
- **Lire l'auto-memoire** (`/memory`) — Claude a probablement appris des choses utiles
- **Tailler le CLAUDE.md** — supprimer ce que Claude fait deja correctement sans l'instruction
- **Ajouter des rules** quand un pattern se repete ("je lui dis toujours de faire X" → rule)
- **Convertir en hook** ce qui doit etre deterministe (ex: linter avant commit → hook `PreToolUse`)

### Temps total : ~40 min pour un projet existant

```
5 min   CLAUDE.md minimal
10 min  Exploration Claude + enrichissement CLAUDE.md
10 min  Rules path-scoped
15 min  2-3 skills
---
= 40 min pour un setup productif
```

Apres ca, chaque session demarre avec le bon contexte automatiquement. Les sessions suivantes sont 2-3x plus productives que sans setup.

---

## 9. Architecture recommandee pour un monorepo

```
monorepo/
  CLAUDE.md                         # Court (< 50 lignes) — conventions globales, pointeurs
  .claude/
    rules/
      git-workflow.md               # Sans paths: → toujours charge
      api-conventions.md            # paths: ["src/api/**"]
    skills/
      check-compat/SKILL.md         # context: fork, cross-repo
      debug-flow/SKILL.md           # Investigation multi-modules
    agents/
      code-reviewer.md              # model: sonnet, tools: Read, Grep, Glob
  frontend/
    CLAUDE.md                       # Stack frontend, commandes, conventions UI
    .claude/rules/
      react-patterns.md             # paths: ["src/**"]
  backend/
    CLAUDE.md                       # Stack backend, patterns API
    .claude/
      rules/
        database.md                 # paths: ["src/db/**"]
      skills/
        add-endpoint/SKILL.md       # disable-model-invocation: true
```

---

## Sources
- [Claude Code Best Practices](https://code.claude.com/docs/en/best-practices) — Anthropic (2026)
- [How Claude Remembers Your Project](https://code.claude.com/docs/en/memory) — Anthropic (2026)
- [Extend Claude with Skills](https://code.claude.com/docs/en/skills) — Anthropic (2026)
- [Create Custom Subagents](https://code.claude.com/docs/en/sub-agents) — Anthropic (2026)
- [Hooks Reference](https://code.claude.com/docs/en/hooks) — Anthropic (2026)
- [The Complete .claude Directory Guide](https://computingforgeeks.com/claude-code-dot-claude-directory-guide/) — computingforgeeks (2026)
- [CLAUDE.md Deep Dive](https://hannahstulberg.substack.com/p/claude-code-for-everything-the-best-personal-assistant-remembers-everything-about-you) — Hannah Stulberg (2026)
- [Agent Skills Specification](https://agentskills.io/specification) — agentskills.io (2026)
- [skills package](https://pub.dev/packages/skills) — Serverpod (2026)

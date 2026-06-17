# Audit — consommateurs sync `members` / `memberNav`

Date : 2026-06-17  
Contexte : Task 0 go/no-go Keystatic membres  
Commande : `rg "from.*members|memberNav" src config`

## Résultats

| Fichier | Import / usage | Task de migration |
|---------|----------------|-------------------|
| `config/content/navigation.ts` | `import { members } from "@config/content/members"` ; `export const memberNav` | **Task 7** |
| `src/components/nav/MemberNav.astro` | `import { memberNav } from "@config/content/navigation"` | **Task 7** |
| `src/utils/schema/index.ts` | `import { members } from "@config/content/members"` | **Task 8** |
| `src/pages/membres/index.astro` | `import { members } from "@config/content/members"` | **Task 14** |
| `src/pages/membres/[slug].astro` | `import { members } from "@config/content/members"` | **Task 14** |

**Total : 5 fichiers** (7 occurrences dans 5 fichiers) — conforme à l’état initial attendu.

## Gate post-Task 14

Ré-exécuter `rg "from.*members|memberNav" src config` : zéro import de l’export synchrone `members`.

## Décisions verrouillées (Task 0)

| Décision | Valeur |
|----------|--------|
| **Assets images** | `public/images/membres/` (pas `src/assets/`) |
| **getStaticPaths** | Strict — pas de `Astro.redirect('/404')` pour slug inconnu |
| **Contraintes MDX (`bio.mdx`)** | Pas d’imports internes ; pas de HTML brut (limitation Keystatic) |
| **MemberCoordonnees** | Inclut `websites[]` **et** `socialLinks[]` |

## Findings POC bi-fichier (Task 0)

### Build + `@keystatic/astro`

L’intégration Keystatic injecte des routes SSR (`/keystatic/*`, `/api/keystatic/*`). Avec `output: "static"` seul, `pnpm build` échoue (`NoAdapterInstalled`). **Mitigation appliquée :** `@astrojs/node` + `adapter: node({ mode: "standalone" })`. À formaliser en Task 1 si conservé.

### Structure disque bi-fichier (`path: 'content/membres-test/*/'`)

Pour une collection avec champs `document` + `mdx` séparés (sans `format.contentField`), Keystatic attend :

```
content/membres-test/{slug}/
  index.yaml          ← vide (requis pour la découverte reader)
  coordonnees.md      ← frontmatter YAML (slug, name, …)
  bio.mdx
```

Sans `index.yaml`, `reader.collections.*.list()` retourne `[]`.

### Reader API

- `read(slug, { resolveLinkedFiles: true })` retourne `bio` (string MDX) et `coordonnees` (corps document AST, souvent vide).
- Les champs structurés du frontmatter `coordonnees.md` ne sont **pas** exposés directement sur l’objet retourné sans `format.contentField` + `slugField` (pattern production Task 2). Le loader Task 6 utilisera `format: { contentField: 'coordonnees' }` + `slugField: 'slug'`.

### Validation reader (2026-06-17)

```
coordonnees frontmatter (from file): { slug: 'test-a', name: 'Test A' }
bio MDX: Paragraph de bio pour Test A — POC bi-fichier Keystatic.
OK: reader read('test-a') + coordonnees frontmatter + bio MDX
```

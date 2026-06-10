# Layout breakpoints et conteneurs — spec

**Date :** 2026-06-10  
**Statut :** approuvé pour implémentation

## Objectif

Centraliser breakpoints viewport, largeurs de conteneurs texte, gouttières horizontales et ratios d’images dans `config/design/layout.ts`, consommés par UnoCSS via `uno.config.ts`.

## Source de vérité

| Fichier | Contenu |
|---------|---------|
| `config/design/layout.ts` | `breakpoints`, `containers`, `containerPadding`, `aspectRatios`, helpers Uno |
| `config/design/spacing.ts` | `sp5` (1.25rem), `sp7` (1.75rem) pour gouttières `px-5` / `px-7` |
| `uno.config.ts` | Câblage `theme.breakpoints`, `theme.spacing`, shortcuts layout |

Pas de CSS vars layout (`--bp-*`, `--container-*`) en phase 1.

## Breakpoints viewport

| Token | Valeur |
|-------|--------|
| `sm` | 480px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

## Conteneurs texte

| Shortcut | max-width | padding |
|----------|-----------|---------|
| `container-prose` | 680px | `px-5 sm:px-7` |
| `container-page` | 900px | `px-5 sm:px-7` |
| `container-wide` | 1200px | `px-5 sm:px-7` |
| `container-full` | none | `px-5 sm:px-7` |

## Images

| Shortcut | Classes |
|----------|---------|
| `img-full` | `w-full` |
| `img-wide` | `w-full max-w-[1400px] mx-auto` |
| `ratio-cinema` | `aspect-[21/9]` |
| `ratio-wide` | `aspect-[16/9]` |
| `ratio-photo` | `aspect-[3/2]` |
| `ratio-square` | `aspect-square` |
| `ratio-portrait` | `aspect-[2/3]` |

## Règles éditoriales

- Texte → toujours dans un `container-*`
- Images → `img-full` / `img-wide`, jamais dans un `container-*`
- Header → `w-full` + enfant `container-wide`
- Bottom nav mobile → `fixed`, hors flux conteneurs

## Composants

- `Prose.astro` : `container-page` par défaut, `container-wide` si `wide`
- Mockup DS : `src/pages/_design-system.astro` (hors routing Astro)

## Hors scope (phase 1)

- `@custom-media` — phase 2 si CSS scoped avec `@media`
- `@container` — si composants réutilisables multi-contexte
- CSS vars layout

## Vérification

- `pnpm build` et `pnpm check` passent
- Pages légales utilisent `container-page`
- CSS généré contient `sm:px-7`

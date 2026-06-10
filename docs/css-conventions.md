# CSS et UnoCSS — conventions Dekamus

## Sources de vérité

| Fichier | Rôle |
|---------|------|
| [`config/design/colors.ts`](../config/design/colors.ts) | Tokens couleur OKLCH, `semanticColorsForUno()` |
| [`config/design/spacing.ts`](../config/design/spacing.ts) | Échelle d'espacement (`sp1`…`sp16` → `--sp-*`) |
| [`config/design/layout.ts`](../config/design/layout.ts) | Breakpoints, conteneurs, ratios images, shortcuts layout |
| [`src/styles/typography.css`](../src/styles/typography.css) | Classes `.t-h1`…`.t-mono-sm`, `.a-*` |
| [`uno.config.ts`](../uno.config.ts) | Utilitaires layout + couleurs sémantiques |

Les variables `--color-*` sont injectées par [`ColorsCSSVars.astro`](../src/components/utils/ColorsCSSVars.astro). Les tokens typo/espacement sont injectés par [`HeadDesign.astro`](../src/layouts/html-head/HeadDesign.astro).

## UnoCSS — utilitaires autorisés

- **Layout :** `flex`, `grid`, `gap-*`, `items-*`, `justify-*`
- **Espacement :** `p-*`, `m-*`, `px-*`, `py-*` (échelle 1–16 du thème, incl. `5` et `7` pour gouttières)
- **Taille :** `max-w-*`, `w-full`
- **Couleurs sémantiques :** `text-primary`, `bg-secondary`, `border-bdInfo`, opacité `/25`
- **Breakpoints :** `sm:`, `md:`, `lg:`, `xl:`, `2xl:` (voir `config/design/layout.ts`)
- **Shortcuts layout :** `container-prose`, `container-page`, `container-wide`, `container-full`, `img-full`, `img-wide`, `ratio-*`
- **Shortcuts stack :** `stack`, `stack-lg`, `stack-sm`

## Règles conteneurs

- **Texte** → toujours dans un `container-*` (`prose`, `page`, `wide`, `full`)
- **Images** → `img-full` / `img-wide` + `ratio-*`, jamais dans un `container-*`
- **Gouttières** → `px-5` (&lt; 480px), `px-7` ensuite (via shortcuts `container-*`)
- **Header** → `w-full` + enfant `container-wide`

Voir [`containerBreakpoints.md`](containerBreakpoints.md) pour le détail.

## Interdit

- Palette Tailwind par défaut (`text-blue-500`, `bg-gray-100`, etc.) — bloquée via `blocklist` dans `uno.config.ts`
- Couleurs arbitraires (`text-[#fff]`)
- Remplacer `.t-h1` par `text-4xl font-bold` sur les titres de marque
- Mettre une image dans un `container-*`

## Quand utiliser quoi

| Besoin | Approche |
|--------|----------|
| Page de contenu (légales, membres, 404) | [`Prose.astro`](../src/components/layout/Prose.astro) + classes `.t-*` |
| Article long / bio | `container-prose` ou `Prose` avec contenu étroit |
| Titres et corps éditoriaux | Classes `.t-h1`…`.t-body` |
| Grille / espacement rapide | Shortcuts Uno (`stack`, `container-page`) |
| Composant UI réutilisable | Astro component + `<style>` scoped |
| Mockup design system | [`_design-system.astro`](../src/pages/_design-system.astro) (hors routing) |

## Exemple

```astro
---
import Prose from "@components/layout/Prose.astro";
import { pages } from "@config/content/pages";
import { layoutProps } from "@utils/page-meta";
import Layout from "../layouts/Layout.astro";
---

<Layout {...layoutProps(pages.membres)}>
  <Prose>
    <h1 class="t-h2">Membres</h1>
    <section class="stack">
      <h2 class="t-h4">Bureau</h2>
      <p class="t-body">Description…</p>
    </section>
  </Prose>
</Layout>
```

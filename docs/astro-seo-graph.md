# astro-seo-graph — implémentation Dekamus

Documentation de l'intégration [`@jdevalk/astro-seo-graph`](https://github.com/jdevalk/seo-graph) sur [dekamus.fr](https://dekamus.fr).

## Vue d'ensemble

| Élément | Fichier / route |
|---------|-----------------|
| Config site | [`config/site.ts`](../config/site.ts) |
| Registry pages | [`config/pages.ts`](../config/pages.ts) |
| Membres démo | [`config/members.ts`](../config/members.ts) |
| Props layout | [`src/utils/page-meta.ts`](../src/utils/page-meta.ts) |
| Métadonnées head | [`src/utils/head-meta.ts`](../src/utils/head-meta.ts) |
| Graph JSON-LD | [`src/utils/schema/index.ts`](../src/utils/schema/index.ts) |
| Entités site-wide | [`src/utils/schema/site-wide.ts`](../src/utils/schema/site-wide.ts) |
| Shell page | [`src/layouts/Layout.astro`](../src/layouts/Layout.astro) → `<main>` + slot |
| Head | [`src/layouts/Head.astro`](../src/layouts/Head.astro) → `head/HeadSeo`, `HeadTheme`, `HeadFonts`, `BaseMeta` |
| Intégration build | [`astro.config.mjs`](../astro.config.mjs) → `seoGraph()` + `@astrojs/sitemap` |
| Sitemap | `/sitemap-index.xml` (généré au build) |
| robots.txt | [`public/robots.txt`](../public/robots.txt) |
| Headers CF Pages | [`public/_headers`](../public/_headers) |
| Schema endpoint | `/schema/page.json` |
| Schema map | `/schemamap.xml` |
| API catalog | `/.well-known/api-catalog` |
| llms.txt | `/llms.txt` (généré au build) |
| 404 + fuzzy match | [`src/pages/404.astro`](../src/pages/404.astro) |
| Image OG par défaut | [`public/og/default.jpg`](../public/og/default.jpg) |

## Dépendances

```json
"@jdevalk/astro-seo-graph": "^2.0.0",
"@jdevalk/seo-graph-core": "^0.6.2",
"@astrojs/sitemap": "^3.7.3"
```

## Configuration Astro

- `site: "https://dekamus.fr"` — origine canonique pour sitemaps, OG et JSON-LD `@id`
- `seoGraph()` active les validateurs build-time (H1, métadonnées, alt, liens internes) et génère `llms.txt`
- `@astrojs/sitemap` produit `sitemap-index.xml`

## Schéma structuré

Type de site : **Organization** (association), pas blog.

Entités site-wide (présentes sur chaque page) :

- `Organization` — Dekamus (adresse, contact, SIREN/SIRET, date de création)
- `WebSite` — publisher = Organization
- `SiteNavigationElement` — navigation principale (`navPages("main")`)
- `SiteNavigationElement` — navigation légale (`navPages("legal")`)

Par page :

- `WebPage` + `BreadcrumbList`

Le graph est assemblé via `assembleGraph({ warnOnDanglingReferences: true })`.

## Registry des pages (`config/pages.ts`)

Chaque page statique est déclarée une fois dans `pages` avec :

- `path`, `title`, `description` — métadonnées SERP (30–65 / 70–200 caractères)
- `titleNav` — libellé court pour fil d'Ariane et navigation JSON-LD
- `navGroup` — `"main"` ou `"legal"` pour les `SiteNavigationElement` site-wide
- `noindex` — exclure du sitemap (ex. 404)

Helpers : `getPage`, `getPageByPath`, `navPages`, `sitemapPages`.

Les profils membres démo vivent dans [`config/members.ts`](../config/members.ts) en attendant une collection de contenu.

`allSchemaPages()` (dans `src/utils/schema/index.ts`) agrège `sitemapPages()` + routes `/membres/{slug}` pour l'endpoint `/schema/page.json`.

## Layout et head

- `Layout.astro` — shell HTML (`<main>` unique, `ThemeToggle`, slot)
- `Head.astro` — orchestre le `<head>` (ordre : thème → meta de base → SEO → polices)
- `resolveHeadMeta()` — titre formaté + JSON-LD via `buildSchemaGraph`

Les pages ne déclarent plus de `<main>` : le contenu est injecté dans celui du layout.

## Utilisation dans une page

```astro
---
import { pages } from "@config/pages";
import { layoutProps } from "@utils/page-meta";
import Layout from "../layouts/Layout.astro";

const meta = pages.mentionsLegales;
---

<Layout {...layoutProps(meta)}>
  <h1>Mentions légales</h1>
</Layout>
```

- Si `title` est omis → titre du site (`siteConfig.title`)
- Si `title` est personnalisé → format `Titre | Dekamus`
- `noindex={true}` pour les pages utilitaires (ex. 404 via `pages.notFound`)

## Routes agent-discovery

| Route | Rôle |
|-------|------|
| `/schema/page.json` | JSON-LD corpus de `allSchemaPages()` (registry + profils membres) |
| `/schemamap.xml` | Index des endpoints schema |
| `/.well-known/api-catalog` | Catalogue RFC 9727 |

`robots.txt` référence le sitemap et le schemamap. `Content-Signal` déclare la politique IA.

## Déploiement Cloudflare Pages

[`public/_headers`](../public/_headers) :

- `Link` header sur `/*` pour la découverte agent
- `Cache-Control: immutable` sur `/_astro/*`

## Reporté à plus tard

Quand les vraies pages et/ou un blog seront en place :

- Collections de contenu + `seoSchema` / `imageSchema` (Zod)
- Endpoint `/schema/post.json` pour le blog
- Flux RSS (`@astrojs/rss`)
- Images OG générées au build (satori + sharp)
- `markdownAlternate: true` + routes `.md`
- IndexNow (clé `INDEXNOW_KEY` + route de vérification, gated sur `CF_PAGES_BRANCH=main`)
- Inscription Google Search Console / Bing Webmaster Tools

### IndexNow (quand prêt)

```js
// astro.config.mjs
indexNow:
  process.env.CF_PAGES_BRANCH === "main" && process.env.INDEXNOW_KEY
    ? {
        key: process.env.INDEXNOW_KEY,
        host: "dekamus.fr",
        siteUrl: "https://dekamus.fr",
      }
    : undefined,
```

Ajouter la variable `INDEXNOW_KEY` dans les paramètres Cloudflare Pages et décommenter la ligne `IndexNow:` dans `robots.txt`.

## Vérification

```sh
pnpm build
```

Contrôles post-build :

- `dist/index.html` — canonical, OG, JSON-LD `@graph`
- `dist/sitemap-index.xml`, `dist/llms.txt`, `dist/schemamap.xml`
- [Rich Results Test](https://search.google.com/test/rich-results) sur la homepage

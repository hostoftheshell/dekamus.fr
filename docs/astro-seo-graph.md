# astro-seo-graph — implémentation Dekamus

Documentation de l'intégration [`@jdevalk/astro-seo-graph`](https://github.com/jdevalk/seo-graph) sur [dekamus.fr](https://dekamus.fr).

## Vue d'ensemble

| Élément | Fichier / route |
|---------|-----------------|
| Config site | [`config/site.ts`](../config/site.ts) |
| Graph JSON-LD | [`src/utils/schema/index.ts`](../src/utils/schema/index.ts) |
| Head SEO | [`src/layouts/Layout.astro`](../src/layouts/Layout.astro) → `<Seo>` |
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

- `Organization` — Dekamus
- `WebSite` — publisher = Organization
- `SiteNavigationElement` — navigation (Accueil pour l'instant)

Par page :

- `WebPage` + `BreadcrumbList`

Le graph est assemblé via `assembleGraph({ warnOnDanglingReferences: true })`.

## Utilisation dans une page

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout
  title="Titre de la page"
  description="Description unique de 70 à 200 caractères pour le SERP."
>
  <h1>Titre de la page</h1>
</Layout>
```

- Si `title` est omis → titre du site (`siteConfig.title`)
- Si `title` est personnalisé → format `Titre | Dekamus`
- `noindex={true}` pour les pages utilitaires (ex. 404)

## Routes agent-discovery

| Route | Rôle |
|-------|------|
| `/schema/page.json` | JSON-LD corpus des pages statiques listées dans `staticPages` |
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

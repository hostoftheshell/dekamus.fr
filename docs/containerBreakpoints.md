## Révision des conteneurs

Le principe fondamental à intégrer : **les conteneurs s'appliquent au texte, jamais aux images**. Les images ont leur propre logique de ratio, pas de `max-w`.

***

## Conteneurs révisés

```js
shortcuts: {
  // Texte long — articles blog, bio textuelle (~65 caractères par ligne)
  "container-prose": "mx-auto w-full max-w-[680px] px-7",

  // Pages standard — membres, projets avec mix texte/media  
  "container-page": "mx-auto w-full max-w-[900px] px-7",

  // Layouts larges — grilles de cards, listes
  "container-wide": "mx-auto w-full max-w-[1200px] px-7",

  // Pleine largeur — texte de section large (titres, intros)
  "container-full": "w-full px-7",

  // Images — ZERO padding, ZERO max-w, toujours full-bleed
  "img-full": "w-full",
  "img-wide": "w-full max-w-[1400px] mx-auto",  // pour les très grands écrans
}
```

Le `px-7` (28px) unifié partout sauf sur les images — cohérence visuelle garantie.

***

## Ratios d'images fixes

```js
// À ajouter dans les shortcuts UnoCSS
"ratio-cinema":  "aspect-[21/9]",   // hero, covers blog
"ratio-wide":    "aspect-[16/9]",   // vidéos, galeries
"ratio-photo":   "aspect-[3/2]",    // covers articles, cards membres
"ratio-square":  "aspect-square",   // avatars, thumbnails
"ratio-portrait":"aspect-[2/3]",    // portraits membres
```

***

## Breakpoints

```js
// uno.config.ts
theme: {
  breakpoints: {
    'sm':  '480px',   // grands mobiles
    'md':  '768px',   // tablettes / fin du mobile
    'lg':  '1024px',  // desktop standard
    'xl':  '1280px',  // desktop large
    '2xl': '1536px',  // très grands écrans
  }
}
```

### Logique par breakpoint

| Breakpoint | Contexte | Comportement clé |
|---|---|---|
| `< 480px` | Mobile S | `container-*` → `px-5` (20px), 1 colonne |
| `480–768px` | Mobile L / Phablet | `px-7` (28px), 1 colonne, images full-bleed |
| `768–1024px` | Tablette | 2 colonnes possibles, nav desktop |
| `1024–1280px` | Desktop | Conteneurs à leur taille cible |
| `> 1280px` | Large desktop | Conteneurs fixés — le fond "respire" autour |

***

## Le pattern full-bleed en pratique

```astro
<!-- Cover article — image saigne, titre dans conteneur -->
<figure class="img-full ratio-cinema">
  <img src={cover} alt={title} class="w-full h-full object-cover" />
</figure>

<div class="container-prose py-10">
  <h1>{title}</h1>
  <p>{intro}</p>
</div>

<!-- Image dans l'article qui "casse" le conteneur prose -->
<figure class="img-full ratio-wide my-8">
  <img src={img} alt={caption} class="w-full h-full object-cover" />
</figure>

<div class="container-prose">
  <!-- suite du texte -->
</div>
```

***

## Règle simple à retenir

```
Texte    → toujours dans un container-*  (prose / page / wide)
Images   → jamais dans un container-*   (img-full ou img-wide)
Padding  → toujours px-7 sur le texte   (jamais sur les images)
```

***

## Le header est `container-full` en largeur, avec un conteneur interne

```
┌──────────────────────────────────────────────┐  ← header full-bleed (w-full)
│  [Logo]        Accueil  Membres  Projets  Blog│  ← contenu dans container-wide
└──────────────────────────────────────────────┘
```

Le header lui-même occupe **toute la largeur** (`w-full`) — il ne doit pas être contraint par un `max-w`. Mais son contenu intérieur est aligné avec le reste de la page via `container-wide`.

***

## Pourquoi `container-wide` et pas `container-page` ?

Sur un grand écran, si le corps de ta page est en `container-wide` (`max-w-[1200px]`), le logo et les liens de navigation doivent être **alignés avec les bords de ce conteneur** — sinon le logo flotte à gauche pendant que le contenu commence plus à droite. Visuellement incohérent.

***

## En pratique

```astro
<!-- Header.astro -->
<header class="w-full sticky top-0 z-50 backdrop-blur-sm">
  <div class="container-wide flex items-center justify-between py-4">
    <a href="/" class="logo">Dekamus</a>
    <nav class="hidden md:flex gap-8">
      <!-- liens desktop -->
    </nav>
  </div>
</header>
```

***

## Mobile — bottom bar

La bottom nav est **hors du flux des conteneurs** — elle est positionnée en `fixed` indépendamment :

```astro
<!-- BottomNav.astro — mobile uniquement -->
<nav class="md:hidden fixed bottom-0 left-0 w-full z-50">
  <!-- 4 items pleine largeur -->
</nav>
```

```
Conteneurs de page  →  gèrent le contenu scrollable
Bottom bar          →  fixed, hors flux, toujours visible
```

***

## Résumé

| Élément | Largeur | Conteneur interne |
|---|---|---|
| Header desktop | `w-full` | `container-wide` |
| Bottom nav mobile | `w-full fixed` | aucun — items en `flex justify-around` |
| Contenu des pages | selon le type | `container-prose` / `page` / `wide` |
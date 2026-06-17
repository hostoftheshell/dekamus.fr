# Composants MDX bio — mapping Keystatic

Contraintes `bio.mdx` : pas d'imports internes, pas de HTML brut (limitation Keystatic).

| Keystatic block | Composant Astro | Props |
|----------------|-----------------|-------|
| `VideoEmbed` | `VideoEmbed.astro` | `platform`, `url`, `src`, `title` |
| `AudioPlayer` | `AudioPlayer.astro` | `platform`, `embedUrl`, `src`, `title` |
| `Carousel` | `Carousel.astro` | `images[]`, `id?` |
| `MiniGallery` | `MiniGallery.astro` | `images[]`, `columns?` |

Schéma source : `keystatic.config.ts` → `mdxComponentBlocks`.

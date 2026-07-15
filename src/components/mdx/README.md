# Composants MDX bio — mapping Keystatic

Contraintes `bio.mdx` : pas d'imports internes, pas de HTML brut (limitation Keystatic).

| Keystatic block | Composant Astro | Props |
|----------------|-----------------|-------|
| `VideoEmbed` | `VideoEmbed.astro` | `source` (conditional Keystatic) ou legacy `platform`, `url`, `src` ; `title` |
| `AudioPlayer` | `AudioPlayer.astro` | `source` (conditional Keystatic) ou legacy `platform`, `embedUrl`, `src`, `vttSrc?` ; `title`, `transcriptUrl?` |
| `Carousel` | `Carousel.astro` | `images[]`, `id?` |
| `MiniGallery` | `MiniGallery.astro` | `images[]`, `columns?` |

Modes hébergés (`hosted`) : upload Keystatic via `fields.file` → fichiers dans `public/audio/membres/` et `public/videos/membres/`.

Schéma source : `keystatic.config.ts` → `mdxComponentBlocks`. Normalisation conditional : `src/utils/media/resolveKeystaticSource.ts`.

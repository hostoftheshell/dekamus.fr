# AudioPlayer accessibilité — Design Spec

**Date :** 2026-06-19  
**Statut :** approuvé — implémenté  
**Périmètre :** composant MDX `AudioPlayer` et bloc Keystatic associé

## Objectif

Améliorer l’accessibilité du composant audio sans rendre le travail éditorial bloquant. Les éditeurs peuvent renseigner un fichier WebVTT pour les fichiers audio hébergés et/ou une transcription textuelle pour tous les types d’audio. Ces champs restent optionnels : un contenu existant sans VTT ni transcription doit continuer à s’afficher comme aujourd’hui.

## Décisions validées

| Sujet | Choix |
| ------- | ------- |
| Saisie Keystatic | Deux champs simples à saisir : `vttSrc` et `transcriptUrl` |
| Obligatoire | Aucun des deux champs n’est requis |
| Audio hébergé | `vttSrc` ajoute une piste WebVTT et une zone de captions visible |
| Embeds externes | Pas d’injection de captions dans l’iframe ; seul `transcriptUrl` est contrôlé |
| Fallback | Si les champs sont vides, le rendu actuel reste inchangé |

## Architecture

`src/components/mdx/AudioPlayer.astro` étend ses props avec `vttSrc?: string` et `transcriptUrl?: string`. Le rendu reste conditionnel :

- `platform !== "hosted"` et `embedUrl` valide : rendu iframe existant, plus lien de transcription si `transcriptUrl` est renseigné.
- `platform === "hosted"` et `src` renseigné : rendu `<audio>` existant, plus `<track kind="captions">` et zone de captions seulement si `vttSrc` est renseigné.
- Source invalide : message existant `Source audio invalide.`, plus aucun lien accessoire.

`keystatic.config.ts` ajoute les mêmes champs dans `mdxComponentBlocks.AudioPlayer` avec des labels explicites. Ils restent des champs texte/URL pour éviter d’imposer un flux d’upload ou de gestion d’assets dans cette itération.

## Comportement attendu

Un éditeur peut continuer à créer un bloc audio avec seulement `platform`, `embedUrl` ou `src`, et `title`. Si `vttSrc` est absent, aucun `<track>` n’est rendu et aucun script de captions n’est actif. Si `transcriptUrl` est absent, aucun `<figcaption>` de transcription n’est rendu.

Pour un fichier audio hébergé avec `vttSrc`, le navigateur reçoit une piste WebVTT native. Comme les captions audio ne sont pas affichées visuellement de façon fiable par les navigateurs, un petit script lit les cues actifs et les affiche dans une zone sous le lecteur. La zone est créée seulement quand `vttSrc` existe.

Pour les embeds Spotify, Deezer, SoundCloud, Radio France et Arte, le composant ne tente pas de modifier le contenu cross-origin. La transcription textuelle est donc le fallback éditorial maîtrisé.

## Gestion d’erreurs

Le composant ne valide pas l’existence réseau des fichiers `.vtt` ou des transcriptions. Un chemin faux ne bloque pas le build ; il produit seulement une ressource introuvable côté navigateur. Les labels Keystatic doivent expliquer que l’éditeur saisit un chemin public ou une URL.

## Tests et vérifications

Vérifier manuellement trois cas :

- hosted sans `vttSrc` ni `transcriptUrl` : rendu identique à l’existant.
- hosted avec `vttSrc` et `transcriptUrl` : `<track>` présent, zone de captions affichée, lien de transcription visible.
- embed avec `transcriptUrl` : iframe inchangée, lien de transcription visible, aucune zone de captions.

Exécuter ensuite les contrôles projet habituels (`pnpm check` et, si rapide, `pnpm build`).

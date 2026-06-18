# Membres Keystatic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gérer les profils membres via Keystatic (`content/membres/{slug}/coordonnees.md` + `bio.mdx`), avec loader async, page unique par membre, et composants MDX (vidéo, audio, carrousel, mini galerie).

**Architecture:** Schéma unique dans `keystatic.config.ts`, lecture via `createReader`, `config/content/members.ts` expose `getMembers()` / `getMemberBySlug()`. `MemberShell` structure la page ; `MemberCoordonnees` rend les champs structurés ; la bio MDX utilise des component blocks Keystatic mappés vers des composants Astro dans `src/components/mdx/`.

**Tech Stack:** Astro 6, Keystatic (`@keystatic/core`, `@keystatic/astro`), `@astrojs/mdx`, TypeScript, UnoCSS, stockage local (GitHub plus tard).

**Spec:** [`docs/superpowers/specs/2026-06-17-keystatic-members-design.md`](../specs/2026-06-17-keystatic-members-design.md)

> **Bloquant :** ne pas démarrer Task 1 tant que Task 0 (go/no-go) n’est pas entièrement validée.

## Exécution subagent — gates de validation

Pour chaque task (0 → 15), le contrôleur enchaîne :

1. **Implementer** — subagent dédié, contexte isolé, commit à la fin
2. **Revue spec** — conformité au plan + spec (ex. `websites[]` présent partout où `socialLinks[]` l’est)
3. **Revue qualité** — patterns projet, pas de regex dispersées, a11y si composant interactif
4. **Gate runtime** (selon task) :

| Après task | Validation obligatoire |
|------------|------------------------|
| **0** | `pnpm build` POC bi-fichier OK ; audit `rg` documenté |
| **2** | Admin `/keystatic` charge ; pas de `formatting: { data: "yaml" }` |
| **6** | `getMembers` log une seule fois par build |
| **9b** | `normalizeEmbed` testé manuellement (tel + YouTube) |
| **14** | `rg` zéro import sync `members` ; pages alice/brice buildent |
| **15** | `pnpm check` + `pnpm build` verts ; admin création membre |

Ne pas passer à la task suivante si une revue spec ou un gate runtime échoue.

---

## Pre-implementation gates (Task 0)

**Objectif :** valider les risques runtime **avant** d’écrire la première ligne de code de production. Référence : section « Checklist go/no-go » de la spec.

**Files:** (temporaires — supprimer ou intégrer au seed après validation)

- [ ] **Step 1: POC bi-fichier Keystatic**

Créer un `keystatic.config.ts` minimal avec une collection test :

- `path: 'content/membres-test/*/'`
- `coordonnees: fields.document({ schema: { slug, name } })`
- `bio: fields.mdx({ label: 'Bio' })`

Ajouter deux entrées (`test-a/`, `test-b/`) avec `coordonnees.md` + `bio.mdx` chacune.

```bash
pnpm build
```

Expected: build passe ; `reader.collections.membres-test.read('test-a')` retourne coordonnees (frontmatter) et bio (MDX) sans erreur.

- [ ] **Step 2: Audit consommateurs sync**

```bash
rg "from.*members|memberNav" src config
```

Expected (état initial) — 5 fichiers à migrer :

| Fichier | Task de migration |
|---------|-------------------|
| `config/content/navigation.ts` | Task 7 |
| `src/components/nav/MemberNav.astro` | Task 7 |
| `src/utils/schema/index.ts` | Task 8 |
| `src/pages/membres/index.astro` | Task 14 |
| `src/pages/membres/[slug].astro` | Task 14 |

Ré-auditer après Task 14 : zéro import de l’export synchrone `members`.

- [ ] **Step 3: Documenter les décisions verrouillées**

Confirmer dans ce plan (déjà présent) :

- Assets → `public/images/membres/` (pas `src/assets/`)
- `getStaticPaths` strict — pas de `Astro.redirect('/404')`
- Contraintes MDX documentées (Task 2 commentaire + Task 14 README)

- [ ] **Step 4: Nettoyer le POC**

Supprimer `content/membres-test/` et la collection test du config, ou réutiliser le schéma final en Task 2.

---

## Dettes acceptées — phase 1

| Dette | Mitigation dans le plan |
|-------|-------------------------|
| Double déclaration composants MDX | Commentaire `// SYNC WITH keystatic.config.ts` sur chaque `.astro` MDX |
| Types manuels | `// WARNING: sync with keystatic.config.ts` dans `member.d.ts` (Task 4) |
| Pas de brouillon | Note dans commentaire `keystatic.config.ts` |
| Git LFS | `// TODO: activer Git LFS` dans `keystatic.config.ts` (Task 2) |
| Bascule GitHub | Commentaire sur GitHub App requis (Task 2) |

---

## File map

| File | Responsibility |
|------|----------------|
| `keystatic.config.ts` | Schéma collection `membres`, component blocks bio, storage local, commentaires contraintes |
| `src/keystatic/reader.ts` | Instance `createReader` partagée |
| `config/types/content/member.d.ts` | Types `Member`, `MemberCoordonnees`, etc. (sync manuel) |
| `config/content/members.ts` | `getMembers()` / `getMemberBySlug()` avec cache module-level |
| `src/utils/media/normalizeEmbed.ts` | Normalisation tel + URLs embed vidéo/audio |
| `config/content/navigation.ts` | `buildMemberNav(members)` |
| `src/components/layout/MemberShell.astro` | Layout interne page membre |
| `src/components/members/MemberCoordonnees.astro` | Rendu coordonnées structurées |
| `src/components/mdx/*.astro` | Blocs MDX bio (importent `normalizeEmbed.ts` uniquement) |
| `src/components/mdx/README.md` | Mapping Keystatic component blocks ↔ props Astro |
| `src/components/nav/MemberNav.astro` | Nav membres via prop `items` |
| `src/pages/membres/[slug].astro` | Page membre complète |
| `src/pages/membres/index.astro` | Liste async |
| `src/utils/schema/index.ts` | SEO async-friendly |
| `astro.config.mjs` | Intégrations Keystatic + MDX |
| `content/membres/alice/`, `brice/` | Contenu seed |

---

### Task 1: Installer les dépendances Keystatic et MDX

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Installer les paquets**

```bash
pnpm add @keystatic/core @keystatic/astro @astrojs/mdx @astrojs/node
```

Expected: packages added to `dependencies` in `package.json`.

- [ ] **Step 2: Ajouter les intégrations Astro**

Dans `astro.config.mjs`, ajouter en tête :

```js
import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import keystatic from "@keystatic/astro";
```

Et dans `integrations` :

```js
mdx(),
keystatic(),
```

> **Task 0 finding :** `@keystatic/astro` injecte des routes SSR (`/keystatic/*`). Stratégie **Cloudflare Pages** (phase 1, storage local) :

```js
const enableKeystatic = process.env.SKIP_KEYSTATIC !== "true";

export default defineConfig({
  output: "static",
  ...(enableKeystatic ? { adapter: node({ mode: "standalone" }) } : {}),
  integrations: [
    mdx(),
    ...(enableKeystatic ? [keystatic()] : []),
    // …
  ],
});
```

Scripts `package.json` :

```json
"build": "SKIP_KEYSTATIC=true astro build",
"build:with-keystatic": "astro build"
```

- `pnpm dev` → admin Keystatic actif (adapter Node)
- `pnpm build` → site statique pur pour Cloudflare Pages (pas de `dist/server/`)
- `pnpm build:with-keystatic` → build avec routes admin (preview local)

Recette : [Keystatic — Disable Admin UI in Production](https://keystatic.com/docs/recipes/astro-disable-admin-ui-in-production)

- [ ] **Step 3: Vérifier dev et build prod**

```bash
pnpm dev
# → http://localhost:4321/keystatic accessible

pnpm build
# → Complete! sans dist/server/
```

Expected: serveur dev démarre ; build prod 100 % statique.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs
git commit -m "chore: add Keystatic and MDX integrations"
```

---

### Task 2: Configurer Keystatic — collection membres

**Files:**
- Create: `keystatic.config.ts`

- [ ] **Step 1: Créer `keystatic.config.ts`**

```ts
// keystatic.config.ts
//
// Contraintes bio.mdx (Keystatic) : pas d'imports internes, pas de HTML brut.
// Publication : toute sauvegarde admin est publiée au prochain build (pas de brouillon).
// TODO: activer Git LFS sur public/videos/ et public/audio/ avant bascule GitHub.
// Bascule github : nécessite GitHub App + repo + branch (pas seulement des env vars).

import { config, collection, fields, component } from "@keystatic/core";

const imageDirectory = "public/images/membres";
const imagePublicPath = "/images/membres/";

const coordonneesSchema = {
	slug: fields.slug({
		name: { label: "Nom (slug)" },
	}),
	name: fields.text({ label: "Nom affiché" }),
	role: fields.text({ label: "Rôle" }),
	title: fields.text({ label: "Titre SEO" }),
	description: fields.text({ label: "Description SEO", multiline: true }),
	titleNav: fields.text({ label: "Titre navigation" }),
	email: fields.text({ label: "Email" }),
	phone: fields.text({ label: "Téléphone" }),
	address: fields.object(
		{
			street: fields.text({ label: "Rue" }),
			postalCode: fields.text({ label: "Code postal" }),
			city: fields.text({ label: "Ville" }),
		},
		{ label: "Adresse" },
	),
	socialLinks: fields.array(
		fields.object({
			label: fields.text({ label: "Libellé" }),
			url: fields.url({ label: "URL" }),
		}),
		{
			label: "Réseaux sociaux",
			itemLabel: (props) => props.fields.label.value || "Lien",
		},
	),
	websites: fields.array(
		fields.object({
			label: fields.text({ label: "Libellé" }),
			url: fields.url({ label: "URL" }),
		}),
		{
			label: "Sites web",
			itemLabel: (props) => props.fields.label.value || "Site",
		},
	),
};

const mdxComponentBlocks = {
	VideoEmbed: component({
		label: "Vidéo",
		schema: {
			platform: fields.select({
				label: "Plateforme",
				options: [
					{ label: "YouTube", value: "youtube" },
					{ label: "Vimeo", value: "vimeo" },
					{ label: "Dailymotion", value: "dailymotion" },
					{ label: "Fichier MP4 (public/)", value: "hosted" },
				],
				defaultValue: "youtube",
			}),
			url: fields.url({ label: "URL (embed ou page)" }),
			src: fields.text({
				label: "Chemin public MP4 (ex. /videos/membres/foo.mp4)",
			}),
			title: fields.text({ label: "Titre accessible" }),
		},
	}),
	AudioPlayer: component({
		label: "Audio",
		schema: {
			platform: fields.select({
				label: "Plateforme",
				options: [
					{ label: "Spotify", value: "spotify" },
					{ label: "Deezer", value: "deezer" },
					{ label: "SoundCloud", value: "soundcloud" },
					{ label: "Radio France", value: "radio-france" },
					{ label: "Arte Radio", value: "arte" },
					{ label: "Fichier MP3 (public/)", value: "hosted" },
				],
				defaultValue: "spotify",
			}),
			embedUrl: fields.url({ label: "URL iframe embed" }),
			src: fields.text({
				label: "Chemin public MP3 (ex. /audio/membres/foo.mp3)",
			}),
			title: fields.text({ label: "Titre accessible" }),
		},
	}),
	Carousel: component({
		label: "Carrousel",
		schema: {
			images: fields.array(
				fields.object({
					src: fields.text({ label: "Chemin image (ex. /images/membres/a.jpg)" }),
					alt: fields.text({ label: "Texte alternatif" }),
					caption: fields.text({ label: "Légende (optionnel)" }),
				}),
				{ label: "Images", itemLabel: (props) => props.fields.alt.value || "Image" },
			),
		},
	}),
	MiniGallery: component({
		label: "Mini galerie",
		schema: {
			columns: fields.integer({
				label: "Colonnes",
				defaultValue: 3,
				validation: { min: 1, max: 6 },
			}),
			images: fields.array(
				fields.object({
					src: fields.text({ label: "Chemin image" }),
					alt: fields.text({ label: "Texte alternatif" }),
					caption: fields.text({ label: "Légende (optionnel)" }),
				}),
				{ label: "Images", itemLabel: (props) => props.fields.alt.value || "Image" },
			),
		},
	}),
};

export default config({
	storage: {
		kind: "local",
	},
	collections: {
		membres: collection({
			label: "Membres",
			slugField: "slug",
			path: "content/membres/*/",
			// Pas de format.contentField — voir audit Task 2 (seed manuel + reader.list)
			schema: {
				coordonnees: fields.document({
					label: "Coordonnées",
					schema: coordonneesSchema,
				}),
				bio: fields.mdx({
					label: "Bio",
					options: {
						image: {
							directory: imageDirectory,
							publicPath: imagePublicPath,
						},
						components: mdxComponentBlocks,
					},
				}),
			},
		}),
	},
});
```

- [ ] **Step 2: Créer les dossiers assets**

```bash
mkdir -p public/images/membres public/videos/membres public/audio/membres content/membres
```

- [ ] **Step 3: Vérifier l’admin Keystatic**

```bash
pnpm dev
```

Ouvrir `http://localhost:4321/keystatic` — la collection « Membres » doit apparaître.

- [ ] **Step 4: Commit**

```bash
git add keystatic.config.ts
git commit -m "feat: add Keystatic membres collection schema"
```

---

### Task 3: Reader Keystatic

**Files:**
- Create: `src/keystatic/reader.ts`

- [ ] **Step 1: Créer le reader**

```ts
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

export const reader = createReader(process.cwd(), keystaticConfig);
```

- [ ] **Step 2: Commit**

```bash
git add src/keystatic/reader.ts
git commit -m "feat: add Keystatic reader singleton"
```

---

### Task 4: Étendre les types membres

**Files:**
- Modify: `config/types/content/member.d.ts`

- [ ] **Step 1: Remplacer le contenu de `member.d.ts`**

```ts
/* config/types/content/member.d.ts */
// WARNING: sync with keystatic.config.ts — resynchroniser à chaque changement de champ.

export interface MemberAddress {
	street: string;
	postalCode: string;
	city: string;
}

export interface MemberSocialLink {
	label: string;
	url: string;
}

export interface MemberWebsite {
	label: string;
	url: string;
}

export interface MemberCoordonnees {
	email: string;
	phone: string;
	address: MemberAddress;
	socialLinks: MemberSocialLink[];
	websites: MemberWebsite[];
}

export interface MemberProfile {
	slug: string;
	name: string;
	role: string;
	title: string;
	description: string;
	titleNav?: string;
}

export interface Member extends MemberProfile {
	coordonnees: MemberCoordonnees;
}
```

- [ ] **Step 2: Vérifier les types**

```bash
pnpm check
```

Expected: PASS (aucune régression sur les imports `MemberProfile`).

- [ ] **Step 3: Commit**

```bash
git add config/types/content/member.d.ts
git commit -m "feat: extend member types for coordonnees"
```

---

### Task 5: Seeder le contenu alice et brice

**Files:**
- Create: `content/membres/alice/coordonnees.md`
- Create: `content/membres/alice/bio.mdx`
- Create: `content/membres/alice/index.yaml`
- Create: `content/membres/brice/coordonnees.md`
- Create: `content/membres/brice/bio.mdx`
- Create: `content/membres/brice/index.yaml`

> **Task 0 finding :** avec `path: 'content/membres/*/'` et champs `document` + `mdx` séparés, Keystatic exige un `index.yaml` vide par dossier membre pour que `reader.collections.membres.list()` découvre les entrées.

- [ ] **Step 1: Créer `content/membres/alice/index.yaml` et `brice/index.yaml`**

Fichiers vides (ou commentaire YAML minimal) :

```yaml
# Keystatic entry marker — required for reader discovery
```

- [ ] **Step 2: Créer `content/membres/alice/coordonnees.md`**

```yaml
---
slug: alice
name: Alice Martin
role: Présidente
title: Alice Martin — Présidente de Dekamus
description: >-
  Profil d'Alice Martin, présidente de l'association Dekamus : rôle au sein
  du bureau et informations de contact publiques.
titleNav: Alice Martin
email: alice.martin@dekamus.fr
phone: ""
address:
  street: ""
  postalCode: ""
  city: ""
socialLinks: []
websites: []
---
```

- [ ] **Step 3: Créer `content/membres/alice/bio.mdx`**

```mdx
Alice Martin préside l'association Dekamus. Cette bio pourra accueillir des blocs riches (vidéo, audio, carrousel, galerie).

<VideoEmbed platform="youtube" url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" title="Vidéo de test Alice" />
```

> Block factice pour valider la chaîne Keystatic → MDX → Astro. Remplacer par du contenu réel plus tard.

- [ ] **Step 4: Créer `content/membres/brice/coordonnees.md`**

```yaml
---
slug: brice
name: Brice Dupont
role: Trésorier
title: Brice Dupont — Trésorier de Dekamus
description: >-
  Profil de Brice Dupont, trésorier de l'association Dekamus : missions,
  responsabilités et coordonnées accessibles aux membres.
titleNav: Brice Dupont
email: brice.dupont@dekamus.fr
phone: ""
address:
  street: ""
  postalCode: ""
  city: ""
socialLinks: []
websites: []
---
```

- [ ] **Step 5: Créer `content/membres/brice/bio.mdx`**

```mdx
Brice Dupont assure la trésorerie de l'association Dekamus.

<Carousel images={[{ src: "/images/membres/placeholder.jpg", alt: "Photo de test Brice" }]} />
```

> Utiliser une image placeholder ou retirer le block si l’asset n’existe pas encore — l’objectif est de valider le rendu component block.

- [ ] **Step 6: Checklist migration**

| Critère | Statut attendu |
|---------|----------------|
| Slugs `alice` / `brice` | Identiques à l’ancien `members.ts` |
| SEO `title`, `description`, `titleNav` | Recopiés à l’identique |
| `socialLinks` | `[]` explicite (pas `undefined`) |
| `websites` | `[]` explicite (pas `undefined`) |
| Component block dans bio | Au moins un par membre |
| Ancien export sync | Sera supprimé en Task 6 |

- [ ] **Step 7: Commit**

```bash
git add content/membres/
git commit -m "content: seed alice and brice member profiles"
```

---

### Task 6: Loader `getMembers` / `getMemberBySlug`

**Files:**
- Modify: `config/content/members.ts`
- Add dependency: `gray-matter` (parse frontmatter `coordonnees.md`)

> **Task 2 finding :** sans `format.contentField`, `entry.coordonnees()` retourne le corps document (AST), pas le frontmatter. Le loader lit `content/membres/{slug}/coordonnees.md` via `gray-matter`.

- [ ] **Step 1: Installer gray-matter**

```bash
pnpm add gray-matter
```

- [ ] **Step 2: Remplacer `config/content/members.ts`**

```ts
/* config/content/members.ts */

import matter from "gray-matter";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type {
	Member,
	MemberCoordonnees,
	MemberProfile,
} from "@config/types";
import { reader } from "../../src/keystatic/reader";

let membersCache: Member[] | null = null;

async function readCoordonneesFrontmatter(
	slug: string,
): Promise<Record<string, unknown> | null> {
	try {
		const path = join(process.cwd(), "content/membres", slug, "coordonnees.md");
		const raw = await readFile(path, "utf8");
		return matter(raw).data as Record<string, unknown>;
	} catch {
		return null;
	}
}

function toMemberProfile(
	slug: string,
	data: Record<string, unknown>,
): MemberProfile {
	return {
		slug,
		name: String(data.name ?? ""),
		role: String(data.role ?? ""),
		title: String(data.title ?? ""),
		description: String(data.description ?? ""),
		titleNav: data.titleNav ? String(data.titleNav) : undefined,
	};
}

function toCoordonnees(data: Record<string, unknown>): MemberCoordonnees {
	const address = (data.address ?? {}) as Record<string, string>;
	const socialLinks = Array.isArray(data.socialLinks)
		? data.socialLinks.map((link: Record<string, string>) => ({
				label: String(link.label ?? ""),
				url: String(link.url ?? ""),
			}))
		: [];
	const websites = Array.isArray(data.websites)
		? data.websites.map((site: Record<string, string>) => ({
				label: String(site.label ?? ""),
				url: String(site.url ?? ""),
			}))
		: [];

	return {
		email: String(data.email ?? ""),
		phone: String(data.phone ?? ""),
		address: {
			street: String(address.street ?? ""),
			postalCode: String(address.postalCode ?? ""),
			city: String(address.city ?? ""),
		},
		socialLinks,
		websites,
	};
}

export async function getMembers(): Promise<Member[]> {
	if (membersCache) return membersCache;

	const slugs = await reader.collections.membres.list();
	const members = await Promise.all(
		slugs.map(async (slug) => {
			const data = await readCoordonneesFrontmatter(slug);
			if (!data) return null;

			const profile = toMemberProfile(slug, data);

			return {
				...profile,
				coordonnees: toCoordonnees(data),
			} satisfies Member;
		}),
	);

	membersCache = members.filter((m): m is Member => m !== null);
	return membersCache;
}

export async function getMemberBySlug(
	slug: string,
): Promise<Member | undefined> {
	const members = await getMembers();
	return members.find((member) => member.slug === slug);
}

export async function getMemberProfiles(): Promise<MemberProfile[]> {
	const members = await getMembers();
	return members.map(({ coordonnees: _c, ...profile }) => profile);
}
```

- [ ] **Step 3: Vérifier le cache build-time**

Ajouter temporairement `console.log('[getMembers] filesystem read')` avant la lecture reader. Lancer `pnpm build`.

Expected: le log n’apparaît qu’**une fois** malgré les appels depuis plusieurs pages/composants.

Retirer le `console.log` avant commit.

- [ ] **Step 4: Vérifier le build (échouera tant que les consommateurs sync ne sont pas migrés — attendre Task 8)**

Note: ne pas considérer le build vert avant Task 8.

- [ ] **Step 4: Commit**

```bash
git add config/content/members.ts
git commit -m "feat: load members from Keystatic reader"
```

---

### Task 7: Refactor navigation membres

**Files:**
- Modify: `config/content/navigation.ts`
- Modify: `src/components/nav/MemberNav.astro`

- [ ] **Step 1: Modifier `navigation.ts`**

Remplacer l’import et l’export `memberNav` par :

```ts
export function buildMemberNav(members: MemberProfile[]): NavItem[] {
	return members.map(memberToNavItem);
}
```

Supprimer `import { members } from "@config/content/members"` et l’ancien `export const memberNav`.

- [ ] **Step 2: Modifier `MemberNav.astro`**

```astro
---
import type { NavItem } from "@config/types";
import NavLink from "./NavLink.astro";

interface Props {
	items: NavItem[];
	currentPath?: string;
}

const { items, currentPath } = Astro.props;
---

<nav aria-label="Navigation des membres">
	<ul class="flex flex-wrap items-center gap-x-4 gap-y-2">
		{items.map((item) => (
			<li>
				<NavLink {item} variant="member" {currentPath} activeClass="text-primary font-semibold" />
			</li>
		))}
	</ul>
</nav>
```

- [ ] **Step 3: Commit**

```bash
git add config/content/navigation.ts src/components/nav/MemberNav.astro
git commit -m "refactor: member nav built from async members list"
```

---

### Task 8: Refactor SEO schema

**Files:**
- Modify: `src/utils/schema/index.ts`

- [ ] **Step 1: Adapter les imports et signatures**

Remplacer `import { members }` par `import type { MemberProfile } from "@config/types"`.

Modifier `breadcrumbItems` :

```ts
function breadcrumbItems(
	url: string,
	title: string,
	members: MemberProfile[],
) {
	// ... même logique, param members au lieu de closure sur import
}
```

Modifier `buildSchemaGraph` et `buildPageSchemaPieces` pour accepter `members: MemberProfile[]` en paramètre optionnel ou obligatoire selon les appels existants — préférer ajouter `members` à `opts`.

Modifier `allSchemaPages` :

```ts
export function allSchemaPages(members: MemberProfile[]): Array<{
	path: string;
	title: string;
	description: string;
}> {
	return [
		...sitemapPages().map(/* inchangé */),
		...members.map((member) => ({
			path: `/membres/${member.slug}`,
			title: member.title,
			description: member.description,
		})),
	];
}
```

- [ ] **Step 2: Mettre à jour tous les appels à `buildSchemaGraph` / `allSchemaPages`**

Chercher les usages :

```bash
rg "buildSchemaGraph|allSchemaPages|buildPageSchemaPieces" src config
```

Passer `members` depuis les pages qui appellent ces fonctions (`await getMemberProfiles()`).

- [ ] **Step 3: Ré-auditer les imports sync**

```bash
rg "from.*members|export const members" src config
```

Expected après Tasks 7–8 : seuls `config/content/members.ts` et les pages membres (Task 14) peuvent encore référencer le module — pas d’import de l’export synchrone `members`.

- [ ] **Step 4: Commit**

```bash
git add src/utils/schema/index.ts
git commit -m "refactor: schema helpers accept members parameter"
```

---

### Task 9: `MemberShell` et `MemberCoordonnees`

**Files:**
- Create: `src/components/layout/MemberShell.astro`
- Create: `src/components/members/MemberCoordonnees.astro`

- [ ] **Step 1: Créer `MemberShell.astro`**

```astro
---
import Prose from "@components/layout/Prose.astro";
import MemberNav from "@components/nav/MemberNav.astro";
import type { MemberProfile, NavItem } from "@config/types";

interface Props {
	member: MemberProfile;
	memberNavItems: NavItem[];
	currentPath: string;
}

const { member, memberNavItems, currentPath } = Astro.props;
---

<Prose>
	<h1 class="t-h2">{member.name}</h1>
	<MemberNav items={memberNavItems} {currentPath} />
	<p class="t-body"><strong>{member.role}</strong></p>
	<slot name="coordonnees" />
	<slot name="bio" />
	<p class="t-body">
		<a href="/membres/">Retour à la liste des membres</a>
	</p>
</Prose>
```

- [ ] **Step 2: Créer `MemberCoordonnees.astro`**

```astro
---
import type { MemberCoordonnees } from "@config/types";
import { normalizeTel } from "@utils/media/normalizeEmbed";

interface Props {
	coordonnees: MemberCoordonnees;
}

const { coordonnees } = Astro.props;
const { email, phone, address, socialLinks, websites } = coordonnees;
const telHref = phone ? normalizeTel(phone) : null;
const hasAddress =
	address.street || address.postalCode || address.city;
---

<section class="stack-sm" aria-labelledby="coordonnees-heading">
	<h2 id="coordonnees-heading" class="t-h3">Coordonnées</h2>
	<ul class="stack-sm t-body list-none p-0">
		{email && (
			<li>
				<a href={`mailto:${email}`}>{email}</a>
			</li>
		)}
		{phone && telHref?.valid && (
			<li>
				<a href={`tel:${telHref.value}`}>{phone}</a>
			</li>
		)}
		{hasAddress && (
			<li>
				<address class="not-italic">
					{address.street && <span>{address.street}<br /></span>}
					{(address.postalCode || address.city) && (
						<span>
							{address.postalCode} {address.city}
						</span>
					)}
				</address>
			</li>
		)}
		{socialLinks.map((link) => (
			<li>
				<a href={link.url} rel="noopener noreferrer" target="_blank">
					{link.label}
				</a>
			</li>
		))}
		{websites.map((site) => (
			<li>
				<a href={site.url} rel="noopener noreferrer" target="_blank">
					{site.label}
				</a>
			</li>
		))}
	</ul>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/MemberShell.astro src/components/members/MemberCoordonnees.astro
git commit -m "feat: add MemberShell and MemberCoordonnees components"
```

---

### Task 9b: Utilitaires `normalizeEmbed`

**Files:**
- Create: `src/utils/media/normalizeEmbed.ts`

**Prérequis :** avant Tasks 10–11 (composants MDX). Centralise toute la logique de parsing — les composants Astro n’ont pas de regex locales.

- [ ] **Step 1: Créer `src/utils/media/normalizeEmbed.ts`**

```ts
export type NormalizeResult<T> =
	| { valid: true; value: T }
	| { valid: false; reason: string };

export function normalizeTel(raw: string): NormalizeResult<string> {
	const trimmed = raw.trim();
	if (!trimmed) return { valid: false, reason: "empty" };
	const digits = trimmed.replace(/[\s.\-()]/g, "");
	if (!/^\+?[\d]+$/.test(digits)) {
		return { valid: false, reason: "invalid characters" };
	}
	return { valid: true, value: digits };
}

export function youtubeId(value: string): NormalizeResult<string> {
	const match = value.match(
		/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/,
	);
	return match?.[1]
		? { valid: true, value: match[1] }
		: { valid: false, reason: "not a YouTube URL" };
}

export function vimeoId(value: string): NormalizeResult<string> {
	const match = value.match(/vimeo\.com\/(?:video\/)?(\d+)/);
	return match?.[1]
		? { valid: true, value: match[1] }
		: { valid: false, reason: "not a Vimeo URL" };
}

export function dailymotionId(value: string): NormalizeResult<string> {
	const match = value.match(/dailymotion\.com\/video\/([\w]+)/);
	return match?.[1]
		? { valid: true, value: match[1] }
		: { valid: false, reason: "not a Dailymotion URL" };
}

export function videoEmbedSrc(
	platform: "youtube" | "vimeo" | "dailymotion",
	url: string,
): NormalizeResult<string> {
	if (platform === "youtube") {
		const id = youtubeId(url);
		return id.valid
			? { valid: true, value: `https://www.youtube-nocookie.com/embed/${id.value}` }
			: id;
	}
	if (platform === "vimeo") {
		const id = vimeoId(url);
		return id.valid
			? { valid: true, value: `https://player.vimeo.com/video/${id.value}` }
			: id;
	}
	const id = dailymotionId(url);
	return id.valid
		? { valid: true, value: `https://www.dailymotion.com/embed/video/${id.value}` }
		: id;
}

export function extractAudioEmbedUrl(
	platform: "spotify" | "deezer" | "soundcloud" | "radio-france" | "arte",
	url: string,
): NormalizeResult<string> {
	const trimmed = url.trim();
	if (!trimmed) return { valid: false, reason: "empty" };
	// Phase 1 : accepter les URLs embed directes ; normalisation légère par plateforme
	try {
		new URL(trimmed);
		return { valid: true, value: trimmed };
	} catch {
		return { valid: false, reason: "invalid URL" };
	}
}
```

- [ ] **Step 2: Vérification manuelle**

Tester en REPL ou script ad hoc :

- `normalizeTel("06 12 34 56 78")` → `{ valid: true, value: "0612345678" }`
- `youtubeId("https://youtu.be/dQw4w9WgXcQ")` → `{ valid: true, value: "dQw4w9WgXcQ" }`
- URL invalide → `{ valid: false, reason: "…" }`

- [ ] **Step 3: Commit**

```bash
git add src/utils/media/normalizeEmbed.ts
git commit -m "feat: centralize media URL normalization utilities"
```

---

### Task 10: Composant `VideoEmbed`

**Files:**
- Create: `src/components/mdx/VideoEmbed.astro`

- [ ] **Step 1: Implémenter `VideoEmbed.astro`**

> `// SYNC WITH keystatic.config.ts → mdxComponentBlocks.VideoEmbed`

```astro
---
import { videoEmbedSrc } from "@utils/media/normalizeEmbed";

interface Props {
	platform: "youtube" | "vimeo" | "dailymotion" | "hosted";
	url?: string;
	src?: string;
	title?: string;
}

const { platform, url = "", src = "", title = "Vidéo" } = Astro.props;

const embed =
	platform !== "hosted" ? videoEmbedSrc(platform, url) : null;
const embedSrc = embed?.valid ? embed.value : "";
---

<figure class="stack-sm">
	{platform === "hosted" && src ? (
		<video class="w-full rounded" controls preload="metadata" src={src}>
			<track kind="captions" />
		</video>
	) : embedSrc ? (
		<div class="aspect-video w-full overflow-hidden rounded">
			<iframe
				class="h-full w-full border-0"
				src={embedSrc}
				title={title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				loading="lazy"
			/>
		</div>
	) : (
		<p class="t-body text-muted">URL vidéo invalide.</p>
	)}
</figure>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/mdx/VideoEmbed.astro
git commit -m "feat: add VideoEmbed MDX component"
```

---

### Task 11: Composant `AudioPlayer`

**Files:**
- Create: `src/components/mdx/AudioPlayer.astro`

- [ ] **Step 1: Implémenter `AudioPlayer.astro`**

> `// SYNC WITH keystatic.config.ts → mdxComponentBlocks.AudioPlayer`

```astro
---
import { extractAudioEmbedUrl } from "@utils/media/normalizeEmbed";

interface Props {
	platform:
		| "spotify"
		| "deezer"
		| "soundcloud"
		| "radio-france"
		| "arte"
		| "hosted";
	embedUrl?: string;
	src?: string;
	title?: string;
}

const {
	platform,
	embedUrl = "",
	src = "",
	title = "Audio",
} = Astro.props;

const isEmbed = platform !== "hosted";
const embed =
	isEmbed && embedUrl
		? extractAudioEmbedUrl(
				platform as "spotify" | "deezer" | "soundcloud" | "radio-france" | "arte",
				embedUrl,
			)
		: null;
const iframeSrc = embed?.valid ? embed.value : "";
---

<figure class="stack-sm">
	{isEmbed && iframeSrc ? (
		<iframe
			class="w-full min-h-40 rounded border-0"
			src={iframeSrc}
			title={title}
			loading="lazy"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
		/>
	) : !isEmbed && src ? (
		<audio class="w-full" controls preload="metadata" src={src}>
			<track kind="captions" />
		</audio>
	) : (
		<p class="t-body text-muted">Source audio invalide.</p>
	)}
</figure>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/mdx/AudioPlayer.astro
git commit -m "feat: add AudioPlayer MDX component"
```

---

### Task 12: Composant `Carousel`

**Files:**
- Create: `src/components/mdx/Carousel.astro`

- [ ] **Step 1: Implémenter `Carousel.astro`**

Composant avec `images` array, boutons prev/next, `aria-roledescription="carousel"`, **`aria-live="polite"`** + annonce slide X/Y, script vanilla pour index actif.

Structure minimale :

```astro
---
interface ImageItem {
	src: string;
	alt: string;
	caption?: string;
}

interface Props {
	images: ImageItem[];
	id?: string;
}

const { images, id = `carousel-${Math.random().toString(36).slice(2)}` } =
	Astro.props;
---

{images.length > 0 && (
	<section class="stack-sm" aria-roledescription="carousel" aria-label="Carrousel" aria-live="polite" data-carousel={id}>
		<span class="sr-only" data-carousel-status>Slide 1 sur {images.length}</span>
		<div class="relative">
			{images.map((image, index) => (
				<figure data-slide={index} hidden={index !== 0}>
					<img src={image.src} alt={image.alt} class="w-full rounded" loading={index === 0 ? "eager" : "lazy"} />
					{image.caption && <figcaption class="t-body text-muted">{image.caption}</figcaption>}
				</figure>
			))}
		</div>
		{images.length > 1 && (
			<div class="flex gap-2">
				<button type="button" data-carousel-prev aria-label="Image précédente">←</button>
				<button type="button" data-carousel-next aria-label="Image suivante">→</button>
			</div>
		)}
	</section>
)}

<script>
	document.querySelectorAll("[data-carousel]").forEach((root) => {
		const slides = [...root.querySelectorAll("[data-slide]")];
		let index = 0;
		const show = (i: number) => {
			slides.forEach((slide, n) => {
				(slide as HTMLElement).hidden = n !== i;
			});
			index = i;
			const status = root.querySelector("[data-carousel-status]");
			if (status) status.textContent = `Slide ${i + 1} sur ${slides.length}`;
		};
		root.querySelector("[data-carousel-prev]")?.addEventListener("click", () => {
			show((index - 1 + slides.length) % slides.length);
		});
		root.querySelector("[data-carousel-next]")?.addEventListener("click", () => {
			show((index + 1) % slides.length);
		});
	});
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/mdx/Carousel.astro
git commit -m "feat: add Carousel MDX component"
```

---

### Task 13: Composant `MiniGallery`

**Files:**
- Create: `src/components/mdx/MiniGallery.astro`

- [ ] **Step 1: Implémenter `MiniGallery.astro`**

```astro
---
interface ImageItem {
	src: string;
	alt: string;
	caption?: string;
}

interface Props {
	images: ImageItem[];
	columns?: number;
}

const { images, columns = 3 } = Astro.props;
const galleryId = `gallery-${Math.random().toString(36).slice(2)}`;
---

{images.length > 0 && (
	<section class="stack-sm" aria-label="Galerie">
		<ul
			class="grid gap-3 list-none p-0"
			style={`grid-template-columns: repeat(${columns}, minmax(0, 1fr))`}
		>
			{images.map((image, index) => (
				<li>
					<button
						type="button"
						class="block w-full cursor-pointer border-0 bg-transparent p-0"
						data-gallery-open={galleryId}
						data-trigger-index={index}
						aria-label={`Agrandir : ${image.alt}`}
					>
						<img
							src={image.src}
							alt={image.alt}
							class="aspect-square w-full rounded object-cover"
							loading="lazy"
						/>
					</button>
				</li>
			))}
		</ul>
		<dialog id={galleryId} class="max-w-4xl w-[min(100%,48rem)] rounded p-0 backdrop:bg-black/60">
			<form method="dialog" class="stack-sm p-4">
				<button type="submit" class="self-end" aria-label="Fermer">✕</button>
				<img data-gallery-image src="" alt="" class="w-full rounded" />
				<p data-gallery-caption class="t-body text-muted hidden"></p>
			</form>
		</dialog>
	</section>
)}

<script define:vars={{ images, galleryId }}>
	const dialog = document.getElementById(galleryId);
	const img = dialog?.querySelector("[data-gallery-image]");
	const caption = dialog?.querySelector("[data-gallery-caption]");

	document.querySelectorAll(`[data-gallery-open="${galleryId}"]`).forEach((btn) => {
		btn.addEventListener("click", () => {
			const index = Number(btn.getAttribute("data-trigger-index"));
			const item = images[index];
			if (!dialog || !img || !item) return;
			(dialog as HTMLDialogElement).dataset.triggerIndex = String(index);
			img.src = item.src;
			img.alt = item.alt;
			if (caption) {
				if (item.caption) {
					caption.textContent = item.caption;
					caption.classList.remove("hidden");
				} else {
					caption.textContent = "";
					caption.classList.add("hidden");
				}
			}
			dialog.showModal();
		});
	});

	dialog?.addEventListener("close", () => {
		const index = dialog.dataset.triggerIndex;
		if (index == null) return;
		const trigger = document.querySelector(
			`[data-gallery-open="${galleryId}"][data-trigger-index="${index}"]`,
		);
		(trigger as HTMLButtonElement | null)?.focus();
	});
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/mdx/MiniGallery.astro
git commit -m "feat: add MiniGallery MDX component with dialog lightbox"
```

---

### Task 14: Registre MDX et page membre

**Files:**
- Create: `src/components/mdx/index.ts`
- Create: `src/components/mdx/README.md`
- Modify: `src/pages/membres/[slug].astro`
- Modify: `src/pages/membres/index.astro`

- [ ] **Step 1: Créer `src/components/mdx/README.md`**

Documenter le mapping Keystatic ↔ Astro (source de vérité pour éviter la désynchronisation) :

| Keystatic block | Composant Astro | Props |
|----------------|-----------------|-------|
| `VideoEmbed` | `VideoEmbed.astro` | `platform`, `url`, `src`, `title` |
| `AudioPlayer` | `AudioPlayer.astro` | `platform`, `embedUrl`, `src`, `title` |
| `Carousel` | `Carousel.astro` | `images[]`, `id?` |
| `MiniGallery` | `MiniGallery.astro` | `images[]`, `columns?` |

Inclure les contraintes : pas d’imports internes ni HTML brut dans `bio.mdx`.

- [ ] **Step 2: Créer `src/components/mdx/index.ts`**

```ts
import AudioPlayer from "./AudioPlayer.astro";
import Carousel from "./Carousel.astro";
import MiniGallery from "./MiniGallery.astro";
import VideoEmbed from "./VideoEmbed.astro";

export const mdxComponents = {
	VideoEmbed,
	AudioPlayer,
	Carousel,
	MiniGallery,
};
```

- [ ] **Step 3: Réécrire `[slug].astro`**

> `getStaticPaths` strict — pas de `Astro.redirect('/404')`. Réutiliser `Astro.props.member` ; `getMembers()` pour la nav uniquement (cache).

```astro
---
import MemberCoordonnees from "@components/members/MemberCoordonnees.astro";
import MemberShell from "@components/layout/MemberShell.astro";
import { mdxComponents } from "@components/mdx";
import { buildMemberNav } from "@config/content/navigation";
import { getMembers } from "@config/content/members";
import { reader } from "../../keystatic/reader";
import Layout from "../../layouts/Layout.astro";

export async function getStaticPaths() {
	const members = await getMembers();
	return members.map((member) => ({
		params: { slug: member.slug },
		props: { member },
	}));
}

const { member } = Astro.props;
const members = await getMembers();
const memberNavItems = buildMemberNav(members);
const currentPath = Astro.url.pathname;

const entry = await reader.collections.membres.read(member.slug);
const bioEntry = entry ? await entry.bio() : null;
const BioContent = bioEntry?.content;
---

<Layout title={member.title} description={member.description}>
	<MemberShell {member} {memberNavItems} {currentPath}>
		<MemberCoordonnees slot="coordonnees" coordonnees={member.coordonnees} />
		{bioEntry && (
			<section slot="bio" class="stack-md" aria-labelledby="bio-heading">
				<h2 id="bio-heading" class="t-h3">Bio</h2>
				{BioContent && <BioContent components={mdxComponents} />}
			</section>
		)}
	</MemberShell>
</Layout>
```

- [ ] **Step 4: Mettre à jour `index.astro`**

```astro
---
// remplacer import sync par :
import { getMembers } from "@config/content/members";
import { buildMemberNav } from "@config/content/navigation";

const members = await getMembers();
const memberNavItems = buildMemberNav(members);
---

<!-- MemberNav items={memberNavItems} -->
<!-- members.map inchangé -->
```

- [ ] **Step 5: Audit final des imports sync**

```bash
rg "from.*members|export const members" src config
```

Expected: aucun import de l’ancien export synchrone.

- [ ] **Step 6: Commit**

```bash
git add src/components/mdx/ src/pages/membres/
git commit -m "feat: wire member pages to Keystatic content and MDX"
```

---

### Task 15: Vérification finale

**Files:** (aucune modification)

- [ ] **Step 1: Lint et types**

```bash
pnpm check
```

Expected: PASS

- [ ] **Step 2: Build production**

```bash
pnpm build
```

Expected: PASS, pages `/membres/alice/`, `/membres/brice/` générées

- [ ] **Step 4: Vérifier cache loader**

`pnpm build` — confirmer qu’un seul log `[getMembers] filesystem read` si trace temporaire encore présente, sinon vérifier via commentaire dans Task 6.

- [ ] **Step 5: Test admin — créer un membre**

```bash
pnpm dev
```

1. Ouvrir `/keystatic` → Membres → Créer `newmember`
2. Remplir coordonnées + ajouter un block Vidéo dans la bio
3. Sauvegarder
4. Vérifier `content/membres/newmember/coordonnees.md` et `bio.mdx` créés
5. Rebuild → `/membres/newmember/` présent dans `dist/`

- [ ] **Step 6: Commit final si fichiers seed newmember à garder, sinon supprimer avant commit**

```bash
git status
```

---

## Self-review

| Exigence spec | Task |
|---------------|------|
| **Go/no-go avant code** | Task 0 |
| Keystatic collection 2 fichiers / membre | Task 0 (POC), Task 2, 5 |
| `fields.document` sans `formatting: { data: "yaml" }` | Task 2 |
| Métadonnées + coordonnées structurées | Task 2, 6, 9 |
| Reader API, pas Astro collections | Task 3, 6 |
| `getMembers` async + **cache module-level** | Task 6 |
| Normalisation centralisée `normalizeEmbed.ts` | Task 9b |
| MemberShell | Task 9 |
| MDX Video/Audio/Carousel/MiniGallery | Tasks 10–13 |
| Component blocks admin + README mapping | Task 2, 14 |
| Migration alice/brice + component block test | Task 5 |
| Nav + SEO refactor + audit imports | Tasks 7–8, 14 |
| `getStaticPaths` strict (pas redirect 404) | Task 14 |
| Accessibilité carrousel / lightbox / iframes | Tasks 12–13 |
| Stockage local + commentaires Git LFS / GitHub | Task 2 |
| Dettes acceptées documentées | Section dédiée |

Aucun placeholder TBD restant. Types cohérents (`Member`, `MemberProfile`, `buildMemberNav`).

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-17-keystatic-members.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

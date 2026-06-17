# Tech Debt Audit — dekamus.fr
Generated: 2026-06-15

## Executive summary

- **2 Critical**, **11 High**, **22 Medium**, **14 Low** — concentrated in layout shell, missing routes, and documentation drift.
- **Largest debt concentration:** `src/layouts/Layout.astro` (duplicate `<main>`) + `config/content/pages.ts` (registry promises routes that don't exist). These cascade into every built page and every SEO validator warning.
- **~3,250 LOC** across 62 Biome-checked files — young codebase, but several load-bearing bugs are already shipped.
- **README is still the default Astro starter template** — contradicts the actual `config/` + SEO-graph architecture documented in `docs/`.
- **No tests, no CI** — acceptable for a mockup, risky once header scroll/mobile nav JS grows.
- **Churn hotspots** (last 6 months): `Header.astro`, nav components, `config/design/layout.ts`, `config/content/pages.ts` — intersects with largest files.
- **TypeScript strict passes** (`tsc --noEmit`); **Biome passes** (`pnpm check`).
- **Build succeeds** but emits **6× duplicate H1 warnings** and **48+ broken internal-link warnings** — symptoms of Critical findings, not separate bugs.
- **Stack tooling gaps:** `pnpm audit`, `knip`, `madge`, `depcheck` could not complete (registry DNS/network); findings below are from static analysis + `pnpm build`.
- **Dead duplicate token file** `config/design/radius.ts` alongside live `borderRadius.ts`.
- **Font pipeline depends on live `api.fontsource.org` at build time** — reproducibility and offline-build risk.

## Architectural mental model

Dekamus is a **static Astro 6 site** (~3.2k LOC) for a French nonprofit association, deployed to **Cloudflare Pages** (`output: "static"`). Content lives in `config/` (page registry, members, site/org metadata, design tokens). Pages are thin Astro routes in `src/pages/` that compose `Layout` → `Header`/`MainNav` → `Prose` content. SEO is build-time heavy via `@jdevalk/astro-seo-graph` (JSON-LD graph, sitemap, `llms.txt`, validators) and `@jdevalk/seo-graph-core` for schema assembly.

Styling is a **dual layer**: semantic typography classes in `src/styles/typography.css` plus constrained UnoCSS utilities (`uno.config.ts`) fed by OKLCH tokens in `config/design/`. Tokens are injected globally through `HeadDesign.astro` (reset + spacing + radius + typography + color CSS vars + fonts). Client behavior is **inline IIFE `<script>` blocks** in `Header.astro` (scroll hide/show, desktop pill highlight), `MainNavMobile.astro` (drawer), and `ThemeToggle.astro` (localStorage theme cycle) — no client framework, no hydration boundary.

**README contradiction:** README describes a minimal Astro starter with only `src/pages/_design-system.astro`. Reality is a multi-page site with legal pages, member profiles, schema endpoints, and a design-system mockup at `src/pages/_design-system.astro` (underscore = no route).

## Findings

| ID | Category | File:Line | Severity | Effort | Description | Recommendation |
|----|----------|-----------|----------|--------|-------------|----------------|
| F001 | Architectural decay | `src/layouts/Layout.astro:21-26` | Critical | S | Two identical `<main>` elements both render `<slot />` — page content appears twice in the DOM | Delete one `<main>` block; verify H1 count drops to 1 per page |
| F002 | Architectural decay | `src/pages/` (no `index.astro`) | Critical | M | Homepage route `/` is registered in `pages.home` and linked from nav/logo but has no page file; build outputs 6 pages, none at `/` | Add `src/pages/index.astro` using `layoutProps(pages.home)` or remove home from registry/nav until ready |
| F003 | Architectural decay | `config/content/pages.ts:24-32` | High | M | `pages.contact` at `/contact` is in main nav, footer, and schema registry but no `src/pages/contact.astro` exists | Create contact page or remove from `pages`, `navigation.ts`, and schema lists |
| F004 | Test debt | `package.json:9-16` | High | M | No test runner, no test files, no `test` script — header scroll/pill and mobile nav have zero automated coverage | Add Vitest + minimal DOM tests for scroll state machine and menu a11y attrs |
| F005 | Dependency & config | `.github/` (absent) | High | M | No CI workflow — `pnpm build`, `pnpm check`, and SEO validators only run locally | Add GitHub Actions (or CF Pages check) running `pnpm check` + `pnpm build` on PR |
| F006 | Documentation drift | `README.md:1-20` | High | S | README is untouched Astro starter template; omits `config/`, SEO graph, UnoCSS, legal/member pages | Replace with project-specific README pointing to `docs/css-conventions.md` and `docs/astro-seo-graph.md` |
| F007 | Documentation drift | `docs/astro-seo-graph.md:9-17` | High | S | Docs reference `config/site.ts`, `config/pages.ts`, `HeadTheme`, `HeadFonts`, `BaseMeta` — none exist at those paths/names | Update table to `config/content/*` and `HeadDesign.astro` |
| F008 | Performance & resource | `astro.config.mjs:32-71` | High | M | Font families fetched from `api.fontsource.org` at build time; build warns and copies 0 font files when network fails | Pin fonts via local `@fontsource/*` packages or vendor woff2 into `public/` |
| F009 | Architectural decay | `src/components/header/Header.astro:29-325` | Medium | L | 297-line inline script mixing pill animation, scroll hide/show, reduced-motion, resize observer — god component | Extract to `src/scripts/header-behavior.ts`; import as `client:load` or bundled module; unit-test state transitions |
| F010 | Architectural decay | `src/components/nav/MainNavMobile.astro:71-148` | Medium | M | 78-line inline script; teleports panel/backdrop to `document.body` without teardown | Extract module; add `astro:before-preparation` cleanup if View Transitions added later |
| F011 | Consistency rot | `src/components/header/Header.astro:31` | Medium | S | Hardcoded `768px` breakpoint in JS/CSS duplicates `config/design/layout.ts:11` (`md: "768px"`) | Export breakpoint as CSS custom property or `data-md` attribute from config; single source of truth |
| F012 | Consistency rot | `config/design/radius.ts:1-20` | Medium | S | Dead duplicate of `borderRadius.ts` with **different values** (`sm: 0.38rem` vs `0.375rem`) — confusion bomb | Delete `radius.ts`; keep `borderRadius.ts` as sole source |
| F013 | Consistency rot | `src/styles/tokens.css:1-7` | Medium | S | Orphan file: font aliases duplicated inline in `HeadDesign.astro:12-18`; comment references non-existent `HeadTokens.astro` | Delete `tokens.css` or import it from `HeadDesign.astro` and remove duplication |
| F014 | Architectural decay | `src/utils/schema/index.ts:33-81` | Medium | M | `buildSchemaGraph` and `buildPageSchemaPieces` duplicate breadcrumb + WebPage assembly (~40 lines) | Extract shared `pagePieces(url, title, description)` used by both |
| F015 | Performance & resource | `src/pages/schema/page.json.ts:11-18` | Medium | S | `siteWidePieces()` appended to **every** schema endpoint entry — redundant Organization/WebSite/Nav on each page blob | Return site-wide entities once at endpoint root or document as intentional denormalization |
| F016 | Type & contract | `src/utils/schema/index.ts:33-34` | Low | S | `pageType?: PageType` parameter accepted but never used in function body | Remove param or branch schema type on it |
| F017 | Architectural decay | `src/utils/schema/index.ts:11-13` | Low | S | `siteWideEntities()` is a one-line wrapper around `siteWidePieces()` | Call `siteWidePieces()` directly |
| F018 | Architectural decay | `config/content/members.ts:26-28` | Low | S | `getMemberBySlug` exported, never imported | Delete or use in `[slug].astro` for validation |
| F019 | Architectural decay | `config/content/pages.ts:63-65` | Low | S | `getPage` exported, never imported | Delete or use in page generators |
| F020 | Consistency rot | `src/pages/membres/[slug].astro:18` | Medium | S | Member page passes raw `title`/`description` props instead of `layoutProps(member-as-PageMeta)` pattern used elsewhere | Align with `layoutProps` or add `memberToPageMeta()` helper |
| F021 | Consistency rot | `src/layouts/Layout.astro:21` | Medium | S | `h-100dvh` is not a defined Uno shortcut or standard utility — likely no-op; `100dvh` only used correctly in mobile nav CSS | Use `min-h-dvh` or `min-h-[100dvh]` per UnoCSS conventions |
| F022 | Consistency rot | `src/components/nav/MainNavMobile.astro:204` | Medium | S | Hardcoded `background: #000` violates project rule against arbitrary colors (`docs/css-conventions.md:37`) | Use semantic token e.g. `oklch(from var(--color-primary) l c h / 0.55)` |
| F023 | Consistency rot | `src/components/nav/MainNavMobile.astro:108` | Low | S | Toggles `is-nav-open` on header but `Header.astro` styles use `:has(.nav-mobile.is-open)` — dead class | Remove `is-nav-open` toggle or use it in CSS |
| F024 | Security hygiene | `config/content/site.ts:36-37` | Medium | S | Phone `+33 6 12 34 56 78` reads as placeholder; published on legal page | Replace with real number or remove until verified |
| F025 | Documentation drift | `config/content/members.ts:23` | Medium | S | Member profiles end with "Profil à compléter." — placeholder content in production routes | Complete bios or mark pages `noindex` until ready |
| F026 | Documentation drift | `src/styles/design-system.css:1` | Low | S | Comment says "homepage design system mockup" but homepage route doesn't exist; mockup is `_design-system.astro` | Fix comment to match `_design-system.astro` purpose |
| F027 | Architectural decay | `src/components/logo/Logo.astro:8-23` | Low | S | Three logo variants (`stacked-border`, `horizontal-round`, `horizontal-square`) imported but never used outside type map | Remove unused imports/variants or document planned usage |
| F028 | Error handling | `src/components/utils/ThemeToggle.astro:44-54` | Low | S | Swallowed `localStorage` exceptions with empty catch — fine for privacy mode, but no fallback UX | Acceptable; optionally surface `aria-disabled` when storage blocked |
| F029 | Consistency rot | `src/components/utils/ThemeToggle.astro:10` | Low | S | `aria-label="Toggle theme"` in English on `lang="fr"` site | French label: "Changer le thème" |
| F030 | Consistency rot | `src/components/utils/ThemeToggle.astro:90-91` | Low | S | `aria-pressed` only `true` for dark mode; auto/light both `false` — incorrect toggle semantics | Use `aria-pressed` for all three states or switch to `aria-checked` with `role="switch"` |
| F031 | Consistency rot | `src/layouts/html-head/HeadDesign.astro:23-33` | Medium | S | Theme boot script in head only sets `colorScheme`; `ThemeToggle` also sets `dataset.theme` — two initialization paths | Consolidate theme init in one module imported by both |
| F032 | Dependency & config | `package.json:18` | Medium | S | `@astrojs/check` in dependencies but no `astro check` script | Add `"check:astro": "astro check"` or move to devDependencies |
| F033 | Dependency & config | `public/` | Low | S | `HeadSeo.astro:31` links `/favicon.ico` but only `public/favicon.svg` exists | Add `favicon.ico` or remove link |
| F034 | Documentation drift | `docs/astro-seo-graph.md:130-147` | Medium | M | IndexNow documented with `astro.config` snippet but not implemented in `astro.config.mjs` | Wire `indexNow` config or mark docs as future work |
| F035 | Documentation drift | `docs/superpowers/plans/2026-06-10-tokens-unocss.md:48` | Low | S | Plan references `src/layouts/head/HeadTokens.astro` — actual path is `src/layouts/html-head/HeadDesign.astro` | Update plan or archive as completed with correct paths |
| F036 | Test debt | `astro.config.mjs:14-21` | Medium | S | SEO validators enabled (`validateH1`, `validateInternalLinks`) but warnings are ignored in workflow — 54 warnings on clean build | Fix F001–F003 first; then treat validator warnings as build failures |
| F037 | Architectural decay | `src/pages/_design-system.astro:293` | Low | M | 293-line design-system mockup page — fine for dev, but large CSS import (`design-system.css` 236 LOC) only used here | Keep; ensure `_` prefix stays (no production route) |
| F038 | Consistency rot | `uno.config.ts:17` | Low | S | `semanticColorsForUno(ColorData.colors.light)` passes light palette — looks wrong but only keys matter since values reference CSS vars | Add one-line comment explaining keys-only usage |
| F039 | Performance & resource | `src/components/header/Header.astro:323` | Low | S | `DESKTOP_MQ.addEventListener("change", init)` never removed — OK for MPA lifetime, leaks if View Transitions added | Document or add cleanup when migrating to VT |
| F040 | Consistency rot | `src/components/nav/MainNavMobile.astro:147` | Low | S | `resize` listener on `window` never removed | Same as F039 |
| F041 | Type & contract | `src/utils/schema/index.ts:102` | Low | S | Re-exports `organizationId` — no external consumers found | Trim public API exports to what's used |
| F042 | Documentation drift | `config/content/site.ts:8-9` | Low | S | `title` and `description` are generic; home page doesn't exist to use them | Flesh out when `index.astro` lands |
| F043 | Dependency & config | `pnpm audit` | Medium | S | Audit could not run (`EAI_AGAIN` / registry unreachable in audit environment) | Run `pnpm audit` in CI when network available |
| F044 | Dependency & config | `npx knip` / `madge` / `depcheck` | Low | S | Dead-export and circular-dep tools not run (registry DNS failure) | Run locally: `pnpm dlx knip`, `pnpm dlx madge --circular src config` |
| F045 | Consistency rot | `config/design/spacing.ts:3-15` | Low | S | Scale skips `sp9`, `sp11`, `sp13`–`sp15` — gaps between Uno `theme.spacing` and CSS vars | Document intentional gaps in `docs/css-conventions.md` |
| F046 | Security hygiene | — | — | — | No hardcoded secrets, SQL, or permissive CORS found | Nothing material |
| F047 | Error handling & observability | — | — | — | No server runtime; client errors silently swallowed only in theme storage | Nothing material beyond F028 |
| F048 | Performance & resource | `src/pages/schema/page.json.ts:6-19` | Low | M | Schema endpoint rebuilds full graph per page on each request at dev/preview; static at build — acceptable for now | Cache `siteWidePieces()` result module-level |

## Top 5 — if you fix nothing else, fix these

### 1. F001 — Remove duplicate `<main>` in Layout

```diff
--- a/src/layouts/Layout.astro
+++ b/src/layouts/Layout.astro
@@ -18,9 +18,6 @@
 		</Header>
 		<main class="h-100dvh flex flex-col">
 			<slot />
 		</main>
-		<main class="h-100dvh flex flex-col">
-			<slot />
-		</main>
 		<footer class="w-full border-t border-faint mt-auto">
```

This single fix eliminates duplicate H1s, duplicate content, and likely halves main landmark confusion for screen readers.

### 2. F002 + F003 — Align page registry with actual routes

Create minimal stubs:

- `src/pages/index.astro` — `layoutProps(pages.home)` + hero or redirect to design system content
- `src/pages/contact.astro` — `layoutProps(pages.contact)` + contact details from `siteConfig.organization.contact`

Until then, every nav link to `/` and `/contact/` is a 404 on the deployed static build (validators already scream about this).

### 3. F012 — Delete dead `radius.ts`

```bash
rm config/design/radius.ts
```

Verify nothing imports it (`rg radius.ts` — only `borderRadius.ts` is live). Prevents a future editor "fixing" radius by editing the wrong file.

### 4. F008 — Decouple font build from Fontsource API

Replace runtime API fetch with vendored fonts:

```bash
pnpm add @fontsource/syne @fontsource/source-serif-4 @fontsource/victor-mono
```

Import in `HeadDesign.astro` or switch `astro.config.mjs` `fonts` to local provider. Builds must not depend on `api.fontsource.org` uptime.

### 5. F004 + F005 — Minimal safety net before more header JS

```json
// package.json scripts
"test": "vitest run",
"check:all": "pnpm check && astro check && pnpm build"
```

One test file covering `normalizeNavPath` + header scroll threshold constants. GitHub Action running `check:all` on push.

## Quick wins

- [ ] **F001** — Delete duplicate `<main>` (5 min, fixes SEO H1 warnings)
- [ ] **F012** — Delete `config/design/radius.ts`
- [ ] **F013** — Delete or wire `src/styles/tokens.css`
- [ ] **F018–F019** — Remove unused `getMemberBySlug`, `getPage` exports
- [ ] **F023** — Remove dead `is-nav-open` class toggle
- [ ] **F029** — French `aria-label` on theme toggle
- [ ] **F033** — Add `favicon.ico` or drop dead link
- [ ] **F016–F017** — Remove unused `pageType` param and `siteWideEntities` wrapper
- [ ] **F038** — One comment on `semanticColorsForUno(light)` keys-only pattern
- [ ] **F006** — Replace README first paragraph (15 min)

## Things that look bad but are actually fine

- **`semanticColorsForUno(ColorData.colors.light)` in `uno.config.ts:17`** — The light palette is only iterated for token *keys*; actual color values come from `var(--color-*)` CSS vars using `light-dark()`. Passing dark would change nothing.
- **Two `<Logo variant="stacked">` in `Header.astro:14-20`** — Intentional responsive pattern: mobile chrome wrapper vs desktop pill-target logo. Not duplication debt.
- **Inline `<script>` IIFEs instead of bundled TS modules** — Appropriate for a static MPA with three small behaviors and no hydration. Extraction is maintainability, not correctness.
- **Spacing scale gaps (`sp9`, `sp11`, …)** — Matches deliberate design scale documented in planning docs; not a missing implementation.
- **`trailingSlash: "ignore"` with nav hrefs ending in `/`** — Astro normalizes; `normalizeNavPath` handles active-state comparison. Consistent enough.
- **`_design-system.astro` underscore prefix** — Correct Astro convention to keep mockup out of production routes.
- **`ColorData.colors.mode: "light"` default** — Works with `light-dark()` CSS; theme toggle overrides via `color-scheme` + `dataset.theme`. Not a dark-mode bug by itself.
- **Swallowed localStorage errors in `ThemeToggle.astro`** — Standard pattern for Safari private mode; theme still works for session via `dataset.theme`.

## Open questions for the maintainer

- Was `src/pages/index.astro` intentionally removed during the Cloudflare Workers → static Pages migration (`fed254c`), or never created after the design-system refactor?
- Is `/contact` planned as a form page, mailto-only, or external service? Registry metadata suggests a full page.
- Is `+33 6 12 34 56 78` intentional placeholder or ready for production legal pages?
- Is the duplicate `<main>` in `Layout.astro` a merge accident from recent nav/header work (git shows uncommitted nav changes)?
- Should `buildPageSchemaPieces` repeat `siteWidePieces()` per entry in `/schema/page.json`, or should the endpoint expose a shared `@graph` anchor?
- Is IndexNow intentionally deferred, or should `docs/astro-seo-graph.md` IndexNow section be removed until implemented?
- Are member pages (`alice`, `brice`) demo fixtures permanently, or placeholders for a CMS/Sanity integration later?

---

## Tooling notes

| Tool | Result |
|------|--------|
| `tsc --noEmit` | Pass |
| `pnpm check` (Biome) | Pass, 62 files |
| `pnpm build` | Pass with SEO warnings (H1 ×6, internal links ×48) |
| `pnpm audit` | Failed — registry `EAI_AGAIN` |
| `npm audit` | Failed — no `package-lock.json` (pnpm project) |
| `knip` / `madge` / `depcheck` | Not run — npx registry `EAI_AGAIN` |
| Test coverage | No runner configured |

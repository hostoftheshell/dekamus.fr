# Tech Debt Audit - dekamus.fr

Generated: 2026-06-19

## Executive summary

- Current live debt: **0 Critical**, **8 High**, **24 Medium**, **15 Low**. The prior Critical duplicate-layout and missing-route findings are resolved.
- Biggest current risk is no longer routing. It is the new Keystatic/MDX member pipeline: weak runtime contracts, editor-authored MDX that can break SEO, and media components with accessibility/lint failures.
- `pnpm build` passes and now emits good internal-link status, but still warns on one duplicate H1 and short metadata for `remi-jennequin`.
- `pnpm check` regressed from passing to **16 Biome errors**: one formatting issue, one media-caption issue, and 14 missing `key` props across Astro `.map()` render sites.
- `pnpm exec astro check` passes with hints, but raw `pnpm exec tsc --noEmit` fails on `.astro` imports from `src/components/mdx/index.ts`.
- `pnpm audit` now runs and reports **2 vulnerabilities**: moderate `yaml` via `@astrojs/check` and low `esbuild` via Astro/Vite.
- `knip` and `depcheck` results are noisy because Astro aliases and an in-repo `.worktrees/` clone confuse scanners, but they still confirm `config/design/radius.ts` is dead.
- README and SEO docs still describe older paths and starter-template structure; docs are now materially behind the implementation.
- The repo has no tests and no CI script/workflow, so build/lint/SEO warnings depend on local discipline.
- The highest-churn areas over the last six months are `package.json`, `astro.config.mjs`, `src/pages/index.astro`, `src/layouts/Layout.astro`, `src/pages/membres/[slug].astro`, schema helpers, and Keystatic config.

## Architectural mental model

Dekamus is a static Astro 6 site for a French nonprofit association. Static pages live under `src/pages`, shared page metadata and navigation live in `config/content`, design tokens live in `config/design`, and SEO/schema output is assembled at build time with `@jdevalk/astro-seo-graph` plus `@jdevalk/seo-graph-core`. The site now has a real homepage, contact page, legal pages, member index, member detail pages, schema endpoints, sitemap output, local Fontsource packages, UnoCSS, MDX, and a local-only Keystatic admin path gated by `SKIP_KEYSTATIC`.

The newest architectural layer is member content: `keystatic.config.ts` defines a `membres` collection stored as `content/membres/*/index.yaml` plus `bio.mdx`; `config/content/members.ts` reads it through Keystatic's reader and exposes async member loaders; member pages import renderable MDX with `import.meta.glob`; media blocks map through `src/components/mdx/index.ts`. Styling is a mix of global token/typography/markdown CSS imported from `src/styles/index.css`, Uno shortcuts, and component-scoped CSS. Client behavior remains inline scripts in Astro components: header pill/scroll behavior, mobile nav, theme toggle, carousel, and gallery.

README still contradicts reality: it says this is a minimal Astro starter and only documents `src/pages/_design-system.astro`, while the actual app has content registries, Keystatic, schema endpoints, member routes, and SEO validators.

## Findings

| ID | Category | File:Line | Severity | Effort | Description | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| F001 | Architectural decay | `src/layouts/Layout.astro:21-23` | Critical | S | RESOLVED: the prior duplicate `<main>` is gone; the layout now renders one slot-bearing main landmark. | Keep this covered by SEO H1 validation and do not reintroduce page-level mains inside routes. |
| F002 | Architectural decay | `src/pages/index.astro:9-13` | Critical | S | RESOLVED: the registered `/` route now exists. | Replace the placeholder `HOME` content before production polish. |
| F003 | Architectural decay | `src/pages/contact.astro:9-13` | High | S | RESOLVED: the registered `/contact` route now exists. | Replace the placeholder `CONTACT` content with real contact behavior or copy. |
| F004 | Test debt | `package.json:9-16` | High | M | ACTIVE: there is still no `test` script, no coverage command, and no behavioral tests for header, nav, MDX media blocks, member loading, or schema helpers. | Add Vitest plus small unit tests for `normalizeEmbed`, `nav-path`, member conversion, and schema page assembly. |
| F005 | Dependency & config | `package.json:9-16` | High | M | ACTIVE: scripts only expose dev/build/preview/check; no `check:all` or CI-facing command chains `pnpm check`, `astro check`, `pnpm build`, and audit. | Add a single `check:all` script and run it from CI. |
| F006 | Documentation drift | `README.md:1-20` | High | S | ACTIVE: README is still the default Astro starter and describes a project structure that omits `config/`, `content/`, Keystatic, SEO graph, schema endpoints, and member pages. | Replace with a project README: stack, content model, scripts, build/deploy, and docs links. |
| F007 | Documentation drift | `docs/astro-seo-graph.md:9-17` | High | S | ACTIVE: SEO docs still reference `config/site.ts`, `config/pages.ts`, `config/members.ts`, `HeadTheme`, `HeadFonts`, and `BaseMeta`, none of which match current paths/components. | Update the table to `config/content/*`, `src/layouts/Head.astro`, and `HeadDesign.astro`. |
| F008 | Dependency & config | `package.json:24-26` | High | S | RESOLVED: the old live Fontsource API build risk is reduced by local `@fontsource/*` packages, and the build copied fonts successfully. | Keep fonts pinned through package dependencies and avoid remote font fetches in CI. |
| F009 | Architectural decay | `src/components/header/Header.astro:29-239` | Medium | L | ACTIVE: header behavior is still a 211-line inline script mixing pill animation, scroll state, reduced-motion behavior, resize observation, and cleanup. | Extract a small `header-behavior.ts` module with testable pure state helpers before adding more header interactions. |
| F010 | Architectural decay | `src/components/nav/MainNavMobile.astro:71-149` | Medium | M | ACTIVE: mobile nav still teleports DOM nodes to `document.body`, manages body scroll lock, focus, escape key, resize, and open state in one inline script. | Extract to a reusable module and add teardown hooks if View Transitions or partial navigation are introduced. |
| F011 | Consistency rot | `src/components/header/Header.astro:31` | Medium | S | ACTIVE: `768px` is hardcoded in JS while the design breakpoint source of truth lives in `config/design/layout.ts`. | Emit the breakpoint as a CSS custom property/data attr or import a generated constant. |
| F012 | Consistency rot | `config/design/radius.ts:1-20` | Medium | S | ACTIVE: dead duplicate radius token file remains alongside live `borderRadius.ts`, with different values. `knip` also reports it unused. | Delete `config/design/radius.ts`. |
| F013 | Consistency rot | `src/styles/index.css:3-6` | Medium | S | RESOLVED: `tokens.css` is no longer orphaned; it is imported by the global style bundle. | Keep token aliases in one CSS file and avoid duplicating font aliases in component frontmatter. |
| F014 | Architectural decay | `src/utils/schema/index.ts:33-88` | Medium | M | ACTIVE: `buildSchemaGraph` and `buildPageSchemaPieces` still duplicate breadcrumb + WebPage construction logic. | Extract a shared `pageSchemaPieces({ url, title, description, members })`. |
| F015 | Performance & resource | `src/pages/schema/page.json.ts:18-25` | Medium | S | ACTIVE: `siteWidePieces()` is appended to every schema endpoint entry, repeating Organization/WebSite/Nav entities per page blob. | Return site-wide entities once if the endpoint format supports it, or document this as intentional denormalization. |
| F016 | Type & contract debt | `src/utils/schema/index.ts:31-40` | Low | S | ACTIVE: `pageType?: PageType` is accepted but not used. | Remove the option or use it to choose schema type. |
| F017 | Architectural decay | `src/utils/schema/index.ts:11-13` | Low | S | ACTIVE: `siteWideEntities()` is a one-line wrapper around `siteWidePieces()`. | Inline the call. |
| F018 | Architectural decay | `config/content/members.ts:73-78` | Low | S | ACTIVE: `getMemberBySlug` is exported but has no runtime consumer outside docs. | Delete it or use it where slug lookup is needed. |
| F019 | Architectural decay | `config/content/pages.ts:63-65` | Low | S | ACTIVE: `getPage` is exported but no production code imports it. | Delete it or use it consistently in route/page assembly. |
| F020 | Consistency rot | `src/pages/membres/[slug].astro:31` | Medium | S | ACTIVE: member detail pages pass raw `title`/`description` into `Layout`, while static pages use `layoutProps(meta)`. | Add `memberLayoutProps(member)` so page and member metadata go through one formatting path. |
| F021 | Consistency rot | `src/layouts/Layout.astro:21` | Medium | S | ACTIVE: `h-100dvh` is not a documented project shortcut and is likely a no-op utility. | Replace with an explicit supported utility or scoped CSS using `min-height: 100dvh`. |
| F022 | Consistency rot | `src/components/nav/MainNavMobile.astro:199-227` | Medium | S | RESOLVED: the old hardcoded black backdrop is gone; mobile overlay styling now uses semantic OKLCH tokens. | Keep arbitrary colors blocked by convention and lint review. |
| F023 | Consistency rot | `src/components/nav/MainNavMobile.astro:106-110` | Low | S | PARTIAL: `is-nav-open` is now read by `Header.astro`, but mobile nav still owns header state directly. | Prefer one custom event or shared controller rather than cross-component class mutation. |
| F024 | Security hygiene | `config/content/site.ts:35-37` | Medium | S | ACTIVE: `+33 6 12 34 56 78` still looks like placeholder contact data and is published into schema/legal surfaces. | Verify it is real or remove the phone until confirmed. |
| F025 | Documentation drift | `content/membres/remi-jennequin/bio.mdx:1-22` | Medium | S | NEW: the member bio is Markdown syntax documentation/sample content, not a real profile biography, and it creates an SEO duplicate-H1 warning at line 22. | Replace with real bio content and ban top-level `#` headings inside member bio MDX. |
| F026 | SEO/content debt | `content/membres/remi-jennequin/index.yaml:3-5` | High | S | NEW: role/title/description are all `photographe`; build warns title is 21 chars and description is 11 chars. | Write a real 30-65 char title and 70-200 char description. |
| F027 | Type & contract debt | `config/content/members.ts:8-19` | High | M | NEW: Keystatic reader output is coerced with `String(data.foo ?? "")`, so missing required CMS fields silently become empty strings and still build. | Validate reader output with a schema or explicit required-field checks that fail the build. |
| F028 | Type & contract debt | `config/content/members.ts:22-47` | High | M | NEW: nested address/social/websites data are cast to `Record<string, string>` and arrays are trusted after `Array.isArray`, with no URL/email/phone validation at the boundary. | Parse the reader output into typed data and reject invalid external URLs/contact fields before rendering. |
| F029 | Security hygiene | `src/components/mdx/AudioPlayer.astro:46-55` | Medium | S | NEW: audio embeds accept any valid URL for iframe `src`; platform selection does not constrain allowed hosts. | Validate embed hostnames per platform before rendering iframes. |
| F030 | Security hygiene | `src/components/mdx/VideoEmbed.astro:19-21` | Medium | S | NEW: hosted video `src` is editor-provided text and can point anywhere; no path policy enforces `/videos/membres/`. | Restrict hosted media paths to known public directories or validate URL origins. |
| F031 | Accessibility | `src/components/mdx/AudioPlayer.astro:59` | Medium | S | NEW: hosted `<audio>` renders without captions/transcript track; Biome fails on `lint/a11y/useMediaCaption`. | Add a transcript/captions field to Keystatic and render `<track>` or adjacent transcript copy. |
| F032 | Type & contract debt | `src/components/mdx/index.ts:1-4` | Medium | S | NEW: raw `pnpm exec tsc --noEmit` fails because this TS barrel imports `.astro` components directly. | Use `astro check` as the type gate, or add an Astro component module declaration/avoid TS barrels for `.astro` imports. |
| F033 | Dependency & config | `astro.config.mjs:19-26` | Medium | S | NEW: the current uncommitted Shiki config is not formatted (`light : '...'`), causing `pnpm check` to fail immediately. | Run Biome or fix quote/spacing before merging. |
| F034 | Consistency rot | `src/components/nav/MainNavMobile.astro:48-49` | Medium | S | NEW: mapped nav items render `<li>` without `key`, one of many Biome `useJsxKeyInIterable` failures. | Add stable keys (`item.href`) to all `.map()` render sites. |
| F035 | Consistency rot | `src/components/mdx/Carousel.astro:21-24` | Medium | S | NEW: carousel slides render without keys and use dense one-line markup that Biome now flags/formats poorly. | Add keys from `image.src` plus index fallback and format with Biome. |
| F036 | Consistency rot | `src/components/mdx/MiniGallery.astro:23-39` | Medium | S | NEW: gallery image items render without keys. | Add stable keys and keep gallery data keyed by image path. |
| F037 | Consistency rot | `src/components/members/MemberCoordonnees.astro:40-53` | Medium | S | NEW: social/website list items render without keys. | Key by URL after validating URL uniqueness. |
| F038 | Consistency rot | `src/pages/membres/index.astro:23-30` | Medium | S | NEW: member index list items render without keys. | Key by `member.slug`. |
| F039 | Dependency & config | `biome.json:10-18` | Medium | S | NEW: `.worktrees` is excluded from Biome, but the untracked `.worktrees/` directory still polluted `knip` and largest-file scans. | Move worktrees outside the repo or add tool-specific excludes for knip/depcheck. |
| F040 | Dependency & config | `package.json:19` | Medium | S | NEW: `pnpm audit` reports moderate `yaml` advisory through `@astrojs/check` -> language-server tooling. | Update the affected transitive chain when Astro/check publishes a patched path, or override `yaml >=2.8.3` after compatibility check. |
| F041 | Dependency & config | `pnpm-workspace.yaml:4-6` | Low | S | NEW: `pnpm audit` reports low `esbuild` advisory while `allowBuilds` explicitly permits `esbuild`; impact is dev-server/Windows scoped but still tracked. | Upgrade Astro/Vite/esbuild when patched versions land; document risk if deferring. |
| F042 | Dependency & config | `package.json:19-35` | Medium | S | ACTIVE: `@astrojs/check` and `typescript` are operational tooling but live in dependencies, while no `astro check` script exists. | Move build/check-only packages to devDependencies if deploy does not need them at runtime, and add a script. |
| F043 | Dependency & config | `package.json:39-41` | Low | S | ACTIVE: `@iconify-json/lucide` and `@unocss/preset-icons` are flagged unused by depcheck, but icon classes depend on Uno dynamic extraction. | Mark as intentionally retained in depcheck config or document the icon pipeline. |
| F044 | Documentation drift | `docs/astro-seo-graph.md:121-147` | Low | S | UPDATED: IndexNow is now explicitly in "reporté à plus tard", so this is not implementation drift, but the verification section still assumes homepage-rich-result readiness. | Keep as future work; update verification once homepage metadata is real. |
| F045 | Error handling | `src/layouts/html-head/HeadDesign.astro:16-26` | Medium | S | ACTIVE: the early theme boot script calls `localStorage.getItem` without try/catch, unlike `ThemeToggle`; storage-denied browsers can throw before paint. | Wrap storage access in the same safe helper used by `ThemeToggle`. |
| F046 | Consistency rot | `src/components/utils/ThemeToggle.astro:10` | Low | S | ACTIVE: visible site language is French, but the theme button label is English. | Use `aria-label="Changer le thème"`. |
| F047 | Accessibility | `src/components/utils/ThemeToggle.astro:89-94` | Low | S | ACTIVE: a three-state theme cycle uses binary `aria-pressed`, only true for dark mode, and English title text. | Use a menu/radio pattern or expose the current French state in `aria-label`. |
| F048 | Performance & resource | `src/components/header/Header.astro:238` | Low | S | ACTIVE: `DESKTOP_MQ.addEventListener("change", init)` is never removed. Fine for MPA loads, but a leak if Astro View Transitions are enabled later. | Add lifecycle cleanup only if partial navigation lands. |
| F049 | Performance & resource | `src/components/nav/MainNavMobile.astro:136-148` | Low | S | ACTIVE: global `keydown` and `resize` listeners are never removed. Fine for MPA loads, same View Transitions caveat. | Add cleanup alongside any View Transitions migration. |
| F050 | Documentation drift | `keystatic.config.ts:5-6` | Medium | M | ACTIVE: comments say Git LFS and GitHub App setup are prerequisites before moving media/content workflows, but this is only a TODO in code. | Promote this to deployment docs/checklist before editors upload audio/video. |
| F051 | Performance & resource | `keystatic.config.ts:90-97` | Medium | M | NEW: Keystatic allows hosted MP3 paths but the repo has no Git LFS policy in place for audio/video assets. | Add LFS or external media hosting before production editorial use. |
| F052 | Consistency rot | `src/styles/markdown.css:1-417` | Medium | M | NEW: Markdown styling is a 417-line global stylesheet with broad selectors and no doc/test page tied to MDX components. | Split generic prose rules from component-specific media/gallery rules after content stabilizes. |
| F053 | Accessibility | `src/components/mdx/MiniGallery.astro:42-48` | Medium | M | NEW: gallery dialog has no accessible label/heading, only an image and close button. | Add `aria-labelledby`/heading derived from image caption or block title. |
| F054 | Type & contract debt | `keystatic.config.ts:36-55` | Medium | M | NEW: social links and websites are configured as optional arrays with URL fields, but the runtime renderer does not enforce labels/URLs before output. | Make required fields explicit in Keystatic and runtime validation. |
| F055 | Documentation drift | `src/pages/index.astro:11-12` | Medium | S | NEW: homepage exists, but it is placeholder content and still triggers short-title metadata warnings via `siteConfig.title`. | Write real homepage content and expand `siteConfig.title` or page-specific title metadata. |

## Top 5 "if you fix nothing else, fix these"

### 1. F027 + F028 - Validate Keystatic reader output

Replace string coercion with a parser that fails the build on missing required member data:

```ts
const title = requiredString(data.title, "member.title", slug);
const websites = parseLinks(data.websites, "member.websites", slug);
```

This prevents silent empty strings from becoming published pages, schema, and links.

### 2. F031-F038 - Make `pnpm check` green again

Minimal diff shape:

```astro
{members.map((member) => (
  <li key={member.slug} class="t-body">
```

Do the same for nav items (`item.href`), gallery images (`image.src`), social links (`link.url`), and carousel slides. Add audio transcripts or track support.

### 3. F025 + F026 + F055 - Fix published placeholder content

Rémi's member page is currently a Markdown syntax demo with `title: photographe` and `description: photographe`. Replace it with real bio copy, remove `#` headings from bio MDX, and write production homepage metadata.

### 4. F004 + F005 - Add a real quality gate

```json
"test": "vitest run",
"check:astro": "astro check",
"check:all": "pnpm check && pnpm check:astro && pnpm build && pnpm audit"
```

Then run `check:all` in CI. The current regressions are exactly the kind of issues CI should catch before review.

### 5. F012 + F039 - Remove stale local artifacts

Delete `config/design/radius.ts`, move `.worktrees/` outside the repo, and add scanner excludes where needed. Right now audit/dead-code tooling has to distinguish real source from a nested clone.

## Quick wins

- [ ] **F033** - Format `astro.config.mjs`.
- [ ] **F034-F038** - Add stable `key` props to mapped lists.
- [ ] **F031** - Add hosted audio transcript/track support or remove hosted audio until supported.
- [ ] **F012** - Delete `config/design/radius.ts`.
- [ ] **F046** - Translate `ThemeToggle` accessible label.
- [ ] **F045** - Wrap early `localStorage.getItem` in try/catch.
- [ ] **F016-F017** - Remove unused schema API surface.
- [ ] **F006-F007** - Refresh README and SEO doc path table.
- [ ] **F026** - Replace Rémi's SEO title/description.
- [ ] **F055** - Replace placeholder homepage copy.

## Things that look bad but are actually fine

- **`semanticColorsForUno(ColorData.colors.light)` in `uno.config.ts`** - The light palette supplies token keys; emitted values still point to CSS variables. This is not a dark-mode bug.
- **Two stacked logo renders in `Header.astro:12-19`** - This is responsive chrome, not accidental duplication.
- **Inline scripts in Astro components** - For a static MPA, inline scripts are acceptable. The debt is size and lack of tests in `Header.astro`/`MainNavMobile.astro`, not the existence of inline scripts.
- **`src/styles/tokens.css`** - Previously looked orphaned; it is now imported by `src/styles/index.css`.
- **IndexNow docs** - The section is now clearly under "Reporté à plus tard", so not implementing it today is intentional.
- **`@iconify-json/lucide` and `@unocss/preset-icons`** - Depcheck flags them, but the icon classes (`i-lucide-*`) depend on Uno's icon pipeline.
- **Swallowed `localStorage` errors in `ThemeToggle.astro`** - That part is appropriate for privacy/private browsing modes. The unsafe copy is the separate head boot script.
- **`astro check` hints in `MiniGallery.astro`** - The inline-script hint is low-risk today because the script does not import packages; it should still be made explicit when touching the file.

## Open questions for the maintainer

- Is `+33 6 12 34 56 78` a real association phone number or placeholder?
- Should member MDX allow arbitrary Markdown headings, or should member bios start at `##`/`###` only because `MemberShell` owns the page `<h1>`?
- Are hosted audio/video files expected to be committed to Git, tracked with Git LFS, or hosted externally?
- Should Keystatic remain local-only indefinitely, or is GitHub storage still planned?
- Should `/schema/page.json` intentionally repeat site-wide graph entities per entry for consumer convenience?
- Is raw `tsc --noEmit` meant to be a supported gate, or should `astro check` be the only type-check command?
- Should the footer stay commented out in `Layout.astro`, or is that temporary while nav/header work continues?

---

## Tooling notes

| Tool | Result |
| --- | --- |
| `pnpm check` | Fails: 16 Biome errors across formatting, media captions, and missing iterable keys |
| `pnpm exec astro check` | Passes with 3 hints (`MiniGallery` inline-script hint; unused footer imports from commented footer) |
| `pnpm exec tsc --noEmit` | Fails: `.astro` imports in `src/components/mdx/index.ts` are unresolved |
| `pnpm build` | Passes; builds 8 pages; warns on duplicate H1 for `membres/remi-jennequin` and short metadata for homepage/member page |
| `pnpm audit` | Fails with findings: moderate `yaml`, low `esbuild` |
| `pnpm dlx knip --reporter compact` | Runs but noisy due `.worktrees` and Astro aliases; confirms dead `config/design/radius.ts` |
| `pnpm dlx madge --circular src config` | Reports no circular dependencies, but processed 0 files, so treat as inconclusive |
| `pnpm dlx depcheck` | Runs but noisy on Astro aliases and Uno dynamic icon packages |
| Coverage | No test runner configured |

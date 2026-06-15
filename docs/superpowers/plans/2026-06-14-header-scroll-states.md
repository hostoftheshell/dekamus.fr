# Header Scroll Visual States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five scroll-driven visual states to the full site header (transparent → blurred → hide on scroll down → reveal on scroll up → transparent at top).

**Architecture:** Vanilla JS state machine in [`Header.astro`](../../src/components/header/Header.astro) toggles `is-at-top`, `is-scrolled`, `is-header-hidden` on `<header>`. Background/blur moves from always-on `.header-pill-host` styles to `.is-scrolled` only. `requestAnimationFrame` throttles scroll updates. MainNavDesktop unchanged.

**Tech Stack:** Astro 6, UnoCSS utilities on header, CSS custom properties (`--color-bgAlt`), existing pill script in Header.

**Spec:** [`docs/superpowers/specs/2026-06-14-header-scroll-states-design.md`](../specs/2026-06-14-header-scroll-states-design.md)

---

## File map

| File | Change |
|------|--------|
| [`src/components/header/Header.astro`](../../src/components/header/Header.astro) | Header classes, scroll script, conditional bg/blur CSS |
| [`src/components/nav/MainNavDesktop.astro`](../../src/components/nav/MainNavDesktop.astro) | No functional changes |

---

### Task 1: Reset header base styles

**Files:**

- Modify: `src/components/header/Header.astro`

- [ ] **Step 1: Update `<header>` markup**

```astro
<header
class="site-header is-at-top sticky top-0 z-50 w-full p-4 transition-transform duration-300 ease-out"
>
```

- [ ] **Step 2: Remove always-on background from `.header-pill-host`**

Replace current rule:

```css
.header-pill-host {
background-color: oklch(from var(--color-bgAlt) l c h / 0.8);
backdrop-filter: blur(10px);
border-radius: var(--radius-md);
}
```

With:

```css
.header-pill-host {
border-radius: var(--radius-md);
background-color: transparent;
backdrop-filter: none;
transition:
background-color 200ms ease,
backdrop-filter 200ms ease;
}

.site-header.is-scrolled .header-pill-host {
background-color: oklch(from var(--color-bgAlt) l c h / 0.8);
backdrop-filter: blur(10px);
}
```

- [ ] **Step 3: Add hidden transform rule**

```css
.site-header.is-header-hidden {
transform: translateY(-100%);
}

@media (prefers-reduced-motion: reduce) {
.site-header {
transition: none;
}
}
```

---

### Task 2: Scroll state script

**Files:**

- Modify: `src/components/header/Header.astro` (second `<script>` block or merge into one IIFE)

- [ ] **Step 1: Add scroll controller**

Append a new IIFE after the pill script (keep pill logic separate for clarity):

```ts
(() => {
const THRESHOLD = 50;
const header = document.querySelector<HTMLElement>(".site-header");
if (!header) return;

let lastScrollY = window.scrollY;
let ticking = false;

function applyScrollState() {
const scrollY = window.scrollY;
const scrollingDown = scrollY > lastScrollY;
const atTop = scrollY <= THRESHOLD;

header.classList.toggle("is-at-top", atTop);
header.classList.toggle("is-scrolled", !atTop);

if (atTop) {
			header.classList.remove("is-header-hidden");
		} else if (scrollY < lastScrollY) {
			header.classList.remove("is-header-hidden");
		} else if (scrollingDown && lastScrollY > THRESHOLD) {
			header.classList.add("is-header-hidden");
		}

		lastScrollY = scrollY;
		ticking = false;
	}

	function onScroll() {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(applyScrollState);
		}
	}

	applyScrollState();
	window.addEventListener("scroll", onScroll, { passive: true });
})();
```

- [ ] **Step 2: Verify initial load**

At `scrollY === 0`, header has `is-at-top`, lacks `is-scrolled` and `is-header-hidden`.

---

### Task 3: Verification

**Files:** none (commands only)

- [ ] **Step 1: Lint**

```bash
pnpm run check
```

Expected: exit 0

- [ ] **Step 2: Build**

```bash
pnpm run build
```

Expected: exit 0

- [ ] **Step 3: Manual scroll checklist**

| Action | Expected class state |
|--------|---------------------|
| Page load | `is-at-top`, no blur |
| Scroll to 60px | `is-scrolled`, blur visible, not hidden |
| Scroll to 200px | `is-header-hidden`, `-translate-y-full` |
| Scroll up at 150px | hidden removed, `is-scrolled` kept |
| Scroll to top | `is-at-top`, transparent |

- [ ] **Step 4: Pill smoke test**

Desktop: hover Logo → nav links → ThemeToggle while scrolled; pill still tracks targets.

---

## Self-review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| State 1 transparent at top | Task 1 + 2 `is-at-top` |
| State 2 blur past 50px | Task 1 `.is-scrolled` styles |
| State 3 hide on continued scroll down | Task 2 `lastScrollY > THRESHOLD` |
| State 4 reveal on scroll up | Task 2 `scrollY < lastScrollY` |
| State 5 transparent at top | Task 2 `atTop` branch |
| Full header scope | Task 1 `site-header` |
| Pill preserved | Task 3 step 4 |
| Reduced motion | Task 1 media query |
| No astro-scroll-observer | N/A (vanilla only) |

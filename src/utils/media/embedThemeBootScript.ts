/** Inline boot script: set themed iframe src before first paint (head theme script already ran). */
/** Theme URL rules mirror normalizeEmbed.ts — keep both in sync. */
export const EMBED_THEME_BOOT_SCRIPT = String.raw`(function () {
	if (window.__dekamusEmbedThemeBoot) return;
	window.__dekamusEmbedThemeBoot = true;

	var VIMEO_DARK_COLORS = "000000,00adef,ffffff,000000";

	function scheme() {
		var root = document.documentElement;
		var inline = root.style.colorScheme;
		if (inline === "dark" || inline === "light") return inline;

		var dataTheme = root.dataset.theme;
		if (dataTheme === "dark" || dataTheme === "light") return dataTheme;

		try {
			var stored = localStorage.getItem("theme:mode");
			if (stored === "dark" || stored === "light") return stored;
		} catch {}

		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}

	function applyTheme(platform, url, colorScheme) {
		try {
			var parsed = new URL(url);
		} catch {
			return url;
		}

		if (platform === "vimeo") {
			if (colorScheme === "dark") {
				parsed.searchParams.set("transparent", "0");
				parsed.searchParams.set("colors", VIMEO_DARK_COLORS);
			} else {
				parsed.searchParams.delete("transparent");
				parsed.searchParams.delete("colors");
			}
			return parsed.toString();
		}

		return url;
	}

	function boot() {
		document
			.querySelectorAll("iframe[data-embed-base][data-embed-platform]")
			.forEach(syncIframe);
	}

	function syncIframe(iframe) {
		var base = iframe.dataset.embedBase;
		var platform = iframe.dataset.embedPlatform;
		if (!base || !platform) return;
		var themed = applyTheme(platform, base, scheme());
		if (iframe.dataset.embedThemedSrc !== themed) {
			iframe.dataset.embedThemedSrc = themed;
			iframe.src = themed;
		}
	}

	window.__dekamusSyncThemedEmbeds = boot;
	window.__dekamusApplyEmbedTheme = syncIframe;

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();`;

export type SiteColorScheme = "light" | "dark";

const THEME_STORAGE_KEY = "theme:mode";

export function getSiteColorScheme(): SiteColorScheme {
	const root = document.documentElement;
	const inline = root.style.colorScheme;
	if (inline === "dark" || inline === "light") return inline;

	const dataTheme = root.dataset.theme;
	if (dataTheme === "dark" || dataTheme === "light") return dataTheme;

	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		if (stored === "dark" || stored === "light") return stored;
	} catch {
		// ignore
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

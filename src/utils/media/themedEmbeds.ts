import {
	applyVideoEmbedTheme,
	type VideoEmbedPlatform,
} from "@utils/media/normalizeEmbed";
import {
	getSiteColorScheme,
	type SiteColorScheme,
} from "@utils/theme/resolveSiteColorScheme";

const THEMED_VIDEO_PLATFORMS = new Set<VideoEmbedPlatform>(["vimeo"]);

function syncThemedEmbed(
	iframe: HTMLIFrameElement,
	scheme: SiteColorScheme,
): void {
	const base = iframe.dataset.embedBase;
	const platform = iframe.dataset.embedPlatform;
	if (!base || !platform) return;
	if (!THEMED_VIDEO_PLATFORMS.has(platform as VideoEmbedPlatform)) return;

	const themedSrc = applyVideoEmbedTheme(
		platform as VideoEmbedPlatform,
		base,
		scheme,
	);

	if (iframe.dataset.embedThemedSrc !== themedSrc) {
		iframe.dataset.embedThemedSrc = themedSrc;
		iframe.src = themedSrc;
	}
}

function syncAllThemedEmbeds(): void {
	const scheme = getSiteColorScheme();
	document
		.querySelectorAll<HTMLIFrameElement>(
			"iframe[data-embed-base][data-embed-platform]",
		)
		.forEach((iframe) => syncThemedEmbed(iframe, scheme));
}

export function initThemedEmbeds(): void {
	syncAllThemedEmbeds();
	document.addEventListener("dekamus:theme-change", syncAllThemedEmbeds);
}

/** Resolve themed src for dynamically created iframes (e.g. Dailymotion facade). */
export function resolveThemedEmbedSrc(
	platform: string,
	base: string,
	scheme: SiteColorScheme = getSiteColorScheme(),
): string {
	if (THEMED_VIDEO_PLATFORMS.has(platform as VideoEmbedPlatform)) {
		return applyVideoEmbedTheme(platform as VideoEmbedPlatform, base, scheme);
	}
	return base;
}

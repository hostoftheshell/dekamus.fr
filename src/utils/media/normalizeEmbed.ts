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
	const trimmed = value.trim();
	if (!trimmed) return { valid: false, reason: "empty" };

	const patterns = [
		/dailymotion\.com\/player\.html\?video=([\w]+)/,
		/dailymotion\.com\/embed\/video\/([\w]+)/,
		/dailymotion\.com\/video\/([\w]+)/,
	];

	for (const pattern of patterns) {
		const match = trimmed.match(pattern);
		if (match?.[1]) return { valid: true, value: match[1] };
	}

	return { valid: false, reason: "not a Dailymotion URL" };
}

export function videoEmbedSrc(
	platform: "youtube" | "vimeo" | "dailymotion",
	url: string,
	options?: { embedOrigin?: string },
): NormalizeResult<string> {
	if (platform === "youtube") {
		const id = youtubeId(url);
		if (!id.valid) return id;

		const params = new URLSearchParams();
		if (options?.embedOrigin) {
			params.set("origin", options.embedOrigin);
		}
		const query = params.toString();

		return {
			valid: true,
			value: `https://www.youtube.com/embed/${id.value}${query ? `?${query}` : ""}`,
		};
	}
	if (platform === "vimeo") {
		const id = vimeoId(url);
		return id.valid
			? { valid: true, value: `https://player.vimeo.com/video/${id.value}` }
			: id;
	}
	const trimmed = url.trim();
	if (/^https:\/\/geo\.dailymotion\.com\/player\.html\?video=[\w]+/.test(trimmed)) {
		return { valid: true, value: trimmed };
	}
	if (/^https:\/\/www\.dailymotion\.com\/embed\/video\/[\w]+/.test(trimmed)) {
		return { valid: true, value: trimmed };
	}

	const id = dailymotionId(url);
	return id.valid
		? {
				valid: true,
				value: `https://geo.dailymotion.com/player.html?video=${id.value}`,
			}
		: id;
}

export function extractAudioEmbedUrl(url: string): NormalizeResult<string> {
	const trimmed = url.trim();
	if (!trimmed) return { valid: false, reason: "empty" };
	try {
		new URL(trimmed);
		return { valid: true, value: trimmed };
	} catch {
		return { valid: false, reason: "invalid URL" };
	}
}

export type AudioEmbedPlatform =
	| "spotify"
	| "deezer"
	| "soundcloud"
	| "radio-france"
	| "arte";

export type VideoEmbedPlatform = "youtube" | "vimeo" | "dailymotion";

/** Vimeo dark letterbox + colors — mirrored in embedThemeBootScript.ts */
const VIMEO_DARK_COLORS = "000000,00adef,ffffff,000000";

export function applyVideoEmbedTheme(
	platform: VideoEmbedPlatform,
	url: string,
	scheme: "light" | "dark",
): string {
	if (platform !== "vimeo") return url;

	const parsed = new URL(url);
	if (scheme === "dark") {
		parsed.searchParams.set("transparent", "0");
		parsed.searchParams.set("colors", VIMEO_DARK_COLORS);
	} else {
		parsed.searchParams.delete("transparent");
		parsed.searchParams.delete("colors");
	}
	return parsed.toString();
}

/** Fixed iframe heights — required for cross-browser embed rendering (esp. Firefox). */
export function audioEmbedHeight(
	platform: "spotify" | "deezer" | "soundcloud" | "radio-france" | "arte",
): number {
	const heights = {
		spotify: 152,
		deezer: 92,
		soundcloud: 166,
		"radio-france": 144,
		arte: 375,
	} as const;
	return heights[platform];
}

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
			? {
					valid: true,
					value: `https://www.youtube-nocookie.com/embed/${id.value}`,
				}
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
		? {
				valid: true,
				value: `https://www.dailymotion.com/embed/video/${id.value}`,
			}
		: id;
}

export function extractAudioEmbedUrl(
	_platform: "spotify" | "deezer" | "soundcloud" | "radio-france" | "arte",
	url: string,
): NormalizeResult<string> {
	const trimmed = url.trim();
	if (!trimmed) return { valid: false, reason: "empty" };
	try {
		new URL(trimmed);
		return { valid: true, value: trimmed };
	} catch {
		return { valid: false, reason: "invalid URL" };
	}
}

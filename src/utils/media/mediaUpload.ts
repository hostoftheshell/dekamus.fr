export const AUDIO_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
export const VIDEO_UPLOAD_MAX_BYTES = 50 * 1024 * 1024;
export const VTT_UPLOAD_MAX_BYTES = 512 * 1024;

export const AUDIO_EXTENSIONS = new Set([
	".mp3",
	".m4a",
	".aac",
	".wav",
	".ogg",
]);
export const VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);
export const VTT_EXTENSIONS = new Set([".vtt"]);

export type MediaUploadKind = "audio" | "video" | "vtt";

export function mediaUploadMaxBytes(kind: MediaUploadKind): number {
	if (kind === "audio") return AUDIO_UPLOAD_MAX_BYTES;
	if (kind === "video") return VIDEO_UPLOAD_MAX_BYTES;
	return VTT_UPLOAD_MAX_BYTES;
}

export function mediaUploadExtensions(kind: MediaUploadKind): Set<string> {
	if (kind === "audio") return AUDIO_EXTENSIONS;
	if (kind === "video") return VIDEO_EXTENSIONS;
	return VTT_EXTENSIONS;
}

export function mediaUploadDirectory(kind: MediaUploadKind): string {
	if (kind === "video") return "public/videos/membres";
	return "public/audio/membres";
}

export function mediaUploadPublicPrefix(kind: MediaUploadKind): string {
	if (kind === "video") return "/videos/membres";
	return "/audio/membres";
}

export function formatUploadBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} o`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function sanitizeUploadFilename(name: string): string {
	const base = name.replace(/[/\\]/g, "").replace(/\.\./g, "").trim();
	return base || "fichier";
}

export function sanitizeMemberSlug(slug: string): string | null {
	return /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

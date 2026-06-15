/** Normalize paths for nav active-state comparison. */
import type { NavHref } from "@config/types";

export function toNavHref(path: `/${string}`): NavHref {
	if (path === "/") return "/";
	return `${path}/`;
}

export function normalizeNavPath(path: string): string {
	const trimmed = path.replace(/\/$/, "");
	return trimmed === "" ? "/" : trimmed;
}

export function isExternalHref(href: string): boolean {
	return href.startsWith("http") || href.startsWith("//");
}

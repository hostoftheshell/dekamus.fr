import type { PageMeta } from "@config/types";

export function layoutProps(meta: PageMeta) {
	return {
		title: meta.title,
		description: meta.description,
		noindex: meta.noindex ?? false,
		ogImage: meta.ogImage,
	};
}

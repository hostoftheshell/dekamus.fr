/* config/types/page-meta.d.ts */

export type NavGroup = "main" | "legal";

export interface PageMeta {
	key: string;
	path: `/${string}`;
	title: string;
	description: string;
	titleNav?: string;
	navGroup?: NavGroup;
	noindex?: boolean;
	ogImage?: string;
}

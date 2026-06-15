/* config/types/content/navigation.d.ts */

/** Internal paths or absolute external URLs */
export type NavHref = `/${string}` | "/" | `http${string}` | `//${string}`;

export interface NavItem {
	href: NavHref;
	label: string;
	/** Force new tab even for internal links (rare; prefer automatic external detection) */
	newTab?: boolean;
}

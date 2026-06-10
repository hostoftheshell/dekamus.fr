import { members } from "@config/content/members";
import { getPageByPath, sitemapPages } from "@config/content/pages";
import {
	assembleGraph,
	buildBreadcrumbList,
	buildWebPage,
	type GraphEntity,
} from "@jdevalk/seo-graph-core";
import { ids, SITE_URL, siteWidePieces } from "./site-wide";

function siteWideEntities() {
	return siteWidePieces();
}

function breadcrumbItems(url: string, title: string) {
	const items = [{ name: "Accueil", url: `${SITE_URL}/` }];
	const pathname = new URL(url).pathname;
	const normalizedPath = pathname.replace(/\/$/, "") || "/";

	if (normalizedPath !== "/") {
		const pageMeta = getPageByPath(normalizedPath);
		const member = members.find((m) => `/membres/${m.slug}` === normalizedPath);
		const label =
			pageMeta?.titleNav ?? member?.titleNav ?? member?.name ?? title;
		items.push({ name: label, url });
	}

	return items;
}

export type PageType = "webPage";

export function buildSchemaGraph(opts: {
	pageType?: PageType;
	url: string;
	title: string;
	description: string;
}) {
	const { url, title, description } = opts;
	const pieces = [...siteWideEntities()];

	pieces.push(
		buildBreadcrumbList({ url, items: breadcrumbItems(url, title) }, ids),
		buildWebPage(
			{
				url,
				name: title,
				description,
				isPartOf: { "@id": ids.website },
				breadcrumb: { "@id": ids.breadcrumb(url) },
			},
			ids,
		),
	);

	return assembleGraph(pieces as GraphEntity[], {
		warnOnDanglingReferences: true,
	});
}

export function buildPageSchemaPieces(opts: {
	url: string;
	title: string;
	description: string;
}) {
	const { url, title, description } = opts;

	return [
		buildBreadcrumbList({ url, items: breadcrumbItems(url, title) }, ids),
		buildWebPage(
			{
				url,
				name: title,
				description,
				isPartOf: { "@id": ids.website },
				breadcrumb: { "@id": ids.breadcrumb(url) },
			},
			ids,
		),
	];
}

export function allSchemaPages(): Array<{
	path: string;
	title: string;
	description: string;
}> {
	return [
		...sitemapPages().map((page) => ({
			path: page.path,
			title: page.title,
			description: page.description,
		})),
		...members.map((member) => ({
			path: `/membres/${member.slug}`,
			title: member.title,
			description: member.description,
		})),
	];
}

export { ids, organizationId, SITE_URL, siteWidePieces } from "./site-wide";

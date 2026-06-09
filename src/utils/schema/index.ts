import { siteConfig } from "@config/site";
import {
	assembleGraph,
	buildBreadcrumbList,
	buildPiece,
	buildSiteNavigationElement,
	buildWebPage,
	buildWebSite,
	type GraphEntity,
	makeIds,
} from "@jdevalk/seo-graph-core";

const SITE_URL = siteConfig.url.replace(/\/$/, "");

export const ids = makeIds({ siteUrl: SITE_URL });

const organizationId = ids.organization("dekamus");

function siteWideEntities() {
	return [
		buildPiece({
			"@type": "Organization",
			"@id": organizationId,
			name: siteConfig.organization.legalName,
			url: `${SITE_URL}/`,
		}),
		buildWebSite(
			{
				url: `${SITE_URL}/`,
				name: siteConfig.name,
				publisher: { "@id": organizationId },
			},
			ids,
		),
		buildSiteNavigationElement(
			{
				name: "Navigation principale",
				isPartOf: { "@id": ids.website },
				items: [{ name: "Accueil", url: `${SITE_URL}/` }],
			},
			ids,
		),
	];
}

function breadcrumbItems(url: string, title: string) {
	const items = [{ name: "Accueil", url: `${SITE_URL}/` }];
	const pathname = new URL(url).pathname;

	if (pathname !== "/" && pathname !== "") {
		items.push({ name: title, url });
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

export const staticPages = [
	{
		path: "/",
		title: siteConfig.title,
		description: siteConfig.description,
	},
] as const;

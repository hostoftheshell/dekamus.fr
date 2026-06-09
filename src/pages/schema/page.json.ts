import { siteConfig } from "@config/site";
import { createSchemaEndpoint } from "@jdevalk/astro-seo-graph";
import {
	buildPiece,
	buildSiteNavigationElement,
	buildWebSite,
	type GraphEntity,
} from "@jdevalk/seo-graph-core";
import { buildPageSchemaPieces, ids, staticPages } from "@utils/schema";

type StaticPage = (typeof staticPages)[number];

const SITE_URL = siteConfig.url.replace(/\/$/, "");
const organizationId = ids.organization("dekamus");

function siteWidePieces() {
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

export const GET = createSchemaEndpoint<StaticPage>({
	entries: async () => [...staticPages],
	mapper: (page): GraphEntity[] => {
		const url = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;

		return [
			...siteWidePieces(),
			...buildPageSchemaPieces({
				url,
				title: page.title,
				description: page.description,
			}),
		] as GraphEntity[];
	},
});

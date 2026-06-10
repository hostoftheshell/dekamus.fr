import { createSchemaEndpoint } from "@jdevalk/astro-seo-graph";
import type { GraphEntity } from "@jdevalk/seo-graph-core";
import { allSchemaPages, buildPageSchemaPieces } from "@utils/schema";
import { SITE_URL, siteWidePieces } from "@utils/schema/site-wide";

export const GET = createSchemaEndpoint({
	entries: async () => allSchemaPages(),
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

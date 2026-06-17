import { getMemberProfiles } from "@config/content/members";
import { createSchemaEndpoint } from "@jdevalk/astro-seo-graph";
import type { MemberProfile } from "@config/types";
import type { GraphEntity } from "@jdevalk/seo-graph-core";
import { allSchemaPages, buildPageSchemaPieces } from "@utils/schema";
import { SITE_URL, siteWidePieces } from "@utils/schema/site-wide";

let membersForSchema: MemberProfile[] = [];

export const GET = createSchemaEndpoint({
	entries: async () => {
		membersForSchema = await getMemberProfiles();
		return allSchemaPages(membersForSchema);
	},
	mapper: (page): GraphEntity[] => {
		const url = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;

		return [
			...siteWidePieces(),
			...buildPageSchemaPieces({
				url,
				title: page.title,
				description: page.description,
				members: membersForSchema,
			}),
		] as GraphEntity[];
	},
});

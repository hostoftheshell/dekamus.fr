import { siteConfig } from "@config/site";
import { createSchemaMap } from "@jdevalk/astro-seo-graph";

export const GET = createSchemaMap({
	siteUrl: siteConfig.url,
	entries: [{ path: "/schema/page.json", lastModified: new Date() }],
});

import { siteConfig } from "@config/site";
import { createApiCatalog } from "@jdevalk/astro-seo-graph";

export const GET = createApiCatalog({
	siteUrl: siteConfig.url,
	schemaEndpoints: [{ path: "/schema/page.json", schemaType: "WebPage" }],
	schemaMap: { path: "/schemamap.xml" },
});

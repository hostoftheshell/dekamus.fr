import { siteConfig } from "@config/content/site";
import type { HeadProps, MemberProfile } from "@config/types";
import { buildSchemaGraph } from "@utils/schema";

export function formatPageTitle(pageTitle: string): string {
	return pageTitle === siteConfig.title
		? siteConfig.title
		: `${pageTitle} | ${siteConfig.name}`;
}

export function resolveHeadMeta(
	props: HeadProps,
	url: string,
	members: MemberProfile[],
) {
	const pageTitle = props.title ?? siteConfig.title;
	const description = props.description ?? siteConfig.description;
	const ogImage =
		props.ogImage ?? `${siteConfig.url}${siteConfig.og.defaultImage}`;
	const noindex = props.noindex ?? false;
	const title = formatPageTitle(pageTitle);

	const graph = buildSchemaGraph({
		pageType: "webPage",
		url,
		title,
		description,
		members,
	});

	return { title, description, ogImage, noindex, graph };
}

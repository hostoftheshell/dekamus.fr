import { headerNavMobile, legalNav } from "@config/content/navigation";
import { siteConfig } from "@config/content/site";
import {
	buildPiece,
	buildSiteNavigationElement,
	buildWebSite,
	makeIds,
} from "@jdevalk/seo-graph-core";
import { isExternalHref } from "@utils/nav-path";

export const SITE_URL = siteConfig.url.replace(/\/$/, "");

export const ids = makeIds({ siteUrl: SITE_URL });

export const organizationId = ids.organization("dekamus");

const legalNavId = `${SITE_URL}/#/schema.org/SiteNavigationElement/legal`;

function navItemUrl(href: string): string {
	if (isExternalHref(href)) {
		return href.startsWith("//") ? `https:${href}` : href;
	}
	return href === "/" ? `${SITE_URL}/` : `${SITE_URL}${href}`;
}

function buildOrganizationPiece() {
	const org = siteConfig.organization;

	return buildPiece({
		"@type": "Organization",
		"@id": organizationId,
		name: org.legalName,
		url: `${SITE_URL}/`,
		foundingDate: org.foundingDate,
		identifier: [
			{
				"@type": "PropertyValue",
				propertyID: "SIREN",
				value: org.identifierSiren,
			},
			{
				"@type": "PropertyValue",
				propertyID: "SIRET",
				value: org.identifierSiret,
			},
		],
		address: {
			"@type": "PostalAddress",
			streetAddress: org.address.street,
			addressLocality: org.address.locality,
			postalCode: org.address.postalCode,
			addressRegion: org.address.regionLabel,
			addressCountry: org.address.countryISO,
		},
		contactPoint: {
			"@type": "ContactPoint",
			email: org.contact.email,
			telephone: org.contact.phone.display,
			contactType: "customer service",
		},
	});
}

export function siteWidePieces() {
	const mainNavItems = headerNavMobile.map((item) => ({
		name: item.label,
		url: navItemUrl(item.href),
	}));

	const legalNavParts = legalNav.map((item) => ({
		"@type": "SiteNavigationElement" as const,
		name: item.label,
		url: navItemUrl(item.href),
	}));

	return [
		buildOrganizationPiece(),
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
				items: mainNavItems,
			},
			ids,
		),
		buildPiece({
			"@type": "SiteNavigationElement",
			"@id": legalNavId,
			name: "Navigation légale",
			isPartOf: { "@id": ids.website },
			hasPart: legalNavParts,
		}),
	];
}

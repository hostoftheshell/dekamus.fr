/* config/content/site.ts */

import type { SiteConfig } from "@config/types";

export const siteConfig = {
	name: "Dekamus",
	title: "Dekamus",
	description:
		"Site officiel de l'association Dekamus : actualités, activités et informations pour les membres et visiteurs.",
	url: "https://dekamus.fr",
	locale: "fr_FR",
	lang: "fr",
	organization: {
		legalName: "Dekamus",
		legalFormLabel: "Association déclarée",
		legalFormISO: "LOI1901",
		foundingDate: "2025-12-02",
		activityCode: "59.11B",
		activityDescription: "Production de films institutionnels et publicitaires",
		identifierSiren: "995194479",
		identifierSiret: "99519447900011",
		address: {
			street: "12 rue André Basdevant",
			locality: "Anost",
			postalCode: "71550",
			regionLabel: "Bourgogne-Franche-Comté",
			regionISO: "BFC",
			departmentLabel: "Saône-et-Loire",
			departmentISO: "71",
			countryLabel: "France",
			countryISO: "FR",
		},
		contact: {
			email: "contact@dekamus.fr",
			phone: {
				display: "+33 6 12 34 56 78",
				link: "tel:+33612345678",
			},
			website: {
				url: "https://dekamus.fr",
				developer: {
					name: "Baptiste Chénin",
					url: "https://baptistechenin.com",
					email: "contact@baptistechenin.com",
					identifierSiret: "792 564 1140 0025",
				},
			},
			hosting: {
				name: "Cloudflare, Inc.",
				address: "101 Townsend St, San Francisco, CA 94107, États-Unis",
				url: "https://www.cloudflare.com",
				privacyPolicyUrl: "https://www.cloudflare.com/privacypolicy/",
			},
		},
	},
	og: {
		defaultImage: "/og/default.jpg",
		width: 1200,
		height: 675,
	},
} satisfies SiteConfig;

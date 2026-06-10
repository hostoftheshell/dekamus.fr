/* config/content/pages.ts */

import { siteConfig } from "@config/content/site";
import type { NavGroup, PageMeta } from "@config/types";

export const pages = {
	home: {
		key: "home",
		path: "/",
		title: siteConfig.title,
		description: siteConfig.description,
		titleNav: "Accueil",
		navGroup: "main",
	},
	membres: {
		key: "membres",
		path: "/membres",
		title: "Membres de l'association Dekamus",
		description:
			"Découvrez les membres du bureau et de l'équipe de l'association Dekamus : rôles, contacts et profils publics.",
		titleNav: "Membres",
		navGroup: "main",
	},
	mentionsLegales: {
		key: "mentionsLegales",
		path: "/legales/mentions-legales",
		title: "Mentions légales de l'association Dekamus",
		description:
			"Mentions légales du site dekamus.fr : éditeur, hébergeur, directeur de publication et coordonnées de l'association Dekamus.",
		titleNav: "Mentions légales",
		navGroup: "legal",
	},
	politiqueConfidentialite: {
		key: "politiqueConfidentialite",
		path: "/legales/politique-confidentialite",
		title: "Politique de confidentialité — Dekamus",
		description:
			"Politique de confidentialité et protection des données personnelles sur dekamus.fr : cookies, durées de conservation et droits RGPD.",
		titleNav: "Confidentialité",
		navGroup: "legal",
	},
	notFound: {
		key: "notFound",
		path: "/404",
		title: "Page introuvable — erreur 404",
		description:
			"La page demandée est introuvable sur le site officiel de l'association Dekamus. Retournez à l'accueil pour poursuivre votre visite.",
		noindex: true,
	},
} satisfies Record<string, PageMeta>;

export const pageList: PageMeta[] = Object.values(pages);

export function getPage(key: keyof typeof pages): PageMeta {
	return pages[key];
}

export function getPageByPath(path: string): PageMeta | undefined {
	const normalized = path === "" ? "/" : path.replace(/\/$/, "") || "/";
	return pageList.find((page) => page.path === normalized);
}

export function navPages(group: NavGroup): PageMeta[] {
	return pageList.filter((page) => page.navGroup === group);
}

export function sitemapPages(): PageMeta[] {
	return pageList.filter((page) => page.key !== "notFound");
}

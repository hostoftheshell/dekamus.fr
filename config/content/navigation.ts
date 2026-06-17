/* config/content/navigation.ts */

import { navPages } from "@config/content/pages";
import type { MemberProfile, NavItem, PageMeta } from "@config/types";
import { toNavHref } from "@utils/nav-path";

function pageToNavItem(page: PageMeta): NavItem {
	return {
		href: toNavHref(page.path),
		label: page.titleNav ?? page.title,
	};
}

function memberToNavItem(member: MemberProfile): NavItem {
	return {
		href: `/membres/${member.slug}/`,
		label: member.titleNav ?? member.name,
	};
}

const mainPages = navPages("main");

export const legalNav: NavItem[] = navPages("legal").map((page) =>
	pageToNavItem(page),
);

export const footerNav: NavItem[] = mainPages.map((page) =>
	pageToNavItem(page),
);

export const headerNavMobile: NavItem[] = mainPages.map((page) =>
	pageToNavItem(page),
);

export const headerNavDesktop: NavItem[] = mainPages
	.filter((page) => page.key !== "home")
	.map((page) => pageToNavItem(page));

export function buildMemberNav(members: MemberProfile[]): NavItem[] {
	return members.map(memberToNavItem);
}

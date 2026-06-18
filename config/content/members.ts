/* config/content/members.ts */

import type { Member, MemberCoordonnees, MemberProfile } from "@config/types";
import { reader } from "../../src/keystatic/reader";

let membersCache: Member[] | null = null;

function toMemberProfile(
	slug: string,
	data: Record<string, unknown>,
): MemberProfile {
	return {
		slug,
		name: String(data.name ?? ""),
		role: String(data.role ?? ""),
		title: String(data.title ?? ""),
		description: String(data.description ?? ""),
		titleNav: data.titleNav ? String(data.titleNav) : undefined,
	};
}

function toCoordonnees(data: Record<string, unknown>): MemberCoordonnees {
	const address = (data.address ?? {}) as Record<string, string>;
	const socialLinks = Array.isArray(data.socialLinks)
		? data.socialLinks.map((link: Record<string, string>) => ({
				label: String(link.label ?? ""),
				url: String(link.url ?? ""),
			}))
		: [];
	const websites = Array.isArray(data.websites)
		? data.websites.map((site: Record<string, string>) => ({
				label: String(site.label ?? ""),
				url: String(site.url ?? ""),
			}))
		: [];

	return {
		email: String(data.email ?? ""),
		phone: String(data.phone ?? ""),
		address: {
			street: String(address.street ?? ""),
			postalCode: String(address.postalCode ?? ""),
			city: String(address.city ?? ""),
		},
		socialLinks,
		websites,
	};
}

export async function getMembers(): Promise<Member[]> {
	if (membersCache) return membersCache;

	const slugs = await reader.collections.membres.list();
	const members = await Promise.all(
		slugs.map(async (slug) => {
			const entry = await reader.collections.membres.read(slug);
			if (!entry) return null;

			const data = entry as Record<string, unknown>;
			const profile = toMemberProfile(slug, data);

			return {
				...profile,
				coordonnees: toCoordonnees(data),
			} satisfies Member;
		}),
	);

	membersCache = members.filter((m): m is Member => m !== null);
	return membersCache;
}

export async function getMemberBySlug(
	slug: string,
): Promise<Member | undefined> {
	const members = await getMembers();
	return members.find((member) => member.slug === slug);
}

export async function getMemberProfiles(): Promise<MemberProfile[]> {
	const members = await getMembers();
	return members.map(({ coordonnees: _c, ...profile }) => profile);
}

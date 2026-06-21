/* config/content/members.ts */

import type { Member, MemberCoordonnees, MemberProfile } from "@config/types";
import { reader } from "../../src/keystatic/reader";
import {
	optionalString,
	parseAddress,
	parseEmail,
	parseLinks,
	parsePhone,
	requiredString,
} from "./parse";

let membersCache: Member[] | null = null;

function toMemberProfile(
	slug: string,
	data: Record<string, unknown>,
): MemberProfile {
	return {
		slug,
		name: requiredString(data.name, "member.name", slug),
		role: requiredString(data.role, "member.role", slug),
		title: requiredString(data.title, "member.title", slug),
		description: requiredString(data.description, "member.description", slug),
		titleNav: optionalString(data.titleNav, "member.titleNav", slug),
	};
}

function toCoordonnees(
	slug: string,
	data: Record<string, unknown>,
): MemberCoordonnees {
	return {
		email: parseEmail(data.email, "member.email", slug),
		phone: parsePhone(data.phone, "member.phone", slug),
		address: parseAddress(data.address, "member.address", slug),
		socialLinks: parseLinks(data.socialLinks, "member.socialLinks", slug),
		websites: parseLinks(data.websites, "member.websites", slug),
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
				coordonnees: toCoordonnees(slug, data),
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

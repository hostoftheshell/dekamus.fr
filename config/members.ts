/* config/members.ts */

import type { MemberProfile } from "@config/types";

export const members = [
	{
		slug: "alice",
		name: "Alice Martin",
		role: "Présidente",
		title: "Alice Martin — Présidente de Dekamus",
		description:
			"Profil d'Alice Martin, présidente de l'association Dekamus : rôle au sein du bureau et informations de contact publiques.",
		titleNav: "Alice Martin",
	},
	{
		slug: "brice",
		name: "Brice Dupont",
		role: "Trésorier",
		title: "Brice Dupont — Trésorier de Dekamus",
		description:
			"Profil de Brice Dupont, trésorier de l'association Dekamus : missions, responsabilités et coordonnées accessibles aux membres.",
		titleNav: "Brice Dupont",
	},
] satisfies MemberProfile[];

export function getMemberBySlug(slug: string): MemberProfile | undefined {
	return members.find((member) => member.slug === slug);
}

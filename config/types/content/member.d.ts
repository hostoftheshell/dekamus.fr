/* config/types/content/member.d.ts */
// WARNING: sync with keystatic.config.ts — resynchroniser à chaque changement de champ.

export interface MemberAddress {
	street: string;
	postalCode: string;
	city: string;
}

export interface MemberSocialLink {
	label: string;
	url: string;
}

export interface MemberWebsite {
	label: string;
	url: string;
}

export interface MemberCoordonnees {
	email: string;
	phone: string;
	address: MemberAddress;
	socialLinks: MemberSocialLink[];
	websites: MemberWebsite[];
}

export interface MemberProfile {
	slug: string;
	name: string;
	role: string;
	title: string;
	description: string;
	titleNav?: string;
}

export interface Member extends MemberProfile {
	coordonnees: MemberCoordonnees;
}

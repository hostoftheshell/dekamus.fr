/* config/types/site.d.ts */

export interface PhoneContact {
	display: string;
	link: string;
}

export interface DeveloperContact {
	name: string;
	url: string;
	email: string;
	identifierSiret: string;
}

export interface HostingContact {
	name: string;
	address: string;
	url: string;
	privacyPolicyUrl: string;
}

export interface OrganizationAddress {
	street: string;
	locality: string;
	postalCode: string;
	regionLabel: string;
	regionISO: string;
	departmentLabel: string;
	departmentISO: string;
	countryLabel: string;
	countryISO: string;
}

export interface OrganizationContact {
	email: string;
	phone: PhoneContact;
	website: {
		url: string;
		developer: DeveloperContact;
	};
	hosting: HostingContact;
}

export interface OrganizationConfig {
	legalName: string;
	legalFormLabel: string;
	legalFormISO: string;
	/** ISO 8601 date, e.g. `2025-12-02` */
	foundingDate: string;
	activityCode: string;
	activityDescription: string;
	identifierSiren: string;
	identifierSiret: string;
	address: OrganizationAddress;
	contact: OrganizationContact;
}

export interface OgConfig {
	defaultImage: string;
	width: number;
	height: number;
}

export interface SiteConfig {
	name: string;
	title: string;
	description: string;
	url: string;
	locale: string;
	lang: string;
	organization: OrganizationConfig;
	og: OgConfig;
}

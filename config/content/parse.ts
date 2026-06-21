/* config/content/parse.ts */

import type {
	MemberAddress,
	MemberSocialLink,
	MemberWebsite,
} from "@config/types";
import { normalizeTel } from "@utils/media/normalizeEmbed";

function contentError(slug: string, field: string, reason: string): never {
	throw new Error(`[members:${slug}] ${field}: ${reason}`);
}

export function requiredString(
	value: unknown,
	field: string,
	slug: string,
): string {
	if (typeof value !== "string" || !value.trim()) {
		contentError(slug, field, "required non-empty string");
	}
	return value.trim();
}

function stringField(value: unknown, field: string, slug: string): string {
	if (value == null) return "";
	if (typeof value !== "string") {
		contentError(slug, field, "expected string");
	}
	return value;
}

export function optionalString(
	value: unknown,
	field: string,
	slug: string,
): string | undefined {
	if (value == null || value === "") return undefined;
	if (typeof value !== "string") {
		contentError(slug, field, "expected string");
	}
	return value;
}

function parseHttpUrl(value: unknown, field: string, slug: string): string {
	const url = requiredString(value, field, slug);
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			contentError(slug, field, "URL must use http or https");
		}
		return parsed.href;
	} catch {
		contentError(slug, field, "invalid URL");
	}
}

export function parseEmail(
	value: unknown,
	field: string,
	slug: string,
): string {
	const email = requiredString(value, field, slug);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		contentError(slug, field, "invalid email");
	}
	return email;
}

export function parsePhone(
	value: unknown,
	field: string,
	slug: string,
): string {
	if (value == null) return "";
	if (typeof value !== "string") {
		contentError(slug, field, "expected string");
	}
	const trimmed = value.trim();
	if (!trimmed) return "";
	const result = normalizeTel(trimmed);
	if (!result.valid) {
		contentError(slug, field, result.reason);
	}
	return value;
}

export function parseAddress(
	value: unknown,
	field: string,
	slug: string,
): MemberAddress {
	if (value == null || typeof value !== "object" || Array.isArray(value)) {
		contentError(slug, field, "expected object");
	}
	const record = value as Record<string, unknown>;
	return {
		street: stringField(record.street, `${field}.street`, slug),
		postalCode: stringField(record.postalCode, `${field}.postalCode`, slug),
		city: stringField(record.city, `${field}.city`, slug),
	};
}

export function parseLinks(
	value: unknown,
	field: string,
	slug: string,
): MemberSocialLink[] | MemberWebsite[] {
	if (value == null) return [];
	if (!Array.isArray(value)) {
		contentError(slug, field, "expected array");
	}
	return value.map((item, index) => {
		const itemField = `${field}[${index}]`;
		if (item == null || typeof item !== "object" || Array.isArray(item)) {
			contentError(slug, itemField, "expected object");
		}
		const record = item as Record<string, unknown>;
		return {
			label: requiredString(record.label, `${itemField}.label`, slug),
			url: parseHttpUrl(record.url, `${itemField}.url`, slug),
		};
	});
}

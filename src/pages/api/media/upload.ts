import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { APIRoute } from "astro";
import {
	formatUploadBytes,
	type MediaUploadKind,
	mediaUploadDirectory,
	mediaUploadExtensions,
	mediaUploadMaxBytes,
	mediaUploadPublicPrefix,
	sanitizeMemberSlug,
	sanitizeUploadFilename,
} from "@utils/media/mediaUpload";

export const prerender = false;

function isMediaKind(value: FormDataEntryValue | null): value is MediaUploadKind {
	return value === "audio" || value === "video" || value === "vtt";
}

export const POST: APIRoute = async ({ request }) => {
	if (import.meta.env.PROD) {
		return new Response("Not found", { status: 404 });
	}

	let formData: FormData;
	try {
		formData = await request.formData();
	} catch {
		return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
	}

	const file = formData.get("file");
	const kind = formData.get("kind");
	const slug = formData.get("slug");

	if (!(file instanceof File)) {
		return Response.json({ error: "Fichier manquant." }, { status: 400 });
	}

	if (!isMediaKind(kind)) {
		return Response.json({ error: "Type de média invalide." }, { status: 400 });
	}

	const memberSlug =
		typeof slug === "string" ? sanitizeMemberSlug(slug.trim()) : null;
	if (!memberSlug) {
		return Response.json({ error: "Slug membre invalide." }, { status: 400 });
	}

	const extension = path.extname(file.name).toLowerCase();
	if (!mediaUploadExtensions(kind).has(extension)) {
		return Response.json(
			{
				error: `Extension non autorisée (${extension || "aucune"}).`,
			},
			{ status: 400 },
		);
	}

	const maxBytes = mediaUploadMaxBytes(kind);
	if (file.size > maxBytes) {
		return Response.json(
			{
				error: `Fichier trop volumineux (${formatUploadBytes(file.size)}). Maximum : ${formatUploadBytes(maxBytes)}.`,
			},
			{ status: 413 },
		);
	}

	const filename = sanitizeUploadFilename(file.name);
	const directory = path.join(
		process.cwd(),
		mediaUploadDirectory(kind),
		memberSlug,
	);
	await mkdir(directory, { recursive: true });

	const absolutePath = path.join(directory, filename);
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(absolutePath, buffer);

	const publicPath = `${mediaUploadPublicPrefix(kind)}/${memberSlug}/${filename}`;

	return Response.json({ publicPath, bytes: file.size });
};

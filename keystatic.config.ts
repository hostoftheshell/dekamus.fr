// keystatic.config.ts
//
// Contraintes bio.mdx (Keystatic) : pas d'imports internes, pas de HTML brut.
// Publication : toute sauvegarde admin est publiée au prochain build (pas de brouillon).
// TODO: activer Git LFS sur public/videos/ et public/audio/ avant bascule GitHub.
// Bascule github : nécessite GitHub App + repo + branch (pas seulement des env vars).
//
// Uploads médias hébergés : public/audio/membres/ et public/videos/membres/
// (Git LFS recommandé avant bascule GitHub storage).
// Gros fichiers : ne pas utiliser fields.file (charge tout en mémoire dans le navigateur).
// Utiliser /keystatic/upload en dev, puis coller le chemin public dans les champs texte.
//
// Pas de format.contentField : champs structurés dans index.yaml, bio dans bio.mdx.
// Le loader lit index.yaml via le reader Keystatic (voir config/content/members.ts).

import { collection, config, fields } from "@keystatic/core";
import { block } from "@keystatic/core/content-components";

const imageDirectory = "public/images/membres";
const imagePublicPath = "/images/membres/";

const coordonneesSchema = {
	slug: fields.slug({
		name: { label: "Nom (slug)" },
	}),
	name: fields.text({ label: "Nom affiché" }),
	role: fields.text({ label: "Rôle" }),
	title: fields.text({ label: "Titre SEO" }),
	description: fields.text({ label: "Description SEO", multiline: true }),
	titleNav: fields.text({ label: "Titre navigation" }),
	email: fields.text({ label: "Email" }),
	phone: fields.text({ label: "Téléphone" }),
	address: fields.object(
		{
			street: fields.text({ label: "Rue" }),
			postalCode: fields.text({ label: "Code postal" }),
			city: fields.text({ label: "Ville" }),
		},
		{ label: "Adresse" },
	),
	socialLinks: fields.array(
		fields.object({
			label: fields.text({ label: "Libellé" }),
			url: fields.url({ label: "URL" }),
		}),
		{
			label: "Réseaux sociaux",
			itemLabel: (props) => props.fields.label.value || "Lien",
		},
	),
	websites: fields.array(
		fields.object({
			label: fields.text({ label: "Libellé" }),
			url: fields.url({ label: "URL" }),
		}),
		{
			label: "Sites web",
			itemLabel: (props) => props.fields.label.value || "Site",
		},
	),
};

const hostedMediaMetadataFields = {
	title: fields.text({ label: "Titre affiché (sous le lecteur)" }),
	date: fields.date({ label: "Date" }),
	description: fields.text({ label: "Description", multiline: true }),
};

const mdxComponentBlocks = {
	VideoEmbed: block({
		label: "Vidéo",
		schema: {
			accessibleTitle: fields.text({
				label: "Intitulé pour lecteurs d'écran",
			}),
			source: fields.conditional(
				fields.select({
					label: "Plateforme",
					options: [
						{ label: "YouTube", value: "youtube" },
						{ label: "Vimeo", value: "vimeo" },
						{ label: "Dailymotion", value: "dailymotion" },
						{ label: "Fichier MP4 (hébergé)", value: "hosted" },
					],
					defaultValue: "youtube",
				}),
				{
					youtube: fields.object({
						url: fields.url({ label: "URL (embed ou page)" }),
					}),
					vimeo: fields.object({
						url: fields.url({ label: "URL (embed ou page)" }),
					}),
					dailymotion: fields.object({
						url: fields.url({ label: "URL (embed ou page)" }),
					}),
					hosted: fields.object({
						src: fields.text({
							label: "Chemin public MP4",
							description:
								"Uploader via /keystatic/upload (dev), puis coller le chemin (ex. /videos/membres/mon-slug/clip.mp4). Éviter le sélecteur de fichier Keystatic pour les gros fichiers.",
							validation: { isRequired: true },
						}),
						...hostedMediaMetadataFields,
					}),
				},
			),
		},
	}),
	AudioPlayer: block({
		label: "Audio",
		schema: {
			accessibleTitle: fields.text({
				label: "Intitulé pour lecteurs d'écran",
			}),
			source: fields.conditional(
				fields.select({
					label: "Plateforme",
					options: [
						{ label: "Spotify", value: "spotify" },
						{ label: "Deezer", value: "deezer" },
						{ label: "SoundCloud", value: "soundcloud" },
						{ label: "Radio France", value: "radio-france" },
						{ label: "Arte Radio", value: "arte" },
						{ label: "Fichier audio (hébergé)", value: "hosted" },
					],
					defaultValue: "spotify",
				}),
				{
					spotify: fields.object({
						embedUrl: fields.url({ label: "URL iframe embed" }),
					}),
					deezer: fields.object({
						embedUrl: fields.url({ label: "URL iframe embed" }),
					}),
					soundcloud: fields.object({
						embedUrl: fields.url({ label: "URL iframe embed" }),
					}),
					"radio-france": fields.object({
						embedUrl: fields.url({ label: "URL iframe embed" }),
					}),
					arte: fields.object({
						embedUrl: fields.url({ label: "URL iframe embed" }),
					}),
					hosted: fields.object({
						src: fields.text({
							label: "Chemin public audio",
							description:
								"Uploader via /keystatic/upload (dev), puis coller le chemin (ex. /audio/membres/mon-slug/piste.mp3).",
							validation: { isRequired: true },
						}),
						vttSrc: fields.text({
							label: "Sous-titres WebVTT (optionnel)",
							description:
								"Chemin public (ex. /audio/membres/mon-slug/sous-titres.vtt). Peut aussi être uploadé via /keystatic/upload.",
						}),
						...hostedMediaMetadataFields,
					}),
				},
			),
			transcriptUrl: fields.url({
				label: "URL transcription textuelle (optionnel, tous types d'audio)",
			}),
		},
	}),
	Carousel: block({
		label: "Carrousel",
		schema: {
			images: fields.array(
				fields.object({
					src: fields.text({
						label: "Chemin image (ex. /images/membres/a.jpg)",
					}),
					alt: fields.text({ label: "Texte alternatif" }),
					caption: fields.text({ label: "Légende (optionnel)" }),
				}),
				{
					label: "Images",
					itemLabel: (props) => props.fields.alt.value || "Image",
				},
			),
		},
	}),
	MiniGallery: block({
		label: "Mini galerie",
		schema: {
			columns: fields.integer({
				label: "Colonnes",
				defaultValue: 3,
				validation: { min: 1, max: 6 },
			}),
			images: fields.array(
				fields.object({
					src: fields.text({ label: "Chemin image" }),
					alt: fields.text({ label: "Texte alternatif" }),
					caption: fields.text({ label: "Légende (optionnel)" }),
				}),
				{
					label: "Images",
					itemLabel: (props) => props.fields.alt.value || "Image",
				},
			),
		},
	}),
};

export default config({
	storage: {
		kind: "local",
	},
	collections: {
		membres: collection({
			label: "Membres",
			slugField: "slug",
			path: "content/membres/*/",
			schema: {
				...coordonneesSchema,
				bio: fields.mdx({
					label: "Bio",
					options: {
						image: {
							directory: imageDirectory,
							publicPath: imagePublicPath,
						},
					},
					components: mdxComponentBlocks,
				}),
			},
		}),
	},
});

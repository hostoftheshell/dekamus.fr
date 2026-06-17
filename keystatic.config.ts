// keystatic.config.ts
//
// Contraintes bio.mdx (Keystatic) : pas d'imports internes, pas de HTML brut.
// Publication : toute sauvegarde admin est publiée au prochain build (pas de brouillon).
// TODO: activer Git LFS sur public/videos/ et public/audio/ avant bascule GitHub.
// Bascule github : nécessite GitHub App + repo + branch (pas seulement des env vars).
//
// Pas de format.contentField : avec path */ et champs document+mdx séparés, le seed
// manuel (index.yaml + coordonnees.md + bio.mdx) est découvert par le reader ; le
// loader Task 6 parse le frontmatter de coordonnees.md (voir audit Task 2).

import { component, config, collection, fields } from "@keystatic/core";

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

const mdxComponentBlocks = {
	VideoEmbed: component({
		label: "Vidéo",
		schema: {
			platform: fields.select({
				label: "Plateforme",
				options: [
					{ label: "YouTube", value: "youtube" },
					{ label: "Vimeo", value: "vimeo" },
					{ label: "Dailymotion", value: "dailymotion" },
					{ label: "Fichier MP4 (public/)", value: "hosted" },
				],
				defaultValue: "youtube",
			}),
			url: fields.url({ label: "URL (embed ou page)" }),
			src: fields.text({
				label: "Chemin public MP4 (ex. /videos/membres/foo.mp4)",
			}),
			title: fields.text({ label: "Titre accessible" }),
		},
	}),
	AudioPlayer: component({
		label: "Audio",
		schema: {
			platform: fields.select({
				label: "Plateforme",
				options: [
					{ label: "Spotify", value: "spotify" },
					{ label: "Deezer", value: "deezer" },
					{ label: "SoundCloud", value: "soundcloud" },
					{ label: "Radio France", value: "radio-france" },
					{ label: "Arte Radio", value: "arte" },
					{ label: "Fichier MP3 (public/)", value: "hosted" },
				],
				defaultValue: "spotify",
			}),
			embedUrl: fields.url({ label: "URL iframe embed" }),
			src: fields.text({
				label: "Chemin public MP3 (ex. /audio/membres/foo.mp3)",
			}),
			title: fields.text({ label: "Titre accessible" }),
		},
	}),
	Carousel: component({
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
	MiniGallery: component({
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
				coordonnees: fields.document({
					label: "Coordonnées",
					schema: coordonneesSchema,
				}),
				bio: fields.mdx({
					label: "Bio",
					options: {
						image: {
							directory: imageDirectory,
							publicPath: imagePublicPath,
						},
						components: mdxComponentBlocks,
					},
				}),
			},
		}),
	},
});

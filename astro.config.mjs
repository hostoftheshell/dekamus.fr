// @ts-check

import sitemap from "@astrojs/sitemap";
import seoGraph from "@jdevalk/astro-seo-graph/integration";
import { defineConfig, fontProviders } from "astro/config";
import UnoCSS from "unocss/astro";

// https://astro.build/config
export default defineConfig({
	site: "https://dekamus.fr",
	output: "static",
	integrations: [
		sitemap({ entryLimit: 1000 }),
		seoGraph({
			validateH1: true,
			validateUniqueMetadata: true,
			validateImageAlt: true,
			validateMetadataLength: true,
			validateInternalLinks: true,
			llmsTxt: {
				title: "Dekamus",
				siteUrl: "https://dekamus.fr",
				summary: "Association Dekamus — site officiel.",
			},
		}),
		UnoCSS(),
	],
	trailingSlash: "ignore",
	build: {
		format: "directory",
	},
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: "Syne",
			cssVariable: "--font-syne",
			weights: ["400 800"],
			styles: ["normal"],
			subsets: ["latin"],
			formats: ["woff2"],
			fallbacks: ["system-ui", "Open Sans", "sans-serif"],
		},
		{
			provider: fontProviders.fontsource(),
			name: "Source Serif 4",
			cssVariable: "--font-source-serif-4",
			weights: ["100 900"],
			styles: ["normal", "italic"],
			subsets: ["latin"],
			formats: ["woff2"],
			fallbacks: ["ui-serif", "Georgia", "Times New Roman", "serif"],
		},
		{
			provider: fontProviders.fontsource(),
			name: "Victor Mono",
			cssVariable: "--font-victor-mono",
			weights: ["100 700"],
			styles: ["normal", "italic"],
			subsets: ["latin"],
			formats: ["woff2"],
			fallbacks: [
				"ui-monospace",
				"Cascadia Mono",
				"Segoe UI Mono",
				"Menlo",
				"Monaco",
				"Consolas",
				"monospace",
			],
		},
	],
});

// @ts-check

import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import seoGraph from "@jdevalk/astro-seo-graph/integration";
import keystatic from "@keystatic/astro";
import { defineConfig, fontProviders } from "astro/config";
import UnoCSS from "unocss/astro";

// Phase 1 (storage local) : admin Keystatic en dev uniquement.
// Production (Cloudflare Pages, output static) : SKIP_KEYSTATIC=true exclut
// l'intégration et les routes SSR /keystatic/* — voir docs/superpowers/audits/
const enableKeystatic = process.env.SKIP_KEYSTATIC !== "true";

// https://astro.build/config
export default defineConfig({
	site: "https://dekamus.fr",
	output: "static",
	...(enableKeystatic ? { adapter: node({ mode: "standalone" }) } : {}),
	integrations: [
		mdx(),
		...(enableKeystatic ? [react(), keystatic()] : []),
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

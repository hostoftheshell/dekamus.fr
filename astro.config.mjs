// @ts-check

import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "static",
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
			fallbacks: ["ui-sans-serif", "sans-serif"],
		},
		{
			provider: fontProviders.fontsource(),
			name: "Source Serif 4",
			cssVariable: "--font-source-serif-4",
			weights: ["100 900"],
			styles: ["normal", "italic"],
			subsets: ["latin"],
			formats: ["woff2"],
			fallbacks: ["ui-serif", "Georgia", "serif"],
		},
	],
});

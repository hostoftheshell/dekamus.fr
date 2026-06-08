/* config/colors.ts */

import type { ColorConfig, ColorPalette, ColorToken } from "@config/types";

export const ColorData: ColorConfig = {
	colors: {
		mode: "light",
		light: {
			primary: "oklch(18.64% 0.0088 264.34deg)", // #111317
			secondary: "oklch(97.25% 0.0067 97.35deg)", // #f7f6f1
			muted: "oklch(47.85% 0.0134 269.4deg)", // #5a5d65
			faint: "oklch(57.00% 0.0134 269deg)", // #757a84
			accent: "oklch(39.42% 0.1828 278.39deg)", // #382ca4
			highlight: "oklch(93.38% 0.0328 297.2deg)", // #ebe5fd
			bgAlt: "oklch(96.88% 0.0041 301.42deg)", // #f5f4f7
			bgWarm: "oklch(95.50% 0.018 85deg)", // #f6efe3
			bgCard: "oklch(99.7% 0 0deg)", // #fefefe
			altCard_1: "oklch(86.18% 0.072 290.93deg)", // #d1cafe
			altCard_2: "oklch(86.55% 0.076 352.59deg)", // #fbbfd7
			altCard_3: "oklch(90.65% 0.088 112.5deg)", // #e0e7a3
			altCard_4: "oklch(88.23% 0.082 170.38deg)", // #a0ead0
			fgInfo: "oklch(54.14% 0.1604 251.66deg)", // #0070c8
			bgInfo: "oklch(93.31% 0.0249 246.21deg)", // #dcebf9
			bdInfo: "oklch(74.21% 0.1054 251.02deg)", // #78b0ec
			fgWarning: "oklch(54.67% 0.1137 78.61deg)", // #946700
			bgWarning: "oklch(96.67% 0.0324 85.48deg)", // #fef3dc
			bdWarning: "oklch(87.55% 0.1333 86.83deg)", // #fcd066
			fgAlert: "oklch(57.03% 0.214 28.84deg)", // #d9251d
			bgAlert: "oklch(92.51% 0.0349 26.53deg)", // #fddeda
			bdAlert: "oklch(71.55% 0.1401 24.34deg)", // #ee7d77
			fgSuccess: "oklch(52.16% 0.1337 150.76deg)", // #147e3e
			bgSuccess: "oklch(96.65% 0.0427 153.72deg)", // #dffde7
			bdSuccess: "oklch(83.06% 0.129 153.49deg)", // #80e0a0
			disabled: "oklch(67.96% 0.0154 268.43deg)", // #9498a2
		},
		dark: {
			primary: "oklch(97.25% 0.0067 97.35deg)", // #f7f6f1
			secondary: "oklch(18.64% 0.0088 264.34deg)", // #111317
			muted: "oklch(67.96% 0.0154 268.43deg)", // #9498a2
			faint: "oklch(63.00% 0.0134 269.04deg)", // #868992
			accent: "oklch(87.5% 0.1791 92.68deg)", // #ffd100
			highlight: "oklch(25.26% 0.0393 95.39deg)", // #28220a
			bgAlt: "oklch(19.73% 0.02 289.01deg)", // #15141e
			bgWarm: "oklch(25.26% 0.0393 95.39deg)", // #28220a
			bgCard: "oklch(20.96% 0.0238 295.75deg)", // #191622
			altCard_1: "oklch(21.41% 0.0539 282.46deg)", // #161531
			altCard_2: "oklch(22.98% 0.042 354.49deg)", // #29131c
			altCard_3: "oklch(25.95% 0.0352 106.2deg)", // #262510
			altCard_4: "oklch(25.62% 0.0313 167.43deg)", // #132820
			fgInfo: "oklch(60.52% 0.1744 253.34deg)", // #1e82e6
			bgInfo: "oklch(24.16% 0.0428 248.83deg)", // #0e2133
			bdInfo: "oklch(55.24% 0.1632 253.67deg)", // #1672ce
			fgWarning: "oklch(87.55% 0.1333 86.83deg)", // #fcd066
			bgWarning: "oklch(28.8% 0.0459 85.84deg)", // #35290d
			bdWarning: "oklch(80.33% 0.1625 77.42deg)", // #f8af1c
			fgAlert: "oklch(62.6% 0.2005 28.21deg)", // #e8463b
			bgAlert: "oklch(23.54% 0.0526 27.24deg)", // #331310
			bdAlert: "oklch(62.64% 0.2026 28.51deg)", // #e94539
			fgSuccess: "oklch(76.32% 0.2018 150.23deg)", // #20d468
			bgSuccess: "oklch(28.67% 0.0497 160.33deg)", // #103222
			bdSuccess: "oklch(70.05% 0.1828 148.31deg)", // #30bc58
			disabled: "oklch(47.85% 0.0134 269.4deg)", // #5a5d65
		},
	},
};

/** Convert a palette to `--color-*` CSS custom properties. */
export function paletteToCSSVars(palette: ColorPalette): string {
	return Object.entries(palette)
		.map(([token, value]) => `  --color-${token}: ${value};`)
		.join("\n");
}

/** Convert light/dark palettes to `--color-*` vars using CSS `light-dark()`. */
export function paletteToLightDarkCSSVars(
	light: ColorPalette,
	dark: ColorPalette,
): string {
	return (Object.keys(light) as ColorToken[])
		.map(
			(token) =>
				`  --color-${token}: light-dark(${light[token]}, ${dark[token]});`,
		)
		.join("\n");
}

/**
 * UnoCSS color definitions that reference the active theme's CSS variables.
 * The `<alpha-value>` placeholder is replaced by UnoCSS at compile time
 * when you use `bg-primary/25`, `text-accent/90`, etc.
 */
export function semanticColorsForUno(
	palette: ColorPalette,
): Record<ColorToken, string> {
	return Object.keys(palette).reduce(
		(acc, token) => {
			acc[token as ColorToken] =
				`color-mix(in oklch, var(--color-${token}) calc(<alpha-value> * 100%), transparent)`;
			return acc;
		},
		{} as Record<ColorToken, string>,
	);
}

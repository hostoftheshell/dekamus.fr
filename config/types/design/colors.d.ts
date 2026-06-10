/* config/types/color.d.ts */

export type ColorToken =
	| "primary"
	| "secondary"
	| "muted"
	| "faint"
	| "accent"
	| "highlight"
	| "bgAlt"
	| "bgWarm"
	| "bgCard"
	| "altCard_1"
	| "altCard_2"
	| "altCard_3"
	| "altCard_4"
	| "fgInfo"
	| "bgInfo"
	| "bdInfo"
	| "fgWarning"
	| "bgWarning"
	| "bdWarning"
	| "fgAlert"
	| "bgAlert"
	| "bdAlert"
	| "fgSuccess"
	| "bgSuccess"
	| "bdSuccess"
	| "disabled";

export type ColorPalette = Record<ColorToken, string>;

export type ColorMode = "light" | "dark" | "auto";

export interface ColorConfig {
	colors: {
		mode: ColorMode;
		light: ColorPalette;
		dark: ColorPalette;
	};
}

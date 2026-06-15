/* config/design/layout.ts */

import type {
	AspectRatioToken,
	BreakpointToken,
	ContainerToken,
} from "@config/types";

export const breakpoints = {
	sm: "480px",
	md: "768px",
	lg: "1024px",
	xl: "1280px",
	"2xl": "1536px",
} as const satisfies Record<BreakpointToken, string>;

export const containers = {
	prose: "680px",
	page: "900px",
	wide: "1200px",
	imageWide: "1400px",
} as const satisfies Record<Exclude<ContainerToken, "full">, string>;

export const containerPadding = {
	mobile: "5",
	default: "7",
} as const;

export const aspectRatios = {
	cinema: "21/9",
	wide: "16/9",
	photo: "3/2",
	square: "1/1",
	portrait: "2/3",
} as const satisfies Record<AspectRatioToken, string>;

/** Breakpoints for UnoCSS `theme.breakpoints`. */
export function breakpointsForUno(): Record<BreakpointToken, string> {
	return { ...breakpoints };
}

function containerBase(maxWidth?: string): string {
	const padding = `px-${containerPadding.mobile} sm:px-${containerPadding.default}`;
	if (maxWidth) {
		return `mx-auto w-full max-w-[${maxWidth}] ${padding}`;
	}
	return `w-full ${padding}`;
}

function containerHeader(): string {
	return `mx-auto w-full md:w-fit max-w-full`;
}

/** Layout shortcuts for UnoCSS (`container-*`, `img-*`, `ratio-*`). */
export function layoutShortcuts(): Record<string, string> {
	const ratioShortcuts = (
		Object.entries(aspectRatios) as [AspectRatioToken, string][]
	).reduce<Record<string, string>>((acc, [name, ratio]) => {
		acc[`ratio-${name}`] =
			ratio === "1/1" ? "aspect-square" : `aspect-[${ratio}]`;
		return acc;
	}, {});

	return {
		"container-header": containerHeader(),
		"container-prose": containerBase(containers.prose),
		"container-page": containerBase(containers.page),
		"container-wide": containerBase(containers.wide),
		"container-full": containerBase(),
		"img-full": "w-full",
		"img-wide": `w-full max-w-[${containers.imageWide}] mx-auto`,
		...ratioShortcuts,
	};
}

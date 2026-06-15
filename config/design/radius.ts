/* config/design/radius.ts */

export const radius = {
	none: "0",
	sm: "0.38rem",
	md: "0.60rem",
	lg: "0.75rem",
	xl: "0.9rem",
	round: "50%",
} as const;

export type RadiusToken = keyof typeof radius;

export function radiusToCSSVars(): string {
	return (Object.keys(radius) as RadiusToken[])
		.map((token) => {
			return `  --radius-${token}: ${radius[token]};`;
		})
		.join("\n");
}

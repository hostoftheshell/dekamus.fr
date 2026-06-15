/* config/design/borderRadius.ts */

export const borderRadius = {
	none: "0",
	sm: "0.375rem",
	md: "0.625rem",
	lg: "0.75rem",
	xl: "0.875rem",
	round: "50%",
} as const;

export type BorderRadiusToken = keyof typeof borderRadius;

export function borderRadiusToCSSVars(): string {
	return (Object.keys(borderRadius) as BorderRadiusToken[])
		.map((token) => `  --radius-${token}: ${borderRadius[token]};`)
		.join("\n");
}

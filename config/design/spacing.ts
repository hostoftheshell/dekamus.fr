/* config/design/spacing.ts */

export const spacing = {
	sp1: "0.25rem",
	sp2: "0.5rem",
	sp3: "0.75rem",
	sp4: "1rem",
	sp5: "1.25rem",
	sp6: "1.5rem",
	sp7: "1.75rem",
	sp8: "2rem",
	sp10: "2.5rem",
	sp12: "3rem",
	sp16: "4rem",
} as const;

export type SpacingToken = keyof typeof spacing;

export function spacingToCSSVars(): string {
	return (Object.keys(spacing) as SpacingToken[])
		.map((token) => {
			const suffix = token.replace(/^sp/, "");
			return `  --sp-${suffix}: ${spacing[token]};`;
		})
		.join("\n");
}

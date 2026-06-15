import {
	defineConfig,
	presetIcons,
	presetMini,
	transformerVariantGroup,
} from "unocss";
import { borderRadius } from "./config/design/borderRadius";
import { ColorData, semanticColorsForUno } from "./config/design/colors";
import { breakpointsForUno, layoutShortcuts } from "./config/design/layout";
import { spacing } from "./config/design/spacing";

export default defineConfig({
	presets: [presetMini(), presetIcons({})],
	transformers: [transformerVariantGroup()],
	theme: {
		breakpoints: breakpointsForUno(),
		colors: semanticColorsForUno(ColorData.colors.light),
		fontFamily: {
			heading: "var(--font-syne)",
			body: "var(--font-source-serif-4)",
			mono: "var(--font-victor-mono)",
		},
		spacing: {
			1: spacing.sp1,
			2: spacing.sp2,
			3: spacing.sp3,
			4: spacing.sp4,
			5: spacing.sp5,
			6: spacing.sp6,
			7: spacing.sp7,
			8: spacing.sp8,
			10: spacing.sp10,
			12: spacing.sp12,
			16: spacing.sp16,
		},
		borderRadius: { ...borderRadius },
	},
	shortcuts: {
		stack: "flex flex-col gap-4",
		"stack-lg": "flex flex-col gap-8",
		"stack-sm": "flex flex-col gap-2",
		...layoutShortcuts(),
	},
	blocklist: [
		/^(text|bg|border|ring|fill|stroke)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-/,
	],
});

export { colors } from "./colors";
export { radius } from "./radius";
export { shadow } from "./shadow";
export { spacing, spacingScale } from "./spacing";
export { typography } from "./typography";

// Unified theme object — backwards compatible with all existing screens
import { colors } from "./colors";
import { radius } from "./radius";
import { shadow } from "./shadow";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const theme = {
	colors,
	fonts: typography.fonts,
	spacing,
	shadow,
	radius,
};

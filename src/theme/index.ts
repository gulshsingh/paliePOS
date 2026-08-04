export { colors }     from './colors';
export { spacing, spacingScale } from './spacing';
export { typography } from './typography';
export { shadow }     from './shadow';
export { radius }     from './radius';

// Unified theme object — backwards compatible with all existing screens
import { colors }     from './colors';
import { spacing }    from './spacing';
import { typography } from './typography';
import { shadow }     from './shadow';
import { radius }     from './radius';

export const theme = {
  colors,
  fonts:   typography.fonts,
  spacing,
  shadow,
  radius,
};

export const theme = {
  colors: {
    // Primary brand — softer, warmer red (halka kiya gaya)
    primary: '#F0555F',
    primaryDark: '#E23744',   // pehle wala bold red — hover/press states ke liye
    primaryLight: '#FFF4F5',

    // Secondary — soft charcoal (pure black ki jagah)
    secondary: '#3A3A3A',

    // Surfaces
    surface: '#FFFFFF',
    surfaceSecondary: '#FAFAFA',
    surfaceTertiary: '#F4F4F4',
    surfaceElevated: '#FFFFFF',

    // Borders — aur bhi subtle
    border: '#EFEFEF',
    borderLight: '#F6F6F6',

    // Text — soft, less harsh
    textPrimary: '#3A3A3A',
    textSecondary: '#8A8A8A',
    textMuted: '#BFBFBF',
    textInverse: '#FFFFFF',
    textAccent: '#F0555F',

    // Status — light, muted tones
    success: '#5FC77A',
    successLight: '#F0FAF3',
    warning: '#F7B84D',
    warningLight: '#FEFAF0',
    danger: '#F0555F',
    dangerLight: '#FFF4F5',
    info: '#5D9BEE',
    infoLight: '#F0F6FE',

    // Accent (backwards-compat alias)
    accent: '#F0555F',

    // Kitchen status colors — clear but soft
    pending:   '#F7B84D',
    preparing: '#5D9BEE',
    ready:     '#5FC77A',
    served:    '#3FA968',   // green (gray se badla — "complete" clearly dikhe)
  },

  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 999,
  },

  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#F0555F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  spacing: (n: number) => n * 4,
};
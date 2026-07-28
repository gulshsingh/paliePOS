export const theme = {
  colors: {
    // Primary brand — Zomato red
    primary: '#E23744',
    primaryDark: '#C0202E',
    primaryLight: '#FFF0F1',

    // Secondary — deep charcoal
    secondary: '#1C1C1C',

    // Surfaces
    surface: '#FFFFFF',
    surfaceSecondary: '#F7F7F7',
    surfaceTertiary: '#EFEFEF',
    surfaceElevated: '#FFFFFF',

    // Borders
    border: '#E8E8E8',
    borderLight: '#F2F2F2',

    // Text
    textPrimary: '#1C1C1C',
    textSecondary: '#696969',
    textMuted: '#A9A9A9',
    textInverse: '#FFFFFF',
    textAccent: '#E23744',

    // Status
    success: '#3AB757',
    successLight: '#EAF7EE',
    warning: '#F5A623',
    warningLight: '#FEF8EC',
    danger: '#E23744',
    dangerLight: '#FFF0F1',
    info: '#2B7BE9',
    infoLight: '#EBF3FD',

    // Accent (backwards-compat alias)
    accent: '#E23744',

    // Kitchen status colors
    pending:   '#F5A623',
    preparing: '#2B7BE9',
    ready:     '#3AB757',
    served:    '#A9A9A9',
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
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#E23744',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
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

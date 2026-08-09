export const typography = {
  fontFamily: {
    sans: "'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    brand: "'Baloo 2', 'Helvetica Neue', Arial, sans-serif",
  },

  fontSize: {
    size1: "11px", // Unused - smallest
    size2: "12px", // Captions
    size3: "13px", // Form hints
    size4: "14px", // Body text
    size5: "15px", // Normal labels
    size6: "16px", // Section headers
    size7: "17px", // Subheadings
    size8: "18px", // Card titles
    size9: "20px", // Section titles
    size10: "22px", // Page subtitles
    size11: "28px", // Page titles
    size12: "34px", // Main page title
  },

  fontSizeHero: "clamp(38px, 4.6vw, 58px)",

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.15,
    normal: 1.5,
    relaxed: 1.75,
  },

  letterSpacing: {
    tight: "-0.5px",
    normal: "0",
    wide: "0.5px",
  },
} as const;

export const layout = {
  navHeight: 60,
  spacing: {
    0: "0",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    7: "28px",
    8: "32px",
    9: "36px",
    10: "40px",
    12: "48px",
    14: "56px",
    16: "64px",
  },
  gap: {
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },
  padding: {
    xs: "8px",
    sm: "12px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "100px",
  },
  iconSize: {
    sm: "16px",
    md: "18px",
    lg: "24px",
    xl: "32px",
  },
} as const;

export const typographyPresets = {
  h1: {
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.fontSize.size12,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontFamily: typography.fontFamily.serif,
    fontSize: typography.fontSize.size11,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h3: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size8,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },

  body: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size4,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },

  bodyLarge: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size7,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
    letterSpacing: "normal",
  },

  label: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size3,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
  },

  chipLabel: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size3,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },

  brand: {
    fontFamily: typography.fontFamily.brand,
    fontSize: typography.fontSize.size7,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: "-0.2px",
  },

  caption: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size2,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
} as const;

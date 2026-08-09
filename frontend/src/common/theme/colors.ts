export const colors = {
  coral: "#FF7A59",
  rose: "#E94F92",

  gray: {
    50: "#FAFBFB", // backgrounds
    100: "#F3F4F5", // Light backgrounds
    200: "#E5E7EB", // Light borders, disabled states
    300: "#D1D5DB", // Input borders, dividers
    400: "#9CA3AF", // Secondary text, placeholders
    500: "#6B7280", // Normal text, labels
    600: "#4B5563", // Emphasis text
    700: "#374151", // Strong text
    800: "#1F2937", // Dark text
    900: "#111827", // Darkest text
  },

  white: "#FFFFFF",
  transparent: "transparent",
  error: "#DC2626",
  success: "#10B981",
  warning: "#F59E0B",

  coralTint: "rgba(255, 122, 89, 0.08)",
  coralSoftTint: "rgba(255, 122, 89, 0.06)",
  coralBorder: "rgba(255, 122, 89, 0.15)",
  coralStrongBorder: "rgba(255, 122, 89, 0.2)",

  roseTint: "rgba(233, 79, 146, 0.08)",
  roseSoftTint: "rgba(233, 79, 146, 0.06)",
  roseGlow: "rgba(233, 79, 146, 0.30)",
  roseHoverGlow: "rgba(233, 79, 146, 0.40)",

  cream: "#FBF8F3",
  warmWhite: "#faf6ef",
  peach: "#FFD9C4",
  brown: "#6B4226",
} as const;

export const gradients = {
  primary: `linear-gradient(135deg, ${colors.coral}, ${colors.rose})`,
  progress: `linear-gradient(90deg, ${colors.coral}, ${colors.rose})`,
  summary:
    "linear-gradient(135deg, rgba(255,122,89,0.05), rgba(233,79,146,0.05))",
} as const;

export const semanticColors = {
  // Text
  textPrimary: colors.gray[900],
  textSecondary: colors.gray[600],
  textTertiary: colors.gray[500],
  textDisabled: colors.gray[400],
  textBrand: colors.brown,
  textError: colors.error,

  // Backgrounds
  bgPrimary: colors.white,
  bgSecondary: colors.gray[50],
  bgTertiary: colors.gray[100],
  bgAccent: colors.coralTint,
  bgPage: colors.cream,
  bgDisabled: colors.gray[100],
  bgInteractiveSubtle: colors.coralSoftTint,
  bgTrack: colors.gray[200],

  // Borders
  borderDefault: colors.gray[300],
  borderLight: colors.gray[200],
  borderAccent: colors.coral,
  borderAccentLight: colors.coralBorder,
  borderAccentStrong: colors.coralStrongBorder,

  // Interactive
  interactive: colors.coral,
  interactiveHover: colors.rose,

  // Shadows - complete elevation tokens (not just colors)
  shadowLight: "0 4px 12px rgba(17, 24, 39, 0.05)",
  shadowMedium: "0 8px 24px rgba(17, 24, 39, 0.10)",
  shadowStrong: "0 20px 40px -24px rgba(17, 24, 39, 0.15)",
  shadowInteractive: `0 10px 26px ${colors.roseGlow}`,
  shadowInteractiveHover: `0 14px 30px ${colors.roseHoverGlow}`,
} as const;

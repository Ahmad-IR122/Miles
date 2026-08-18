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

  warningTint: "rgba(245, 158, 11, 0.08)",
  whiteTranslucent: "rgba(255, 255, 255, 0.9)",

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

export const warm = {
  coral: "#FF7A66",
  coralHover: "#FF856F",
  coralBright: "#FF6B6B",
  rose: "#F43F7A",

  bgPage: "#FFF9F5",
  bgSurface: "#FFFCF9",
  bgSurfaceBlur: "rgba(255, 252, 249, 0.96)", // sticky headers/footers over blur
  bgTint: "#FFF1EB",
  bgDisabled: "#E8CBC1",
  border: "#F3DED4",
  borderCoralBright: "rgba(255, 107, 107, 0.3)",

  textPrimary: "#2F211B",
  textSecondary: "#7F7068",
  textTertiary: "#9B8A82",
  textBrand: "#8B5A4B",
  textOnAccentDisabled: "rgba(255, 255, 255, 0.78)",
} as const;

export const warmGradients = {
  primary: `linear-gradient(135deg, ${warm.coral} 0%, ${warm.rose} 100%)`,
  primaryHover: `linear-gradient(135deg, ${warm.coralHover} 0%, ${warm.rose} 100%)`,
} as const;

export const warmShadows = {
  // Neutral elevation — warm brown tint
  xs: "0 8px 18px rgba(128, 73, 48, 0.07)",
  sm: "0 14px 34px rgba(128, 73, 48, 0.08)",
  md: "0 18px 38px rgba(128, 73, 48, 0.1)",
  lg: "0 24px 70px rgba(128, 73, 48, 0.13)",

  // Nav elevation — deliberately a cooler tint (textPrimary) than the scale above
  nav: "0 18px 42px rgba(47, 33, 27, 0.09)",
  navRaised: "0 8px 18px rgba(47, 33, 27, 0.07)",

  // Rose glow for accent/gradient surfaces
  roseSoft: "0 10px 20px rgba(244, 63, 122, 0.2)",
  rose: "0 12px 24px rgba(244, 63, 122, 0.26)",
  roseHover: "0 14px 28px rgba(244, 63, 122, 0.28)",
} as const;

/**
 * MIGRATION HOLDING PATTERN — not a design system.
 *
 * The itinerary screen carries a third palette: its own coral/pink accents and
 * a warm brown text ramp with no equivalent in `warm` or `semanticColors`.
 * These values are lifted verbatim out of itinerary.styles.ts so that file has
 * no raw literals, and so the duplication is visible in one place.
 *
 * Most of these are used once. That makes them renames, not tokens. The real
 * fix is a design decision on whether itinerary adopts `warm` — at which point
 * this whole block should collapse. Do not add to it.
 */
export const itinerary = {
  // Accents
  pink: "#f06292",
  peach: "#ff8a65",
  clay: "#c76b55",

  // Status
  check: "#22b66f",
  markerGreen: "#55b878",
  categoryGreenText: "#55a66d",

  // Brown text ramp, darkest to lightest
  textDarkest: "#281a18",
  textDark: "#2d1b18",
  textStrong: "#4d342f",
  textBody: "#74574e",
  textMuted: "#7e6259",
  textSubtle: "#83665c",
  textFaint: "#8b7067",
  textSecondary: "#8d6e63",
  textTertiary: "#9b7c72",
  textDisabled: "#a98a80",

  // Page gradient stops
  bgGradientTop: "#fff8f3",
  bgGradientMid: "#fffaf6",
  bgGradientBottom: "#f8efe7",

  // Surfaces
  bgGhost: "#fffaf7",
  bgBadge: "#fff0ea",
  bgHoverPeach: "#fff5ef",
  bgHoverCream: "#fff4ee",
  iconOnPrimary: "#fff5ec",
  track: "#f2dfd2",
  surfaceCard: "rgba(255, 252, 248, 0.9)",
  surfaceCardSoft: "rgba(255, 252, 248, 0.88)",
  surfaceCardSofter: "rgba(255, 252, 248, 0.86)",
  surfaceCardSoftest: "rgba(255, 252, 248, 0.84)",
  surfaceTranslucent: "rgba(255,255,255,0.78)",

  // Category chip backgrounds
  categoryPinkBg: "#fceaf2",
  categoryGreenBg: "#eef8ec",
  categoryAmberBg: "#fff3df",
  categoryRedBg: "#ffecef",

  // Timeline marker borders
  markerBorderGreen: "#ffd6c9",
  markerBorderPeach: "#ffc7bc",
  markerBorderPink: "#ffd1df",
  markerBorderCoral: "#ffc6bd",
  markerBorderOrange: "#ffd5ad",
  markerBorderClay: "#ffc4c4",

  // Borders
  borderCoral: "rgba(255, 107, 107, 0.16)",
  borderCoralStrong: "rgba(255, 107, 107, 0.36)",
  borderPeach14: "rgba(255, 138, 101, 0.14)",
  borderPeach16: "rgba(255, 138, 101, 0.16)",
  borderPeach18: "rgba(255, 138, 101, 0.18)",
  borderPeach20: "rgba(255, 138, 101, 0.2)",
  borderPeach22: "rgba(255, 138, 101, 0.22)",
} as const;

export const itineraryGradients = {
  page: `radial-gradient(circle at 8% 0%, rgba(255, 138, 101, 0.18), transparent 34%), radial-gradient(circle at 86% 10%, rgba(240, 98, 146, 0.15), transparent 31%), linear-gradient(180deg, ${itinerary.bgGradientTop} 0%, ${itinerary.bgGradientMid} 48%, ${itinerary.bgGradientBottom} 100%)`,
  sidebar:
    "linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,248,243,0.92) 100%)",
  coral: `linear-gradient(135deg, ${warm.coralBright} 0%, ${itinerary.pink} 100%)`,
  peach: `linear-gradient(135deg, ${itinerary.peach} 0%, ${warm.coralBright} 52%, ${itinerary.pink} 100%)`,
  connector:
    "linear-gradient(180deg, rgba(255,107,107,0.95) 0%, rgba(240,98,146,0.88) 58%, rgba(255,138,101,0.32) 100%)",
} as const;

export const itineraryShadows = {
  sidebar: "-18px 0 45px rgba(127, 69, 45, 0.06)",
  summaryCard: "0 18px 38px rgba(140, 82, 54, 0.09)",
  dayTab: "0 10px 26px rgba(140, 82, 54, 0.06)",
  dayTabHover: "0 14px 30px rgba(140, 82, 54, 0.1)",
  dayTabActive: "0 16px 34px rgba(240, 98, 146, 0.3)",
  sectionBar: "0 18px 42px rgba(140, 82, 54, 0.08)",
  iconButton: "0 8px 18px rgba(140, 82, 54, 0.06)",
  export: "0 12px 26px rgba(140, 82, 54, 0.07)",
  exportHover: "0 16px 30px rgba(140, 82, 54, 0.1)",
  ghostHover: "0 10px 22px rgba(128, 73, 48, 0.08)",
  modifyTrip: "0 18px 34px rgba(240, 98, 146, 0.28)",
  modifyTripHover: "0 20px 38px rgba(240, 98, 146, 0.34)",
  primary: "0 16px 30px rgba(244, 63, 122, 0.28)",
  primaryHover: "0 18px 34px rgba(244, 63, 122, 0.34)",
  outlineHover: "0 12px 26px rgba(240, 98, 146, 0.12)",
  emptyState: "0 24px 55px rgba(140, 82, 54, 0.1)",
  activityCard: "0 20px 48px rgba(140, 82, 54, 0.1)",
  activityCardHover: "0 24px 56px rgba(140, 82, 54, 0.14)",
  marker:
    "0 0 0 5px rgba(255, 240, 234, 0.9), 0 10px 22px rgba(140, 82, 54, 0.14)",
  planeIcon: "drop-shadow(0 8px 14px rgba(255, 107, 107, 0.22))",
} as const;

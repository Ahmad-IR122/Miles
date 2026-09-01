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

/**
 * THEMED TOKENS — the values below are `var()` references, not colours.
 *
 * Their light and dark values live in `theme.css`, keyed off `data-theme` on
 * <html>. They are `var()` because the app styles with Griffel `makeStyles`,
 * which is evaluated once at module load — a JS value read here can never
 * change again, so a themed token has to resolve in CSS instead.
 *
 * Consume these exactly as before; they are still just strings to Griffel.
 * The one rule: never read them back in JS (no string comparison, no passing
 * to canvas/chart APIs) — `"var(--color-text-primary)"` is all you would get.
 * The raw `colors` palette above stays literal for that reason, and for values
 * that are genuinely theme-independent (white on a coral gradient, say).
 */

export const gradients = {
  primary: "var(--gradient-primary)",
  progress: "var(--gradient-progress)",
  summary: "var(--gradient-summary)",
} as const;

export const semanticColors = {
  // Text
  textPrimary: "var(--color-text-primary)",
  textSecondary: "var(--color-text-secondary)",
  textTertiary: "var(--color-text-tertiary)",
  textDisabled: "var(--color-text-disabled)",
  textBrand: "var(--color-text-brand)",
  textError: "var(--color-text-error)",
  // Sits on a coral/rose gradient, so it is white in both themes. Prefer this
  // over `colors.white` there — it distinguishes "white on an accent" from
  // "white because the surface is light", which is the distinction that breaks
  // when a light-only design gains a dark mode.
  textOnAccent: "var(--color-text-on-accent)",

  // Backgrounds
  bgPrimary: "var(--color-bg-primary)",
  bgSecondary: "var(--color-bg-secondary)",
  bgTertiary: "var(--color-bg-tertiary)",
  bgAccent: "var(--color-bg-accent)",
  bgPage: "var(--color-bg-page)",
  bgDisabled: "var(--color-bg-disabled)",
  bgInteractiveSubtle: "var(--color-bg-interactive-subtle)",
  bgTrack: "var(--color-bg-track)",
  surfaceTranslucent: "var(--color-surface-translucent)",

  // Borders
  borderDefault: "var(--color-border-default)",
  borderLight: "var(--color-border-light)",
  borderAccent: "var(--color-border-accent)",
  borderAccentLight: "var(--color-border-accent-light)",
  borderAccentStrong: "var(--color-border-accent-strong)",

  // Interactive
  interactive: "var(--color-interactive)",
  interactiveHover: "var(--color-interactive-hover)",

  // Shadows - complete elevation tokens (not just colors)
  shadowLight: "var(--shadow-light)",
  shadowMedium: "var(--shadow-medium)",
  shadowStrong: "var(--shadow-strong)",
  shadowInteractive: "var(--shadow-interactive)",
  shadowInteractiveHover: "var(--shadow-interactive-hover)",
} as const;

export const warm = {
  coral: "var(--warm-coral)",
  coralHover: "var(--warm-coral-hover)",
  coralBright: "var(--warm-coral-bright)",
  rose: "var(--warm-rose)",
  // "Highlight headline / card" role — one flat hex in both themes. Used as a
  // solid text color (home hero) and as a solid fill (see bgTint below), not
  // as a gradient endpoint.
  gold: "var(--warm-gold)",

  // Chat widget only — dark mode gives it a dedicated navy, distinct from
  // the coral/rose accent used everywhere else. See theme.css.
  chat: "var(--warm-chat)",
  chatHover: "var(--warm-chat-hover)",

  bgPage: "var(--warm-bg-page)",
  bgSurface: "var(--warm-bg-surface)",
  bgSurfaceBlur: "var(--warm-bg-surface-blur)", // sticky headers/footers over blur
  bgTint: "var(--warm-bg-tint)",
  // Home page background image only (fades to solid past the fold, not a
  // repeating tile — see home.styles.ts).
  bgImage: "var(--warm-bg-image)",
  bgAccentBand: "var(--warm-bg-accent-band)",
  bgDisabled: "var(--warm-bg-disabled)",
  border: "var(--warm-border)",
  borderCoralBright: "var(--warm-border-coral-bright)",

  textPrimary: "var(--warm-text-primary)",
  textSecondary: "var(--warm-text-secondary)",
  textTertiary: "var(--warm-text-tertiary)",
  textBrand: "var(--warm-text-brand)",
  textOnAccentDisabled: "var(--warm-text-on-accent-disabled)",
} as const;

export const warmGradients = {
  primary: "var(--warm-gradient-primary)",
  primaryHover: "var(--warm-gradient-primary-hover)",
} as const;

export const warmShadows = {
  // Neutral elevation — warm brown tint
  xs: "var(--warm-shadow-xs)",
  sm: "var(--warm-shadow-sm)",
  md: "var(--warm-shadow-md)",
  lg: "var(--warm-shadow-lg)",

  // Nav elevation — deliberately a cooler tint (textPrimary) than the scale above
  nav: "var(--warm-shadow-nav)",
  navRaised: "var(--warm-shadow-nav-raised)",

  // Rose glow for accent/gradient surfaces
  roseSoft: "var(--warm-shadow-rose-soft)",
  rose: "var(--warm-shadow-rose)",
  roseHover: "var(--warm-shadow-rose-hover)",
} as const;

// The itinerary screen used to carry a third, separate coral/pink palette
// here (see git history for `itinerary` / `itineraryGradients` /
// `itineraryShadows`) instead of using `warm` / `semanticColors` like every
// other page. It has since been migrated onto the shared tokens above, so
// that block — and the matching `--itin-*` custom properties in theme.css —
// has been removed rather than left as unused dead weight.

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
 *
 * Dark mode was added by giving each of these its own dark counterpart in
 * theme.css rather than folding them into `warm`, so that the itinerary screen
 * stays pixel-identical in light mode. That was a deliberate trade: it doubled
 * this block's cost to maintain and made collapsing it later a larger job.
 * Every token here now has two values to keep consistent instead of one.
 */
export const itinerary = {
  // Accents
  pink: "var(--itin-pink)",
  peach: "var(--itin-peach)",
  clay: "var(--itin-clay)",

  // Status
  check: "var(--itin-check)",
  markerGreen: "var(--itin-marker-green)",
  categoryGreenText: "var(--itin-category-green-text)",

  // Brown text ramp, darkest to lightest in light mode. The ramp inverts in
  // dark — "darkest" becomes the brightest — so the names describe emphasis,
  // not literal lightness. See theme.css.
  textDarkest: "var(--itin-text-darkest)",
  textDark: "var(--itin-text-dark)",
  textStrong: "var(--itin-text-strong)",
  textBody: "var(--itin-text-body)",
  textMuted: "var(--itin-text-muted)",
  textSubtle: "var(--itin-text-subtle)",
  textFaint: "var(--itin-text-faint)",
  textSecondary: "var(--itin-text-secondary)",
  textTertiary: "var(--itin-text-tertiary)",
  textDisabled: "var(--itin-text-disabled)",

  // Page gradient stops
  bgGradientTop: "var(--itin-bg-gradient-top)",
  bgGradientMid: "var(--itin-bg-gradient-mid)",
  bgGradientBottom: "var(--itin-bg-gradient-bottom)",

  // Surfaces
  bgGhost: "var(--itin-bg-ghost)",
  bgBadge: "var(--itin-bg-badge)",
  bgHoverPeach: "var(--itin-bg-hover-peach)",
  bgHoverCream: "var(--itin-bg-hover-cream)",
  iconOnPrimary: "var(--itin-icon-on-primary)",
  track: "var(--itin-track)",
  surfaceRaised: "var(--itin-surface-raised)",
  surfaceCard: "var(--itin-surface-card)",
  surfaceCardSoft: "var(--itin-surface-card-soft)",
  surfaceCardSofter: "var(--itin-surface-card-softer)",
  surfaceCardSoftest: "var(--itin-surface-card-softest)",
  surfaceTranslucent: "var(--itin-surface-translucent)",

  // Category chip backgrounds
  categoryPinkBg: "var(--itin-category-pink-bg)",
  categoryGreenBg: "var(--itin-category-green-bg)",
  categoryAmberBg: "var(--itin-category-amber-bg)",
  categoryRedBg: "var(--itin-category-red-bg)",

  // Timeline marker borders
  markerBorderGreen: "var(--itin-marker-border-green)",
  markerBorderPeach: "var(--itin-marker-border-peach)",
  markerBorderPink: "var(--itin-marker-border-pink)",
  markerBorderCoral: "var(--itin-marker-border-coral)",
  markerBorderOrange: "var(--itin-marker-border-orange)",
  markerBorderClay: "var(--itin-marker-border-clay)",

  // Borders
  borderCoral: "var(--itin-border-coral)",
  borderCoralStrong: "var(--itin-border-coral-strong)",
  borderPeach14: "var(--itin-border-peach-14)",
  borderPeach16: "var(--itin-border-peach-16)",
  borderPeach18: "var(--itin-border-peach-18)",
  borderPeach20: "var(--itin-border-peach-20)",
  borderPeach22: "var(--itin-border-peach-22)",
} as const;

export const itineraryGradients = {
  page: "var(--itin-gradient-page)",
  sidebar: "var(--itin-gradient-sidebar)",
  coral: "var(--itin-gradient-coral)",
  peach: "var(--itin-gradient-peach)",
  connector: "var(--itin-gradient-connector)",
  spriteHalo: "var(--itin-gradient-sprite-halo)",
} as const;

export const itineraryShadows = {
  sidebar: "var(--itin-shadow-sidebar)",
  summaryCard: "var(--itin-shadow-summary-card)",
  dayTab: "var(--itin-shadow-day-tab)",
  dayTabHover: "var(--itin-shadow-day-tab-hover)",
  dayTabActive: "var(--itin-shadow-day-tab-active)",
  sectionBar: "var(--itin-shadow-section-bar)",
  iconButton: "var(--itin-shadow-icon-button)",
  export: "var(--itin-shadow-export)",
  exportHover: "var(--itin-shadow-export-hover)",
  ghostHover: "var(--itin-shadow-ghost-hover)",
  modifyTrip: "var(--itin-shadow-modify-trip)",
  modifyTripHover: "var(--itin-shadow-modify-trip-hover)",
  primary: "var(--itin-shadow-primary)",
  primaryHover: "var(--itin-shadow-primary-hover)",
  outlineHover: "var(--itin-shadow-outline-hover)",
  emptyState: "var(--itin-shadow-empty-state)",
  activityCard: "var(--itin-shadow-activity-card)",
  activityCardHover: "var(--itin-shadow-activity-card-hover)",
  marker: "var(--itin-shadow-marker)",
  planeIcon: "var(--itin-shadow-plane-icon)",
  progressGlow: "var(--itin-shadow-progress-glow)",
  sprite: "var(--itin-shadow-sprite)",
} as const;

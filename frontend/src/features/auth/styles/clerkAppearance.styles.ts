import {
  colors,
  gradients,
  semanticColors,
} from "../../../common/theme/colors";
import { layout, typography } from "../../../common/theme/typography";
import type { ResolvedTheme } from "../../../common/theme/themeMode";

/**
 * Clerk parses `variables` into derived shades, so they must be literal
 * colours — a `var()` reference is not something its theming engine can
 * transform. The appearance is therefore built per resolved theme rather than
 * following `data-theme` on its own. `elements` below is injected as raw CSS,
 * so tokens work normally there.
 *
 * KEEP IN SYNC with theme.css, same as muiTheme.ts.
 */
const palettes = {
  light: {
    text: "#111827", // --color-text-primary
    textSecondary: "#4B5563", // --color-text-secondary
    background: "#FFFFFF", // --color-bg-primary
    inputBackground: "#FFFFFF",
    // Seed for Clerk's internal grey ramp — borders, muted labels, dividers.
    // It must contrast with the background, so it flips with the theme.
    neutral: "#000000",
  },
  dark: {
    text: "#F5EDE7",
    textSecondary: "#B5A49B",
    background: "#1F1815",
    inputBackground: "#2A211C", // --color-bg-tertiary, lifted off the card
    neutral: "#FFFFFF",
  },
} as const;

export const createClerkAppearance = (theme: ResolvedTheme) => {
  const palette = palettes[theme];

  return {
    variables: {
      colorPrimary: colors.coral,
      colorText: palette.text,
      colorTextSecondary: palette.textSecondary,
      colorBackground: palette.background,
      colorInputBackground: palette.inputBackground,
      colorInputText: palette.text,
      colorNeutral: palette.neutral,
      borderRadius: layout.radius.md,
      fontFamily: typography.fontFamily.sans,
    },
    elements: {
      card: {
        boxShadow: semanticColors.shadowMedium,
        border: `1px solid ${semanticColors.borderLight}`,
      },
      formButtonPrimary: {
        background: gradients.primary,
        "&:hover": {
          opacity: 0.9,
        },
      },
      footerActionLink: {
        color: colors.rose,
      },
    },
  };
};

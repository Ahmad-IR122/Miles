import { createTheme } from "@mui/material/styles";

import type { ResolvedTheme } from "./themeMode";

/**
 * MUI's palette, which the app previously never configured — so every MUI
 * component fell back to MUI's built-in *light* defaults regardless of theme.
 * That is what left input text near-black on a dark surface: the app's own
 * styles set the label and focus ring but never `.MuiInputBase-input`, so
 * MUI's `text.primary` won.
 *
 * These are literal colours rather than `var()` references because MUI derives
 * hover/selected/disabled states by running them through `alpha()`, which
 * cannot parse a custom property. Same constraint as Clerk's `variables`.
 *
 * KEEP IN SYNC with theme.css — these mirror its light/dark halves. Only the
 * values MUI actually needs are duplicated here, not the whole palette.
 */
const palettes = {
  light: {
    primary: "#9bb7d1", // --color-interactive
    error: "#DC2626", // --color-text-error
    bgDefault: "#FBF8F3", // --color-bg-page
    bgPaper: "#FFFFFF", // --color-bg-primary
    textPrimary: "#111827", // --color-text-primary
    textSecondary: "#4B5563", // --color-text-secondary
    textDisabled: "#9CA3AF", // --color-text-disabled
    divider: "#E5E7EB", // --color-border-light
  },
  dark: {
    primary: "#9bb7d1", // --color-interactive
    error: "#F87171",
    bgDefault: "#15100D",
    bgPaper: "#1F1815",
    textPrimary: "#F5EDE7",
    textSecondary: "#B5A49B",
    textDisabled: "#746760",
    divider: "#3A2E27",
  },
} as const;

/**
 * Palette only — no typography or component defaults. The app styles MUI
 * through Griffel classes, and overriding more here would change how light
 * mode already looks.
 */
export const createAppMuiTheme = (mode: ResolvedTheme) => {
  const palette = palettes[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: palette.primary },
      error: { main: palette.error },
      background: {
        default: palette.bgDefault,
        paper: palette.bgPaper,
      },
      text: {
        primary: palette.textPrimary,
        secondary: palette.textSecondary,
        disabled: palette.textDisabled,
      },
      divider: palette.divider,
    },
  });
};

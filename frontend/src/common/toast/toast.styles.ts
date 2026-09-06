import { makeStyles, shorthands } from "@griffel/react";
import { colors, semanticColors } from "../theme/colors";
import { layout, typography, typographyPresets } from "../theme/typography";

// Restyles MUI's default SnackbarContent to match the app's card language
// (see confirmDialog.styles.ts for the same recipe: bordered card, themed
// shadow, circular tinted icon badge) instead of MUI's plain dark default.
export const useToastStyles = makeStyles({
  content: {
    "&.MuiSnackbarContent-root": {
      display: "flex",
      alignItems: "center",
      ...shorthands.padding(layout.spacing[3], layout.spacing[4]),
      ...shorthands.borderRadius(layout.radius.lg),
      ...shorthands.border(
        layout.borderWidth.thin,
        "solid",
        semanticColors.borderLight,
      ),
      backgroundColor: semanticColors.bgPrimary,
      boxShadow: semanticColors.shadowStrong,
      color: semanticColors.textPrimary,
      maxWidth: "420px",
    },
    "& .MuiSnackbarContent-message": {
      ...shorthands.padding(0),
      width: "100%",
    },
  },

  messageRow: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.spacing[3],
  },

  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "32px",
    height: "32px",
    ...shorthands.borderRadius(layout.radius.full),
  },

  successIconWrap: {
    backgroundColor: `color-mix(in srgb, ${colors.success} 14%, transparent)`,
    color: colors.success,
  },

  warningIconWrap: {
    backgroundColor: colors.warningTint,
    color: colors.warning,
  },

  icon: {
    fontSize: "19px",
  },

  message: {
    ...typographyPresets.body,
    color: semanticColors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
});

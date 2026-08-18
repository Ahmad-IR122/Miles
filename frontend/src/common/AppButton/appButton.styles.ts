import { makeStyles, shorthands } from "@griffel/react";
import { gradients, semanticColors } from "../theme/colors";
import { typography, layout } from "../theme/typography";

export const useAppButtonStyles = makeStyles({
  base: {
    "&.MuiButton-root": {
      fontFamily: typography.fontFamily.sans,
      fontWeight: typography.fontWeight.semibold,
      borderRadius: layout.radius.full,
      textTransform: "none",
      transitionProperty:
        "transform, box-shadow, background-color, border-color, color",
      transitionDuration: layout.duration.fast,
      transitionTimingFunction: "ease",
    },
    "&.MuiButton-root:focus-visible": {
      outlineColor: semanticColors.interactive,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },
  },

  medium: {
    "&.MuiButton-root": {
      fontSize: typography.fontSize.size5,
      lineHeight: typography.lineHeight.relaxed,
      padding: `${layout.padding.md} ${layout.padding.lg}`,
    },
  },

  small: {
    "&.MuiButton-root": {
      minWidth: "auto",
      minHeight: layout.controlSize.md,
      padding: `${layout.padding.xs} ${layout.padding.sm}`,
      borderRadius: layout.radius.full,
      fontSize: typography.fontSize.size4,
      lineHeight: typography.lineHeight.tight,
    },
    "&.MuiButton-root .MuiButton-startIcon": {
      marginRight: layout.spacing[2],
      marginLeft: 0,
    },
    "&.MuiButton-root .MuiButton-endIcon": {
      marginRight: 0,
      marginLeft: layout.spacing[2],
    },
    "&.MuiButton-root .MuiButton-startIcon > svg": {
      fontSize: typography.fontSize.size8,
    },
    "&.MuiButton-root .MuiButton-endIcon > svg": {
      fontSize: typography.fontSize.size8,
    },
  },

  primary: {
    "&.MuiButton-root": {
      color: semanticColors.bgPrimary,
      backgroundColor: semanticColors.interactive,
      backgroundImage: gradients.primary,
      boxShadow: semanticColors.shadowInteractive,
      ...shorthands.border("none"),
    },
    "&.MuiButton-root:hover": {
      color: semanticColors.bgPrimary,
      backgroundColor: semanticColors.interactive,
      backgroundImage: gradients.primary,
      transform: "translateY(-2px)",
      boxShadow: semanticColors.shadowInteractiveHover,
    },
    "&.MuiButton-root.Mui-disabled": {
      color: semanticColors.bgPrimary,
      backgroundColor: semanticColors.bgDisabled,
      backgroundImage: "none",
      boxShadow: "none",
    },
  },

  secondary: {
    "&.MuiButton-root": {
      color: semanticColors.interactive,
      backgroundColor: semanticColors.bgPrimary,
      ...shorthands.border(
        layout.borderWidth.thin,
        "solid",
        semanticColors.interactive,
      ),
      boxShadow: "none",
    },
    "&.MuiButton-root:hover": {
      color: semanticColors.interactiveHover,
      backgroundColor: semanticColors.bgInteractiveSubtle,
      ...shorthands.borderColor(semanticColors.interactiveHover),
      transform: "translateY(-1px)",
      boxShadow: semanticColors.shadowInteractive,
    },
    "&.MuiButton-root.Mui-disabled": {
      color: semanticColors.textDisabled,
      backgroundColor: semanticColors.bgDisabled,
      ...shorthands.borderColor(semanticColors.borderDefault),
      boxShadow: "none",
    },
  },
});

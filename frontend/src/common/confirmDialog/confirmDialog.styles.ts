import { makeStyles, shorthands } from "@griffel/react";
import { colors, semanticColors } from "../theme/colors";
import { layout, typography, typographyPresets } from "../theme/typography";

export const useConfirmDialogStyles = makeStyles({
  backdrop: {
    backgroundColor: "rgba(17, 11, 8, 0.48)",
    backdropFilter: "blur(2px)",
  },

  paper: {
    "&.MuiPaper-root": {
      width: "100%",
      maxWidth: "360px",
      margin: layout.spacing[4],
      ...shorthands.padding(layout.spacing[7], layout.spacing[6]),
      ...shorthands.borderRadius(layout.radius.xl),
      ...shorthands.border(
        layout.borderWidth.thin,
        "solid",
        semanticColors.borderLight,
      ),
      backgroundColor: semanticColors.bgPrimary,
      boxShadow: semanticColors.shadowStrong,
      textAlign: "center",
    },
  },

  // A somewhat bigger version of the same card, for messages that should
  // stand out a little more (e.g. a success confirmation) without going all
  // the way to a different dialog style.
  paperLarge: {
    "&.MuiPaper-root": {
      maxWidth: "420px",
      ...shorthands.padding(layout.spacing[8], layout.spacing[7]),
    },
  },

  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "52px",
    height: "52px",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: layout.spacing[4],
    ...shorthands.borderRadius(layout.radius.full),
    backgroundColor:
      "color-mix(in srgb, var(--color-interactive) 10%, transparent)",
    color: semanticColors.interactive,
  },

  successIconWrap: {
    backgroundColor: `color-mix(in srgb, ${colors.success} 12%, transparent)`,
    color: colors.success,
  },

  icon: {
    fontSize: "26px",
  },

  title: {
    margin: 0,
    ...typographyPresets.h3,
    color: semanticColors.textPrimary,
  },

  titleLarge: {
    fontSize: typography.fontSize.size9,
  },

  description: {
    margin: `${layout.spacing[2]} 0 0`,
    ...typographyPresets.body,
    color: semanticColors.textSecondary,
    lineHeight: typography.lineHeight.relaxed,
  },

  descriptionLarge: {
    ...typographyPresets.bodyLarge,
    lineHeight: typography.lineHeight.relaxed,
  },

  actions: {
    marginTop: layout.spacing[6],
    display: "flex",
    flexDirection: "column",
    rowGap: layout.spacing[2.5],
  },

  confirmButton: {
    ...shorthands.padding(layout.spacing[3], layout.spacing[4]),
    ...shorthands.borderRadius(layout.radius.md),
    ...shorthands.border("0"),
    backgroundColor: semanticColors.interactive,
    color: colors.white,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size5,
    fontWeight: typography.fontWeight.semibold,
    cursor: "pointer",
    transitionProperty: "background-color, transform, box-shadow",
    transitionDuration: layout.duration.fast,

    ":hover": {
      backgroundColor: semanticColors.interactiveHover,
    },

    ":focus-visible": {
      outlineColor: semanticColors.interactive,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },

    ":disabled": {
      cursor: "progress",
      opacity: 0.7,
    },
  },

  cancelButton: {
    ...shorthands.padding(layout.spacing[3], layout.spacing[4]),
    ...shorthands.borderRadius(layout.radius.md),
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderDefault,
    ),
    backgroundColor: semanticColors.bgPrimary,
    color: semanticColors.textPrimary,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size5,
    fontWeight: typography.fontWeight.semibold,
    cursor: "pointer",
    transitionProperty: "background-color, transform, box-shadow",
    transitionDuration: layout.duration.fast,

    ":hover": {
      backgroundColor: semanticColors.bgSecondary,
      ...shorthands.borderColor(semanticColors.borderDefault),
    },

    ":focus-visible": {
      outlineColor: semanticColors.interactive,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },

    ":disabled": {
      cursor: "not-allowed",
      opacity: 0.7,
    },
  },
});

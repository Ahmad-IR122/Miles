import { makeStyles, shorthands } from "@griffel/react";
import {
  semanticColors,
  warm,
  warmGradients,
  warmShadows,
} from "../../theme/colors";
import { layout, typography } from "../../theme/typography";

export const useAccountMenuStyles = makeStyles({
  trigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: layout.controlSize.xs,
    height: layout.controlSize.xs,
    padding: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    borderRadius: layout.radius.full,
    overflow: "hidden",
    ...shorthands.border("0"),
    ":focus-visible": {
      outlineColor: warm.coralBright,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },
  },
  avatar: {
    width: "100%",
    height: "100%",
    filter: "grayscale(100%)",
  },
  paper: {
    width: "min(300px, calc(100vw - 32px))",
    backgroundColor: warm.bgSurface,
    ...shorthands.border(layout.borderWidth.hairline, "solid", warm.border),
    borderRadius: layout.radius.xl,
    boxShadow: warmShadows.md,
    ...shorthands.padding(layout.spacing[2]),
  },
  preview: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.spacing[2.5],
    padding: `${layout.spacing[2.5]} ${layout.spacing[3]}`,
    backgroundImage: warmGradients.primary,
    borderRadius: layout.radius.lg,
  },
  previewAvatar: {
    width: layout.controlSize.lg,
    height: layout.controlSize.lg,
    ...shorthands.border(
      layout.borderWidth.thick,
      "solid",
      semanticColors.bgPrimary,
    ),
  },
  previewText: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.spacing[1],
    minWidth: 0,
  },
  name: {
    color: semanticColors.bgPrimary,
    fontSize: typography.fontSize.size4,
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.fontWeight.semibold,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  email: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: typography.fontSize.size2,
    lineHeight: typography.lineHeight.tight,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  divider: {
    height: layout.borderWidth.hairline,
    backgroundColor: warm.border,
    margin: `${layout.spacing[1]} 0`,
  },
  calendarSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.spacing[1],
    padding: `${layout.spacing[1]} ${layout.spacing[1]} 0`,
  },
  calendarHeading: {
    color: warm.textSecondary,
    fontSize: typography.fontSize.size2,
    fontWeight: typography.fontWeight.semibold,
    padding: `0 ${layout.spacing[2]}`,
  },
  markedDay: {
    "&.MuiPickerDay-root": {
      backgroundColor: warm.bgTint,
      color: warm.rose,
      fontWeight: typography.fontWeight.semibold,
    },
    "&.MuiPickerDay-root:hover": {
      backgroundColor: warm.bgTint,
    },
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.spacing[1],
    padding: `${layout.spacing[1]} 0 0`,
  },
  actionButton: {
    "&.MuiButton-root": {
      justifyContent: "flex-start",
      minHeight: layout.controlSize.lg,
      padding: `${layout.spacing[2]} ${layout.spacing[3]}`,
      borderRadius: layout.radius.md,
      color: warm.textPrimary,
      fontSize: typography.fontSize.size3,
      fontWeight: typography.fontWeight.normal,
      textTransform: "none",
    },
    "&.MuiButton-root:hover": {
      backgroundColor: warm.bgTint,
    },
  },
  signOutButton: {
    "&.MuiButton-root": {
      color: warm.rose,
    },
  },
  calendarWrapper: {
    transform: "scale(0.85)",
    transformOrigin: "top center",
    marginBottom: "-32px",
  },
});

import { makeStyles, shorthands } from "@griffel/react";
import { colors, semanticColors, gradients } from "../../common/theme/colors";
import {
  layout,
  typography,
  typographyPresets,
} from "../../common/theme/typography";

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: layout.radius.md,
    fontSize: typography.fontSize.size4,
    "& fieldset": {
      borderColor: semanticColors.borderDefault,
      borderWidth: layout.borderWidth.thin,
    },
    "&:hover fieldset": {
      borderColor: semanticColors.textDisabled,
    },
    "&.Mui-focused fieldset": {
      borderColor: semanticColors.interactive,
      borderWidth: layout.borderWidth.thin,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: typography.fontSize.size4,
    color: semanticColors.textTertiary,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: semanticColors.interactive,
  },
};

export const useTripPlanningFormStyles = makeStyles({
  page: {
    fontFamily: typography.fontFamily.sans,
    backgroundColor: semanticColors.bgPage,
    minHeight: "100dvh",
  },

  generatingPage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: layout.padding["2xl"],
    rowGap: layout.gap.xl,
  },

  generatingIcon: {
    width: layout.iconSize.xl,
    height: layout.iconSize.xl,
    borderRadius: layout.radius.lg,
    backgroundImage: gradients.primary,
    color: semanticColors.bgPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: semanticColors.shadowInteractive,
    "& svg": { fontSize: typography.fontSize.size12 },
  },

  centered: { textAlign: "center" },

  generatingTitle: {
    ...typographyPresets.h2,
    color: semanticColors.textPrimary,
    marginBottom: layout.gap.sm,
  },

  generatingText: {
    fontSize: typography.fontSize.size5,
    color: semanticColors.textSecondary,
    marginBottom: layout.gap.xl,
  },

  progressTrack: {
    width: "420px",
    maxWidth: "90vw",
    backgroundColor: semanticColors.bgTrack,
    borderRadius: layout.radius.full,
    height: layout.spacing[2],
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundImage: gradients.progress,
    borderRadius: layout.radius.full,
    transitionProperty: "width",
    transitionDuration: layout.duration.fast,
    transitionTimingFunction: "ease",
  },

  progressStatus: {
    fontSize: typography.fontSize.size4,
    color: semanticColors.textTertiary,
  },

  content: {
    padding: `${layout.navHeight + 60}px ${layout.padding.lg} ${layout.padding["2xl"]}`,
    maxWidth: "760px",
    margin: "0 auto",
  },

  header: { marginBottom: layout.gap.xl },

  title: {
    ...typographyPresets.h1,
    color: semanticColors.textPrimary,
    margin: `0 0 ${layout.gap.sm}`,
  },

  gradientText: {
    fontStyle: "italic",
    display: "inline-block",
    backgroundImage: gradients.primary,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  },

  subtitle: {
    fontSize: typography.fontSize.size5,
    color: semanticColors.textSecondary,
    margin: 0,
    lineHeight: typography.lineHeight.relaxed,
  },

  steps: {
    display: "flex",
    alignItems: "center",
    marginBottom: layout.gap.xl,
  },

  stepItem: { display: "flex", alignItems: "center" },
  stepItemGrowing: { flexGrow: 1 },
  stepIdentity: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
  },

  stepCircle: {
    width: layout.controlSize.sm,
    height: layout.controlSize.sm,
    borderRadius: layout.radius.md,
    flexShrink: 0,
    backgroundColor: semanticColors.bgSecondary,
    color: semanticColors.textTertiary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: typography.fontSize.size4,
    fontWeight: typography.fontWeight.bold,
    transitionProperty: "all",
    transitionDuration: layout.duration.normal,
  },

  stepCircleReached: {
    backgroundImage: gradients.primary,
    color: semanticColors.bgPrimary,
  },

  stepCircleCurrent: { boxShadow: semanticColors.shadowInteractive },

  stepLabel: {
    ...typographyPresets.label,
    color: semanticColors.textTertiary,
  },

  stepLabelReached: { color: semanticColors.textPrimary },
  stepLabelCurrent: { fontWeight: typography.fontWeight.bold },

  connector: {
    flexGrow: 1,
    height: "2px",
    margin: `0 ${layout.gap.md}`,
    backgroundColor: semanticColors.borderDefault,
    transitionProperty: "background",
    transitionDuration: layout.duration.slow,
  },

  connectorComplete: { backgroundImage: gradients.progress },

  card: {
    backgroundColor: semanticColors.bgPrimary,
    borderRadius: layout.radius.xl,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderDefault,
    ),
    padding: layout.padding.xl,
    marginBottom: layout.gap.md,
    boxShadow: semanticColors.shadowStrong,
  },

  column24: { display: "flex", flexDirection: "column", rowGap: layout.gap.lg },
  column28: { display: "flex", flexDirection: "column", rowGap: layout.gap.xl },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: layout.gap.md },

  label: {
    ...typographyPresets.label,
    color: semanticColors.textPrimary,
    marginBottom: layout.gap.sm,
  },

  counterRow: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.md,
  },

  counterButton: {
    width: layout.controlSize.lg,
    height: layout.controlSize.lg,
    borderRadius: layout.radius.md,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderDefault,
    ),
    backgroundColor: semanticColors.bgPrimary,
    color: semanticColors.textSecondary,
    transitionProperty: "border-color, color, background-color",
    transitionDuration: layout.duration.fast,
    ":hover": {
      ...shorthands.borderColor(semanticColors.interactive),
      backgroundColor: semanticColors.bgInteractiveSubtle,
      color: semanticColors.interactive,
    },
    ":focus-visible": {
      outlineColor: semanticColors.interactive,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },
  },

  count: {
    fontSize: typography.fontSize.size10,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textPrimary,
    minWidth: layout.spacing[8],
    textAlign: "center",
  },

  hint: {
    ...typographyPresets.caption,
    color: semanticColors.textTertiary,
  },

  currency: {
    color: semanticColors.textSecondary,
    marginRight: layout.gap.sm,
  },

  interestHeader: { marginBottom: layout.gap.lg },

  interestTitle: {
    fontSize: typography.fontSize.size7,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textPrimary,
    margin: `0 0 ${layout.gap.sm}`,
  },

  interestText: {
    fontSize: typography.fontSize.size3,
    color: semanticColors.textSecondary,
    margin: 0,
  },

  chips: {
    display: "flex",
    flexWrap: "wrap",
    gap: layout.gap.sm,
  },

  chip: {
    height: "auto",
    borderRadius: layout.radius.full,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderDefault,
    ),
    backgroundColor: semanticColors.bgPrimary,
    color: semanticColors.textSecondary,
    ...typographyPresets.chipLabel,
    transitionProperty: "border-color, background-color, color",
    transitionDuration: layout.duration.normal,
    "& .MuiChip-label": { padding: `${layout.gap.sm} ${layout.gap.md}` },
    ":hover": {
      ...shorthands.borderColor(semanticColors.textDisabled),
      backgroundColor: semanticColors.bgSecondary,
    },
    ":focus-visible": {
      outlineColor: semanticColors.interactive,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },
  },

  chipActive: {
    ...shorthands.borderColor(semanticColors.interactive),
    backgroundColor: colors.coralTint,
    color: semanticColors.interactive,
    fontWeight: typography.fontWeight.bold,
    ":hover": {
      ...shorthands.borderColor(semanticColors.interactive),
      backgroundColor: semanticColors.bgInteractiveSubtle,
    },
  },

  otherField: { marginTop: layout.gap.md },

  selectionNotice: {
    marginTop: layout.gap.lg,
    padding: `${layout.gap.sm} ${layout.gap.md}`,
    borderRadius: layout.radius.md,
    backgroundColor: semanticColors.bgInteractiveSubtle,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderAccentLight,
    ),
    color: semanticColors.interactive,
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
  },

  selectionNoticeText: {
    margin: 0,
    ...typographyPresets.label,
    color: semanticColors.interactive,
  },

  summary: {
    marginTop: layout.gap.lg,
    backgroundImage: gradients.summary,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderAccentStrong,
    ),
    borderRadius: layout.radius.lg,
    padding: `${layout.gap.lg} ${layout.gap.md}`,
  },

  summaryTitle: {
    fontSize: typography.fontSize.size6,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textPrimary,
    marginBottom: layout.gap.lg,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: layout.spacing[8],
    rowGap: layout.gap.sm,
  },

  summaryKey: {
    fontSize: typography.fontSize.size2,
    color: semanticColors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: layout.gap.sm,
  },

  summaryValue: {
    fontSize: typography.fontSize.size4,
    color: semanticColors.textPrimary,
    fontWeight: typography.fontWeight.bold,
  },

  error: {
    color: semanticColors.textError,
    fontSize: typography.fontSize.size3,
    marginTop: layout.gap.lg,
    marginBottom: 0,
  },

  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  hidden: { visibility: "hidden" },
});

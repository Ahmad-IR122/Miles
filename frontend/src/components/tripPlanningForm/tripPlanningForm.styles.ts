import { makeStyles, shorthands } from "@griffel/react";
import {
  colors,
  semanticColors,
  gradients,
  warm,
} from "../../common/theme/colors";
import {
  layout,
  typography,
  typographyPresets,
} from "../../common/theme/typography";

export const fieldSx = {
  "& .MuiOutlinedInput-root, & .MuiPickersOutlinedInput-root": {
    borderRadius: layout.radius.md,
    fontSize: typography.fontSize.size4,
    backgroundColor: semanticColors.bgPrimary,
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
    "&.Mui-error fieldset": {
      borderColor: semanticColors.textError,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: typography.fontSize.size4,
    color: semanticColors.textTertiary,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: semanticColors.interactive,
  },
  "& .MuiInputLabel-root.Mui-error": {
    color: semanticColors.textError,
  },
  "& .MuiFormHelperText-root.Mui-error": {
    color: semanticColors.textError,
  },
};

export const completedFieldSx = {
  "& .MuiOutlinedInput-root:not(.Mui-error):not(.Mui-focused), & .MuiPickersOutlinedInput-root:not(.Mui-error):not(.Mui-focused)":
    {
      "& fieldset": {
        borderColor: `color-mix(in srgb, ${colors.success} 55%, transparent)`,
      },
      "&:hover fieldset": {
        borderColor: `color-mix(in srgb, ${colors.success} 70%, transparent)`,
      },
    },
};

export const getFieldSx = (isCompleted: boolean) =>
  isCompleted ? { ...fieldSx, ...completedFieldSx } : fieldSx;

/** Shared breakpoints for the responsive rules below. */
const bp = {
  tablet: "(max-width: 640px)",
  mobile: "(max-width: 420px)",
} as const;

export const useTripPlanningFormStyles = makeStyles({
  page: {
    fontFamily: typography.fontFamily.sans,
    backgroundColor: semanticColors.bgPage,
    backgroundImage: warm.bgImage,
    backgroundSize: "cover",
    backgroundPosition: "top center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    minHeight: "100dvh",
  },
  content: {
    width: "100%",
    boxSizing: "border-box",
    padding: `${layout.navHeight + 60}px ${layout.padding.lg} ${layout.padding["2xl"]}`,
    maxWidth: "760px",
    margin: "0 auto",
    [`@media ${bp.tablet}`]: {
      padding: `${layout.navHeight + 32}px ${layout.padding.md} ${layout.padding.xl}`,
    },
    [`@media ${bp.mobile}`]: {
      padding: `${layout.navHeight + 24}px ${layout.padding.sm} ${layout.padding.lg}`,
    },
  },
  header: { marginBottom: layout.gap.xl },
  title: {
    ...typographyPresets.h1,
    color: semanticColors.textPrimary,
    margin: `0 0 ${layout.gap.sm}`,
    [`@media ${bp.tablet}`]: {
      fontSize: "clamp(1.5rem, 6vw, 2.25rem)",
    },
  },
  gradientText: {
    fontStyle: "italic",
    display: "inline-block",
    backgroundImage: gradients.primary,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: colors.transparent,
  },
  steps: {
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    marginBottom: layout.gap.xl,
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    minWidth: 0,
  },
  stepItemGrowing: { flexGrow: 1 },
  stepIdentity: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
    minWidth: 0,
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
    color: semanticColors.textOnAccent,
  },
  stepCircleCurrent: { boxShadow: semanticColors.shadowInteractive },
  stepLabel: {
    ...typographyPresets.label,
    color: semanticColors.textTertiary,
  },
  stepLabelReached: { color: semanticColors.textPrimary },
  stepLabelCurrent: { fontWeight: typography.fontWeight.bold },
  stepLabelHideOnMobile: {
    [`@media ${bp.mobile}`]: {
      display: "none",
    },
  },
  connector: {
    flexGrow: 1,
    height: layout.borderWidth.thick,
    margin: `0 ${layout.gap.md}`,
    backgroundColor: semanticColors.borderDefault,
    transitionProperty: "background",
    transitionDuration: layout.duration.slow,
    [`@media ${bp.mobile}`]: {
      margin: `0 ${layout.gap.sm}`,
    },
  },
  connectorComplete: { backgroundImage: gradients.progress },
  card: {
    backgroundColor: semanticColors.bgPrimary,
    backgroundImage: gradients.summary,
    borderRadius: layout.radius.xl,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderAccentLight,
    ),
    padding: layout.padding.xl,
    marginBottom: layout.gap.md,
    boxShadow: semanticColors.shadowStrong,
    "& .MuiDivider-root": {
      ...shorthands.borderColor(semanticColors.borderAccentLight),
    },
    [`@media ${bp.tablet}`]: {
      padding: layout.padding.lg,
    },
    [`@media ${bp.mobile}`]: {
      padding: layout.padding.md,
      borderRadius: layout.radius.lg,
    },
  },
  column24: { display: "flex", flexDirection: "column", rowGap: layout.gap.lg },
  column28: { display: "flex", flexDirection: "column", rowGap: layout.gap.xl },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: layout.gap.md,
    [`@media ${bp.tablet}`]: {
      gridTemplateColumns: "1fr",
    },
  },
  travelerGroupSpacing: { marginTop: layout.spacing[4] },
  label: {
    ...typographyPresets.label,
    color: semanticColors.textPrimary,
    marginBottom: layout.gap.sm,
  },
  counterRow: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.md,
    rowGap: layout.gap.sm,
    flexWrap: "wrap",
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
      outlineOffset: layout.borderWidth.thick,
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
  budgetSliderWrapper: {
    width: "100%",
    maxWidth: "440px",
    margin: "0 auto",
    padding: `${layout.gap.xl} ${layout.gap.sm} ${layout.gap.sm}`,
    boxSizing: "border-box",
  },
  budgetSlider: {
    color: semanticColors.interactive,
    padding: `${layout.spacing[5]} 0`,
    "& .MuiSlider-track": {
      height: layout.spacing[4],
      backgroundImage: gradients.primary,
      border: "none",
      borderRadius: layout.radius.full,
    },
    "& .MuiSlider-rail": {
      height: layout.spacing[4],
      backgroundColor: semanticColors.borderDefault,
      opacity: 1,
      borderRadius: layout.radius.full,
    },
    "& .MuiSlider-thumb": {
      width: layout.controlSize.xs,
      height: layout.controlSize.xs,
      backgroundColor: semanticColors.bgPrimary,
      ...shorthands.border(
        layout.borderWidth.thick,
        "solid",
        semanticColors.interactive,
      ),
      boxShadow: semanticColors.shadowStrong,
      "&::before": { display: "none" },
      "&:hover, &.Mui-focusVisible, &.Mui-active": {
        boxShadow: semanticColors.shadowStrong,
      },
    },
    "& .MuiSlider-valueLabel": {
      backgroundImage: gradients.primary,
      color: semanticColors.textOnAccent,
      fontSize: typography.fontSize.size3,
      fontWeight: typography.fontWeight.bold,
      borderRadius: layout.radius.full,
      padding: `${layout.spacing[1]} ${layout.gap.md}`,
      transformOrigin: "bottom center",
      "&::before": { display: "none" },
      "&.MuiSlider-valueLabelOpen": {
        transform: "translateY(-100%) scale(1)",
      },
    },
  },
  budgetRangeSummary: {
    display: "flex",
    justifyContent: "space-between",
    maxWidth: "440px",
    margin: `${layout.gap.sm} auto 0`,
  },
  budgetRangeSummaryLabel: {
    ...typographyPresets.caption,
    color: semanticColors.textTertiary,
  },
  interestHeader: { marginBottom: layout.gap.md },
  interestHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: layout.gap.md,
    rowGap: layout.gap.sm,
    flexWrap: "wrap",
  },
  interestTitle: {
    "&.MuiTypography-root": {
      fontSize: typography.fontSize.size7,
      fontWeight: typography.fontWeight.bold,
      color: semanticColors.textPrimary,
      margin: `0 0 ${layout.spacing[1]}`,
    },
  },
  interestCounter: {
    flexShrink: 0,
    fontSize: typography.fontSize.size3,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textTertiary,
    backgroundColor: semanticColors.bgAccent,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderAccentLight,
    ),
    borderRadius: layout.radius.full,
    padding: `${layout.spacing[1]} ${layout.gap.md}`,
    marginBottom: layout.spacing[1],
    transitionProperty: "background-color, color",
    transitionDuration: layout.duration.normal,
  },
  interestCounterComplete: {
    color: semanticColors.textOnAccent,
    backgroundImage: gradients.primary,
  },
  interestText: {
    "&.MuiTypography-root": {
      ...typographyPresets.caption,
      color: semanticColors.textTertiary,
      margin: 0,
    },
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
      outlineOffset: layout.borderWidth.thick,
    },
  },
  chipActive: {
    ...shorthands.borderColor(semanticColors.interactive),
    backgroundImage: gradients.primary,
    color: semanticColors.textOnAccent,
    fontWeight: typography.fontWeight.bold,
    boxShadow: semanticColors.shadowInteractive,
    "& .MuiChip-label": { padding: `${layout.gap.sm} ${layout.gap.md}` },
    ":hover": {
      ...shorthands.borderColor(semanticColors.interactive),
      backgroundImage: gradients.primary,
      opacity: 0.92,
    },
  },
  otherField: { marginTop: layout.gap.md },
  destinationHint: {
    ...typographyPresets.caption,
    color: semanticColors.textTertiary,
    margin: `${layout.gap.sm} 0 0`,
  },
  notesField: { marginTop: layout.gap.lg },
  summary: {
    marginTop: layout.gap.lg,
    backgroundImage: gradients.summary,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderAccentStrong,
    ),
    borderRadius: layout.radius.lg,
    padding: layout.gap.md,
  },
  summaryTitle: {
    "&.MuiTypography-root": {
      fontSize: typography.fontSize.size6,
      fontWeight: typography.fontWeight.bold,
      lineHeight: typography.lineHeight.tight,
      color: semanticColors.textPrimary,
      margin: `0 0 ${layout.gap.md}`,
    },
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: layout.spacing[8],
    rowGap: layout.gap.sm,
    [`@media ${bp.mobile}`]: {
      gridTemplateColumns: "1fr",
      rowGap: layout.gap.md,
    },
  },
  summaryKey: {
    "&.MuiTypography-root": {
      fontSize: typography.fontSize.size2,
      color: semanticColors.textTertiary,
      fontWeight: typography.fontWeight.medium,
      margin: `0 0 ${layout.spacing[1]}`,
    },
  },
  summaryValue: {
    "&.MuiTypography-root": {
      fontSize: typography.fontSize.size3,
      color: semanticColors.textPrimary,
      fontWeight: typography.fontWeight.semibold,
      overflowWrap: "anywhere",
      margin: 0,
    },
  },
  error: {
    color: semanticColors.textError,
    fontSize: typography.fontSize.size3,
    marginTop: layout.gap.lg,
    marginBottom: 0,
  },
  fieldError: {
    color: semanticColors.textError,
    fontSize: typography.fontSize.size2,
    lineHeight: typography.lineHeight.normal,
    marginTop: layout.spacing[1],
    marginBottom: 0,
  },
  tripDetailsGeneralError: {
    width: "100%",
    color: semanticColors.textError,
    fontSize: typography.fontSize.size2,
    lineHeight: typography.lineHeight.normal,
    textAlign: "center",
    marginTop: layout.gap.md,
    marginBottom: 0,
  },
  navigation: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: layout.gap.sm,
  },
  hidden: { visibility: "hidden" },
  bookedDay: {
    "&.MuiPickerDay-root": {
      backgroundColor: warm.bgTint,
      color: warm.rose,
      fontWeight: typography.fontWeight.semibold,
    },
    "&.MuiPickerDay-root:hover": {
      backgroundColor: warm.bgTint,
    },
  },
});

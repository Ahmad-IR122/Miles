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
    minHeight: "100dvh",
  },
  content: {
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
    color: "transparent",
  },
  subtitle: {
    fontSize: typography.fontSize.size5,
    color: semanticColors.textSecondary,
    margin: 0,
    lineHeight: typography.lineHeight.relaxed,
    [`@media ${bp.tablet}`]: {
      fontSize: typography.fontSize.size4,
    },
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
  stepLabelHideOnMobile: {
    [`@media ${bp.mobile}`]: {
      display: "none",
    },
  },
  connector: {
    flexGrow: 1,
    height: "2px",
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
  budgetOptions: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    gap: layout.gap.xl,
    width: "100%",
    [`@media ${bp.mobile}`]: {
      flexDirection: "column",
      flexWrap: "wrap",
      gap: layout.gap.sm,
    },
  },
  budgetOption: {
    flexGrow: 1,
    flexBasis: "0",
    minWidth: "0",
    margin: "0",
    padding: `${layout.gap.sm} ${layout.gap.md}`,
    borderRadius: layout.radius.md,
    ...shorthands.border(layout.borderWidth.thin, "solid", "transparent"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: semanticColors.textSecondary,
    cursor: "pointer",
    transitionProperty: "border-color, background-color, color",
    transitionDuration: layout.duration.normal,
    "& .MuiRadio-root": {
      color: semanticColors.textDisabled,
      padding: layout.gap.sm,
    },
    "& .MuiRadio-root.Mui-focusVisible": {
      outlineColor: semanticColors.interactive,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
      borderRadius: layout.radius.full,
    },
    "& .MuiFormControlLabel-label": {
      fontSize: typography.fontSize.size4,
      fontWeight: typography.fontWeight.medium,
    },
    [`@media ${bp.mobile}`]: {
      justifyContent: "flex-start",
      width: "100%",
    },
  },
  budgetOptionSelected: {
    color: semanticColors.interactive,
    backgroundColor: semanticColors.bgInteractiveSubtle,
    borderRadius: layout.radius.md,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.interactive,
    ),
    "& .MuiRadio-root.Mui-checked": {
      color: semanticColors.interactive,
    },
    "& .MuiFormControlLabel-label": {
      color: semanticColors.interactive,
      fontWeight: typography.fontWeight.bold,
    },
  },
  currency: {
    color: semanticColors.textSecondary,
    marginRight: layout.gap.sm,
  },
  interestHeader: { marginBottom: layout.gap.lg },
  interestHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: layout.gap.md,
    rowGap: layout.gap.sm,
    flexWrap: "wrap",
  },
  interestTitle: {
    fontSize: typography.fontSize.size7,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textPrimary,
    margin: `0 0 ${layout.gap.sm}`,
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
    marginBottom: layout.gap.sm,
    transitionProperty: "background-color, color",
    transitionDuration: layout.duration.normal,
  },
  interestCounterComplete: {
    color: semanticColors.bgPrimary,
    backgroundImage: gradients.primary,
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
    backgroundImage: gradients.primary,
    color: semanticColors.bgPrimary,
    fontWeight: typography.fontWeight.bold,
    boxShadow: semanticColors.shadowInteractive,
    "& .MuiChip-label": { padding: `${layout.gap.sm} ${layout.gap.md}` },
    ":hover": {
      ...shorthands.borderColor(semanticColors.interactive),
      backgroundImage: gradients.primary,
      opacity: 0.92,
    },
  },
  completedChoice: {
    ...shorthands.borderColor("rgba(16, 185, 129, 0.6)"),
    ":hover": {
      ...shorthands.borderColor("rgba(16, 185, 129, 0.75)"),
    },
    ":focus-visible": {
      outlineColor: "rgba(16, 185, 129, 0.8)",
    },
  },
  otherField: { marginTop: layout.gap.md },
  destinationList: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.sm,
  },
  destinationSectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: layout.gap.md,
    marginBottom: layout.gap.sm,
  },
  destinationRow: {
    display: "grid",
    gridTemplateColumns: "28px minmax(0, 1fr) minmax(0, 1fr) 96px 32px",
    alignItems: "start",
    gap: layout.gap.sm,
    [`@media ${bp.tablet}`]: {
      gridTemplateColumns: "28px minmax(0, 1fr) 96px 32px",
      "& > :nth-child(2)": { gridColumn: "2 / 5" },
      "& > :nth-child(3)": { gridColumn: "2 / 3" },
      "& > :nth-child(4)": { gridColumn: "3 / 4" },
      "& > :nth-child(5)": { gridColumn: "4 / 5" },
    },
    [`@media ${bp.mobile}`]: {
      gridTemplateColumns: "28px minmax(0, 1fr) 32px",
      "& > :nth-child(2), & > :nth-child(3)": { gridColumn: "2 / 4" },
      "& > :nth-child(4)": { gridColumn: "2 / 3" },
      "& > :nth-child(5)": { gridColumn: "3 / 4" },
    },
  },
  destinationCard: {
    padding: layout.gap.sm,
    borderRadius: layout.radius.md,
    backgroundColor: semanticColors.bgSecondary,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderDefault,
    ),
  },
  destinationNumber: {
    width: "28px",
    height: "28px",
    borderRadius: layout.radius.full,
    backgroundImage: gradients.primary,
    color: semanticColors.bgPrimary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: typography.fontSize.size2,
    fontWeight: typography.fontWeight.bold,
    marginTop: "8px",
  },
  destinationInput: {
    "& .MuiOutlinedInput-root": {
      minHeight: "42px",
    },
    "& .MuiInputLabel-root": {
      fontSize: typography.fontSize.size3,
    },
    "& .MuiFormHelperText-root": {
      marginTop: layout.spacing[1],
      fontSize: typography.fontSize.size1,
    },
  },
  destinationRemoveButton: {
    width: layout.controlSize.sm,
    height: layout.controlSize.sm,
    marginTop: "4px",
    color: semanticColors.textTertiary,
    ":hover": {
      color: semanticColors.textError,
      backgroundColor: semanticColors.bgSecondary,
    },
  },
  daysSummary: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: layout.gap.sm,
    marginTop: layout.gap.sm,
    padding: `${layout.spacing[1]} ${layout.gap.sm}`,
    borderRadius: layout.radius.md,
    backgroundColor: "transparent",
  },
  daysSummaryItem: {
    margin: 0,
    color: semanticColors.textSecondary,
    fontSize: typography.fontSize.size2,
  },
  daysSummaryStatus: {
    paddingLeft: layout.gap.sm,
    ...shorthands.borderLeft(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderDefault,
    ),
  },
  daysSummaryOverage: {
    color: semanticColors.textError,
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
    [`@media ${bp.mobile}`]: {
      gridTemplateColumns: "1fr",
      rowGap: layout.gap.md,
    },
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

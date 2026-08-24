import { makeStyles, shorthands } from "@griffel/react";
import {
  colors,
  semanticColors,
  gradients,
  warm,
  itinerary,
  itineraryShadows,
  itineraryGradients,
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

/**
 * Geometry of the circular progress ring that wraps the loading sprite.
 * The SVG viewBox is 1:1 with pixels so the plane, positioned in CSS, can
 * share the same radius as the stroked circle.
 */
export const progressRing = {
  size: 240,
  radius: 110,
  stroke: 12,
  /** The plane flies just outside the stroke so it never smudges into it. */
  planeRadius: 126,
} as const;

export const progressRingCircumference = 2 * Math.PI * progressRing.radius;

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
    backgroundImage: itineraryGradients.page,
  },
  generatingIcon: {
    width: "140px",
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: itineraryGradients.spriteHalo,
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      imageRendering: "pixelated",
      filter: itineraryShadows.sprite,
    },
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
  },
  progressRing: {
    position: "relative",
    width: `${progressRing.size}px`,
    height: `${progressRing.size}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Rotated so the sweep starts at 12 o'clock instead of the SVG default 3.
  progressRingSvg: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    transform: "rotate(-90deg)",
  },
  progressRingTrack: {
    fill: "none",
    stroke: semanticColors.bgTrack,
    strokeWidth: `${progressRing.stroke}px`,
  },
  progressRingFill: {
    fill: "none",
    stroke: "url(#loadingProgressGradient)",
    strokeWidth: `${progressRing.stroke}px`,
    strokeLinecap: "round",
    filter: itineraryShadows.progressGlow,
    transitionProperty: "stroke-dashoffset",
    transitionDuration: layout.duration.normal,
    transitionTimingFunction: "linear",
  },
  progressRingGradientStart: { stopColor: warm.coralBright },
  progressRingGradientEnd: { stopColor: itinerary.pink },
  // Parked at the centre; the inline transform walks it around the ring.
  progressPlane: {
    position: "absolute",
    top: "50%",
    left: "50%",
    color: warm.coralBright,
    fontSize: typography.fontSize.size11,
    filter: itineraryShadows.planeIcon,
    transitionProperty: "transform",
    transitionDuration: layout.duration.normal,
    transitionTimingFunction: "linear",
    pointerEvents: "none",
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
  },
  column24: { display: "flex", flexDirection: "column", rowGap: layout.gap.lg },
  column28: { display: "flex", flexDirection: "column", rowGap: layout.gap.xl },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: layout.gap.md },
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
  },
  budgetOption: {
    flexGrow: 1,
    flexBasis: "0",
    minWidth: "0",
    margin: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: semanticColors.textSecondary,
    cursor: "pointer",
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
  },
  budgetOptionSelected: {
    "& .MuiRadio-root.Mui-checked": {
      color: semanticColors.interactive,
    },
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

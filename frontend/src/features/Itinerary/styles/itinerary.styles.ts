import { makeStyles, shorthands } from "@griffel/react";
import {
  colors,
  semanticColors,
  warm,
  warmGradients,
  warmShadows,
} from "../../../common/theme/colors";
import { layout, typography } from "../../../common/theme/typography";

/**
 * This screen used to run its own coral/pink accent and warm-brown text ramp
 * (see colors.ts history), independent of `warm`/`semanticColors` used by the
 * rest of the app — so it drifted out of step with the app's actual accent
 * (now blue) and its own body font (Inter here vs. the app's Helvetica Neue
 * elsewhere). Everything below now draws from the shared `warm`/
 * `semanticColors` tokens instead, the same ones every other page uses.
 *
 * The half-dozen activity-category colors (culture/food/nature/etc.) are the
 * one deliberate exception: they exist purely to tell categories apart at a
 * glance, not to carry brand meaning, so they keep distinct hues (sourced
 * from `colors.success` / `colors.warning` / `semanticColors.textError`,
 * plus `warm.rose` and two blue shades for the rest) rather than collapsing
 * onto a single accent color.
 */
export const useItineraryStyles = makeStyles({
  page: {
    position: "relative",
    minHeight: "100vh",
    color: semanticColors.textPrimary,
    backgroundColor: warm.bgPage,
    fontFamily: typography.fontFamily.sans,
    // The nav is fixed and overlays the page, so clear its height plus
    // its inset here (same amount AppLayout's navOffset used to add as
    // a separate wrapper) - keeping it on this element instead means the
    // wallpaper above covers the cleared area too, instead of showing
    // navOffset's plain background color as a seam above the page.
    paddingTop: `${layout.navHeight + 66}px`,
    "@media (max-width: 760px)": {
      paddingTop: `${layout.navHeight + 52}px`,
    },
    // Wallpaper lives on a fixed pseudo-element instead of
    // background-attachment: fixed on the page itself - that property forces
    // the browser to repaint the background on every scroll frame, which is
    // what caused this page to feel sluggish while scrolling. A
    // position: fixed layer gets its own compositor layer, so scrolling the
    // content above it is cheap, while still sizing "cover" against the
    // viewport rather than the full scroll height.
    "::before": {
      content: "\"\"",
      position: "fixed",
      inset: 0,
      zIndex: -1,
      backgroundImage: warm.bgImage,
      backgroundSize: "cover",
      backgroundPosition: "top center",
      backgroundRepeat: "no-repeat",
    },
  },
  shell: {
    maxWidth: "none",
    ...shorthands.padding("0"),
  },
  layout: {
    display: "grid",
    gridTemplateAreas: "'main summary'",
    gridTemplateColumns: "minmax(0, 1fr) 304px",
    minHeight: "100vh",
    "@media (max-width: 980px)": {
      gridTemplateAreas: "'summary' 'main'",
      gridTemplateColumns: "1fr",
    },
  },
  noSummaryLayout: {
    gridTemplateAreas: "'main'",
    gridTemplateColumns: "1fr",
  },
  mainContent: {
    gridArea: "main",
    minWidth: 0,
    ...shorthands.padding(layout.spacing[10], layout.spacing[10], "28px"),
    "@media (max-width: 720px)": {
      ...shorthands.padding(
        layout.padding.lg,
        layout.padding.md,
        layout.spacing[5],
      ),
    },
  },
  centeredMainContent: {
    minHeight: "calc(100vh - 126px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  summarySidebar: {
    gridArea: "summary",
    minWidth: 0,
    minHeight: "100vh",
    backgroundColor: semanticColors.bgPrimary,
    backdropFilter: "blur(18px)",
    ...shorthands.borderLeft(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderAccent,
    ),
    ...shorthands.padding(layout.padding.xl, "22px"),
    boxShadow: warmShadows.lg,
    "@media (max-width: 980px)": {
      minHeight: "auto",
      ...shorthands.borderLeft("0"),
      ...shorthands.borderBottom(
        layout.borderWidth.hairline,
        "solid",
        semanticColors.borderAccent,
      ),
    },
  },
  summaryTitle: {
    color: semanticColors.textPrimary,
    fontSize: typography.fontSize.size8,
    lineHeight: "24px",
    fontWeight: 850,
    marginBottom: layout.spacing[5.5],
  },
  summaryCards: {
    display: "grid",
    gap: layout.gap.md,
    marginBottom: layout.spacing[5.5],
    "@media (max-width: 980px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    },
    "@media (max-width: 760px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    "@media (max-width: 480px)": {
      gridTemplateColumns: "1fr",
    },
  },
  summaryCard: {
    position: "relative",
    minWidth: 0,
    minHeight: "128px",
    backgroundColor: semanticColors.bgPrimary,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
    ...shorthands.borderRadius("22px"),
    ...shorthands.padding(
      layout.spacing[4.5],
      layout.padding.md,
      layout.padding.md,
    ),
    boxShadow: warmShadows.sm,
  },
  summaryCheck: {
    position: "absolute",
    top: layout.spacing[4],
    right: layout.spacing[4],
    color: colors.success,
    fontSize: typography.fontSize.size4,
    lineHeight: "14px",
    fontWeight: 900,
  },
  summaryValue: {
    color: semanticColors.textPrimary,
    fontSize: typography.displaySize.sm,
    lineHeight: "30px",
    fontWeight: 900,
    marginTop: layout.spacing[4.5],
    overflowWrap: "anywhere",
  },
  summaryLabel: {
    color: warm.coralBright,
    fontSize: typography.fontSize.size1,
    lineHeight: "15px",
    fontWeight: 800,
    marginTop: "2px",
    textTransform: "uppercase",
  },
  summaryNote: {
    color: semanticColors.textTertiary,
    fontSize: typography.fontSize.size2,
    lineHeight: "17px",
    fontWeight: typography.fontWeight.medium,
    marginTop: layout.spacing[1],
  },
  summaryMoneyIcon: {
    color: warm.coralBright,
    fontSize: typography.fontSize.size10,
  },
  summaryCalendarIcon: {
    color: warm.coralBright,
    fontSize: typography.fontSize.size10,
  },
  summaryTargetIcon: {
    color: warm.coralBright,
    fontSize: typography.fontSize.size10,
  },
  summaryTravelersIcon: {
    color: warm.coralBright,
    fontSize: typography.fontSize.size10,
  },
  budgetRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: semanticColors.textSecondary,
    fontSize: typography.fontSize.size2,
    lineHeight: "17px",
    fontWeight: 800,
    marginBottom: layout.spacing[2.5],
  },
  progressTrack: {
    height: layout.spacing[2],
    overflow: "hidden",
    backgroundColor: semanticColors.bgTrack,
    ...shorthands.borderRadius(layout.radius.pill),
    marginBottom: layout.spacing[5.5],
  },
  progressFill: {
    height: "100%",
    background: warmGradients.primary,
    ...shorthands.borderRadius(layout.radius.pill),
  },
  modifyTripButton: {
    width: "100%",
    height: "52px",
    color: semanticColors.textOnAccent,
    background: warmGradients.primary,
    ...shorthands.borderRadius(layout.radius.pill),
    textTransform: "none",
    fontSize: typography.fontSize.size4,
    lineHeight: "20px",
    fontWeight: 850,
    boxShadow: semanticColors.shadowInteractive,
    marginBottom: layout.spacing[3.5],
    ":hover": {
      background: warmGradients.primaryHover,
      boxShadow: semanticColors.shadowInteractiveHover,
    },
  },
  modifyTripIcon: {
    color: semanticColors.textOnAccent,
    fontSize: typography.fontSize.size8,
  },
  exportButton: {
    width: "100%",
    height: layout.controlSize["2xl"],
    color: semanticColors.textPrimary,
    backgroundColor: semanticColors.surfaceTranslucent,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderDefault,
    ),
    ...shorthands.borderRadius(layout.radius.pill),
    textTransform: "none",
    fontSize: typography.fontSize.size3,
    lineHeight: "18px",
    fontWeight: 850,
    boxShadow: warmShadows.xs,
    ":hover": {
      backgroundColor: semanticColors.bgPrimary,
      boxShadow: warmShadows.sm,
    },
  },
  headerFrame: {
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
    ...shorthands.borderRadius(layout.radius["2xl"]),
    backgroundColor: semanticColors.bgPrimary,
    boxShadow: warmShadows.xs,
    ...shorthands.padding(layout.padding.sm, layout.padding.lg),
    marginBottom: layout.spacing[8],
    minWidth: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: layout.gap.lg,
    marginBottom: layout.spacing[6],
    "@media (max-width: 760px)": {
      flexDirection: "column",
    },
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: layout.gap.sm,
    flexWrap: "wrap",
    minWidth: 0,
  },
  planeIcon: {
    color: warm.coralBright,
    fontSize: typography.fontSize.size12,
    transform: "rotate(-18deg)",
    filter: `drop-shadow(0 2px 4px color-mix(in srgb, ${warm.coralBright} 30%, transparent))`,
  },
  titleCountry: {
    "&.MuiTypography-root": {
      margin: 0,
      color: semanticColors.textPrimary,
      // Matches the serif used for display headings across the rest of the
      // app (home hero, page h1/h2) instead of the brand wordmark font,
      // which is reserved for the "Miles" logotype itself.
      fontFamily: typography.fontFamily.serif,
      fontSize: typography.displaySize.xl,
      fontWeight: typography.fontWeight.bold,
      lineHeight: 1,
      letterSpacing: typography.letterSpacing.tight,
      textTransform: "uppercase",
      overflowWrap: "anywhere",
      "@media (max-width: 560px)": {
        fontSize: typography.displaySize.lg,
      },
    },
  },
  titleCity: {
    "&.MuiTypography-root": {
      margin: 0,
      marginTop: "-4px",
      color: semanticColors.textPrimary,
      fontFamily: typography.fontFamily.serif,
      fontSize: typography.displaySize.md,
      fontWeight: typography.fontWeight.normal,
      lineHeight: 1.15,
      overflowWrap: "anywhere",
      "@media (max-width: 560px)": {
        fontSize: typography.displaySize.sm,
      },
    },
  },
  generatedBadge: {
    height: layout.spacing[6.5],
    display: "inline-flex",
    alignItems: "center",
    ...shorthands.padding("0", layout.padding.sm),
    ...shorthands.borderRadius(layout.radius.pill),
    backgroundColor: `color-mix(in srgb, ${warm.coralBright} 14%, transparent)`,
    color: warm.coralBright,
    fontSize: typography.fontSize.size0,
    lineHeight: "14px",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  factsRow: {
    display: "flex",
    maxWidth: "100%",
    flexWrap: "wrap",
    gap: layout.gap.lg,
    paddingBottom: layout.spacing[4],
    marginBottom: layout.spacing[5],
    ...shorthands.borderBottom(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
  },
  factCell: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  factLabel: {
    color: warm.coralBright,
    fontSize: typography.fontSize.size0,
    lineHeight: "13px",
    fontWeight: 800,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  },
  factValue: {
    color: semanticColors.textPrimary,
    fontSize: typography.fontSize.size4,
    lineHeight: "18px",
    fontWeight: 700,
  },
  emptyState: {
    width: "min(560px, 100%)",
    marginTop: "112px",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    ...shorthands.padding(layout.padding.xl),
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
    ...shorthands.borderRadius(layout.radius.xl),
    backgroundColor: semanticColors.bgPrimary,
    boxShadow: warmShadows.md,
  },
  emptyTitle: {
    color: semanticColors.textPrimary,
    fontSize: typography.fontSize.size9,
    lineHeight: "28px",
    fontWeight: 900,
    marginBottom: layout.spacing[2],
  },
  emptyMessage: {
    color: semanticColors.textSecondary,
    fontSize: typography.fontSize.size4,
    lineHeight: "22px",
    fontWeight: typography.fontWeight.medium,
  },
  headerActions: {
    display: "flex",
    gap: layout.spacing[2.5],
    flexWrap: "wrap",
  },
  button: {
    height: layout.controlSize.xs,
    minWidth: "76px",
    ...shorthands.borderRadius(layout.radius.pill),
    textTransform: "none",
    fontSize: typography.fontSize.size1,
    fontWeight: 850,
    boxShadow: "none",
    transitionProperty: "transform, box-shadow, background",
    transitionDuration: layout.duration.normal,
    ...shorthands.padding("0", "14px"),
    ":hover": {
      transform: "translateY(-1px)",
    },
    "& .MuiButton-startIcon": {
      marginRight: layout.spacing[1.5],
      marginLeft: 0,
    },
    "& .MuiButton-startIcon > svg": {
      fontSize: typography.fontSize.size4,
    },
  },
  ghostButton: {
    color: warm.textSecondary,
    backgroundColor: semanticColors.bgSecondary,
    ...shorthands.border(layout.borderWidth.hairline, "solid", warm.border),
    boxShadow: warmShadows.xs,
    ":hover": {
      color: warm.textPrimary,
      backgroundColor: semanticColors.bgPrimary,
      boxShadow: warmShadows.sm,
    },
  },
  primaryButton: {
    minWidth: "88px",
    color: semanticColors.textOnAccent,
    background: warmGradients.primary,
    boxShadow: semanticColors.shadowInteractive,
    ":hover": {
      background: warmGradients.primaryHover,
      boxShadow: semanticColors.shadowInteractiveHover,
    },
  },
  dayActionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: layout.gap.sm,
    flexWrap: "wrap",
    marginTop: layout.spacing[1.5],
    marginBottom: layout.spacing[8],
  },
  dayTabs: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "safe center",
    gap: "0",
    overflowX: "auto",
    minWidth: 0,
    paddingBottom: layout.spacing[1],
  },
  dayTabItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
    marginLeft: "-1px",
    ":first-of-type": {
      marginLeft: "0",
    },
  },
  dayTabPlaneSlot: {
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: typography.fontSize.size7,
    lineHeight: "1",
    pointerEvents: "none",
  },
  dayTabPlaneHidden: {
    visibility: "hidden",
  },
  dayActionButton: {
    width: layout.controlSize["2xl"],
    height: layout.controlSize["2xl"],
    ...shorthands.borderRadius(layout.radius.pill),
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      colors.transparent,
    ),
    background: warmGradients.primary,
    color: semanticColors.textOnAccent,
    boxShadow: warmShadows.xs,
    transitionProperty: "transform, box-shadow, background, opacity",
    transitionDuration: layout.duration.normal,
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: warmShadows.sm,
    },
    ":disabled": {
      opacity: 0.4,
      transform: "none",
    },
  },
  dayTab: {
    width: "112px",
    height: "62px",
    flexShrink: 0,
    ...shorthands.borderRadius(layout.radius.sm),
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderDefault,
    ),
    backgroundColor: semanticColors.bgTertiary,
    color: semanticColors.textSecondary,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: typography.fontSize.size3,
    lineHeight: "18px",
    boxShadow: warmShadows.xs,
    transitionProperty: "transform, box-shadow, background, color",
    transitionDuration: layout.duration.normal,
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: warmShadows.sm,
    },
  },
  dayTabActive: {
    background: warmGradients.primary,
    color: `${semanticColors.textOnAccent} !important`,
    ...shorthands.borderColor(colors.transparent),
    boxShadow: semanticColors.shadowInteractive,
  },
  dayDate: {
    fontSize: typography.fontSize.size0,
    lineHeight: "14px",
    fontWeight: 800,
    color: "inherit",
  },
  sectionBar: {
    minHeight: "72px",
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
    ...shorthands.borderRadius(layout.radius.xl),
    backgroundColor: semanticColors.bgSecondary,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: layout.gap.md,
    ...shorthands.padding(
      layout.spacing[3.5],
      layout.spacing[4.5],
      layout.spacing[3.5],
      "22px",
    ),
    marginBottom: layout.spacing[5.5],
    boxShadow: warmShadows.xs,
    "@media (max-width: 680px)": {
      alignItems: "flex-start",
      flexDirection: "column",
    },
  },
  sectionTitle: {
    color: semanticColors.textPrimary,
    fontSize: typography.fontSize.size8,
    lineHeight: "24px",
    fontWeight: 900,
    overflowWrap: "anywhere",
  },
  sectionActions: {
    display: "flex",
    gap: layout.spacing[2.5],
    flexWrap: "wrap",
  },
  compactButton: {
    height: layout.controlSize.md,
    ...shorthands.borderRadius(layout.radius.pill),
    textTransform: "none",
    fontSize: typography.fontSize.size2,
    fontWeight: 850,
    boxShadow: "none",
    ...shorthands.padding("0", layout.padding.md),
  },
  outlineBlueButton: {
    color: warm.coralBright,
    backgroundColor: semanticColors.bgPrimary,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderAccentStrong,
    ),
    ":hover": {
      backgroundColor: semanticColors.bgInteractiveSubtle,
      boxShadow: warmShadows.sm,
    },
  },
  regenerateIcon: { color: warm.coralBright },
  timeline: {
    position: "relative",
    paddingLeft: "58px",
    "@media (max-width: 560px)": {
      paddingLeft: "42px",
    },
  },
  // Dims the timeline in place (rather than swapping in a full-page loader)
  // while a day/trip regenerate or an add-activity call is in flight, so the
  // user keeps their scroll position and can see what's about to change.
  timelineOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: layout.gap.sm,
    backgroundColor: `color-mix(in srgb, ${semanticColors.bgPrimary} 85%, transparent)`,
    borderRadius: layout.radius.lg,
    zIndex: 3,
  },
  timelineOverlaySpinner: { color: semanticColors.interactive },
  timelineOverlayText: {
    fontSize: typography.fontSize.size4,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textSecondary,
  },
  connector: {
    position: "absolute",
    left: "4px",
    top: "0",
    height: "100%",
    width: "34px",
    color: warm.coralBright,
    opacity: 0.9,
  },
  connectorSvg: {
    display: "block",
    overflow: "visible",
  },
  // A sticky marker that rides the connector line as the page scrolls: it
  // holds a fixed viewport position (just under the fixed nav) for as long
  // as this day's timeline is on screen, then scrolls away with it.
  timelinePlaneTrack: {
    position: "sticky",
    top: "110px",
    marginLeft: "-58px",
    height: "0",
    zIndex: 2,
    pointerEvents: "none",
    "@media (max-width: 560px)": {
      marginLeft: "-42px",
    },
  },
  timelinePlaneIcon: {
    position: "absolute",
    left: layout.spacing[6],
    top: "0",
    transform: "translate(-50%, -50%) rotate(135deg)",
    fontSize: typography.fontSize.size9,
    color: warm.coralBright,
    filter: `drop-shadow(0 2px 4px color-mix(in srgb, ${warm.coralBright} 30%, transparent))`,
    willChange: "left, transform",
    "@media (max-width: 560px)": {
      left: layout.spacing[4.5],
    },
  },
  activityRow: {
    position: "relative",
    marginBottom: layout.spacing[6],
  },
  marker: {
    position: "absolute",
    left: "-58px",
    top: "5px",
    width: layout.controlSize.xl,
    height: layout.controlSize.xl,
    ...shorthands.borderRadius(layout.radius.lg),
    backgroundColor: semanticColors.bgSecondary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: warmShadows.xs,
    "@media (max-width: 560px)": {
      left: "-42px",
      width: layout.controlSize.xs,
      height: layout.controlSize.xs,
      ...shorthands.borderRadius("13px"),
    },
  },
  markerIcon: {
    fontSize: typography.fontSize.size9,
    "@media (max-width: 560px)": {
      fontSize: typography.fontSize.size7,
    },
  },
  // The category marker/chip colors below are deliberately the one place
  // that keeps distinct hues instead of the shared accent — see the file
  // banner comment. Borders are a single neutral tone throughout; only the
  // icon/text color differs per category.
  markerGreen: {
    color: colors.success,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
  },
  markerPurple: {
    color: warm.rose,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
  },
  markerBlue: {
    color: warm.coral,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
  },
  markerCyan: {
    color: warm.coralBright,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
  },
  markerOrange: {
    color: colors.warning,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
  },
  markerRed: {
    color: semanticColors.textError,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
  },
  activityCard: {
    minHeight: "142px",
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
    ...shorthands.borderRadius("26px"),
    backgroundColor: semanticColors.bgPrimary,
    boxShadow: warmShadows.sm,
    display: "flex",
    justifyContent: "space-between",
    gap: layout.spacing[5],
    ...shorthands.padding(
      layout.spacing[5.5],
      layout.spacing[5.5],
      layout.spacing[5],
      layout.padding.lg,
    ),
    transitionProperty: "transform, box-shadow",
    transitionDuration: layout.duration.normal,
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: warmShadows.md,
    },
    "@media (max-width: 620px)": {
      flexDirection: "column",
      ...shorthands.padding("18px"),
    },
  },
  // While an activity is being regenerated the card keeps its size, so the
  // timeline doesn't jump, and hosts the spinner overlay below.
  activityCardRegenerating: {
    position: "relative",
    ":hover": {
      transform: "none",
      boxShadow: warmShadows.sm,
    },
  },
  // The old activity is about to be replaced wholesale, so it is faded right
  // back rather than left looking like current content.
  activityContentPending: {
    opacity: 0.25,
    filter: "blur(1px)",
    userSelect: "none",
  },
  regeneratingOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.borderRadius("26px"),
    backgroundColor: `color-mix(in srgb, ${semanticColors.bgPrimary} 62%, transparent)`,
    zIndex: 1,
    // Purely a visual scrim — the action buttons underneath stay hoverable so
    // their tooltips still explain why they aren't doing anything.
    pointerEvents: "none",
  },
  // Spinner and label share one raised pill, so they read as a single status
  // badge instead of floating loose over the faded activity text.
  regeneratingBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: layout.spacing[2.5],
    ...shorthands.padding(layout.spacing[2.5], layout.spacing[4]),
    ...shorthands.borderRadius(layout.radius.pill),
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderDefault,
    ),
    backgroundColor: semanticColors.bgPrimary,
    boxShadow: warmShadows.md,
  },
  regeneratingSpinner: {
    color: warm.coralBright,
    flexShrink: 0,
  },
  regeneratingLabel: {
    "&.MuiTypography-root": {
      margin: 0,
      color: semanticColors.textPrimary,
      fontSize: typography.fontSize.size3,
      lineHeight: 1,
      fontWeight: typography.fontWeight.semibold,
      whiteSpace: "nowrap",
    },
  },
  activityContent: {
    minWidth: 0,
  },
  activityMeta: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    flexWrap: "wrap",
    marginBottom: layout.spacing[3],
  },
  category: {
    height: layout.spacing[5.5],
    display: "inline-flex",
    alignItems: "center",
    ...shorthands.padding("0", "10px"),
    ...shorthands.borderRadius(layout.radius.pill),
    backgroundColor: `color-mix(in srgb, ${warm.coralBright} 14%, transparent)`,
    color: warm.coralBright,
    fontSize: typography.fontSize.size0,
    lineHeight: "14px",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  categoryBlue: {
    backgroundColor: `color-mix(in srgb, ${semanticColors.categoryBlue} 16%, transparent)`,
    color: semanticColors.categoryBlue,
  },
  categoryPurple: {
    backgroundColor: `color-mix(in srgb, ${semanticColors.categoryPurple} 16%, transparent)`,
    color: semanticColors.categoryPurple,
  },
  categoryCyan: {
    backgroundColor: `color-mix(in srgb, ${semanticColors.categoryBlue} 16%, transparent)`,
    color: semanticColors.categoryBlue,
  },
  categoryGreen: {
    backgroundColor: `color-mix(in srgb, ${semanticColors.categoryGreen} 16%, transparent)`,
    color: semanticColors.categoryGreen,
  },
  categoryAmber: {
    backgroundColor: `color-mix(in srgb, ${semanticColors.categoryOrange} 16%, transparent)`,
    color: semanticColors.categoryOrange,
  },
  categoryOrange: {
    backgroundColor: `color-mix(in srgb, ${semanticColors.categoryOrange} 20%, transparent)`,
    color: semanticColors.categoryOrange,
  },
  categoryRed: {
    backgroundColor: `color-mix(in srgb, ${semanticColors.categoryRed} 16%, transparent)`,
    color: semanticColors.categoryRed,
  },
  activityTime: {
    "&.MuiTypography-root": {
      color: semanticColors.textTertiary,
      fontSize: typography.fontSize.size2,
      lineHeight: "17px",
      fontWeight: 750,
    },
  },
  activityTitle: {
    "&.MuiTypography-root": {
      margin: 0,
      color: semanticColors.textPrimary,
      fontSize: typography.fontSize.size9,
      lineHeight: "27px",
      fontWeight: typography.fontWeight.semibold,
      marginBottom: layout.spacing[3],
      overflowWrap: "anywhere",
    },
  },
  activityDescription: {
    "&.MuiTypography-root": {
      margin: 0,
      color: semanticColors.textSecondary,
      fontSize: typography.fontSize.size4,
      lineHeight: "22px",
      fontWeight: typography.fontWeight.normal,
      marginBottom: layout.spacing[3],
    },
  },
  detailLine: {
    display: "flex",
    alignItems: "center",
    gap: layout.gap.lg,
    rowGap: layout.spacing[2.5],
    flexWrap: "wrap",
    color: semanticColors.textTertiary,
    fontSize: typography.fontSize.size2,
    lineHeight: "17px",
  },
  detailItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: layout.spacing[1.5],
    minWidth: 0,
  },
  detailIcon: { color: warm.coralBright, fontSize: typography.fontSize.size5 },
  trainIcon: { color: warm.coralBright, fontSize: typography.fontSize.size5 },
  mutedIcon: {
    color: semanticColors.textDisabled,
    fontSize: typography.fontSize.size5,
  },
  costIcon: { color: warm.coralBright, fontSize: typography.fontSize.size5 },
  weatherIcon: {
    color: semanticColors.textTertiary,
    fontSize: typography.fontSize.size5,
  },
  cardActions: {
    display: "flex",
    gap: layout.gap.xs,
    flexShrink: 0,
    "@media (max-width: 620px)": {
      alignSelf: "flex-end",
    },
  },
  iconButton: {
    width: layout.controlSize.xs,
    height: layout.controlSize.xs,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderDefault,
    ),
    ...shorthands.borderRadius(layout.radius.md),
    backgroundColor: semanticColors.bgPrimary,
    boxShadow: warmShadows.xs,
    ":hover": {
      backgroundColor: semanticColors.bgInteractiveSubtle,
    },
  },
  editIcon: { color: warm.coralBright, fontSize: typography.fontSize.size7 },
  deleteIcon: {
    color: semanticColors.textDisabled,
    fontSize: typography.fontSize.size7,
  },
});

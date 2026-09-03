import { makeStyles, shorthands } from "@griffel/react";
import {
  colors,
  gradients,
  semanticColors,
  warm,
} from "../../../common/theme/colors";
import {
  layout,
  typography,
  typographyPresets,
} from "../../../common/theme/typography";

export const useSavedTripsStyles = makeStyles({
  page: {
    fontFamily: typography.fontFamily.sans,
    backgroundColor: warm.bgPage,
    backgroundImage: warm.bgImage,
    backgroundSize: "cover",
    backgroundPosition: "top center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    minHeight: "100dvh",
    // The nav is fixed and overlays the page, so clear its height plus
    // its inset here rather than in a separate wrapper, so the wallpaper
    // above covers the cleared area too instead of a seam showing above
    // the page (see appLayout.tsx / itinerary.styles.ts for the same fix).
    paddingTop: `${layout.navHeight + 66}px`,
    "@media (max-width: 760px)": {
      paddingTop: `${layout.navHeight + 52}px`,
    },
  },

  content: {
    width: "100%",
    boxSizing: "border-box",
    maxWidth: "1240px",
    marginLeft: "auto",
    marginRight: "auto",
    padding: `${layout.padding.lg} ${layout.padding.xl} ${layout.padding["2xl"]}`,
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.lg,

    "@media (max-width: 720px)": {
      padding: `${layout.padding.md} ${layout.padding.md} ${layout.padding.xl}`,
    },
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: layout.gap.md,
    flexWrap: "wrap",
    minWidth: 0,
  },

  title: {
    margin: 0,
    ...typographyPresets.h2,
    color: semanticColors.textPrimary,
  },

  subtitle: {
    margin: `${layout.gap.xs} 0 0`,
    fontSize: typography.fontSize.size4,
    color: semanticColors.textSecondary,
  },

  countBadge: {
    color: semanticColors.textSecondary,
    backgroundColor: semanticColors.bgPrimary,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderDefault,
    ),
    ...shorthands.borderRadius(layout.radius.md),
    ...shorthands.padding(layout.spacing[2.5], "14px"),
    fontSize: typography.fontSize.size3,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    whiteSpace: "nowrap",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
    gap: layout.gap.md,
  },

  card: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    ...shorthands.padding("0"),
    ...shorthands.margin("0"),
    backgroundColor: semanticColors.bgPrimary,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderDefault,
    ),
    ...shorthands.borderRadius(layout.radius.xl),
    overflow: "hidden",
    boxShadow: semanticColors.shadowLight,
    fontFamily: typography.fontFamily.sans,

    ":hover": {
      ...shorthands.borderColor(semanticColors.borderAccent),
      transform: "translateY(-3px)",
      boxShadow: semanticColors.shadowMedium,
    },

    ":focus-visible": {
      outlineColor: semanticColors.interactive,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },
  },

  banner: {
    height: "108px",
    position: "relative",
    backgroundImage: gradients.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  bannerIcon: {
    color: colors.whiteTranslucent,
    fontSize: "40px",
    opacity: 0.9,
  },

  deleteButton: {
    position: "absolute",
    top: layout.spacing[3],
    left: layout.spacing[3],
    width: "34px",
    height: "34px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.padding("0"),
    ...shorthands.border("0"),
    ...shorthands.borderRadius(layout.radius.full),
    backgroundColor: warm.gold,
    // Fixed dark plum rather than a themed text token: warm.gold is the same
    // flat hex in both light and dark mode, and semanticColors.textPrimary
    // flips to a light cream in dark mode — which would be unreadable on
    // this light gold fill. This matches what light mode's own text color
    // already is, so it reads correctly regardless of app theme.
    color: "#432d32",
    cursor: "pointer",
    boxShadow: `0 8px 18px color-mix(in srgb, ${warm.gold} 45%, transparent)`,
    transitionProperty: "background-color, transform, box-shadow",
    transitionDuration: layout.duration.normal,

    ":hover": {
      backgroundColor: `color-mix(in srgb, ${warm.gold} 82%, black)`,
      transform: "translateY(-1px)",
      boxShadow: `0 10px 22px color-mix(in srgb, ${warm.gold} 55%, transparent)`,
    },

    ":focus-visible": {
      outlineColor: "#432d32",
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },

    ":disabled": {
      cursor: "progress",
      opacity: 0.7,
      transform: "none",
    },
  },

  deleteIcon: {
    fontSize: "20px",
  },

  statusPill: {
    position: "absolute",
    top: layout.spacing[3],
    right: layout.spacing[3],
    fontSize: typography.fontSize.size1,
    lineHeight: typography.lineHeight.normal,
    fontWeight: typography.fontWeight.bold,
    ...shorthands.padding(layout.spacing[1], "10px"),
    ...shorthands.borderRadius(layout.radius.full),
    backgroundColor: colors.whiteTranslucent,
    color: semanticColors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: typography.letterSpacing.wide,
  },

  statusUpcoming: {
    color: semanticColors.interactive,
  },

  statusOngoing: {
    color: colors.success,
  },

  statusCompleted: {
    color: semanticColors.textTertiary,
  },

  cardBody: {
    padding: "16px 18px 18px",
    display: "flex",
    flexDirection: "column",
    rowGap: layout.spacing[2.5],
    flex: 1,
  },

  destination: {
    margin: 0,
    ...typographyPresets.h3,
    color: semanticColors.textPrimary,
    overflowWrap: "anywhere",
  },

  dateRange: {
    margin: 0,
    fontSize: typography.fontSize.size3,
    color: semanticColors.textTertiary,
  },

  metaRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: layout.gap.md,
    marginTop: layout.spacing[1],
  },

  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: layout.spacing[1.5],
    fontSize: typography.fontSize.size3,
    color: semanticColors.textSecondary,
  },

  metaIcon: {
    fontSize: typography.fontSize.size6,
    color: semanticColors.interactive,
    display: "flex",
  },

  cardFooter: {
    marginTop: "auto",
    paddingTop: layout.spacing[3],
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: semanticColors.interactive,
    fontSize: typography.fontSize.size3,
    fontWeight: typography.fontWeight.semibold,
    gap: layout.gap.sm,
    minWidth: 0,
    textDecoration: "none",
    cursor: "pointer",
    ":hover": {
      textDecoration: "underline",
      gap: layout.gap.md,
    },

    ":focus-visible": {
      outlineColor: semanticColors.interactive,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
      borderRadius: layout.radius.sm,
    },
  },

  cardFooterArrow: {
    display: "flex",
    alignItems: "center",
    transitionProperty: "transform",
    transitionDuration: layout.duration.normal,
  },

  emptyState: {
    textAlign: "center",
    ...shorthands.padding(layout.spacing[16], "40px"),
    backgroundColor: semanticColors.bgPrimary,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      semanticColors.borderDefault,
    ),
    ...shorthands.borderRadius(layout.radius.xl),
    "@media (max-width: 520px)": {
      ...shorthands.padding(layout.spacing[10], layout.padding.md),
    },
  },

  emptyIcon: {
    fontSize: typography.displaySize.xl,
    marginBottom: layout.spacing[4],
  },

  emptyTitle: {
    fontSize: typography.fontSize.size8,
    fontWeight: typography.fontWeight.bold,
    color: semanticColors.textPrimary,
    marginBottom: layout.spacing[2],
  },

  emptySubtitle: {
    fontSize: typography.fontSize.size4,
    color: semanticColors.textTertiary,
    marginBottom: layout.spacing[6],
  },

  emptyCta: {
    ...shorthands.padding(layout.spacing[3], layout.spacing[6]),
    ...shorthands.borderRadius(layout.radius.md),
    ...shorthands.border(layout.borderWidth.thin, "solid", colors.transparent),
    backgroundImage: gradients.primary,
    color: semanticColors.bgPrimary,
    fontSize: typography.fontSize.size4,
    fontWeight: typography.fontWeight.semibold,
    cursor: "pointer",
    fontFamily: typography.fontFamily.sans,
  },
});

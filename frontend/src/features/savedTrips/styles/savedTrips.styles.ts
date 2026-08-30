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
    minHeight: "100dvh",
  },

  content: {
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
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
    backgroundColor: "#ef233c",
    color: colors.white,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(129, 23, 35, 0.24)",
    transitionProperty: "background-color, transform, box-shadow",
    transitionDuration: layout.duration.normal,

    ":hover": {
      backgroundColor: "#d90429",
      transform: "translateY(-1px)",
      boxShadow: "0 10px 22px rgba(129, 23, 35, 0.28)",
    },

    ":focus-visible": {
      outlineColor: colors.white,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
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
    opacity: 0.55,
    cursor: "not-allowed",
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

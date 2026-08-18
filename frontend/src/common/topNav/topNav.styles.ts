import { makeStyles, shorthands } from "@griffel/react";
import {
  gradients,
  semanticColors,
  warm,
  warmGradients,
  warmShadows,
} from "../theme/colors";
import { layout, typography, typographyPresets } from "../theme/typography";

export const useTopNavStyles = makeStyles({
  wrapper: {
    position: "fixed",
    top: layout.spacing[6],
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    padding: `0 ${layout.padding.xl}`,
    pointerEvents: "none",
    backgroundColor: "transparent",

    "@media (max-width: 760px)": {
      top: layout.spacing[3],
      padding: `0 ${layout.padding.sm}`,
    },
  },

  nav: {
    width: "100%",
    maxWidth: "1180px",
    minHeight: "74px",
    padding: `${layout.padding.sm} ${layout.padding.lg}`,
    display: "grid",
    gridTemplateColumns: "auto minmax(0, 1fr) auto",
    alignItems: "center",
    columnGap: layout.gap.lg,
    backgroundColor: warm.bgSurface,
    borderRadius: "22px",
    boxShadow: warmShadows.nav,
    ...shorthands.border(layout.borderWidth.hairline, "solid", warm.border),
    pointerEvents: "auto",
    gridAutoFlow: "column",

    "@media (max-width: 980px)": {
      columnGap: layout.gap.sm,
      padding: `${layout.padding.xs} ${layout.padding.md}`,
    },

    "@media (max-width: 760px)": {
      minHeight: "auto",
      gridTemplateColumns: "1fr auto",
      rowGap: layout.gap.xs,
      borderRadius: layout.radius.lg,
    },
  },

  homeButtonLayout: {
    alignSelf: "center",
    "&.MuiButton-root": {
      minWidth: layout.controlSize.xl,
      width: layout.controlSize.xl,
      height: layout.controlSize.xl,
      padding: 0,
    },
    "& svg": {
      fontSize: typography.fontSize.size9,
    },
  },

  userButtonWrapper: {
    display: "flex",
    alignItems: "center",
    marginLeft: layout.gap.sm,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
    minWidth: "max-content",
    padding: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    ...shorthands.border("0"),

    ":focus-visible": {
      outlineColor: warm.coralBright,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "5px",
      borderRadius: layout.radius.md,
    },
  },

  logoFrame: {
    width: layout.controlSize.xl,
    height: layout.controlSize.xl,
    borderRadius: layout.radius.lg,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: warm.bgTint,
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },

  brandName: {
    ...typographyPresets.brand,
    color: warm.textPrimary,
    fontSize: typography.fontSize.size9,
    lineHeight: 1,
  },

  navLinks: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 0,
    columnGap: layout.gap.sm,

    "@media (max-width: 980px)": {
      columnGap: layout.spacing[1],
    },

    "@media (max-width: 760px)": {
      gridColumnStart: 1,
      gridColumnEnd: 3,
      justifyContent: "flex-start",
      overflowX: "auto",
      paddingBottom: layout.spacing[1],
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
  },

  navItem: {
    "&.MuiButton-root": {
      position: "relative",
      minWidth: "auto",
      minHeight: "44px",
      padding: `${layout.padding.xs} ${layout.padding.sm}`,
      borderRadius: layout.radius.full,
      color: warm.textPrimary,
      fontSize: typography.fontSize.size4,
      fontWeight: typography.fontWeight.semibold,
      lineHeight: 1.2,
      textTransform: "none",
      whiteSpace: "nowrap",
      transitionProperty: "color, background-color, transform",
      transitionDuration: layout.duration.fast,
      transitionTimingFunction: "ease",
    },
    "&.MuiButton-root:hover": {
      color: warm.rose,
      backgroundColor: warm.bgTint,
      transform: "translateY(-1px)",
    },
    "&.MuiButton-root:focus-visible": {
      outlineColor: warm.coralBright,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },
    "&.MuiButton-root .MuiButton-startIcon": {
      marginLeft: 0,
      marginRight: layout.spacing[2],
      color: warm.textSecondary,
      transitionProperty: "color",
      transitionDuration: layout.duration.fast,
      transitionTimingFunction: "ease",
    },
    "&.MuiButton-root .MuiButton-startIcon > svg": {
      fontSize: typography.fontSize.size8,
    },
    "&.MuiButton-root:hover .MuiButton-startIcon": {
      color: warm.rose,
    },
    "&.MuiButton-root::after": {
      content: "''",
      position: "absolute",
      left: layout.spacing[3.5],
      right: layout.spacing[3.5],
      bottom: "-15px",
      height: "2px",
      borderRadius: layout.radius.full,
      // NOTE: old-theme gradient (coral/rose) on an otherwise warm-palette nav.
      // Left as-is deliberately — switching to warmGradients.primary is a visual change.
      backgroundImage: gradients.primary,
      opacity: 0,
      transform: "scaleX(0.7)",
      transitionProperty: "opacity, transform",
      transitionDuration: layout.duration.fast,
      transitionTimingFunction: "ease",
    },

    "@media (max-width: 980px)": {
      "&.MuiButton-root": {
        padding: `${layout.padding.xs} ${layout.padding.xs}`,
        fontSize: typography.fontSize.size3,
      },
    },
  },

  navItemActive: {
    "&.MuiButton-root": {
      color: warm.rose,
      backgroundColor: "transparent",
    },
    "&.MuiButton-root .MuiButton-startIcon": {
      color: warm.coralBright,
    },
    "&.MuiButton-root::after": {
      opacity: 1,
      transform: "scaleX(1)",
    },
  },

  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    columnGap: layout.gap.xs,
    minWidth: "max-content",
  },

  loginButton: {
    "&.MuiButton-root": {
      color: warm.textPrimary,
      backgroundColor: warm.bgSurface,
      ...shorthands.border(layout.borderWidth.hairline, "solid", warm.border),
      boxShadow: "none",
    },
    "&.MuiButton-root:hover": {
      color: warm.rose,
      backgroundColor: warm.bgTint,
      ...shorthands.borderColor(warm.border),
      boxShadow: warmShadows.navRaised,
    },
  },

  getStartedButton: {
    "&.MuiButton-root": {
      backgroundImage: warmGradients.primary,
      color: semanticColors.bgPrimary,
      boxShadow: warmShadows.rose,
      paddingLeft: layout.padding.lg,
      paddingRight: layout.padding.lg,
    },
    "&.MuiButton-root:hover": {
      // Same gradient as default — only the shadow lifts on hover.
      backgroundImage: warmGradients.primary,
      boxShadow: warmShadows.roseHover,
    },
  },
});

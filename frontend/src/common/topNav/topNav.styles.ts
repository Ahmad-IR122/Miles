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
    transition: `transform ${layout.duration.normal} cubic-bezier(0.4, 0, 0.2, 1)`,

    "&.scrolling-down": {
      transform: "translateY(-120px)",
    },

    "&:hover": {
      transform: "translateY(0)",
    },

    "@media (max-width: 760px)": {
      top: layout.spacing[3],
      padding: `0 ${layout.padding.sm}`,
    },
  },

  authWrapper: {
    position: "absolute",
    top: layout.spacing[6],
    padding: `0 ${layout.padding.xl}`,

    "&:hover": {
      transform: "none",
    },

    "@media (max-width: 760px)": {
      top: layout.spacing[4],
      padding: `0 ${layout.padding.md}`,
    },
  },

  headerInner: {
    position: "relative",
    width: "100%",
    maxWidth: "1180px",
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.xl,
    pointerEvents: "none",

    "@media (max-width: 980px)": {
      columnGap: layout.gap.md,
    },
  },

  // Pill-shaped nav container
  nav: {
    width: "auto",
    minWidth: 0,
    flex: 1,
    minHeight: "60px",
    padding: `${layout.padding.sm} ${layout.padding.lg}`,
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.lg,
    backgroundColor: warm.bgSurface,
    borderRadius: layout.radius.pill, // Full pill shape (999px)
    boxShadow: warmShadows.nav,
    ...shorthands.border(layout.borderWidth.hairline, "solid", warm.border),
    pointerEvents: "auto",

    "@media (max-width: 980px)": {
      columnGap: layout.gap.sm,
      padding: `${layout.padding.xs} ${layout.padding.md}`,
      minHeight: "56px",
    },

    "@media (max-width: 760px)": {
      minHeight: "auto",
      flexWrap: "wrap",
      borderRadius: layout.radius.lg,
    },
  },

  authNav: {
    width: "100%",
    minHeight: "48px",
    padding: 0,
    columnGap: layout.gap.md,
    backgroundColor: "transparent",
    borderRadius: 0,
    boxShadow: "none",
    ...shorthands.border("0"),

    "@media (max-width: 980px)": {
      minHeight: "48px",
      padding: 0,
    },

    "@media (max-width: 760px)": {
      minHeight: "48px",
      flexWrap: "nowrap",
      borderRadius: 0,
    },
  },

  signedInNav: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    width: "fit-content",
    flex: "0 1 auto",
    minHeight: "48px",
    marginLeft: "auto",
    padding: `${layout.spacing[1]} ${layout.padding.sm}`,
    columnGap: layout.gap.md,

    "@media (max-width: 980px)": {
      position: "static",
      transform: "none",
      minHeight: "48px",
      padding: `${layout.spacing[1]} ${layout.padding.sm}`,
      columnGap: layout.gap.sm,
    },

    "@media (max-width: 760px)": {
      width: "auto",
      flex: 1,
      minHeight: "auto",
      padding: `${layout.spacing[1]} ${layout.padding.xs}`,
      columnGap: layout.gap.xs,
    },
  },

  // Logo section - left side
  brandSection: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
    minWidth: "max-content",
    flexShrink: 0,
    pointerEvents: "auto",
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

  standaloneLogoFrame: {
    width: "48px",
    height: "48px",
    borderRadius: layout.radius.md,
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

  standaloneBrandName: {
    ...typographyPresets.brand,
    color: warm.textPrimary,
    fontSize: typography.fontSize.size9,
    lineHeight: 1,
    display: "block",
  },

  // Nav items in center - flex auto
  navLinks: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 0,
    flex: 1,
    columnGap: layout.spacing[1.5],

    "@media (max-width: 980px)": {
      columnGap: layout.spacing[1],
    },

    "@media (max-width: 760px)": {
      order: 3,
      width: "100%",
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
      minHeight: "40px",
      padding: `${layout.spacing[1.5]} ${layout.padding.xs}`,
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
      bottom: "-7px",
      height: "2px",
      borderRadius: layout.radius.full,
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

  // Right side - profile & actions with separator
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    columnGap: layout.gap.md,
    minWidth: "max-content",
    flexShrink: 0,
  },

  signedOutSpacer: {
    flex: 1,
  },

  divider: {
    width: "1px",
    height: "32px",
    backgroundColor: warm.border,
    opacity: 0.5,
  },

  profileSection: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
    minWidth: "max-content",
  },

  userButtonWrapper: {
    display: "flex",
    alignItems: "center",
  },

  userEmail: {
    fontSize: typography.fontSize.size3,
    color: warm.textSecondary,
    fontWeight: typography.fontWeight.normal,

    "@media (max-width: 980px)": {
      display: "none",
    },
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
      backgroundImage: warmGradients.primary,
      boxShadow: warmShadows.roseHover,
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
});

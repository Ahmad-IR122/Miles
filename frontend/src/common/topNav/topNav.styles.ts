import { makeStyles, shorthands } from "@griffel/react";
import { gradients, semanticColors } from "../theme/colors";
import { layout, typographyPresets } from "../theme/typography";

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
    backgroundColor: "#FFFCF9",
    borderRadius: "22px",
    boxShadow: "0 18px 42px rgba(47, 33, 27, 0.09)",
    ...shorthands.border("1px", "solid", "#F3DED4"),
    pointerEvents: "auto",

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
      minWidth: "42px",
      width: "42px",
      height: "42px",
      padding: 0,
    },
    "& svg": {
      fontSize: "20px",
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
      outlineColor: "#FF6B6B",
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "5px",
      borderRadius: layout.radius.md,
    },
  },

  logoFrame: {
    width: "42px",
    height: "42px",
    borderRadius: layout.radius.lg,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "#FFF1EB",
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },

  brandName: {
    ...typographyPresets.brand,
    color: "#2F211B",
    fontSize: "20px",
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
      color: "#2F211B",
      fontSize: "14px",
      fontWeight: 600,
      lineHeight: 1.2,
      textTransform: "none",
      whiteSpace: "nowrap",
      transitionProperty: "color, background-color, transform",
      transitionDuration: "0.16s",
      transitionTimingFunction: "ease",
    },
    "&.MuiButton-root:hover": {
      color: "#F43F7A",
      backgroundColor: "#FFF1EB",
      transform: "translateY(-1px)",
    },
    "&.MuiButton-root:focus-visible": {
      outlineColor: "#FF6B6B",
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "2px",
    },
    "&.MuiButton-root .MuiButton-startIcon": {
      marginLeft: 0,
      marginRight: layout.spacing[2],
      color: "#7F7068",
      transitionProperty: "color",
      transitionDuration: "0.16s",
      transitionTimingFunction: "ease",
    },
    "&.MuiButton-root .MuiButton-startIcon > svg": {
      fontSize: "18px",
    },
    "&.MuiButton-root:hover .MuiButton-startIcon": {
      color: "#F43F7A",
    },
    "&.MuiButton-root::after": {
      content: "\"\"",
      position: "absolute",
      left: "14px",
      right: "14px",
      bottom: "-15px",
      height: "2px",
      borderRadius: layout.radius.full,
      backgroundImage: gradients.primary,
      opacity: 0,
      transform: "scaleX(0.7)",
      transitionProperty: "opacity, transform",
      transitionDuration: "0.16s",
      transitionTimingFunction: "ease",
    },

    "@media (max-width: 980px)": {
      "&.MuiButton-root": {
        padding: `${layout.padding.xs} ${layout.padding.xs}`,
        fontSize: "13px",
      },
    },
  },

  navItemActive: {
    "&.MuiButton-root": {
      color: "#F43F7A",
      backgroundColor: "transparent",
    },
    "&.MuiButton-root .MuiButton-startIcon": {
      color: "#FF6B6B",
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
      color: "#2F211B",
      backgroundColor: "#FFFCF9",
      ...shorthands.border("1px", "solid", "#F3DED4"),
      boxShadow: "none",
    },
    "&.MuiButton-root:hover": {
      color: "#F43F7A",
      backgroundColor: "#FFF1EB",
      ...shorthands.borderColor("#F3DED4"),
      boxShadow: "0 8px 18px rgba(47, 33, 27, 0.07)",
    },
  },

  getStartedButton: {
    "&.MuiButton-root": {
      backgroundImage: "linear-gradient(135deg, #FF7A66 0%, #F43F7A 100%)",
      color: semanticColors.bgPrimary,
      boxShadow: "0 12px 24px rgba(244, 63, 122, 0.22)",
      paddingLeft: layout.padding.lg,
      paddingRight: layout.padding.lg,
    },
    "&.MuiButton-root:hover": {
      backgroundImage: "linear-gradient(135deg, #FF7A66 0%, #F43F7A 100%)",
      boxShadow: "0 14px 28px rgba(244, 63, 122, 0.28)",
    },
  },
});

import { makeStyles, shorthands } from "@griffel/react";
import { semanticColors } from "../theme/colors";
import { layout, typographyPresets } from "../theme/typography";

export const useTopNavStyles = makeStyles({
  wrapper: {
    position: "fixed",
    top: layout.spacing[5],
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    padding: `0 ${layout.padding.lg}`,
    pointerEvents: "none",
  },

  nav: {
    width: "100%",
    maxWidth: "720px",
    height: `${layout.navHeight}px`,
    padding: `0 ${layout.padding.lg}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
    backgroundColor: semanticColors.bgPrimary,
    borderRadius: layout.radius.full,
    boxShadow: semanticColors.shadowMedium,
    ...shorthands.border("1px", "solid", semanticColors.borderLight),
    pointerEvents: "auto",
  },

  homeButtonLayout: {
    alignSelf: "center",
    marginLeft: "auto",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
    position: "absolute",
    left: layout.padding.lg,
  },

  logoFrame: {
    width: "40px",
    height: "40px",
    borderRadius: layout.radius.md,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  },

  brandName: {
    ...typographyPresets.brand,
    color: semanticColors.textBrand,
  },
});

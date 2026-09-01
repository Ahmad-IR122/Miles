import { makeStyles, shorthands } from "@griffel/react";

import { warm, warmShadows } from "../../common/theme/colors";

import {
  layout,
  typography,
  typographyPresets,
} from "../../common/theme/typography";

export const useHomeStyles = makeStyles({
  page: {
    minHeight: "100dvh",
    position: "relative",

    overflowX: "hidden",

    isolation: "isolate",

    fontFamily: typography.fontFamily.sans,
    backgroundColor: warm.bgPage,
    backgroundImage: warm.bgImage,
    backgroundSize: "cover",
    backgroundPosition: "top center",
    backgroundRepeat: "no-repeat",
  },

  authHeader: {
    position: "absolute",

    top: layout.spacing[6],
    left: "50%",

    transform: "translateX(-50%)",

    zIndex: 10,

    width: "calc(100% - 64px)",
    maxWidth: "1180px",
    boxSizing: "border-box",

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: layout.gap.sm,
    minWidth: 0,

    "@media (max-width: 760px)": {
      top: layout.spacing[4],
      width: "calc(100% - 32px)",
    },
  },

  brand: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
    minWidth: 0,
    maxWidth: "100%",
  },

  logoFrame: {
    width: "48px",
    height: "48px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",
    flexShrink: 0,

    borderRadius: layout.radius.md,

    backgroundColor: warm.bgTint,
  },

  logo: {
    display: "block",

    width: "100%",
    height: "100%",

    objectFit: "contain",
  },

  brandName: {
    ...typographyPresets.brand,

    fontSize: typography.fontSize.size9,

    color: warm.textPrimary,

    "@media (max-width: 380px)": {
      display: "none",
    },
  },

  signInArea: {
    display: "flex",
    alignItems: "center",

    columnGap: layout.gap.md,
    flexShrink: 0,
  },

  signInText: {
    "&.MuiTypography-root": {
      ...typographyPresets.body,

      color: warm.textSecondary,

      "@media (max-width: 620px)": {
        display: "none",
      },
    },
  },

  hero: {
    position: "relative",

    zIndex: 1,

    width: "100%",
    maxWidth: "1180px",
    minHeight: "100dvh",

    margin: "0 auto",

    display: "grid",

    gridTemplateColumns: "minmax(0, 1.05fr) minmax(360px, 0.95fr)",

    alignItems: "center",

    columnGap: layout.gap["2xl"],

    padding: `96px ${layout.padding.xl} ${layout.padding.xl}`,

    boxSizing: "border-box",

    "@media (max-width: 960px)": {
      minHeight: "auto",

      gridTemplateColumns: "1fr",

      rowGap: layout.gap.xl,

      paddingTop: "120px",
    },

    "@media (max-width: 620px)": {
      paddingLeft: layout.padding.md,
      paddingRight: layout.padding.md,
      paddingBottom: layout.padding.xl,
    },

    "@media (max-width: 430px)": {
      rowGap: layout.gap.lg,
      paddingTop: "104px",
      paddingLeft: layout.padding.sm,
      paddingRight: layout.padding.sm,
    },

    /*
     * Helps laptop screens with shorter viewport heights.
     */
    "@media (max-height: 700px) and (min-width: 961px)": {
      paddingTop: "86px",
      paddingBottom: layout.padding.md,
    },
  },

  intro: {
    position: "relative",

    zIndex: 2,

    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",

    maxWidth: "580px",

    transform: "translateY(-8px)",

    "@media (max-width: 960px)": {
      transform: "none",
    },
  },

  eyebrow: {
    "&.MuiTypography-root": {
      margin: `0 0 ${layout.spacing[4]}`,

      color: warm.coralBright,

      fontSize: typography.fontSize.size2,
      fontWeight: typography.fontWeight.bold,

      letterSpacing: "2px",
    },
  },

  title: {
    "&.MuiTypography-root": {
      margin: 0,

      color: warm.textPrimary,

      fontFamily: typography.fontFamily.serif,

      fontSize: typography.fontSizeHero,

      fontWeight: typography.fontWeight.normal,

      lineHeight: 1.12,

      letterSpacing: typography.letterSpacing.tight,

      "@media (max-width: 620px)": {
        fontSize: "clamp(34px, 10vw, 46px)",
      },
    },
  },

  gradientText: {
    display: "inline-block",

    paddingBottom: "0.06em",

    fontStyle: "italic",

    // Flat "highlight headline" hex from the design spec, not a gradient.
    color: warm.gold,
  },

  description: {
    "&.MuiTypography-root": {
      ...typographyPresets.bodyLarge,

      maxWidth: "500px",

      margin: `${layout.spacing[5]} 0 0`,

      color: warm.textSecondary,

      "@media (max-width: 620px)": {
        fontSize: typography.fontSize.size5,
        lineHeight: typography.lineHeight.normal,
      },

      "@media (max-width: 430px)": {
        maxWidth: "100%",
      },
    },
  },

  primaryAction: {
    display: "flex",

    flexDirection: "column",

    alignItems: "flex-start",

    rowGap: layout.gap.sm,

    marginTop: layout.spacing[9],

    "@media (max-width: 430px)": {
      marginTop: layout.spacing[7],
    },
  },

  mainButton: {
    minWidth: "150px",
  },

  signedInAction: {
    marginTop: layout.spacing[9],
  },

  actionHint: {
    "&.MuiTypography-root": {
      ...typographyPresets.caption,

      margin: 0,

      color: warm.textTertiary,
    },
  },

  visual: {
    position: "relative",

    width: "100%",
    maxWidth: "500px",
    boxSizing: "border-box",

    /*
     * Adapts to the viewport instead of forcing 560px.
     * This prevents the bottom of the visual from being cut.
     */
    height: "clamp(410px, 68vh, 540px)",

    justifySelf: "end",
    alignSelf: "center",

    "@media (max-width: 960px)": {
      width: "100%",
      maxWidth: "520px",

      height: "clamp(390px, 60vh, 480px)",

      margin: "0 auto",

      justifySelf: "center",
    },

    "@media (max-width: 620px)": {
      height: "360px",
    },

    "@media (max-width: 430px)": {
      height: "min(330px, 86vw)",
      maxWidth: "min(360px, 100%)",
    },

    "@media (max-height: 700px) and (min-width: 961px)": {
      height: "420px",
    },
  },

  largeGlow: {
    position: "absolute",

    top: "8%",
    right: "-5%",

    width: "82%",
    height: "72%",

    borderRadius: "50%",

    backgroundColor: warm.bgTint,

    opacity: 0.7,

    transform: "rotate(-12deg)",
  },

  smallGlow: {
    position: "absolute",

    bottom: "10%",
    left: "4%",

    width: "30%",

    aspectRatio: "1",

    borderRadius: layout.radius.full,

    backgroundColor: warm.rose,

    opacity: 0.07,
  },

  backCard: {
    position: "absolute",

    top: "9%",
    right: 0,

    width: "76%",
    height: "76%",

    borderRadius: layout.radius["3xl"],

    backgroundColor: warm.bgTint,

    transform: "rotate(4deg)",

    ...shorthands.border(layout.borderWidth.hairline, "solid", warm.border),
  },

  photoCard: {
    position: "absolute",

    top: "5%",
    right: "5%",

    width: "78%",
    height: "78%",
    boxSizing: "border-box",

    overflow: "hidden",

    borderRadius: layout.radius["3xl"],

    backgroundColor: warm.bgSurface,

    boxShadow: warmShadows.lg,

    transform: "rotate(-2deg)",

    ...shorthands.border("9px", "solid", warm.bgSurface),

    "@media (max-width: 620px)": {
      width: "80%",
      right: "2%",
    },
  },

  photo: {
    display: "block",

    width: "100%",
    height: "100%",

    objectFit: "cover",
  },

  postcard: {
    position: "absolute",

    left: "-2%",
    bottom: "9%",

    zIndex: 3,

    width: "225px",
    maxWidth: "100%",
    boxSizing: "border-box",

    padding: layout.padding.lg,

    display: "flex",
    flexDirection: "column",

    borderRadius: layout.radius.xl,

    backgroundColor: warm.bgSurface,

    boxShadow: warmShadows.md,

    transform: "rotate(2deg)",

    ...shorthands.border(layout.borderWidth.hairline, "solid", warm.border),

    "@media (max-width: 620px)": {
      width: "180px",

      padding: layout.padding.md,

      left: "2%",
      bottom: "6%",
    },

    "@media (max-width: 430px)": {
      width: "min(176px, 58vw)",
      padding: layout.padding.sm,
      bottom: "5%",
    },
  },

  postcardLabel: {
    marginBottom: layout.spacing[3],

    color: warm.coralBright,

    fontSize: typography.fontSize.size0,

    fontWeight: typography.fontWeight.bold,

    letterSpacing: "1.5px",
  },

  postcardTitle: {
    color: warm.textPrimary,

    fontFamily: typography.fontFamily.serif,

    fontSize: typography.fontSize.size9,

    lineHeight: typography.lineHeight.tight,

    "@media (max-width: 620px)": {
      fontSize: typography.fontSize.size7,
    },
  },

  postcardLine: {
    width: "100%",

    height: "1px",

    margin: `${layout.spacing[4]} 0`,

    backgroundColor: warm.border,
  },

  postcardBrand: {
    color: warm.textSecondary,

    fontSize: typography.fontSize.size2,

    fontWeight: typography.fontWeight.semibold,
  },
});

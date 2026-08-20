import { makeStyles, shorthands } from "@griffel/react";

import { gradients, semanticColors, warm, warmShadows } from "../theme/colors";
import { layout, typographyPresets } from "../theme/typography";

export const useFooterStyles = makeStyles({
  footer: {
    marginTop: layout.spacing[16],
    padding: `0 clamp(${layout.padding.md}, 4vw, ${layout.padding.xl}) ${layout.padding.xl}`,
    backgroundColor: warm.bgPage,

    "@media (max-width: 760px)": {
      marginTop: layout.spacing[10],
      padding: `0 ${layout.padding.sm} ${layout.padding.lg}`,
    },

    "@media (max-width: 420px)": {
      padding: `0 ${layout.padding.xs} ${layout.padding.md}`,
    },
  },

  shell: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "1180px",
    minHeight: "300px",
    margin: "0 auto",
    padding: `${layout.padding["2xl"]} ${layout.padding["2xl"]} ${layout.padding.lg}`,
    background:
      "linear-gradient(180deg, var(--warm-bg-surface-blur) 0%, var(--footer-shell-end) 100%)",
    borderRadius: "22px 22px 0 0",
    boxShadow: warmShadows.lg,
    ...shorthands.border("1px", "solid", warm.border),
    ...shorthands.borderBottom("0"),

    "@media (max-width: 980px)": {
      padding: `${layout.padding.xl} ${layout.padding.lg} ${layout.padding.lg}`,
    },

    "@media (max-width: 760px)": {
      minHeight: "auto",
      padding: `${layout.padding.lg} ${layout.padding.md} ${layout.padding.xl}`,
      borderRadius: "18px 18px 0 0",
    },

    "@media (max-width: 420px)": {
      padding: `${layout.padding.md} ${layout.padding.sm} ${layout.padding.lg}`,
      borderRadius: "16px 16px 0 0",
    },
  },

  content: {
    position: "relative",
    zIndex: 1,
    display: "grid",
    gridTemplateColumns: "1.35fr 0.78fr 0.78fr 1.45fr",
    columnGap: layout.gap["2xl"],
    rowGap: layout.gap.xl,
    alignItems: "start",

    "@media (max-width: 980px)": {
      gridTemplateColumns: "minmax(0, 1.15fr) minmax(180px, 0.85fr)",
      columnGap: layout.gap.xl,
    },

    "@media (max-width: 760px)": {
      gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
      columnGap: layout.gap.lg,
      rowGap: layout.gap.lg,
    },

    "@media (max-width: 620px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      rowGap: layout.gap.md,
    },

    "@media (max-width: 420px)": {
      gridTemplateColumns: "1fr",
    },
  },

  brandSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.lg,
    maxWidth: "275px",

    "@media (max-width: 980px)": {
      maxWidth: "none",
    },

    "@media (max-width: 760px)": {
      gridColumnStart: 1,
      gridColumnEnd: 3,
    },

    "@media (max-width: 620px)": {
      gridColumnStart: 1,
      gridColumnEnd: 3,
      rowGap: layout.gap.md,
    },

    "@media (max-width: 420px)": {
      gridColumnStart: "auto",
      gridColumnEnd: "auto",
    },
  },

  brand: {
    display: "inline-flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
    width: "fit-content",
    color: warm.textPrimary,
    textDecorationLine: "none",
    borderRadius: layout.radius.md,

    ":focus-visible": {
      outlineColor: warm.coralBright,
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "5px",
    },

    "@media (max-width: 420px)": {
      columnGap: layout.gap.xs,
    },
  },

  logoFrame: {
    width: "54px",
    height: "54px",
    borderRadius: layout.radius.lg,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "transparent",

    "@media (max-width: 420px)": {
      width: "46px",
      height: "46px",
    },
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
    fontSize: "26px",
    lineHeight: 1,

    "@media (max-width: 420px)": {
      fontSize: "23px",
    },
  },

  description: {
    ...typographyPresets.body,
    margin: 0,
    color: warm.textSecondary,
    lineHeight: 1.8,

    "@media (max-width: 760px)": {
      maxWidth: "520px",
    },

    "@media (max-width: 420px)": {
      lineHeight: 1.65,
    },
  },

  socialLinks: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
    flexWrap: "wrap",
    rowGap: layout.gap.xs,

    "@media (max-width: 420px)": {
      columnGap: layout.gap.xs,
    },
  },

  socialButton: {
    width: "38px",
    height: "38px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: warm.coralBright,
    backgroundColor: warm.bgSurface,
    borderRadius: layout.radius.full,
    boxShadow: warmShadows.xs,
    cursor: "pointer",
    ...shorthands.border("1px", "solid", warm.border),
    transitionProperty: "background-color, color, transform, box-shadow",
    transitionDuration: "0.16s",
    transitionTimingFunction: "ease",

    "& svg": {
      fontSize: "18px",
    },

    ":hover": {
      color: warm.rose,
      backgroundColor: warm.bgTint,
      transform: "translateY(-2px)",
      boxShadow: warmShadows.roseSoft,
    },

    ":focus-visible": {
      outlineColor: warm.coral,
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "3px",
    },

    "@media (max-width: 420px)": {
      width: "36px",
      height: "36px",
    },
  },

  navSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.md,

    "@media (max-width: 620px)": {
      rowGap: layout.gap.sm,
    },
  },

  sectionTitle: {
    ...typographyPresets.h3,
    margin: 0,
    color: warm.textPrimary,
    fontSize: "15px",

    "@media (max-width: 620px)": {
      fontSize: "14px",
    },
  },

  links: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.sm,

    "@media (max-width: 620px)": {
      rowGap: layout.gap.xs,
    },
  },

  link: {
    ...typographyPresets.body,
    width: "fit-content",
    minHeight: "24px",
    display: "inline-flex",
    alignItems: "center",
    color: warm.textSecondary,
    textDecorationLine: "none",
    borderRadius: layout.radius.full,
    transitionProperty: "color, transform",
    transitionDuration: "0.16s",
    transitionTimingFunction: "ease",

    ":hover": {
      color: warm.rose,
      transform: "translateX(2px)",
    },

    ":focus-visible": {
      outlineColor: warm.coral,
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "3px",
    },

    "@media (max-width: 620px)": {
      minHeight: "30px",
    },
  },

  newsletterSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.md,
    maxWidth: "320px",

    "@media (max-width: 980px)": {
      gridColumnStart: 1,
      gridColumnEnd: 3,
      maxWidth: "none",
    },

    "@media (max-width: 620px)": {
      gridColumnStart: 1,
      gridColumnEnd: 3,
      rowGap: layout.gap.sm,
    },

    "@media (max-width: 420px)": {
      gridColumnStart: "auto",
      gridColumnEnd: "auto",
    },
  },

  newsletterText: {
    ...typographyPresets.body,
    margin: 0,
    color: warm.textSecondary,
    lineHeight: 1.65,

    "@media (max-width: 620px)": {
      lineHeight: 1.55,
    },
  },

  newsletterForm: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 56px",
    columnGap: layout.gap.xs,
    maxWidth: "260px",

    "@media (max-width: 980px)": {
      maxWidth: "420px",
    },

    "@media (max-width: 420px)": {
      gridTemplateColumns: "minmax(0, 1fr) 48px",
      maxWidth: "none",
    },
  },

  emailInput: {
    minWidth: 0,
    height: "42px",
    padding: `0 ${layout.padding.md}`,
    color: warm.textPrimary,
    backgroundColor: warm.bgSurface,
    borderRadius: layout.radius.sm,
    boxShadow: warmShadows.xs,
    ...shorthands.border("1px", "solid", warm.border),
    fontSize: "13px",

    "::placeholder": {
      color: warm.textTertiary,
    },

    ":focus": {
      outlineColor: warm.coral,
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "2px",
    },

    "@media (max-width: 420px)": {
      height: "40px",
      padding: `0 ${layout.padding.sm}`,
    },
  },

  submitButton: {
    height: "42px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: semanticColors.textOnAccent,
    backgroundImage: gradients.primary,
    borderRadius: layout.radius.sm,
    cursor: "pointer",
    boxShadow: warmShadows.rose,
    ...shorthands.border("0"),
    transitionProperty: "transform, box-shadow",
    transitionDuration: "0.16s",
    transitionTimingFunction: "ease",

    "& svg": {
      fontSize: "20px",
    },

    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: warmShadows.roseHover,
    },

    ":focus-visible": {
      outlineColor: warm.coral,
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "3px",
    },

    "@media (max-width: 420px)": {
      height: "40px",
    },
  },

  copyright: {
    ...typographyPresets.caption,
    position: "relative",
    zIndex: 1,
    margin: `${layout.spacing[10]} 0 0`,
    paddingTop: layout.spacing[3],
    color: warm.textTertiary,
    ...shorthands.borderTop("1px", "solid", "var(--footer-divider)"),

    "@media (max-width: 620px)": {
      marginTop: layout.spacing[7],
      paddingTop: layout.spacing[4],
    },

    "@media (max-width: 420px)": {
      marginTop: layout.spacing[6],
    },
  },

  decorHotAirBalloon: {
    position: "absolute",
    top: "22px",
    left: "22px",
    width: "24px",
    height: "36px",
    opacity: 0.34,
    borderRadius: "50% 50% 46% 46%",
    background:
      "repeating-linear-gradient(90deg, var(--footer-decor-coral) 0 5px, var(--footer-decor-peach) 5px 10px)",

    "::before": {
      content: "\"\"",
      position: "absolute",
      left: "7px",
      bottom: "-8px",
      width: "10px",
      height: "7px",
      backgroundColor: "var(--footer-decor-peach)",
      borderRadius: "2px",
    },

    "@media (max-width: 620px)": {
      display: "none",
    },
  },

  decorTraveler: {
    position: "absolute",
    top: "34px",
    left: "84px",
    width: "34px",
    height: "46px",
    opacity: 0.42,

    "::before": {
      content: "\"\"",
      position: "absolute",
      left: "12px",
      top: 0,
      width: "14px",
      height: "14px",
      backgroundColor: "var(--footer-decor-brown)",
      borderRadius: layout.radius.full,
      boxShadow:
        "-12px 12px 0 -2px var(--footer-decor-coral-strong), 0 16px 0 2px var(--footer-decor-peach), 10px 22px 0 -1px var(--footer-decor-muted)",
    },

    "@media (max-width: 620px)": {
      display: "none",
    },
  },

  decorPlane: {
    position: "absolute",
    top: "58px",
    right: "82px",
    width: "60px",
    height: "16px",
    opacity: 0.22,
    transform: "rotate(-14deg)",

    "::before": {
      content: "\"\"",
      position: "absolute",
      inset: 0,
      clipPath: "polygon(0 42%, 100% 0, 72% 50%, 100% 100%, 0 58%, 42% 50%)",
      backgroundColor: "var(--footer-decor-coral)",
    },

    "@media (max-width: 760px)": {
      display: "none",
    },
  },

  decorCloud: {
    position: "absolute",
    top: "118px",
    right: "20px",
    width: "56px",
    height: "18px",
    opacity: 0.2,
    backgroundColor: "var(--footer-decor-peach)",
    borderRadius: layout.radius.full,

    "::before": {
      content: "\"\"",
      position: "absolute",
      left: "14px",
      bottom: "6px",
      width: "20px",
      height: "20px",
      backgroundColor: "var(--footer-decor-peach)",
      borderRadius: layout.radius.full,
    },

    "@media (max-width: 760px)": {
      display: "none",
    },
  },

  decorLandscape: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "84px",
    opacity: 0.54,
    background:
      "radial-gradient(80px 24px at 10% 100%, var(--footer-hill-soft) 0 68%, transparent 69%), radial-gradient(160px 48px at 24% 100%, var(--footer-hill-mid) 0 62%, transparent 63%), radial-gradient(220px 72px at 78% 100%, var(--footer-hill-strong) 0 64%, transparent 65%), linear-gradient(180deg, transparent 0 66%, var(--footer-hill-base) 67% 100%)",

    "::before": {
      content: "\"\"",
      position: "absolute",
      right: "30px",
      bottom: "20px",
      width: "72px",
      height: "58px",
      opacity: 0.56,
      background:
        "linear-gradient(90deg, transparent 0 18px, var(--footer-tree) 18px 21px, transparent 21px 35px, var(--footer-tree) 35px 38px, transparent 38px), radial-gradient(20px 16px at 18px 14px, var(--footer-tree) 0 38%, transparent 40%), radial-gradient(22px 16px at 38px 10px, var(--footer-tree) 0 38%, transparent 40%), radial-gradient(18px 14px at 52px 18px, var(--footer-tree) 0 38%, transparent 40%)",
    },

    "@media (max-width: 760px)": {
      height: "52px",
      opacity: 0.26,
      transform: "translateY(10px)",
    },

    "@media (max-width: 420px)": {
      height: "38px",
      opacity: 0.2,
    },
  },
});

import { makeStyles, shorthands } from "@griffel/react";

import { gradients, semanticColors, warm, warmShadows } from "../theme/colors";
import { layout, typography } from "../theme/typography";

export const useNotFoundStyles = makeStyles({
  root: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: "clamp(48px, 8vh, 84px) clamp(16px, 4vw, 32px)",
    overflowX: "hidden",
    background:
      "radial-gradient(circle at 26% 28%, var(--not-found-glow), transparent 34%), radial-gradient(circle at 82% 72%, var(--color-bg-accent), transparent 30%), var(--not-found-bg)",
  },

  content: {
    width: "min(980px, 100%)",
    display: "grid",
    gridTemplateColumns: "minmax(280px, 1.05fr) minmax(280px, 0.95fr)",
    alignItems: "center",
    columnGap: "clamp(40px, 7vw, 88px)",

    "@media (max-width: 760px)": {
      gridTemplateColumns: "1fr",
      rowGap: layout.gap.xl,
      textAlign: "center",
    },
  },

  illustration: {
    position: "relative",
    minHeight: "330px",
    overflow: "hidden",
    filter: "drop-shadow(0 28px 44px rgba(0, 0, 0, 0.08))",

    "@media (max-width: 760px)": {
      minHeight: "260px",
      maxWidth: "420px",
      width: "100%",
      justifySelf: "center",
    },
  },

  sun: {
    position: "absolute",
    inset: "14px auto auto 64px",
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    background:
      "linear-gradient(180deg, var(--not-found-sun-start), var(--not-found-sun-end))",
    boxShadow: "inset 0 0 60px rgba(255, 255, 255, 0.08)",
  },

  cloud: {
    position: "absolute",
    width: "86px",
    height: "20px",
    borderRadius: "999px",
    backgroundColor: "var(--not-found-cloud)",
    boxShadow:
      "36px 8px 0 var(--not-found-cloud-shadow), 18px -14px 0 8px var(--not-found-cloud-shadow)",
  },

  cloudLeft: {
    top: "76px",
    left: "72px",
  },

  cloudRight: {
    top: "160px",
    right: "54px",
    transform: "scale(0.76)",
  },

  paperPlane: {
    position: "absolute",
    top: "34px",
    right: "54px",
    width: 0,
    height: 0,
    ...shorthands.borderTop("14px", "solid", "transparent"),
    ...shorthands.borderBottom("14px", "solid", "transparent"),
    ...shorthands.borderLeft("46px", "solid", warm.coral),
    transform: "rotate(-40deg)",
    filter: "drop-shadow(0 10px 16px rgba(111, 147, 188, 0.22))",

    "::after": {
      content: "\"\"",
      position: "absolute",
      top: "-7px",
      left: "-39px",
      width: "26px",
      height: "2px",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      transform: "rotate(24deg)",
    },
  },

  planeTrail: {
    position: "absolute",
    top: "78px",
    right: "108px",
    width: "142px",
    height: "58px",
    borderRadius: "50%",
    ...shorthands.border("2px", "dashed", "rgba(155, 183, 209, 0.4)"),
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    transform: "rotate(-8deg)",
  },

  ground: {
    position: "absolute",
    left: "26px",
    right: "18px",
    bottom: "10px",
    height: "30px",
    borderRadius: "50%",
    background:
      "linear-gradient(90deg, transparent, var(--not-found-ground), transparent)",
  },

  post: {
    position: "absolute",
    left: "168px",
    bottom: "28px",
    width: "24px",
    height: "178px",
    borderRadius: "6px",
    background: "var(--not-found-post)",
    boxShadow: warmShadows.sm,
  },

  sign: {
    position: "absolute",
    left: "70px",
    bottom: "132px",
    width: "260px",
    height: "78px",
    display: "grid",
    placeItems: "center",
    color: "var(--not-found-sign-text)",
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size6,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    textAlign: "center",
    background: "var(--not-found-sign)",
    clipPath: "polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%, 8% 50%)",
    transform: "rotate(5deg)",
    boxShadow:
      "inset 0 0 0 4px var(--not-found-sign-shine), 0 18px 26px rgba(0, 0, 0, 0.12)",
  },

  marker: {
    position: "absolute",
    right: "32px",
    bottom: "18px",
    width: "34px",
    height: "22px",
    borderRadius: "50%",
    ...shorthands.border("1.5px", "solid", "var(--not-found-brown-line)"),
    transform: "rotate(24deg)",

    "::after": {
      content: "\"x\"",
      position: "absolute",
      right: "-24px",
      bottom: "-6px",
      color: "var(--not-found-brown-mark)",
      fontSize: typography.fontSize.size8,
      fontWeight: typography.fontWeight.bold,
    },
  },

  plant: {
    position: "absolute",
    bottom: "32px",
    width: "64px",
    height: "82px",

    "::before": {
      content: "\"\"",
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(72deg, transparent 46%, rgba(155,183,209,0.5) 48%, transparent 50%), linear-gradient(112deg, transparent 48%, rgba(111,147,188,0.38) 50%, transparent 52%)",
    },
  },

  plantLeft: {
    left: "34px",
  },

  plantRight: {
    right: "82px",
    transform: "scaleX(-1)",
  },

  rock: {
    position: "absolute",
    bottom: "18px",
    width: "20px",
    height: "12px",
    borderRadius: "50% 50% 44% 44%",
    backgroundColor: "var(--not-found-rock)",
  },

  rockOne: {
    left: "110px",
  },

  rockTwo: {
    left: "250px",
    transform: "scale(0.9)",
  },

  rockThree: {
    right: "38px",
    width: "34px",
    height: "21px",
    backgroundColor: "var(--not-found-rock-large)",
  },

  copy: {
    maxWidth: "430px",

    "@media (max-width: 760px)": {
      justifySelf: "center",
      maxWidth: "520px",
    },
  },

  code: {
    margin: 0,
    fontFamily: typography.fontFamily.sans,
    fontSize: "clamp(88px, 13vw, 150px)",
    fontWeight: 800,
    lineHeight: 0.86,
    letterSpacing: "0",
    color: warm.coral,
    backgroundImage: gradients.primary,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  title: {
    margin: "16px 0 0",
    color: warm.textPrimary,
    fontFamily: typography.fontFamily.sans,
    fontSize: "clamp(24px, 3vw, 30px)",
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: "0",
  },

  message: {
    maxWidth: "360px",
    margin: "18px 0 0",
    color: semanticColors.textSecondary,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size6,
    lineHeight: 1.55,

    "@media (max-width: 760px)": {
      marginRight: "auto",
      marginLeft: "auto",
    },
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: layout.gap.md,
    marginTop: "26px",

    "@media (max-width: 760px)": {
      justifyContent: "center",
    },
  },
});

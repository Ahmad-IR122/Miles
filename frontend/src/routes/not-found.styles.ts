import { makeStyles, shorthands } from "@griffel/react";

import { colors, gradients, semanticColors } from "../common/theme/colors";
import { layout, typography } from "../common/theme/typography";

export const useNotFoundStyles = makeStyles({
  root: {
    minHeight: "calc(100dvh - 140px)",
    display: "grid",
    placeItems: "center",
    padding: "72px 24px",
    background:
      "radial-gradient(circle at 26% 28%, rgba(255, 217, 196, 0.4), transparent 30%), #fffaf7",
  },

  content: {
    width: "min(940px, 100%)",
    display: "grid",
    gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 0.95fr)",
    alignItems: "center",
    columnGap: "72px",

    "@media (max-width: 760px)": {
      gridTemplateColumns: "1fr",
      rowGap: layout.gap.xl,
      textAlign: "center",
    },
  },

  illustration: {
    position: "relative",
    minHeight: "310px",

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
      "linear-gradient(180deg, rgba(255, 230, 210, 0.75), rgba(255, 244, 234, 0.4))",
  },

  cloud: {
    position: "absolute",
    width: "86px",
    height: "20px",
    borderRadius: "999px",
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    boxShadow:
      "36px 8px 0 rgba(255,255,255,0.72), 18px -14px 0 8px rgba(255,255,255,0.7)",
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
    ...shorthands.borderLeft("46px", "solid", colors.coral),
    transform: "rotate(-40deg)",
    filter: "drop-shadow(0 10px 16px rgba(233, 79, 146, 0.18))",

    "::after": {
      content: "\"\"",
      position: "absolute",
      top: "-7px",
      left: "-39px",
      width: "26px",
      height: "2px",
      backgroundColor: "rgba(255, 255, 255, 0.45)",
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
    ...shorthands.border("2px", "dashed", "rgba(255, 122, 89, 0.38)"),
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
      "linear-gradient(90deg, rgba(255, 218, 194, 0), rgba(255, 218, 194, 0.84), rgba(255, 218, 194, 0))",
  },

  post: {
    position: "absolute",
    left: "168px",
    bottom: "28px",
    width: "24px",
    height: "178px",
    borderRadius: "6px",
    background: "linear-gradient(90deg, #8f5231, #b97655 46%, #7b442b)",
    boxShadow: "0 12px 18px rgba(107, 66, 38, 0.18)",
  },

  sign: {
    position: "absolute",
    left: "70px",
    bottom: "132px",
    width: "260px",
    height: "78px",
    display: "grid",
    placeItems: "center",
    color: colors.brown,
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size6,
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    textAlign: "center",
    background: "linear-gradient(180deg, #ffd4ba, #efab86 56%, #d88f6e)",
    clipPath: "polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%, 8% 50%)",
    transform: "rotate(5deg)",
    boxShadow:
      "inset 0 0 0 4px rgba(255,255,255,0.2), 0 18px 26px rgba(107, 66, 38, 0.12)",
  },

  marker: {
    position: "absolute",
    right: "32px",
    bottom: "18px",
    width: "34px",
    height: "22px",
    borderRadius: "50%",
    ...shorthands.border("1.5px", "solid", "rgba(107,66,38,0.28)"),
    transform: "rotate(24deg)",

    "::after": {
      content: "\"x\"",
      position: "absolute",
      right: "-24px",
      bottom: "-6px",
      color: "rgba(107,66,38,0.62)",
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
        "linear-gradient(72deg, transparent 46%, rgba(255,122,89,0.45) 48%, transparent 50%), linear-gradient(112deg, transparent 48%, rgba(233,79,146,0.34) 50%, transparent 52%)",
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
    backgroundColor: "#d99b79",
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
    backgroundColor: "#e0aa89",
  },

  copy: {
    maxWidth: "430px",

    "@media (max-width: 760px)": {
      justifySelf: "center",
    },
  },

  code: {
    margin: 0,
    fontFamily: typography.fontFamily.sans,
    fontSize: "clamp(88px, 13vw, 150px)",
    fontWeight: 800,
    lineHeight: 0.86,
    letterSpacing: "0",
    color: colors.coral,
    backgroundImage: gradients.primary,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  title: {
    margin: "16px 0 0",
    color: "#2b1e1c",
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
    justifyContent: "center",
    gap: layout.gap.md,
    marginTop: "26px",
  },
});

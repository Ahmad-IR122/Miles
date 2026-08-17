import { makeStyles, shorthands } from "@griffel/react";

import { colors, gradients } from "../theme/colors";
import { layout, typographyPresets } from "../theme/typography";

export const useFooterStyles = makeStyles({
  footer: {
    marginTop: layout.spacing[16],
    padding: `0 ${layout.padding.xl} ${layout.padding.xl}`,
    backgroundColor: "#FFF9F5",

    "@media (max-width: 760px)": {
      marginTop: layout.spacing[10],
      padding: `0 ${layout.padding.sm} ${layout.padding.lg}`,
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
      "linear-gradient(180deg, rgba(255, 252, 249, 0.96) 0%, rgba(255, 249, 245, 0.98) 100%)",
    borderRadius: "22px 22px 0 0",
    boxShadow: "0 18px 44px rgba(47, 33, 27, 0.06)",
    ...shorthands.border("1px", "solid", "#F3DED4"),
    ...shorthands.borderBottom("0"),

    "@media (max-width: 980px)": {
      padding: `${layout.padding.xl} ${layout.padding.lg} ${layout.padding.lg}`,
    },

    "@media (max-width: 760px)": {
      minHeight: "auto",
      padding: `${layout.padding.lg} ${layout.padding.md}`,
      borderRadius: "18px 18px 0 0",
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
      gridTemplateColumns: "1.2fr 1fr",
    },

    "@media (max-width: 620px)": {
      gridTemplateColumns: "1fr",
      rowGap: layout.gap.lg,
    },
  },

  brandSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.lg,
    maxWidth: "275px",
  },

  brand: {
    display: "inline-flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
    width: "fit-content",
    color: "#2F211B",
    textDecorationLine: "none",
    borderRadius: layout.radius.md,

    ":focus-visible": {
      outlineColor: "#FF6B6B",
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "5px",
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
    fontSize: "26px",
    lineHeight: 1,
  },

  description: {
    ...typographyPresets.body,
    margin: 0,
    color: "#5F676C",
    lineHeight: 1.8,
  },

  socialLinks: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.gap.sm,
  },

  socialButton: {
    width: "38px",
    height: "38px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FF6B6B",
    backgroundColor: "#FFFFFF",
    borderRadius: layout.radius.full,
    boxShadow: "0 8px 18px rgba(47, 33, 27, 0.08)",
    cursor: "pointer",
    ...shorthands.border("1px", "solid", "#F3DED4"),
    transitionProperty: "color, transform, box-shadow",
    transitionDuration: "0.16s",
    transitionTimingFunction: "ease",

    "& svg": {
      fontSize: "18px",
    },

    ":hover": {
      color: colors.rose,
      transform: "translateY(-2px)",
      boxShadow: "0 12px 24px rgba(244, 63, 122, 0.15)",
    },

    ":focus-visible": {
      outlineColor: colors.coral,
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "3px",
    },
  },

  navSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.md,
  },

  sectionTitle: {
    ...typographyPresets.h3,
    margin: 0,
    color: "#3B1F13",
    fontSize: "15px",
  },

  links: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.sm,
  },

  link: {
    ...typographyPresets.body,
    width: "fit-content",
    minHeight: "24px",
    display: "inline-flex",
    alignItems: "center",
    color: "#5F676C",
    textDecorationLine: "none",
    borderRadius: layout.radius.full,
    transitionProperty: "color, transform",
    transitionDuration: "0.16s",
    transitionTimingFunction: "ease",

    ":hover": {
      color: colors.rose,
      transform: "translateX(2px)",
    },

    ":focus-visible": {
      outlineColor: colors.coral,
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "3px",
    },
  },

  newsletterSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.gap.md,
    maxWidth: "320px",
  },

  newsletterText: {
    ...typographyPresets.body,
    margin: 0,
    color: "#5F676C",
    lineHeight: 1.65,
  },

  newsletterForm: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 56px",
    columnGap: layout.gap.xs,
    maxWidth: "260px",
  },

  emailInput: {
    minWidth: 0,
    height: "42px",
    padding: `0 ${layout.padding.md}`,
    color: "#2F211B",
    backgroundColor: "#FFFFFF",
    borderRadius: layout.radius.sm,
    boxShadow: "0 8px 18px rgba(47, 33, 27, 0.06)",
    ...shorthands.border("1px", "solid", "#F3DED4"),
    fontSize: "13px",

    "::placeholder": {
      color: "#9C8D84",
    },

    ":focus": {
      outlineColor: colors.coral,
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "2px",
    },
  },

  submitButton: {
    height: "42px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    backgroundImage: gradients.primary,
    borderRadius: layout.radius.sm,
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(244, 63, 122, 0.22)",
    ...shorthands.border("0"),
    transitionProperty: "transform, box-shadow",
    transitionDuration: "0.16s",
    transitionTimingFunction: "ease",

    "& svg": {
      fontSize: "20px",
    },

    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 14px 28px rgba(244, 63, 122, 0.28)",
    },

    ":focus-visible": {
      outlineColor: colors.coral,
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineOffset: "3px",
    },
  },

  copyright: {
    ...typographyPresets.caption,
    position: "relative",
    zIndex: 1,
    margin: `${layout.spacing[10]} 0 0`,
    paddingTop: layout.spacing[3],
    color: "#9C8D84",
    ...shorthands.borderTop("1px", "solid", "rgba(243, 222, 212, 0.82)"),
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
      "repeating-linear-gradient(90deg, #FF9B85 0 5px, #FFE1D6 5px 10px)",

    "::before": {
      content: "\"\"",
      position: "absolute",
      left: "7px",
      bottom: "-8px",
      width: "10px",
      height: "7px",
      backgroundColor: "#FFD8C7",
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
      backgroundColor: "#7F4A35",
      borderRadius: layout.radius.full,
      boxShadow:
        "-12px 12px 0 -2px #FF6B6B, 0 16px 0 2px #FFD8C7, 10px 22px 0 -1px #7F7068",
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
      backgroundColor: "#FF9B85",
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
    backgroundColor: "#FFD8C7",
    borderRadius: layout.radius.full,

    "::before": {
      content: "\"\"",
      position: "absolute",
      left: "14px",
      bottom: "6px",
      width: "20px",
      height: "20px",
      backgroundColor: "#FFD8C7",
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
      "radial-gradient(80px 24px at 10% 100%, #FFE4D9 0 68%, transparent 69%), radial-gradient(160px 48px at 24% 100%, #FFDCD0 0 62%, transparent 63%), radial-gradient(220px 72px at 78% 100%, #FFD0C0 0 64%, transparent 65%), linear-gradient(180deg, transparent 0 66%, #FFE3D7 67% 100%)",

    "::before": {
      content: "\"\"",
      position: "absolute",
      right: "30px",
      bottom: "20px",
      width: "72px",
      height: "58px",
      opacity: 0.56,
      background:
        "linear-gradient(90deg, transparent 0 18px, #EFB49D 18px 21px, transparent 21px 35px, #EFB49D 35px 38px, transparent 38px), radial-gradient(20px 16px at 18px 14px, #EFB49D 0 38%, transparent 40%), radial-gradient(22px 16px at 38px 10px, #EFB49D 0 38%, transparent 40%), radial-gradient(18px 14px at 52px 18px, #EFB49D 0 38%, transparent 40%)",
    },

    "@media (max-width: 760px)": {
      height: "42px",
      opacity: 0.35,
    },
  },
});

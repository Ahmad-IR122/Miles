import { makeStyles, shorthands } from "@griffel/react";
import { colors, semanticColors, gradients } from "../../common/theme/colors";
import {
  layout,
  typography,
  typographyPresets,
} from "../../common/theme/typography";

export const useHomeStyles = makeStyles({
  page: {
    fontFamily: typography.fontFamily.sans,
    backgroundColor: semanticColors.bgPage,
    minHeight: "100dvh",
  },

  hero: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: layout.gap["2xl"],
    padding: `${layout.navHeight + 60}px ${layout.padding.xl} ${layout.padding["2xl"]}`,
    maxWidth: "1280px",
    margin: "0 auto",
  },

  intro: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "420px",
    display: "flex",
    flexDirection: "column",
    gap: layout.gap.lg,
    maxWidth: "520px",
    marginTop: "-80px",
    "@media (max-width: 1100px)": { marginTop: layout.spacing[5] },
  },

  title: {
    "&.MuiTypography-root": {
      ...typographyPresets.h1,
      color: semanticColors.textPrimary,
      margin: 0,
    },
  },

  gradientText: {
    fontStyle: "italic",
    display: "inline-block",
    backgroundImage: gradients.primary,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
  },

  description: {
    "&.MuiTypography-root": {
      ...typographyPresets.bodyLarge,
      color: semanticColors.textSecondary,
      margin: 0,
      maxWidth: "420px",
    },
  },

  ctaButton: { alignSelf: "flex-start" },

  visual: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "380px",
    maxWidth: "480px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    padding: `${layout.gap.md} 0`,
  },

  peachBlob: {
    position: "absolute",
    top: "-6%",
    right: "6%",
    width: "78%",
    height: "78%",
    // Intentional organic shape - do not replace with standard radius tokens
    borderRadius: "42% 58% 63% 37% / 41% 44% 56% 59%",
    backgroundColor: colors.peach,
    opacity: 0.6,
    filter: "blur(2px)",
    zIndex: 0,
  },

  roseBlob: {
    position: "absolute",
    bottom: "-4%",
    left: "2%",
    width: "36%",
    height: "36%",
    borderRadius: "50%",
    backgroundColor: colors.rose,
    opacity: 0.25,
    zIndex: 0,
  },

  photoCard: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    aspectRatio: "4 / 5",
    borderRadius: layout.radius.xl,
    overflow: "hidden",
    transform: "rotate(-2.5deg)",
    boxShadow: semanticColors.shadowMedium,
    ...shorthands.border("8px", "solid", semanticColors.bgPrimary),
  },

  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
});

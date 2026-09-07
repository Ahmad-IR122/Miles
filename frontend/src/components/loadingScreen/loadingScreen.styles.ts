import { makeStyles } from "@griffel/react";
import { semanticColors, warm } from "../../common/theme/colors";
import {
  layout,
  typography,
  typographyPresets,
} from "../../common/theme/typography";

/**
 * Geometry of the circular progress ring that wraps the loading sprite.
 * The SVG viewBox is 1:1 with pixels so the plane, positioned in CSS, can
 * share the same radius as the stroked circle.
 */
export const progressRing = {
  size: 240,
  radius: 110,
  stroke: 12,
  /** The plane flies just outside the stroke so it never smudges into it. */
  planeRadius: 126,
} as const;

export const progressRingCircumference = 2 * Math.PI * progressRing.radius;

export const useLoadingScreenStyles = makeStyles({
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 1100,

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: layout.padding["2xl"],
    rowGap: layout.gap.xl,
    // Same layered-gradient recipe as the splash screen, so the two
    // full-page loading states read as one consistent background in both
    // light and dark mode.
    backgroundImage: `radial-gradient(circle at 50% 42%, color-mix(in srgb, ${semanticColors.bgPrimary} 55%, transparent) 0%, transparent 50%), radial-gradient(circle at 16% 26%, ${semanticColors.bgAccent} 0%, transparent 36%), radial-gradient(circle at 84% 74%, ${semanticColors.bgInteractiveSubtle} 0%, transparent 38%), radial-gradient(circle at 12% 8%, ${semanticColors.bgAccent} 0%, transparent 34%), radial-gradient(circle at 88% 92%, ${semanticColors.bgInteractiveSubtle} 0%, transparent 32%), linear-gradient(160deg, ${semanticColors.bgPage} 0%, ${semanticColors.bgPrimary} 55%, ${warm.bgTint} 100%)`,
    "@media (max-width: 640px)": {
      padding: layout.padding.lg,
    },
  },
  generatingIcon: {
    width: "140px",
    height: "140px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: `radial-gradient(circle, color-mix(in srgb, ${warm.coralBright} 16%, transparent) 0%, transparent 70%)`,
    // LoadingSprite's root element (one frame of the sprite sheet, drawn as
    // a CSS background rather than an <img> - see loadingSprite.tsx).
    "& > div": {
      width: "100%",
      height: "100%",
      imageRendering: "pixelated",
      filter: `drop-shadow(0 0 2px color-mix(in srgb, ${semanticColors.bgPrimary} 65%, transparent)) drop-shadow(0 0 9px color-mix(in srgb, ${warm.coralBright} 35%, transparent))`,
    },
  },
  centered: { textAlign: "center" },
  generatingTitle: {
    ...typographyPresets.h2,
    color: semanticColors.textPrimary,
    marginBottom: layout.gap.sm,
  },
  generatingText: {
    fontSize: typography.fontSize.size5,
    color: semanticColors.textSecondary,
  },
  progressRing: {
    position: "relative",
    width: `${progressRing.size}px`,
    height: `${progressRing.size}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  // Rotated so the sweep starts at 12 o'clock instead of the SVG default 3.
  progressRingSvg: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    transform: "rotate(-90deg)",
  },
  progressRingTrack: {
    fill: "none",
    stroke: semanticColors.bgTrack,
    strokeWidth: `${progressRing.stroke}px`,
  },
  progressRingFill: {
    fill: "none",
    stroke: "url(#loadingProgressGradient)",
    strokeWidth: `${progressRing.stroke}px`,
    strokeLinecap: "round",
    filter: `drop-shadow(0 0 10px color-mix(in srgb, ${warm.coralBright} 35%, transparent))`,
    transitionProperty: "stroke-dashoffset",
    transitionDuration: layout.duration.normal,
    transitionTimingFunction: "linear",
  },
  progressRingGradientStart: { stopColor: warm.coralBright },
  progressRingGradientEnd: { stopColor: warm.rose },
  // Parked at the centre; the inline transform walks it around the ring.
  progressPlane: {
    position: "absolute",
    top: "50%",
    left: "50%",
    color: warm.coralBright,
    fontSize: typography.fontSize.size11,
    filter: `drop-shadow(0 8px 14px color-mix(in srgb, ${warm.coralBright} 28%, transparent))`,
    transitionProperty: "transform",
    transitionDuration: layout.duration.normal,
    transitionTimingFunction: "linear",
    pointerEvents: "none",
  },
  progressStatus: {
    fontSize: typography.fontSize.size4,
    color: semanticColors.textTertiary,
  },
});

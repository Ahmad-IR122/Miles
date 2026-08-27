import { makeStyles } from "@griffel/react";
import {
  itinerary,
  itineraryGradients,
  itineraryShadows,
  semanticColors,
  warm,
} from "../../common/theme/colors";
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100dvh",
    padding: layout.padding["2xl"],
    rowGap: layout.gap.xl,
    backgroundImage: itineraryGradients.page,
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
    backgroundImage: itineraryGradients.spriteHalo,
    "& img": {
      width: "100%",
      height: "100%",
      objectFit: "contain",
      imageRendering: "pixelated",
      filter: itineraryShadows.sprite,
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
    filter: itineraryShadows.progressGlow,
    transitionProperty: "stroke-dashoffset",
    transitionDuration: layout.duration.normal,
    transitionTimingFunction: "linear",
  },
  progressRingGradientStart: { stopColor: warm.coralBright },
  progressRingGradientEnd: { stopColor: itinerary.pink },
  // Parked at the centre; the inline transform walks it around the ring.
  progressPlane: {
    position: "absolute",
    top: "50%",
    left: "50%",
    color: warm.coralBright,
    fontSize: typography.fontSize.size11,
    filter: itineraryShadows.planeIcon,
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

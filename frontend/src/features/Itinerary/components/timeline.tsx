import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { mergeClasses } from "@griffel/react";

import ApartmentIcon from "@mui/icons-material/Apartment";
import FlightIcon from "@mui/icons-material/Flight";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import PaletteIcon from "@mui/icons-material/Palette";
import PlaceIcon from "@mui/icons-material/Place";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import TempleBuddhistIcon from "@mui/icons-material/TempleBuddhist";
import { useItineraryStyles } from "../styles/itinerary.styles";
import type { Activity, Day } from "../types/itinerary.types";
import { ActivityCard } from "./activityCard";

type TimelineProps = {
  /** Shown as a dimmed overlay + spinner over the whole timeline while true
   * (day/trip regenerate, add-activity) — not used for single-activity
   * regenerate, which already has its own inline "Regenerating..." state. */
  busy?: boolean;
  busyLabel?: string;
  day: Day;
  dayIndex: number;
  destination?: string;
  isActivityRegenerating?: (activityIndex: number) => boolean;
  onDeleteActivity: (dayIndex: number, activityIndex: number) => void;
  onRegenerateActivity?: (dayIndex: number, activityIndex: number) => void;
  onUpdateActivity: (
    dayIndex: number,
    activityIndex: number,
    updates: { title: string; description: string },
  ) => void;
  regenerateDisabled?: boolean;
};

// Height (in SVG user units) of one repeat of the connector's wave pattern —
// must match the <pattern height> below, kept as one constant so the JS
// sampling and the rendered path can never drift apart.
const WAVE_PATTERN_HEIGHT = 130;

const getActivityCategory = (activity: Activity) =>
  (typeof activity === "string" ? undefined : activity.category)
    ?.toLowerCase()
    .trim();

const MarkerIcon = ({
  category,
  className,
}: {
  category?: string;
  className: string;
}) => {
  switch (category) {
  case "culture":
    return <TempleBuddhistIcon className={className} />;
  case "food":
  case "dining":
    return <RestaurantIcon className={className} />;
  case "sightseeing":
    return <ApartmentIcon className={className} />;
  case "nature":
    return <LocalFloristIcon className={className} />;
  case "art":
    return <PaletteIcon className={className} />;
  case "shopping":
    return <LocalMallIcon className={className} />;
  default:
    return <PlaceIcon className={className} />;
  }
};

export const Timeline = ({
  busy = false,
  busyLabel = "Updating your itinerary...",
  day,
  dayIndex,
  destination,
  isActivityRegenerating,
  onDeleteActivity,
  onRegenerateActivity,
  onUpdateActivity,
  regenerateDisabled = false,
}: TimelineProps) => {
  const classes = useItineraryStyles();
  const activities = day.activities ?? [];
  const lastActivityIndex = activities.length - 1;

  const timelineRef = useRef<HTMLDivElement | null>(null);
  const lastMarkerRef = useRef<HTMLDivElement | null>(null);
  const planeTrackRef = useRef<HTMLDivElement | null>(null);
  const planeIconRef = useRef<SVGSVGElement | null>(null);
  const wavePathRef = useRef<SVGPathElement | null>(null);
  const [connectorHeight, setConnectorHeight] = useState<number>();

  // Stop the connector line exactly at the last marker's center instead of
  // letting it run to the bottom of the (taller) last activity card.
  useLayoutEffect(() => {
    const timelineEl = timelineRef.current;
    const markerEl = lastMarkerRef.current;
    if (!timelineEl || !markerEl) return;

    const measure = () => {
      const timelineTop = timelineEl.getBoundingClientRect().top;
      const markerRect = markerEl.getBoundingClientRect();
      const markerCenter = markerRect.top + markerRect.height / 2;
      setConnectorHeight(markerCenter - timelineTop);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(timelineEl);
    return () => observer.disconnect();
  }, [activities.length]);

  // Keep the plane locked to the wavy connector: read the sticky track's
  // real on-screen position, then sample the ACTUAL rendered <path> at that
  // height so the plane sits exactly on the curve — not an approximation of
  // it — as the page scrolls.
  useEffect(() => {
    const timelineEl = timelineRef.current;
    const trackEl = planeTrackRef.current;
    const iconEl = planeIconRef.current;
    const pathEl = wavePathRef.current;
    if (!timelineEl || !trackEl || !iconEl || !pathEl) return;

    const CONNECTOR_LEFT = 4;
    const totalLength = pathEl.getTotalLength();

    // The path's y increases monotonically from 0 to WAVE_PATTERN_HEIGHT as
    // its length-parameter t goes from 0 to totalLength, so binary search
    // for the t whose point.y matches the target height.
    const pointAtY = (targetY: number) => {
      let lo = 0;
      let hi = totalLength;
      for (let i = 0; i < 16; i += 1) {
        const mid = (lo + hi) / 2;
        if (pathEl.getPointAtLength(mid).y < targetY) {
          lo = mid;
        } else {
          hi = mid;
        }
      }
      const t = (lo + hi) / 2;
      const point = pathEl.getPointAtLength(t);
      const before = pathEl.getPointAtLength(Math.max(0, t - 1));
      const after = pathEl.getPointAtLength(Math.min(totalLength, t + 1));
      const dy = after.y - before.y;
      const dx = after.x - before.x;
      return { x: point.x, slope: dy !== 0 ? dx / dy : 0 };
    };

    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const timelineTop = timelineEl.getBoundingClientRect().top;
      const trackTop = trackEl.getBoundingClientRect().top;
      const localY = trackTop - timelineTop;
      const wrappedY =
        ((localY % WAVE_PATTERN_HEIGHT) + WAVE_PATTERN_HEIGHT) %
        WAVE_PATTERN_HEIGHT;

      const { x, slope } = pointAtY(wrappedY);
      const tilt = 135 + Math.atan(slope) * (180 / Math.PI) * 0.6;

      iconEl.style.left = `${CONNECTOR_LEFT + x}px`;
      iconEl.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
    };

    const onScrollOrResize = () => {
      if (rafId === null) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [activities.length]);

  return (
    <Box className={classes.timeline} ref={timelineRef}>
      {busy && (
        <Box aria-live="polite" className={classes.timelineOverlay}>
          <CircularProgress className={classes.timelineOverlaySpinner} />
          <Box className={classes.timelineOverlayText}>{busyLabel}</Box>
        </Box>
      )}
      <Box
        className={classes.connector}
        style={
          connectorHeight !== undefined
            ? { height: connectorHeight }
            : undefined
        }
      >
        <svg className={classes.connectorSvg} height="100%" width="100%">
          <defs>
            <pattern
              height={WAVE_PATTERN_HEIGHT}
              id="itinerary-wave-pattern"
              patternUnits="userSpaceOnUse"
              width="34"
              x="0"
              y="0"
            >
              <path
                d="M17,0 C2,22 2,43 17,65 C32,87 32,108 17,130"
                fill="none"
                ref={wavePathRef}
                stroke="currentColor"
                strokeDasharray="7 8"
                strokeLinecap="round"
                strokeWidth="2.5"
              />
            </pattern>
          </defs>
          <rect
            fill="url(#itinerary-wave-pattern)"
            height="100%"
            width="100%"
          />
        </svg>
      </Box>
      <Box className={classes.timelinePlaneTrack} ref={planeTrackRef}>
        <FlightIcon
          aria-hidden="true"
          className={classes.timelinePlaneIcon}
          ref={planeIconRef}
        />
      </Box>

      {activities.map((activity, activityIndex) => {
        const category = getActivityCategory(activity);
        const markerClass =
          category === "culture" ||
          category === "history" ||
          category === "art & culture"
            ? classes.markerPurple
            : category === "food" || category === "adventure"
              ? classes.markerOrange
              : category === "sightseeing"
                ? classes.markerCyan
                : category === "dining" || category === "nightlife"
                  ? classes.markerRed
                  : category === "nature"
                    ? classes.markerGreen
                    : classes.markerBlue;

        return (
          <Box className={classes.activityRow} key={activityIndex}>
            <Box
              className={mergeClasses(classes.marker, markerClass)}
              ref={
                activityIndex === lastActivityIndex ? lastMarkerRef : undefined
              }
            >
              <MarkerIcon category={category} className={classes.markerIcon} />
            </Box>

            <ActivityCard
              activity={activity}
              activityIndex={activityIndex}
              dayIndex={dayIndex}
              dayNumber={day.day}
              destination={destination}
              isRegenerating={isActivityRegenerating?.(activityIndex) ?? false}
              onDelete={onDeleteActivity}
              onRegenerate={onRegenerateActivity}
              onUpdate={onUpdateActivity}
              regenerateDisabled={regenerateDisabled}
            />
          </Box>
        );
      })}
    </Box>
  );
};

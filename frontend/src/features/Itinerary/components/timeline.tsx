import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Box, CircularProgress } from "@mui/material";
import { mergeClasses } from "@griffel/react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
  type PointerSensorOptions,
} from "@dnd-kit/core";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  showLoadingSkeletons?: boolean;
  pendingActivityTime?: string;
  day: Day;
  dayIndex: number;
  destination?: string;
  isActivityRegenerating?: (activityIndex: number) => boolean;
  onDeleteActivity: (dayIndex: number, activityIndex: number) => void;
  onEditActivity: (
    dayIndex: number,
    activityIndex: number,
    activity: {
      title: string;
      description: string;
      location: string;
      price: string;
      category: string;
      startTime: string;
      endTime: string;
    },
  ) => void;
  onRegenerateActivity?: (dayIndex: number, activityIndex: number) => void;
  /** Called with the day's array indices (not the sortable ids) once a drag
   * ends on a new position. Reordering is only offered at all when every
   * activity in the day has a real backend id (see `canReorder` below), so
   * these indices always line up 1:1 with `day.activities`. */
  onReorderActivity?: (
    dayIndex: number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  reorderDisabled?: boolean;
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

const timeToMinutes = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return undefined;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (match[3]) {
    hours %= 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
  }
  return hours * 60 + minutes;
};

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

// The whole card is the drag target (press anywhere on it to move it), but
// it also contains real buttons (Edit/Regenerate/Delete). A plain
// PointerSensor would treat a press-and-slightly-move on one of those
// buttons as the start of a drag. This subclass just refuses to start a
// drag at all when the press began on a button (or similar interactive
// element) - dnd-kit's normal click handling then proceeds as if dnd-kit
// weren't there, so those buttons stay fully clickable.
//
// Deliberately NOT matching `[role="button"]` here: dnd-kit's own
// `useSortable`/`useDraggable` sets `role="button"` on the draggable card's
// own root element (that's the whole point - it's the drag target), so
// matching that selector made `.closest()` find the card's own root on
// every single press anywhere on the card and block activation 100% of the
// time. The real controls we need to exclude (Edit/Regenerate/Delete) are
// MUI IconButtons, which render actual `<button>` tags, so plain tag
// selectors are enough.
const INTERACTIVE_SELECTOR = "button, a, input, textarea, select";

class ActivityCardPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: (
        { nativeEvent }: ReactPointerEvent,
        options: PointerSensorOptions,
      ) => {
        const target = nativeEvent.target as HTMLElement | null;
        if (target?.closest(INTERACTIVE_SELECTOR)) {
          return false;
        }
        return PointerSensor.activators[0].handler(
          { nativeEvent } as ReactPointerEvent,
          options,
        );
      },
    },
  ];
}

type SortableActivityRowProps = {
  id: string;
  rowClassName: string;
  // Passed as three separate values rather than one bundled object, so
  // consuming components don't do property access on an object that
  // contains a ref-setter (which eslint's react-hooks/refs rule flags,
  // false-positively, as a ref access).
  children: (
    attributes: DraggableAttributes,
    listeners: DraggableSyntheticListeners,
    setActivatorNodeRef: (element: HTMLElement | null) => void,
  ) => ReactNode;
};

// Wraps one timeline row (marker + card) as a dnd-kit sortable item. The
// activator (attributes/listeners) is handed to the card itself (see
// activityCard.tsx), not this row's own marker column, so pressing anywhere
// on the card starts a drag - the ActivityCardPointerSensor above is what
// keeps that from swallowing clicks on the card's own buttons.
const SortableActivityRow = ({
  id,
  rowClassName,
  children,
}: SortableActivityRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <Box
      className={rowClassName}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      {children(attributes, listeners, setActivatorNodeRef)}
    </Box>
  );
};

export const Timeline = ({
  busy = false,
  busyLabel = "Updating your itinerary...",
  showLoadingSkeletons = true,
  pendingActivityTime,
  day,
  dayIndex,
  destination,
  isActivityRegenerating,
  onDeleteActivity,
  onEditActivity,
  onRegenerateActivity,
  onReorderActivity,
  reorderDisabled = false,
  regenerateDisabled = false,
}: TimelineProps) => {
  const classes = useItineraryStyles();
  const activities = day.activities ?? [];
  // Reordering is only offered when every activity in the day is real
  // (backend-persisted) data - fixture/string-only activities have no id to
  // drag by, and mixing draggable/non-draggable rows would make the dropped
  // index no longer line up with `day.activities`.
  const canReorder =
    !!onReorderActivity &&
    !reorderDisabled &&
    !pendingActivityTime &&
    activities.length > 1 &&
    activities.every(
      (activity) => typeof activity !== "string" && !!activity.id,
    );
  const sortableIds = canReorder
    ? activities.map((activity) =>
      typeof activity === "string" ? "" : String(activity.id),
    )
    : [];
  const sensors = useSensors(
    useSensor(ActivityCardPointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorderActivity) return;

    const fromIndex = sortableIds.indexOf(String(active.id));
    const toIndex = sortableIds.indexOf(String(over.id));
    if (fromIndex === -1 || toIndex === -1) return;

    onReorderActivity(dayIndex, fromIndex, toIndex);
  };

  const timelineActivities = activities.map((activity, activityIndex) => ({
    activity,
    activityIndex,
  }));
  if (pendingActivityTime) {
    const pendingMinutes = timeToMinutes(pendingActivityTime);
    const insertAt = timelineActivities.findIndex(({ activity }) => {
      if (typeof activity === "string") return false;
      const activityMinutes = timeToMinutes(activity.time);
      return (
        pendingMinutes !== undefined &&
        activityMinutes !== undefined &&
        pendingMinutes < activityMinutes
      );
    });
    timelineActivities.splice(
      insertAt === -1 ? timelineActivities.length : insertAt,
      0,
      { activity: "", activityIndex: -1 },
    );
  }
  const lastActivityIndex = timelineActivities.length - 1;

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
  }, [timelineActivities.length]);

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
  }, [timelineActivities.length]);

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

      {(() => {
        const renderRow = (
          { activity, activityIndex }: (typeof timelineActivities)[number],
          timelineIndex: number,
        ) => {
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

          const isDraggable =
            canReorder && typeof activity !== "string" && !!activity.id;

          const rowContent = (
            dragAttributes?: DraggableAttributes,
            dragListeners?: DraggableSyntheticListeners,
            setDragRef?: (element: HTMLElement | null) => void,
          ) => (
            <>
              <Box
                className={mergeClasses(classes.marker, markerClass)}
                ref={
                  timelineIndex === lastActivityIndex
                    ? lastMarkerRef
                    : undefined
                }
              >
                <MarkerIcon
                  category={category}
                  className={classes.markerIcon}
                />
              </Box>

              <ActivityCard
                activity={activity}
                activityIndex={activityIndex}
                dayIndex={dayIndex}
                dayNumber={day.day}
                destination={destination}
                dragAttributes={dragAttributes}
                dragListeners={dragListeners}
                setDragRef={setDragRef}
                isDraggable={isDraggable}
                isRegenerating={
                  activityIndex === -1 ||
                  (isActivityRegenerating?.(activityIndex) ?? false)
                }
                isLoading={
                  activityIndex === -1 ||
                  (busy && showLoadingSkeletons) ||
                  (isActivityRegenerating?.(activityIndex) ?? false)
                }
                loadingLabel={activityIndex === -1 ? busyLabel : undefined}
                onDelete={onDeleteActivity}
                onEdit={onEditActivity}
                onRegenerate={onRegenerateActivity}
                regenerateDisabled={regenerateDisabled}
              />
            </>
          );

          const key = activityIndex === -1 ? "pending-activity" : activityIndex;

          if (isDraggable) {
            return (
              <SortableActivityRow
                id={String(activity.id)}
                key={key}
                rowClassName={classes.activityRow}
              >
                {rowContent}
              </SortableActivityRow>
            );
          }

          return (
            <Box className={classes.activityRow} key={key}>
              {rowContent(undefined)}
            </Box>
          );
        };

        if (!canReorder) {
          return timelineActivities.map((entry, timelineIndex) =>
            renderRow(entry, timelineIndex),
          );
        }

        return (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <SortableContext
              items={sortableIds}
              strategy={verticalListSortingStrategy}
            >
              {timelineActivities.map((entry, timelineIndex) =>
                renderRow(entry, timelineIndex),
              )}
            </SortableContext>
          </DndContext>
        );
      })()}
    </Box>
  );
};

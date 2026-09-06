import { useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { mergeClasses } from "@griffel/react";
import type {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditIcon from "@mui/icons-material/Edit";
import PaidIcon from "@mui/icons-material/Paid";
import PlaceIcon from "@mui/icons-material/Place";
import TrainIcon from "@mui/icons-material/Train";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import ConfirmDialog from "../../../common/confirmDialog/confirmDialog";
import { useItineraryStyles } from "../styles/itinerary.styles";
import type { Activity } from "../types/itinerary.types";

type ActivityCardProps = {
  activity: Activity;
  activityIndex: number;
  dayIndex: number;
  dayNumber: number;
  destination?: string;
  // Passed as three separate values rather than one bundled object - eslint's
  // react-hooks/refs rule treats any object holding a ref-setter function as
  // ref-like and flags every property read off it, even unrelated ones like
  // `attributes`/`listeners` alongside it.
  dragHandleAttributes?: DraggableAttributes;
  dragHandleListeners?: DraggableSyntheticListeners;
  setDragHandleRef?: (element: HTMLElement | null) => void;
  isRegenerating?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  onDelete: (dayIndex: number, activityIndex: number) => void;
  onRegenerate?: (dayIndex: number, activityIndex: number) => void;
  onEdit: (
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
  regenerateDisabled?: boolean;
};

const formatCost = (cost?: string) => {
  if (!cost) return "";
  const trimmed = cost.trim();
  if (trimmed === "" || /^free$/i.test(trimmed)) return trimmed;
  return /[$€£¥]/.test(trimmed) ? trimmed : `$${trimmed}`;
};

// Fallback for when the adapter couldn't supply a real end time: derive one
// from the already-rendered start time + duration labels so the range still
// shows up regardless of which data path fed this card.
const TIME_LABEL_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
const DURATION_PATTERN = /(?:(\d+)\s*hr)?\s*(?:(\d+)\s*min)?/i;

const parseTimeLabel = (label: string): number | undefined => {
  const match = TIME_LABEL_PATTERN.exec(label.trim());
  if (!match) return undefined;
  const [, hourStr, minuteStr, meridiem] = match;
  const hour = Number(hourStr) % 12;
  return (
    (meridiem.toUpperCase() === "PM" ? hour + 12 : hour) * 60 +
    Number(minuteStr)
  );
};

const parseDurationLabel = (label: string): number => {
  const match = DURATION_PATTERN.exec(label.trim());
  const hours = match?.[1] ? Number(match[1]) : 0;
  const minutes = match?.[2] ? Number(match[2]) : 0;
  return hours * 60 + minutes;
};

const formatMinutesAsTime = (totalMinutes: number): string => {
  const MINUTES_PER_DAY = 24 * 60;
  const wrapped =
    ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  const suffix = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
};

const deriveEndTime = (
  startLabel: string,
  durationLabel: string,
): string | undefined => {
  const startMinutes = parseTimeLabel(startLabel);
  if (startMinutes === undefined) return undefined;
  const durationMinutes = parseDurationLabel(durationLabel);
  if (durationMinutes <= 0) return undefined;
  return formatMinutesAsTime(startMinutes + durationMinutes);
};

const normalizeActivity = (
  activity: Activity,
  activityIndex: number,
  dayNumber: number,
  destination?: string,
) => {
  if (typeof activity === "string") {
    return {
      title: activity,
      category: "activity",
      time: "",
      endTime: "",
      duration: `Day ${dayNumber}`,
      description: "",
      location: destination,
      transport: "",
      cost: "",
      weather: "",
    };
  }

  return {
    title: activity.title,
    category:
      activity.category ?? ["culture", "food", "dining"][activityIndex % 3],
    time: activity.time ?? "",
    endTime: activity.endTime ?? "",
    duration: activity.duration ?? "",
    description: activity.description ?? "",
    location: activity.location ?? destination,
    transport: activity.transport ?? "",
    cost: formatCost(activity.cost),
    weather: activity.weather ?? "",
  };
};

export const ActivityCard = ({
  activity,
  activityIndex,
  dayIndex,
  dayNumber,
  destination,
  dragHandleAttributes,
  dragHandleListeners,
  setDragHandleRef,
  isRegenerating = false,
  isLoading = false,
  loadingLabel,
  onDelete,
  onEdit,
  onRegenerate,
  regenerateDisabled = false,
}: ActivityCardProps) => {
  const classes = useItineraryStyles();
  const normalized = normalizeActivity(
    activity,
    activityIndex,
    dayNumber,
    destination,
  );
  const categoryClass =
    normalized.category === "food" || normalized.category === "adventure"
      ? classes.categoryAmber
      : normalized.category === "dining" || normalized.category === "nightlife"
        ? classes.categoryRed
        : normalized.category === "culture" ||
            normalized.category === "history" ||
            normalized.category === "art & culture"
          ? classes.categoryPurple
          : normalized.category === "sightseeing"
            ? classes.categoryCyan
            : normalized.category === "shopping"
              ? classes.categoryBlue
              : normalized.category === "art"
                ? classes.categoryBlue
                : normalized.category === "sightseeing"
                  ? classes.categoryOrange
                  : normalized.category === "nature"
                    ? classes.categoryGreen
                    : "";

  const resolvedEndTime =
    normalized.endTime || deriveEndTime(normalized.time, normalized.duration);
  const timeLabel =
    normalized.time && resolvedEndTime
      ? `${normalized.time} - ${resolvedEndTime}`
      : [normalized.time, normalized.duration].filter(Boolean).join(" · ");

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const confirmDelete = () => {
    setConfirmDeleteOpen(false);
    onDelete(dayIndex, activityIndex);
  };

  // Regeneration replaces the whole activity, not just its title, so the card
  // shows the old content as clearly on its way out rather than leaving stale
  // details looking current.
  return (
    <Box
      aria-busy={isLoading}
      className={mergeClasses(
        classes.activityCard,
        isLoading && classes.activityCardRegenerating,
      )}
    >
      {(isRegenerating || loadingLabel) && (
        <Box className={classes.regeneratingOverlay} role="status">
          <Box className={classes.regeneratingBadge}>
            <CircularProgress
              className={classes.regeneratingSpinner}
              size={16}
              thickness={4.5}
            />
            <Typography className={classes.regeneratingLabel}>
              {loadingLabel ?? "Regenerating activity…"}
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        aria-hidden={isLoading}
        className={mergeClasses(
          classes.activityContent,
          isRegenerating && !isLoading && classes.activityContentPending,
        )}
      >
        {isLoading ? (
          <Stack className={classes.activitySkeletonStack} spacing={1}>
            <Skeleton
              className={classes.activitySkeleton}
              height={18}
              variant="rounded"
              width="30%"
            />
            <Skeleton
              className={classes.activitySkeleton}
              height={30}
              variant="text"
              width="62%"
            />
            <Skeleton
              className={classes.activitySkeleton}
              height={20}
              variant="text"
              width="92%"
            />
            <Skeleton
              className={classes.activitySkeleton}
              height={20}
              variant="text"
              width="76%"
            />
          </Stack>
        ) : (
          <>
            <Box className={classes.activityMeta}>
              <Box className={mergeClasses(classes.category, categoryClass)}>
                {normalized.category}
              </Box>
              {timeLabel && (
                <Typography className={classes.activityTime}>
                  {timeLabel}
                </Typography>
              )}
            </Box>

            <Typography className={classes.activityTitle} component="h3">
              {normalized.title}
            </Typography>

            {normalized.description && (
              <Typography className={classes.activityDescription}>
                {normalized.description}
              </Typography>
            )}

            <Stack className={classes.detailLine} direction="row">
              {normalized.location && (
                <span className={classes.detailItem}>
                  <PlaceIcon className={classes.detailIcon} />
                  {normalized.location}
                </span>
              )}
              {normalized.transport && (
                <span className={classes.detailItem}>
                  <TrainIcon className={classes.trainIcon} />
                  {normalized.transport}
                </span>
              )}
              {normalized.duration && (
                <span className={classes.detailItem}>
                  <AccessTimeIcon className={classes.mutedIcon} />
                  {normalized.duration}
                </span>
              )}
              {normalized.cost && (
                <span className={classes.detailItem}>
                  <PaidIcon className={classes.costIcon} />
                  Estimated: {normalized.cost}
                </span>
              )}
              {normalized.weather && (
                <span className={classes.detailItem}>
                  <WbCloudyIcon className={classes.weatherIcon} />
                  {normalized.weather}
                </span>
              )}
            </Stack>
          </>
        )}
      </Box>

      <Box className={classes.cardActions}>
        <>
          {setDragHandleRef && (
            <Tooltip title="Drag to reorder">
              <IconButton
                aria-label={`Reorder ${normalized.title}`}
                className={mergeClasses(classes.iconButton, classes.dragHandle)}
                ref={setDragHandleRef}
                size="small"
                {...dragHandleAttributes}
                {...dragHandleListeners}
              >
                <DragIndicatorIcon className={classes.dragHandleIcon} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={isRegenerating ? "Regenerating…" : "Edit manually"}>
            <IconButton
              aria-disabled={isRegenerating}
              aria-label="Edit activity"
              className={classes.iconButton}
              onClick={() => {
                if (!isRegenerating) {
                  onEdit(dayIndex, activityIndex, {
                    title: normalized.title,
                    description: normalized.description,
                    location: normalized.location ?? "",
                    price: normalized.cost.replace(/^[$€£¥]/, ""),
                    category: normalized.category,
                    startTime: normalized.time,
                    endTime: resolvedEndTime ?? "",
                  });
                }
              }}
              size="small"
              sx={{ opacity: isRegenerating ? 0.5 : 1 }}
            >
              <EditIcon className={classes.editIcon} />
            </IconButton>
          </Tooltip>
          {onRegenerate && (
            <Tooltip
              title={
                isRegenerating ? "Regenerating…" : "Regenerate this activity"
              }
            >
              <IconButton
                aria-disabled={regenerateDisabled}
                aria-label={`Regenerate ${normalized.title}`}
                className={classes.iconButton}
                onClick={() => {
                  if (!regenerateDisabled) {
                    onRegenerate(dayIndex, activityIndex);
                  }
                }}
                size="small"
                sx={{ opacity: regenerateDisabled ? 0.5 : 1 }}
              >
                <AutoAwesomeIcon className={classes.regenerateIcon} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={isRegenerating ? "Regenerating…" : "Delete activity"}>
            <IconButton
              aria-disabled={isRegenerating}
              aria-label="Delete activity"
              className={classes.iconButton}
              onClick={() => {
                if (!isRegenerating) {
                  setConfirmDeleteOpen(true);
                }
              }}
              size="small"
              sx={{ opacity: isRegenerating ? 0.5 : 1 }}
            >
              <DeleteIcon className={classes.deleteIcon} />
            </IconButton>
          </Tooltip>
        </>
      </Box>

      <ConfirmDialog
        cancelLabel="Cancel"
        confirmLabel="Delete activity"
        description={`This action cannot be undone. "${normalized.title}" will be permanently removed from this day.`}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        open={confirmDeleteOpen}
        title="Delete this activity?"
      />
    </Box>
  );
};

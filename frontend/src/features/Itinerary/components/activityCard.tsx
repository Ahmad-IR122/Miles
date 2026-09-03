import { useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { mergeClasses } from "@griffel/react";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaidIcon from "@mui/icons-material/Paid";
import PlaceIcon from "@mui/icons-material/Place";
import SaveIcon from "@mui/icons-material/Save";
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
  isRegenerating?: boolean;
  onDelete: (dayIndex: number, activityIndex: number) => void;
  onRegenerate?: (dayIndex: number, activityIndex: number) => void;
  onUpdate: (
    dayIndex: number,
    activityIndex: number,
    updates: { title: string; description: string },
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
  isRegenerating = false,
  onDelete,
  onRegenerate,
  onUpdate,
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
    normalized.category === "food"
      ? classes.categoryAmber
      : normalized.category === "dining"
        ? classes.categoryRed
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

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(normalized.title);
  const [draftDescription, setDraftDescription] = useState(
    normalized.description,
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const startEditing = () => {
    setDraftTitle(normalized.title);
    setDraftDescription(normalized.description);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEditing = () => {
    const trimmedTitle = draftTitle.trim();
    onUpdate(dayIndex, activityIndex, {
      title: trimmedTitle === "" ? "Just Chilling" : trimmedTitle,
      description: draftDescription,
    });
    setIsEditing(false);
  };

  const confirmDelete = () => {
    setConfirmDeleteOpen(false);
    onDelete(dayIndex, activityIndex);
  };

  return (
    <Box className={classes.activityCard}>
      <Box className={classes.activityContent}>
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

        {isEditing ? (
          <Stack spacing={1}>
            <TextField
              fullWidth
              label="Title"
              onChange={(e) => setDraftTitle(e.target.value)}
              size="small"
              value={draftTitle}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              onChange={(e) => setDraftDescription(e.target.value)}
              size="small"
              value={draftDescription}
            />
          </Stack>
        ) : (
          <>
            <Typography className={classes.activityTitle} component="h3">
              {isRegenerating ? "Regenerating..." : normalized.title}
            </Typography>

            {normalized.description && (
              <Typography className={classes.activityDescription}>
                {normalized.description}
              </Typography>
            )}
          </>
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
      </Box>

      <Box className={classes.cardActions}>
        {isEditing ? (
          <>
            <Tooltip title="Save changes">
              <IconButton
                aria-label="Save activity"
                className={classes.iconButton}
                onClick={saveEditing}
                size="small"
              >
                <SaveIcon className={classes.editIcon} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel editing">
              <IconButton
                aria-label="Cancel editing"
                className={classes.iconButton}
                onClick={cancelEditing}
                size="small"
              >
                <CloseIcon className={classes.deleteIcon} />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Edit manually">
              <IconButton
                aria-label="Edit activity"
                className={classes.iconButton}
                onClick={startEditing}
                size="small"
              >
                <EditIcon className={classes.editIcon} />
              </IconButton>
            </Tooltip>
            {onRegenerate && (
              <Tooltip title="Regenerate this activity">
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
            <Tooltip title="Delete activity">
              <IconButton
                aria-label="Delete activity"
                className={classes.iconButton}
                onClick={() => setConfirmDeleteOpen(true)}
                size="small"
              >
                <DeleteIcon className={classes.deleteIcon} />
              </IconButton>
            </Tooltip>
          </>
        )}
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

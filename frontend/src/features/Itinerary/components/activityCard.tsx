import { useState } from "react";
import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PlaceIcon from "@mui/icons-material/Place";
import SaveIcon from "@mui/icons-material/Save";
import TrainIcon from "@mui/icons-material/Train";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
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
    duration: activity.duration ?? "",
    description: activity.description ?? "",
    location: activity.location ?? destination,
    transport: activity.transport ?? "",
    cost: activity.cost ?? "",
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

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(normalized.title);
  const [draftDescription, setDraftDescription] = useState(
    normalized.description,
  );

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

  return (
    <Box className={classes.activityCard}>
      <Box className={classes.activityContent}>
        <Box className={classes.activityMeta}>
          <Box className={`${classes.category} ${categoryClass}`}>
            {normalized.category}
          </Box>
          {(normalized.time || normalized.duration) && (
            <Typography className={classes.activityTime}>
              {[normalized.time, normalized.duration]
                .filter(Boolean)
                .join(" · ")}
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
              <LocalFireDepartmentIcon className={classes.costIcon} />
              {normalized.cost}
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
            <IconButton
              aria-label="Save activity"
              className={classes.iconButton}
              onClick={saveEditing}
              size="small"
            >
              <SaveIcon className={classes.editIcon} />
            </IconButton>
            <IconButton
              aria-label="Cancel editing"
              className={classes.iconButton}
              onClick={cancelEditing}
              size="small"
            >
              <CloseIcon className={classes.deleteIcon} />
            </IconButton>
          </>
        ) : (
          <>
            <IconButton
              aria-label="Edit activity"
              className={classes.iconButton}
              onClick={startEditing}
              size="small"
            >
              <EditIcon className={classes.editIcon} />
            </IconButton>
            {onRegenerate && (
              <IconButton
                aria-label={`Regenerate ${normalized.title}`}
                className={classes.iconButton}
                disabled={regenerateDisabled}
                onClick={() => onRegenerate(dayIndex, activityIndex)}
                size="small"
              >
                <AutoAwesomeIcon className={classes.regenerateIcon} />
              </IconButton>
            )}
            <IconButton
              aria-label="Schedule activity"
              className={classes.iconButton}
              size="small"
            >
              <CalendarMonthIcon className={classes.calendarIcon} />
            </IconButton>
            <IconButton
              aria-label="Delete activity"
              className={classes.iconButton}
              onClick={() => onDelete(dayIndex, activityIndex)}
              size="small"
            >
              <DeleteIcon className={classes.deleteIcon} />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

import { Box, IconButton, Stack, Typography } from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PlaceIcon from "@mui/icons-material/Place";
import TrainIcon from "@mui/icons-material/Train";
import WbCloudyIcon from "@mui/icons-material/WbCloudy";
import type { Activity } from "../pages/Itinerary";
import { useItineraryStyles } from "../styles/Itinerary.styles";

type ActivityCardProps = {
  activity: Activity;
  activityIndex: number;
  dayNumber: number;
  destination?: string;
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
    category: activity.category ?? ["culture", "food", "dining"][activityIndex % 3],
    time: activity.time ?? "",
    duration: activity.duration ?? "",
    description: activity.description ?? "",
    location: activity.location ?? destination,
    transport: activity.transport ?? "",
    cost: activity.cost ?? "",
    weather: activity.weather ?? "",
  };
};

export function ActivityCard({
  activity,
  activityIndex,
  dayNumber,
  destination,
}: ActivityCardProps) {
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
          : "";

  return (
    <Box className={classes.activityCard}>
      <Box className={classes.activityContent}>
        <Box className={classes.activityMeta}>
          <Box className={`${classes.category} ${categoryClass}`}>
            {normalized.category}
          </Box>
          {(normalized.time || normalized.duration) && (
            <Typography className={classes.activityTime}>
              {[normalized.time, normalized.duration].filter(Boolean).join(" · ")}
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
        <IconButton
          aria-label="Edit activity"
          className={classes.iconButton}
          size="small"
        >
          <EditIcon className={classes.editIcon} />
        </IconButton>
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
          size="small"
        >
          <DeleteIcon className={classes.deleteIcon} />
        </IconButton>
      </Box>
    </Box>
  );
}

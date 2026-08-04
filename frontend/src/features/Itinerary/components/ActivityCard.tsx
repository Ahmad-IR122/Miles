import { Box, IconButton, Stack, Typography } from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PlaceIcon from "@mui/icons-material/Place";
import type { Activity } from "../pages/Itinerary";
import { useItineraryStyles } from "../styles/Itinerary.styles";

type ActivityCardProps = {
  activity: Activity;
  activityIndex: number;
  dayNumber: number;
  destination?: string;
};

export function ActivityCard({
  activity,
  activityIndex,
  dayNumber,
  destination,
}: ActivityCardProps) {
  const classes = useItineraryStyles();
  const categoryClass =
    activityIndex % 3 === 1
      ? classes.categoryBlue
      : activityIndex % 3 === 2
        ? classes.categoryOrange
        : "";

  return (
    <Box className={classes.activityCard}>
      <Box>
        <Box className={classes.activityMeta}>
          <Box className={`${classes.category} ${categoryClass}`}>Activity</Box>
        </Box>

        <Typography className={classes.activityTitle} component="h3">
          {activity}
        </Typography>

        {destination && (
          <Stack className={classes.detailLine} direction="row">
            <span className={classes.detailItem}>
              <PlaceIcon className={classes.detailIcon} />
              {destination}
            </span>
            <span className={classes.detailItem}>
              <CalendarMonthIcon className={classes.calendarIcon} />
              Day {dayNumber}
            </span>
          </Stack>
        )}
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

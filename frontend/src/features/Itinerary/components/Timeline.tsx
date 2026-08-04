import { Box } from "@mui/material";

import PlaceIcon from "@mui/icons-material/Place";
import type { Day } from "../pages/Itinerary";
import { useItineraryStyles } from "../styles/Itinerary.styles";
import { ActivityCard } from "./ActivityCard";

type TimelineProps = {
  day: Day;
  destination?: string;
};

export function Timeline({ day, destination }: TimelineProps) {
  const classes = useItineraryStyles();

  return (
    <Box className={classes.timeline}>
      <Box className={classes.connector} />
      {(day.activities ?? []).map((activity, activityIndex) => {
        const markerClass =
          activityIndex % 3 === 1
            ? classes.markerBlue
            : activityIndex % 3 === 2
              ? classes.markerOrange
              : classes.markerGreen;

        return (
          <Box className={classes.activityRow} key={activityIndex}>
            <Box className={`${classes.marker} ${markerClass}`}>
              <PlaceIcon fontSize="small" />
            </Box>

            <ActivityCard
              activity={activity}
              activityIndex={activityIndex}
              dayNumber={day.day}
              destination={destination}
            />
          </Box>
        );
      })}
    </Box>
  );
}

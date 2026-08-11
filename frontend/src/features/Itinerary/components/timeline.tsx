import { Box } from "@mui/material";

import ApartmentIcon from "@mui/icons-material/Apartment";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import PaletteIcon from "@mui/icons-material/Palette";
import PlaceIcon from "@mui/icons-material/Place";
import RamenDiningIcon from "@mui/icons-material/RamenDining";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import TempleBuddhistIcon from "@mui/icons-material/TempleBuddhist";
import { useItineraryStyles } from "../styles/itinerary.styles";
import type { Activity, Day } from "../types/itinerary.types";
import { ActivityCard } from "./activityCard";

type TimelineProps = {
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

const getActivityIcon = (activity: Activity) =>
  typeof activity === "string" ? undefined : activity.icon;

const MarkerIcon = ({
  className,
  icon,
}: {
  className: string;
  icon?: string;
}) => {
  switch (icon) {
  case "torii":
    return <TempleBuddhistIcon className={className} />;
  case "sushi":
    return <RestaurantIcon className={className} />;
  case "building":
    return <ApartmentIcon className={className} />;
  case "ramen":
    return <RamenDiningIcon className={className} />;
  case "nature":
    return <LocalFloristIcon className={className} />;
  case "art":
    return <PaletteIcon className={className} />;
  default:
    return <PlaceIcon className={className} />;
  }
};

export const Timeline = ({
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

  return (
    <Box className={classes.timeline}>
      <Box className={classes.connector} />
      {(day.activities ?? []).map((activity, activityIndex) => {
        const icon = getActivityIcon(activity);
        const markerClass =
          icon === "torii"
            ? classes.markerPurple
            : icon === "sushi"
              ? classes.markerOrange
              : icon === "building"
                ? classes.markerCyan
                : icon === "ramen"
                  ? classes.markerRed
                  : icon === "nature"
                    ? classes.markerGreen
                    : icon === "art"
                      ? classes.markerBlue
                      : classes.markerBlue;

        return (
          <Box className={classes.activityRow} key={activityIndex}>
            <Box className={`${classes.marker} ${markerClass}`}>
              <MarkerIcon className={classes.markerIcon} icon={icon} />
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

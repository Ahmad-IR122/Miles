import { Box, Typography } from "@mui/material";

import type { TripDestination } from "../../../types/trip";
import { useItineraryStyles } from "../styles/itinerary.styles";
import type { Activity } from "../types/itinerary.types";

type ItineraryHeaderProps = {
  destination?: string;
  destinations?: TripDestination[];
  activeDayActivities?: Activity[];
};

const getLocation = (activity?: Activity) =>
  typeof activity === "string" ? undefined : activity?.location;

const matchDestination = (
  location: string | undefined,
  destinations: TripDestination[],
) => {
  if (!location) return undefined;
  const haystack = location.toLowerCase();
  return destinations.find(
    (candidate) =>
      candidate.city && haystack.includes(candidate.city.toLowerCase()),
  );
};

export const ItineraryHeader = ({
  destination,
  destinations,
  activeDayActivities,
}: ItineraryHeaderProps) => {
  const classes = useItineraryStyles();

  if (destinations && destinations.length > 0) {
    const firstActivityLocation = getLocation(activeDayActivities?.[0]);
    const current =
      matchDestination(firstActivityLocation, destinations) ?? destinations[0];
    const restCities = destinations
      .filter((candidate) => candidate !== current)
      .map((candidate) => candidate.city || candidate.country)
      .filter(Boolean);

    return (
      <Box className={classes.header}>
        <Box>
          <Typography className={classes.titleCountry} component="h1">
            {current.city
              ? `${current.country} • ${current.city}`
              : current.country}
          </Typography>
          {restCities.length > 0 && (
            <Typography className={classes.titleCity} component="p">
              {restCities.join(" • ")}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // Fallback for fixture data / legacy itineraries that only carry a flat
  // "City, Country" string instead of a structured destinations list.
  const [city, country] = (destination ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <Box className={classes.header}>
      <Box>
        <Typography className={classes.titleCountry} component="h1">
          {country ?? city}
        </Typography>
        {country && (
          <Typography className={classes.titleCity} component="p">
            {city}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

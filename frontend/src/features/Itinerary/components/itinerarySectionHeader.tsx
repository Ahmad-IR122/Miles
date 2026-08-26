import { Box, Typography } from "@mui/material";

import { useItineraryStyles } from "../styles/itinerary.styles";

type ItinerarySectionHeaderProps = {
  dateLabel?: string;
  dayNumber: number;
};

export const ItinerarySectionHeader = ({
  dateLabel,
  dayNumber,
}: ItinerarySectionHeaderProps) => {
  const classes = useItineraryStyles();

  return (
    <Box className={classes.sectionBar}>
      <Typography className={classes.sectionTitle} component="h2">
        Day {dayNumber}
        {dateLabel ? ` - ${dateLabel}` : ""}
      </Typography>
    </Box>
  );
};

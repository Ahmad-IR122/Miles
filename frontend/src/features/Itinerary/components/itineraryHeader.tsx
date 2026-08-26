import { Box, Typography } from "@mui/material";

import { useItineraryStyles } from "../styles/itinerary.styles";

type ItineraryHeaderProps = {
  destination?: string;
};

export const ItineraryHeader = ({ destination }: ItineraryHeaderProps) => {
  const classes = useItineraryStyles();

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

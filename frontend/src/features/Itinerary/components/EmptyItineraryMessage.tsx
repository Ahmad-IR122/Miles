import { Box, Typography } from "@mui/material";
import { useItineraryStyles } from "../styles/Itinerary.styles";

type EmptyItineraryMessageProps = {
  message: string;
};

export const EmptyItineraryMessage = ({
  message,
}: EmptyItineraryMessageProps) => {
  const classes = useItineraryStyles();

  return (
    <Box className={classes.emptyState}>
      <Typography className={classes.emptyTitle} component="h2">
        Itinerary unavailable
      </Typography>
      <Typography className={classes.emptyMessage}>{message}</Typography>
    </Box>
  );
};

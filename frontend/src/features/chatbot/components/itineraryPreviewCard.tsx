import { Box, Button, Paper, Typography } from "@mui/material";

import { useChatbotStyles } from "../styles/chatbot.styles";
import type { ItineraryPreview } from "../types/chatbot.types";

type ItineraryPreviewCardProps = {
  itinerary: ItineraryPreview;
};

export const ItineraryPreviewCard = ({
  itinerary,
}: ItineraryPreviewCardProps) => {
  const classes = useChatbotStyles();
  const title = itinerary.tripTitle || itinerary.title || itinerary.destination;
  const image = itinerary.imageUrl || itinerary.image;
  const meta = [
    itinerary.destination,
    itinerary.duration,
    ...(itinerary.cities ?? []),
    ...(itinerary.interests ?? []),
  ].filter(Boolean);

  return (
    <Paper className={classes.previewCard} elevation={0}>
      {image && (
        <Box
          component="img"
          className={classes.previewImage}
          src={image}
          alt=""
        />
      )}
      <Box className={classes.previewBody}>
        {title && (
          <Typography className={classes.previewTitle}>{title}</Typography>
        )}
        {meta.length > 0 && (
          <Box className={classes.previewMeta}>
            {meta.map((item) => (
              <Box className={classes.pill} key={item}>
                {item}
              </Box>
            ))}
          </Box>
        )}
        {itinerary.itineraryUrl && (
          <Button
            className={classes.previewButton}
            href={itinerary.itineraryUrl}
          >
            View itinerary
          </Button>
        )}
      </Box>
    </Paper>
  );
};

import { Box, Button, Typography } from "@mui/material";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useItineraryStyles } from "../styles/Itinerary.styles";

type ItineraryHeaderProps = {
  budget?: string;
  dateRange: string;
  daysCount: number;
  destination?: string;
  travelers?: number;
};

export const ItineraryHeader = ({
  budget,
  dateRange,
  daysCount,
  destination,
  travelers,
}: ItineraryHeaderProps) => {
  const classes = useItineraryStyles();

  return (
    <Box className={classes.header}>
      <Box>
        <Box className={classes.titleRow}>
          <FlightTakeoffIcon className={classes.planeIcon} />
          <Typography className={classes.title} component="h1">
            {destination}
          </Typography>
          <Box className={classes.generatedBadge}>AI Generated</Box>
        </Box>

        {dateRange && (
          <Typography className={classes.subtitle}>
            {dateRange} · {daysCount} days
            {travelers ? ` · ${travelers} travelers` : ""}
            {budget ? ` · Budget: ${budget}` : ""}
          </Typography>
        )}
      </Box>

      <Box className={classes.headerActions}>
        <Button
          className={`${classes.button} ${classes.ghostButton}`}
          startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
          variant="contained"
        >
          Share
        </Button>
        <Button
          className={`${classes.button} ${classes.primaryButton}`}
          startIcon={<SaveOutlinedIcon fontSize="small" />}
          variant="contained"
        >
          Save Trip
        </Button>
      </Box>
    </Box>
  );
};

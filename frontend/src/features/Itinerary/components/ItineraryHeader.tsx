import { Box, Button, Typography } from "@mui/material";

import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useItineraryStyles } from "../styles/Itinerary.styles";

type ItineraryHeaderProps = {
  dateRange: string;
  daysCount: number;
  destination?: string;
};

export function ItineraryHeader({
  dateRange,
  daysCount,
  destination,
}: ItineraryHeaderProps) {
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
}

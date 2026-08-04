import { Box, Button, Typography } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useItineraryStyles } from "../styles/Itinerary.styles";

type ItinerarySectionHeaderProps = {
  dayNumber: number;
};

export function ItinerarySectionHeader({
  dayNumber,
}: ItinerarySectionHeaderProps) {
  const classes = useItineraryStyles();

  return (
    <Box className={classes.sectionBar}>
      <Typography className={classes.sectionTitle} component="h2">
        Day {dayNumber}
      </Typography>

      <Box className={classes.sectionActions}>
        <Button
          className={`${classes.compactButton} ${classes.ghostButton}`}
          startIcon={<AddIcon fontSize="small" />}
          variant="contained"
        >
          Add Activity
        </Button>
        <Button
          className={`${classes.compactButton} ${classes.outlineBlueButton}`}
          startIcon={<AutoAwesomeIcon fontSize="small" />}
          variant="contained"
        >
          Regenerate Day
        </Button>
      </Box>
    </Box>
  );
}

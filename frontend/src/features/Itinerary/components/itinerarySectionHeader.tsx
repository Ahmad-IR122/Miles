import { Box, Button, Typography } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useItineraryStyles } from "../styles/itinerary.styles";

type ItinerarySectionHeaderProps = {
  dateLabel?: string;
  dayNumber: number;
  isRegenerating?: boolean;
  onRegenerateDay?: () => void;
  regenerateDisabled?: boolean;
};

export const ItinerarySectionHeader = ({
  dateLabel,
  dayNumber,
  isRegenerating = false,
  onRegenerateDay,
  regenerateDisabled = false,
}: ItinerarySectionHeaderProps) => {
  const classes = useItineraryStyles();

  return (
    <Box className={classes.sectionBar}>
      <Typography className={classes.sectionTitle} component="h2">
        Day {dayNumber}
        {dateLabel ? ` - ${dateLabel}` : ""}
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
          disabled={regenerateDisabled}
          onClick={onRegenerateDay}
          startIcon={
            <AutoAwesomeIcon
              className={classes.regenerateIcon}
              fontSize="small"
            />
          }
          variant="contained"
        >
          {isRegenerating ? "Regenerating..." : "Regenerate Day"}
        </Button>
      </Box>
    </Box>
  );
};

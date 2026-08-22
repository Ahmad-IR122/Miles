import { Typography } from "@mui/material";

import { useSavedTripsStyles } from "../styles/savedTrips.styles";
import {
  typographyPresets,
  typography,
} from "../../../common/theme/typography";
import { semanticColors } from "../../../common/theme/colors";

type SavedTripsHeaderProps = {
  count: number;
};

const SavedTripsHeader = ({ count }: SavedTripsHeaderProps) => {
  const styles = useSavedTripsStyles();

  return (
    <div className={styles.header}>
      <div>
        <Typography
          component="h1"
          className={styles.title}
          sx={{
            ...typographyPresets.h2,
            margin: 0,
            marginBottom: "7px",
            color: semanticColors.textPrimary,
          }}
        >
          My Trips
        </Typography>
        <Typography
          component="p"
          className={styles.subtitle}
          sx={{
            fontSize: typography.fontSize.size4,
            color: semanticColors.textSecondary,
            margin: `${typography.lineHeight.tight} 0 0`,
          }}
        >
          Your saved and past itineraries, all in one place. Pick a trip to see
          the full day-by-day plan.
        </Typography>
      </div>

      {count > 0 && (
        <div className={styles.countBadge}>
          {count} {count === 1 ? "trip" : "trips"} saved
        </div>
      )}
    </div>
  );
};

export default SavedTripsHeader;

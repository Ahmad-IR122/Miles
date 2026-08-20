import { mergeClasses } from "@griffel/react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

import { formatDateRange } from "../../Itinerary/utils/dateUtils";
import { useSavedTripsStyles } from "../styles/savedTrips.styles";
import type { SavedTrip } from "../types/savedTrips.types";
import { tripStatusLabels } from "../utils/tripStatus";

type TripCardProps = {
  trip: SavedTrip;
};

const statusClassMap = {
  upcoming: "statusUpcoming",
  ongoing: "statusOngoing",
  completed: "statusCompleted",
} as const;

const getTripDays = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  const difference = end.getTime() - start.getTime();

  return Math.max(1, Math.ceil(difference / (1000 * 60 * 60 * 24)));
};

const TripCard = ({ trip }: TripCardProps) => {
  const styles = useSavedTripsStyles();

  const dateRange = formatDateRange(trip.start_date, trip.end_date);
  const daysCount = getTripDays(trip.start_date, trip.end_date);

  return (
    <div className={styles.card}>
      <div className={styles.banner}>
        <FlightTakeoffRoundedIcon className={styles.bannerIcon} />

        <span
          className={mergeClasses(
            styles.statusPill,
            styles[statusClassMap[trip.status]],
          )}
        >
          {tripStatusLabels[trip.status]}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.destination}>
          {trip.destination ?? "Untitled trip"}
        </h3>

        {dateRange && <p className={styles.dateRange}>{dateRange}</p>}

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <CalendarMonthOutlinedIcon className={styles.metaIcon} />
            {daysCount} {daysCount === 1 ? "day" : "days"}
          </span>

          <span className={styles.metaItem}>
            <GroupsOutlinedIcon className={styles.metaIcon} />
            {trip.travelers_count}{" "}
            {trip.travelers_count === 1 ? "traveler" : "travelers"}
          </span>
        </div>

        <div className={styles.cardFooter}>
          <span>View full itinerary</span>

          <ArrowForwardRoundedIcon
            fontSize="small"
            className={styles.cardFooterArrow}
          />
        </div>
      </div>
    </div>
  );
};

export default TripCard;

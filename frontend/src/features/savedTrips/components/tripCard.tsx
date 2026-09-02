import { useState } from "react";
import { mergeClasses } from "@griffel/react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { Link } from "react-router-dom";

import ConfirmDialog from "../../../common/confirmDialog/confirmDialog";
import { formatDateRange } from "../../Itinerary/utils/dateUtils";
import { formatTripDestinations } from "../../../types/trip";
import { useSavedTripsStyles } from "../styles/savedTrips.styles";
import type { SavedTrip } from "../types/savedTrips.types";
import { tripStatusLabels } from "../utils/tripStatus";
import { buildItineraryDetailPath } from "../../../routes/routesPaths";

type TripCardProps = {
  trip: SavedTrip;
  isDeleting?: boolean;
  onDelete: (tripId: number) => void;
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

const TripCard = ({ trip, isDeleting = false, onDelete }: TripCardProps) => {
  const styles = useSavedTripsStyles();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const dateRange = formatDateRange(trip.start_date, trip.end_date);
  const daysCount = getTripDays(trip.start_date, trip.end_date);
  const tripLabel = formatTripDestinations(trip.destinations) || "trip";

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    onDelete(trip.id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.banner}>
        <button
          type="button"
          className={styles.deleteButton}
          aria-label={`Delete ${tripLabel}`}
          disabled={isDeleting}
          onClick={() => setConfirmOpen(true)}
        >
          <DeleteOutlineRoundedIcon className={styles.deleteIcon} />
        </button>

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
          {formatTripDestinations(trip.destinations) || "Untitled trip"}
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

        <Link
          to={buildItineraryDetailPath(trip.id)}
          className={styles.cardFooter}
        >
          <span>View full itinerary</span>

          <ArrowForwardRoundedIcon
            fontSize="small"
            className={styles.cardFooterArrow}
          />
        </Link>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this trip?"
        description={`This action cannot be undone. "${tripLabel}" will be permanently removed.`}
        confirmLabel="Delete trip"
        confirmingLabel="Deleting…"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default TripCard;

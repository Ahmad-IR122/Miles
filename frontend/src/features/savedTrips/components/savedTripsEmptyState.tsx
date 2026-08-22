import { useNavigate } from "react-router-dom";

import { routesPaths } from "../../../routes/routesPaths";
import { useSavedTripsStyles } from "../styles/savedTrips.styles";

type SavedTripsEmptyStateProps = {
  message?: string;
};

const SavedTripsEmptyState = ({ message }: SavedTripsEmptyStateProps) => {
  const styles = useSavedTripsStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>✈️</div>

      <div className={styles.emptyTitle}>No saved trips yet</div>

      <div className={styles.emptySubtitle}>
        {message ??
          "Plan a trip and it'll show up here so you can revisit the itinerary anytime."}
      </div>

      <button
        className={styles.emptyCta}
        type="button"
        onClick={() => navigate(routesPaths.planTrip)}
      >
        Plan Your Trip
      </button>
    </div>
  );
};

export default SavedTripsEmptyState;

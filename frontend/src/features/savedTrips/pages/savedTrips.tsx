import SavedTripsEmptyState from "../components/savedTripsEmptyState";
import SavedTripsHeader from "../components/savedTripsHeader";
import TripCard from "../components/tripCard";
import { LoadingSprite } from "../../../components/loadingSprite/loadingSprite";
import { useSavedTrips } from "../hooks/useSavedTrips";
import { useSavedTripsStyles } from "../styles/savedTrips.styles";

const SavedTrips = () => {
  const styles = useSavedTripsStyles();

  const { trips, loading, errorMessage } = useSavedTrips();

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <LoadingSprite className={styles.loadingSprite} />

          <div className={styles.loadingMessage}>
            Loading your saved trips...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <SavedTripsHeader count={trips.length} />

        {trips.length === 0 ? (
          <SavedTripsEmptyState message={errorMessage || undefined} />
        ) : (
          <div className={styles.grid}>
            {trips.map((trip) => (
              <TripCard key={trip.id ?? trip.destination} trip={trip} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedTrips;

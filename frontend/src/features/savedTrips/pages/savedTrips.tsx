import SavedTripsEmptyState from "../components/savedTripsEmptyState";
import SavedTripsHeader from "../components/savedTripsHeader";
import TripCard from "../components/tripCard";
import { LoadingScreen } from "../../../components/loadingScreen/loadingScreen";
import { useSavedTrips } from "../hooks/useSavedTrips";
import { useSavedTripsStyles } from "../styles/savedTrips.styles";

const SavedTrips = () => {
  const styles = useSavedTripsStyles();

  const { trips, loading, errorMessage } = useSavedTrips();

  if (loading) {
    return (
      <LoadingScreen
        ariaLabel="Saved trips loading progress"
        title="Loading your saved trips..."
      />
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

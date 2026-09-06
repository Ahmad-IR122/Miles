import { useAuth } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";

import { deleteTrip, getTrips } from "../../../api/trip";
import type { SavedTrip } from "../types/savedTrips.types";
import { withTripStatus } from "../utils/tripStatus";

const savedTripsLoadError = "We couldn't load your saved trips";

export const useSavedTrips = () => {
  const { getToken, isSignedIn } = useAuth();

  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingTripIds, setDeletingTripIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchSavedTrips = async () => {
      if (!isSignedIn) {
        setTrips([]);
        setLoading(false);
        return;
      }

      try {
        // Get trips belonging to this user
        const response = await getTrips();

        // Add calculated status
        const tripsWithStatus = withTripStatus(response.data);

        setTrips(tripsWithStatus);
        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching saved trips:", error);
        setErrorMessage(savedTripsLoadError);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedTrips();
  }, [getToken, isSignedIn]);

  const handleDeleteTrip = async (tripId: number) => {
    const tripToDelete = trips.find((trip) => trip.id === tripId);

    if (!tripToDelete) {
      return;
    }

    setDeletingTripIds((currentIds) => [...currentIds, tripId]);
    setTrips((currentTrips) =>
      currentTrips.filter((trip) => trip.id !== tripId),
    );

    try {
      await deleteTrip({ tripId });
      setErrorMessage("");
    } catch (error) {
      console.error("Error deleting trip:", error);
      setTrips((currentTrips) =>
        withTripStatus([...currentTrips, tripToDelete]),
      );
      setErrorMessage("We couldn't delete that trip. Please try again.");
    } finally {
      setDeletingTripIds((currentIds) =>
        currentIds.filter((currentId) => currentId !== tripId),
      );
    }
  };

  const sortedTrips = useMemo(
    () =>
      [...trips].sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      ),
    [trips],
  );

  return {
    trips: sortedTrips,
    loading,
    errorMessage,
    deletingTripIds,
    handleDeleteTrip,
  };
};

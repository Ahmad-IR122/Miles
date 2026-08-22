import { useAuth } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";

import { getTrips } from "../../../api/trip";
import type { SavedTrip } from "../types/savedTrips.types";
import { withTripStatus } from "../utils/tripStatus";

const savedTripsLoadError = "We couldn't load your saved trips";

export const useSavedTrips = () => {
  const { getToken, isSignedIn } = useAuth();

  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

  const sortedTrips = useMemo(
    () =>
      [...trips].sort((a, b) => {
        const statusOrder = {
          ongoing: 0,
          upcoming: 1,
          completed: 2,
        } as const;

        const statusDifference = statusOrder[a.status] - statusOrder[b.status];

        if (statusDifference !== 0) {
          return statusDifference;
        }

        return (
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
      }),
    [trips],
  );

  return {
    trips: sortedTrips,
    loading,
    errorMessage,
  };
};

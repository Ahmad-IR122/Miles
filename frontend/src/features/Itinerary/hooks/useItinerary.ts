import { useEffect, useState } from "react";
import { api } from "../../../api/api";
import type { Trip } from "../types/itinerary.types";

const itineraryLoadError =
  "We couldn't load the itinerary. Please check that the backend is running and try again.";

export const useItinerary = () => {
  const [itineraries, setItineraryData] = useState<Trip[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await api.get("/itinerary");
        const payload = response?.data?.data ?? response?.data ?? [];
        setItineraryData(Array.isArray(payload) ? payload : []);
        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching itinerary data:", error);
        setErrorMessage(itineraryLoadError);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, []);

  return {
    errorMessage,
    itineraries,
    loading,
  };
};

import { useEffect, useState } from "react";
import { api } from "../../../api/api";
import type { Activity, Trip } from "../types/itinerary.types";

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

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    updates: { title: string; description: string },
  ) => {
    setItineraryData((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      const [trip, ...rest] = prev;
      const days = trip.days ?? [];
      const updatedDays = days.map((day, dIdx) => {
        if (dIdx !== dayIndex) {
          return day;
        }

        const activities: Activity[] = day.activities.map((activity, aIdx) => {
          if (aIdx !== activityIndex) {
            return activity;
          }

          const base =
            typeof activity === "string" ? { title: activity } : activity;
          return {
            ...base,
            title: updates.title,
            description: updates.description,
          };
        });

        return { ...day, activities };
      });

      return [{ ...trip, days: updatedDays }, ...rest];
    });
  };

  const deleteActivity = (dayIndex: number, activityIndex: number) => {
    setItineraryData((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      const [trip, ...rest] = prev;
      const days = trip.days ?? [];
      const updatedDays = days.map((day, dIdx) => {
        if (dIdx !== dayIndex) {
          return day;
        }

        return {
          ...day,
          activities: day.activities.filter(
            (_, aIdx) => aIdx !== activityIndex,
          ),
        };
      });

      return [{ ...trip, days: updatedDays }, ...rest];
    });
  };

  return {
    errorMessage,
    itineraries,
    loading,
    updateActivity,
    deleteActivity,
  };
};

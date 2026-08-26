import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../../api/api";
import {
  regenerateActivity,
  regenerateDay,
  regenerateTrip,
} from "../../../api/itinerary";
import { useRegenerate } from "../../../hooks/useRegenerate";
import type { GeneratedItinerary } from "../../../types/itinerary";
import type { Trip as ApiTrip } from "../../../types/trip";
import type { Activity, Trip } from "../types/itinerary.types";
import {
  adaptGeneratedItinerary,
  adaptItineraries,
  adaptItinerary,
} from "../utils/adaptItinerary";

const itineraryLoadError =
  "We couldn't load the itinerary. Please check that the backend is running and try again.";

type LocationState = { trip?: ApiTrip; itinerary?: GeneratedItinerary } | null;

export const useItinerary = () => {
  const location = useLocation();
  const state = (location.state ?? null) as LocationState;
  const hasGenerated = !!(state?.trip && state?.itinerary);

  const [itineraries, setItineraryData] = useState<Trip[]>(
    hasGenerated
      ? [adaptGeneratedItinerary(state!.trip!, state!.itinerary!)]
      : [],
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(!hasGenerated);

  useEffect(() => {
    if (hasGenerated) {
      return;
    }

    const fetchItinerary = async () => {
      try {
        const response = await api.get("/itinerary");
        const payload = response?.data?.data ?? response?.data ?? [];
        setItineraryData(
          Array.isArray(payload) ? adaptItineraries(payload) : [],
        );
        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching itinerary data:", error);
        setErrorMessage(itineraryLoadError);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regenerate = useRegenerate((updated) => {
    const adapted = adaptItinerary(updated);
    setItineraryData((prev) =>
      prev.map((trip) => (trip.id === adapted.id ? adapted : trip)),
    );
  });

  const trip = itineraries[0];

  const regenerateWholeTrip = () => {
    if (!trip?.id) {
      return;
    }
    const tripId = trip.id;
    regenerate.run({ scope: "trip", id: tripId }, () => regenerateTrip(tripId));
  };

  const regenerateSingleDay = (dayIndex: number) => {
    const day = trip?.days?.[dayIndex];
    if (!trip?.id || !day) {
      return;
    }
    const tripId = trip.id;
    regenerate.run({ scope: "day", id: day.id ?? String(day.day) }, () =>
      regenerateDay(tripId, day.day),
    );
  };

  const regenerateSingleActivity = (
    dayIndex: number,
    activityIndex: number,
  ) => {
    const day = trip?.days?.[dayIndex];
    const activity = day?.activities?.[activityIndex];
    const activityId = typeof activity === "string" ? undefined : activity?.id;

    if (!trip?.id || !day || !activityId) {
      return;
    }
    const tripId = trip.id;
    regenerate.run({ scope: "activity", id: activityId }, () =>
      regenerateActivity(tripId, day.day, activityId),
    );
  };

  const updateActivity = (
    dayIndex: number,
    activityIndex: number,
    updates: { title: string; description: string },
  ) => {
    setItineraryData((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      const [first, ...rest] = prev;
      const days = first.days ?? [];
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

      return [{ ...first, days: updatedDays }, ...rest];
    });
  };

  const deleteActivity = (dayIndex: number, activityIndex: number) => {
    setItineraryData((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      const [first, ...rest] = prev;
      const days = first.days ?? [];
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

      return [{ ...first, days: updatedDays }, ...rest];
    });
  };

  return {
    clearRegenerateError: regenerate.clearError,
    deleteActivity,
    errorMessage,
    isRegenerating: regenerate.isRegenerating,
    itineraries,
    loading,
    regenerateBusy: regenerate.isBusy,
    regenerateError: regenerate.error,
    regenerateSingleActivity,
    regenerateSingleDay,
    regenerateWholeTrip,
    updateActivity,
  };
};

import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  addActivity,
  getItineraryByTripId,
  getUpcomingItinerary,
  regenerateActivity,
  regenerateDay,
  regenerateTrip,
} from "../../../api/itinerary";
import { getTripById } from "../../../api/trip";
import { useRegenerate } from "../../../hooks/useRegenerate";
import type { GeneratedItinerary } from "../../../types/itinerary";
import type { Trip as ApiTrip } from "../../../types/trip";
import type { Activity, Trip } from "../types/itinerary.types";
import {
  adaptGeneratedDays,
  adaptGeneratedItinerary,
} from "../utils/adaptItinerary";

const itineraryLoadError =
  "We couldn't load the itinerary. Please check that the backend is running and try again.";

type LocationState = { trip?: ApiTrip; itinerary?: GeneratedItinerary } | null;

export const useItinerary = () => {
  const location = useLocation();
  const { itineraryId } = useParams<{ itineraryId: string }>();
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
      setLoading(true);
      try {
        // itineraryId here is actually a trip id (see api/itinerary.ts +
        // backend /itinerary/by-trip/{trip_id} route). When there's no
        // param at all (top-nav "Itinerary" page), fall back to whichever
        // trip is soonest via /itinerary/upcoming.
        const response = itineraryId
          ? await getItineraryByTripId(Number(itineraryId))
          : await getUpcomingItinerary();

        const generated: GeneratedItinerary = response.data;

        // GeneratedItinerary only carries trip_id, not the full trip
        // (destination, dates, travelers, budget, etc) — fetch the trip
        // separately and reuse the same adapter the generate flow uses,
        // so both paths build an identical Trip shape.
        const tripResponse = await getTripById(generated.trip_id);
        const tripData: ApiTrip = tripResponse.data;

        setItineraryData([adaptGeneratedItinerary(tripData, generated)]);
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
  }, [itineraryId]);

  const regenerate = useRegenerate((updated) => {
    setItineraryData((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const [first, ...rest] = prev;
      return [
        {
          ...first,
          id: String(updated.id),
          days: adaptGeneratedDays(updated.days),
        },
        ...rest,
      ];
    });
  });

  const trip = itineraries[0];

  const regenerateWholeTrip = () => {
    if (!trip?.id) {
      return;
    }
    const tripId = trip.id;
    regenerate.run({ scope: "trip", id: tripId }, () =>
      regenerateTrip(Number(tripId)),
    );
  };

  const regenerateSingleDay = (dayIndex: number) => {
    const day = trip?.days?.[dayIndex];
    if (!trip?.id || !day) {
      return;
    }
    const tripId = trip.id;
    regenerate.run({ scope: "day", id: day.id ?? String(day.day) }, () =>
      regenerateDay(Number(tripId), day.day),
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
      regenerateActivity(Number(tripId), day.day, Number(activityId)),
    );
  };

  const addActivityToDay = (dayIndex: number) => {
    const day = trip?.days?.[dayIndex];
    if (!trip?.id || !day) {
      return;
    }
    const tripId = trip.id;
    regenerate.run({ scope: "add", id: day.id ?? String(day.day) }, () =>
      addActivity(Number(tripId), day.day, { name: "New Activity" }),
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
    addActivityToDay,
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

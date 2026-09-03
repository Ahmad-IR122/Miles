import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  addActivity,
  deleteActivity as deleteActivityRequest,
  getItineraryByTripId,
  getUpcomingItinerary,
  regenerateActivity,
  regenerateDay,
  regenerateTrip,
  updateActivity as updateActivityRequest,
} from "../../../api/itinerary";
import { getTripById } from "../../../api/trip";
import { useRegenerate } from "../../../hooks/useRegenerate";
import type { GeneratedItinerary } from "../../../types/itinerary";
import type { Trip as ApiTrip } from "../../../types/trip";
import type { Activity, Trip } from "../types/itinerary.types";

const formatActivityTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

const activityTimeToMinutes = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return undefined;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (match[3]) {
    hours %= 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
  }
  return hours * 60 + minutes;
};

const sortActivitiesByTime = (activities: Activity[]) =>
  [...activities].sort((left, right) => {
    const leftTime =
      typeof left === "string" ? undefined : activityTimeToMinutes(left.time);
    const rightTime =
      typeof right === "string" ? undefined : activityTimeToMinutes(right.time);
    if (leftTime === undefined && rightTime === undefined) return 0;
    if (leftTime === undefined) return 1;
    if (rightTime === undefined) return -1;
    return leftTime - rightTime;
  });
import {
  adaptGeneratedDays,
  adaptGeneratedItinerary,
} from "../utils/adaptItinerary";

const itineraryLoadError =
  "We couldn't load your itinerary. Please try again in a moment.";

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
  const [activityError, setActivityError] = useState("");

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
        // A 404 here means the user simply has no trip/itinerary yet -
        // that's a normal empty state, not an error. Leave errorMessage
        // unset so the page falls back to the "create a trip" message
        // instead of implying something is broken.
        if (isAxiosError(error) && error.response?.status === 404) {
          setItineraryData([]);
          setErrorMessage("");
        } else {
          console.error("Error fetching itinerary data:", error);
          setErrorMessage(itineraryLoadError);
        }
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

  const addActivityToDay = (
    dayIndex: number,
    activity: {
      name: string;
      description: string;
      location_name: string;
      estimated_cost?: number;
      category: string;
      start_time: string;
      end_time: string;
    },
  ) => {
    const day = trip?.days?.[dayIndex];
    if (!trip?.id || !day) {
      return;
    }
    const tripId = trip.id;
    regenerate.run({ scope: "add", id: day.id ?? String(day.day) }, () =>
      addActivity(Number(tripId), day.day, activity),
    );
  };

  // Applies an activity-level change (edit or delete) to local state and
  // returns the previous day's activities, so callers can roll back if the
  // backend request that's supposed to persist the change fails.
  const applyActivityChange = (
    dayIndex: number,
    transform: (activities: Activity[]) => Activity[],
  ): Activity[] | undefined => {
    let previousActivities: Activity[] | undefined;

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

        previousActivities = day.activities;
        return { ...day, activities: transform(day.activities) };
      });

      return [{ ...first, days: updatedDays }, ...rest];
    });

    return previousActivities;
  };

  const restoreActivities = (dayIndex: number, activities: Activity[]) => {
    setItineraryData((prev) => {
      if (prev.length === 0) {
        return prev;
      }

      const [first, ...rest] = prev;
      const days = first.days ?? [];
      const updatedDays = days.map((day, dIdx) =>
        dIdx === dayIndex ? { ...day, activities } : day,
      );

      return [{ ...first, days: updatedDays }, ...rest];
    });
  };

  const updateActivity = async (
    dayIndex: number,
    activityIndex: number,
    updates: {
      title: string;
      description: string;
      location: string;
      price: string;
      category: string;
      startTime: string;
      endTime: string;
    },
  ) => {
    const day = trip?.days?.[dayIndex];
    const activity = day?.activities?.[activityIndex];
    const activityId = typeof activity === "string" ? undefined : activity?.id;

    const previousActivities = applyActivityChange(dayIndex, (activities) =>
      sortActivitiesByTime(
        activities.map((current, aIdx) => {
          if (aIdx !== activityIndex) {
            return current;
          }
          const base =
            typeof current === "string" ? { title: current } : current;
          return {
            ...base,
            title: updates.title,
            description: updates.description,
            location: updates.location,
            cost: updates.price,
            category: updates.category,
            time: formatActivityTime(updates.startTime),
            endTime: formatActivityTime(updates.endTime),
          };
        }),
      ),
    );

    if (!activityId) {
      // No backend id (e.g. fixture data) - nothing to persist.
      return;
    }

    try {
      await updateActivityRequest(Number(activityId), {
        name: updates.title,
        description: updates.description,
        location_name: updates.location || null,
        estimated_cost: updates.price === "" ? null : Number(updates.price),
        category: updates.category || null,
        start_time: updates.startTime || null,
        end_time: updates.endTime || null,
      });
      setActivityError("");
    } catch (error) {
      console.error("Error saving activity:", error);
      if (previousActivities) {
        restoreActivities(dayIndex, previousActivities);
      }
      setActivityError("We couldn't save that change. Please try again.");
    }
  };

  const deleteActivity = async (dayIndex: number, activityIndex: number) => {
    const day = trip?.days?.[dayIndex];
    const activity = day?.activities?.[activityIndex];
    const activityId = typeof activity === "string" ? undefined : activity?.id;

    const previousActivities = applyActivityChange(dayIndex, (activities) =>
      activities.filter((_, aIdx) => aIdx !== activityIndex),
    );

    if (!activityId) {
      return;
    }

    try {
      await deleteActivityRequest(Number(activityId));
      setActivityError("");
    } catch (error) {
      console.error("Error deleting activity:", error);
      if (previousActivities) {
        restoreActivities(dayIndex, previousActivities);
      }
      setActivityError("We couldn't delete that activity. Please try again.");
    }
  };

  return {
    activityError,
    addActivityToDay,
    clearActivityError: () => setActivityError(""),
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

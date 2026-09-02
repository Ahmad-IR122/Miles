import type {
  GeneratedItinerary,
  Itinerary as ApiItinerary,
} from "../../../types/itinerary";
import {
  formatTripDestinations,
  type Trip as ApiTrip,
} from "../../../types/trip";
import type { Activity, Day, Trip } from "../types/itinerary.types";

/**
 * The backend returns itineraries in its own shape (snake_case, ids, `HH:MM:SS`
 * times). The Itinerary feature was built against a looser display shape, so
 * everything coming off the wire is adapted here rather than in the components.
 */

const HOURS_PER_MERIDIEM = 12;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;
const HOUR_DIGITS = 2;

const formatTime = (value: string) => {
  const [hours, minutes] = value.split(":");
  const hour = Number(hours);

  if (Number.isNaN(hour)) {
    return value;
  }

  const suffix = hour < HOURS_PER_MERIDIEM ? "AM" : "PM";
  const displayHour =
    hour % HOURS_PER_MERIDIEM === 0
      ? HOURS_PER_MERIDIEM
      : hour % HOURS_PER_MERIDIEM;
  return `${String(displayHour).padStart(HOUR_DIGITS, "0")}:${minutes} ${suffix}`;
};

const formatDuration = (minutes: number) => {
  if (minutes < MINUTES_PER_HOUR) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / MINUTES_PER_HOUR);
  const remainder = minutes % MINUTES_PER_HOUR;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
};

const timeToMinutes = (value?: string | null): number | undefined => {
  if (!value) return undefined;
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return undefined;
  return hours * MINUTES_PER_HOUR + minutes;
};

const durationBetween = (start?: string | null, end?: string | null) => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  if (startMinutes === undefined || endMinutes === undefined) return 0;
  const diff = endMinutes - startMinutes;
  return diff >= 0 ? diff : diff + MINUTES_PER_DAY;
};

/** Computes a formatted end time from a raw start time plus a duration. */
const addMinutesToTime = (value: string, minutesToAdd: number) => {
  const startMinutes = timeToMinutes(value);
  if (startMinutes === undefined) return undefined;

  const total = (startMinutes + minutesToAdd) % MINUTES_PER_DAY;
  const hours = Math.floor(total / MINUTES_PER_HOUR);
  const minutes = total % MINUTES_PER_HOUR;
  return formatTime(
    `${String(hours).padStart(HOUR_DIGITS, "0")}:${String(minutes).padStart(HOUR_DIGITS, "0")}`,
  );
};

const isApiItinerary = (value: unknown): value is ApiItinerary =>
  typeof value === "object" && value !== null && "trip_request_id" in value;

export const adaptItinerary = (itinerary: ApiItinerary): Trip => {
  const days: Day[] = itinerary.days.map((day) => ({
    id: day.id,
    day: day.day_number,
    date: day.date,
    activities: day.activities.map<Activity>((activity) => ({
      id: activity.id,
      title: activity.name,
      time: formatTime(activity.start_time),
      endTime: addMinutesToTime(activity.start_time, activity.duration_minutes),
      duration: formatDuration(activity.duration_minutes),
      description: activity.description ?? "",
      location: activity.location ?? undefined,
      category: activity.category,
      cost: activity.estimated_cost ?? undefined,
    })),
  }));

  return {
    id: itinerary.id,
    tripRequestId: itinerary.trip_request_id,
    destination: itinerary.destination,
    startDate: days[0]?.date,
    endDate: days[days.length - 1]?.date,
    days,
  };
};

/**
 * Accepts either the backend shape or an already display-shaped trip, so the
 * page keeps working against fixture data.
 */
export const adaptItineraries = (payload: unknown[]): Trip[] =>
  payload.map((item) =>
    isApiItinerary(item) ? adaptItinerary(item) : (item as Trip),
  );

/**
 * Adapts the `days` array from the real, DB-backed itinerary endpoints
 * (generate/regenerate/add-activity all return this same shape). Ids are
 * carried through as strings so the regenerate/add-activity controls can
 * target the right day/activity.
 */
export const adaptGeneratedDays = (days: GeneratedItinerary["days"]): Day[] =>
  days.map((day) => ({
    id: String(day.id),
    day: day.day_number,
    date: day.date,
    activities: day.activities.map<Activity>((activity) => ({
      id: String(activity.id),
      title: activity.name,
      time: activity.start_time ? formatTime(activity.start_time) : undefined,
      endTime: activity.end_time ? formatTime(activity.end_time) : undefined,
      duration: formatDuration(
        durationBetween(activity.start_time, activity.end_time),
      ),
      description: activity.description ?? "",
      location: activity.location_name ?? undefined,
      category: activity.category ?? undefined,
      cost: activity.estimated_cost ?? undefined,
    })),
  }));

/**
 * Adapts the response from POST /itinerary (the real, DB-backed generation
 * endpoint) plus the Trip it was generated for.
 */
export const adaptGeneratedItinerary = (
  trip: ApiTrip,
  itinerary: GeneratedItinerary,
): Trip => ({
  id: String(itinerary.id),
  destination: formatTripDestinations(trip.destinations),
  destinations: trip.destinations,
  startDate: trip.start_date,
  endDate: trip.end_date,
  travelers: trip.travelers_count,
  budget: trip.budget !== null ? String(trip.budget) : undefined,
  days: adaptGeneratedDays(itinerary.days),
});

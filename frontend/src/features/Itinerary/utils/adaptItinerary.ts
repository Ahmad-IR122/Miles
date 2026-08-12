import type { Itinerary as ApiItinerary } from "../../../types/itinerary";
import type { Activity, Day, Trip } from "../types/itinerary.types";

/**
 * The backend returns itineraries in its own shape (snake_case, ids, `HH:MM:SS`
 * times). The Itinerary feature was built against a looser display shape, so
 * everything coming off the wire is adapted here rather than in the components.
 */

const HOURS_PER_MERIDIEM = 12;
const MINUTES_PER_HOUR = 60;
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

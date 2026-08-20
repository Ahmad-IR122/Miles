import type { Trip } from "../../../types/trip";
import type { SavedTrip, TripStatus } from "../types/savedTrips.types";

const toDate = (date?: string) => {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(`${date}T00:00:00`);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const getTripStatus = (trip: Trip): TripStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = toDate(trip.start_date);
  const end = toDate(trip.end_date);

  if (start && today < start) {
    return "upcoming";
  }

  if (end && today > end) {
    return "completed";
  }

  return "ongoing";
};

export const withTripStatus = (trips: Trip[]): SavedTrip[] =>
  trips.map((trip) => ({
    ...trip,
    status: getTripStatus(trip),
  }));

export const tripStatusLabels: Record<TripStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
};

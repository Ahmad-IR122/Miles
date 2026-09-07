import type { TripDestination } from "../../../types/trip";

export type ActivityCategory =
  "culture" | "food" | "dining" | "shopping" | "nature";

export type Activity =
  | string
  | {
      id?: string;
      title: string;
      category?: ActivityCategory | string;
      time?: string;
      endTime?: string;
      duration?: string;
      description?: string;
      location?: string;
      transport?: string;
      cost?: string;
      weather?: string;
      icon?: string;
    };

export type Day = {
  id?: string;
  day: number;
  date?: string;
  activities: Activity[];
};

export type Trip = {
  id?: string;
  // The trip's own backend id - distinct from `id` above, which is actually
  // the *itinerary's* id (kept as `id` for backward compatibility with
  // fixture data and regenerate responses). Routes like /itinerary/:id and
  // the by-trip API calls all key off the trip id, not the itinerary id, so
  // anything that needs to link back to this exact trip (e.g. Discover's
  // "Add to Trip") should use tripId, not id.
  tripId?: string;
  tripRequestId?: string;
  destination?: string;
  destinations?: TripDestination[];
  startDate?: string;
  endDate?: string;
  travelers?: number;
  budget?: string;
  estimatedSpent?: string;
  days?: Day[];
};

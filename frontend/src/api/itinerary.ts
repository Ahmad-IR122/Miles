import { api } from "./api";
import type {
  GeneratedItinerary,
  Itinerary,
  TripRequest,
} from "../types/itinerary";

export const getItineraries = () =>
  api.get<{ data: Itinerary[] }>("/itinerary");

export const getUpcomingItinerary = () =>
  api.get<GeneratedItinerary>("/itinerary/upcoming");

export const getItineraryByTripId = (tripId: number) =>
  api.get<GeneratedItinerary>(`/itinerary/by-trip/${tripId}`);

export const generateItinerary = (tripId: number) =>
  api.post<GeneratedItinerary>("/itinerary", { trip_id: tripId });

export const getTripRequest = (requestId: string) =>
  api.get<TripRequest>(`/trip-requests/${requestId}`);

export const regenerateTrip = (itineraryId: number) =>
  api.post<GeneratedItinerary>(`/itinerary/${itineraryId}/regenerate`);

export const regenerateDay = (itineraryId: number, dayNumber: number) =>
  api.post<GeneratedItinerary>(
    `/itinerary/${itineraryId}/days/${dayNumber}/regenerate`,
  );

export const regenerateActivity = (
  itineraryId: number,
  dayNumber: number,
  activityId: number,
) =>
  api.post<GeneratedItinerary>(
    `/itinerary/${itineraryId}/days/${dayNumber}/activities/${activityId}/regenerate`,
  );

export const addActivity = (
  itineraryId: number,
  dayNumber: number,
  activity: {
    name: string;
    description?: string;
    location_name?: string;
    estimated_cost?: number;
    category?: string;
    start_time?: string;
    end_time?: string;
  },
) =>
  api.post<GeneratedItinerary>(
    `/itinerary/${itineraryId}/days/${dayNumber}/activities`,
    activity,
  );

export const updateActivity = (
  activityId: number,
  updates: { name?: string; description?: string },
) => api.patch(`/activities/${activityId}`, updates);

export const deleteActivity = (activityId: number) =>
  api.delete<void>(`/activities/${activityId}`);

export const updateInterests = (
  requestId: string,
  interests: string[],
  otherInterest: string,
) =>
  api.patch<TripRequest>(`/trip-requests/${requestId}`, {
    interests,
    other_interest: otherInterest.trim() || null,
  });

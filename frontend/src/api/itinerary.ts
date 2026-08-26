import { api } from "./api";
import type {
  GeneratedItinerary,
  Itinerary,
  TripRequest,
} from "../types/itinerary";

export const getItineraries = () =>
  api.get<{ data: Itinerary[] }>("/itinerary");

export const generateItinerary = (tripId: number) =>
  api.post<GeneratedItinerary>("/itinerary", { trip_id: tripId });

export const getTripRequest = (requestId: string) =>
  api.get<TripRequest>(`/trip-requests/${requestId}`);

export const regenerateTrip = (itineraryId: string) =>
  api.post<Itinerary>(`/itinerary/${itineraryId}/regenerate`);

export const regenerateDay = (itineraryId: string, dayNumber: number) =>
  api.post<Itinerary>(`/itinerary/${itineraryId}/days/${dayNumber}/regenerate`);

export const regenerateActivity = (
  itineraryId: string,
  dayNumber: number,
  activityId: string,
) =>
  api.post<Itinerary>(
    `/itinerary/${itineraryId}/days/${dayNumber}/activities/${activityId}/regenerate`,
  );

export const updateInterests = (
  requestId: string,
  interests: string[],
  otherInterest: string,
) =>
  api.patch<TripRequest>(`/trip-requests/${requestId}`, {
    interests,
    other_interest: otherInterest.trim() || null,
  });

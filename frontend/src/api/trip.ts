import { api } from "./api";
import type { Trip, TripCreatePayload } from "../types/trip";
export const getTrips = () => api.get<Trip[]>("/trips");

export const createTrip = async (payload: TripCreatePayload) => {
  const response = await api.post<Trip & { destination?: string }>(
    "/trips",
    payload,
  );

  return {
    ...response,
    data: {
      ...response.data,
      destinations: response.data.destinations ?? payload.destinations,
    },
  };
};

export const deleteTrip = async (payload: { tripId: number }) => {
  const response = await api.delete<void>(`/trips/${payload.tripId}`);

  return response;
};

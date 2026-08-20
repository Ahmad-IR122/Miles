import { api } from "./api";
import type { Trip, TripCreatePayload } from "../types/trip";
export const getTrips = () => api.get<Trip[]>("/trips");

export const createTrip = (payload: TripCreatePayload) =>
  api.post<Trip>("/trips", payload);

import { api } from "./api";
import type { Trip, TripCreatePayload } from "../types/trip";

export const createTrip = (payload: TripCreatePayload) =>
  api.post<Trip>("/trips", payload);

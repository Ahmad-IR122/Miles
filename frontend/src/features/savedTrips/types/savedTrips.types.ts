import type { Trip } from "../../../types/trip";

export type TripStatus = "upcoming" | "ongoing" | "completed";

export type SavedTrip = Trip & {
  status: TripStatus;
};

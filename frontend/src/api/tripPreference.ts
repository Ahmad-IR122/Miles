import axios from "axios";
import { api } from "./api";

export type TripPreferencePayload = {
  notes?: string | null;
};

export type TripPreference = {
  id: number;
  trip_id: number;
  notes: string | null;
};

/**
 * Stores the traveler's free-text notes (and the brief built from them) on the
 * trip. A trip can only hold one preferences row, so a retry on an existing
 * trip patches instead of creating a second one.
 */
export const saveTripPreferences = async (
  tripId: number,
  payload: TripPreferencePayload,
) => {
  try {
    return await api.post<TripPreference>(
      `/trips/${tripId}/preferences`,
      payload,
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      return api.patch<TripPreference>(`/trips/${tripId}/preferences`, payload);
    }

    throw error;
  }
};

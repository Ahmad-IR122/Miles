export type TripCreatePayload = {
  destinations: TripDestination[];
  start_date: string;
  end_date: string;
  budget_min: number;
  budget_max: number;
  travelers_count: number;
};

export type TripDestination = {
  country: string;
  city?: string;
  days: number;
};

export const formatTripDestinations = (destinations: TripDestination[] = []) =>
  destinations
    .map(({ city, country }) => (city ? `${city}, ${country}` : country))
    .join(" • ");

export type Trip = {
  id: number;
  user_id: number;
  destinations: TripDestination[];
  start_date: string;
  end_date: string;
  budget: number | null;
  currency: string;
  travelers_count: number;
  trip_status: string;
  created_at: string;
  updated_at: string;
};

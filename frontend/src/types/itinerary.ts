export type Activity = {
  id: string;
  name: string;
  start_time: string;
  duration_minutes: number;
  location?: string | null;
  description?: string | null;
  category?: string;
  tags?: string[];
  estimated_cost?: string | null;
};

export type DayPlan = {
  id: string;
  day_number: number;
  date: string;
  activities: Activity[];
};

export type Itinerary = {
  id: string;
  trip_request_id: string;
  destination: string;
  days: DayPlan[];
};

export type TripRequest = {
  request_id: string;
  origin: string;
  destination: string;
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  interests: string[];
  other_interest: string | null;
  budget: number;
};

export type GeneratedActivity = {
  id: number;
  itinerary_day_id: number;
  name: string;
  description?: string | null;
  location_name?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  estimated_cost?: string | null;
  category?: string | null;
  activity_order: number;
};

export type GeneratedItineraryDay = {
  id: number;
  itinerary_id: number;
  day_number: number;
  date: string;
  title?: string | null;
  summary?: string | null;
  activities: GeneratedActivity[];
};

export type GeneratedItinerary = {
  id: number;
  trip_id: number;
  version: number;
  generated_by?: string | null;
  days: GeneratedItineraryDay[];
};

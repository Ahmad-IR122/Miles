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

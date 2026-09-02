import type { TripDestination } from "../../../types/trip";

export type ActivityCategory =
  "culture" | "food" | "dining" | "shopping" | "nature";

export type Activity =
  | string
  | {
      id?: string;
      title: string;
      category?: ActivityCategory | string;
      time?: string;
      endTime?: string;
      duration?: string;
      description?: string;
      location?: string;
      transport?: string;
      cost?: string;
      weather?: string;
      icon?: string;
    };

export type Day = {
  id?: string;
  day: number;
  date?: string;
  activities: Activity[];
};

export type Trip = {
  id?: string;
  tripRequestId?: string;
  destination?: string;
  destinations?: TripDestination[];
  startDate?: string;
  endDate?: string;
  travelers?: number;
  budget?: string;
  estimatedSpent?: string;
  days?: Day[];
};

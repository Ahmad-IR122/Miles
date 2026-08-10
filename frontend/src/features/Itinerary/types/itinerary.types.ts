export type ActivityCategory =
  "culture" | "food" | "dining" | "shopping" | "nature";

export type Activity =
  | string
  | {
      title: string;
      category?: ActivityCategory | string;
      time?: string;
      duration?: string;
      description?: string;
      location?: string;
      transport?: string;
      cost?: string;
      weather?: string;
      icon?: string;
    };

export type Day = {
  day: number;
  activities: Activity[];
};

export type Trip = {
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  budget?: string;
  estimatedSpent?: string;
  days?: Day[];
};

export type TripCreatePayload = {
  destination: string;
  start_date: string;
  end_date: string;
  budget: number;
  travelers_count: number;
};

export type Trip = {
  id: number;
  user_id: number;
  destination: string;
  start_date: string;
  end_date: string;
  budget: number | null;
  currency: string;
  travelers_count: number;
  trip_status: string;
  created_at: string;
  updated_at: string;
};

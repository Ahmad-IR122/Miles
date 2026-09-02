import { api } from "./api";

export type RecommendationRequestPayload = {
  interests: string[];
  budget: number;
  travel_month: number;
  style: string;
};

export type RecommendationApiItem = {
  destination_id: string;
  city: string;
  country: string;
  region: string;
  style: string;
  budget_level: string;
  similarity_score: number;
  budget_score_match: number;
  season_score_match: number;
  style_score_match: number;
  final_score: number;
};

export type RestaurantRecommendationRequestPayload = {
  destination_id: string;
  budget: number;
};

export type RestaurantRecommendationApiItem = {
  restaurant_id: string;
  destination_id: string;
  name: string;
  cuisines: string;
  budget_level: string;
  average_price: number;
  rating: number;
  review_count: number;
  adjusted_rating: number;
  budget_score_match: number;
  restaurant_score: number;
};

export type ActivityApiItem = {
  activity_id?: string | null;
  destination_id?: string | null;
  city?: string | null;
  country?: string | null;
  name?: string | null;
  category?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  website?: string | null;
  rating?: number | null;
  review_count?: number | null;
  estimated_duration_minutes?: number | null;
  time_of_day?: string | null;
  indoor_outdoor?: string | null;
  interest_tags?: string | null;
};

export type RecommendationResponse = {
  recommendations: RecommendationApiItem[];
};

export type RestaurantRecommendationResponse = {
  recommendations: RestaurantRecommendationApiItem[];
};

export type ActivityResponse = {
  activities: ActivityApiItem[];
};

export const getRecommendations = (payload: RecommendationRequestPayload) =>
  api.post<RecommendationResponse>("/api/recommendations/", payload);

export const getRestaurantRecommendations = (
  payload: RestaurantRecommendationRequestPayload,
) =>
  api.post<RestaurantRecommendationResponse>(
    "/api/recommendations/restaurants/",
    payload,
  );

export const getActivities = () =>
  api.get<ActivityResponse>("/api/recommendations/activities/");

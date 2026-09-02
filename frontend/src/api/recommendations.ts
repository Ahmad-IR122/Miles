import { api } from "./api";

export type RecommendationRequestPayload = {
  interests: string[];
  budget_level: "low" | "mid" | "high";
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

export type RecommendationResponse = {
  recommendations: RecommendationApiItem[];
};

export type RestaurantRecommendationResponse = {
  recommendations: RestaurantRecommendationApiItem[];
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

import { api } from "./api";

export type RecommendationRequestPayload = {
  interests: string[];
  budget_level: "low" | "mid" | "high";
  travel_month: number;
  style: string;
  limit: number;
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

export type RecommendationResponse = {
  recommendations: RecommendationApiItem[];
};

export const getRecommendations = (payload: RecommendationRequestPayload) =>
  api.post<RecommendationResponse>("/api/recommendations/", payload);

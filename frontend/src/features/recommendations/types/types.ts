export type RecommendationCategory =
  "Attractions" | "Restaurants" | "Activities";

export type RecommendationCategoryFilter = "All" | RecommendationCategory;

export type BudgetFilterLabel = "Any Budget" | "Low" | "Mid" | "High";

export type PriceLevel = "$" | "$$" | "$$$";

export type RecommendationPlace = {
  id: string;
  destinationId: string;
  title: string;
  category: RecommendationCategory | "Destinations";
  rating: number;
  reviews: number;
  price: string;
  priceLevel: PriceLevel;
  location: string;
  desc: string;
  img: string;
  tags: string[];
  saved: boolean;
};

export type RecommendationPreferences = {
  interests: string[];
  budgetLevel: "LOW" | "MID" | "HIGH";
  budget?: number;
  travelMonth: number;
  style: string;
  destinationId?: string;
};

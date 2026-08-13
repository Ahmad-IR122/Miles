export type RecommendationCategory =
  "Attractions" | "Restaurants" | "Hotels" | "Activities";

export type RecommendationCategoryFilter = "All" | RecommendationCategory;

export type BudgetFilterLabel =
  "Any Budget" | "Low Budget" | "Mid-range" | "Upscale" | "Luxury";

export type PriceLevel = "$" | "$$" | "$$$" | "$$$$";

export type RecommendationPlace = {
  title: string;
  category: RecommendationCategory;
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

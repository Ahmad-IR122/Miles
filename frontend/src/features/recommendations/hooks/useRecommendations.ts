import { useEffect, useState } from "react";

import {
  getRecommendations,
  type RecommendationApiItem,
  type RecommendationRequestPayload,
} from "../../../api/recommendations";
import placeholderImage from "../../../assets/image.svg";
import { interestOptions } from "../../../constants/interests";
import type {
  PriceLevel,
  RecommendationPlace,
  RecommendationPreferences,
} from "../types/types";

const latestRecommendationPreferencesKey = "latestRecommendationPreferences";
const defaultRecommendationLimit = 5;

const apiBudgetMap: Record<
  RecommendationPreferences["budgetLevel"],
  "low" | "mid" | "high"
> = {
  LOW: "low",
  MID: "mid",
  HIGH: "high",
};

const recommendationBudgetLabels: Record<
  string,
  { price: string; priceLevel: PriceLevel }
> = {
  low: { price: "Low Budget", priceLevel: "$" },
  mid: { price: "Mid-range", priceLevel: "$$" },
  high: { price: "Upscale", priceLevel: "$$$" },
};

const isRecommendationPreferences = (
  value: unknown,
): value is RecommendationPreferences => {
  if (!value || typeof value !== "object") return false;
  const preferences = value as Partial<RecommendationPreferences>;

  return (
    Array.isArray(preferences.interests) &&
    preferences.interests.every((interest) => typeof interest === "string") &&
    (preferences.budgetLevel === "LOW" ||
      preferences.budgetLevel === "MID" ||
      preferences.budgetLevel === "HIGH") &&
    typeof preferences.travelMonth === "number" &&
    typeof preferences.style === "string"
  );
};

const readStoredPreferences = (): RecommendationPreferences | null => {
  const storedPreferences = window.sessionStorage.getItem(
    latestRecommendationPreferencesKey,
  );
  if (!storedPreferences) return null;

  try {
    const parsedPreferences = JSON.parse(storedPreferences);
    return isRecommendationPreferences(parsedPreferences)
      ? parsedPreferences
      : null;
  } catch {
    return null;
  }
};

const toRecommendationPayload = (
  preferences: RecommendationPreferences,
): RecommendationRequestPayload => ({
  interests: preferences.interests,
  budget_level: apiBudgetMap[preferences.budgetLevel],
  travel_month: preferences.travelMonth,
  style: preferences.style,
  limit: defaultRecommendationLimit,
});

const getBrowseRecommendationsPayload = (): RecommendationRequestPayload => ({
  interests: interestOptions.filter((interest) => interest !== "Other"),
  budget_level: "mid",
  travel_month: new Date().getMonth() + 1,
  style: "balanced",
  limit: defaultRecommendationLimit,
});

const getRecommendationCategory = (
  item: RecommendationApiItem,
): RecommendationPlace["category"] => {
  const style = item.style.toLowerCase();
  if (style.includes("food")) return "Restaurants";
  if (style.includes("hotel")) return "Hotels";
  if (style.includes("adventure") || style.includes("activity")) {
    return "Activities";
  }
  return "Attractions";
};

const toRecommendationPlace = (
  item: RecommendationApiItem,
): RecommendationPlace => {
  const normalizedBudget = item.budget_level.toLowerCase();
  const budgetLabel = recommendationBudgetLabels[normalizedBudget] ?? {
    price: item.budget_level,
    priceLevel: "$$" as const,
  };

  return {
    title: `${item.city}, ${item.country}`,
    category: getRecommendationCategory(item),
    rating: Math.round(item.final_score * 10) / 10,
    reviews: 0,
    price: budgetLabel.price,
    priceLevel: budgetLabel.priceLevel,
    location: item.region,
    desc: `Recommended for ${item.style} travel based on your selected trip preferences.`,
    img: placeholderImage,
    tags: [item.style, item.budget_level],
    saved: false,
  };
};

export const useRecommendations = (locationState: unknown) => {
  const [places, setPlaces] = useState<RecommendationPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const locationPreferences = isRecommendationPreferences(locationState)
      ? locationState
      : null;
    const preferences = locationPreferences ?? readStoredPreferences();
    const payload = preferences
      ? toRecommendationPayload(preferences)
      : getBrowseRecommendationsPayload();

    let isMounted = true;

    void Promise.resolve()
      .then(() => {
        if (isMounted) {
          setIsLoading(true);
          setErrorMessage("");
        }

        return getRecommendations(payload);
      })
      .then(({ data }) => {
        if (isMounted) {
          setPlaces(data.recommendations.map(toRecommendationPlace));
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage("Unable to load recommendations. Please try again.");
          setPlaces([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [locationState]);

  return { places, isLoading, errorMessage };
};

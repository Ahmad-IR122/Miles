import { useEffect, useMemo, useState } from "react";

import {
  getRecommendations,
  getRestaurantRecommendations,
  type RecommendationApiItem,
  type RecommendationRequestPayload,
  type RecommendationResponse,
  type RestaurantRecommendationApiItem,
  type RestaurantRecommendationRequestPayload,
  type RestaurantRecommendationResponse,
} from "../../../api/recommendations";
import placeholderImage from "../../../assets/image.svg";
import destinations from "../../../data/destinations.json";
import type {
  PriceLevel,
  RecommendationCategoryFilter,
  RecommendationPlace,
  RecommendationPreferences,
} from "../types/types";

const latestRecommendationPreferencesKey = "latestRecommendationPreferences";
const defaultRestaurantBudget = 750;
const recommendationRequests = new Map<
  string,
  Promise<RecommendationResponse>
>();
const restaurantRecommendationRequests = new Map<
  string,
  Promise<RestaurantRecommendationResponse>
>();
const mockRecommendationPayload: RecommendationRequestPayload = {
  interests: ["Adventure", "Nature", "Food"],
  budget_level: "high",
  travel_month: 1,
  style: "nature",
};

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
    typeof preferences.style === "string" &&
    (preferences.budget === undefined ||
      (typeof preferences.budget === "number" &&
        Number.isFinite(preferences.budget))) &&
    (preferences.destinationId === undefined ||
      typeof preferences.destinationId === "string")
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
});

const getBrowseRecommendationsPayload = (): RecommendationRequestPayload => ({
  ...mockRecommendationPayload,
});

const getCachedRecommendations = (payload: RecommendationRequestPayload) => {
  const requestKey = JSON.stringify(payload);
  const cachedRequest = recommendationRequests.get(requestKey);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = getRecommendations(payload)
    .then(({ data }) => data)
    .catch((error) => {
      recommendationRequests.delete(requestKey);
      throw error;
    });
  recommendationRequests.set(requestKey, request);
  return request;
};

const getCachedRestaurantRecommendations = (
  payload: RestaurantRecommendationRequestPayload,
) => {
  const requestKey = JSON.stringify(payload);
  const cachedRequest = restaurantRecommendationRequests.get(requestKey);

  if (cachedRequest) {
    return cachedRequest;
  }

  const request = getRestaurantRecommendations(payload)
    .then(({ data }) => data)
    .catch((error) => {
      restaurantRecommendationRequests.delete(requestKey);
      throw error;
    });
  restaurantRecommendationRequests.set(requestKey, request);
  return request;
};

const getDestinationLabel = (destinationId: string) => {
  const destination = destinations.find(
    (item) => item.destination_id === destinationId,
  );

  return destination
    ? `${destination.city}, ${destination.country}`
    : destinationId;
};

const getDestinationRegion = (destinationId: string) =>
  destinations.find((item) => item.destination_id === destinationId)?.region ??
  "Selected destination";

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
    id: item.destination_id,
    destinationId: item.destination_id,
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

const toRestaurantPlace = (
  item: RestaurantRecommendationApiItem,
): RecommendationPlace => {
  const normalizedBudget = item.budget_level.toLowerCase();
  const budgetLabel = recommendationBudgetLabels[normalizedBudget] ?? {
    price: item.budget_level,
    priceLevel: "$$" as const,
  };

  return {
    id: item.restaurant_id,
    destinationId: item.destination_id,
    title: item.name,
    category: "Restaurants",
    rating: Math.round(item.rating * 10) / 10,
    reviews: Math.round(item.review_count),
    price: `Avg. $${Math.round(item.average_price)}`,
    priceLevel: budgetLabel.priceLevel,
    location: getDestinationLabel(item.destination_id),
    desc: `${item.cuisines} restaurant in ${getDestinationRegion(
      item.destination_id,
    )}.`,
    img: placeholderImage,
    tags: [item.cuisines, budgetLabel.price],
    saved: false,
  };
};

export const useRecommendations = (
  locationState: unknown,
  activeCategory: RecommendationCategoryFilter,
) => {
  const [destinationPlaces, setDestinationPlaces] = useState<
    RecommendationPlace[]
  >([]);
  const [restaurantPlaces, setRestaurantPlaces] = useState<
    RecommendationPlace[]
  >([]);
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

        return getCachedRecommendations(payload);
      })
      .then((data) => {
        if (isMounted) {
          setDestinationPlaces(data.recommendations.map(toRecommendationPlace));
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage("Unable to load recommendations. Please try again.");
          setDestinationPlaces([]);
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

  useEffect(() => {
    if (activeCategory !== "Restaurants") {
      return;
    }

    const locationPreferences = isRecommendationPreferences(locationState)
      ? locationState
      : null;
    const preferences = locationPreferences ?? readStoredPreferences();
    const destinationId =
      preferences?.destinationId ?? destinationPlaces[0]?.destinationId;

    if (!destinationId) {
      return;
    }

    const budget = preferences?.budget ?? defaultRestaurantBudget;
    let isMounted = true;

    void Promise.resolve()
      .then(() => {
        if (isMounted) {
          setIsLoading(true);
          setErrorMessage("");
        }

        return getCachedRestaurantRecommendations({
          destination_id: destinationId,
          budget,
        });
      })
      .then((data) => {
        if (isMounted) {
          setRestaurantPlaces(data.recommendations.map(toRestaurantPlace));
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage(
            "Unable to load restaurant recommendations. Please try again.",
          );
          setRestaurantPlaces([]);
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
  }, [activeCategory, destinationPlaces, locationState]);

  const places = useMemo(
    () =>
      activeCategory === "Restaurants" ? restaurantPlaces : destinationPlaces,
    [activeCategory, destinationPlaces, restaurantPlaces],
  );

  return { places, isLoading, errorMessage };
};

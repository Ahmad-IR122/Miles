import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  getRecommendations,
  type RecommendationApiItem,
  type RecommendationRequestPayload,
} from "../../../api/recommendations";
import placeholderImage from "../../../assets/image.svg";
import { interestOptions } from "../../../constants/interests";
import RecommendationsEmptyState from "../components/recommendationsEmptyState";
import RecommendationsFilters from "../components/recommendationsFilters";
import RecommendationsHeader from "../components/recommendationsHeader";
import RecommendationCard from "../components/recommendationCard";
import { useRecommendationsStyles } from "../styles/recommendations.styles";
import type {
  BudgetFilterLabel,
  PriceLevel,
  RecommendationCategoryFilter,
  RecommendationPlace,
  RecommendationPreferences,
} from "../types/types";

const categories = [
  "All",
  "Attractions",
  "Restaurants",
  "Hotels",
  "Activities",
] as const;

const budgets = [
  "Any Budget",
  "Low Budget",
  "Mid-range",
  "Upscale",
  "Luxury",
] as const satisfies readonly BudgetFilterLabel[];

const budgetMap: Record<
  Exclude<BudgetFilterLabel, "Any Budget">,
  PriceLevel
> = {
  "Low Budget": "$",
  "Mid-range": "$$",
  Upscale: "$$$",
  Luxury: "$$$$",
};

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

const Recommendations = () => {
  const styles = useRecommendationsStyles();
  const location = useLocation();
  const [activeCategory, setActiveCategory] =
    useState<RecommendationCategoryFilter>("All");
  const [activeBudget, setActiveBudget] =
    useState<BudgetFilterLabel>("Any Budget");
  const [places, setPlaces] = useState<RecommendationPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const locationPreferences = isRecommendationPreferences(location.state)
      ? location.state
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
  }, [location.state]);

  const filteredPlaces = useMemo(
    () =>
      places.filter((place) => {
        if (activeCategory !== "All" && place.category !== activeCategory) {
          return false;
        }

        if (activeBudget !== "Any Budget") {
          const selectedPriceLevel = budgetMap[activeBudget];
          if (place.priceLevel !== selectedPriceLevel) {
            return false;
          }
        }

        return true;
      }),
    [activeCategory, activeBudget, places],
  );

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <RecommendationsHeader count={filteredPlaces.length} />

        <RecommendationsFilters
          categories={categories}
          budgets={budgets}
          activeCategory={activeCategory}
          activeBudget={activeBudget}
          onCategoryChange={setActiveCategory}
          onBudgetChange={setActiveBudget}
        />

        {isLoading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>Loading recommendations...</div>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>{errorMessage}</div>
          </div>
        )}

        {!isLoading && !errorMessage && (
          <div className={styles.grid}>
            {filteredPlaces.map((place) => (
              <RecommendationCard key={place.title} place={place} />
            ))}
          </div>
        )}

        {!isLoading && !errorMessage && filteredPlaces.length === 0 && (
          <RecommendationsEmptyState />
        )}
      </main>
    </div>
  );
};

export default Recommendations;

import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import RecommendationsEmptyState from "../components/recommendationsEmptyState";
import RecommendationsFilters from "../components/recommendationsFilters";
import RecommendationsHeader from "../components/recommendationsHeader";
import RecommendationCard from "../components/recommendationCard";
import { useRecommendations } from "../hooks/useRecommendations";
import { useRecommendationsStyles } from "../styles/recommendations.styles";
import type {
  BudgetFilterLabel,
  PriceLevel,
  RecommendationCategoryFilter,
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
  "Low",
  "Mid",
  "High",
] as const satisfies readonly BudgetFilterLabel[];

const budgetMap: Record<
  Exclude<BudgetFilterLabel, "Any Budget">,
  PriceLevel
> = {
  Low: "$",
  Mid: "$$",
  High: "$$$",
};

const Recommendations = () => {
  const styles = useRecommendationsStyles();
  const location = useLocation();
  const [activeCategory, setActiveCategory] =
    useState<RecommendationCategoryFilter>("All");
  const [activeBudget, setActiveBudget] =
    useState<BudgetFilterLabel>("Any Budget");
  const { places, isLoading, errorMessage } = useRecommendations(
    location.state,
    activeCategory,
  );

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
              <RecommendationCard key={place.id} place={place} />
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

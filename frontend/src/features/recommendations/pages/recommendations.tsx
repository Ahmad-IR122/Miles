import { useMemo, useState } from "react";

import TopNav from "../../../common/topNav/topNav";
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

const places: RecommendationPlace[] = [];

const budgetMap: Record<
  Exclude<BudgetFilterLabel, "Any Budget">,
  PriceLevel
> = {
  "Low Budget": "$",
  "Mid-range": "$$",
  Upscale: "$$$",
  Luxury: "$$$$",
};

const Recommendations = () => {
  const styles = useRecommendationsStyles();
  const [activeCategory, setActiveCategory] =
    useState<RecommendationCategoryFilter>("All");
  const [activeBudget, setActiveBudget] =
    useState<BudgetFilterLabel>("Any Budget");

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
    [activeCategory, activeBudget],
  );

  return (
    <>
      <TopNav />
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

          <div className={styles.grid}>
            {filteredPlaces.map((place) => (
              <RecommendationCard key={place.title} place={place} />
            ))}
          </div>

          {filteredPlaces.length === 0 && <RecommendationsEmptyState />}
        </main>
      </div>
    </>
  );
};

export default Recommendations;

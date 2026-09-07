import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { routesPaths } from "../../../routes/routesPaths";
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
  RecommendationPlace,
} from "../types/types";

const categories = ["All", "Attractions", "Restaurants", "Activities"] as const;
const ITEMS_PER_PAGE = 6;

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

// The only way into this page now is the itinerary's "Discover more
// activities" button, which always hands over the trip's own country via
// navigation state - so this reads that instead of exposing a country picker
// the user could drift away from the trip with.
const getPresetCountry = (locationState: unknown) => {
  if (
    !locationState ||
    typeof locationState !== "object" ||
    !("presetCountry" in locationState)
  ) {
    return "";
  }
  const { presetCountry } = locationState as { presetCountry?: unknown };
  return typeof presetCountry === "string" ? presetCountry.trim() : "";
};

const getResultSetKey = (
  places: { id: string }[],
  activeCategory: RecommendationCategoryFilter,
  activeBudget: BudgetFilterLabel,
) =>
  JSON.stringify({
    activeCategory,
    activeBudget,
    ids: places.map((place) => place.id),
  });

const Recommendations = () => {
  const styles = useRecommendationsStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] =
    useState<RecommendationCategoryFilter>("All");
  const [activeBudget, setActiveBudget] =
    useState<BudgetFilterLabel>("Any Budget");
  const [pagination, setPagination] = useState({
    page: 1,
    resultSetKey: "",
  });
  const { places, isLoading, errorMessage } = useRecommendations(
    location.state,
    activeCategory,
  );
  const presetCountry = getPresetCountry(location.state);

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
        if (
          presetCountry &&
          place.country.trim().toLowerCase() !== presetCountry.toLowerCase()
        ) {
          return false;
        }

        return true;
      }),
    [activeCategory, activeBudget, presetCountry, places],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE),
  );
  const resultSetKey = getResultSetKey(
    filteredPlaces,
    activeCategory,
    activeBudget,
  );
  const currentPage =
    pagination.resultSetKey === resultSetKey ? pagination.page : 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visiblePlaces = filteredPlaces.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );
  const visibleStart = filteredPlaces.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = Math.min(
    startIndex + visiblePlaces.length,
    filteredPlaces.length,
  );

  const handlePageChange = (nextPage: number) => {
    setPagination({
      page: nextPage,
      resultSetKey,
    });
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  };

  // Everything shown here is already filtered to the itinerary's own
  // country (see presetCountry above), so there's no longer anything to
  // check before handing an activity back to the itinerary page.
  const handleAddToTrip = (place: RecommendationPlace) => {
    navigate(routesPaths.itinerary, {
      state: { pendingActivity: place },
    });
  };

  return (
    <div className={styles.page}>
      <main className={styles.content}>
        <RecommendationsHeader
          count={filteredPlaces.length}
          currentPage={currentPage}
          totalPages={totalPages}
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
        />

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
            {visiblePlaces.map((place) => (
              <RecommendationCard
                key={place.id}
                place={place}
                onAddToTrip={handleAddToTrip}
              />
            ))}
          </div>
        )}

        {!isLoading && !errorMessage && filteredPlaces.length > 0 && (
          <nav className={styles.pagination} aria-label="Recommendations pages">
            <span className={styles.paginationStatus}>
              Page {currentPage} of {totalPages}
            </span>

            <div className={styles.paginationActions}>
              <button
                className={styles.paginationButton}
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <button
                className={styles.paginationButton}
                type="button"
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </nav>
        )}

        {!isLoading && !errorMessage && filteredPlaces.length === 0 && (
          <RecommendationsEmptyState />
        )}
      </main>
    </div>
  );
};

export default Recommendations;

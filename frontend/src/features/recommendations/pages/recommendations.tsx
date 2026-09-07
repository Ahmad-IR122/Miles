import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getUpcomingItinerary } from "../../../api/itinerary";
import { getTripById } from "../../../api/trip";
import ConfirmDialog from "../../../common/confirmDialog/confirmDialog";
import { routesPaths } from "../../../routes/routesPaths";
import RecommendationsEmptyState from "../components/recommendationsEmptyState";
import RecommendationsFilters, {
  ANY_COUNTRY,
} from "../components/recommendationsFilters";
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

const getResultSetKey = (
  places: { id: string }[],
  activeCategory: RecommendationCategoryFilter,
  activeBudget: BudgetFilterLabel,
  activeCountry: string,
) =>
  JSON.stringify({
    activeCategory,
    activeBudget,
    activeCountry,
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
  const [activeCountry, setActiveCountry] = useState<string>(ANY_COUNTRY);
  const [pagination, setPagination] = useState({
    page: 1,
    resultSetKey: "",
  });
  const { places, isLoading, errorMessage } = useRecommendations(
    location.state,
    activeCategory,
  );
  const [countryMismatchMessage, setCountryMismatchMessage] = useState("");
  // The country check now happens before navigating away (fetching trip
  // data first), so a click no longer jumps to the itinerary page
  // instantly - tracking which card is mid-check lets that one button show
  // "Adding..." instead of the page just sitting there looking stuck.
  const [checkingPlaceId, setCheckingPlaceId] = useState<string | null>(null);

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
        if (activeCountry !== ANY_COUNTRY && place.country !== activeCountry) {
          return false;
        }

        return true;
      }),
    [activeCategory, activeBudget, activeCountry, places],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE),
  );
  const resultSetKey = getResultSetKey(
    filteredPlaces,
    activeCategory,
    activeBudget,
    activeCountry,
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

  const handleAddToTrip = async (place: RecommendationPlace) => {
    if (checkingPlaceId) return;
    setCheckingPlaceId(place.id);

    try {
      // The itinerary page is where trip data normally loads - fetched here
      // too so the country can be checked before ever navigating there,
      // instead of sending the user over just to bounce them back.
      const upcoming = await getUpcomingItinerary();
      const tripId = upcoming.data?.trip_id;
      const tripCountries = tripId
        ? new Set(
          (await getTripById(tripId)).data.destinations.map((destination) =>
            destination.country.trim().toLowerCase(),
          ),
        )
        : new Set<string>();

      const activityCountry = place.country.trim().toLowerCase();

      if (
        tripCountries.size > 0 &&
        activityCountry &&
        !tripCountries.has(activityCountry)
      ) {
        setCountryMismatchMessage(
          `${place.title} is in ${place.country}, which isn't part of this itinerary.`,
        );
        return;
      }
    } catch {
      // Couldn't confirm either way (offline, no trip yet, etc.) - fail open
      // rather than block a feature that used to work on a check that
      // itself failed.
    } finally {
      setCheckingPlaceId(null);
    }

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
          activeCountry={activeCountry}
          onCategoryChange={setActiveCategory}
          onBudgetChange={setActiveBudget}
          onCountryChange={setActiveCountry}
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
                isAdding={checkingPlaceId === place.id}
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

      <ConfirmDialog
        open={countryMismatchMessage !== ""}
        variant="warning"
        hideCancel
        title="Not part of this itinerary"
        description={countryMismatchMessage}
        confirmLabel="Got it"
        onConfirm={() => setCountryMismatchMessage("")}
        onCancel={() => setCountryMismatchMessage("")}
      />
    </div>
  );
};

export default Recommendations;

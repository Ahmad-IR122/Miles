import { useMemo, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

import { addTrip, getTrips } from "../../../api/trip";
import ConfirmDialog from "../../../common/confirmDialog/confirmDialog";
import type {
  Trip,
  TripCreatePayload,
  TripDestination,
} from "../../../types/trip";
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

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getNextAvailableTripDate = (
  trips: Trip[],
  fromDate = addDays(new Date(), 1),
) => {
  let candidate = fromDate;

  while (
    trips.some((trip) => {
      const candidateTime = new Date(
        `${formatDate(candidate)}T00:00:00`,
      ).getTime();
      const startTime = new Date(`${trip.start_date}T00:00:00`).getTime();
      const endTime = new Date(`${trip.end_date}T00:00:00`).getTime();
      return candidateTime >= startTime && candidateTime <= endTime;
    })
  ) {
    candidate = addDays(candidate, 1);
  }

  return formatDate(candidate);
};

const splitLocationParts = (value: string) =>
  value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const getTripDestination = (place: RecommendationPlace) => {
  const titleParts = splitLocationParts(place.title);
  const locationParts = splitLocationParts(place.location);
  const country =
    place.country || titleParts.at(-1) || locationParts.at(-1) || "Destination";
  const city =
    titleParts.length > 1
      ? titleParts[0]
      : locationParts.at(-1) === country
        ? locationParts[0]
        : "";

  return {
    country,
    city,
    days: 1,
  };
};

const normalizeLocationPart = (value?: string) =>
  (value ?? "").trim().toLowerCase();

const isSameDestination = (left: TripDestination, right: TripDestination) =>
  normalizeLocationPart(left.country) ===
    normalizeLocationPart(right.country) &&
  normalizeLocationPart(left.city) === normalizeLocationPart(right.city);

const hasTripForPlace = (trips: Trip[], place: RecommendationPlace) => {
  const destination = getTripDestination(place);

  return trips.some((trip) =>
    trip.destinations.some((tripDestination) =>
      isSameDestination(tripDestination, destination),
    ),
  );
};

const createDiscoverTrip = async (place: RecommendationPlace) => {
  const { data: existingTrips } = await getTrips();

  if (hasTripForPlace(existingTrips, place)) {
    return { alreadyExists: true };
  }

  let trips = existingTrips;
  let candidate = addDays(new Date(), 1);

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const tripDate = getNextAvailableTripDate(trips, candidate);
    const payload: TripCreatePayload = {
      destinations: [getTripDestination(place)],
      start_date: tripDate,
      end_date: tripDate,
      budget_max: 100,
      travelers_count: 1,
      adults: 1,
      children: 0,
      additional_notes: `Added from Discover: ${place.title}. ${place.desc}`,
    };

    try {
      return { alreadyExists: false, response: await addTrip(payload) };
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 409) {
        throw error;
      }

      trips = (await getTrips()).data;

      if (hasTripForPlace(trips, place)) {
        return { alreadyExists: true };
      }

      candidate = addDays(new Date(`${tripDate}T00:00:00`), 1);
    }
  }

  throw new Error("No available trip date found.");
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
  const [activeCategory, setActiveCategory] =
    useState<RecommendationCategoryFilter>("All");
  const [activeBudget, setActiveBudget] =
    useState<BudgetFilterLabel>("Any Budget");
  const [activeCountry, setActiveCountry] = useState<string>(ANY_COUNTRY);
  const [pagination, setPagination] = useState({
    page: 1,
    resultSetKey: "",
  });
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);
  const [addedPlaceIds, setAddedPlaceIds] = useState<string[]>([]);
  const [addTripError, setAddTripError] = useState("");
  const [addTripSuccess, setAddTripSuccess] = useState("");
  const [duplicateTripDialogOpen, setDuplicateTripDialogOpen] = useState(false);
  const [pendingPlace, setPendingPlace] = useState<RecommendationPlace | null>(
    null,
  );
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

  const closeAddTripDialog = () => {
    if (addingPlaceId) {
      return;
    }

    setPendingPlace(null);
  };

  const handleAddToTrip = (place: RecommendationPlace) => {
    setAddTripError("");
    setAddTripSuccess("");
    setPendingPlace(place);
  };

  const handleConfirmAddTrip = async () => {
    if (!pendingPlace) {
      return;
    }

    const place = pendingPlace;
    setAddTripError("");
    setAddTripSuccess("");
    setPendingPlace(null);
    setAddingPlaceId(place.id);

    try {
      const result = await createDiscoverTrip(place);

      setAddedPlaceIds((currentIds) =>
        currentIds.includes(place.id) ? currentIds : [...currentIds, place.id],
      );

      if (result.alreadyExists) {
        setDuplicateTripDialogOpen(true);
      } else {
        setAddTripSuccess("Trip added successfully");
      }
    } catch {
      setAddTripError("We couldn't add that recommendation to My Trips.");
    } finally {
      setAddingPlaceId(null);
    }
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

        {!isLoading && !errorMessage && addTripError && (
          <div className={styles.inlineError} role="alert">
            {addTripError}
          </div>
        )}

        {!isLoading && !errorMessage && addTripSuccess && (
          <div className={styles.inlineSuccess} role="status">
            {addTripSuccess}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <div className={styles.grid}>
            {visiblePlaces.map((place) => (
              <RecommendationCard
                key={place.id}
                place={place}
                isAdding={addingPlaceId === place.id}
                isAdded={addedPlaceIds.includes(place.id)}
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
        open={pendingPlace !== null}
        title="Are you sure to add this trip"
        confirmLabel="Add Trip"
        confirmingLabel="Adding..."
        isConfirming={addingPlaceId !== null}
        onConfirm={handleConfirmAddTrip}
        onCancel={closeAddTripDialog}
      />

      <ConfirmDialog
        open={duplicateTripDialogOpen}
        title="You are already have this trip"
        confirmLabel="OK"
        cancelLabel="Close"
        onConfirm={() => setDuplicateTripDialogOpen(false)}
        onCancel={() => setDuplicateTripDialogOpen(false)}
      />
    </div>
  );
};

export default Recommendations;

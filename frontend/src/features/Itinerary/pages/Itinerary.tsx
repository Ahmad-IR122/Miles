import { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/api";

import { Box, CircularProgress, Container } from "@mui/material";
import { DaySelector } from "../components/DaySelector";
import { EmptyItineraryMessage } from "../components/EmptyItineraryMessage";
import { ItineraryHeader } from "../components/ItineraryHeader";
import { ItinerarySectionHeader } from "../components/ItinerarySectionHeader";
import { Timeline } from "../components/Timeline";
import { TripSummarySidebar } from "../components/TripSummarySidebar";
import { useItineraryStyles } from "../styles/Itinerary.styles";

export type ActivityCategory =
  | "culture"
  | "food"
  | "dining"
  | "shopping"
  | "nature";

export type Activity =
  | string
  | {
      title: string;
      category?: ActivityCategory | string;
      time?: string;
      duration?: string;
      description?: string;
      location?: string;
      transport?: string;
      cost?: string;
      weather?: string;
      icon?: string;
    };

export type Day = {
  day: number;
  activities: Activity[];
};

export type Trip = {
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  budget?: string;
  estimatedSpent?: string;
  days?: Day[];
};

const toDate = (date?: string) => {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatShortDate = (date?: Date) =>
  date?.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) ?? "";

export const formatDayDate = (startDate?: string, offset = 0) => {
  const date = toDate(startDate);

  if (!date) {
    return "";
  }

  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) {
    return "";
  }

  return [formatShortDate(toDate(startDate)), formatShortDate(toDate(endDate))]
    .filter(Boolean)
    .join(" - ");
};

function Itinerary() {
  const classes = useItineraryStyles();
  const [itineraries, setItineraryData] = useState<Trip[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await api.get("/itinerary");
        const payload = response?.data?.data ?? response?.data ?? [];
        setItineraryData(Array.isArray(payload) ? payload : []);
        setErrorMessage("");
      } catch (error) {
        console.error("Error fetching itinerary data:", error);
        setErrorMessage(
          "We couldn't load the itinerary. Please check that the backend is running and try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, []);

  const trip = itineraries[0];
  const days = useMemo(() => trip?.days ?? [], [trip?.days]);
  const activeDay = days[selectedDay] ?? days[0];
  const dateRange = formatDateRange(trip?.startDate, trip?.endDate);

  if (loading) {
    return (
      <Box className={classes.loading}>
        <CircularProgress />
        <Box className={classes.loadingMessage}>Loading itinerary...</Box>
      </Box>
    );
  }

  return (
    <Box className={classes.page}>
      <Container className={classes.shell}>
        <Box className={classes.layout}>
          <Box className={classes.mainContent}>
            <ItineraryHeader
              budget={trip?.budget}
              dateRange={dateRange}
              daysCount={days.length}
              destination={trip?.destination}
              travelers={trip?.travelers}
            />

            {!trip && (
              <EmptyItineraryMessage
                message={
                  errorMessage ||
                  "No itinerary data was returned. Create or generate a trip to see your day-by-day plan here."
                }
              />
            )}

            {trip && (
              <>
                <DaySelector
                  days={days}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  startDate={trip.startDate}
                />

                {activeDay ? (
                  <>
                    <ItinerarySectionHeader
                      dateLabel={formatDayDate(trip.startDate, selectedDay)}
                      dayNumber={activeDay.day}
                    />
                    <Timeline day={activeDay} destination={trip.destination} />
                  </>
                ) : (
                  <EmptyItineraryMessage message="This itinerary does not include any days yet. Add trip days to display activities here." />
                )}
              </>
            )}
          </Box>

          {trip && <TripSummarySidebar trip={trip} />}
        </Box>
      </Container>
    </Box>
  );
}

export default Itinerary;

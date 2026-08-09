import { useMemo, useState } from "react";

import { Box, CircularProgress, Container } from "@mui/material";
import { DaySelector } from "../components/DaySelector";
import { EmptyItineraryMessage } from "../components/EmptyItineraryMessage";
import { ItineraryHeader } from "../components/ItineraryHeader";
import { ItinerarySectionHeader } from "../components/ItinerarySectionHeader";
import { Timeline } from "../components/Timeline";
import { TripSummarySidebar } from "../components/TripSummarySidebar";
import { useItinerary } from "../hooks/useItinerary.hooks";
import { useItineraryStyles } from "../styles/Itinerary.styles";
import { formatDateRange, formatDayDate } from "../utils/dateUtils";

const Itinerary = () => {
  const classes = useItineraryStyles();
  const { errorMessage, itineraries, loading } = useItinerary();
  const [selectedDay, setSelectedDay] = useState(0);

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
};

export default Itinerary;

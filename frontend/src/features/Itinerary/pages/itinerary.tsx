import { useMemo, useState } from "react";

import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import { DaySelector } from "../components/daySelector";
import { EmptyItineraryMessage } from "../components/emptyItineraryMessage";
import { ItineraryHeader } from "../components/itineraryHeader";
import { ItinerarySectionHeader } from "../components/itinerarySectionHeader";
import { Timeline } from "../components/timeline";
import { TripSummarySidebar } from "../components/tripSummarySidebar";
import { useItinerary } from "../hooks/useItinerary";
import { useItineraryStyles } from "../styles/itinerary.styles";
import { formatDateRange, formatDayDate } from "../utils/dateUtils";

const Itinerary = () => {
  const classes = useItineraryStyles();
  const {
    clearRegenerateError,
    deleteActivity,
    errorMessage,
    isRegenerating,
    itineraries,
    loading,
    regenerateBusy,
    regenerateError,
    regenerateSingleActivity,
    regenerateSingleDay,
    regenerateWholeTrip,
    updateActivity,
  } = useItinerary();
  const [selectedDay, setSelectedDay] = useState(0);
  const [confirmRegeneratePlan, setConfirmRegeneratePlan] = useState(false);

  const trip = itineraries[0];
  const days = useMemo(() => trip?.days ?? [], [trip?.days]);
  const activeDay = days[selectedDay] ?? days[0];
  const dateRange = formatDateRange(trip?.startDate, trip?.endDate);

  // Regeneration is driven by ids that only come from the backend, so the
  // controls stay hidden when the page is showing fixture data.
  const canRegenerate = !!trip?.id;
  const tripRegenerating = isRegenerating("trip", trip?.id ?? "");
  const dayRegenerating = isRegenerating(
    "day",
    activeDay?.id ?? String(activeDay?.day ?? ""),
  );

  const isActivityRegenerating = (activityIndex: number) => {
    const activity = activeDay?.activities?.[activityIndex];
    const activityId = typeof activity === "string" ? undefined : activity?.id;
    return activityId ? isRegenerating("activity", activityId) : false;
  };

  const acceptRegeneratePlan = () => {
    setConfirmRegeneratePlan(false);
    regenerateWholeTrip();
  };

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
              isRegenerating={tripRegenerating}
              onRegeneratePlan={
                canRegenerate ? () => setConfirmRegeneratePlan(true) : undefined
              }
              regenerateDisabled={regenerateBusy}
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
                      isRegenerating={dayRegenerating}
                      onRegenerateDay={
                        canRegenerate
                          ? () => regenerateSingleDay(selectedDay)
                          : undefined
                      }
                      regenerateDisabled={regenerateBusy}
                    />
                    <Timeline
                      day={activeDay}
                      dayIndex={selectedDay}
                      destination={trip.destination}
                      isActivityRegenerating={isActivityRegenerating}
                      onDeleteActivity={deleteActivity}
                      onRegenerateActivity={
                        canRegenerate ? regenerateSingleActivity : undefined
                      }
                      onUpdateActivity={updateActivity}
                      regenerateDisabled={regenerateBusy}
                    />
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

      <Dialog
        onClose={() => setConfirmRegeneratePlan(false)}
        open={confirmRegeneratePlan}
      >
        <DialogTitle>Regenerate the whole plan?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This replaces all {days.length} days of your itinerary. Activities
            you liked will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRegeneratePlan(false)}>
            Cancel
          </Button>
          <Button onClick={acceptRegeneratePlan}>Regenerate</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        autoHideDuration={6000}
        message={regenerateError}
        onClose={clearRegenerateError}
        open={regenerateError !== ""}
      />
    </Box>
  );
};

export default Itinerary;

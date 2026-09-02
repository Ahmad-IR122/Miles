import { useMemo, useState } from "react";

import { mergeClasses } from "@griffel/react";
import { Box, Container, IconButton, Snackbar, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ConfirmDialog from "../../../common/confirmDialog/confirmDialog";
import { LoadingScreen } from "../../../components/loadingScreen/loadingScreen";
import { DaySelector } from "../components/daySelector";
import { EmptyItineraryMessage } from "../components/emptyItineraryMessage";
import { ItineraryHeader } from "../components/itineraryHeader";
import { Timeline } from "../components/timeline";
import { useItinerary } from "../hooks/useItinerary";
import { useItineraryStyles } from "../styles/itinerary.styles";
import { formatDateRange } from "../utils/dateUtils";

const Itinerary = () => {
  const classes = useItineraryStyles();
  const {
    addActivityToDay,
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
  const daysCount = days.length;

  const facts = [
    dateRange ? { label: "Dates", value: dateRange } : null,
    daysCount
      ? {
        label: "Duration",
        value: `${daysCount} day${daysCount === 1 ? "" : "s"}`,
      }
      : null,
    trip?.travelers ? { label: "Travelers", value: `${trip.travelers}` } : null,
    trip?.budget ? { label: "Budget", value: trip.budget } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  // Regeneration is driven by ids that only come from the backend, so the
  // controls stay disabled when the page is showing fixture data.
  const canRegenerate = !!trip?.id;

  const isActivityRegenerating = (activityIndex: number) => {
    const activity = activeDay?.activities?.[activityIndex];
    const activityId = typeof activity === "string" ? undefined : activity?.id;
    return activityId ? isRegenerating("activity", activityId) : false;
  };

  // Day/trip regenerate and add-activity all replace the whole visible
  // timeline, so they share one dimmed overlay instead of each activity
  // card showing its own spinner.
  const dayTargetId = activeDay?.id ?? String(activeDay?.day ?? "");
  const dayRegenerating = isRegenerating("day", dayTargetId);
  const tripRegenerating = isRegenerating("trip", trip?.id ?? "");
  const addingActivity = isRegenerating("add", dayTargetId);
  const timelineBusy = dayRegenerating || tripRegenerating || addingActivity;
  const timelineBusyLabel = tripRegenerating
    ? "Regenerating your whole trip..."
    : dayRegenerating
      ? "Regenerating this day..."
      : "Adding your activity...";

  const acceptRegeneratePlan = () => {
    setConfirmRegeneratePlan(false);
    regenerateWholeTrip();
  };

  if (loading) {
    return (
      <LoadingScreen
        ariaLabel="Itinerary loading progress"
        title="Loading itinerary..."
      />
    );
  }

  return (
    <Box className={classes.page}>
      <Container className={classes.shell}>
        <Box className={mergeClasses(classes.layout, classes.noSummaryLayout)}>
          <Box className={classes.mainContent}>
            <ItineraryHeader
              activeDayActivities={activeDay?.activities}
              destination={trip?.destination}
              destinations={trip?.destinations}
            />

            {trip && (
              <>
                {facts.length > 0 && (
                  <Box className={classes.factsRow}>
                    {facts.map((fact) => (
                      <Box className={classes.factCell} key={fact.label}>
                        <span className={classes.factLabel}>{fact.label}</span>
                        <span className={classes.factValue}>{fact.value}</span>
                      </Box>
                    ))}
                  </Box>
                )}

                <DaySelector
                  days={days}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  startDate={trip.startDate}
                />

                <Box className={classes.dayActionsRow}>
                  <Tooltip title="Add activity">
                    <span>
                      <IconButton
                        aria-label="Add activity"
                        className={classes.dayActionButton}
                        disabled={!canRegenerate || regenerateBusy}
                        onClick={() => addActivityToDay(selectedDay)}
                      >
                        <AddIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Regenerate this day">
                    <span>
                      <IconButton
                        aria-label="Regenerate this day"
                        className={classes.dayActionButton}
                        disabled={!canRegenerate || regenerateBusy}
                        onClick={() => regenerateSingleDay(selectedDay)}
                      >
                        <AutoAwesomeIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Regenerate whole trip">
                    <span>
                      <IconButton
                        aria-label="Regenerate whole trip"
                        className={classes.dayActionButton}
                        disabled={!canRegenerate || regenerateBusy}
                        onClick={() => setConfirmRegeneratePlan(true)}
                      >
                        <RestartAltIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </>
            )}

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
                {activeDay ? (
                  <Timeline
                    busy={timelineBusy}
                    busyLabel={timelineBusyLabel}
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
                ) : (
                  <EmptyItineraryMessage message="This itinerary does not include any days yet. Add trip days to display activities here." />
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>

      <ConfirmDialog
        open={confirmRegeneratePlan}
        title="Regenerate the whole plan?"
        description={`This replaces all ${days.length} days of your itinerary. Activities you liked will be lost.`}
        confirmLabel="Regenerate"
        isConfirming={tripRegenerating}
        onConfirm={acceptRegeneratePlan}
        onCancel={() => setConfirmRegeneratePlan(false)}
      />

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

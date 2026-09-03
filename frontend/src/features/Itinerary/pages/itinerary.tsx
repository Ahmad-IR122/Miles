import { useEffect, useMemo, useState } from "react";

import { mergeClasses } from "@griffel/react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useLocation, useNavigate } from "react-router-dom";
import { interestOptions } from "../../../constants/interests";
import ConfirmDialog from "../../../common/confirmDialog/confirmDialog";
import { semanticColors, warmShadows } from "../../../common/theme/colors";
import { LoadingScreen } from "../../../components/loadingScreen/loadingScreen";
import { DaySelector } from "../components/daySelector";
import { EmptyItineraryMessage } from "../components/emptyItineraryMessage";
import { ItineraryHeader } from "../components/itineraryHeader";
import { Timeline } from "../components/timeline";
import { useItinerary } from "../hooks/useItinerary";
import { useItineraryStyles } from "../styles/itinerary.styles";
import { formatDateRange } from "../utils/dateUtils";
import { getFieldSx } from "../../../components/tripPlanningForm/tripPlanningForm.styles";
import type { RecommendationPlace } from "../../recommendations/types/types";

const emptyNewActivity = {
  title: "",
  description: "",
  location: "",
  price: "",
  category: "",
  startTime: "13:00",
  endTime: "14:00",
};
type ActivityDialogValues = typeof emptyNewActivity;
type PendingActivityState = {
  pendingActivity?: RecommendationPlace;
} | null;

const timeToMinutes = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return undefined;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (match[3]) {
    hours %= 12;
    if (match[3].toUpperCase() === "PM") hours += 12;
  }
  return hours * 60 + minutes;
};

const getActivityTypeOption = (value: string) =>
  interestOptions.find(
    (option) => option.toLowerCase() === value.trim().toLowerCase(),
  ) ?? "Other";

const formatApiTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00`;

const formatTimeLabel = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  const hour = hours % 12 || 12;
  return `${hour}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
};

const getDiscoverActivityCost = (price: string) => {
  const match = price.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
};

const timeOptions = Array.from({ length: 47 }, (_, index) => {
  const minutes = index * 30;
  return formatApiTime(minutes).slice(0, 5);
});

const Itinerary = () => {
  const classes = useItineraryStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state ?? null) as PendingActivityState;
  const initialPendingActivity = locationState?.pendingActivity ?? null;
  const {
    activityError,
    addActivityToDay,
    clearActivityError,
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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{
    dayIndex: number;
    activityIndex: number;
  } | null>(null);
  const [newActivity, setNewActivity] = useState(emptyNewActivity);
  const [pendingActivityTime, setPendingActivityTime] = useState<string>();
  const [addActivityError, setAddActivityError] = useState("");
  const [pendingDiscoverActivity, setPendingDiscoverActivity] =
    useState<RecommendationPlace | null>(initialPendingActivity);
  const [daySelectOpen, setDaySelectOpen] = useState(!!initialPendingActivity);
  const [discoverActivityMessage, setDiscoverActivityMessage] = useState("");
  const [discoverActivityError, setDiscoverActivityError] = useState("");
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

  useEffect(() => {
    if (!locationState?.pendingActivity) {
      return;
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, locationState?.pendingActivity, navigate]);

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
  const closeActivityDialog = () => {
    setAddDialogOpen(false);
    setAddActivityError("");
  };

  const busyIntervals = (activeDay?.activities ?? [])
    .map((activity, activityIndex) => ({ activity, activityIndex }))
    .filter(
      ({ activity, activityIndex }) =>
        typeof activity !== "string" &&
        (editingActivity === null ||
          editingActivity.dayIndex !== selectedDay ||
          editingActivity.activityIndex !== activityIndex),
    )
    .map(({ activity }) =>
      typeof activity === "string"
        ? null
        : {
          start: timeToMinutes(activity.time),
          end: timeToMinutes(activity.endTime),
        },
    )
    .filter(
      (interval): interval is { start: number; end: number } =>
        interval !== null &&
        interval.start !== undefined &&
        interval.end !== undefined,
    );
  const freeStartTimes = timeOptions.filter((start) => {
    const startMinutes = timeToMinutes(start);
    return (
      startMinutes !== undefined &&
      !busyIntervals.some(
        (interval) =>
          startMinutes >= interval.start && startMinutes < interval.end,
      )
    );
  });
  const freeEndTimes = timeOptions.filter((end) => {
    const startMinutes = timeToMinutes(newActivity.startTime);
    const endMinutes = timeToMinutes(end);
    if (
      startMinutes === undefined ||
      endMinutes === undefined ||
      endMinutes <= startMinutes
    ) {
      return false;
    }
    return !busyIntervals.some(
      (interval) => startMinutes < interval.end && endMinutes > interval.start,
    );
  });
  const selectableStartTimes =
    editingActivity && !freeStartTimes.includes(newActivity.startTime)
      ? [newActivity.startTime, ...freeStartTimes]
      : freeStartTimes;
  const selectableEndTimes =
    editingActivity && !freeEndTimes.includes(newActivity.endTime)
      ? [newActivity.endTime, ...freeEndTimes]
      : freeEndTimes;

  const openAddDialog = () => {
    setNewActivity({
      ...emptyNewActivity,
      startTime: "",
      endTime: "",
    });
    setEditingActivity(null);
    setAddActivityError("");
    setAddDialogOpen(true);
  };

  const openEditDialog = (
    dayIndex: number,
    activityIndex: number,
    activity: ActivityDialogValues,
  ) => {
    const startTime = timeToMinutes(activity.startTime);
    const endTime = timeToMinutes(activity.endTime);
    setNewActivity({
      ...activity,
      category: getActivityTypeOption(activity.category),
      startTime:
        startTime === undefined
          ? "13:00"
          : formatApiTime(startTime).slice(0, 5),
      endTime:
        endTime === undefined ? "14:00" : formatApiTime(endTime).slice(0, 5),
    });
    setEditingActivity({ dayIndex, activityIndex });
    setAddActivityError("");
    setAddDialogOpen(true);
  };

  const acceptRegeneratePlan = () => {
    setConfirmRegeneratePlan(false);
    regenerateWholeTrip();
  };

  const submitNewActivity = async () => {
    const startMinutes = timeToMinutes(newActivity.startTime);
    const endMinutes = timeToMinutes(newActivity.endTime);
    const price = Number(newActivity.price);
    const title = newActivity.title.trim();

    if (!title) {
      setAddActivityError("Title is required.");
      return;
    }

    if (
      startMinutes === undefined ||
      endMinutes === undefined ||
      endMinutes <= startMinutes
    ) {
      setAddActivityError("Choose a valid start and end time.");
      return;
    }

    const isBusy = busyIntervals.some(
      (interval) => startMinutes < interval.end && endMinutes > interval.start,
    );

    if (isBusy) {
      setAddActivityError(
        "That time overlaps an existing activity on this day.",
      );
      return;
    }

    const activityPayload = {
      description: newActivity.description.trim(),
      location_name: newActivity.location.trim(),
      estimated_cost: Number.isFinite(price) && price >= 0 ? price : undefined,
      category: newActivity.category,
      start_time: formatApiTime(startMinutes),
      end_time: formatApiTime(endMinutes),
    };
    if (editingActivity) {
      updateActivity(editingActivity.dayIndex, editingActivity.activityIndex, {
        title,
        description: activityPayload.description,
        location: activityPayload.location_name,
        price: newActivity.price,
        category: activityPayload.category,
        startTime: activityPayload.start_time,
        endTime: activityPayload.end_time,
      });
    } else {
      setPendingActivityTime(formatTimeLabel(newActivity.startTime));
      await addActivityToDay(selectedDay, { name: title, ...activityPayload });
    }
    setAddDialogOpen(false);
    setEditingActivity(null);
    setNewActivity(emptyNewActivity);
    setAddActivityError("");
  };

  const closeDaySelectDialog = () => {
    if (regenerateBusy) {
      return;
    }

    setDaySelectOpen(false);
    setPendingDiscoverActivity(null);
  };

  const addDiscoverActivityToDay = async (dayIndex: number) => {
    if (!pendingDiscoverActivity || !days[dayIndex]) {
      setDiscoverActivityError("Choose a valid day.");
      return;
    }

    setSelectedDay(dayIndex);
    setPendingActivityTime(undefined);
    setDiscoverActivityError("");
    setDiscoverActivityMessage("");

    const result = await addActivityToDay(dayIndex, {
      name: pendingDiscoverActivity.title,
      description: pendingDiscoverActivity.desc,
      location_name: pendingDiscoverActivity.location,
      estimated_cost: getDiscoverActivityCost(pendingDiscoverActivity.price),
      category: pendingDiscoverActivity.category,
    });

    if (result === "added") {
      setDaySelectOpen(false);
      setPendingDiscoverActivity(null);
      setDiscoverActivityMessage("Activity successfully added");
      return;
    }

    if (result === "duplicate") {
      setDiscoverActivityError(
        "This activity is already added to the selected day.",
      );
      return;
    }

    setDiscoverActivityError(
      "We couldn't add that activity. Please try again.",
    );
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
                        onClick={() => {
                          openAddDialog();
                        }}
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
                  "Create or generate a trip to see your day-by-day plan here."
                }
              />
            )}

            {trip && (
              <>
                {activeDay ? (
                  activeDay.activities.length > 0 ? (
                    <Timeline
                      busy={timelineBusy && !addingActivity}
                      busyLabel={timelineBusyLabel}
                      day={activeDay}
                      dayIndex={selectedDay}
                      destination={trip.destination}
                      isActivityRegenerating={isActivityRegenerating}
                      showLoadingSkeletons={!addingActivity}
                      pendingActivityTime={
                        addingActivity ? pendingActivityTime : undefined
                      }
                      onDeleteActivity={deleteActivity}
                      onEditActivity={openEditDialog}
                      onRegenerateActivity={
                        canRegenerate ? regenerateSingleActivity : undefined
                      }
                      regenerateDisabled={regenerateBusy}
                    />
                  ) : (
                    <Box sx={{ py: 8, textAlign: "center" }}>
                      <Box sx={{ color: "text.secondary", mb: 2 }}>
                        No activities planned for this day yet.
                      </Box>
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                          openAddDialog();
                        }}
                        variant="contained"
                      >
                        Add activity
                      </Button>
                    </Box>
                  )
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

      <Dialog
        fullWidth
        maxWidth="xs"
        onClose={closeDaySelectDialog}
        open={daySelectOpen && pendingDiscoverActivity !== null && !!trip}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: semanticColors.bgPrimary,
              border: `1px solid ${semanticColors.borderLight}`,
              borderRadius: "24px",
              boxShadow: warmShadows.lg,
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color: semanticColors.textPrimary,
            fontWeight: 800,
            pb: 1,
            pt: 3,
          }}
        >
          Add activity to day
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            borderColor: semanticColors.borderLight,
            p: { sm: 3, xs: 2.5 },
          }}
        >
          <Stack spacing={1.5}>
            {days.map((day, dayIndex) => (
              <Button
                disabled={regenerateBusy}
                key={day.id ?? day.day}
                onClick={() => addDiscoverActivityToDay(dayIndex)}
                sx={{ justifyContent: "flex-start", textTransform: "none" }}
                variant={selectedDay === dayIndex ? "contained" : "outlined"}
              >
                Day {day.day}
              </Button>
            ))}
          </Stack>
          {discoverActivityError && (
            <Box role="alert" sx={{ color: semanticColors.textError, mt: 2 }}>
              {discoverActivityError}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 2.5 }}>
          <Button
            disabled={regenerateBusy}
            onClick={closeDaySelectDialog}
            sx={{ color: semanticColors.textSecondary, textTransform: "none" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={closeActivityDialog}
        open={addDialogOpen}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: semanticColors.bgPrimary,
              border: `1px solid ${semanticColors.borderLight}`,
              borderRadius: "24px",
              boxShadow: warmShadows.lg,
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            color: semanticColors.textPrimary,
            fontWeight: 800,
            pb: 1,
            pt: 3,
          }}
        >
          {editingActivity ? "Edit activity" : "Add activity"}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            borderColor: semanticColors.borderLight,
            p: { sm: 3, xs: 2.5 },
          }}
        >
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControl
              className={classes.activityTimeSelect}
              fullWidth
              required
              sx={getFieldSx(false)}
            >
              <InputLabel id="activity-type-label" required shrink>
                Activity type
              </InputLabel>
              <Select
                label="Activity type"
                labelId="activity-type-label"
                native
                onChange={(event) =>
                  setNewActivity((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                value={newActivity.category}
              >
                {interestOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              fullWidth
              label="Title"
              onChange={(event) =>
                setNewActivity((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              sx={getFieldSx(false)}
              value={newActivity.title}
            />
            <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
              <FormControl
                className={classes.activityTimeSelect}
                fullWidth
                required
                sx={getFieldSx(false)}
              >
                <InputLabel id="activity-start-time-label" required shrink>
                  Start time
                </InputLabel>
                <Select
                  label="Start time"
                  labelId="activity-start-time-label"
                  native
                  onChange={(event) => {
                    const startTime = event.target.value;
                    setNewActivity((current) => ({
                      ...current,
                      startTime,
                      endTime: "",
                    }));
                    setAddActivityError("");
                  }}
                  value={
                    selectableStartTimes.includes(newActivity.startTime)
                      ? newActivity.startTime
                      : ""
                  }
                >
                  {selectableStartTimes.map((time) => (
                    <option key={time} value={time}>
                      {formatTimeLabel(time)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                className={classes.activityTimeSelect}
                fullWidth
                required
                sx={getFieldSx(false)}
              >
                <InputLabel id="activity-end-time-label" required shrink>
                  End time
                </InputLabel>
                <Select
                  disabled={!newActivity.startTime}
                  label="End time"
                  labelId="activity-end-time-label"
                  native
                  onChange={(event) =>
                    setNewActivity((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                  value={
                    selectableEndTimes.includes(newActivity.endTime)
                      ? newActivity.endTime
                      : ""
                  }
                >
                  {selectableEndTimes.map((time) => (
                    <option key={time} value={time}>
                      {formatTimeLabel(time)}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              fullWidth
              label="Description"
              multiline
              onChange={(event) =>
                setNewActivity((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              sx={getFieldSx(false)}
              value={newActivity.description}
            />
            <TextField
              fullWidth
              label="Location"
              onChange={(event) =>
                setNewActivity((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
              sx={getFieldSx(false)}
              value={newActivity.location}
            />
            <TextField
              fullWidth
              label="Cost ($)"
              onChange={(event) =>
                setNewActivity((current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
              slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
              sx={getFieldSx(false)}
              type="number"
              value={newActivity.price}
            />
          </Stack>
        </DialogContent>
        {addActivityError && (
          <Box
            role="alert"
            sx={{ color: semanticColors.textError, px: 2.5, pb: 1 }}
          >
            {addActivityError}
          </Box>
        )}
        <DialogActions sx={{ gap: 1, p: 2.5 }}>
          <Button
            onClick={closeActivityDialog}
            sx={{ color: semanticColors.textSecondary, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            disabled={!newActivity.category || !newActivity.title.trim()}
            onClick={submitNewActivity}
            sx={{
              borderRadius: "999px",
              color: semanticColors.textOnAccent,
              px: 2.5,
              textTransform: "none",
            }}
            variant="contained"
          >
            {editingActivity ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        autoHideDuration={6000}
        message={regenerateError || activityError || discoverActivityMessage}
        onClose={() => {
          clearRegenerateError();
          clearActivityError();
          setDiscoverActivityMessage("");
        }}
        open={
          regenerateError !== "" ||
          activityError !== "" ||
          discoverActivityMessage !== ""
        }
      />
    </Box>
  );
};

export default Itinerary;

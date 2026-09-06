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
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useBlocker, useLocation, useNavigate } from "react-router-dom";
import { interestOptions } from "../../../constants/interests";
import ConfirmDialog from "../../../common/confirmDialog/confirmDialog";
import Toast from "../../../common/toast/toast";
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
import type { Activity } from "../types/itinerary.types";

const emptyNewActivity = {
  title: "",
  description: "",
  location: "",
  price: "",
  // The type <select> below is native, with no blank/placeholder option, so
  // a browser with no matching value just falls back to visually showing
  // the first option ("Adventure") anyway - defaulting the real state to
  // match it, rather than "", keeps what's shown and what's actually
  // selected in sync, so the Add button isn't stuck disabled until the user
  // touches a field that already looked filled in.
  category: interestOptions[0],
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

// Activities added from Discover don't come with a time slot of their own,
// so they're scheduled right after whatever's already the last thing in the
// day (9 AM if the day is still empty), running for a flat hour. Wrapped
// with % 1440 so a day that already runs past 11 PM doesn't overflow into an
// invalid "24:xx" time.
const DEFAULT_DAY_START_MINUTES = 9 * 60;
const NEW_DISCOVER_ACTIVITY_DURATION_MINUTES = 60;
const wrapMinutes = (minutes: number) => ((minutes % 1440) + 1440) % 1440;

const getDayEndMinutes = (activities: Activity[]) => {
  let latest: number | undefined;
  activities.forEach((activity) => {
    if (typeof activity === "string") return;
    const end = timeToMinutes(activity.endTime) ?? timeToMinutes(activity.time);
    if (end !== undefined && (latest === undefined || end > latest)) {
      latest = end;
    }
  });
  return latest ?? DEFAULT_DAY_START_MINUTES;
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
    clearOrderError,
    clearRegenerateError,
    deleteActivity,
    dirtyDayIndex,
    discardDayOrder,
    errorMessage,
    isRegenerating,
    itineraries,
    loading,
    orderError,
    regenerateBusy,
    regenerateError,
    regenerateSingleActivity,
    regenerateSingleDay,
    regenerateWholeTrip,
    reorderDayActivities,
    saveDayOrder,
    savingOrder,
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
  // Surfaces failures from an add-activity request that's already running in
  // the background (see submitNewActivity) - by the time those resolve, the
  // dialog itself is already closed, so they can't use addActivityError.
  const [addActivityBackgroundError, setAddActivityBackgroundError] =
    useState("");
  const [pendingDiscoverActivity, setPendingDiscoverActivity] =
    useState<RecommendationPlace | null>(initialPendingActivity);
  const [daySelectOpen, setDaySelectOpen] = useState(!!initialPendingActivity);
  // Picking a day just highlights it in the dialog - the actual add only
  // happens once Confirm is pressed, so a stray click can't immediately
  // commit before the user's sure which day they meant.
  const [selectedDayForAdd, setSelectedDayForAdd] = useState<number | null>(
    null,
  );
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
  const isSelectedDayDirty = dirtyDayIndex === selectedDay;

  // Reordering only ever touches one day at a time - while a different day
  // has unsaved changes, dragging on this one is blocked rather than
  // juggling two in-flight drafts.
  const reorderDisabledForSelectedDay =
    regenerateBusy ||
    savingOrder ||
    (dirtyDayIndex !== null && dirtyDayIndex !== selectedDay);

  // Warn before an in-app navigation (clicking to another page) discards an
  // unsaved reorder.
  const orderBlocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyDayIndex !== null &&
      currentLocation.pathname !== nextLocation.pathname,
  );

  // Warn before a full page unload (reload/close tab) does the same - the
  // browser shows its own generic prompt here, the message text is ignored.
  useEffect(() => {
    if (dirtyDayIndex === null) return undefined;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirtyDayIndex]);

  const confirmSaveAndLeave = async () => {
    const saved = await saveDayOrder();
    if (saved) {
      orderBlocker.proceed?.();
    }
  };

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
      setAddDialogOpen(false);
      setEditingActivity(null);
      setNewActivity(emptyNewActivity);
      setAddActivityError("");
      return;
    }

    // Adding a new activity is a real backend request, which takes a moment.
    // This used to await it with the dialog still open, so the only feedback
    // during that wait was... nothing - the dialog just sat there looking
    // unresponsive, which read as "my first click didn't register" and led
    // straight to a second click. The dialog now closes the instant
    // validation passes, and the request runs in the background: the
    // timeline already shows a "still adding" skeleton row/overlay
    // (addingActivity/pendingActivityTime, wired below) while it's in
    // flight, so there's always visible feedback, just not blocking a
    // second dialog interaction. A failure (duplicate, request error, day
    // gone) can't reuse addActivityError since the dialog is already closed
    // by then - it goes to addActivityBackgroundError instead, which feeds
    // the same general error toast as everything else on this page.
    setAddDialogOpen(false);
    setEditingActivity(null);
    setNewActivity(emptyNewActivity);
    setAddActivityError("");
    setPendingActivityTime(formatTimeLabel(newActivity.startTime));
    void addActivityToDay(selectedDay, {
      name: title,
      ...activityPayload,
    }).then((result) => {
      setPendingActivityTime(undefined);
      if (result === "duplicate") {
        setAddActivityBackgroundError(
          "This activity is already added to this day.",
        );
      } else if (result === "missing-day") {
        setAddActivityBackgroundError(
          "We couldn't add that activity. Please try again.",
        );
      }
      // "failed" already surfaces via the shared regenerate error toast;
      // "added" needs no extra message - the new card appearing is it.
    });
  };

  const closeDaySelectDialog = () => {
    if (regenerateBusy) {
      return;
    }

    setDaySelectOpen(false);
    setPendingDiscoverActivity(null);
    setSelectedDayForAdd(null);
  };

  const confirmAddDiscoverActivity = () => {
    if (selectedDayForAdd === null) {
      setDiscoverActivityError("Choose a day first.");
      return;
    }
    void addDiscoverActivityToDay(selectedDayForAdd);
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

    // Scheduled right after whatever's currently last in the day (or 9 AM if
    // the day is empty), for a flat hour - a real time slot instead of a
    // duration-only placeholder.
    const startMinutes = wrapMinutes(
      getDayEndMinutes(days[dayIndex].activities),
    );
    const endMinutes = wrapMinutes(
      startMinutes + NEW_DISCOVER_ACTIVITY_DURATION_MINUTES,
    );

    const result = await addActivityToDay(dayIndex, {
      name: pendingDiscoverActivity.title,
      description: pendingDiscoverActivity.desc,
      location_name: pendingDiscoverActivity.location,
      estimated_cost: getDiscoverActivityCost(pendingDiscoverActivity.price),
      category: pendingDiscoverActivity.category,
      start_time: formatApiTime(startMinutes),
      end_time: formatApiTime(endMinutes),
    });

    if (result === "added") {
      setDaySelectOpen(false);
      setPendingDiscoverActivity(null);
      setSelectedDayForAdd(null);
      setDiscoverActivityMessage(
        `${pendingDiscoverActivity.title} was added to Day ${days[dayIndex].day}.`,
      );
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
                    <>
                      {isSelectedDayDirty && (
                        <Box className={classes.unsavedOrderBar}>
                          <span className={classes.unsavedOrderText}>
                            You reordered this day but haven&apos;t saved it
                            yet.
                          </span>
                          <Box className={classes.unsavedOrderActions}>
                            <Button
                              disabled={savingOrder}
                              onClick={discardDayOrder}
                              sx={{
                                color: semanticColors.textSecondary,
                                textTransform: "none",
                              }}
                            >
                              Discard
                            </Button>
                            <Button
                              disabled={savingOrder}
                              onClick={saveDayOrder}
                              sx={{
                                borderRadius: "999px",
                                color: semanticColors.textOnAccent,
                                px: 2.5,
                                textTransform: "none",
                              }}
                              variant="contained"
                            >
                              {savingOrder ? "Saving…" : "Save changes"}
                            </Button>
                          </Box>
                        </Box>
                      )}

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
                        onReorderActivity={
                          canRegenerate ? reorderDayActivities : undefined
                        }
                        reorderDisabled={reorderDisabledForSelectedDay}
                        regenerateDisabled={regenerateBusy}
                      />
                    </>
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

      <ConfirmDialog
        open={discoverActivityMessage !== ""}
        variant="success"
        title="Activity added successfully"
        description={discoverActivityMessage}
        confirmLabel="Done"
        onConfirm={() => setDiscoverActivityMessage("")}
        onCancel={() => setDiscoverActivityMessage("")}
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
                onClick={() => {
                  setSelectedDayForAdd(dayIndex);
                  setDiscoverActivityError("");
                }}
                sx={{ justifyContent: "flex-start", textTransform: "none" }}
                variant={
                  selectedDayForAdd === dayIndex ? "contained" : "outlined"
                }
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
          <Button
            disabled={regenerateBusy || selectedDayForAdd === null}
            onClick={confirmAddDiscoverActivity}
            sx={{ textTransform: "none" }}
            variant="contained"
          >
            Confirm
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
                  {/* A native <select> with no option matching its current
                      value falls back to visually displaying the FIRST real
                      option instead of nothing - the same trap as the
                      activity-type default bug above. Without this
                      placeholder, that meant Start (and especially End, which
                      auto-enables with a blank value right after Start
                      changes) could visually show a plausible time that was
                      never actually chosen, so clicking Add - while both
                      fields "looked" filled in - failed validation with a
                      confusing "choose a valid start and end time", and only
                      an explicit reselect actually committed a real value. */}
                  <option disabled value="">
                    Select
                  </option>
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
                  onChange={(event) => {
                    setNewActivity((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }));
                    setAddActivityError("");
                  }}
                  value={
                    selectableEndTimes.includes(newActivity.endTime)
                      ? newActivity.endTime
                      : ""
                  }
                >
                  <option disabled value="">
                    Select
                  </option>
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
              sx={{
                ...getFieldSx(false),
                // Number inputs get browser-drawn up/down steppers by
                // default - hidden here since a "click to nudge the price
                // by $0.01" control doesn't add anything for a free-typed
                // cost field.
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
                "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                  {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
              }}
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

      <ConfirmDialog
        cancelLabel="Keep editing"
        confirmLabel="Save and leave"
        confirmingLabel="Saving…"
        description="You reordered this day's activities but haven't saved yet. Save now, or the changes will be lost."
        isConfirming={savingOrder}
        onCancel={() => orderBlocker.reset?.()}
        onConfirm={confirmSaveAndLeave}
        open={orderBlocker.state === "blocked"}
        title="Save your schedule changes?"
      />

      <Toast
        message={
          regenerateError ||
          activityError ||
          orderError ||
          addActivityBackgroundError
        }
        onClose={() => {
          clearRegenerateError();
          clearActivityError();
          clearOrderError();
          setAddActivityBackgroundError("");
        }}
        open={
          regenerateError !== "" ||
          activityError !== "" ||
          orderError !== "" ||
          addActivityBackgroundError !== ""
        }
        variant="warning"
      />
    </Box>
  );
};

export default Itinerary;

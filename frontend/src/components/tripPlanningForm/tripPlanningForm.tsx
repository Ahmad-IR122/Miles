/* eslint-disable indent -- Prettier and the legacy indent rule disagree on multiline JSX/ternaries. */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import axios from "axios";
import { mergeClasses } from "@griffel/react";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { LoadingScreen } from "../loadingScreen/loadingScreen";
import { useNavigate } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import { interestOptions } from "../../constants/interests";
import { generateItinerary } from "../../api/itinerary";
import { createTrip, getTrips } from "../../api/trip";
import { api } from "../../api/api";
import { saveTripPreferences } from "../../api/tripPreference";
import { buildTripPrompt } from "./tripPrompt";
import type { Trip } from "../../types/trip";
import AppButton from "../../common/AppButton/appButton";
import { semanticColors } from "../../common/theme/colors";
import { Country, City } from "country-state-city";
import type { ICountry, ICity } from "country-state-city";
import {
  getFieldSx,
  useTripPlanningFormStyles,
} from "./tripPlanningForm.styles";
import { routesPaths } from "../../routes/routesPaths";

const budgetSliderMin = 0;
const budgetSliderMax = 5000;
const budgetSliderStep = 50;
const defaultBudgetMax = 100;

type FieldErrors = {
  destinations: string;
  startDate: string;
  endDate: string;
  travelers: string;
  budget: string;
  interests: string;
};

const emptyFieldErrors: FieldErrors = {
  destinations: "",
  startDate: "",
  endDate: "",
  travelers: "",
  budget: "",
  interests: "",
};

// Maps an itinerary-generation failure to an i18n key, so the caller can
// translate it with `t()` rather than displaying hardcoded English.
const getGenerationErrorKey = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 502)
      return "tripPlanningForm.validation.aiServiceUnavailable";
    if (status === 409) return "tripPlanningForm.validation.tripDatesConflict";
    if (!error.response)
      return "tripPlanningForm.validation.networkUnreachable";
  }
  return "tripPlanningForm.validation.submitError";
};

const maxTripDays = 31;
const maxNotesLength = 1000;
const minimumGeneratingDisplayMs = 3600;
const minInterests = 3;
const minAdults = 1;
const maxTravelers = 10;

const allCountries: ICountry[] = Country.getAllCountries().sort((a, b) =>
  a.name.localeCompare(b.name),
);

const getCitiesForCountry = (isoCode: string): ICity[] =>
  (City.getCitiesOfCountry(isoCode) ?? []).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

const createBookedDay = (existingTrips: Trip[], bookedTooltip: string) => {
  const BookedDay = (props: PickerDayProps) => {
    const styles = useTripPlanningFormStyles();

    const { day, outsideCurrentMonth, ...other } = props;

    const isPast = day.isBefore(dayjs(), "day");

    const isBooked =
      !isPast &&
      !outsideCurrentMonth &&
      existingTrips.some(
        (trip) =>
          !day.isBefore(trip.start_date, "day") &&
          !day.isAfter(trip.end_date, "day"),
      );

    const dayElement = (
      <PickerDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        className={isBooked ? styles.bookedDay : undefined}
      />
    );

    if (!isBooked) return dayElement;

    return (
      <Tooltip title={bookedTooltip} arrow>
        <span>{dayElement}</span>
      </Tooltip>
    );
  };

  return BookedDay;
};

const TripPlanningForm = () => {
  const styles = useTripPlanningFormStyles();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tripDetailsRequiredMessage = t(
    "tripPlanningForm.validation.requiredFields",
  );
  const steps = [
    { num: 1, label: t("tripPlanningForm.steps.tripDetails") },
    { num: 2, label: t("tripPlanningForm.steps.travelersBudget") },
    { num: 3, label: t("tripPlanningForm.steps.interests") },
  ];

  const [step, setStep] = useState(1);

  const [budgetMax, setBudgetMax] = useState(defaultBudgetMax);

  const [destinationCountry, setDestinationCountry] = useState<ICountry | null>(
    null,
  );

  const [destinationCities, setDestinationCities] = useState<ICity[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [otherInterest, setOtherInterest] = useState("");
  const [notes, setNotes] = useState("");

  const interestsSectionRef = useRef<HTMLDivElement | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(emptyFieldErrors);

  const tripDuration =
    startDate?.isValid() === true &&
    endDate?.isValid() === true &&
    !endDate.isBefore(startDate, "day")
      ? endDate.diff(startDate, "day") + 1
      : 0;

  // Each chosen city is its own stop; the country on its own counts as one
  // stop when no city has been picked yet.
  const stops = ((): { country: string; city?: string }[] => {
    const country = destinationCountry?.name;

    if (!country) {
      return [];
    }

    return destinationCities.length > 0
      ? destinationCities.map((city) => ({ country, city: city.name }))
      : [{ country }];
  })();

  // The trip has to be at least one day per stop, otherwise there is no way to
  // hand every city a day when the payload is built.
  const hasEnoughDaysForStops = tripDuration >= stops.length;

  const isTripDetailsComplete =
    !!destinationCountry && tripDuration > 0 && hasEnoughDaysForStops;

  const totalTravelers = adults + children;

  const isTravelerCountValid =
    adults >= minAdults && children >= 0 && totalTravelers <= maxTravelers;

  const isTravelersBudgetComplete =
    isTravelerCountValid && budgetMax > budgetSliderMin;

  const isInterestsComplete = selectedInterests.length >= minInterests;

  // The brief handed on for itinerary generation. Built here so the notes the
  // traveler typed travel with the structured answers rather than being lost.
  const tripPrompt = buildTripPrompt({
    stops: destinationCountry
      ? [
          {
            country: destinationCountry.name,
            cities: destinationCities.map((city) => city.name),
          },
        ]
      : [],
    startDate: startDate?.format("YYYY-MM-DD") ?? "",
    endDate: endDate?.format("YYYY-MM-DD") ?? "",
    tripDuration,
    adults,
    children,
    budgetMin: budgetSliderMin,
    budgetMax,
    interests: selectedInterests.map((interest) =>
      interest === "Other" && otherInterest.trim()
        ? otherInterest.trim()
        : interest,
    ),
    notes,
  });

  const completedSteps = [
    isTripDetailsComplete,
    isTravelersBudgetComplete,
    isInterestsComplete,
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [existingTrips, setExistingTrips] = useState<Trip[]>([]);

  // Set when a trip was created but itinerary generation then failed, so a
  // retry can reuse it instead of re-creating it (which would 409 on the
  // same dates). Cleared whenever the details change or generation succeeds.
  const [pendingTrip, setPendingTrip] = useState<Trip | null>(null);

  useEffect(() => {
    getTrips()
      .then(({ data }) => setExistingTrips(data))
      .catch(() => {
        // Non-fatal.
      });
  }, []);

  const isDateBooked = (date: Dayjs) =>
    existingTrips.some(
      (trip) =>
        !date.isBefore(trip.start_date, "day") &&
        !date.isAfter(trip.end_date, "day"),
    );

  const rangesOverlap = (
    startA: Dayjs,
    endA: Dayjs,
    startB: Dayjs,
    endB: Dayjs,
  ) => !startA.isAfter(endB, "day") && !startB.isAfter(endA, "day");

  const BookedDay = useMemo(
    () =>
      createBookedDay(
        existingTrips,
        t("tripPlanningForm.tripDetails.bookedDayTooltip"),
      ),
    [existingTrips, t],
  );

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) =>
      current[field]
        ? {
            ...current,
            [field]: "",
          }
        : current,
    );
  };

  const clearTripDetailsValidationDisplay = () => {
    setFieldErrors((current) => ({
      ...current,
      destinations: "",
      startDate: "",
      endDate: "",
    }));

    setSubmitError((current) =>
      current === tripDetailsRequiredMessage ? "" : current,
    );
  };

  const getTripDetailsHelperText = (field: keyof FieldErrors) =>
    submitError === tripDetailsRequiredMessage ? "" : fieldErrors[field];

  const handleDestinationCountryChange = (
    _event: SyntheticEvent,
    value: ICountry | null,
  ) => {
    clearTripDetailsValidationDisplay();

    setDestinationCountry(value);
    // The old cities belong to the country that was just replaced.
    setDestinationCities([]);

    if (value) {
      clearFieldError("destinations");
    }
  };

  const handleDestinationCitiesChange = (
    _event: SyntheticEvent,
    value: ICity[],
  ) => {
    clearTripDetailsValidationDisplay();

    setDestinationCities(value);
  };

  const toggleInterest = (interest: string) => {
    const nextInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter((item) => item !== interest)
      : [...selectedInterests, interest];

    setSelectedInterests(nextInterests);

    if (nextInterests.length >= minInterests) {
      clearFieldError("interests");
    }
  };

  const validateCurrentStep = (): boolean => {
    setSubmitError("");

    const nextErrors = {
      ...fieldErrors,
    };

    let isValid = true;

    if (step === 1) {
      const areAllTripDetailsFieldsEmpty =
        !destinationCountry &&
        destinationCities.length === 0 &&
        startDate === null &&
        endDate === null;

      nextErrors.destinations = destinationCountry
        ? ""
        : t("tripPlanningForm.validation.destinationRequired");

      nextErrors.startDate =
        startDate?.isValid() === true
          ? ""
          : t("tripPlanningForm.validation.startDate");

      if (endDate?.isValid() !== true) {
        nextErrors.endDate = t("tripPlanningForm.validation.endDate");
      } else if (
        startDate?.isValid() === true &&
        endDate.isBefore(startDate, "day")
      ) {
        nextErrors.endDate = t(
          "tripPlanningForm.validation.endDateBeforeStart",
        );
      } else if (
        startDate?.isValid() === true &&
        endDate.diff(startDate, "day") + 1 > maxTripDays
      ) {
        nextErrors.endDate = t("tripPlanningForm.validation.maxTripDays", {
          count: maxTripDays,
        });
      } else {
        nextErrors.endDate = "";
      }

      if (
        !nextErrors.destinations &&
        tripDuration > 0 &&
        !hasEnoughDaysForStops
      ) {
        nextErrors.destinations = t(
          "tripPlanningForm.validation.notEnoughDaysForStops",
          {
            duration: tripDuration,
            stops: stops.length,
          },
        );
      }

      isValid =
        !nextErrors.destinations &&
        !nextErrors.startDate &&
        !nextErrors.endDate;

      if (areAllTripDetailsFieldsEmpty) {
        setSubmitError(tripDetailsRequiredMessage);
      }

      if (isValid && startDate && endDate) {
        const overlapsExisting = existingTrips.some((trip) =>
          rangesOverlap(
            startDate,
            endDate,
            dayjs(trip.start_date),
            dayjs(trip.end_date),
          ),
        );

        if (overlapsExisting) {
          setFieldErrors(nextErrors);

          setSubmitError(t("tripPlanningForm.validation.dateOverlap"));

          return false;
        }
      }
    }

    if (step === 2) {
      nextErrors.travelers = isTravelerCountValid
        ? ""
        : t("tripPlanningForm.validation.maxTravelers", {
            count: maxTravelers,
          });

      nextErrors.budget =
        budgetMax > budgetSliderMin
          ? ""
          : t("tripPlanningForm.validation.budget");

      isValid = !nextErrors.travelers && !nextErrors.budget;
    }

    if (step === 3) {
      nextErrors.interests =
        selectedInterests.length >= minInterests
          ? ""
          : t("tripPlanningForm.validation.minimumInterests", {
              count: minInterests,
            });

      isValid = !nextErrors.interests;
    }

    setFieldErrors(nextErrors);

    return isValid;
  };

  const goNext = () => {
    if (validateCurrentStep()) {
      setStep((current) => current + 1);
    }
  };

  const goBack = () => {
    setSubmitError("");

    setStep((current) => Math.max(1, current - 1));
  };

  const handleSubmit = async () => {
    setSubmitError("");

    if (!validateCurrentStep()) {
      if (step === 3) {
        interestsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }

    // Step 1 already guarantees this; the guard keeps the day split below from
    // dividing by zero if the steps are ever reordered.
    if (stops.length === 0 || tripDuration <= 0) {
      setSubmitError(t("tripPlanningForm.validation.requiredFields"));

      return;
    }

    setIsSubmitting(true);
    setGenerating(true);

    const minimumDisplayPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, minimumGeneratingDisplayMs);
    });

    try {
      // The API still stores a day count per stop, but the form no longer asks
      // for one — spread the trip evenly and hand the leftover days to the
      // earliest stops. How the traveler actually wants the time split is in
      // their notes, which ride along in the prompt below.
      const baseDays = Math.floor(tripDuration / stops.length);
      const extraDays = tripDuration % stops.length;

      const mergedAdditionalNotes = (() => {
        const baseNotes = notes.trim();
        const customOtherText = otherInterest.trim();
        const hasOtherInterest = selectedInterests.includes("Other");

        let merged = baseNotes;
        if (hasOtherInterest && customOtherText) {
          const otherNote = `Other interest: ${customOtherText}`;
          merged = baseNotes ? `${otherNote}. ${baseNotes}` : otherNote;
        }

        if (!merged) {
          return undefined;
        }

        // notes on its own is already allowed up to maxNotesLength, so
        // prepending "Other interest: …" can push the combined string past
        // the backend's additional_notes cap — truncate the final result,
        // not each piece.
        return merged.slice(0, maxNotesLength);
      })();

      const tripPayload = {
        destinations: stops.map((stop, index) => ({
          ...stop,
          days: baseDays + (index < extraDays ? 1 : 0),
        })),

        start_date: startDate?.format("YYYY-MM-DD") ?? "",

        end_date: endDate?.format("YYYY-MM-DD") ?? "",

        budget_max: budgetMax,

        travelers_count: adults + children,
        additional_notes: mergedAdditionalNotes,
        adults,
        children,
      };

      const canReusePendingTrip =
        pendingTrip !== null &&
        JSON.stringify(pendingTrip.destinations) ===
          JSON.stringify(tripPayload.destinations) &&
        pendingTrip.start_date === tripPayload.start_date &&
        pendingTrip.end_date === tripPayload.end_date;
      const trip =
        pendingTrip && canReusePendingTrip
          ? pendingTrip
          : (await createTrip(tripPayload)).data;
      if (!canReusePendingTrip) {
        setPendingTrip(trip);
      }

      try {
        const canonicalInterests = await api
          .get<{ id: number; name: string }[]>("/interests")
          .then((response) => response.data);

        const interestIdsByName = new Map(
          canonicalInterests.map((interest) => [
            interest.name.trim().toLowerCase(),
            interest.id,
          ]),
        );

        for (const label of selectedInterests) {
          if (label === "Other") {
            continue;
          }

          const normalized = label.trim().toLowerCase();
          let interestId = interestIdsByName.get(normalized);
          if (interestId === undefined) {
            const createdInterest = await api.post<{
              id: number;
              name: string;
            }>("/interests", {
              name: label,
            });

            interestId = createdInterest.data.id;
            interestIdsByName.set(
              createdInterest.data.name.trim().toLowerCase(),
              interestId,
            );
          }

          try {
            await api.post(`/trips/${trip.id}/interests`, {
              interest_id: interestId,
            });
          } catch (linkError) {
            // A retried submit reuses the same trip (see pendingTrip above),
            // so interests linked on an earlier attempt come back as 409 —
            // that is already the desired state, not a failure.
            if (
              !axios.isAxiosError(linkError) ||
              linkError.response?.status !== 409
            ) {
              throw linkError;
            }
          }
        }
      } catch {
        // Unlike the brief saved below (which nothing reads back), these rows
        // are the only source of the interest list the itinerary is generated
        // from. Stop with a message that points at the real problem rather
        // than generate an itinerary that ignores the traveler's interests.
        setSubmitError(t("tripPlanningForm.validation.interestSyncError"));
        return;
      }

      // Nothing here talks to a model: the brief is only written down, ready
      // for whoever wires the itinerary service up to one.
      await saveTripPreferences(trip.id, { notes: tripPrompt }).catch(() => {
        // Non-fatal — losing the notes shouldn't block the itinerary.
      });

      const [{ data: itinerary }] = await Promise.all([
        generateItinerary(trip.id),
        minimumDisplayPromise,
      ]);

      setPendingTrip(null);
      navigate(routesPaths.itinerary, {
        state: {
          trip,
          itinerary,
          prompt: tripPrompt,
        },
      });
    } catch (error) {
      setSubmitError(t(getGenerationErrorKey(error)));
    } finally {
      setGenerating(false);
      setIsSubmitting(false);
    }
  };

  if (generating) {
    return (
      <LoadingScreen
        title={t("tripPlanningForm.generating.title")}
        subtitle={t("tripPlanningForm.generating.selectedDestinations")}
        statusMessages={[
          t("tripPlanningForm.generating.discovering"),
          t("tripPlanningForm.generating.matching"),
          t("tripPlanningForm.generating.organizing"),
          t("tripPlanningForm.generating.finishing"),
        ]}
        ariaLabel={t("tripPlanningForm.generating.progressLabel")}
      />
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.page}>
        <main className={styles.content}>
          <header className={styles.header}>
            <Typography component="h1" className={styles.title}>
              {t("tripPlanningForm.header.titlePrefix")}{" "}
              <span className={styles.gradientText}>
                {t("tripPlanningForm.header.titleAccent")}
              </span>
            </Typography>
          </header>

          <div className={styles.steps}>
            {steps.map((item, index) => {
              const isCurrent = step === item.num;

              // A step only counts as complete once the user has actually
              // moved past it - checking completedSteps[index] alone marks
              // a step complete purely because its fields currently pass
              // validation, which is true by default for step 2 before the
              // user has even reached it (adults/budget defaults already
              // satisfy isTravelersBudgetComplete).
              const isComplete = item.num < step && completedSteps[index];

              return (
                <div
                  key={item.num}
                  className={mergeClasses(
                    styles.stepItem,
                    index < steps.length - 1 && styles.stepItemGrowing,
                  )}
                >
                  <div className={styles.stepIdentity}>
                    <Typography
                      component="div"
                      className={mergeClasses(
                        styles.stepCircle,
                        (isComplete || isCurrent) && styles.stepCircleReached,
                        isCurrent && styles.stepCircleCurrent,
                      )}
                    >
                      {isComplete ? <CheckIcon fontSize="small" /> : item.num}
                    </Typography>

                    <Typography
                      component="span"
                      className={mergeClasses(
                        styles.stepLabel,
                        (isComplete || isCurrent) && styles.stepLabelReached,
                        isCurrent && styles.stepLabelCurrent,
                        !isCurrent && styles.stepLabelHideOnMobile,
                      )}
                    >
                      {item.label}
                    </Typography>
                  </div>

                  {index < steps.length - 1 && (
                    <div
                      className={mergeClasses(
                        styles.connector,
                        isComplete && styles.connectorComplete,
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <section className={styles.card}>
            {step === 1 && (
              <div className={styles.column24}>
                <div>
                  <Typography
                    component="p"
                    className={styles.label}
                    sx={{
                      mb: 2.5,
                      display: "block",
                    }}
                  >
                    {t("tripPlanningForm.tripDetails.destination")}
                  </Typography>

                  <div className={styles.grid}>
                    <Autocomplete
                      options={allCountries}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.isoCode === value.isoCode
                      }
                      value={destinationCountry}
                      onChange={handleDestinationCountryChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("tripPlanningForm.tripDetails.country")}
                          placeholder={t(
                            "tripPlanningForm.tripDetails.countryPlaceholder",
                          )}
                          sx={getFieldSx(!!destinationCountry)}
                          error={!!fieldErrors.destinations}
                        />
                      )}
                    />

                    <Autocomplete
                      multiple
                      disableCloseOnSelect
                      options={
                        destinationCountry
                          ? getCitiesForCountry(destinationCountry.isoCode)
                          : []
                      }
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.name === value.name
                      }
                      value={destinationCities}
                      onChange={handleDestinationCitiesChange}
                      disabled={!destinationCountry}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            destinationCountry
                              ? t("tripPlanningForm.tripDetails.cities")
                              : t(
                                  "tripPlanningForm.tripDetails.selectCountryFirst",
                                )
                          }
                          placeholder={
                            destinationCountry && destinationCities.length === 0
                              ? t(
                                  "tripPlanningForm.tripDetails.citiesPlaceholder",
                                )
                              : undefined
                          }
                          sx={getFieldSx(destinationCities.length > 0)}
                        />
                      )}
                    />
                  </div>

                  {fieldErrors.destinations && (
                    <Typography
                      component="p"
                      role="alert"
                      className={styles.fieldError}
                    >
                      {fieldErrors.destinations}
                    </Typography>
                  )}
                </div>

                <Divider sx={{ my: 1.5 }} />

                <div>
                  <Typography
                    component="p"
                    className={styles.label}
                    sx={{
                      mb: 2.5,
                      display: "block",
                    }}
                  >
                    {t("tripPlanningForm.tripDetails.travelDates")}
                  </Typography>

                  <div className={styles.grid}>
                    <div>
                      <Typography
                        component="label"
                        htmlFor="trip-start-date"
                        className={styles.label}
                      >
                        {t("tripPlanningForm.tripDetails.startDate")}
                      </Typography>

                      <DatePicker
                        value={startDate}
                        onChange={(value) => {
                          clearTripDetailsValidationDisplay();

                          setStartDate(value);

                          if (
                            value?.isValid() === true &&
                            endDate?.isValid() === true &&
                            (endDate.isBefore(value, "day") ||
                              endDate.diff(value, "day") + 1 > maxTripDays)
                          ) {
                            setEndDate(null);
                          }

                          if (value?.isValid()) {
                            clearFieldError("startDate");
                          }
                        }}
                        disablePast
                        shouldDisableDate={isDateBooked}
                        slots={{
                          day: BookedDay,
                        }}
                        slotProps={{
                          textField: {
                            id: "trip-start-date",
                            fullWidth: true,
                            sx: getFieldSx(startDate?.isValid() === true),
                            error: !!fieldErrors.startDate,
                            helperText: getTripDetailsHelperText("startDate"),
                          },
                          day: {
                            sx: {
                              "&.Mui-selected": {
                                backgroundColor: semanticColors.interactive,
                                color: semanticColors.textOnAccent,
                              },
                              "&.Mui-selected:hover": {
                                backgroundColor: semanticColors.interactive,
                              },
                              "&.Mui-selected:focus": {
                                backgroundColor: semanticColors.interactive,
                              },
                            },
                          },
                        }}
                      />
                    </div>

                    <div>
                      <Typography
                        component="label"
                        htmlFor="trip-end-date"
                        className={styles.label}
                      >
                        {t("tripPlanningForm.tripDetails.endDate")}
                      </Typography>

                      <DatePicker
                        value={endDate}
                        onChange={(value) => {
                          clearTripDetailsValidationDisplay();

                          setEndDate(value);

                          if (value?.isValid()) {
                            clearFieldError("endDate");
                          }
                        }}
                        disablePast
                        minDate={startDate ?? undefined}
                        shouldDisableDate={isDateBooked}
                        slots={{
                          day: BookedDay,
                        }}
                        slotProps={{
                          textField: {
                            id: "trip-end-date",
                            fullWidth: true,
                            sx: getFieldSx(endDate?.isValid() === true),
                            error: !!fieldErrors.endDate,
                            helperText: getTripDetailsHelperText("endDate"),
                          },
                          day: {
                            sx: {
                              "&.Mui-selected": {
                                backgroundColor: semanticColors.interactive,
                                color: semanticColors.textOnAccent,
                              },
                              "&.Mui-selected:hover": {
                                backgroundColor: semanticColors.interactive,
                              },
                              "&.Mui-selected:focus": {
                                backgroundColor: semanticColors.interactive,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {submitError === tripDetailsRequiredMessage && (
                    <Typography
                      component="p"
                      role="alert"
                      className={styles.tripDetailsGeneralError}
                    >
                      {submitError}
                    </Typography>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.column28}>
                <div>
                  <Typography
                    component="p"
                    className={styles.label}
                    sx={{ mb: 1.5 }}
                  >
                    {t("tripPlanningForm.budget.travelers")}
                  </Typography>

                  <Typography
                    component="p"
                    className={styles.hint}
                    sx={{ mb: 1.5 }}
                  >
                    {t("tripPlanningForm.travelers.totalSummary", {
                      total: totalTravelers,
                      max: maxTravelers,
                    })}
                  </Typography>

                  <div>
                    <Typography
                      component="p"
                      className={styles.label}
                      sx={{ mb: 1 }}
                    >
                      {t("tripPlanningForm.travelers.adults")}
                    </Typography>

                    <div className={styles.counterRow}>
                      <IconButton
                        className={styles.counterButton}
                        onClick={() => {
                          setAdults((value) => Math.max(minAdults, value - 1));
                          clearFieldError("travelers");
                        }}
                        aria-label={t(
                          "tripPlanningForm.travelers.decreaseAdults",
                        )}
                        disabled={adults === minAdults}
                      >
                        <RemoveIcon />
                      </IconButton>

                      <Typography component="span" className={styles.count}>
                        {adults}
                      </Typography>

                      <IconButton
                        className={styles.counterButton}
                        onClick={() =>
                          setAdults((value) =>
                            value + children < maxTravelers ? value + 1 : value,
                          )
                        }
                        aria-label={t(
                          "tripPlanningForm.travelers.increaseAdults",
                        )}
                        disabled={totalTravelers >= maxTravelers}
                      >
                        <AddIcon />
                      </IconButton>

                      <Typography component="span" className={styles.hint}>
                        {t("tripPlanningForm.travelers.adultCount", {
                          count: adults,
                        })}
                      </Typography>
                    </div>
                  </div>

                  <div className={styles.travelerGroupSpacing}>
                    <Typography
                      component="p"
                      className={styles.label}
                      sx={{ mb: 1 }}
                    >
                      {t("tripPlanningForm.travelers.children")}
                    </Typography>

                    <div className={styles.counterRow}>
                      <IconButton
                        className={styles.counterButton}
                        onClick={() => {
                          setChildren((value) => Math.max(0, value - 1));
                          clearFieldError("travelers");
                        }}
                        aria-label={t(
                          "tripPlanningForm.travelers.decreaseChildren",
                        )}
                        disabled={children === 0}
                      >
                        <RemoveIcon />
                      </IconButton>

                      <Typography component="span" className={styles.count}>
                        {children}
                      </Typography>

                      <IconButton
                        className={styles.counterButton}
                        onClick={() =>
                          setChildren((value) =>
                            adults + value < maxTravelers ? value + 1 : value,
                          )
                        }
                        aria-label={t(
                          "tripPlanningForm.travelers.increaseChildren",
                        )}
                        disabled={totalTravelers >= maxTravelers}
                      >
                        <AddIcon />
                      </IconButton>

                      <Typography component="span" className={styles.hint}>
                        {children === 0
                          ? t("tripPlanningForm.travelers.noChildren")
                          : t("tripPlanningForm.travelers.childCount", {
                              count: children,
                            })}
                      </Typography>
                    </div>
                  </div>

                  {fieldErrors.travelers && (
                    <Typography
                      component="p"
                      role="alert"
                      className={styles.fieldError}
                    >
                      {fieldErrors.travelers}
                    </Typography>
                  )}
                </div>

                <Divider sx={{ my: 1.5 }} />

                <div>
                  <Typography
                    component="span"
                    id="budget-range-label"
                    className={styles.label}
                    sx={{
                      mb: 2,
                      display: "block",
                    }}
                  >
                    {t("tripPlanningForm.budget.range")}
                  </Typography>

                  <div className={styles.budgetSliderWrapper}>
                    <Slider
                      aria-labelledby="budget-range-label"
                      aria-describedby={
                        fieldErrors.budget ? "budget-range-error" : undefined
                      }
                      className={styles.budgetSlider}
                      value={budgetMax}
                      onChange={(_event, value) => {
                        setBudgetMax(Number(value));
                        clearFieldError("budget");
                      }}
                      valueLabelDisplay="on"
                      valueLabelFormat={(value) =>
                        t("tripPlanningForm.budget.value", { amount: value })
                      }
                      getAriaValueText={(value) =>
                        t("tripPlanningForm.budget.value", { amount: value })
                      }
                      min={budgetSliderMin}
                      max={budgetSliderMax}
                      step={budgetSliderStep}
                    />
                  </div>

                  <div className={styles.budgetRangeSummary}>
                    <Typography
                      component="span"
                      className={styles.budgetRangeSummaryLabel}
                    >
                      {t("tripPlanningForm.budget.value", {
                        amount: budgetSliderMin,
                      })}
                    </Typography>

                    <Typography
                      component="span"
                      className={styles.budgetRangeSummaryLabel}
                    >
                      {t("tripPlanningForm.budget.value", {
                        amount: budgetSliderMax,
                      })}
                    </Typography>
                  </div>

                  {fieldErrors.budget && (
                    <Typography
                      component="p"
                      id="budget-range-error"
                      role="alert"
                      className={styles.fieldError}
                    >
                      {fieldErrors.budget}
                    </Typography>
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div
                  ref={interestsSectionRef}
                  className={styles.interestHeader}
                  aria-describedby={
                    fieldErrors.interests ? "interests-error" : undefined
                  }
                >
                  <div className={styles.interestHeaderRow}>
                    <Typography component="h3" className={styles.interestTitle}>
                      {t("tripPlanningForm.interests.selectInterests")}
                    </Typography>

                    <span
                      className={mergeClasses(
                        styles.interestCounter,
                        selectedInterests.length >= minInterests &&
                          styles.interestCounterComplete,
                      )}
                      aria-label={t(
                        "tripPlanningForm.interests.selectedCount",
                        { count: selectedInterests.length },
                      )}
                    >
                      {selectedInterests.length}
                    </span>
                  </div>

                  <Typography component="p" className={styles.interestText}>
                    {selectedInterests.length >= minInterests
                      ? t("tripPlanningForm.interests.selectAll")
                      : t("tripPlanningForm.interests.chooseMinimum", {
                          count: minInterests,
                        })}
                  </Typography>
                </div>

                <div className={styles.chips}>
                  {interestOptions.map((interest) => (
                    <Chip
                      key={interest}
                      label={t(
                        `tripPlanningForm.interests.options.${interest}`,
                      )}
                      clickable
                      aria-pressed={selectedInterests.includes(interest)}
                      onClick={() => toggleInterest(interest)}
                      className={mergeClasses(
                        styles.chip,
                        selectedInterests.includes(interest) &&
                          styles.chipActive,
                      )}
                    />
                  ))}
                </div>

                {fieldErrors.interests && (
                  <Typography
                    component="p"
                    id="interests-error"
                    role="alert"
                    className={styles.fieldError}
                  >
                    {fieldErrors.interests}
                  </Typography>
                )}

                {selectedInterests.includes("Other") && (
                  <div className={styles.otherField}>
                    <TextField
                      fullWidth
                      label={t("tripPlanningForm.interests.otherLabel")}
                      placeholder={t(
                        "tripPlanningForm.interests.otherPlaceholder",
                      )}
                      value={otherInterest}
                      onChange={(event) => setOtherInterest(event.target.value)}
                      sx={getFieldSx(!!otherInterest.trim())}
                    />
                  </div>
                )}

                <div className={styles.notesField}>
                  <Typography
                    component="label"
                    htmlFor="trip-notes"
                    className={styles.label}
                  >
                    {t("tripPlanningForm.notes.label")}
                  </Typography>

                  <TextField
                    id="trip-notes"
                    fullWidth
                    multiline
                    minRows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder={t("tripPlanningForm.notes.placeholder")}
                    slotProps={{
                      htmlInput: { maxLength: maxNotesLength },
                    }}
                    sx={getFieldSx(!!notes.trim())}
                  />
                </div>

                <div className={styles.summary}>
                  <Typography component="h3" className={styles.summaryTitle}>
                    {t("tripPlanningForm.summary.title")}
                  </Typography>

                  <div className={styles.summaryGrid}>
                    {[
                      [
                        t("tripPlanningForm.summary.destinations"),
                        destinationCountry
                          ? `${destinationCountry.name}${
                              destinationCities.length > 0
                                ? ` (${destinationCities
                                    .map((city) => city.name)
                                    .join(", ")})`
                                : ""
                            }`
                          : t("tripPlanningForm.summary.notAvailable"),
                      ],
                      [
                        t("tripPlanningForm.summary.stay"),
                        t("tripPlanningForm.summary.destinationDays", {
                          count: tripDuration || 0,
                        }),
                      ],
                      [
                        t("tripPlanningForm.summary.dates"),
                        startDate && endDate
                          ? t("tripPlanningForm.summary.dateRange", {
                              startDate: startDate.format(
                                t("tripPlanningForm.summary.dateFormat"),
                              ),
                              endDate: endDate.format(
                                t("tripPlanningForm.summary.dateFormat"),
                              ),
                            })
                          : t("tripPlanningForm.summary.notAvailable"),
                      ],
                      [
                        t("tripPlanningForm.summary.travelers"),
                        t("tripPlanningForm.summary.travelerCount", {
                          count: adults + children,
                        }),
                      ],
                      [
                        t("tripPlanningForm.summary.budget"),
                        t("tripPlanningForm.summary.budgetRange", {
                          minimum: budgetSliderMin,
                          maximum: budgetMax,
                        }),
                      ],
                      [
                        t("tripPlanningForm.summary.interests"),
                        t("tripPlanningForm.summary.interestCount", {
                          count: selectedInterests.length,
                        }),
                      ],
                      [
                        t("tripPlanningForm.summary.style"),
                        t("tripPlanningForm.summary.balanced"),
                      ],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <Typography component="p" className={styles.summaryKey}>
                          {label}
                        </Typography>

                        <Typography
                          component="p"
                          className={styles.summaryValue}
                        >
                          {value}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {submitError && submitError !== tripDetailsRequiredMessage && (
              <Typography component="p" role="alert" className={styles.error}>
                {submitError}
              </Typography>
            )}
          </section>

          <div className={styles.navigation}>
            <AppButton
              appearance="secondary"
              className={step === 1 ? styles.hidden : undefined}
              onClick={goBack}
              startIcon={<ArrowBackIcon />}
            >
              {t("tripPlanningForm.back")}
            </AppButton>

            {step < steps.length ? (
              <AppButton
                appearance="primary"
                onClick={goNext}
                endIcon={<ArrowForwardIcon />}
              >
                {t("tripPlanningForm.continue")}
              </AppButton>
            ) : (
              <AppButton
                appearance="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {t("tripPlanningForm.submit")}
              </AppButton>
            )}
          </div>
        </main>
      </div>
    </LocalizationProvider>
  );
};

export default TripPlanningForm;

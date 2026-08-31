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
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
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
import type { Trip } from "../../types/trip";
import AppButton from "../../common/AppButton/appButton";
import { semanticColors } from "../../common/theme/colors";
import destinationData from "../../data/destinations.json";
import {
  getFieldSx,
  useTripPlanningFormStyles,
} from "./tripPlanningForm.styles";
import { routesPaths } from "../../routes/routesPaths";

type Destination = {
  destination_id: string;
  city: string;
  country: string;
  country_code: string;
  region: string;
};

type CountryOption = {
  country: string;
  country_code: string;
  region: string;
};

type TripDestination = {
  country: CountryOption | null;
  city: Destination | null;
  days: number | "";
};

const budgetSliderMin = 0;
const budgetSliderMax = 5000;
const budgetSliderStep = 50;
const defaultBudgetMax = 100;

type FieldErrors = {
  originCountry: string;
  originCity: string;
  destinations: string;
  startDate: string;
  endDate: string;
  budget: string;
  interests: string;
};

const emptyFieldErrors: FieldErrors = {
  originCountry: "",
  originCity: "",
  destinations: "",
  startDate: "",
  endDate: "",
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
const minimumGeneratingDisplayMs = 3600;
const minInterests = 3;

const getUniqueCountries = (): CountryOption[] => {
  const countryMap = new Map<string, CountryOption>();

  destinationData.forEach((dest: Destination) => {
    if (!countryMap.has(dest.country_code)) {
      countryMap.set(dest.country_code, {
        country: dest.country,
        country_code: dest.country_code,
        region: dest.region,
      });
    }
  });

  return Array.from(countryMap.values()).sort((a, b) =>
    a.country.localeCompare(b.country),
  );
};

const getCitiesForCountry = (countryCode: string): Destination[] => {
  return destinationData
    .filter((dest: Destination) => dest.country_code === countryCode)
    .sort((a, b) => a.city.localeCompare(b.city));
};

const allCountries = getUniqueCountries();

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

  const [originCountry, setOriginCountry] = useState<CountryOption | null>(
    null,
  );

  const [originCity, setOriginCity] = useState<Destination | null>(null);

  const [destinations, setDestinations] = useState<TripDestination[]>([
    {
      country: null,
      city: null,
      days: "",
    },
  ]);

  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [otherInterest, setOtherInterest] = useState("");

  const interestsSectionRef = useRef<HTMLDivElement | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>(emptyFieldErrors);

  const tripDuration =
    startDate?.isValid() === true &&
    endDate?.isValid() === true &&
    !endDate.isBefore(startDate, "day")
      ? endDate.diff(startDate, "day") + 1
      : 0;

  const allocatedDays = destinations.reduce(
    (total, destination) =>
      total + (typeof destination.days === "number" ? destination.days : 0),
    0,
  );

  const remainingDays = tripDuration - allocatedDays;

  const hasValidDestinationDays =
    destinations.length > 0 &&
    destinations.every(
      (destination) =>
        !!destination.country &&
        typeof destination.days === "number" &&
        Number.isInteger(destination.days) &&
        destination.days > 0,
    );

  const hasOriginDestinationCityConflict =
    !!originCity &&
    destinations.some(
      (destination) =>
        destination.city?.destination_id === originCity.destination_id,
    );

  const isTripDetailsComplete =
    !!originCountry &&
    destinations.length > 0 &&
    hasValidDestinationDays &&
    !hasOriginDestinationCityConflict &&
    tripDuration > 0 &&
    allocatedDays === tripDuration;

  const isTravelersBudgetComplete =
    adults >= 1 && children >= 0 && budgetMax > budgetSliderMin;

  const isInterestsComplete = selectedInterests.length >= minInterests;

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
      originCountry: "",
      originCity: "",
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

  const handleOriginCountryChange = (
    _event: SyntheticEvent,
    value: CountryOption | null,
  ) => {
    clearTripDetailsValidationDisplay();

    setOriginCountry(value);
    setOriginCity(null);

    if (value) {
      clearFieldError("originCountry");
    }
  };

  const updateDestination = (
    index: number,
    updates: Partial<TripDestination>,
  ) => {
    clearTripDetailsValidationDisplay();

    setDestinations((current) =>
      current.map((destination, destinationIndex) =>
        destinationIndex === index
          ? {
              ...destination,
              ...updates,
            }
          : destination,
      ),
    );
  };

  const handleDestinationCityChange = (
    index: number,
    city: Destination | null,
  ) => {
    clearTripDetailsValidationDisplay();

    setDestinations((current) => {
      const selectedDestination = current[index];

      if (!selectedDestination) {
        return current;
      }

      if (!city) {
        return current.map((destination, destinationIndex) =>
          destinationIndex === index
            ? {
                ...destination,
                city: null,
              }
            : destination,
        );
      }

      const matchingIndex = current.findIndex(
        (destination, destinationIndex) =>
          destinationIndex !== index &&
          destination.city?.destination_id === city.destination_id,
      );

      if (matchingIndex === -1) {
        return current.map((destination, destinationIndex) =>
          destinationIndex === index
            ? {
                ...destination,
                city,
              }
            : destination,
        );
      }

      const matchingDestination = current[matchingIndex];

      const selectedDays =
        typeof selectedDestination.days === "number"
          ? selectedDestination.days
          : 0;

      const matchingDays =
        typeof matchingDestination.days === "number"
          ? matchingDestination.days
          : 0;

      const mergedDays = selectedDays + matchingDays;

      return current.reduce<TripDestination[]>(
        (destinations, destination, destinationIndex) => {
          if (destinationIndex === index) {
            return destinations;
          }

          return [
            ...destinations,
            destinationIndex === matchingIndex
              ? {
                  ...destination,
                  days: mergedDays || "",
                }
              : destination,
          ];
        },
        [],
      );
    });
  };

  const addDestination = () => {
    clearTripDetailsValidationDisplay();

    setDestinations((current) => {
      const lastDestination = current[current.length - 1];

      if (!lastDestination?.country) {
        return current;
      }

      return [
        ...current,
        {
          country: null,
          city: null,
          days: "",
        },
      ];
    });
  };

  const removeDestination = (index: number) => {
    clearTripDetailsValidationDisplay();

    setDestinations((current) =>
      current.length === 1
        ? current
        : current.filter((_, destinationIndex) => destinationIndex !== index),
    );
  };

  const getDestinationCities = (destination: TripDestination) => {
    if (!destination.country) {
      return [];
    }

    return getCitiesForCountry(destination.country.country_code).filter(
      (city) => city.destination_id !== originCity?.destination_id,
    );
  };

  const handleOriginCityChange = (
    _event: SyntheticEvent,
    value: Destination | null,
  ) => {
    clearTripDetailsValidationDisplay();

    setOriginCity(value);

    if (value) {
      clearFieldError("originCity");
    }

    if (value) {
      setDestinations((current) =>
        current.map((destination) =>
          destination.city?.destination_id === value.destination_id
            ? {
                ...destination,
                city: null,
              }
            : destination,
        ),
      );
    }
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
        !originCountry &&
        !originCity &&
        destinations.every(
          (destination) =>
            !destination.country &&
            !destination.city &&
            destination.days === "",
        ) &&
        startDate === null &&
        endDate === null;

      nextErrors.originCountry = originCountry
        ? ""
        : t("tripPlanningForm.validation.originCountry");

      nextErrors.originCity = "";
      nextErrors.destinations = "";

      if (destinations.length === 0) {
        nextErrors.destinations = t(
          "tripPlanningForm.validation.destinationRequired",
        );
      } else if (
        destinations.some(
          (destination) =>
            !destination.country ||
            typeof destination.days !== "number" ||
            !Number.isInteger(destination.days) ||
            destination.days <= 0,
        )
      ) {
        nextErrors.destinations = t(
          "tripPlanningForm.validation.destinationDetails",
        );
      } else if (hasOriginDestinationCityConflict) {
        nextErrors.destinations = t(
          "tripPlanningForm.validation.originDestinationConflict",
        );
      }

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
        allocatedDays !== tripDuration
      ) {
        nextErrors.destinations =
          allocatedDays > tripDuration
            ? t("tripPlanningForm.validation.allocatedDaysOver", {
                allocated: allocatedDays,
                duration: tripDuration,
              })
            : t("tripPlanningForm.validation.daysUnassigned", {
                count: tripDuration - allocatedDays,
              });
      }

      isValid =
        !nextErrors.originCountry &&
        !nextErrors.originCity &&
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
      nextErrors.budget =
        adults >= 1 && children >= 0 && budgetMax > budgetSliderMin
          ? ""
          : t("tripPlanningForm.validation.budget");

      isValid = !nextErrors.budget;
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

    setIsSubmitting(true);
    setGenerating(true);

    const minimumDisplayPromise = new Promise<void>((resolve) => {
      window.setTimeout(resolve, minimumGeneratingDisplayMs);
    });

    try {
      const tripPayload = {
        destination: destinations
          .map((destination) =>
            destination.city
              ? `${destination.city.city}, ${
                  destination.country?.country ?? ""
                }`
              : (destination.country?.country ?? ""),
          )
          .join(" • "),

        destinations: destinations.map((destination) => ({
          country: destination.country?.country ?? "",
          ...(destination.city
            ? {
                city: destination.city.city,
              }
            : {}),
          days: typeof destination.days === "number" ? destination.days : 0,
        })),

        start_date: startDate?.format("YYYY-MM-DD") ?? "",

        end_date: endDate?.format("YYYY-MM-DD") ?? "",

        budget_min: budgetSliderMin,
        budget_max: budgetMax,

        travelers_count: adults + children,
      };
      // If a previous attempt already created this exact trip and only
      // failed at the generation step, reuse it instead of re-creating it —
      // otherwise a retry after a failed generation hits a 409 conflict on
      // the same dates. If the details changed since then, create fresh.
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
      const [{ data: itinerary }] = await Promise.all([
        generateItinerary(trip.id),
        minimumDisplayPromise,
      ]);

      setPendingTrip(null);
      navigate(routesPaths.itinerary, {
        state: {
          trip,
          itinerary,
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

            <Typography component="p" className={styles.subtitle}>
              {t("tripPlanningForm.header.subtitle")}
            </Typography>
          </header>

          <div className={styles.steps}>
            {steps.map((item, index) => {
              const isCurrent = step === item.num;

              const isComplete = completedSteps[index] && !isCurrent;

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
                        completedSteps[index] && styles.connectorComplete,
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
                    {t("tripPlanningForm.tripDetails.origin")}
                  </Typography>

                  <div className={styles.grid}>
                    <Autocomplete
                      options={allCountries}
                      getOptionLabel={(option) => option.country}
                      isOptionEqualToValue={(option, value) =>
                        option.country_code === value.country_code
                      }
                      value={originCountry}
                      onChange={handleOriginCountryChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("tripPlanningForm.tripDetails.fromCountry")}
                          placeholder={t(
                            "tripPlanningForm.tripDetails.destinationCountryPlaceholder",
                          )}
                          sx={getFieldSx(!!originCountry)}
                          error={!!fieldErrors.originCountry}
                          helperText={getTripDetailsHelperText("originCountry")}
                        />
                      )}
                    />

                    <Autocomplete
                      options={
                        originCountry
                          ? getCitiesForCountry(originCountry.country_code)
                          : []
                      }
                      getOptionLabel={(option) => option.city}
                      isOptionEqualToValue={(option, value) =>
                        option.destination_id === value.destination_id
                      }
                      value={originCity}
                      onChange={handleOriginCityChange}
                      disabled={!originCountry}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            originCountry
                              ? t("tripPlanningForm.tripDetails.fromCity")
                              : t(
                                  "tripPlanningForm.tripDetails.selectCountryFirst",
                                )
                          }
                          placeholder={
                            originCountry
                              ? t(
                                  "tripPlanningForm.tripDetails.destinationCityPlaceholder",
                                )
                              : undefined
                          }
                          sx={getFieldSx(!!originCity)}
                          error={!!fieldErrors.originCity}
                          helperText={getTripDetailsHelperText("originCity")}
                        />
                      )}
                    />
                  </div>
                </div>

                <Divider sx={{ my: 1.5 }} />

                <div>
                  <div className={styles.destinationSectionHeader}>
                    <Typography component="p" className={styles.label}>
                      {t("tripPlanningForm.tripDetails.destinations")}
                    </Typography>

                    <AppButton
                      appearance="secondary"
                      onClick={addDestination}
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      {t("tripPlanningForm.tripDetails.addDestination")}
                    </AppButton>
                  </div>

                  <div className={styles.destinationList}>
                    {destinations.map((destination, index) => (
                      <div key={index} className={styles.destinationCard}>
                        <div className={styles.destinationRow}>
                          <Typography
                            component="span"
                            className={styles.destinationNumber}
                          >
                            {index + 1}
                          </Typography>

                          <Autocomplete
                            className={styles.destinationInput}
                            options={allCountries}
                            getOptionLabel={(option) => option.country}
                            isOptionEqualToValue={(option, value) =>
                              option.country_code === value.country_code
                            }
                            value={destination.country}
                            onChange={(_event, value) => {
                              updateDestination(index, {
                                country: value,
                                city: null,
                              });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={t(
                                  "tripPlanningForm.tripDetails.country",
                                )}
                                placeholder={t(
                                  "tripPlanningForm.tripDetails.countryPlaceholder",
                                )}
                                sx={getFieldSx(!!destination.country)}
                              />
                            )}
                          />

                          <Autocomplete
                            className={styles.destinationInput}
                            options={getDestinationCities(destination)}
                            getOptionLabel={(option) => option.city}
                            isOptionEqualToValue={(option, value) =>
                              option.destination_id === value.destination_id
                            }
                            value={destination.city}
                            onChange={(_event, value) =>
                              handleDestinationCityChange(index, value)
                            }
                            disabled={!destination.country}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={t("tripPlanningForm.tripDetails.city")}
                                placeholder={
                                  destination.country
                                    ? t(
                                        "tripPlanningForm.tripDetails.cityPlaceholder",
                                      )
                                    : undefined
                                }
                                sx={getFieldSx(!!destination.city)}
                              />
                            )}
                          />

                          <TextField
                            className={styles.destinationInput}
                            label={t("tripPlanningForm.tripDetails.days")}
                            type="number"
                            value={destination.days}
                            onChange={(event) => {
                              const value = event.target.value;

                              const days = value === "" ? "" : Number(value);

                              updateDestination(index, {
                                days:
                                  value === "" ||
                                  (typeof days === "number" &&
                                    Number.isInteger(days) &&
                                    days > 0)
                                    ? days
                                    : destination.days,
                              });
                            }}
                            slotProps={{
                              htmlInput: {
                                min: 1,
                                step: 1,
                              },
                            }}
                            error={
                              !!fieldErrors.destinations &&
                              (destination.days === "" ||
                                typeof destination.days !== "number" ||
                                !Number.isInteger(destination.days) ||
                                destination.days <= 0)
                            }
                            helperText={
                              fieldErrors.destinations &&
                              (destination.days === "" ||
                                typeof destination.days !== "number" ||
                                !Number.isInteger(destination.days) ||
                                destination.days <= 0)
                                ? t("tripPlanningForm.validation.required")
                                : undefined
                            }
                            sx={getFieldSx(
                              typeof destination.days === "number" &&
                                destination.days > 0,
                            )}
                          />

                          {destinations.length > 1 && (
                            <IconButton
                              className={styles.destinationRemoveButton}
                              onClick={() => removeDestination(index)}
                              aria-label={t(
                                "tripPlanningForm.tripDetails.removeDestination",
                                { number: index + 1 },
                              )}
                              size="small"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.daysSummary}>
                    <Typography
                      component="p"
                      className={styles.daysSummaryItem}
                    >
                      <strong>
                        {allocatedDays} / {tripDuration > 0 ? tripDuration : 0}{" "}
                        {t("tripPlanningForm.tripDetails.daysPlanned", {
                          count: tripDuration > 0 ? tripDuration : 0,
                        })}
                      </strong>
                    </Typography>

                    <Typography
                      component="p"
                      className={mergeClasses(
                        styles.daysSummaryItem,
                        styles.daysSummaryStatus,
                        remainingDays < 0 && styles.daysSummaryOverage,
                      )}
                    >
                      {remainingDays > 0
                        ? t("tripPlanningForm.tripDetails.daysLeft", {
                            count: remainingDays,
                          })
                        : remainingDays === 0
                          ? ""
                          : t("tripPlanningForm.tripDetails.daysOver", {
                              count: Math.abs(remainingDays),
                            })}
                    </Typography>
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
                        onClick={() =>
                          setAdults((value) => Math.max(1, value - 1))
                        }
                        aria-label={t(
                          "tripPlanningForm.travelers.decreaseAdults",
                        )}
                        disabled={adults === 1}
                      >
                        <RemoveIcon />
                      </IconButton>

                      <Typography component="span" className={styles.count}>
                        {adults}
                      </Typography>

                      <IconButton
                        className={styles.counterButton}
                        onClick={() => setAdults((value) => value + 1)}
                        aria-label={t(
                          "tripPlanningForm.travelers.increaseAdults",
                        )}
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
                        onClick={() =>
                          setChildren((value) => Math.max(0, value - 1))
                        }
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
                        onClick={() => setChildren((value) => value + 1)}
                        aria-label={t(
                          "tripPlanningForm.travelers.increaseChildren",
                        )}
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

                <div className={styles.summary}>
                  <Typography component="h3" className={styles.summaryTitle}>
                    {t("tripPlanningForm.summary.title")}
                  </Typography>

                  <div className={styles.summaryGrid}>
                    {[
                      [
                        t("tripPlanningForm.summary.destinations"),
                        destinations
                          .map(
                            (destination) =>
                              `${
                                destination.country?.country ||
                                t("tripPlanningForm.summary.notAvailable")
                              }${
                                destination.city
                                  ? `, ${destination.city.city}`
                                  : ""
                              } (${t(
                                "tripPlanningForm.summary.destinationDays",
                                { count: destination.days || 0 },
                              )})`,
                          )
                          .join(" • "),
                      ],
                      [
                        t("tripPlanningForm.summary.stay"),
                        t("tripPlanningForm.summary.daysAllocated", {
                          count: tripDuration || 0,
                          allocated: allocatedDays,
                          duration: tripDuration || 0,
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

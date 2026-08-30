import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { mergeClasses } from "@griffel/react";
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
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
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
type BudgetLevel = "LOW" | "MID" | "HIGH";

type TripDestination = {
  country: CountryOption | null;
  city: Destination | null;
  days: number | "";
};
const budgetLabels: Record<BudgetLevel, string> = {
  LOW: "Low",
  MID: "Mid",
  HIGH: "High",
};
const budgetOptions: { value: BudgetLevel; label: string }[] = [
  { value: "LOW", label: budgetLabels.LOW },
  { value: "MID", label: budgetLabels.MID },
  { value: "HIGH", label: budgetLabels.HIGH },
];
const budgetAmounts: Record<BudgetLevel, number> = {
  LOW: 1000,
  MID: 2000,
  HIGH: 3000,
};
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
const tripDetailsRequiredMessage =
  "Please fill the required fields before moving on.";
const maxTripDays = 31;
const minimumGeneratingDisplayMs = 3600;
const minInterests = 3;
const steps = [
  { num: 1, label: "Trip Details" },
  { num: 2, label: "Travelers & Budget" },
  { num: 3, label: "Interests" },
];
// Extract unique countries from destinations
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
// Get cities for a specific country
const getCitiesForCountry = (countryCode: string): Destination[] => {
  return destinationData
    .filter((dest: Destination) => dest.country_code === countryCode)
    .sort((a, b) => a.city.localeCompare(b.city));
};
const allCountries = getUniqueCountries();
const createBookedDay = (existingTrips: Trip[]) => {
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
      <Tooltip title="This day is already booked in another trip" arrow>
        <span>{dayElement}</span>
      </Tooltip>
    );
  };
  return BookedDay;
};
const TripPlanningForm = () => {
  const styles = useTripPlanningFormStyles();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState<BudgetLevel | "">("");
  // Origin
  const [originCountry, setOriginCountry] = useState<CountryOption | null>(
    null,
  );
  const [originCity, setOriginCity] = useState<Destination | null>(null);
  // Destinations
  const [destinations, setDestinations] = useState<TripDestination[]>([
    { country: null, city: null, days: "" },
  ]);
  // Dates & travelers
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  // Interests
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
  const isTravelersBudgetComplete = adults >= 1 && children >= 0 && !!budget;
  const isInterestsComplete = selectedInterests.length >= minInterests;
  const completedSteps = [
    isTripDetailsComplete,
    isTravelersBudgetComplete,
    isInterestsComplete,
  ];
  // Loading & errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [existingTrips, setExistingTrips] = useState<Trip[]>([]);
  useEffect(() => {
    getTrips()
      .then(({ data }) => setExistingTrips(data))
      .catch(() => {
        // Non-fatal: if this fails we just skip client-side date blocking;
        // the backend's overlap check still protects against overlaps.
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
    () => createBookedDay(existingTrips),
    [existingTrips],
  );
  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) =>
      current[field] ? { ...current, [field]: "" } : current,
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
    if (value) clearFieldError("originCountry");
  };
  const updateDestination = (
    index: number,
    updates: Partial<TripDestination>,
  ) => {
    clearTripDetailsValidationDisplay();
    setDestinations((current) =>
      current.map((destination, destinationIndex) =>
        destinationIndex === index
          ? { ...destination, ...updates }
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
      if (!selectedDestination) return current;

      if (!city) {
        return current.map((destination, destinationIndex) =>
          destinationIndex === index
            ? { ...destination, city: null }
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
          destinationIndex === index ? { ...destination, city } : destination,
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
          if (destinationIndex === index) return destinations;
          return [
            ...destinations,
            destinationIndex === matchingIndex
              ? { ...destination, days: mergedDays || "" }
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
      if (!lastDestination?.country) return current;

      return [...current, { country: null, city: null, days: "" }];
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
    if (!destination.country) return [];
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
    if (value) clearFieldError("originCity");

    if (value) {
      setDestinations((current) =>
        current.map((destination) =>
          destination.city?.destination_id === value.destination_id
            ? { ...destination, city: null }
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
    if (nextInterests.length >= minInterests) clearFieldError("interests");
  };
  const validateCurrentStep = (): boolean => {
    setSubmitError("");
    const nextErrors = { ...fieldErrors };
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
        : "Please select an origin country.";
      nextErrors.originCity = "";
      nextErrors.destinations = "";

      if (destinations.length === 0) {
        nextErrors.destinations = "Please add at least one destination.";
      } else if (
        destinations.some(
          (destination) =>
            !destination.country ||
            typeof destination.days !== "number" ||
            !Number.isInteger(destination.days) ||
            destination.days <= 0,
        )
      ) {
        nextErrors.destinations =
          "Each destination must have a country and a positive number of stay days.";
      } else if (hasOriginDestinationCityConflict) {
        nextErrors.destinations =
          "A destination cannot use the same city as the origin city.";
      }

      nextErrors.startDate =
        startDate?.isValid() === true ? "" : "Please select a start date.";

      if (endDate?.isValid() !== true) {
        nextErrors.endDate = "Please select an end date.";
      } else if (
        startDate?.isValid() === true &&
        endDate.isBefore(startDate, "day")
      ) {
        nextErrors.endDate = "End date cannot be before start date.";
      } else if (
        startDate?.isValid() === true &&
        endDate.diff(startDate, "day") + 1 > maxTripDays
      ) {
        nextErrors.endDate = "Trip duration cannot exceed 31 days.";
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
            ? `Allocated days (${allocatedDays}) exceed the trip duration (${tripDuration} days).`
            : `${tripDuration - allocatedDays} day${
              tripDuration - allocatedDays === 1 ? "" : "s"
            } still need to be assigned to destinations.`;
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
          setSubmitError(
            "Those dates overlap a trip you already have planned. Pick a different date range.",
          );
          return false;
        }
      }
    }
    if (step === 2) {
      nextErrors.budget =
        adults >= 1 && children >= 0 && budget
          ? ""
          : "Please select a budget level.";
      isValid = !nextErrors.budget;
    }
    if (step === 3) {
      nextErrors.interests =
        selectedInterests.length >= minInterests
          ? ""
          : `Please select at least ${minInterests} interests.`;
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
              ? `${destination.city.city}, ${destination.country?.country ?? ""}`
              : (destination.country?.country ?? ""),
          )
          .join(" • "),
        destinations: destinations.map((destination) => ({
          country: destination.country?.country ?? "",
          ...(destination.city ? { city: destination.city.city } : {}),
          days: typeof destination.days === "number" ? destination.days : 0,
        })),
        start_date: startDate?.format("YYYY-MM-DD") ?? "",
        end_date: endDate?.format("YYYY-MM-DD") ?? "",
        budget: budget ? budgetAmounts[budget] : 0,
        travelers_count: adults + children,
      };

      const { data: trip } = await createTrip(tripPayload);

      const [{ data: itinerary }] = await Promise.all([
        generateItinerary(trip.id),
        minimumDisplayPromise,
      ]);

      navigate(routesPaths.itinerary, { state: { trip, itinerary } });
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
      setIsSubmitting(false);
    }
  };
  if (generating) {
    return (
      <LoadingScreen
        title="Creating your personalized journey..."
        subtitle="Exploring your selected destinations and arranging a trip around your interests."
        statusMessages={[
          "Discovering local highlights...",
          "Matching activities to your interests...",
          "Organizing your days...",
          "Adding the finishing touches...",
        ]}
        ariaLabel="Itinerary generation progress"
      />
    );
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.page}>
        <main className={styles.content}>
          <header className={styles.header}>
            <Typography component="h1" className={styles.title}>
              Plan your{" "}
              <span className={styles.gradientText}>perfect trip</span>
            </Typography>
            <Typography component="p" className={styles.subtitle}>
              Tell us about your trip and we&apos;ll create a personalized
              itinerary in seconds.
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
                {/* ORIGIN SECTION */}
                <div>
                  <Typography
                    component="label"
                    className={styles.label}
                    sx={{ mb: 2.5, display: "block" }}
                  >
                    Origin
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
                          label="From (Country)"
                          placeholder="e.g. France"
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
                              ? "From (City)"
                              : "Select a country first"
                          }
                          placeholder={originCountry ? "e.g. Paris" : undefined}
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
                    <Typography component="label" className={styles.label}>
                      Destinations
                    </Typography>
                    <AppButton
                      appearance="secondary"
                      onClick={addDestination}
                      startIcon={<AddIcon />}
                      size="small"
                    >
                      Add
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
                                label="Country"
                                placeholder="e.g. Oman"
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
                                label="City"
                                placeholder={
                                  destination.country
                                    ? "e.g. Muscat"
                                    : undefined
                                }
                                sx={getFieldSx(!!destination.city)}
                              />
                            )}
                          />

                          <TextField
                            className={styles.destinationInput}
                            label="Days"
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
                                ? "Required"
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
                              aria-label={`Remove destination ${index + 1}`}
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
                        days planned
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
                        ? `${remainingDays} left`
                        : remainingDays === 0
                          ? ""
                          : `${Math.abs(remainingDays)} over`}
                    </Typography>
                  </div>

                  {fieldErrors.destinations && (
                    <Typography component="p" className={styles.fieldError}>
                      {fieldErrors.destinations}
                    </Typography>
                  )}
                </div>
                <Divider sx={{ my: 1.5 }} />
                {/* DATES SECTION */}
                <div>
                  <Typography
                    component="label"
                    className={styles.label}
                    sx={{ mb: 2.5, display: "block" }}
                  >
                    Travel Dates
                  </Typography>
                  <div className={styles.grid}>
                    <div>
                      <Typography component="label" className={styles.label}>
                        Start Date
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
                          if (value?.isValid()) clearFieldError("startDate");
                        }}
                        disablePast
                        shouldDisableDate={isDateBooked}
                        slots={{ day: BookedDay }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: getFieldSx(startDate?.isValid() === true),
                            error: !!fieldErrors.startDate,
                            helperText: getTripDetailsHelperText("startDate"),
                          },
                          day: {
                            sx: {
                              "&.Mui-selected": {
                                backgroundColor: semanticColors.interactive,
                                color: semanticColors.bgPrimary,
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
                      <Typography component="label" className={styles.label}>
                        End Date
                      </Typography>
                      <DatePicker
                        value={endDate}
                        onChange={(value) => {
                          clearTripDetailsValidationDisplay();
                          setEndDate(value);
                          if (value?.isValid()) clearFieldError("endDate");
                        }}
                        disablePast
                        minDate={startDate ?? undefined}
                        shouldDisableDate={isDateBooked}
                        slots={{ day: BookedDay }}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: getFieldSx(endDate?.isValid() === true),
                            error: !!fieldErrors.endDate,
                            helperText: getTripDetailsHelperText("endDate"),
                          },
                          day: {
                            sx: {
                              "&.Mui-selected": {
                                backgroundColor: semanticColors.interactive,
                                color: semanticColors.bgPrimary,
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
                {/* TRAVELERS SECTION */}
                <div>
                  <Typography
                    component="p"
                    className={styles.label}
                    sx={{ mb: 1.5 }}
                  >
                    Travelers
                  </Typography>
                  <div>
                    <Typography
                      component="p"
                      className={styles.label}
                      sx={{ fontSize: "0.875rem", mb: 1 }}
                    >
                      Adults
                    </Typography>
                    <div className={styles.counterRow}>
                      <IconButton
                        className={styles.counterButton}
                        onClick={() =>
                          setAdults((value) => Math.max(1, value - 1))
                        }
                        aria-label="Decrease adults"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography component="span" className={styles.count}>
                        {adults}
                      </Typography>
                      <IconButton
                        className={styles.counterButton}
                        onClick={() => setAdults((value) => value + 1)}
                        aria-label="Increase adults"
                      >
                        <AddIcon />
                      </IconButton>
                      <Typography component="span" className={styles.hint}>
                        {adults === 1 ? "1 adult" : `${adults} adults`}
                      </Typography>
                    </div>
                  </div>
                  <div className={styles.travelerGroupSpacing}>
                    <Typography
                      component="p"
                      className={styles.label}
                      sx={{ fontSize: "0.875rem", mb: 1 }}
                    >
                      Children
                    </Typography>
                    <div className={styles.counterRow}>
                      <IconButton
                        className={styles.counterButton}
                        onClick={() =>
                          setChildren((value) => Math.max(0, value - 1))
                        }
                        aria-label="Decrease children"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography component="span" className={styles.count}>
                        {children}
                      </Typography>
                      <IconButton
                        className={styles.counterButton}
                        onClick={() => setChildren((value) => value + 1)}
                        aria-label="Increase children"
                      >
                        <AddIcon />
                      </IconButton>
                      <Typography component="span" className={styles.hint}>
                        {children === 0
                          ? "No children"
                          : `${children} children`}
                      </Typography>
                    </div>
                  </div>
                </div>
                <Divider sx={{ my: 1.5 }} />
                {/* BUDGET SECTION */}
                <div>
                  <Typography
                    component="span"
                    id="budget-level-label"
                    className={styles.label}
                    sx={{ mb: 2, display: "block" }}
                  >
                    Budget Level
                  </Typography>
                  <RadioGroup
                    row
                    aria-labelledby="budget-level-label"
                    aria-describedby={
                      fieldErrors.budget ? "budget-level-error" : undefined
                    }
                    name="budget-level"
                    value={budget}
                    onChange={(event) => {
                      setBudget(event.target.value as BudgetLevel);
                      clearFieldError("budget");
                    }}
                    className={styles.budgetOptions}
                  >
                    {budgetOptions.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        value={option.value}
                        control={<Radio />}
                        label={option.label}
                        className={mergeClasses(
                          styles.budgetOption,
                          budget === option.value &&
                            styles.budgetOptionSelected,
                        )}
                      />
                    ))}
                  </RadioGroup>
                  {fieldErrors.budget && (
                    <Typography
                      component="p"
                      id="budget-level-error"
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
                >
                  <div className={styles.interestHeaderRow}>
                    <Typography component="h3" className={styles.interestTitle}>
                      What are you interested in?
                    </Typography>
                    <span
                      className={mergeClasses(
                        styles.interestCounter,
                        selectedInterests.length >= minInterests &&
                          styles.interestCounterComplete,
                      )}
                      title={`Selected ${selectedInterests.length} ${selectedInterests.length === 1 ? "interest" : "interests"}`}
                    >
                      {selectedInterests.length}
                    </span>
                  </div>
                  <Typography component="p" className={styles.interestText}>
                    {selectedInterests.length >= minInterests
                      ? "Select all that apply"
                      : `Choose at least ${minInterests} to personalize your trip`}
                  </Typography>
                </div>
                <div className={styles.chips}>
                  {interestOptions.map((interest) => (
                    <Chip
                      key={interest}
                      label={interest}
                      clickable
                      onClick={() => toggleInterest(interest)}
                      className={mergeClasses(
                        styles.chip,
                        selectedInterests.includes(interest) &&
                          styles.chipActive,
                      )}
                    />
                  ))}
                </div>
                {selectedInterests.includes("Other") && (
                  <div className={styles.otherField}>
                    <TextField
                      fullWidth
                      label="Tell us your interest"
                      placeholder="e.g. Photography or local markets"
                      value={otherInterest}
                      onChange={(event) => setOtherInterest(event.target.value)}
                      sx={getFieldSx(!!otherInterest.trim())}
                    />
                  </div>
                )}
                <div className={styles.summary}>
                  <Typography component="h3" className={styles.summaryTitle}>
                    Trip Summary
                  </Typography>
                  <div className={styles.summaryGrid}>
                    {[
                      [
                        "Destinations",
                        destinations
                          .map(
                            (destination) =>
                              `${destination.country?.country || "-"}${
                                destination.city
                                  ? `, ${destination.city.city}`
                                  : ""
                              } (${destination.days || 0} days)`,
                          )
                          .join(" • "),
                      ],
                      [
                        "Stay",
                        `${allocatedDays} / ${tripDuration || 0} days allocated`,
                      ],
                      [
                        "Dates",
                        startDate && endDate
                          ? `${startDate.format("YYYY-MM-DD")} -> ${endDate.format("YYYY-MM-DD")}`
                          : "-",
                      ],
                      [
                        "Travelers",
                        `${adults + children} ${
                          adults + children === 1 ? "person" : "people"
                        }`,
                      ],
                      ["Budget", budget ? budgetLabels[budget] : "-"],
                      ["Interests", `${selectedInterests.length} selected`],
                      ["Style", "Balanced"],
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
              <Typography component="p" className={styles.error}>
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
              Back
            </AppButton>
            {step < steps.length ? (
              <AppButton
                appearance="primary"
                onClick={goNext}
                endIcon={<ArrowForwardIcon />}
              >
                Continue
              </AppButton>
            ) : (
              <AppButton
                appearance="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                Generate Itinerary
              </AppButton>
            )}
          </div>
        </main>
      </div>
    </LocalizationProvider>
  );
};
export default TripPlanningForm;

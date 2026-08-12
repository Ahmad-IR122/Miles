import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { mergeClasses } from "@griffel/react";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Country, type ICountry } from "country-state-city";
import type { Dayjs } from "dayjs";
import { interestOptions } from "../../constants/interests";

import AppButton from "../../common/AppButton/appButton";
import TopNav from "../../common/TopNav/topNav";
import allCities from "../../data/cities.json";
import { fieldSx, useTripPlanningFormStyles } from "./tripPlanningForm.styles";

const allCountries = Country.getAllCountries();

type CityOption = {
  cityId: number;
  name: string;
};

const steps = [
  { num: 1, label: "Trip Details" },
  { num: 2, label: "Travelers & Budget" },
  { num: 3, label: "Interests" },
];

const TripPlanningForm = () => {
  const styles = useTripPlanningFormStyles();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState("");
  const [originCountry, setOriginCountry] = useState<ICountry | null>(null);
  const [originCity, setOriginCity] = useState<CityOption | null>(null);
  const [originCities, setOriginCities] = useState<CityOption[]>([]);
  const [country, setCountry] = useState<ICountry | null>(null);
  const [city, setCity] = useState<CityOption | null>(null);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [otherInterest, setOtherInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBudgetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) setBudget(value);
  };

  const citiesForCountry = (selectedCountry: ICountry | null) =>
    selectedCountry
      ? allCities
        .filter((item) => item.country === selectedCountry.isoCode)
        .map((item) => ({ cityId: item.cityId, name: item.name }))
      : [];

  const handleOriginCountryChange = (
    _event: SyntheticEvent,
    value: ICountry | null,
  ) => {
    setOriginCountry(value);
    setOriginCity(null);
    setOriginCities(citiesForCountry(value));
  };

  const handleCountryChange = (
    _event: SyntheticEvent,
    value: ICountry | null,
  ) => {
    setCountry(value);
    setCity(null);
    setCities(citiesForCountry(value));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const validateCurrentStep = () => {
    setErrorMessage("");
    if (step === 1) {
      if (!originCountry || !originCity) {
        setErrorMessage("Please select an origin.");
        return false;
      }
      if (!country || !city) {
        setErrorMessage("Please select a destination.");
        return false;
      }
      if (!startDate || !endDate) {
        setErrorMessage("Please select both a start and end date.");
        return false;
      }
    }
    if (step === 2 && (!budget || Number(budget) <= 0)) {
      setErrorMessage("Please enter a valid budget greater than 0.");
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (validateCurrentStep()) setStep((current) => current + 1);
  };

  const goBack = () => {
    setErrorMessage("");
    setStep((current) => Math.max(1, current - 1));
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    if (selectedInterests.length === 0) {
      setErrorMessage("Please select at least one interest.");
      return;
    }

    const tripRequest = {
      originCountry: originCountry?.name,
      originCity: originCity?.name,
      destinationCountry: country?.name,
      destinationCity: city?.name,
      startDate: startDate?.format("YYYY-MM-DD"),
      endDate: endDate?.format("YYYY-MM-DD"),
      adults,
      children,
      interests: selectedInterests,
      otherInterest: selectedInterests.includes("Other") ? otherInterest : "",
      budget,
    };

    setIsSubmitting(true);
    setGenerating(true);
    setProgress(0);

    try {
      const requestPromise = new Promise((resolve) =>
        setTimeout(resolve, 1000),
      );
      const progressPromise = new Promise<void>((resolve) => {
        const interval = window.setInterval(() => {
          setProgress((current) => {
            if (current >= 100) {
              window.clearInterval(interval);
              resolve();
              return 100;
            }
            return Math.min(100, current + 5);
          });
        }, 80);
      });

      await Promise.all([requestPromise, progressPromise]);
      console.log("Trip request submitted:", tripRequest);
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
      setIsSubmitting(false);
    }
  };

  if (generating) {
    return (
      <div className={mergeClasses(styles.page, styles.generatingPage)}>
        <TopNav homeLink />
        <div className={styles.generatingIcon} aria-hidden="true">
          <AutoAwesomeIcon />
        </div>
        <div className={styles.centered}>
          <Typography component="h1" className={styles.generatingTitle}>
            Creating your personalized journey...
          </Typography>
          <Typography component="p" className={styles.generatingText}>
            Exploring {city?.name || "your destination"} and arranging a trip
            around your interests.
          </Typography>
        </div>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
        </div>
        <Typography
          component="p"
          className={styles.progressStatus}
          aria-live="polite"
        >
          {progress < 30
            ? "Discovering local highlights..."
            : progress < 60
              ? "Matching activities to your interests..."
              : progress < 85
                ? "Organizing your days..."
                : "Adding the finishing touches..."}
        </Typography>
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className={styles.page}>
        <TopNav homeLink />
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
            {steps.map((item, index) => (
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
                      step >= item.num && styles.stepCircleReached,
                      step === item.num && styles.stepCircleCurrent,
                    )}
                  >
                    {step > item.num ? (
                      <CheckIcon fontSize="small" />
                    ) : (
                      item.num
                    )}
                  </Typography>
                  <Typography
                    component="span"
                    className={mergeClasses(
                      styles.stepLabel,
                      step >= item.num && styles.stepLabelReached,
                      step === item.num && styles.stepLabelCurrent,
                    )}
                  >
                    {item.label}
                  </Typography>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={mergeClasses(
                      styles.connector,
                      step > item.num && styles.connectorComplete,
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          <section className={styles.card}>
            {step === 1 && (
              <div className={styles.column24}>
                <div>
                  <Typography component="label" className={styles.label}>
                    Origin
                  </Typography>
                  <div className={styles.grid}>
                    <Autocomplete
                      options={allCountries}
                      getOptionLabel={(option) => option.name}
                      value={originCountry}
                      onChange={handleOriginCountryChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="From (Country)"
                          placeholder="e.g. Japan"
                          sx={fieldSx}
                        />
                      )}
                    />
                    <Autocomplete
                      options={originCities}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.cityId === value.cityId
                      }
                      value={originCity}
                      onChange={(_event, value) => setOriginCity(value)}
                      disabled={!originCountry}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            originCountry
                              ? "From (City)"
                              : "Select a country first"
                          }
                          placeholder={originCountry ? "e.g. Tokyo" : undefined}
                          sx={fieldSx}
                        />
                      )}
                    />
                  </div>
                </div>

                <div>
                  <Typography component="label" className={styles.label}>
                    Destination
                  </Typography>
                  <div className={styles.grid}>
                    <Autocomplete
                      options={allCountries}
                      getOptionLabel={(option) => option.name}
                      value={country}
                      onChange={handleCountryChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="To (Country)"
                          placeholder="e.g. France"
                          sx={fieldSx}
                        />
                      )}
                    />
                    <Autocomplete
                      options={cities}
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.cityId === value.cityId
                      }
                      value={city}
                      onChange={(_event, value) => setCity(value)}
                      disabled={!country}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={
                            country ? "To (City)" : "Select a country first"
                          }
                          placeholder={country ? "e.g. Paris" : undefined}
                          sx={fieldSx}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className={styles.grid}>
                  <div>
                    <Typography component="label" className={styles.label}>
                      Start Date
                    </Typography>
                    <DatePicker
                      value={startDate}
                      onChange={setStartDate}
                      slotProps={{
                        textField: { fullWidth: true, sx: fieldSx },
                      }}
                    />
                  </div>
                  <div>
                    <Typography component="label" className={styles.label}>
                      End Date
                    </Typography>
                    <DatePicker
                      value={endDate}
                      onChange={setEndDate}
                      minDate={startDate ?? undefined}
                      slotProps={{
                        textField: { fullWidth: true, sx: fieldSx },
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.column28}>
                <div>
                  <Typography component="p" className={styles.label}>
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
                <div>
                  <Typography component="p" className={styles.label}>
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
                      {children === 0 ? "No children" : `${children} children`}
                    </Typography>
                  </div>
                </div>
                <div>
                  <Typography component="label" className={styles.label}>
                    Total Budget (USD)
                  </Typography>
                  <TextField
                    fullWidth
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 2000"
                    value={budget}
                    onChange={handleBudgetChange}
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className={styles.interestHeader}>
                  <Typography component="h3" className={styles.interestTitle}>
                    What are you interested in?
                  </Typography>
                  <Typography component="p" className={styles.interestText}>
                    Select all that apply — AI will prioritize these in your
                    itinerary.
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
                      sx={fieldSx}
                    />
                  </div>
                )}
                {selectedInterests.length > 0 && (
                  <div className={styles.selectionNotice}>
                    <CheckIcon fontSize="small" aria-hidden="true" />
                    <Typography
                      component="p"
                      className={styles.selectionNoticeText}
                    >
                      {selectedInterests.length} interest
                      {selectedInterests.length === 1 ? "" : "s"} selected — AI
                      will tailor your itinerary around these preferences.
                    </Typography>
                  </div>
                )}
                <div className={styles.summary}>
                  <Typography component="h3" className={styles.summaryTitle}>
                    Trip Summary
                  </Typography>
                  <div className={styles.summaryGrid}>
                    {[
                      ["Destination", city?.name || "—"],
                      [
                        "Dates",
                        startDate && endDate
                          ? `${startDate.format("YYYY-MM-DD")} → ${endDate.format("YYYY-MM-DD")}`
                          : "—",
                      ],
                      [
                        "Travelers",
                        `${adults + children} ${adults + children === 1 ? "person" : "people"}`,
                      ],
                      [
                        "Budget",
                        budget ? `$${Number(budget).toLocaleString()}` : "—",
                      ],
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

            {errorMessage && (
              <Typography component="p" className={styles.error}>
                {errorMessage}
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

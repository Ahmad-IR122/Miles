import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Country, type ICountry } from "country-state-city";
import allCities from "../../data/cities.json";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";

const allCountries = Country.getAllCountries();

interface CityOption {
  cityId: number;
  name: string;
}

const interestOptions = [
  "Adventure",
  "History",
  "Food",
  "Nature",
  "Nightlife",
  "Shopping",
  "Art & Culture",
  "Relaxation",
  "Other",
];

const TripPlanningForm = () => {
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
  const [errorMessage, setErrorMessage] = useState("");

  const handleBudgetChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value === "" || /^[0-9]+$/.test(value)) {
      setBudget(value);
    }
  };

  const handleOriginCountryChange = (
    _event: SyntheticEvent,
    newValue: ICountry | null
  ) => {
    setOriginCountry(newValue);
    setOriginCity(null);

    if (newValue) {
      const countryCities = allCities
        .filter((c) => c.country === newValue.isoCode)
        .map((c) => ({ cityId: c.cityId, name: c.name }));
      setOriginCities(countryCities);
    } else {
      setOriginCities([]);
    }
  };

  const handleOriginCityChange = (_event: SyntheticEvent, newValue: CityOption | null) => {
    setOriginCity(newValue);
  };

  const handleCountryChange = (
    _event: SyntheticEvent,
    newValue: ICountry | null
  ) => {
    setCountry(newValue);
    setCity(null);

    if (newValue) {
      const countryCities = allCities
        .filter((c) => c.country === newValue.isoCode)
        .map((c) => ({ cityId: c.cityId, name: c.name }));
      setCities(countryCities);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (_event: SyntheticEvent, newValue: CityOption | null) => {
    setCity(newValue);
  };

  const increaseAdults = () => setAdults((prev) => prev + 1);
  const decreaseAdults = () => setAdults((prev) => Math.max(1, prev - 1));

  const increaseChildren = () => setChildren((prev) => prev + 1);
  const decreaseChildren = () => setChildren((prev) => Math.max(0, prev - 1));

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const handleOtherInterestChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOtherInterest(event.target.value);
  };

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!originCountry || !originCity) {
      setErrorMessage("Please select an origin.");
      return;
    }
    if (!country || !city) {
      setErrorMessage("Please select a destination.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMessage("Please select both a start and end date.");
      return;
    }
    if (selectedInterests.length === 0) {
      setErrorMessage("Please select at least one interest.");
      return;
    }
    if (!budget || Number(budget) <= 0) {
      setErrorMessage("Please enter a valid budget greater than 0.");
      return;
    }

    const tripRequest = {
      originCountry: originCountry.name,
      originCity: originCity.name,
      destinationCountry: country.name,
      destinationCity: city.name,
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      adults,
      children,
      interests: selectedInterests,
      otherInterest: selectedInterests.includes("Other") ? otherInterest : "",
      budget,
    };

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Trip request submitted:", tripRequest);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <h3>Origin</h3>
        <Autocomplete
          options={allCountries}
          getOptionLabel={(option) => option.name}
          value={originCountry}
          onChange={handleOriginCountryChange}
          renderInput={(params) => (
            <TextField {...params} label="From (Country)" variant="outlined" />
          )}
        />

        <Autocomplete
          options={originCities}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.cityId === value.cityId}
          value={originCity}
          onChange={handleOriginCityChange}
          disabled={!originCountry}
          renderInput={(params) => (
            <TextField
              {...params}
              label={originCountry ? "From (City)" : "Select a country first"}
              variant="outlined"
            />
          )}
        />

        <h3>Destination</h3>
        <Autocomplete
          options={allCountries}
          getOptionLabel={(option) => option.name}
          value={country}
          onChange={handleCountryChange}
          renderInput={(params) => (
            <TextField {...params} label="To (Country)" variant="outlined" />
          )}
        />

        <Autocomplete
          options={cities}
          getOptionLabel={(option) => option.name}
          isOptionEqualToValue={(option, value) => option.cityId === value.cityId}
          value={city}
          onChange={handleCityChange}
          disabled={!country}
          renderInput={(params) => (
            <TextField
              {...params}
              label={country ? "To (City)" : "Select a country first"}
              variant="outlined"
            />
          )}
        />

        <h3>Travel Dates</h3>
        <DatePicker
          label="Start date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
        />

        <DatePicker
          label="End date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          minDate={startDate ?? undefined}
        />

        <h3>Travelers</h3>
        <div>
          <p>Adults</p>
          <IconButton onClick={decreaseAdults}>
            <RemoveIcon />
          </IconButton>
          <span>{adults}</span>
          <IconButton onClick={increaseAdults}>
            <AddIcon />
          </IconButton>
        </div>

        <div>
          <p>Children</p>
          <IconButton onClick={decreaseChildren}>
            <RemoveIcon />
          </IconButton>
          <span>{children}</span>
          <IconButton onClick={increaseChildren}>
            <AddIcon />
          </IconButton>
        </div>

        <h3>Interests</h3>
        <div>
          {interestOptions.map((interest) => (
            <Chip
              key={interest}
              label={interest}
              clickable
              color={selectedInterests.includes(interest) ? "primary" : "default"}
              onClick={() => toggleInterest(interest)}
            />
          ))}
        </div>

        {selectedInterests.includes("Other") && (
          <TextField
            label="Tell us your interest"
            value={otherInterest}
            onChange={handleOtherInterestChange}
            variant="outlined"
          />
        )}

        <h3>Budget</h3>
        <TextField
          label="Budget"
          type="text"
          inputMode="numeric"
          value={budget}
          onChange={handleBudgetChange}
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
          }}
        />
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={20} /> : "Generate Itinerary"}
        </Button>
      </div>
    </LocalizationProvider>
  );
};

export default TripPlanningForm;
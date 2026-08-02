import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { City, Country, type ICountry, type ICity } from "country-state-city";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";

const allCountries = Country.getAllCountries();

const TripPlanningForm = () => {
  const [budget, setBudget] = useState("");
  const [country, setCountry] = useState<ICountry | null>(null);
  const [city, setCity] = useState<ICity | null>(null);
  const [cities, setCities] = useState<ICity[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const handleBudgetChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBudget(event.target.value);
  };

  const handleCountryChange = (
    _event: SyntheticEvent,
    newValue: ICountry | null
  ) => {
    setCountry(newValue);
    setCity(null);

    if (newValue) {
      const countryCities = City.getCitiesOfCountry(newValue.isoCode) ?? [];
      setCities(countryCities);
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (_event: SyntheticEvent, newValue: ICity | null) => {
    setCity(newValue);
  };

  const increaseAdults = () => setAdults((prev) => prev + 1);
  const decreaseAdults = () => setAdults((prev) => Math.max(1, prev - 1));

  const increaseChildren = () => setChildren((prev) => prev + 1);
  const decreaseChildren = () => setChildren((prev) => Math.max(0, prev - 1));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <h3>Destination</h3>
        <Autocomplete
          options={allCountries}
          getOptionLabel={(option) => option.name}
          value={country}
          onChange={handleCountryChange}
          renderInput={(params) => (
            <TextField {...params} label="Country" variant="outlined" />
          )}
        />

        <Autocomplete
          options={cities}
          getOptionLabel={(option) => option.name}
          value={city}
          onChange={handleCityChange}
          disabled={!country}
          renderInput={(params) => (
            <TextField
              {...params}
              label={country ? "City" : "Select a country first"}
              variant="outlined"
            />
          )}
        />

        <p>
          Selected destination: {city ? `${city.name}, ${country?.name}` : "none yet"}
        </p>

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

        <p>
          Selected dates:{" "}
          {startDate ? startDate.format("MMM D, YYYY") : "none"} →{" "}
          {endDate ? endDate.format("MMM D, YYYY") : "none"}
        </p>

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

        <h3>Budget</h3>
        <TextField
          label="Budget"
          type="number"
          value={budget}
          onChange={handleBudgetChange}
          variant="outlined"
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            },
          }}
        />
        <p>Current value in state: {budget} USD</p>
      </div>
    </LocalizationProvider>
  );
};

export default TripPlanningForm;
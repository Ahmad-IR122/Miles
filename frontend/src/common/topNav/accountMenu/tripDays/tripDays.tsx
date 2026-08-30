import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import { formatTripDestinations, type Trip } from "../../../../types/trip";

const DAY_KEY = "YYYY-MM-DD";

/** A day covered by at least one trip. `start`/`end` are true when a trip
 *  actually begins or finishes here, which is what gets the filled cap. */
export type TripDayMark = {
  start: boolean;
  end: boolean;
  destinations: string[];
};

export const buildTripDays = (trips: Trip[]): Map<string, TripDayMark> => {
  const tripDays = new Map<string, TripDayMark>();
  trips.forEach((trip) => {
    const start = dayjs(trip.start_date);
    const end = dayjs(trip.end_date);
    if (!start.isValid() || !end.isValid() || end.isBefore(start, "day")) {
      return;
    }
    let day = start;
    while (!day.isAfter(end, "day")) {
      const key = day.format(DAY_KEY);
      const mark = tripDays.get(key) ?? {
        start: false,
        end: false,
        destinations: [],
      };
      mark.start = mark.start || day.isSame(start, "day");
      mark.end = mark.end || day.isSame(end, "day");
      const destinations = formatTripDestinations(trip.destinations);
      if (destinations && !mark.destinations.includes(destinations)) {
        mark.destinations.push(destinations);
      }
      tripDays.set(key, mark);
      day = day.add(1, "day");
    }
  });
  return tripDays;
};

/**
 * Where a run of trip days should be rounded off. A run breaks when the
 * neighbouring day is free, and also at the week edges — Sunday and Saturday
 * always get a cap, otherwise a trip spanning a row break looks sliced.
 */
export const getRunCap = (day: Dayjs, tripDays: Map<string, TripDayMark>) => {
  const capLeft =
    day.day() === 0 || !tripDays.has(day.subtract(1, "day").format(DAY_KEY));
  const capRight =
    day.day() === 6 || !tripDays.has(day.add(1, "day").format(DAY_KEY));
  if (capLeft && capRight) return "both";
  if (capLeft) return "left";
  if (capRight) return "right";
  return "none";
};

/** Day slot for `DateCalendar`. The trip treatment itself lives in the
 *  calendar's styles, keyed off the attributes set here. */
export const createTripDay = (tripDays: Map<string, TripDayMark>) => {
  const TripDay = (props: PickerDayProps) => {
    const { day, ...other } = props;
    const mark = tripDays.get(day.format(DAY_KEY));
    if (!mark) {
      return <PickerDay {...other} day={day} />;
    }
    return (
      <PickerDay
        {...other}
        day={day}
        title={mark.destinations.join(", ")}
        data-trip-cap={getRunCap(day, tripDays)}
        data-trip-edge={mark.start || mark.end ? "" : undefined}
      />
    );
  };
  return TripDay;
};

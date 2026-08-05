import { Box } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import type { Day } from "../pages/Itinerary";
import { formatDayDate } from "../pages/Itinerary";
import { useItineraryStyles } from "../styles/Itinerary.styles";

type DaySelectorProps = {
  days: Day[];
  selectedDay: number;
  setSelectedDay: Dispatch<SetStateAction<number>>;
  startDate?: string;
};

export function DaySelector({
  days,
  selectedDay,
  setSelectedDay,
  startDate,
}: DaySelectorProps) {
  const classes = useItineraryStyles();

  return (
    <Box className={classes.dayTabs}>
      {days.map((day, index) => (
        <button
          className={`${classes.dayTab} ${
            index === selectedDay ? classes.dayTabActive : ""
          }`}
          key={day.day}
          onClick={() => setSelectedDay(index)}
          type="button"
        >
          <span>Day {day.day}</span>
          <span className={classes.dayDate}>
            {formatDayDate(startDate, index)}
          </span>
        </button>
      ))}
    </Box>
  );
}

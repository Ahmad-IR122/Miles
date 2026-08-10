import { Box } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import { useItineraryStyles } from "../styles/itinerary.styles";
import type { Day } from "../types/itinerary.types";
import { formatDayDate } from "../utils/dateUtils";

type DaySelectorProps = {
  days: Day[];
  selectedDay: number;
  setSelectedDay: Dispatch<SetStateAction<number>>;
  startDate?: string;
};

export const DaySelector = ({
  days,
  selectedDay,
  setSelectedDay,
  startDate,
}: DaySelectorProps) => {
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
};

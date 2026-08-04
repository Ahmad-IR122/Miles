import { Box } from "@mui/material";
import type { Day } from "../pages/Itinerary";
import { useItineraryStyles } from "../styles/Itinerary.styles";

type DaySelectorProps = {
  days: Day[];
  endDate?: string;
  selectedDay: number;
  startDate?: string;
};

export function DaySelector({
  days,
  endDate,
  selectedDay,
  
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
          type="button"
        >
          <span>Day {day.day}</span>
          <span className={classes.dayDate}>
            {index === selectedDay ? startDate : endDate}
          </span>
        </button>
      ))}
    </Box>
  );
}

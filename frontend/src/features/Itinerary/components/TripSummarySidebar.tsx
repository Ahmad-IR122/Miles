import { Box, Button, Typography } from "@mui/material";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckIcon from "@mui/icons-material/Check";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import SavingsIcon from "@mui/icons-material/Savings";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import { useItineraryStyles } from "../styles/itinerary.styles";
import type { Activity, Trip } from "../types/itinerary.types";

type TripSummarySidebarProps = {
  trip: Trip;
};

const parseMoney = (value?: string) => {
  if (!value || value.toLowerCase() === "free") {
    return 0;
  }

  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getActivityCost = (activity: Activity) =>
  typeof activity === "string" ? 0 : parseMoney(activity.cost);

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);

const formatDuration = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) {
    return "";
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }

  return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString(
    "en-US",
    { month: "long" },
  )}`;
};

export const TripSummarySidebar = ({ trip }: TripSummarySidebarProps) => {
  const classes = useItineraryStyles();
  const activities = trip.days?.flatMap((day) => day.activities ?? []) ?? [];
  const calculatedSpent = activities.reduce(
    (total, activity) => total + getActivityCost(activity),
    0,
  );
  const estimatedSpent = trip.estimatedSpent ?? formatMoney(calculatedSpent);
  const budgetTotal = trip.budget ?? "$0";
  const budgetNumber = parseMoney(budgetTotal);
  const spentNumber = parseMoney(estimatedSpent);
  const budgetPercent = budgetNumber
    ? Math.min((spentNumber / budgetNumber) * 100, 100)
    : 0;

  return (
    <Box className={classes.summarySidebar}>
      <Typography className={classes.summaryTitle} component="h2">
        Trip Summary
      </Typography>

      <Box className={classes.summaryCards}>
        <Box className={classes.summaryCard}>
          <SavingsIcon className={classes.summaryMoneyIcon} />
          <CheckIcon className={classes.summaryCheck} />
          <Typography className={classes.summaryValue}>
            {budgetTotal}
          </Typography>
          <Typography className={classes.summaryLabel}>Total Budget</Typography>
          <Typography className={classes.summaryNote}>
            {estimatedSpent} estimated spent
          </Typography>
        </Box>

        <Box className={classes.summaryCard}>
          <CalendarMonthIcon className={classes.summaryCalendarIcon} />
          <CheckIcon className={classes.summaryCheck} />
          <Typography className={classes.summaryValue}>
            {trip.days?.length ?? 0} Days
          </Typography>
          <Typography className={classes.summaryLabel}>Duration</Typography>
          <Typography className={classes.summaryNote}>
            {formatDuration(trip.startDate, trip.endDate)}
          </Typography>
        </Box>

        <Box className={classes.summaryCard}>
          <TrackChangesIcon className={classes.summaryTargetIcon} />
          <CheckIcon className={classes.summaryCheck} />
          <Typography className={classes.summaryValue}>
            {activities.length}
          </Typography>
          <Typography className={classes.summaryLabel}>Activities</Typography>
          <Typography className={classes.summaryNote}>
            {(trip.days?.[0]?.activities ?? []).length} today
          </Typography>
        </Box>

        <Box className={classes.summaryCard}>
          <GroupsIcon className={classes.summaryTravelersIcon} />
          <CheckIcon className={classes.summaryCheck} />
          <Typography className={classes.summaryValue}>
            {trip.travelers ?? 0} Adults
          </Typography>
          <Typography className={classes.summaryLabel}>Travelers</Typography>
          <Typography className={classes.summaryNote}>
            per person costs shown
          </Typography>
        </Box>
      </Box>

      <Box className={classes.budgetRow}>
        <span>Budget Used</span>
        <span>
          {estimatedSpent} / {budgetTotal}
        </span>
      </Box>
      <Box className={classes.progressTrack}>
        <Box
          className={classes.progressFill}
          style={{ width: `${budgetPercent}%` }}
        />
      </Box>

      <Button
        className={classes.modifyTripButton}
        startIcon={<AutoAwesomeIcon className={classes.modifyTripIcon} />}
        variant="contained"
      >
        Ask AI to Modify Trip
      </Button>

      <Button
        className={classes.exportButton}
        startIcon={<FileUploadOutlinedIcon fontSize="small" />}
        variant="contained"
      >
        Export PDF
      </Button>
    </Box>
  );
};

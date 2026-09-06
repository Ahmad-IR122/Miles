import type { Activity } from "../types/itinerary.types";

const TIME_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
const MINUTES_PER_DAY = 24 * 60;

const parseDisplayTime = (value?: string): number | undefined => {
  if (!value) return undefined;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return undefined;
  const hour = Number(match[1]) % 12;
  return (
    (match[3].toUpperCase() === "PM" ? hour + 12 : hour) * 60 + Number(match[2])
  );
};

const formatDisplayTime = (totalMinutes: number): string => {
  const wrapped =
    ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(wrapped / 60);
  const minute = wrapped % 60;
  const suffix = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
};

/**
 * Re-times a reordered day: each position's target start time is whatever
 * start time that position held *before* this reorder (`previousActivities`,
 * same length/order as `reorderedActivities`, just not yet shuffled) - i.e.
 * a dropped card takes on the start time of "the card that should be
 * there," not a start time glued to whatever now precedes it.
 *
 * Each activity keeps its own duration. If that would make it run past the
 * next activity's target start time, only that next activity (and any
 * others it would then collide with, in turn) gets pushed later just enough
 * to clear it - once a later activity's own target start is already past
 * the pushed cursor, the cascade stops there and gaps further into the day
 * are left untouched.
 *
 * Activities without a parseable start/end time (fixture/string-only
 * entries) are left untouched and don't advance the cursor, so they don't
 * force a shift onto whatever comes after them.
 */
export const repackActivities = (
  previousActivities: Activity[],
  reorderedActivities: Activity[],
): Activity[] => {
  let cursor: number | undefined;

  return reorderedActivities.map((activity, index) => {
    if (typeof activity === "string") return activity;

    const startMinutes = parseDisplayTime(activity.time);
    const endMinutes = parseDisplayTime(activity.endTime);
    const duration =
      startMinutes !== undefined && endMinutes !== undefined
        ? (endMinutes - startMinutes + MINUTES_PER_DAY) % MINUTES_PER_DAY
        : undefined;

    if (duration === undefined) {
      return activity;
    }

    const previous = previousActivities[index];
    const targetStart =
      (typeof previous === "string"
        ? undefined
        : parseDisplayTime(previous?.time)) ?? startMinutes;

    if (targetStart === undefined) {
      return activity;
    }

    const newStart =
      cursor === undefined ? targetStart : Math.max(targetStart, cursor);
    const newEnd = newStart + duration;
    cursor = newEnd;

    return {
      ...activity,
      time: formatDisplayTime(newStart),
      endTime: formatDisplayTime(newEnd),
    };
  });
};

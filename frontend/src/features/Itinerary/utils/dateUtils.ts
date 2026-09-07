const toDate = (date?: string) => {
  if (!date) {
    return undefined;
  }

  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatShortDate = (date?: Date) =>
  date?.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) ?? "";

const DAY_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
};

/** Formats a day's own stored date. */
export const formatDate = (date?: string) =>
  toDate(date)?.toLocaleDateString("en-US", DAY_DATE_FORMAT) ?? "";

/**
 * Fallback for days that carry no date of their own (fixture data): the
 * trip's start date advanced by `offset`. Prefer formatDate() whenever the
 * day has a real date - deriving it from a list position hides ordering
 * bugs behind a date that always looks plausible.
 */
export const formatDayDate = (startDate?: string, offset = 0) => {
  const date = toDate(startDate);

  if (!date) {
    return "";
  }

  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString("en-US", DAY_DATE_FORMAT);
};

export const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) {
    return "";
  }

  return [formatShortDate(toDate(startDate)), formatShortDate(toDate(endDate))]
    .filter(Boolean)
    .join(" - ");
};

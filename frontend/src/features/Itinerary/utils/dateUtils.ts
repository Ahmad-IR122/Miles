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

export const formatDayDate = (startDate?: string, offset = 0) => {
  const date = toDate(startDate);

  if (!date) {
    return "";
  }

  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) {
    return "";
  }

  return [formatShortDate(toDate(startDate)), formatShortDate(toDate(endDate))]
    .filter(Boolean)
    .join(" - ");
};

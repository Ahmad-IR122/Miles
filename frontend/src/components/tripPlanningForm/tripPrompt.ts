/**
 * Turns the planning form's answers into a single natural-language brief.
 *
 * Nothing here talks to an AI service — this only produces the text. Handing
 * that text to a model is deliberately left to the itinerary side, so the
 * prompt can be reviewed and tweaked without touching the form.
 *
 * The wording is intentionally hardcoded English rather than routed through
 * i18n: it is model input, not copy shown to the traveler.
 */

export type TripPromptStop = {
  country: string;
  cities: string[];
};

export type TripPromptInput = {
  stops: TripPromptStop[];
  startDate: string;
  endDate: string;
  tripDuration: number;
  adults: number;
  children: number;
  budgetMin: number;
  budgetMax: number;
  interests: string[];
  notes: string;
};

const formatDays = (count: number) =>
  `${count} ${count === 1 ? "day" : "days"}`;

const formatStop = ({ country, cities }: TripPromptStop) =>
  cities.length > 0 ? `${country} (${cities.join(", ")})` : country;

const formatTravelers = (adults: number, children: number) => {
  const parts = [`${adults} ${adults === 1 ? "adult" : "adults"}`];

  if (children > 0) {
    parts.push(`${children} ${children === 1 ? "child" : "children"}`);
  }

  return parts.join(" and ");
};

export const buildTripPrompt = ({
  stops,
  startDate,
  endDate,
  tripDuration,
  adults,
  children,
  budgetMin,
  budgetMax,
  interests,
  notes,
}: TripPromptInput): string => {
  const trimmedNotes = notes.trim();

  const lines = [
    `Plan a ${formatDays(tripDuration)} trip.`,
    "",
    `Destinations: ${stops.map(formatStop).join("; ") || "not specified"}`,
    `Dates: ${startDate} to ${endDate} (${formatDays(tripDuration)})`,
    `Travelers: ${formatTravelers(adults, children)}`,
    `Budget: ${budgetMin}$ to ${budgetMax}$ total`,
    `Interests: ${interests.length > 0 ? interests.join(", ") : "no preference given"}`,
  ];

  if (trimmedNotes) {
    lines.push(
      "",
      "The traveler also asked for the following, in their own words:",
      trimmedNotes,
    );
  }

  lines.push(
    "",
    "Spread the days across the destinations above and respect any day counts",
    "or preferences the traveler described.",
  );

  return lines.join("\n");
};

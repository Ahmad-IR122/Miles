import { useState } from "react";
import type { AxiosResponse } from "axios";
import type { GeneratedItinerary } from "../types/itinerary";

export type RegenerateScope = "trip" | "day" | "activity" | "add";

type Target = { scope: RegenerateScope; id: string } | null;

export const useRegenerate = (
  onSuccess: (itinerary: GeneratedItinerary) => void,
) => {
  const [target, setTarget] = useState<Target>(null);
  const [error, setError] = useState("");

  const run = async (
    next: NonNullable<Target>,
    call: () => Promise<AxiosResponse<GeneratedItinerary>>,
  ) => {
    if (target) return false;
    setTarget(next);
    setError("");
    try {
      const response = await call();
      onSuccess(response.data);
      return true;
    } catch {
      setError(
        next.scope === "add"
          ? "Couldn't add the activity. Please try again."
          : "Couldn't regenerate. Please try again.",
      );
      return false;
    } finally {
      setTarget(null);
    }
  };

  const isRegenerating = (scope: RegenerateScope, id: string) =>
    target?.scope === scope && target.id === id;

  return {
    run,
    isBusy: target !== null,
    isRegenerating,
    error,
    clearError: () => setError(""),
  };
};

import { useState } from "react";
import type { AxiosResponse } from "axios";
import type { Itinerary } from "../types/itinerary";

export type RegenerateScope = "trip" | "day" | "activity";

type Target = { scope: RegenerateScope; id: string } | null;

export const useRegenerate = (onSuccess: (itinerary: Itinerary) => void) => {
  const [target, setTarget] = useState<Target>(null);
  const [error, setError] = useState("");

  const run = async (
    next: NonNullable<Target>,
    call: () => Promise<AxiosResponse<Itinerary>>,
  ) => {
    if (target) return;
    setTarget(next);
    setError("");
    try {
      const response = await call();
      onSuccess(response.data);
    } catch {
      setError("Couldn't regenerate. Please try again.");
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

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import {
  ThemeModeContext,
  applyMode,
  prefersDark,
  readStoredMode,
  storeMode,
  subscribeToSystemTheme,
} from "./themeMode";
import type { ThemeMode } from "./themeMode";

type ThemeModeProviderProps = {
  children: ReactNode;
};

export const ThemeModeProvider = ({ children }: ThemeModeProviderProps) => {
  // Initialised from storage so the very first render already holds the
  // user's choice, which the layout effect below stamps before paint.
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  // The OS preference is external state, so it is subscribed to rather than
  // mirrored into a useState. It can change under us while on "system" — a
  // scheduled night theme, say. The CSS follows that on its own; this is what
  // keeps the icon and label in step with it.
  const systemPrefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    prefersDark,
  );

  // Derived, not stored: everything it depends on is already reactive.
  const resolvedTheme =
    mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

  // The one genuine external-system sync: push the choice onto <html>.
  // Deliberately a layout effect, not useEffect: it runs after the DOM is
  // committed but before the browser paints, so the app's first paint is
  // already the chosen theme rather than flipping to it a frame later.
  useLayoutEffect(() => {
    applyMode(mode);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    storeMode(next);
    setModeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setMode]);

  const value = useMemo(
    () => ({ mode, resolvedTheme, setMode, toggleTheme }),
    [mode, resolvedTheme, setMode, toggleTheme],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

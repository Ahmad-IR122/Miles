import { createContext, useContext } from "react";

/**
 * Theme state. The palette itself lives in `theme.css`; this module only
 * decides which half of it applies, by setting `data-theme` on <html>.
 *
 * Three modes, two outcomes: "system" defers to the OS and stamps no
 * attribute, so the `prefers-color-scheme` rules in theme.css win. "light" and
 * "dark" stamp the attribute and override the OS.
 */
export type ThemeMode = "light" | "dark" | "system";

/** What "system" actually resolved to — never "system" itself. */
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "Miles-theme";

const DARK_QUERY = "(prefers-color-scheme: dark)";

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "light" || value === "dark" || value === "system";

/**
 * Read the stored choice. Falls back to "system" for a first-time visitor, and
 * for a browser that refuses localStorage (Safari private mode, blocked
 * third-party storage) — where reading throws rather than returning null.
 */
export const readStoredMode = (): ThemeMode => {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

export const storeMode = (mode: ThemeMode): void => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Non-fatal: the theme still applies for this session, it just won't persist.
  }
};

export const prefersDark = (): boolean => window.matchMedia(DARK_QUERY).matches;

export const resolveMode = (mode: ThemeMode): ResolvedTheme => {
  if (mode === "system") {
    return prefersDark() ? "dark" : "light";
  }
  return mode;
};

/**
 * Stamp the choice onto <html>. "system" removes the attribute rather than
 * writing a resolved value, so the OS preference stays live afterwards.
 */
export const applyMode = (mode: ThemeMode): void => {
  const root = document.documentElement;
  if (mode === "system") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", mode);
  }
};

export const subscribeToSystemTheme = (onChange: () => void): (() => void) => {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

export type ThemeModeContextValue = {
  /** The user's choice, including "system". */
  mode: ThemeMode;
  /** What that choice currently renders as. Use this to pick icons and labels. */
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  /** Flip to the opposite of what is on screen, as an explicit choice. */
  toggleTheme: () => void;
};

export const ThemeModeContext = createContext<ThemeModeContextValue | null>(
  null,
);

export const useThemeMode = (): ThemeModeContextValue => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return context;
};

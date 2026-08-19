import { useMemo } from "react";
import type { ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";

import { createAppMuiTheme } from "./muiTheme";
import { useThemeMode } from "./themeMode";

type AppThemeProviderProps = {
  children: ReactNode;
};

/**
 * Feeds the resolved theme into MUI. Sits inside ThemeModeProvider, which owns
 * the choice; this only translates it for MUI's benefit.
 *
 * Deliberately no <CssBaseline />: the app already paints its own page and
 * surface backgrounds, and adding MUI's reset now would change how light mode
 * looks rather than leaving it untouched.
 */
export const AppThemeProvider = ({ children }: AppThemeProviderProps) => {
  const { resolvedTheme } = useThemeMode();
  const theme = useMemo(
    () => createAppMuiTheme(resolvedTheme),
    [resolvedTheme],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

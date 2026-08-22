import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./common/theme/theme.css";
import "./index.css";
import "./i18n";
import router from "./routes/router";
import { AppThemeProvider } from "./common/theme/appThemeProvider";
import { ThemeModeProvider } from "./common/theme/themeModeProvider";
import SplashScreen from "./components/splashScreen/splashScreen";
import { AppClerkProvider } from "./features/auth/appClerkProvider";

const STARTUP_SPLASH_DURATION = 1800;

const AppStartup = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setIsLoading(false),
      STARTUP_SPLASH_DURATION,
    );

    return () => window.clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeModeProvider>
      <AppThemeProvider>
        <AppClerkProvider>
          <AppStartup />
        </AppClerkProvider>
      </AppThemeProvider>
    </ThemeModeProvider>
  </StrictMode>,
);

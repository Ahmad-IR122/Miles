import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "./common/theme/theme.css";
import "./index.css";
import "./i18n";
import router from "./routes/router";
import { AppThemeProvider } from "./common/theme/appThemeProvider";
import { ThemeModeProvider } from "./common/theme/themeModeProvider";
import { AppClerkProvider } from "./features/auth/appClerkProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeModeProvider>
      <AppThemeProvider>
        <AppClerkProvider>
          <RouterProvider router={router} />
        </AppClerkProvider>
      </AppThemeProvider>
    </ThemeModeProvider>
  </StrictMode>,
);

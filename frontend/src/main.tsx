import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

import "./index.css";
import "./i18n";
import router from "./routes/router";
import { clerkAppearance } from "./features/auth/styles/clerkAppearance.styles";
import { clerkPublishableKey } from "./features/auth/utils/clerkConfig";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      appearance={clerkAppearance}
      publishableKey={clerkPublishableKey}
    >
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
);

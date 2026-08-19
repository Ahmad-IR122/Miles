import { useMemo } from "react";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/clerk-react";

import { useThemeMode } from "../../common/theme/themeMode";
import { createClerkAppearance } from "./styles/clerkAppearance.styles";
import { clerkPublishableKey } from "./utils/clerkConfig";

type AppClerkProviderProps = {
  children: ReactNode;
};

/**
 * Feeds the resolved theme into Clerk.
 *
 * Signed-out pages need this as much as signed-in ones: the theme comes from
 * the OS preference or a stored choice that outlives sign-out, so a visitor can
 * reach sign-in already in dark mode without ever having used the toggle.
 *
 * Appearance set here cascades to every Clerk component, so individual pages
 * should not pass their own `appearance` — doing so would pin them to whatever
 * theme that object was built for.
 */
export const AppClerkProvider = ({ children }: AppClerkProviderProps) => {
  const { resolvedTheme } = useThemeMode();
  const appearance = useMemo(
    () => createClerkAppearance(resolvedTheme),
    [resolvedTheme],
  );

  return (
    <ClerkProvider appearance={appearance} publishableKey={clerkPublishableKey}>
      {children}
    </ClerkProvider>
  );
};

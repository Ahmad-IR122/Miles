import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import Tooltip from "@mui/material/Tooltip";
import { mergeClasses } from "@griffel/react";

import { useThemeMode } from "./themeMode";
import { useThemeToggleStyles } from "./themeToggle.styles";

type ThemeToggleProps = {
  className?: string;
};

/**
 * Standalone light/dark switch. Lives in the top-right of the header so it is
 * reachable before sign-in, not only from the signed-in account menu.
 */
const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const styles = useThemeToggleStyles();
  const { resolvedTheme, toggleTheme } = useThemeMode();
  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip title={label}>
      <button
        type="button"
        className={mergeClasses(styles.toggle, className)}
        onClick={toggleTheme}
        aria-label={label}
      >
        {isDark ? (
          <LightModeOutlinedIcon fontSize="small" aria-hidden="true" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" aria-hidden="true" />
        )}
      </button>
    </Tooltip>
  );
};

export default ThemeToggle;

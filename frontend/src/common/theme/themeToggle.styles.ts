import { makeStyles, shorthands } from "@griffel/react";

import { warm } from "./colors";
import { layout, typography } from "./typography";

export const useThemeToggleStyles = makeStyles({
  toggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: layout.controlSize.xs,
    height: layout.controlSize.xs,
    padding: 0,
    borderRadius: layout.radius.full,
    color: warm.textSecondary,
    backgroundColor: "transparent",
    cursor: "pointer",
    flexShrink: 0,
    ...shorthands.border(layout.borderWidth.hairline, "solid", warm.border),
    transitionProperty: "color, background-color",
    transitionDuration: layout.duration.fast,
    transitionTimingFunction: "ease",

    ":hover": {
      color: warm.rose,
      backgroundColor: warm.bgTint,
    },

    ":focus-visible": {
      outlineColor: warm.coralBright,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },

    "& svg": {
      fontSize: typography.fontSize.size8,
    },
  },
});

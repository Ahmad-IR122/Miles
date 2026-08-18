import { makeStyles } from "@griffel/react";
import { warm } from "../theme/colors";
import { layout } from "../theme/typography";

export const useAppLayoutStyles = makeStyles({
  root: {
    minHeight: "100dvh",
    backgroundColor: warm.bgPage,
  },

  navOffset: {
    // Nav is fixed and inset from the top, so clear its height plus that inset.
    paddingTop: `${layout.navHeight + 66}px`,
    minHeight: "100dvh",

    "@media (max-width: 760px)": {
      paddingTop: `${layout.navHeight + 52}px`,
    },
  },
});

import { makeStyles } from "@griffel/react";

export const useAppLayoutStyles = makeStyles({
  root: {
    minHeight: "100dvh",
    backgroundColor: "#FFF9F5",
  },

  navOffset: {
    paddingTop: "126px",
    minHeight: "100dvh",

    "@media (max-width: 760px)": {
      paddingTop: "112px",
    },
  },
});

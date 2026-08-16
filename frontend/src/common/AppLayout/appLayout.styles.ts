import { makeStyles } from "@griffel/react";

export const useAppLayoutStyles = makeStyles({
  navOffset: {
    paddingTop: "126px",
    backgroundColor: "#FFF9F5",
    minHeight: "100dvh",

    "@media (max-width: 760px)": {
      paddingTop: "112px",
    },
  },
});

import { makeStyles } from "@griffel/react";

export const useAppLayoutStyles = makeStyles({
  root: {
    minHeight: "100dvh",
    backgroundColor: "#FFF9F5",
    display: "flex",
    flexDirection: "column",
  },

  content: {
    flex: 1,
  },

  navOffset: {
    paddingTop: "126px",
    flex: 1,

    "@media (max-width: 760px)": {
      paddingTop: "112px",
    },
  },
});

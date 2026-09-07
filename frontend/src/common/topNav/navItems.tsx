import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import { routesPaths } from "../../routes/routesPaths";

// Discover isn't a standalone tab anymore - it's only reachable from a
// specific itinerary now (via its "Discover more activities" button), pre-
// filtered to that trip's country, so it no longer makes sense as a
// destination you'd jump to on its own from the main nav.
export const navItems = [
  {
    label: "Home",
    path: routesPaths.home,
    icon: <HomeRoundedIcon aria-hidden="true" />,
  },
  {
    label: "Itinerary",
    path: routesPaths.itinerary,
    icon: <CalendarMonthOutlinedIcon aria-hidden="true" />,
  },
  {
    label: "My Trips",
    path: routesPaths.savedTrips,
    icon: <PlaceOutlinedIcon aria-hidden="true" />,
  },
];

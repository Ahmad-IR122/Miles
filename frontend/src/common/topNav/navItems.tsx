import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import { routesPaths } from "../../routes/routesPaths";

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
    path: routesPaths.myTrips,
    icon: <PlaceOutlinedIcon aria-hidden="true" />,
  },
  {
    label: "Discover",
    path: routesPaths.recommendation,
    icon: <PlaceOutlinedIcon aria-hidden="true" />,
  },
];

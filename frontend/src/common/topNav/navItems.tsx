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
    label: "Trips",
    path: routesPaths.itinerary,
    icon: <CalendarMonthOutlinedIcon aria-hidden="true" />,
  },
  {
    label: "Destinations",
    path: routesPaths.recommendation,
    icon: <PlaceOutlinedIcon aria-hidden="true" />,
  },
];

import { createBrowserRouter } from "react-router-dom";
import Home from "./home";
import PlanTrip from "./plan-trip";
import Itinerary from "./Itinerary";
import { routesPaths } from "./routesPaths";

const router = createBrowserRouter([
  {
    path: routesPaths.home,
    element: <Home />,
  },
  {
    path: routesPaths.planTrip,
    element: <PlanTrip />,
  },
  {
    path: routesPaths.itinerary,
    element: <Itinerary />,
  },
]);

export default router;
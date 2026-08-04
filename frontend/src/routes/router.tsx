import { createBrowserRouter } from "react-router-dom";
import Home from "./home";
import { routesPaths } from "./routesPaths";
import Itinerary from "../features/Itinerary/pages/Itinerary";

const router = createBrowserRouter([
  {
    path: routesPaths.home,
    element: <Home />,
  },{
    path: routesPaths.itinerary,
    element: <Itinerary />,
  },
]);

export default router;

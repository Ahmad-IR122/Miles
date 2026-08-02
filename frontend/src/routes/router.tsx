import { createBrowserRouter } from "react-router-dom";
import PlanTrip from "./plan-trip";
import { routesPaths } from "./routesPaths";

const router = createBrowserRouter([
  {
    path: routesPaths.home,
    element: <PlanTrip />,
  },
]);

export default router;
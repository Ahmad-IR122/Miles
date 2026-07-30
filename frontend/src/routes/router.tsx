import { createBrowserRouter } from "react-router-dom";
import Home from "./home";
import { routesPaths } from "./routesPaths";

const router = createBrowserRouter([
  {
    path: routesPaths.home,
    element: <Home />,
  },
]);

export default router;
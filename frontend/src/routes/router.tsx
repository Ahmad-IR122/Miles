import { createBrowserRouter } from "react-router-dom";
import Home from "./home";
import Itinerary from "../features/Itinerary/pages/Itinerary";
import ChatPage from "../features/chatbot/pages/ChatPage";
import PlanTrip from "./plan-trip";
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
  {
    path: routesPaths.chatbot,
    element: <ChatPage />,
  },
]);

export default router;

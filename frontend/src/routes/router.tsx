import { createBrowserRouter } from "react-router-dom";
import Home from "./home";
import Itinerary from "../features/Itinerary/pages/itinerary";
import ChatPage from "../features/chatbot/pages/chatPage";
import PlanTrip from "./plan-trip";
import SignUpPage from "../features/auth/pages/signUp";
import SignInPage from "../features/auth/pages/signIn";
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
  {
    path: routesPaths.signUp,
    element: <SignUpPage />,
  },
  {
    path: routesPaths.signIn,
    element: <SignInPage />,
  },
]);

export default router;

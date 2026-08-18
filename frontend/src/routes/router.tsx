import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../common/appLayout/appLayout";
import Home from "./home";
import Itinerary from "../features/Itinerary/pages/itinerary";
import ChatPage from "../features/chatbot/pages/chatPage";
import PlanTrip from "./plan-trip";
import SignUpPage from "../features/auth/pages/signUp";
import SignInPage from "../features/auth/pages/signIn";
import Recommendations from "../features/recommendations/pages/recommendations";
import NotFound from "./not-found";
import { routesPaths } from "./routesPaths";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: routesPaths.home,
        element: <Home />,
      },
      {
        path: routesPaths.planTrip,
        element: <PlanTrip />,
      },
      {
        path: routesPaths.recommendation,
        element: <Recommendations />,
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
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;

import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../common/appLayout/appLayout";
import Home from "./home";
import Itinerary from "../features/Itinerary/pages/itinerary";
import ChatPage from "../features/chatbot/pages/chatPage";
import PlanTrip from "./plan-trip";
import SignUpPage from "../features/auth/pages/signUp";
import SignInPage from "../features/auth/pages/signIn";
import Recommendations from "../features/recommendations/pages/recommendations";
import ProtectedRoute from "../features/auth/components/protectedRoute";
import { routesPaths } from "./routesPaths";
import NotFound from "./not-found";

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
        element: (
          <ProtectedRoute>
            <PlanTrip />
          </ProtectedRoute>
        ),
      },
      {
        path: routesPaths.recommendation,
        element: <Recommendations />,
      },
      {
        path: routesPaths.itinerary,
        element: (
          <ProtectedRoute>
            <Itinerary />
          </ProtectedRoute>
        ),
      },
      {
        path: routesPaths.chatbot,
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
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

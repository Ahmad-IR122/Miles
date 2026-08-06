import { createBrowserRouter } from "react-router-dom";
import Home from "./home";
import { routesPaths } from "./routesPaths";
import Itinerary from "../features/Itinerary/pages/Itinerary";
import ChatPage from "../features/chatbot/pages/ChatPage";

const router = createBrowserRouter([
  {
    path: routesPaths.home,
    element: <Home />,
  },{
    path: routesPaths.itinerary,
    element: <Itinerary />,
  },
  {
    path: routesPaths.chatbot,
    element: <ChatPage />,
  }
]);

export default router;

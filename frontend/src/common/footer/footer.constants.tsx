import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import YouTubeIcon from "@mui/icons-material/YouTube";

import { routesPaths } from "../../routes/routesPaths";

export const planLinks = [
  { label: "Plan Your Trip", path: routesPaths.planTrip },
  { label: "Destinations", path: routesPaths.recommendation },
  { label: "AI Itinerary", path: routesPaths.itinerary },
  { label: "Travel Guide", path: routesPaths.chatbot },
];

export const tripLinks = [
  { label: "My Trips", path: routesPaths.itinerary },
  { label: "Discover", path: routesPaths.recommendation },
  { label: "AI Chat", path: routesPaths.chatbot },
  { label: "Home", path: routesPaths.home },
];

export const socialItems = [
  { label: "Instagram", icon: <InstagramIcon aria-hidden="true" /> },
  { label: "Facebook", icon: <FacebookRoundedIcon aria-hidden="true" /> },
  { label: "Twitter", icon: <TwitterIcon aria-hidden="true" /> },
  { label: "YouTube", icon: <YouTubeIcon aria-hidden="true" /> },
];

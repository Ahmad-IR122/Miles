export type ChatRole = "assistant" | "user";

export type ItineraryPreview = {
  destination?: string;
  title?: string;
  tripTitle?: string;
  cities?: string[];
  duration?: string;
  interests?: string[];
  image?: string;
  imageUrl?: string;
  itineraryUrl?: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  status?: string;
  itinerary?: ItineraryPreview;
};

export type ChatResponse = {
  response?: string;
  message?: string;
  content?: string;
  destination?: string;
  title?: string;
  tripTitle?: string;
  cities?: string[];
  duration?: string;
  interests?: string[];
  image?: string;
  imageUrl?: string;
  itineraryUrl?: string;
  data?: ItineraryPreview & {
    response?: string;
    message?: string;
    content?: string;
  };
};

import type { ChatResponse, ItineraryPreview } from "../types/chatbot.types";

export const getResponseText = (payload: ChatResponse) =>
  payload.response ||
  payload.message ||
  payload.content ||
  payload.data?.response ||
  payload.data?.message ||
  payload.data?.content ||
  "";

export const getItineraryPreview = (
  payload: ChatResponse,
): ItineraryPreview | undefined => {
  const source = payload.data ?? payload;
  const preview: ItineraryPreview = {
    destination: source.destination,
    title: source.title,
    tripTitle: source.tripTitle,
    cities: source.cities,
    duration: source.duration,
    interests: source.interests,
    image: source.image,
    imageUrl: source.imageUrl,
    itineraryUrl: source.itineraryUrl,
  };

  return Object.values(preview).some(Boolean) ? preview : undefined;
};

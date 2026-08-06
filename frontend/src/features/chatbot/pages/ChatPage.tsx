import { useMemo, useState } from "react";
import { Box } from "@mui/material";

import { api } from "../../../api/api";
import { ChatHeader } from "../components/ChatHeader";
import { MessageComposer } from "../components/MessageComposer";
import { MessageList } from "../components/MessageList";
import { useChatbotStyles } from "../styles/Chatbot.styles";
import type { ChatMessage, ChatResponse } from "../types/Chatbot.types";
import { getItineraryPreview, getResponseText } from "../utils/chatResponse";

function ChatPage() {
  const classes = useChatbotStyles();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const handleSubmit = async () => {
    const prompt = input.trim();
    if (!prompt || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
      status: "Sent",
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post<ChatResponse>("/chat", { prompt });
      const payload = response.data;
      const content = getResponseText(payload);
      const itinerary = getItineraryPreview(payload);

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: content || "I received your request.",
          timestamp: new Date(),
          itinerary,
        },
      ]);
    } catch (requestError) {
      console.error("Error sending chat message:", requestError);
      setError(
        "We couldn't send your message. Please check that the chat service is running and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={classes.page}>
      <Box className={classes.shell}>
        <ChatHeader />
        <MessageList error={error} isLoading={isLoading} messages={messages} />
        <MessageComposer
          disabled={!canSend}
          input={input}
          isLoading={isLoading}
          onInputChange={setInput}
          onSubmit={handleSubmit}
        />
      </Box>
    </Box>
  );
}

export default ChatPage;

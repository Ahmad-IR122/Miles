import { Avatar, Box, Typography } from "@mui/material";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import { mergeClasses } from "@griffel/react";

import { ItineraryPreviewCard } from "./ItineraryPreviewCard";
import { useChatbotStyles } from "../styles/chatbot.styles";
import type { ChatMessage } from "../types/chatbot.types";

type ChatMessageBubbleProps = {
  message: ChatMessage;
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

export const ChatMessageBubble = ({ message }: ChatMessageBubbleProps) => {
  const classes = useChatbotStyles();
  const isAssistant = message.role === "assistant";

  return (
    <Box
      className={mergeClasses(
        classes.messageRow,
        isAssistant ? classes.assistantRow : classes.userRow,
      )}
    >
      {isAssistant && (
        <Avatar className={classes.avatar}>
          <FlightTakeoffRoundedIcon fontSize="small" />
        </Avatar>
      )}
      <Box
        className={mergeClasses(
          classes.bubble,
          isAssistant ? classes.assistantBubble : classes.userBubble,
        )}
      >
        <Typography className={classes.messageText}>
          {message.content}
        </Typography>
        {message.itinerary && (
          <ItineraryPreviewCard itinerary={message.itinerary} />
        )}
        <Box className={classes.meta}>
          <span>{formatTime(message.timestamp)}</span>
          {message.status && <span>{message.status}</span>}
        </Box>
      </Box>
    </Box>
  );
};

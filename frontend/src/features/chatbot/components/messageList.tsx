import {
  Alert,
  Avatar,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import { mergeClasses } from "@griffel/react";

import { ChatMessageBubble } from "./ChatMessageBubble";
import { useChatbotStyles } from "../styles/chatbot.styles";
import type { ChatMessage } from "../types/chatbot.types";

type MessageListProps = {
  error: string;
  isLoading: boolean;
  messages: ChatMessage[];
};

export const MessageList = ({
  error,
  isLoading,
  messages,
}: MessageListProps) => {
  const classes = useChatbotStyles();

  return (
    <Box className={classes.messages}>
      {messages.length === 0 && !error && (
        <Box className={classes.emptyState}>
          <Avatar className={classes.emptyIcon}>
            <FlightTakeoffRoundedIcon />
          </Avatar>
          <Typography className={classes.emptyTitle}>
            Where should we go?
          </Typography>
          <Typography className={classes.emptyCopy}>
            Ask for help planning a route, comparing destinations, or shaping a
            trip around your dates and interests.
          </Typography>
        </Box>
      )}
      {messages.map((message) => (
        <ChatMessageBubble key={message.id} message={message} />
      ))}
      {isLoading && (
        <Box className={mergeClasses(classes.messageRow, classes.assistantRow)}>
          <Avatar className={classes.avatar}>
            <AutoAwesomeRoundedIcon fontSize="small" />
          </Avatar>
          <Box
            className={mergeClasses(classes.bubble, classes.assistantBubble)}
          >
            <CircularProgress size={18} />
          </Box>
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
};

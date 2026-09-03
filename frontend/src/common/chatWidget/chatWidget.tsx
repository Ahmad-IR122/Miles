import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useAuth } from "@clerk/clerk-react";
import { useParams } from "react-router-dom";

import { mergeClasses } from "@griffel/react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import logo from "../../assets/newLogo.png";
import { useChatWidgetStyles } from "./chatWidget.styles";
import { sendChatMessage } from "./chatApi";

type ChatMessage = {
  id: string;
  role: "user" | "system";
  text: string;
};

type ChatHistoryTurn = {
  user_query: string;
  answer: string;
};

const MAX_HISTORY_TURNS = 3;

const toHistoryTurns = (entries: ChatMessage[]): ChatHistoryTurn[] => {
  const turns: ChatHistoryTurn[] = [];
  for (let i = 0; i < entries.length - 1; i += 1) {
    const current = entries[i];
    const next = entries[i + 1];
    if (current.role === "user" && next.role === "system") {
      turns.push({ user_query: current.text, answer: next.text });
      i += 1;
    }
  }
  return turns.slice(-MAX_HISTORY_TURNS);
};

const ERROR_MESSAGE = "Sorry, something went wrong. Please try again later.";

const ChatWidget = () => {
  const styles = useChatWidgetStyles();
  const { getToken } = useAuth();
  const { itineraryId: tripId } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
    });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const token = await getToken().catch(() => null);

      const history = toHistoryTurns(messages);

      const data = await sendChatMessage(
        token,
        text,
        conversationId,
        tripId ? Number(tripId) : undefined,
        history,
      );

      setConversationId(data.conversation_id);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-system`, role: "system", text: data.reply },
      ]);
    } catch (err) {
      console.error("Milo chat error:", err);
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-system`, role: "system", text: ERROR_MESSAGE },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        aria-label="Open Milo chat"
        className={mergeClasses(styles.bubble, isOpen && "isHidden")}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <ChatBubbleRoundedIcon className={styles.bubbleIcon} />
      </button>

      <Box
        aria-hidden="true"
        className={mergeClasses(styles.scrim, isOpen && "isOpen")}
        onClick={() => setIsOpen(false)}
      />

      <Box
        aria-label="Milo chat"
        aria-hidden={!isOpen}
        className={mergeClasses(styles.panel, isOpen && "isOpen")}
        role="dialog"
      >
        <Box className={styles.header}>
          <Box className={styles.headerTitleRow}>
            <Box className={styles.headerAvatar}>
              <img alt="" className={styles.headerAvatarImg} src={logo} />
            </Box>
            <Box className={styles.headerText}>
              <Typography className={styles.headerTitle}>Milo</Typography>
              <Typography className={styles.headerSubtitle}>
                Here to help improve your experience
              </Typography>
            </Box>
          </Box>
          <IconButton
            aria-label="Close chat"
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            size="small"
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {messages.length === 0 ? (
          <Box className={styles.body}>
            <Box className={styles.emptyIcon}>
              <img alt="" className={styles.emptyIconImg} src={logo} />
            </Box>
            <Typography className={styles.emptyTitle} component="h2">
              Hey! I&apos;m Milo, your chat assistant.
            </Typography>
            <Typography className={styles.emptyText}>
              Need any help? You can message me anytime!
            </Typography>
          </Box>
        ) : (
          <Box className={styles.messageList} ref={messageListRef}>
            {messages.map((entry) => (
              <Box
                className={mergeClasses(
                  styles.messageRow,
                  entry.role === "user"
                    ? styles.messageRowUser
                    : styles.messageRowSystem,
                )}
                key={entry.id}
              >
                <Typography
                  className={mergeClasses(
                    styles.messageBubble,
                    entry.role === "user"
                      ? styles.messageBubbleUser
                      : styles.messageBubbleSystem,
                  )}
                  sx={{ whiteSpace: "pre-line" }}
                >
                  {entry.text}
                </Typography>
              </Box>
            ))}
            {isLoading && (
              <Box
                className={mergeClasses(
                  styles.messageRow,
                  styles.messageRowSystem,
                )}
              >
                <Box
                  aria-label="Milo is typing"
                  className={mergeClasses(
                    styles.messageBubble,
                    styles.messageBubbleSystem,
                    styles.typingBubble,
                  )}
                  role="status"
                >
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </Box>
              </Box>
            )}
          </Box>
        )}

        <Box className={styles.footer}>
          <TextField
            className={styles.inputField}
            disabled={isLoading}
            multiline
            maxRows={4}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Message Milo..."
            size="small"
            value={message}
            variant="outlined"
          />
          <IconButton
            aria-label="Send message"
            className={styles.sendButton}
            disabled={message.trim().length === 0 || isLoading}
            onClick={handleSend}
          >
            <SendRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default ChatWidget;

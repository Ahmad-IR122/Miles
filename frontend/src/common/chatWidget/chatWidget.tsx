import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import { mergeClasses } from "@griffel/react";
import { Box, IconButton, TextField, Typography } from "@mui/material";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import logo from "../../assets/logo.svg";
import { useChatWidgetStyles } from "./chatWidget.styles";

type ChatMessage = {
  id: string;
  role: "user" | "system";
  text: string;
};

const ERROR_MESSAGE = "Sorry, something went wrong. Please try again later.";

const ChatWidget = () => {
  const styles = useChatWidgetStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSend = () => {
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

    setTimeout(() => {
      const notice: ChatMessage = {
        id: `${Date.now()}-system`,
        role: "system",
        text: ERROR_MESSAGE,
      };
      setMessages((prev) => [...prev, notice]);
      setIsLoading(false);
    }, 900);
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

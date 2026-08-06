import type { Dispatch, SetStateAction } from "react";
import { Box, CircularProgress, IconButton, InputBase, Typography } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { useChatbotStyles } from "../styles/Chatbot.styles";

type MessageComposerProps = {
  disabled: boolean;
  input: string;
  isLoading: boolean;
  onInputChange: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
};

export function MessageComposer({
  disabled,
  input,
  isLoading,
  onInputChange,
  onSubmit,
}: MessageComposerProps) {
  const classes = useChatbotStyles();

  return (
    <Box className={classes.composerWrap}>
      <Box className={classes.composer}>
        <InputBase
          className={classes.input}
          disabled={isLoading}
          multiline
          maxRows={4}
          onChange={(event) => onInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Ask about your next trip..."
          value={input}
        />
        <IconButton
          className={classes.sendButton}
          aria-label="Send message"
          disabled={disabled}
          onClick={onSubmit}
        >
          {isLoading ? <CircularProgress color="inherit" size={20} /> : <SendRoundedIcon />}
        </IconButton>
      </Box>
      <Typography className={classes.disclaimer}>
        AI travel guidance can make mistakes. Check important details before booking.
      </Typography>
    </Box>
  );
}

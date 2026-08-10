import { Avatar, Box, IconButton, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

import { useChatbotStyles } from "../styles/chatbot.styles";

export const ChatHeader = () => {
  const classes = useChatbotStyles();

  return (
    <Box className={classes.header}>
      <Box className={classes.headerIdentity}>
        <Avatar className={classes.aiIcon}>
          <AutoAwesomeRoundedIcon />
        </Avatar>
        <Box>
          <Typography className={classes.title}>AI Travel Assistant</Typography>
          <Typography className={classes.subtitle}>
            Your personal travel companion
          </Typography>
        </Box>
      </Box>
      <Box className={classes.headerActions}>
        <IconButton className={classes.headerButton} aria-label="History">
          <HistoryRoundedIcon />
        </IconButton>
        <IconButton className={classes.headerButton} aria-label="More options">
          <MoreHorizRoundedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

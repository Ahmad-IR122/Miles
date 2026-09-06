import { mergeClasses } from "@griffel/react";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Snackbar from "@mui/material/Snackbar";

import { useToastStyles } from "./toast.styles";

type ToastProps = {
  open: boolean;
  message: string;
  variant?: "success" | "warning";
  autoHideDuration?: number;
  onClose: () => void;
};

// A themed drop-in for MUI's Snackbar - same positioning/auto-hide/dismiss
// behaviour, but styled like the rest of the app's floating surfaces
// (ConfirmDialog's card look) instead of MUI's plain dark default pill.
const Toast = ({
  open,
  message,
  variant = "warning",
  autoHideDuration = 5000,
  onClose,
}: ToastProps) => {
  const styles = useToastStyles();

  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      autoHideDuration={autoHideDuration}
      onClose={(_event, reason) => {
        if (reason !== "clickaway") onClose();
      }}
      open={open}
      slotProps={{
        content: {
          className: styles.content,
          role: "alert",
        },
      }}
      message={
        <span className={styles.messageRow}>
          <span
            className={mergeClasses(
              styles.iconWrap,
              variant === "success"
                ? styles.successIconWrap
                : styles.warningIconWrap,
            )}
          >
            {variant === "success" ? (
              <CheckCircleOutlineRoundedIcon className={styles.icon} />
            ) : (
              <WarningAmberRoundedIcon className={styles.icon} />
            )}
          </span>
          <span className={styles.message}>{message}</span>
        </span>
      }
    />
  );
};

export default Toast;

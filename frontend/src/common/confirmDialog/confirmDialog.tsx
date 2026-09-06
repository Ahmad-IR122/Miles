import { useId } from "react";
import { mergeClasses } from "@griffel/react";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Dialog from "@mui/material/Dialog";

import { useConfirmDialogStyles } from "./confirmDialog.styles";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  confirmingLabel?: string;
  cancelLabel?: string;
  variant?: "warning" | "success";
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  confirmingLabel = `${confirmLabel}…`,
  cancelLabel = "Cancel",
  variant = "warning",
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const styles = useConfirmDialogStyles();
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog
      open={open}
      onClose={isConfirming ? undefined : onCancel}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      slotProps={{
        paper: { className: styles.paper },
        backdrop: { className: styles.backdrop },
      }}
    >
      <div
        className={mergeClasses(
          styles.iconWrap,
          variant === "success" ? styles.successIconWrap : undefined,
        )}
      >
        {variant === "success" ? (
          <CheckCircleOutlineRoundedIcon className={styles.icon} />
        ) : (
          <WarningAmberRoundedIcon className={styles.icon} />
        )}
      </div>

      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>

      {description && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.confirmButton}
          disabled={isConfirming}
          onClick={onConfirm}
        >
          {isConfirming ? confirmingLabel : confirmLabel}
        </button>

        {variant !== "success" && (
          <button
            type="button"
            className={styles.cancelButton}
            disabled={isConfirming}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;

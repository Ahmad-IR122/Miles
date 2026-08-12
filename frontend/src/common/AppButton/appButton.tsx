import { mergeClasses } from "@griffel/react";
import Button, { type ButtonProps } from "@mui/material/Button";

import { useAppButtonStyles } from "./appButton.styles";

type AppButtonProps = ButtonProps & {
  appearance?: "primary" | "secondary";
};

const AppButton = ({
  appearance = "primary",
  className,
  size = "medium",
  variant,
  ...buttonProps
}: AppButtonProps) => {
  const styles = useAppButtonStyles();
  const appearanceClass =
    appearance === "primary" ? styles.primary : styles.secondary;
  const sizeClass = size === "small" ? styles.small : styles.medium;
  const defaultVariant = appearance === "primary" ? "contained" : "outlined";

  return (
    <Button
      {...buttonProps}
      size={size}
      variant={variant ?? defaultVariant}
      disableElevation
      className={mergeClasses(
        styles.base,
        appearanceClass,
        sizeClass,
        className,
      )}
    />
  );
};

export default AppButton;

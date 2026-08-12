import {
  colors,
  gradients,
  semanticColors,
} from "../../../common/theme/colors";
import { layout, typography } from "../../../common/theme/typography";

export const clerkAppearance = {
  variables: {
    colorPrimary: colors.coral,
    colorText: semanticColors.textPrimary,
    colorTextSecondary: semanticColors.textSecondary,
    colorBackground: colors.white,
    colorInputBackground: colors.white,
    colorInputText: semanticColors.textPrimary,
    borderRadius: layout.radius.md,
    fontFamily: typography.fontFamily.sans,
  },
  elements: {
    card: {
      boxShadow: semanticColors.shadowMedium,
      border: `1px solid ${semanticColors.borderLight}`,
    },
    formButtonPrimary: {
      background: gradients.primary,
      "&:hover": {
        opacity: 0.9,
      },
    },
    footerActionLink: {
      color: colors.rose,
    },
  },
};

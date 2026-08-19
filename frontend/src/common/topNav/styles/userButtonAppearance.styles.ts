import { semanticColors, warm, warmShadows } from "../../theme/colors";
import { layout, typography } from "../../theme/typography";

// Only `elements`, which Clerk injects as raw CSS — so tokens work here, and
// this merges over the themed `variables` from AppClerkProvider.
export const userButtonAppearance = {
  elements: {
    userButtonPopoverCard: {
      width: "min(288px, calc(100vw - 32px))",
      minWidth: "0",
      backgroundColor: warm.bgSurface,
      border: `${layout.borderWidth.hairline} solid ${warm.border}`,
      borderRadius: layout.radius.xl,
      boxShadow: warmShadows.md,
    },
    userButtonPopoverMain: {
      padding: layout.spacing[2],
    },
    userPreview: {
      columnGap: layout.spacing[2.5],
      padding: `${layout.spacing[2.5]} ${layout.spacing[3]}`,
    },
    userPreviewAvatarBox: {
      width: layout.controlSize.lg,
      height: layout.controlSize.lg,
    },
    userPreviewTextContainer: {
      rowGap: layout.spacing[1],
    },
    userPreviewMainIdentifier: {
      color: warm.textPrimary,
      fontSize: typography.fontSize.size4,
      lineHeight: typography.lineHeight.tight,
    },
    userPreviewSecondaryIdentifier: {
      color: warm.textSecondary,
      fontSize: typography.fontSize.size2,
      lineHeight: typography.lineHeight.tight,
    },
    userButtonPopoverActions: {
      rowGap: layout.spacing[1],
      padding: `${layout.spacing[1]} 0 0`,
    },
    userButtonPopoverActionButton: {
      minHeight: layout.controlSize.lg,
      padding: `${layout.spacing[2]} ${layout.spacing[3]}`,
      borderRadius: layout.radius.md,
      color: warm.textPrimary,
      fontSize: typography.fontSize.size3,
    },
    userButtonPopoverActionButtonIconBox: {
      width: layout.controlSize.xs,
      height: layout.controlSize.xs,
    },
    userButtonPopoverFooter: {
      padding: `${layout.spacing[2]} ${layout.spacing[3]}`,
      backgroundColor: warm.bgTint,
      borderTop: `${layout.borderWidth.hairline} solid ${warm.border}`,
    },
    userButtonPopoverActionButtonIcon__signOut: {
      color: semanticColors.textSecondary,
    },
    userButtonAvatarImage: {
      filter: "grayscale(100%)",
    },
  },
};

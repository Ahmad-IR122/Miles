import { makeStyles, shorthands } from "@griffel/react";
import { semanticColors, warm, warmShadows } from "../theme/colors";
import { layout, typography, typographyPresets } from "../theme/typography";

const PANEL_WIDTH = 400;

export const useChatWidgetStyles = makeStyles({
  bubble: {
    position: "fixed",
    bottom: layout.spacing[6],
    right: layout.spacing[6],
    width: layout.controlSize["3xl"],
    height: layout.controlSize["3xl"],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.borderRadius(layout.radius.pill),
    ...shorthands.border("none"),
    backgroundColor: warm.chat,
    color: semanticColors.textOnAccent,
    boxShadow: warmShadows.rose,
    cursor: "pointer",
    zIndex: 1200,
    transitionProperty: "transform, box-shadow, opacity",
    transitionDuration: layout.duration.normal,
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",

    "&:hover": {
      transform: "translateY(-2px) scale(1.04)",
      boxShadow: warmShadows.roseHover,
      backgroundColor: warm.chatHover,
    },

    "&:focus-visible": {
      outlineStyle: "solid",
      outlineWidth: "2px",
      outlineColor: warm.coralBright,
      outlineOffset: "3px",
    },

    "&.isHidden": {
      opacity: 0,
      transform: "scale(0.6)",
      pointerEvents: "none",
    },

    "@media (max-width: 640px)": {
      bottom: layout.spacing[4],
      right: layout.spacing[4],
      width: layout.controlSize["2xl"],
      height: layout.controlSize["2xl"],
    },
  },

  bubbleIcon: {
    fontSize: typography.fontSize.size9,
  },

  scrim: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(17, 24, 39, 0.28)",
    zIndex: 1150,
    opacity: 0,
    transitionProperty: "opacity",
    transitionDuration: layout.duration.normal,
    transitionTimingFunction: "ease-out",
    pointerEvents: "none",

    "&.isOpen": {
      opacity: 1,
      pointerEvents: "auto",
    },

    "@media (min-width: 641px)": {
      display: "none",
    },
  },

  panel: {
    position: "fixed",
    top: layout.spacing[6],
    right: layout.spacing[6],
    bottom: layout.spacing[6],
    width: `${PANEL_WIDTH}px`,
    maxWidth: "calc(100vw - 32px)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    ...shorthands.borderRadius(layout.radius["2xl"]),
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
    backgroundColor: warm.bgSurface,
    boxShadow: warmShadows.lg,
    overflow: "hidden",
    zIndex: 1200,
    transformOrigin: "bottom right",
    transitionProperty: "transform, opacity",
    transitionDuration: layout.duration.slow,
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    opacity: 0,
    transform: "translateY(16px) scale(0.94)",
    pointerEvents: "none",

    "&.isOpen": {
      opacity: 1,
      transform: "translateY(0) scale(1)",
      pointerEvents: "auto",
    },

    "@media (max-width: 640px)": {
      top: layout.spacing[3],
      right: layout.spacing[3],
      bottom: layout.spacing[3],
      left: layout.spacing[3],
      width: "auto",
      maxWidth: "none",
      maxHeight: "calc(100dvh - 24px)",
    },

    "@media (max-width: 430px)": {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: "100%",
      height: "100dvh",
      maxHeight: "100dvh",
      borderRadius: 0,
    },
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.gap(layout.gap.sm),
    padding: `${layout.spacing[4]} ${layout.spacing[5]}`,
    boxSizing: "border-box",
    backgroundColor: warm.chat,
    flexShrink: 0,

    "@media (max-width: 430px)": {
      padding: `${layout.spacing[3]} ${layout.spacing[4]}`,
    },
  },

  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap(layout.gap.sm),
    minWidth: 0,
  },

  headerAvatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: layout.controlSize.md,
    height: layout.controlSize.md,
    flexShrink: 0,
    ...shorthands.borderRadius(layout.radius.pill),
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    overflow: "hidden",
  },

  headerAvatarImg: {
    width: "70%",
    height: "70%",
    objectFit: "contain",
  },

  headerText: {
    minWidth: 0,
  },

  headerTitle: {
    ...typographyPresets.h3,
    fontSize: typography.fontSize.size6,
    color: semanticColors.textOnAccent,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  headerSubtitle: {
    fontSize: typography.fontSize.size3,
    color: "rgba(255, 255, 255, 0.85)",
  },

  closeButton: {
    color: semanticColors.textOnAccent,
    flexShrink: 0,
  },

  body: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.gap(layout.gap.sm),
    padding: layout.padding.xl,
    boxSizing: "border-box",
    textAlign: "center",
    overflowY: "auto",
    backgroundColor: warm.bgPage,
    minHeight: 0,

    "@media (max-width: 430px)": {
      padding: layout.padding.lg,
    },
  },

  messageList: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(layout.gap.sm),
    padding: layout.padding.md,
    boxSizing: "border-box",
    overflowY: "auto",
    backgroundColor: warm.bgPage,

    "@media (max-width: 430px)": {
      padding: layout.padding.sm,
    },
  },

  messageRow: {
    display: "flex",
    maxWidth: "80%",

    "@media (max-width: 430px)": {
      maxWidth: "88%",
    },
  },

  messageRowUser: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },

  messageRowSystem: {
    alignSelf: "flex-start",
  },

  messageBubble: {
    fontSize: typography.fontSize.size4,
    lineHeight: typography.lineHeight.normal,
    padding: `${layout.spacing[2.5]} ${layout.spacing[3.5]}`,
    wordBreak: "break-word",
  },

  messageBubbleUser: {
    backgroundColor: warm.chat,
    color: semanticColors.textOnAccent,
    ...shorthands.borderRadius(
      layout.radius.lg,
      layout.radius.lg,
      layout.radius.sm,
      layout.radius.lg,
    ),
  },

  messageBubbleSystem: {
    backgroundColor: warm.bgSurface,
    color: warm.textPrimary,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
    ...shorthands.borderRadius(
      layout.radius.lg,
      layout.radius.lg,
      layout.radius.lg,
      layout.radius.sm,
    ),
  },

  typingBubble: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap(layout.spacing[1]),
    padding: `${layout.spacing[3]} ${layout.spacing[3.5]}`,
  },

  typingDot: {
    width: "6px",
    height: "6px",
    ...shorthands.borderRadius(layout.radius.pill),
    backgroundColor: warm.textSecondary,
    opacity: 0.5,
    animationName: {
      "0%, 80%, 100%": { transform: "scale(0.7)", opacity: 0.4 },
      "40%": { transform: "scale(1)", opacity: 1 },
    },
    animationDuration: "1.2s",
    animationIterationCount: "infinite",
    animationTimingFunction: "ease-in-out",

    "&:nth-child(2)": {
      animationDelay: "0.15s",
    },

    "&:nth-child(3)": {
      animationDelay: "0.3s",
    },
  },

  emptyIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: layout.controlSize["3xl"],
    height: layout.controlSize["3xl"],
    ...shorthands.borderRadius(layout.radius.pill),
    backgroundColor: warm.bgTint,
    ...shorthands.border(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
    marginBottom: layout.gap.xs,
    overflow: "hidden",
  },

  emptyIconImg: {
    width: "64%",
    height: "64%",
    objectFit: "contain",
  },

  emptyTitle: {
    ...typographyPresets.h3,
    fontSize: typography.fontSize.size7,
    color: warm.textPrimary,
  },

  emptyText: {
    fontSize: typography.fontSize.size4,
    color: warm.textSecondary,
    maxWidth: "260px",
    lineHeight: typography.lineHeight.relaxed,
  },

  footer: {
    display: "flex",
    alignItems: "flex-end",
    ...shorthands.gap(layout.gap.xs),
    padding: layout.spacing[4],
    boxSizing: "border-box",
    ...shorthands.borderTop(
      layout.borderWidth.hairline,
      "solid",
      semanticColors.borderLight,
    ),
    backgroundColor: warm.bgSurface,
    flexShrink: 0,
    minWidth: 0,

    "@media (max-width: 430px)": {
      padding: `${layout.spacing[3]} ${layout.spacing[3]} calc(${layout.spacing[3]} + env(safe-area-inset-bottom))`,
    },
  },

  inputField: {
    flex: 1,
    minWidth: 0,

    "& .MuiOutlinedInput-root": {
      ...shorthands.borderRadius(layout.radius.lg),
      backgroundColor: warm.bgPage,
      fontSize: typography.fontSize.size4,
    },
  },

  sendButton: {
    width: layout.controlSize.xl,
    height: layout.controlSize.xl,
    flexShrink: 0,
    ...shorthands.borderRadius(layout.radius.pill),
    backgroundColor: warm.chat,
    color: semanticColors.textOnAccent,

    "&:hover": {
      backgroundColor: warm.chatHover,
    },

    "&.Mui-disabled": {
      backgroundImage: "none",
      backgroundColor: warm.bgDisabled,
      color: warm.textOnAccentDisabled,
    },
  },
});

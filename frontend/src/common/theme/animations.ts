export const fadeUp = {
  animationName: {
    from: { opacity: 0, transform: "translateY(14px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  animationDuration: ".8s",
  animationTimingFunction: "ease-out",
  animationFillMode: "both",
} as const;

export const pulse = {
  animationName: { "50%": { transform: "scale(1.18)" } },
  animationDuration: "1.8s",
  animationTimingFunction: "ease-in-out",
  animationIterationCount: "infinite",
} as const;

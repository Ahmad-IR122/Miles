import type { CSSProperties } from "react";
import { colors, warm } from "../../common/theme/colors";
import { useSplashScreenStyles } from "./splashScreen.styles";

const symbols = [
  "\u2708",
  "\u2316",
  "\u25C8",
  "\u2301",
  "\u25C9",
  "\u2726",
  "\u2302",
  "\u2727",
];
const palette = [
  colors.coral,
  colors.rose,
  warm.coralBright,
  warm.textTertiary,
  colors.peach,
  colors.brown,
];
const patternItemIds = [
  "pattern-item-01",
  "pattern-item-02",
  "pattern-item-03",
  "pattern-item-04",
  "pattern-item-05",
  "pattern-item-06",
  "pattern-item-07",
  "pattern-item-08",
  "pattern-item-09",
  "pattern-item-10",
  "pattern-item-11",
  "pattern-item-12",
  "pattern-item-13",
  "pattern-item-14",
  "pattern-item-15",
  "pattern-item-16",
  "pattern-item-17",
  "pattern-item-18",
] as const;

const TravelPattern = () => {
  const styles = useSplashScreenStyles();

  return (
    <div aria-hidden="true" className={styles.pattern}>
      {patternItemIds.map((id, index) => {
        const left = `${4 + ((index * 23) % 92)}%`;
        const top = `${10 + ((index * 31) % 78)}%`;
        const rotation = ((index * 29) % 60) - 30;
        const itemStyle = {
          left,
          top,
          color: palette[index % palette.length],
          opacity: 0.1 + (index % 4) * 0.015,
          fontSize: `${30 + (index % 4) * 8}px`,
          transform: `rotate(${rotation}deg)`,
        } as CSSProperties;

        return (
          <span key={id} className={styles.patternItem} style={itemStyle}>
            {symbols[index % symbols.length]}
          </span>
        );
      })}
    </div>
  );
};

export default TravelPattern;

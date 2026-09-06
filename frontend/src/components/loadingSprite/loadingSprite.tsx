import { useEffect, useState } from "react";
import loadingSpriteSheet from "../../assets/loadingIcons/loadingSprite.png";

// The 12 frames used to each be their own PNG, swapped via <img src> on a
// timer. That meant a fresh network fetch + decode the first time any given
// frame came up, which could stutter or flash blank on a slow connection -
// exactly what you don't want on a loading screen. They're now packed into
// one sprite sheet (4 columns x 3 rows, in this left-to-right/top-to-bottom
// order) so there's a single request and decode up front, and "changing
// frame" is just moving the visible window over the sheet.
const SHEET_COLUMNS = 4;
const SHEET_ROWS = 3;
const FRAME_COUNT = SHEET_COLUMNS * SHEET_ROWS;

const FRAME_INTERVAL_MS = 360;

type LoadingSpriteProps = {
  className?: string;
};

export const LoadingSprite = ({ className }: LoadingSpriteProps) => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % FRAME_COUNT);
    }, FRAME_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const column = frameIndex % SHEET_COLUMNS;
  const row = Math.floor(frameIndex / SHEET_COLUMNS);

  return (
    <div
      aria-hidden="true"
      className={className}
      role="img"
      style={{
        backgroundImage: `url(${loadingSpriteSheet})`,
        // Scaling the whole sheet to a multiple of the element's own size
        // (rather than a fixed pixel value) keeps each cell exactly as big
        // as this element no matter what size it's rendered at, so the
        // wrapping "generatingIcon" box can still control the display size.
        backgroundSize: `${SHEET_COLUMNS * 100}% ${SHEET_ROWS * 100}%`,
        backgroundPosition: `${(column / (SHEET_COLUMNS - 1)) * 100}% ${(row / (SHEET_ROWS - 1)) * 100}%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

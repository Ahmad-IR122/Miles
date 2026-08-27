import { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import { LoadingSprite } from "../loadingSprite/loadingSprite";
import {
  progressRing,
  progressRingCircumference,
  useLoadingScreenStyles,
} from "./loadingScreen.styles";

const PROGRESS_STEP = 5;
const PROGRESS_INTERVAL_MS = 180;
// Capped short of 100: this is a decorative, simulated progress indicator
// (we rarely know real completion percentage), so it settles near-done and
// stays there until the caller swaps this screen out for real content.
const PROGRESS_CAP = 92;

type LoadingScreenProps = {
  /** Announced by the progress ring's role="progressbar" for screen readers. */
  ariaLabel?: string;
  /** Optional 4-phase status line, swapped in as progress climbs. */
  statusMessages?: [string, string, string, string];
  subtitle?: string;
  title: string;
};

export const LoadingScreen = ({
  ariaLabel = "Loading progress",
  statusMessages,
  subtitle,
  title,
}: LoadingScreenProps) => {
  const styles = useLoadingScreenStyles();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) =>
        current >= PROGRESS_CAP ? PROGRESS_CAP : current + PROGRESS_STEP,
      );
    }, PROGRESS_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const statusText = statusMessages
    ? progress < 30
      ? statusMessages[0]
      : progress < 60
        ? statusMessages[1]
        : progress < 85
          ? statusMessages[2]
          : statusMessages[3]
    : undefined;

  return (
    <div className={styles.root}>
      <div
        aria-label={ariaLabel}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(progress)}
        className={styles.progressRing}
        role="progressbar"
      >
        <svg
          aria-hidden="true"
          className={styles.progressRingSvg}
          viewBox={`0 0 ${progressRing.size} ${progressRing.size}`}
        >
          <defs>
            {/* Top-to-bottom, so the sweep runs coral -> pink in the
                direction it travels. */}
            <linearGradient
              id="loadingProgressGradient"
              x1="0.5"
              x2="0.5"
              y1="0"
              y2="1"
            >
              <stop className={styles.progressRingGradientStart} offset="0%" />
              <stop className={styles.progressRingGradientEnd} offset="100%" />
            </linearGradient>
          </defs>
          <circle
            className={styles.progressRingTrack}
            cx={progressRing.size / 2}
            cy={progressRing.size / 2}
            r={progressRing.radius}
          />
          <circle
            className={styles.progressRingFill}
            cx={progressRing.size / 2}
            cy={progressRing.size / 2}
            r={progressRing.radius}
            strokeDasharray={progressRingCircumference}
            strokeDashoffset={progressRingCircumference * (1 - progress / 100)}
          />
        </svg>
        <div aria-hidden="true" className={styles.generatingIcon}>
          <LoadingSprite />
        </div>
        <FlightTakeoffIcon
          className={styles.progressPlane}
          style={{
            // Walk to the point on the ring, then face along the tangent.
            transform: `translate(-50%, -50%) rotate(${(progress / 100) * 360}deg) translateY(-${progressRing.planeRadius}px) rotate(35deg)`,
          }}
        />
      </div>
      <div className={styles.centered}>
        <Typography className={styles.generatingTitle} component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography className={styles.generatingText} component="p">
            {subtitle}
          </Typography>
        )}
      </div>
      {statusText && (
        <Typography
          aria-live="polite"
          className={styles.progressStatus}
          component="p"
        >
          {statusText}
        </Typography>
      )}
    </div>
  );
};

export default LoadingScreen;

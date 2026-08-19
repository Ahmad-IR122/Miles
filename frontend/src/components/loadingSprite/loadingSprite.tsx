import { useEffect, useState } from "react";
import batdown from "../../assets/loadingIcons/batdown.png";
import batup from "../../assets/loadingIcons/batup.png";
import cat from "../../assets/loadingIcons/cat.png";
import catend from "../../assets/loadingIcons/catend.png";
import light from "../../assets/loadingIcons/light.png";
import mario from "../../assets/loadingIcons/mario.png";
import note from "../../assets/loadingIcons/note.png";
import portal from "../../assets/loadingIcons/portal.png";
import song from "../../assets/loadingIcons/song.png";
import spiderman from "../../assets/loadingIcons/spiderman.png";
import star from "../../assets/loadingIcons/star.png";
import world from "../../assets/loadingIcons/world.png";

const frames = [
  mario,
  star,
  spiderman,
  portal,
  cat,
  world,
  light,
  batup,
  batdown,
  catend,
  song,
  note,
];

const FRAME_INTERVAL_MS = 360;

type LoadingSpriteProps = {
  className?: string;
};

export const LoadingSprite = ({ className }: LoadingSpriteProps) => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, FRAME_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <img
      alt=""
      aria-hidden="true"
      className={className}
      src={frames[frameIndex]}
    />
  );
};

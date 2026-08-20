import plane from "../../assets/travel-plane.svg";
import { useSplashScreenStyles } from "./splashScreen.styles";

const TravelLoadingBar = () => {
  const styles = useSplashScreenStyles();

  return (
    <div className={styles.loadingBarRoot}>
      <span className={styles.startDot} />
      <span className={styles.route} />
      <span className={styles.endDot} />
      <img aria-hidden="true" src={plane} className={styles.plane}></img>
    </div>
  );
};

export default TravelLoadingBar;

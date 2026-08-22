import logo from "../../assets/logo.svg";
import TravelLoadingBar from "./travelLoadingBar";
import TravelPattern from "./travelPattern";
import { useSplashScreenStyles } from "./splashScreen.styles";

const SplashScreen = () => {
  const styles = useSplashScreenStyles();

  return (
    <main className={styles.root}>
      <div aria-hidden="true" className={styles.overlay} />
      <TravelPattern />
      <div className={styles.content}>
        <div className={styles.logoWrapper}>
          <img src={logo} alt="TravelAI logo" className={styles.logo} />
        </div>
        <h1 className={styles.title}>TravelAI</h1>
        <p className={styles.slogan}>Plan Less. Explore More</p>
        <div className={styles.loadingBar}>
          <TravelLoadingBar />
        </div>
      </div>
    </main>
  );
};

export default SplashScreen;

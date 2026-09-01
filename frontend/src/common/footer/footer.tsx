import { Link } from "react-router-dom";

import logo from "../../assets/newLogo.png";
import { routesPaths } from "../../routes/routesPaths";
import { useFooterStyles } from "./footer.styles";

const Footer = () => {
  const styles = useFooterStyles();

  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.decorHotAirBalloon} aria-hidden="true" />
        <div className={styles.decorTraveler} aria-hidden="true" />
        <div className={styles.decorPlane} aria-hidden="true" />
        <div className={styles.decorCloud} aria-hidden="true" />
        <div className={styles.decorLandscape} aria-hidden="true" />
        <div className={styles.content}>
          <section className={styles.brandSection} aria-label="Miles">
            <Link className={styles.brand} to={routesPaths.home}>
              <span className={styles.logoFrame}>
                <img src={logo} alt="Miles logo" className={styles.logo} />
              </span>
              <span className={styles.brandName}>Miles</span>
            </Link>
            <p className={styles.description}>
              Your AI travel companion for discovering amazing places, planning
              perfect trips, and creating unforgettable memories.
            </p>
          </section>
        </div>

        <p className={styles.copyright}>
          &copy; 2026 Miles. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

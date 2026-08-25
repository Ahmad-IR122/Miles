import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { SignedIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

import logo from "../../assets/logo.svg";
import { routesPaths } from "../../routes/routesPaths";
import { planLinks, socialItems, tripLinks } from "./footer.constants";
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
            <div className={styles.socialLinks} aria-label="Social links">
              {socialItems.map((item) => (
                <button
                  aria-label={item.label}
                  className={styles.socialButton}
                  key={item.label}
                  type="button"
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </section>

          <SignedIn>
            <nav className={styles.navSection} aria-label="Plan navigation">
              <h2 className={styles.sectionTitle}>Plan</h2>
              <div className={styles.links}>
                {planLinks.map((item) => (
                  <Link className={styles.link} key={item.label} to={item.path}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            <nav className={styles.navSection} aria-label="Trips navigation">
              <h2 className={styles.sectionTitle}>Trips</h2>
              <div className={styles.links}>
                {tripLinks.map((item) => (
                  <Link className={styles.link} key={item.path} to={item.path}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </SignedIn>

          <section className={styles.newsletterSection}>
            <h2 className={styles.sectionTitle}>Stay in the loop</h2>
            <p className={styles.newsletterText}>
              Subscribe to get travel tips, exclusive deals, and inspiration.
            </p>
            <form className={styles.newsletterForm}>
              <input
                aria-label="Email address"
                className={styles.emailInput}
                placeholder="Enter your email"
                type="email"
              />
              <button
                aria-label="Subscribe"
                className={styles.submitButton}
                type="submit"
              >
                <SendRoundedIcon aria-hidden="true" />
              </button>
            </form>
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

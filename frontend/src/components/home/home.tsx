import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import AppButton from "../../common/AppButton/appButton";
import ThemeToggle from "../../common/theme/themeToggle";
import logo from "../../assets/logo.svg";
import homeImage from "../../assets/image.svg";
import { routesPaths } from "../../routes/routesPaths";
import { useHomeStyles } from "./home.styles";

const Home = () => {
  const navigate = useNavigate();
  const styles = useHomeStyles();

  const goToPlanner = () => navigate(routesPaths.planTrip);
  const goToSignUp = () => navigate(routesPaths.signUp);
  const goToSignIn = () => navigate(routesPaths.signIn);

  return (
    <div className={styles.page}>
      <SignedOut>
        <header className={styles.authHeader}>
          <div className={styles.brand}>
            <div className={styles.logoFrame}>
              <img
                src={logo}
                alt=""
                aria-hidden="true"
                className={styles.logo}
              />
            </div>

            <span className={styles.brandName}>Miles</span>
          </div>

          <div className={styles.signInArea}>
            <Typography component="span" className={styles.signInText}>
              Already have an account?
            </Typography>

            <AppButton appearance="secondary" size="small" onClick={goToSignIn}>
              Sign In
            </AppButton>

            <ThemeToggle />
          </div>
        </header>
      </SignedOut>

      <section className={styles.hero}>
        <div className={styles.intro}>
          <Typography component="p" className={styles.eyebrow}>
            YOUR TRIP, YOUR WAY
          </Typography>

          <Typography component="h1" className={styles.title}>
            Your next journey,
            <br />
            <span className={styles.gradientText}>beautifully planned.</span>
          </Typography>

          <Typography component="p" className={styles.description}>
            Miles creates personalized trips around where you want to go and the
            way you love to travel.
          </Typography>

          <SignedOut>
            <div className={styles.primaryAction}>
              <AppButton
                appearance="primary"
                onClick={goToSignUp}
                className={styles.mainButton}
              >
                Sign Up
              </AppButton>

              <Typography component="p" className={styles.actionHint}>
                Your journey starts here.
              </Typography>
            </div>
          </SignedOut>

          <SignedIn>
            <div className={styles.signedInAction}>
              <AppButton
                appearance="primary"
                onClick={goToPlanner}
                className={styles.mainButton}
              >
                Plan Your Trip
              </AppButton>
            </div>
          </SignedIn>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.largeGlow} />
          <div className={styles.smallGlow} />

          <div className={styles.backCard} />

          <div className={styles.photoCard}>
            <img src={homeImage} alt="" className={styles.photo} />
          </div>

          <div className={styles.postcard}>
            <span className={styles.postcardLabel}>YOUR NEXT JOURNEY</span>

            <span className={styles.postcardTitle}>
              Plan. Explore.
              <br />
              Remember.
            </span>

            <div className={styles.postcardLine} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

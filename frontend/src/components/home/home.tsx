import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import AppButton from "../../common/AppButton/appButton";
import TopNav from "../../common/topNav/topNav";
import home from "../../assets/image.svg";
import { routesPaths } from "../../routes/routesPaths";
import { useHomeStyles } from "./home.styles";

const Home = () => {
  const navigate = useNavigate();
  const styles = useHomeStyles();
  const goToPlanner = () => navigate(routesPaths.planTrip);
  const goToSignUp = () => navigate(routesPaths.signUp);
  const goToSignIn = () => navigate(routesPaths.signIn);

  return (
    <>
      <TopNav />
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.intro}>
            <Typography component="h1" className={styles.title}>
              Plan your perfect
              <br />
              <span className={styles.gradientText}>trip with AI</span>
            </Typography>
            <Typography component="p" className={styles.description}>
              Tell us where you&apos;re going and what you love, and get a
              personalized itinerary with flights, activities, must-see places,
              and hidden gems, all in one place.
            </Typography>
            <SignedIn>
              <AppButton
                appearance="primary"
                onClick={goToPlanner}
                className={styles.ctaButton}
              >
                Plan Your Trip
              </AppButton>
            </SignedIn>
            <SignedOut>
              <div className={styles.ctaGroup}>
                <AppButton appearance="primary" onClick={goToSignUp}>
                  Sign Up
                </AppButton>
                <AppButton appearance="secondary" onClick={goToSignIn}>
                  Sign In
                </AppButton>
              </div>
            </SignedOut>
          </div>
          <div className={styles.visual}>
            <div className={styles.peachBlob} />
            <div className={styles.roseBlob} />
            <div className={styles.photoCard}>
              <img
                src={home}
                alt="Wooden boat gliding across a calm mountain lake"
                className={styles.photo}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
export default Home;

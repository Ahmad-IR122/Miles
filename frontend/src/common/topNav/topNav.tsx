import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { mergeClasses } from "@griffel/react";
import Button from "@mui/material/Button";
import { useLocation, useNavigate } from "react-router-dom";

import logo from "../../assets/logo.svg";
import { routesPaths } from "../../routes/routesPaths";
import AppButton from "../AppButton/appButton";
import { useTopNavStyles } from "./topNav.styles";
import { userButtonAppearance } from "./styles/userButtonAppearance.styles";

type TopNavProps = {
  homeLink?: boolean;
};

const TopNav = ({ homeLink = false }: TopNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const styles = useTopNavStyles();
  const isHomePage = location.pathname === routesPaths.home;

  const navItems = [
    {
      label: "Home",
      path: routesPaths.home,
      icon: <HomeRoundedIcon aria-hidden="true" />,
    },
    {
      label: "Trips",
      path: routesPaths.itinerary,
      icon: <CalendarMonthOutlinedIcon aria-hidden="true" />,
    },
    {
      label: "Destinations",
      path: routesPaths.recommendation,
      icon: <PlaceOutlinedIcon aria-hidden="true" />,
    },
  ];

  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav}>
        <button
          className={styles.brand}
          onClick={() => navigate(routesPaths.home)}
          type="button"
          aria-label="TravelAI home"
        >
          <div className={styles.logoFrame}>
            <img src={logo} alt="TravelAI logo" className={styles.logo} />
          </div>
          <span className={styles.brandName}>TravelAI</span>
        </button>

        <SignedOut>
          {!isHomePage ? (
            <div className={styles.navLinks} aria-label="Primary navigation">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Button
                    key={item.path}
                    className={mergeClasses(
                      styles.navItem,
                      isActive && styles.navItemActive,
                    )}
                    onClick={() => navigate(item.path)}
                    type="button"
                    startIcon={item.icon}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Button>
                );
              })}
              <Button
                className={mergeClasses(
                  styles.navItem,
                  location.pathname === routesPaths.planTrip &&
                    styles.navItemActive,
                )}
                onClick={() => navigate(routesPaths.planTrip)}
                type="button"
                startIcon={<AutoAwesomeIcon aria-hidden="true" />}
                aria-current={
                  location.pathname === routesPaths.planTrip
                    ? "page"
                    : undefined
                }
              >
                Plan Trip
              </Button>
              <Button
                className={mergeClasses(
                  styles.navItem,
                  location.pathname === routesPaths.chatbot &&
                    styles.navItemActive,
                )}
                onClick={() => navigate(routesPaths.chatbot)}
                type="button"
                startIcon={<ChatBubbleOutlinedIcon aria-hidden="true" />}
                aria-current={
                  location.pathname === routesPaths.chatbot ? "page" : undefined
                }
              >
                AI Chat
              </Button>
            </div>
          ) : null}
        </SignedOut>
        <SignedIn>
          <div className={styles.navLinks} aria-label="Primary navigation">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  className={mergeClasses(
                    styles.navItem,
                    isActive && styles.navItemActive,
                  )}
                  onClick={() => navigate(item.path)}
                  type="button"
                  startIcon={item.icon}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Button>
              );
            })}
            {!isHomePage ? (
              <Button
                className={mergeClasses(
                  styles.navItem,
                  location.pathname === routesPaths.planTrip &&
                    styles.navItemActive,
                )}
                onClick={() => navigate(routesPaths.planTrip)}
                type="button"
                startIcon={<AutoAwesomeIcon aria-hidden="true" />}
                aria-current={
                  location.pathname === routesPaths.planTrip
                    ? "page"
                    : undefined
                }
              >
                Plan Trip
              </Button>
            ) : null}
            <Button
              className={mergeClasses(
                styles.navItem,
                location.pathname === routesPaths.chatbot &&
                  styles.navItemActive,
              )}
              onClick={() => navigate(routesPaths.chatbot)}
              type="button"
              startIcon={<ChatBubbleOutlinedIcon aria-hidden="true" />}
              aria-current={
                location.pathname === routesPaths.chatbot ? "page" : undefined
              }
            >
              AI Chat
            </Button>
          </div>
        </SignedIn>

        <div className={styles.actions}>
          {homeLink ? (
            <AppButton
              appearance="secondary"
              size="small"
              className={styles.homeButtonLayout}
              onClick={() => navigate(routesPaths.home)}
              type="button"
              aria-label="Back to home"
            >
              <ArrowBackIcon aria-hidden="true" />
            </AppButton>
          ) : null}
          <SignedIn>
            <div className={styles.userButtonWrapper}>
              <UserButton
                afterSignOutUrl={routesPaths.home}
                appearance={userButtonAppearance}
              />
            </div>
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default TopNav;

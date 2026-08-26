import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { mergeClasses } from "@griffel/react";
import Button from "@mui/material/Button";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import { routesPaths } from "../../routes/routesPaths";
import AppButton from "../AppButton/appButton";
import ThemeToggle from "../theme/themeToggle";
import { navItems } from "./navItems";
import { useTopNavStyles } from "./topNav.styles";
import AccountMenu from "./accountMenu/accountMenu";
type TopNavProps = {
  homeLink?: boolean;
};
const TopNav = ({ homeLink = false }: TopNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const styles = useTopNavStyles();
  const { isSignedIn } = useAuth();
  const { scrollDirection } = useScrollDirection();
  const isHomePage = location.pathname === routesPaths.home;
  const isAuthPage =
    location.pathname === routesPaths.signIn ||
    location.pathname === routesPaths.signUp;
  const showAuthHeader = isAuthPage && isSignedIn !== true;
  if (isHomePage && isSignedIn !== true) {
    return null;
  }
  const brand = (
    <div className={styles.brandSection}>
      <button
        className={styles.brand}
        onClick={() => navigate(routesPaths.home)}
        type="button"
        aria-label="Miles home"
      >
        <div className={styles.standaloneLogoFrame}>
          <img src={logo} alt="Miles logo" className={styles.logo} />
        </div>
        <span className={styles.standaloneBrandName}>Miles</span>
      </button>
    </div>
  );
  return (
    <div
      className={mergeClasses(
        styles.wrapper,
        showAuthHeader && styles.authWrapper,
        !showAuthHeader && scrollDirection === "down" && "scrolling-down",
      )}
    >
      <div className={styles.headerInner}>
        <SignedIn>{brand}</SignedIn>
        <nav
          className={mergeClasses(
            styles.nav,
            isSignedIn === true && styles.signedInNav,
            showAuthHeader && styles.authNav,
          )}
        >
          <SignedOut>{brand}</SignedOut>
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
              {!isHomePage && (
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
              )}
            </div>
          </SignedIn>
          <SignedOut>
            <div className={styles.signedOutSpacer} />
          </SignedOut>
          <div className={styles.actions}>
            <ThemeToggle />
            <SignedOut>
              {homeLink && (
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
              )}
            </SignedOut>
            <SignedIn>
              <div className={styles.divider} />
              <div className={styles.profileSection}>
                <AccountMenu />
              </div>
            </SignedIn>
          </div>
        </nav>
      </div>
    </div>
  );
};
export default TopNav;

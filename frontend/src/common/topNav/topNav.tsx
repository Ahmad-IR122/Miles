import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { mergeClasses } from "@griffel/react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/newLogo.png";
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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const isHomePage = location.pathname === routesPaths.home;
  const isAuthPage =
    location.pathname === routesPaths.signIn ||
    location.pathname === routesPaths.signUp;
  const showAuthHeader = isAuthPage && isSignedIn !== true;
  const mobileNavItems = [
    ...navItems,
    {
      label: "Plan Trip",
      path: routesPaths.planTrip,
      icon: <AutoAwesomeIcon aria-hidden="true" />,
    },
  ];
  const isMobileMenuOpen = Boolean(menuAnchor);
  const closeMobileMenu = () => setMenuAnchor(null);
  const navigateFromMenu = (path: string) => {
    closeMobileMenu();
    navigate(path);
  };
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
              {mobileNavItems.map((item) => {
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
            </div>
            <IconButton
              className={styles.menuButton}
              type="button"
              aria-label="Open navigation menu"
              aria-controls={isMobileMenuOpen ? "mobile-nav-menu" : undefined}
              aria-haspopup="menu"
              aria-expanded={isMobileMenuOpen ? "true" : undefined}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              <MenuRoundedIcon aria-hidden="true" />
            </IconButton>
            <Menu
              id="mobile-nav-menu"
              anchorEl={menuAnchor}
              open={isMobileMenuOpen}
              onClose={closeMobileMenu}
              classes={{ paper: styles.mobileMenuPaper }}
            >
              {mobileNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <MenuItem
                    key={item.path}
                    className={mergeClasses(
                      styles.mobileMenuItem,
                      isActive && styles.mobileMenuItemActive,
                    )}
                    onClick={() => navigateFromMenu(item.path)}
                    selected={isActive}
                  >
                    <ListItemIcon className={styles.mobileMenuIcon}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText>{item.label}</ListItemText>
                  </MenuItem>
                );
              })}
            </Menu>
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

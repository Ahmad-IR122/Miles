import { Outlet, useLocation } from "react-router-dom";

import { routesPaths } from "../../routes/routesPaths";
import ChatWidget from "../chatWidget/chatWidget";
import TopNav from "../topNav/topNav";
import { useAppLayoutStyles } from "./appLayout.styles";
import Footer from "../footer/footer";

const routesWithBackNav = new Set<string>([
  routesPaths.planTrip,
  routesPaths.recommendation,
  routesPaths.signIn,
  routesPaths.signUp,
]);

const routesWithNav = new Set<string>([
  routesPaths.home,
  routesPaths.itinerary,
  routesPaths.savedTrips,
  ...routesWithBackNav,
]);

// Pages clear the fixed nav with their own top padding (see each
// page's own .page style) so their wallpaper background stays unbroken
// from the very top of the page, instead of the offset wrapper below
// showing its plain background color as a seam above the page. No
// route currently needs the wrapper, but it stays available for a
// future page that would rather not manage its own offset.
const routesNeedingNavOffset = new Set<string>([]);

const isItineraryDetailPath = (pathname: string) =>
  pathname.startsWith(`${routesPaths.itinerary}/`);

const routesWithFooter = new Set<string>([
  routesPaths.home,
  routesPaths.itinerary,
  routesPaths.savedTrips,
  ...routesWithBackNav,
]);

const AppLayout = () => {
  const location = useLocation();
  const styles = useAppLayoutStyles();
  const isItineraryDetail = isItineraryDetailPath(location.pathname);
  const showNav = routesWithNav.has(location.pathname) || isItineraryDetail;
  const showFooter =
    routesWithFooter.has(location.pathname) || isItineraryDetail;
  const homeLink =
    routesWithBackNav.has(location.pathname) || isItineraryDetail;
  const needsNavOffset = routesNeedingNavOffset.has(location.pathname);

  return (
    <div className={styles.root}>
      {showNav ? <TopNav homeLink={homeLink} /> : null}
      <div className={needsNavOffset ? styles.navOffset : undefined}>
        <Outlet />
        {showFooter ? <Footer /> : null}
      </div>
      {showNav ? <ChatWidget /> : null}
    </div>
  );
};

export default AppLayout;

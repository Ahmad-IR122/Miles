import { Outlet, useLocation } from "react-router-dom";

import { routesPaths } from "../../routes/routesPaths";
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
  routesPaths.chatbot,
  routesPaths.savedTrips,
  ...routesWithBackNav,
]);

const routesNeedingNavOffset = new Set<string>([
  routesPaths.itinerary,
  routesPaths.chatbot,
  routesPaths.savedTrips,
]);

const isItineraryDetailPath = (pathname: string) =>
  pathname.startsWith(`${routesPaths.itinerary}/`);

const routesWithFooter = new Set<string>([
  routesPaths.home,
  routesPaths.itinerary,
  routesPaths.chatbot,
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
  const needsNavOffset =
    routesNeedingNavOffset.has(location.pathname) || isItineraryDetail;

  return (
    <div className={styles.root}>
      {showNav ? <TopNav homeLink={homeLink} /> : null}
      <div className={needsNavOffset ? styles.navOffset : undefined}>
        <Outlet />
        {showFooter ? <Footer /> : null}
      </div>
    </div>
  );
};

export default AppLayout;

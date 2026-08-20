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
  ...routesWithBackNav,
]);

const routesNeedingNavOffset = new Set<string>([
  routesPaths.itinerary,
  routesPaths.chatbot,
]);

const routesWithFooter = new Set<string>([
  routesPaths.home,
  routesPaths.itinerary,
  routesPaths.chatbot,
  ...routesWithBackNav,
]);

const AppLayout = () => {
  const location = useLocation();
  const styles = useAppLayoutStyles();
  const showNav = routesWithNav.has(location.pathname);
  const showFooter = routesWithFooter.has(location.pathname);
  const homeLink = routesWithBackNav.has(location.pathname);
  const needsNavOffset = routesNeedingNavOffset.has(location.pathname);

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

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.svg";
import { routesPaths } from "../../routes/routesPaths";
import AppButton from "../AppButton/AppButton";
import { useTopNavStyles } from "./TopNav.styles";

type TopNavProps = {
  homeLink?: boolean;
};

const TopNav = ({ homeLink = false }: TopNavProps) => {
  const navigate = useNavigate();
  const styles = useTopNavStyles();

  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav}>
        <div className={styles.brand}>
          <div className={styles.logoFrame}>
            <img src={logo} alt="TravelAI logo" className={styles.logo} />
          </div>
          <span className={styles.brandName}>TravelAI</span>
        </div>
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
      </nav>
    </div>
  );
};

export default TopNav;

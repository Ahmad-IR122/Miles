import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { useNavigate } from "react-router-dom";

import AppButton from "../AppButton/appButton";
import { routesPaths } from "../../routes/routesPaths";
import { useNotFoundStyles } from "./notFound.styles";

const NotFound = () => {
  const styles = useNotFoundStyles();
  const navigate = useNavigate();

  return (
    <main className={styles.root}>
      <div className={styles.content}>
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.sun} />
          <div className={`${styles.cloud} ${styles.cloudLeft}`} />
          <div className={`${styles.cloud} ${styles.cloudRight}`} />
          <div className={styles.planeTrail} />
          <div className={styles.paperPlane} />
          <div className={styles.ground} />
          <div className={styles.plant + " " + styles.plantLeft} />
          <div className={styles.plant + " " + styles.plantRight} />
          <div className={styles.post} />
          <div className={styles.sign}>
            <span>
              THIS WAY
              <br />
              {"DOESN'T EXIST"}
            </span>
            <span className={styles.marker} />
          </div>
          <span className={`${styles.rock} ${styles.rockOne}`} />
          <span className={`${styles.rock} ${styles.rockTwo}`} />
          <span className={`${styles.rock} ${styles.rockThree}`} />
        </div>

        <section className={styles.copy} aria-labelledby="not-found-title">
          <p className={styles.code}>404</p>
          <h1 id="not-found-title" className={styles.title}>
            {"Oops! You're off the map."}
          </h1>
          <p className={styles.message}>
            {
              "The page you're looking for doesn't exist or may have been moved."
            }
          </p>
          <div className={styles.actions}>
            <AppButton
              onClick={() => navigate(routesPaths.home)}
              startIcon={<HomeRoundedIcon />}
            >
              Go Home
            </AppButton>
          </div>
        </section>
      </div>
    </main>
  );
};

export default NotFound;

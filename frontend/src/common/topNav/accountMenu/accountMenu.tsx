import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useClerk, useUser } from "@clerk/clerk-react";
import { mergeClasses } from "@griffel/react";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { getTrips } from "../../../api/trip";
import { routesPaths } from "../../../routes/routesPaths";
import type { Trip } from "../../../types/trip";
import { useAccountMenuStyles } from "./accountMenu.styles";
import { buildTripDays, createTripDay } from "./tripDays/tripDays";
const AccountMenu = () => {
  const styles = useAccountMenuStyles();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const open = Boolean(anchorEl);
  useEffect(() => {
    if (!open) return;
    getTrips()
      .then(({ data }) => setTrips(data))
      .catch(() => {
        // Non-fatal: calendar just won't show marked days.
      });
  }, [open]);
  const tripDays = useMemo(() => buildTripDays(trips), [trips]);
  const TripDay = useMemo(() => createTripDay(tripDays), [tripDays]);
  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);
  const handleManageAccount = () => {
    handleClose();
    openUserProfile();
  };
  const handleSignOut = () => {
    handleClose();
    signOut({ redirectUrl: routesPaths.home });
  };
  if (!user) return null;
  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={handleOpen}
        aria-label="Account menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Avatar
          src={user.imageUrl}
          alt={user.fullName ?? "Account"}
          className={styles.avatar}
        />
      </button>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            className: styles.paper,
            sx: { marginLeft: "24px" },
          },
        }}
      >
        <div className={styles.preview}>
          <Avatar
            src={user.imageUrl}
            alt={user.fullName ?? "Account"}
            className={styles.previewAvatar}
          />
          <div className={styles.previewText}>
            <span className={styles.name}>{user.fullName ?? "Account"}</span>
            <span className={styles.email}>
              {user.primaryEmailAddress?.emailAddress ?? ""}
            </span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.calendarSection}>
          <span className={styles.calendarHeading}>Your trips</span>
          <div className={styles.calendarPanel}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={null}
                readOnly
                reduceAnimations
                className={styles.calendar}
                slots={{ day: TripDay }}
              />
            </LocalizationProvider>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.actions}>
          <Button
            className={styles.actionButton}
            onClick={handleManageAccount}
            startIcon={<PersonIcon fontSize="small" />}
          >
            Manage account
          </Button>
          <Button
            className={mergeClasses(styles.actionButton, styles.signOutButton)}
            onClick={handleSignOut}
            startIcon={<LogoutIcon fontSize="small" />}
          >
            Sign out
          </Button>
        </div>
      </Popover>
    </>
  );
};
export default AccountMenu;

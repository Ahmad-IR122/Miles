import { makeStyles, shorthands } from "@griffel/react";
import {
  semanticColors,
  warm,
  warmGradients,
  warmShadows,
} from "../../theme/colors";
import { layout, typography } from "../../theme/typography";

export const useAccountMenuStyles = makeStyles({
  trigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: layout.controlSize.xs,
    height: layout.controlSize.xs,
    padding: 0,
    backgroundColor: "transparent",
    cursor: "pointer",
    borderRadius: layout.radius.full,
    overflow: "hidden",
    ...shorthands.border("0"),
    ":focus-visible": {
      outlineColor: warm.coralBright,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "2px",
    },
  },
  avatar: {
    width: "100%",
    height: "100%",
    filter: "grayscale(100%)",
  },
  paper: {
    width: "min(300px, calc(100vw - 32px))",
    backgroundColor: warm.bgSurface,
    ...shorthands.border(layout.borderWidth.hairline, "solid", warm.border),
    borderRadius: layout.radius.xl,
    boxShadow: warmShadows.md,
    ...shorthands.padding(layout.spacing[2]),
  },
  preview: {
    display: "flex",
    alignItems: "center",
    columnGap: layout.spacing[2.5],
    padding: `${layout.spacing[2.5]} ${layout.spacing[3]}`,
    backgroundImage: warmGradients.primary,
    borderRadius: layout.radius.lg,
  },
  previewAvatar: {
    width: layout.controlSize.lg,
    height: layout.controlSize.lg,
    ...shorthands.border(
      layout.borderWidth.thick,
      "solid",
      semanticColors.bgPrimary,
    ),
  },
  previewText: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.spacing[1],
    minWidth: 0,
  },
  name: {
    color: semanticColors.bgPrimary,
    fontSize: typography.fontSize.size4,
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.fontWeight.semibold,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  email: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: typography.fontSize.size2,
    lineHeight: typography.lineHeight.tight,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  divider: {
    height: layout.borderWidth.hairline,
    backgroundColor: warm.border,
    margin: `${layout.spacing[1]} 0`,
  },
  calendarSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.spacing[1.5],
    padding: `${layout.spacing[1]} 0 0`,
  },
  calendarHeading: {
    // textSecondary rather than tertiary: at 10px the tertiary ramp drops to
    // roughly 3.4:1 on this surface, under the 4.5:1 small-text floor.
    color: warm.textSecondary,
    fontSize: typography.fontSize.size0,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: "uppercase",
    padding: `0 ${layout.spacing[2.5]}`,
  },
  // Seats the calendar on its own surface so it reads as a panel rather than
  // loose rows floating between the profile card and the menu actions.
  calendarPanel: {
    backgroundColor: warm.bgTint,
    borderRadius: layout.radius.lg,
    padding: `${layout.spacing[2]} 0`,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    rowGap: layout.spacing[1],
    padding: `${layout.spacing[1]} 0 0`,
  },
  actionButton: {
    "&.MuiButton-root": {
      justifyContent: "flex-start",
      minHeight: layout.controlSize.lg,
      padding: `${layout.spacing[2]} ${layout.spacing[3]}`,
      borderRadius: layout.radius.md,
      color: warm.textPrimary,
      fontSize: typography.fontSize.size3,
      fontWeight: typography.fontWeight.normal,
      textTransform: "none",
    },
    "&.MuiButton-root:hover": {
      backgroundColor: warm.bgTint,
    },
  },
  signOutButton: {
    "&.MuiButton-root": {
      color: warm.rose,
    },
  },
  /**
   * MUI's DateCalendar ships a fixed 320px x 336px box whose header is padded
   * `0 24px 0 12px` while the day grid underneath is centred — so the month
   * label never lines up with the columns, and the box is wider than this
   * popover. Rather than scaling the whole thing down (blurry, and it does not
   * fix the alignment), the grid is re-laid out on an exact column rhythm:
   *
   *   day 34px + 2px side margins = 38px column x 7 = 266px wide
   *   header 34px + weekday row 28px + 6 rows x 38px = 290px tall
   *
   * The header then gets zero padding, so label, arrows and columns share one
   * left/right edge. Height stays fixed so the popover does not jump between a
   * 5-week and a 6-week month, or when switching to the year view.
   */
  calendar: {
    "&.MuiDateCalendar-root": {
      width: "266px",
      height: "290px",
      maxHeight: "none",
      margin: "0 auto",
    },

    // Month label + arrows
    "& .MuiPickersCalendarHeader-root": {
      alignItems: "center",
      minHeight: "36px",
      maxHeight: "36px",
      margin: 0,
      padding: "0 2px",
    },
    // `marginRight: auto` here is MUI's — it is what pushes the arrows to the
    // right edge, so only the type is restyled.
    "& .MuiPickersCalendarHeader-labelContainer": {
      fontSize: typography.fontSize.size4,
      fontWeight: typography.fontWeight.semibold,
      color: warm.textPrimary,
    },
    "& .MuiPickersCalendarHeader-switchViewButton": {
      width: layout.spacing[6],
      height: layout.spacing[6],
      padding: 0,
      color: warm.textSecondary,
    },
    "& .MuiPickersCalendarHeader-switchViewButton:hover": {
      backgroundColor: warm.bgTint,
      color: warm.textPrimary,
    },
    "& .MuiPickersCalendarHeader-switchViewIcon": {
      fontSize: layout.iconSize.md,
    },
    /*
     * MUI's spacer element sits *between* the two arrows — it is the gap
     * itself, not padding, so shrinking it pulls the arrows together. Kept at
     * MUI's own 24px: the header has room to spare (label plus caret plus both
     * arrows comes to roughly 194px of the 262px available).
     */
    "& .MuiPickersArrowSwitcher-spacer": {
      width: layout.spacing[6],
    },
    "& .MuiPickersArrowSwitcher-button": {
      width: layout.spacing[7],
      height: layout.spacing[7],
      padding: 0,
      color: warm.textSecondary,
      borderRadius: layout.radius.full,
    },
    "& .MuiPickersArrowSwitcher-button:hover": {
      backgroundColor: warm.bgSurface,
      color: warm.textPrimary,
    },
    "& .MuiPickersArrowSwitcher-leftArrowIcon": {
      fontSize: layout.iconSize.md,
    },
    "& .MuiPickersArrowSwitcher-rightArrowIcon": {
      fontSize: layout.iconSize.md,
    },

    // S M T W T F S
    "& .MuiDayCalendar-header": {
      height: "26px",
      margin: 0,
    },
    "& .MuiDayCalendar-weekDayLabel": {
      width: "38px",
      height: "26px",
      margin: 0,
      fontSize: typography.fontSize.size0,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.wide,
      color: warm.textSecondary,
    },

    /*
     * Day grid. Each day fills its whole 38px column with no side margin, so
     * consecutive trip days butt up against each other and their backgrounds
     * read as one continuous band. The 4px breathing room that a margin would
     * normally give is moved to the row instead (`weekContainer`), which keeps
     * the band horizontal — a trip reads along a week, never down a column.
     */
    "& .MuiDayCalendar-slideTransition": {
      minHeight: "228px",
    },
    "& .MuiDayCalendar-weekContainer": {
      margin: "2px 0",
    },
    "& .MuiPickerDay-root": {
      width: "38px",
      height: "34px",
      margin: 0,
      borderRadius: layout.radius.pill,
      fontSize: typography.fontSize.size3,
      fontWeight: typography.fontWeight.medium,
      color: warm.textPrimary,
      backgroundColor: "transparent",
    },
    // Read-only calendar, so a day is never a hover target. This sits above the
    // trip rules on specificity but before them in order, so a hovered trip day
    // still keeps its band.
    "& .MuiPickerDay-root:hover": {
      backgroundColor: "transparent",
    },
    "& .MuiPickerDay-fillerCell": {
      width: "38px",
      height: "34px",
      margin: 0,
    },
    /*
     * The state rules below repeat a class or match an attribute to outrank
     * MUI's own `&.Mui...` rules, which land at the same two-class specificity
     * as a plain `& .MuiPickerDay-x` here and would otherwise win or lose on
     * insertion order between Griffel's and emotion's stylesheets.
     */
    "& .MuiPickerDay-root.MuiPickerDay-dayOutsideMonth": {
      color: warm.textTertiary,
    },
    /*
     * Today is a dot under the number rather than MUI's ring: the ring would
     * have to stretch to the full 38px column and read as a lozenge, and it
     * competes with the trip band. `currentColor` means the dot turns white by
     * itself when today also happens to be a trip endpoint.
     */
    "& .MuiPickerDay-root.MuiPickerDay-today": {
      // v9 rings today with `outline`, not `border` — and outline follows
      // border-radius, so on a 38x34 pill it draws a lozenge.
      outlineStyle: "none",
      color: warm.coral,
      fontWeight: typography.fontWeight.semibold,
      position: "relative",
    },
    "& .MuiPickerDay-root.MuiPickerDay-today::after": {
      content: "''",
      position: "absolute",
      bottom: "4px",
      left: "50%",
      width: "3px",
      height: "3px",
      marginLeft: "-1.5px",
      borderRadius: layout.radius.full,
      backgroundColor: "currentColor",
    },

    /*
     * Trip days. `data-trip-cap` says where a run of them should round off —
     * at a free neighbour, or at a week edge so a trip crossing a row break is
     * not left looking sliced. `data-trip-edge` marks the days a trip actually
     * starts or ends on, which get the solid gradient; the days in between
     * carry the softer band, so a run reads as "depart … return".
     */
    "& .MuiPickerDay-root[data-trip-cap]": {
      backgroundColor: warm.bgAccentBand,
      borderRadius: 0,
      color: warm.rose,
      fontWeight: typography.fontWeight.semibold,
    },
    "& .MuiPickerDay-root[data-trip-cap='left']": {
      borderRadius: `${layout.radius.pill} 0 0 ${layout.radius.pill}`,
    },
    "& .MuiPickerDay-root[data-trip-cap='right']": {
      borderRadius: `0 ${layout.radius.pill} ${layout.radius.pill} 0`,
    },
    "& .MuiPickerDay-root[data-trip-cap='both']": {
      borderRadius: layout.radius.pill,
    },
    "& .MuiPickerDay-root[data-trip-edge]": {
      backgroundImage: warmGradients.primary,
      color: semanticColors.textOnAccent,
    },
    /*
     * Days stay keyboard-focusable even though the calendar is read-only, and
     * `outlineStyle: none` on today would otherwise take its focus ring with
     * it. Doubled class so this outranks every rule above; inset offset so the
     * ring sits inside the column instead of over its neighbours.
     */
    "& .MuiPickerDay-root.MuiPickerDay-root:focus-visible": {
      outlineColor: warm.coralBright,
      outlineStyle: "solid",
      outlineWidth: layout.borderWidth.thick,
      outlineOffset: "-2px",
    },

    // Year view, reached from the month dropdown
    "& .MuiYearCalendar-root": {
      width: "100%",
      maxHeight: "252px",
      padding: 0,
    },
    "& .MuiYearCalendar-button": {
      width: "80px",
      height: layout.spacing[8],
      fontSize: typography.fontSize.size3,
      color: warm.textPrimary,
      borderRadius: layout.radius.sm,
    },
    "& .MuiYearCalendar-button:hover": {
      backgroundColor: warm.bgTint,
    },
    "& .MuiYearCalendar-button.Mui-selected": {
      backgroundImage: warmGradients.primary,
      color: semanticColors.textOnAccent,
    },
  },
});

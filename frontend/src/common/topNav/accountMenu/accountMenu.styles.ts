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
    // MUI's Popover renders into a portal near document.body, outside the
    // app's normal DOM tree — so it doesn't inherit a font-family from any
    // app-level wrapper. Every other page sets its own fontFamily at the
    // root for the same reason (there's no global body font); this is that
    // root for the account menu, and it cascades to the name/email, the
    // calendar heading and actions, and the MUI DateCalendar's own text,
    // none of which set a fontFamily of their own.
    fontFamily: typography.fontFamily.sans,
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
  // Framed as an outlined card (border, no fill) rather than a solid block —
  // otherwise a busy month's trip bands run edge-to-edge and the calendar
  // reads as one flat rectangle instead of a grid sitting on a panel.
  calendarPanel: {
    borderRadius: layout.radius.lg,
    ...shorthands.border(
      layout.borderWidth.thin,
      "solid",
      warm.borderCoralBright,
    ),
    padding: `${layout.spacing[2]} ${layout.spacing[2]}`,
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
   *
   * The header then gets zero padding, so label, arrows and columns share one
   * left/right edge. Month switches use the `reduceAnimations` prop (see
   * accountMenu.tsx) instead of MUI's default slide transition: that
   * transition positions each month's weeks with `position: absolute`,
   * which needs a fixed-height parent to reserve space for — always sized
   * for a 6-row month, leaving a slab of empty space below shorter ones. With
   * animations off, the weeks render in normal flow, so the box can hug
   * however many rows (5 or 6) the current month actually has — but only
   * once `height` is freed from MUI's own default (a flat 336px, the "336"
   * half of that fixed box mentioned above), which otherwise still forces
   * the fixed height regardless of content.
   */
  calendar: {
    "&.MuiDateCalendar-root": {
      width: "266px",
      height: "auto",
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
     * columns line up cleanly with the header above. The 4px breathing room
     * that a margin would normally give is moved to the row instead
     * (`weekContainer`) — trip-day marking below draws its own fixed-size
     * circle centred in the column, so it doesn't need column-level spacing.
     */
    // MUI hardcodes this element's minHeight to fit 6 rows (240px) regardless
    // of `reduceAnimations` — it is a fixed style on the slot itself, not
    // something the transition-vs-no-transition branch controls. Zeroed out
    // so a 5-row month isn't still held open to 6-row height.
    "& .MuiDayCalendar-slideTransition": {
      minHeight: "0",
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
     * Today gets a circle traced around just the number, not MUI's own
     * ring: that outline follows the day's own border-radius, and on a
     * 38x34 pill it draws an oval, not a circle. Sizing the ring as a fixed
     * 26px circle centred on the cell — independent of the cell's own
     * width/height — sidesteps that. `currentColor` means the ring turns
     * white by itself when today also happens to be a trip endpoint.
     */
    "& .MuiPickerDay-root.MuiPickerDay-today": {
      outlineStyle: "none",
      color: warm.coral,
      fontWeight: typography.fontWeight.semibold,
      position: "relative",
    },
    "& .MuiPickerDay-root.MuiPickerDay-today::after": {
      content: "''",
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "26px",
      height: "26px",
      transform: "translate(-50%, -50%)",
      borderRadius: layout.radius.full,
      ...shorthands.border(layout.borderWidth.thick, "solid", "currentColor"),
      pointerEvents: "none",
    },

    /*
     * Trip days each get their own circle — not a joined band across the
     * week — drawn as a fixed 30px `::before`, independent of the day
     * cell's own 38x34 box, so neighbouring trip days stay visually
     * separate instead of reading as one connected pill. `data-trip-edge`
     * marks the days a trip actually starts or ends on, which get the
     * solid gradient circle; the days in between get the softer tint.
     *
     * Colors are the app's shared accent tokens — the same ones used
     * everywhere else — not a dedicated palette for this one feature.
     */
    "& .MuiPickerDay-root[data-trip-cap]": {
      // `position: relative` + an explicit z-index (not `auto`) gives this
      // button its own stacking context, so the ::before's negative
      // z-index below is scoped to sitting behind *this* cell's own digit
      // — not behind unrelated content elsewhere on the page.
      position: "relative",
      zIndex: 0,
      backgroundColor: "transparent",
      color: warm.rose,
      fontWeight: typography.fontWeight.semibold,
    },
    "& .MuiPickerDay-root[data-trip-cap]::before": {
      content: "''",
      position: "absolute",
      top: "50%",
      left: "50%",
      width: "30px",
      height: "30px",
      transform: "translate(-50%, -50%)",
      borderRadius: layout.radius.full,
      backgroundColor: warm.bgAccentBand,
      zIndex: -1,
    },
    "& .MuiPickerDay-root[data-trip-edge]": {
      color: semanticColors.textOnAccent,
    },
    "& .MuiPickerDay-root[data-trip-edge]::before": {
      backgroundImage: warmGradients.primary,
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

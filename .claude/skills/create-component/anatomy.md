# Component Anatomy

A fully labeled, worked example of every part a component in this repo is made
of. Read this alongside `SKILL.md` — that file says *when* and *where* to build
something; this file shows exactly *what* the result looks like, piece by piece.

Worked example: a small, generic status badge, as if it were being scaffolded
into `common/statusBadge/` (reused on more than one page, so `common/` per
`SKILL.md` step 3).

## File 1: `statusBadge.styles.ts`

```ts
import { makeStyles } from "@griffel/react";
import { colors, semanticColors } from "../theme/colors";
import { typography, layout } from "../theme/typography";

// ── Hook name ────────────────────────────────────────────────
// Always `use<PascalName>Styles`. This is what the component calls to get
// its class names — never inline styles, never a plain CSS file.
export const useStatusBadgeStyles = makeStyles({
  // ── "root" = the base look every instance gets ──────────────
  root: {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.fontSize.size2,
    borderRadius: layout.radius.full,
    padding: `${layout.padding.xs} ${layout.padding.sm}`,
  },

  // ── One key per variant, layered on top of "root" ────────────
  // Every value here traces back to theme/colors.ts or
  // theme/typography.ts — no raw hex, no raw px.
  upcoming: { backgroundColor: semanticColors.bgInteractiveSubtle },
  ongoing: { backgroundColor: colors.coral },
  completed: { backgroundColor: semanticColors.bgDisabled },
});
```

## File 2: `statusBadge.tsx`

```tsx
// ── Imports ──────────────────────────────────────────────────
// 1. i18n hook — every component with user-facing text needs this.
// 2. mergeClasses — only needed once you're combining more than one class.
// 3. the styles hook from file 1, right next to it.
import { useTranslation } from "react-i18next";
import { mergeClasses } from "@griffel/react";

import { useStatusBadgeStyles } from "./statusBadge.styles";

// ── Props type ───────────────────────────────────────────────
// Keep this SHALLOW: the fewest, most generic fields that let every caller
// use it — not one field per caller's special case. If you find yourself
// adding a prop just to handle one screen's quirk, stop and re-check
// SKILL.md step 2 (does something like this exist already? should this be
// split differently instead?).
type StatusBadgeProps = {
  status: "upcoming" | "ongoing" | "completed";
};

// ── Component ────────────────────────────────────────────────
// PascalCase identifier, camelCase file name, default export.
const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = useStatusBadgeStyles();
  const { t } = useTranslation();

  return (
    <span className={mergeClasses(styles.root, styles[status])}>
      {t(`statusBadge.${status}`)}
    </span>
  );
};

export default StatusBadge;
```

## Why "shallow" matters here

A caller of `StatusBadge` only ever has to know one thing about it — the
`status` value. Everything else (which color, how much padding, which
translation key) is handled inside. That's a simple interface hiding real
work, rather than a sprawling interface that offloads work onto every caller.
See `SKILL.md` step 5, and this background reading on the general idea of
keeping interfaces simple while implementations do the real work:
https://medium.com/@mrtkrkrt/understanding-shallow-and-deep-modules-in-software-architecture-fa7515eec7bf

## Checklist mapped to this example

- [ ] Own folder (`statusBadge/`) with two files — or a single flat file if
      this belongs inside `features/<x>/components/` instead (`SKILL.md` step 3)
- [ ] Styles hook named `use<PascalName>Styles`, only token-based values
- [ ] Props type has the fewest fields that still cover every real caller
- [ ] Every user-facing string goes through `t()`, with the key added to
      `locales/en.ts`
- [ ] Default export, PascalCase identifier, camelCase file/folder name
- [ ] Checked first that no existing component already does this (`SKILL.md`
      step 2)

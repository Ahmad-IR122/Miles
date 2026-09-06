---
name: create-component
description: Scaffold a new frontend React component the repo's way — folder/file layout, a Griffel use<Name>Styles hook built from common/theme/ tokens, copy routed through i18next's t(), and correct placement under common/, components/, or features/<x>/components/. Use whenever asked to create, add, or scaffold a frontend component.
---

# Create Component

Scaffolds a new component under `frontend/src/`, matching the conventions already
used by `common/AppButton`, `common/footer`, `components/tripPlanningForm`, and the
files under `features/*/components/`.

## 1. Get the inputs

Before writing anything, know:

- **Component name**, in camelCase (e.g. `tripCard`, `emptyState`). The folder/file
  name is this camelCase name; the exported component itself is the PascalCase
  version of it (`tripCard` -> `TripCard`).
- **Purpose / props** — enough to write a typed props type and real JSX, not a stub.
- **Scope** — where it belongs (decide with the rule below if the person hasn't said).

If any of these is unclear or the guess is expensive to undo (e.g. which existing
feature it belongs to), ask rather than assume.

## 2. Decide placement

Pick exactly one:

| Scope | When | Where |
|---|---|---|
| `common/` | Reused across two or more routes/features, and generic — it doesn't know about any one feature's domain types (buttons, dialogs, nav, footer, layout chrome, loading UI). | `frontend/src/common/<componentName>/` |
| `components/` | Belongs to a single page/flow, but that page/flow has no `features/<x>/` domain folder (own hooks/types/services) of its own yet — e.g. the trip-planning form, splash/loading screens. | `frontend/src/components/<componentName>/` |
| `features/<x>/components/` | Belongs to an existing feature domain (`Itinerary`, `recommendations`, `savedTrips`, `auth`, ...) that already has its own `hooks/`, `types/`, and/or `services` — the component consumes that feature's data types. | `frontend/src/features/<x>/components/<componentName>.tsx` |

If the work genuinely starts a brand-new feature domain (not just one component),
say so and propose a `features/<newFeature>/{components,styles,hooks,types}`
layout instead of forcing it into `components/`.

**`common/` and `components/` are folder-per-component**, each with its own styles
file. **`features/<x>/components/` is flat** — components are individual `.tsx`
files with no own folder, and they share one styles module,
`features/<x>/styles/<x>.styles.ts`, exporting `use<X>Styles` (e.g.
`useItineraryStyles`, `useRecommendationsStyles`). Do not create a per-component
styles file inside a `features/` folder — extend the shared one instead (or
create it, named after the feature, if this is that feature's first component).

## 3. Write the styles

**`common/` or `components/` scope** — create
`<componentName>/<componentName>.styles.ts`:

```ts
import { makeStyles, shorthands } from "@griffel/react";
import { colors, semanticColors, gradients } from "<path>/theme/colors";
import { typography, layout } from "<path>/theme/typography";

export const use<PascalName>Styles = makeStyles({
  root: {
    fontFamily: typography.fontFamily.sans,
    color: semanticColors.textPrimary,
    // ...tokens only — no raw hex, no raw px where a `layout`/`typography` token exists
  },
});
```

`<path>` is the relative path to `common/theme` from the new file
(`../theme` from `common/<componentName>/`, `../../common/theme` from
`components/<componentName>/`). Only import the token groups actually used —
`colors`/`semanticColors`/`gradients` from `colors.ts`, `typography`/`layout` from
`typography.ts`. Use `shorthands` (e.g. `shorthands.border(...)`) instead of the
raw `border` property, matching `appButton.styles.ts`.

**`features/<x>/components/` scope** — add new class rules to the existing
`features/<x>/styles/<x>.styles.ts`'s `use<X>Styles` object instead of making a
new file/hook. Only scaffold a new `features/<x>/styles/<x>.styles.ts` (same
token-based shape as above) if the feature has no styles file yet.

## 4. Write the component

```tsx
import { useTranslation } from "react-i18next";
import { mergeClasses } from "@griffel/react"; // only if you need conditional classes

import { use<PascalName>Styles } from "./<componentName>.styles"; // or the feature's shared hook

type <PascalName>Props = {
  // real props for this component — no placeholder fields
};

const <PascalName> = ({ /* props */ }: <PascalName>Props) => {
  const styles = use<PascalName>Styles();
  const { t } = useTranslation();

  return (
    // real JSX using styles.* classNames and t("...") for every piece of
    // user-facing copy — no hardcoded English strings in the JSX
  );
};

export default <PascalName>;
```

Rules, from the existing components:

- Default export, PascalCase identifier, camelCase file name.
- Every user-facing string goes through `t("namespace.key")` — see step 5 for the
  key namespace. This includes labels, aria-labels, alt text, tooltips, and
  placeholders. Non-text values (route paths, test ids) are not translated.
  If wrapping an existing base component (like `AppButton` wraps MUI's
  `Button`), extend its prop type rather than re-declaring it, and forward the
  rest of the props through.
- Use `mergeClasses` when combining a base style class with a conditional
  variant class; don't concatenate class name strings by hand.

## 5. Add the copy to `locales/en.ts`

- **`common/` or `components/` scope**: add a new top-level key named after the
  component (camelCase), e.g. `tripCard: { ... }`, alongside `topNav`,
  `tripPlanningForm`, etc.
- **`features/<x>/components/` scope**: nest the new keys under that feature's
  existing top-level key (e.g. add to `itinerary: { ... }`) rather than creating
  a separate top-level key, so a feature's copy stays grouped in one place.

Use `{{placeholder}}` interpolation for dynamic values (see `itinerary.dayLabel:
"Day {{number}}"` for the pattern), not string concatenation in the component.

## 6. Verify before handing it back

- `npm --prefix frontend run lint` and `npm --prefix frontend exec tsc -b --noEmit`
  (or the closest equivalent) come back clean.
- No raw hex colors, raw px font sizes, or hardcoded English strings were
  introduced — everything traces back to `theme/colors.ts`, `theme/typography.ts`,
  or `locales/en.ts`.
- The new files sit in exactly one of the three scopes from step 2 — never a
  per-component styles file inside `features/`.

# Project A Frontend

## Project overview

This directory contains the frontend for **Project A**, an AI-powered travel assistant. The application lets users authenticate, enter travel preferences, generate and review itineraries, browse recommendations, and use a travel chatbot.

It is a React single-page application (SPA) that communicates with the separate FastAPI backend. Database access, AI integrations, and private credentials remain on the server.

## Tech stack used

The versions below are declared in `package.json`. Exact installed versions are locked in `package-lock.json`.

| Technology            | Version              | Purpose                                 |
| --------------------- | -------------------- | --------------------------------------- |
| React and React DOM   | `^19.2.7`            | UI framework                            |
| TypeScript            | `^6.0.3`             | Static type checking                    |
| Vite                  | `^8.1.1`             | Development server and production build |
| React Router          | `^7.11.0`            | Client-side routing                     |
| Clerk React           | `^5.61.9`            | Authentication and sessions             |
| Material UI           | `^9.2.0`             | UI components, icons, and date pickers  |
| Griffel               | `^1.7.7`             | CSS-in-JS styling                       |
| Axios                 | `^1.19.0`            | Backend API requests                    |
| i18next               | `^26.3.6`            | Internationalization                    |
| Day.js                | `^1.11.21`           | Date manipulation                       |
| ESLint and Prettier   | `^9.39.5` / `^3.9.6` | Linting and formatting                  |
| Husky and lint-staged | `^9.1.7` / `^17.2.0` | Pre-commit checks                       |

## Prerequisites

Install or obtain the following before starting:

- **Node.js 22.x** — this is the version used by the frontend CI pipeline.
- **npm** — included with Node.js. The project uses npm and `package-lock.json`.
- **Git** — for cloning and working with the repository.
- A **Clerk publishable key** — required for authentication.
- The Project A **backend API** — normally available at `http://127.0.0.1:8000/` during local development.

Verify Node.js and npm:

```bash
node --version
npm --version
```

## Getting started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Project-A/frontend
```

If the repository is already cloned, open a terminal in the `frontend/` directory.

### 2. Install dependencies

```bash
npm install
```

For a clean installation using the exact lockfile versions, use:

```bash
npm ci
```

`npm ci` is recommended for CI and troubleshooting. It removes the existing `node_modules` directory before installing.

### 3. Configure environment variables

Create a file named `.env` inside `frontend/`:

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_API_URL=http://127.0.0.1:8000/
```

| Variable                     | Required | Description                                                                |
| ---------------------------- | -------- | -------------------------------------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk frontend publishable key. The app stops at startup if it is missing. |
| `VITE_API_URL`               | No       | Backend base URL. It defaults to `http://127.0.0.1:8000/`.                 |

Vite exposes variables prefixed with `VITE_` to browser code. Never place Clerk secret keys, database passwords, Azure credentials, or other private values in this file. The repository ignores `.env` files.

Restart the development server after changing environment variables.

### 4. Start the backend

Run the FastAPI backend in a separate terminal by following `../backend/README.md`. Features that load or save trips, itineraries, and chat messages require the relevant backend endpoints.

### 5. Start the frontend development server

```bash
npm run dev
```

Vite prints the local address in the terminal, normally:

```text
http://localhost:5173/
```

Open that URL in a browser. Vite automatically refreshes the application when source files change.

### 6. Verify the setup

Confirm that:

1. The home page loads.
2. The sign-in page opens without a missing Clerk key error.
3. API requests in the browser Network panel use `VITE_API_URL`.

## Project structure

```text
frontend/
|-- public/
|   `-- staticwebapp.config.json   # Azure Static Web Apps SPA fallback
|-- src/
|   |-- api/                       # Axios client and backend API functions
|   |-- assets/                    # Images, SVG files, and loading artwork
|   |-- common/                    # Shared layout, navigation, controls, and theme
|   |-- components/                # Reusable application components
|   |-- constants/                 # Shared constants such as interests
|   |-- data/                      # Static destination data
|   |-- features/                  # Auth, chatbot, itinerary, and recommendations
|   |-- hooks/                     # Reusable React hooks
|   |-- locales/                   # Translation resources
|   |-- routes/                    # Route definitions and page wrappers
|   |-- types/                     # Shared TypeScript types
|   |-- i18n.ts                    # i18next initialization
|   |-- index.css                  # Global styles
|   `-- main.tsx                   # Application entry point and providers
|-- eslint.config.mjs              # ESLint configuration
|-- index.html                     # Vite HTML entry point
|-- package.json                   # Dependencies and npm scripts
|-- package-lock.json              # Locked dependency versions
|-- tsconfig*.json                 # TypeScript configuration
`-- vite.config.ts                 # Vite configuration
```

### Application routes

| Route        | Screen                       |
| ------------ | ---------------------------- |
| `/`          | Home page                    |
| `/plan-trip` | Protected trip-planning flow |
| `/discover`  | Recommendations page         |
| `/itinerary` | Protected itinerary page     |
| `/chatbot`   | Protected chatbot page       |
| `/sign-in`   | Clerk sign-in page           |
| `/sign-up`   | Clerk registration page      |

Unknown routes display the not-found page.

## Where to make changes

| Task                                                | Location                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------- |
| Add or edit reusable UI components                  | `src/components/`                                                 |
| Add a self-contained feature                        | `src/features/[featureName]/`                                     |
| Add custom styles                                   | Use Griffel beside the component, usually in a `*.styles.ts` file |
| Change shared colors, typography, or theme behavior | `src/common/theme/`                                               |
| Add or update backend API calls                     | `src/api/`                                                        |
| Add shared TypeScript types                         | `src/types/`                                                      |
| Add or update translations                          | `src/locales/`                                                    |

Shared application-wide UI such as navigation, layout, buttons, and theme utilities belongs in `src/common/`. Feature-specific components should stay inside their feature directory.

## Styling guide

The app uses [Material UI](https://mui.com/material-ui/getting-started/) for components such as buttons, typography, icons, form controls, and date pickers. Import the required component directly from `@mui/material` or the appropriate MUI package, then apply the project's Griffel classes through `className`.

Use Griffel's `makeStyles` for custom component styles:

```tsx
import { makeStyles } from "@griffel/react";

const useStyles = makeStyles({
  card: {
    padding: "16px",
    borderRadius: "12px",
  },
});

export const ExampleCard = () => {
  const styles = useStyles();
  return <div className={styles.card}>Content</div>;
};
```

Keep larger style definitions in a neighboring `componentName.styles.ts` file. Reuse tokens from `src/common/theme/colors.ts` and `src/common/theme/typography.ts` instead of adding isolated color or typography values. Global theme variables and animations live in `src/common/theme/theme.css`; MUI palette integration is in `src/common/theme/muiTheme.ts`.

## Adding features

1. Create the feature under `src/features/[featureName]/`, keeping its pages, components, hooks, styles, utilities, and feature-local types together.
2. Reuse API functions from `src/api/`. Add a new API module there when the backend operation does not exist yet.
3. Add a page route in `src/routes/` when the feature needs its own URL. Wrap authenticated pages with the existing `ProtectedRoute` component.
4. Put types shared across features or API modules in `src/types/`. Keep types used by only one feature inside that feature.
5. Add user-facing copy to `src/locales/` rather than hard-coding repeated text.

## Available commands

Run these commands from `frontend/`:

| Command                | Description                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `npm run dev`          | Starts the Vite development server.                                                   |
| `npm run build`        | Type-checks the application and builds it into `dist/`.                               |
| `npm run lint`         | Runs ESLint.                                                                          |
| `npm run format`       | Formats supported files with Prettier.                                                |
| `npm run format:check` | Checks formatting without modifying files.                                            |
| `npm run preview`      | Serves the production bundle locally for verification.                                |
| `npm run prepare`      | Configures the repository-level Husky hooks. npm normally runs it after installation. |

The pre-commit hook runs `lint-staged`, which formats staged files and applies supported ESLint fixes.

## Production build

Create an optimized production bundle:

```bash
npm run build
```

This runs `tsc -b` followed by `vite build`. Output is written to `frontend/dist/`. TypeScript errors stop the build.

Preview the completed build:

```bash
npm run preview
```

The preview command is for local verification, not production hosting. The Azure Static Web Apps pipeline publishes `dist/`, and `public/staticwebapp.config.json` rewrites client-side routes to `index.html`.

## Before you commit

- [ ] Run `npm run lint`.
- [ ] Run `npm run format:check`.
- [ ] Run `npm run build` to catch TypeScript and production-build errors.
- [ ] Manually test the screens and flows you changed; there is currently no automated frontend test script.
- [ ] Review the staged changes. The Husky pre-commit hook runs lint-staged and auto-formats supported staged files.

## Common setup issues

### Missing `VITE_CLERK_PUBLISHABLE_KEY`

Create `frontend/.env`, add a valid Clerk publishable key, and restart Vite. Make sure the file is in `frontend/`, not the repository root.

### API requests fail with `ERR_CONNECTION_REFUSED`

Confirm the backend is running and `VITE_API_URL` contains the correct address and port. The default is `http://127.0.0.1:8000/`.

### API requests return `401 Unauthorized`

Sign in through Clerk. Ensure the frontend publishable key and backend Clerk configuration belong to compatible Clerk environments. The Axios client attaches the current Clerk session token automatically.

### The browser reports a CORS error

CORS is configured by the backend. Add the frontend origin—normally `http://localhost:5173`—to the backend's allowed origins, then restart the backend.

### Dependencies install incorrectly

Use Node.js 22 and perform a clean lockfile installation:

```bash
npm ci
```

Avoid manually editing `package-lock.json` or mixing npm with Yarn or pnpm.

### The dev server works but the production build fails

The production build performs strict TypeScript checks, including checks for unused variables and parameters. Fix the first compiler error and run `npm run build` again.

### Refreshing a nested route returns 404 after deployment

The web host must redirect unknown paths to `index.html` because routing happens in the browser. Azure Static Web Apps uses `public/staticwebapp.config.json`; configure an equivalent SPA fallback when using another host.

### Protected pages redirect unexpectedly

Check the Clerk key, current sign-in state, and browser console. `/plan-trip`, `/itinerary`, and `/chatbot` intentionally require authentication.

### Chatbot requests return 404

The frontend sends chatbot requests through the main backend API client. Confirm that the running backend exposes the expected chat route or a gateway to the separate AI service.

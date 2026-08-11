# Project Structure

AI-powered travel assistant ("Project A"): a React frontend, a FastAPI backend
that handles trip requests/itineraries, and a separate FastAPI `aiServices`
app that wraps Azure OpenAI for chat-style prompts. Azure Pipelines build each
of the three sub-projects independently on PR.

```
.
├── .pipelines/           # Azure Pipelines PR build definitions
│   ├── aiServices/prBuild.yml
│   ├── backend/prBuild.yml
│   └── frontend/prBuild.yml
├── aiServices/           # FastAPI service wrapping Azure OpenAI
├── backend/              # FastAPI backend (trip/itinerary API)
├── frontend/             # React + TypeScript + Vite web app
├── .gitignore
└── README.md
```

## Root

| File | Purpose |
|---|---|
| `README.md` | Top-level project overview: what the app does and how the three sub-projects (`backend/`, `aiServices/`, `frontend/`) relate. |
| `.gitignore` | Ignores build output, `node_modules/`, Python venvs/caches, `.env` files, and editor directories across all sub-projects. |

## `.pipelines/` — CI definitions

| File | Purpose |
|---|---|
| `aiServices/prBuild.yml` | Azure Pipeline: on PRs touching `aiServices/**`, sets up Python 3.11, caches pip, installs `aiServices/requirements.txt`. |
| `backend/prBuild.yml` | Azure Pipeline: on PRs touching `backend/**`, sets up Python 3.11, caches pip, installs `backend/requirements.txt`. |
| `frontend/prBuild.yml` | Azure Pipeline: on PRs to `main` touching `frontend/**`, sets up Node 20, caches npm, runs `npm ci` and `npm run build`. |

## `backend/` — Trip planning API

FastAPI service that accepts trip requests and serves itinerary data. Scaffolding-stage; no persistence yet (in-memory only).

| File | Purpose |
|---|---|
| `app/main.py` | FastAPI app entrypoint; configures CORS for the local Vite dev server and registers the `health`, `itinerary`, and `trip` routers. |
| `app/core/config.py` | Pydantic `Settings` (project name, version, `ENV`) loaded from `.env`. |
| `app/routers/health.py` | `GET /health` — returns `{"status": "ok"}` for liveness checks. |
| `app/routers/itinerary.py` | `GET /itinerary` — returns stored itinerary data (currently an in-memory list, always empty; no database yet). |
| `app/routers/trip.py` | `POST /trips` — accepts a `TripRequest` and returns a `TripRequestResponse` via `trip_service`. |
| `app/schemas/trip.py` | Pydantic models `TripRequest`/`TripRequestResponse` with validation: non-blank origin/destination, `end_date >= start_date`, at least one interest or `other_interest` filled in, positive budget. |
| `app/services/trip_service.py` | Business logic for `POST /trips`: generates a UUID `request_id` and builds the response from the validated request (no persistence yet). |
| `README.md` | Setup/run instructions, project layout notes, and pre-commit setup for the backend. |
| `requirements.txt` | Pinned dependencies (FastAPI, Uvicorn, Pydantic Settings, etc.). |
| `.env.example` | Example environment file (`ENV=development`). |
| `.pre-commit-config.yaml` | Pre-commit hooks: `ruff-check --fix`, `ruff-format`, trailing-whitespace/EOF/YAML/large-file checks. |

## `aiServices/` — Azure OpenAI wrapper

Small FastAPI service exposing a `/chat` endpoint that forwards prompts to Azure OpenAI and returns the model's response.

| File | Purpose |
|---|---|
| `app/main.py` | FastAPI app; `GET /` health message and `POST /chat` (accepts `{"prompt": str}`, calls `ask()`, returns the model response). |
| `app/config/config.py` | Pydantic `Settings` requiring `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_API_VERSION` from `.env`. |
| `app/clients/azure_openai.py` | Builds the `AzureOpenAI` client — uses an API key if configured, otherwise falls back to `DefaultAzureCredential` bearer-token auth. |
| `app/services/chat.py` | `ask(prompt)` — sends the prompt to the configured Azure OpenAI deployment and returns the generated text. |
| `app/prompts/deleteit.txt` | Empty placeholder file (as the name suggests, likely meant to be removed). |
| `start_uvicorn.py` | Convenience script to run Uvicorn with the app directory set correctly from the repo root (note: currently looks for an `Ai-services` folder, which doesn't match the actual `aiServices` directory name). |
| `config.py` | Empty file at the package root (unused; real settings live in `app/config/config.py`). |
| `pyproject.toml` | Project metadata and dependency list (fastapi, uvicorn, openai, azure-identity, pydantic, etc.). |
| `requirements.txt` | Pinned dependency versions for CI/installation. |
| `README.md` | What the service does, its endpoints, required env vars, and how to run it. |
| `.pre-commit-config.yaml` | Same ruff + hygiene pre-commit hooks as the backend. |

## `frontend/` — React web app

React 19 + TypeScript + Vite single-page app with React Router and MUI, currently featuring a home page and an editable trip itinerary view.

| File | Purpose |
|---|---|
| `index.html` | Vite HTML entry point; mounts the app at `#root` and loads `src/main.tsx`. |
| `src/main.tsx` | React entrypoint — renders `<RouterProvider>` with the app router into the DOM. |
| `src/routes/router.tsx` | Defines the `createBrowserRouter` routes: `/` → `Home`, `/itinerary` → `Itinerary`. |
| `src/routes/routesPaths.ts` | Central map of route path strings (`home`, `itinerary`) used by the router and links. |
| `src/routes/home.tsx` | Minimal placeholder home page. |
| `src/routes/Itinerary.tsx` | Fetches `/itinerary` from the backend (falling back to mock trip data when empty), and lets the user edit, replace, or save each day's activities in local state (no backend persistence yet — save is a TODO). |
| `src/api/api.tsx` | Configured `axios` instance pointing at the backend (`http://127.0.0.1:8000/`). |
| `vite.config.ts` | Vite config; enables the `@vitejs/plugin-react` plugin. |
| `eslint.config.mjs` | Flat ESLint config combining recommended JS/React/React-Hooks/TypeScript rules plus project style rules (double quotes, 2-space indent, always semicolons, `eqeqeq`, etc). |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | TypeScript project references splitting app code vs. Vite/Node tooling config. |
| `package.json` | Scripts (`dev`, `build`, `lint`, `preview`), dependencies (React, MUI, axios, react-router-dom), and `lint-staged` config run via Husky pre-commit. |
| `package-lock.json` | Locked dependency versions for reproducible installs. |
| `.husky/pre-commit` | Git pre-commit hook that runs `npx lint-staged` (which runs ESLint `--fix` on staged JS/TS files). |
| `.husky/_/*` | Husky's internal shim scripts (auto-generated; not hand-edited). |
| `README.md` | Tech stack and getting-started instructions for the frontend. |

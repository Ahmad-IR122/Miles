# Project Structure

AI-powered travel assistant ("Project A"): a React frontend (home → trip-planning
form → chatbot → itinerary views), a FastAPI backend that owns persistence
(Supabase/Postgres via SQLAlchemy) for conversations and trip/itinerary data, and
a separate FastAPI `aiServices` app that wraps Azure OpenAI + Azure AI Search for
itinerary generation and RAG-based chat. Azure Pipelines build each of the three
sub-projects independently on PR, and a separate pipeline deploys `frontend/` to
Azure Static Web Apps on merges to `main`.

```
.
├── .pipelines/           # Azure Pipelines PR build + deploy definitions
│   ├── aiServices/prBuild.yml
│   ├── backend/prBuild.yml
│   ├── frontend/prBuild.yml
│   └── frontend/deploy.yml
├── aiServices/           # FastAPI service wrapping Azure OpenAI + Azure AI Search
├── backend/              # FastAPI backend (conversations, trip/itinerary API, DB)
├── frontend/             # React + TypeScript + Vite web app
├── .gitignore
└── README.md
```

## Root

| File | Purpose |
|---|---|
| `README.md` | Top-level project overview: what the app does and how the three sub-projects (`backend/`, `aiServices/`, `frontend/`) relate. |
| `.gitignore` | Ignores build output, `node_modules/`, Python venvs/caches (`.venv/`, `.ruff_cache/`), `.env` files, and editor directories across all sub-projects. |

## `.pipelines/` — CI/CD definitions

| File | Purpose |
|---|---|
| `aiServices/prBuild.yml` | Azure Pipeline: on PRs touching `aiServices/**`, sets up Python 3.11, caches pip, installs `aiServices/requirements.txt`, and verifies `app.main` imports with the Azure OpenAI + Azure Search env vars from the `AI services environment variable` variable group. |
| `backend/prBuild.yml` | Azure Pipeline: on PRs touching `backend/**`, sets up Python 3.11, caches pip, installs `backend/requirements.txt`, runs `ruff check .`, and verifies `app.main` imports with `DATABASE_URL` from the `BE-pipeline-env` variable group. |
| `frontend/prBuild.yml` | Azure Pipeline: on PRs to `main` touching `frontend/**`, sets up Node 20, caches npm, runs `npm ci`, `npm run lint`, and `npm run build`. |
| `frontend/deploy.yml` | Azure Pipeline: on push to `main`, deploys `frontend/` (built to `dist`) to Azure Static Web Apps using the `Azure-Static-Web-Apps-black-flower-074742303-variable-group` token. |

## `backend/` — Conversations + trip/itinerary API

FastAPI service backed by Postgres (Supabase) via SQLAlchemy. Owns persisted
conversation/message history; trip and itinerary endpoints are still
scaffolding (in-memory only, no persistence yet).

| File | Purpose |
|---|---|
| `app/main.py` | FastAPI app entrypoint; loads `.env`, configures CORS for the local Vite dev server, and registers the `conversation`, `health`, `itinerary`, `trip`, and `test_db` routers. |
| `app/core/config.py` | Pydantic `Settings` (project name, version, `ENV`, `DATABASE_URL`) loaded from `.env`. |
| `app/db/db.py` | SQLAlchemy `engine`/`SessionLocal` built from `DATABASE_URL`, the declarative `Base`, and a `get_db()` FastAPI dependency that yields/closes a session. |
| `app/models/conversation.py` | SQLAlchemy ORM models `Conversation` (UUID id, `created_at`, one-to-many `messages`) and `Message` (UUID id, `conversation_id` FK, `role`, `content`, `created_at`). |
| `app/routers/health.py` | `GET /health` — returns `{"status": "ok"}` for liveness checks. |
| `app/routers/conversation.py` | `/conversations` CRUD: create, list, get-by-id, delete a conversation, plus `POST /conversations/{id}/messages` to append a message; delegates to `conversation_service`. |
| `app/routers/itinerary.py` | `GET /itinerary` — returns stored itinerary data (currently an in-memory list, always empty; no database yet). |
| `app/routers/trip.py` | `POST /trips` — accepts a `TripRequest` and returns a `TripRequestResponse` via `trip_service`. |
| `app/routers/test_db.py` | `GET /test-db` — runs `SELECT 1` against the configured database to verify Supabase connectivity; returns 500 with the error detail on failure. |
| `app/schemas/conversation.py` | Pydantic models `MessageCreate`/`MessageResponse` and `ConversationCreate`/`ConversationResponse`/`ConversationUpdate` (response models built with `from_attributes` for ORM serialization). |
| `app/schemas/itinerary.py` | Pydantic models `Activity`/`DayPlan`/`Itinerary` (UUID-keyed, dated day plans) — defined but not yet wired into persistence; `routers/itinerary.py` still returns an empty in-memory list. |
| `app/schemas/trip.py` | Pydantic models `TripRequest`/`TripRequestResponse` with validation: non-blank origin/destination, `end_date >= start_date`, at least one interest or `other_interest` filled in, positive budget. |
| `app/services/conversation_service.py` | Business logic backing the conversation router: create/list/get/delete conversations and append messages, all via SQLAlchemy `Session` calls. |
| `app/services/trip_service.py` | Business logic for `POST /trips`: generates a UUID `request_id` and builds the response from the validated request (no persistence yet). |
| `README.md` | Setup/run instructions, project layout notes, and pre-commit setup for the backend. |
| `requirements.txt` | Pinned dependencies (FastAPI, Uvicorn, Pydantic Settings, SQLAlchemy, `psycopg`, etc.). |
| `.env` / `.env.example` | Local env file (gitignored) and example (`ENV=development`); `DATABASE_URL` (Supabase Postgres connection string) is required by `core/config.py` but not templated in `.env.example`. |
| `ruff.toml` | Ruff lint config: marks `fastapi.Depends`/`fastapi.params.Depends` as immutable calls for the `flake8-bugbear` rule set. |
| `.pre-commit-config.yaml` | Pre-commit hooks: `ruff-check --fix`, `ruff-format`, trailing-whitespace/EOF/YAML/large-file checks. |

## `aiServices/` — Azure OpenAI + RAG service

FastAPI service exposing itinerary-generation endpoints (Azure OpenAI, JSON-structured
output) and a RAG-style `/chat` endpoint (query rewriting + Azure AI Search retrieval,
retrieval step still a placeholder) backed by an in-memory chat history.

| File | Purpose |
|---|---|
| `app/main.py` | FastAPI app; registers the `rag` and `itinerary` routers (the older bare `/chat` + `services/chat.py` wiring described in this service's README is no longer mounted here). |
| `app/config/config.py` | Pydantic `Settings` requiring `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_API_VERSION`, `AZURE_SEARCH_ENDPOINT`, `AZURE_SEARCH_API_KEY`, `AZURE_SEARCH_INDEX_NAME` from `.env`. |
| `app/clients/azure_openai.py` | Builds the `AzureOpenAI` client — uses an API key if configured, otherwise falls back to `DefaultAzureCredential` bearer-token auth. |
| `app/clients/azure_search.py` | Builds an Azure AI Search `SearchClient` from the configured endpoint/index/key. |
| `app/models/rag.py` | Pydantic `ChatRequest`/`ChatResponse` for the `/chat` endpoint. |
| `app/models/travel.py` | Pydantic models for itinerary generation: `TravelPreferences`, `TravelDataItem`, `ItineraryActivity`/`ItineraryDay`/`Itinerary`, and request models `ItineraryRequest`/`RegenerateItineraryRequest`/`RegenerateDayRequest`. |
| `app/routers/rag.py` | `POST /chat/` — rewrites the user's message with `RAGService.rewrite_query`, retrieves data (retrieval step is a placeholder, always empty), then calls `RAGService.generate_response`. |
| `app/routers/itinerary.py` | `POST /itinerary/` generates a full itinerary; `POST /itinerary/regenerate` and `POST /itinerary/regenerate-day` regenerate the whole trip or a single day from a user request, returning 422 on malformed LLM output. |
| `app/services/itinerary.py` | Calls Azure OpenAI (`responses.create`) with prompts built by `app/prompts/itinerary_prompt.py`, strips Markdown code fences from the output, and validates it into `Itinerary`/`ItineraryDay` models, raising `ValueError` on schema mismatch. |
| `app/services/rag.py` | `RAGService` class: `rewrite_query` (turns the latest question + last 3 history turns into a standalone search query), `generate_response` (answers from retrieved data + query), and `add_to_history` (in-memory list, not yet persisted). |
| `app/services/chat.py` | Older single-shot `ask(prompt)` helper used by the previous bare `/chat` endpoint; no longer referenced by `main.py` (superseded by `RAGService`). |
| `app/prompts/itinerary_prompt.py` | Builds the prompts for `generate_itinerary`, `regenerate_itinerary`, and `regenerate_day` — detailed instructions on activity sequencing, categorization, cost estimation, and the required JSON response shape. |
| `app/prompts/rag_prompts.py` | `system_prompt` (answer strictly from retrieved context, refuse if insufficient) and `history_prompt` (rewrite the latest question into a standalone query using chat history). |
| `app/prompts/deleteit.txt` | Empty placeholder file (as the name suggests, likely meant to be removed). |
| `scripts/setup_search_index.py` | One-off script: creates/updates the Azure AI Search index (`id`, `name`, `description`, `type`, `location`, `tags`, `budget_level` fields) and uploads a sample document. |
| `start_uvicorn.py` | Convenience script to run Uvicorn with the app directory set correctly from the repo root (note: still looks for an `Ai-services` folder, which doesn't match the actual `aiServices` directory name). |
| `config.py` | Empty file at the package root (unused; real settings live in `app/config/config.py`). |
| `pyproject.toml` | Project metadata and dependency list (fastapi, uvicorn, `openai>=2.0.0`, `azure-identity`, `azure-search-documents`, pydantic, etc.). |
| `requirements.txt` | Pinned dependency versions for CI/installation, including `azure-search-documents` and `pytest`. |
| `README.md` | Describes the older bare `/chat` design (`services/chat.py`); out of date relative to the current `rag`/`itinerary` routers — see this table instead for current structure. |
| `.pre-commit-config.yaml` | Same ruff + hygiene pre-commit hooks as the backend. |

## `frontend/` — React web app

React 19 + TypeScript + Vite single-page app using React Router, MUI, Griffel
(`@griffel/react`) for styling, and i18next for copy. Flow: `Home` → `PlanTrip`
(multi-step trip form) → `ChatPage` (AI chat with itinerary previews) → `Itinerary`
(editable day-by-day view).

| File | Purpose |
|---|---|
| `index.html` | Vite HTML entry point; mounts the app at `#root` and loads `src/main.tsx`. |
| `src/main.tsx` | React entrypoint — renders `<RouterProvider>` with the app router into the DOM. |
| `src/i18n.ts` | Initializes `i18next`/`react-i18next` with the `en` resource bundle (`en` as both `lng` and `fallbackLng`). |
| `src/locales/en.ts` | English translation strings for the top nav, home hero, itinerary view, and the full multi-step trip planning form (steps, validation messages, summary labels). |
| `src/routes/router.tsx` | `createBrowserRouter` routes: `/` → `Home`, `/plan-trip` → `PlanTrip`, `/itinerary` → `Itinerary`, `/chatbot` → `ChatPage`. |
| `src/routes/routesPaths.ts` | Central map of route path strings (`home`, `planTrip`, `itinerary`, `chatbot`) used by the router and links. |
| `src/routes/home.tsx` | Thin route wrapper rendering `components/home/home.tsx`. |
| `src/routes/plan-trip.tsx` | Thin route wrapper rendering `components/tripPlanningForm/tripPlanningForm.tsx`. |
| `src/components/home/home.tsx` (+ `.styles.ts`) | Landing page: hero copy, "Plan Your Trip" CTA (navigates to `/plan-trip`), and a decorative photo/blob visual. |
| `src/components/tripPlanningForm/tripPlanningForm.tsx` (+ `.styles.ts`) | 3-step trip planning wizard (origin/destination/dates via `country-state-city` + `cities.json` and MUI `DatePicker`; travelers/budget; interests) with client-side validation, a simulated "Generating…" progress screen, and a `console.log` submit stub — not yet wired to the backend/aiServices API. |
| `src/features/Itinerary/pages/itinerary.tsx` | Itinerary page: loads trip data via `useItinerary`, renders header/day-selector/timeline/sidebar, and shows empty-state messaging when no trip or no days are returned. |
| `src/features/Itinerary/hooks/useItinerary.ts` | Fetches `GET /itinerary` from the backend, normalizes the response into `Trip[]`, and exposes local-only `updateActivity`/`deleteActivity` mutators (no backend persistence yet). |
| `src/features/Itinerary/types/itinerary.types.ts` | `Activity` (string or structured object), `Day`, and `Trip` types used across the itinerary feature. |
| `src/features/Itinerary/utils/dateUtils.ts` | `formatDayDate` / `formatDateRange` helpers for rendering trip day labels and date ranges. |
| `src/features/Itinerary/components/itineraryHeader.tsx` | Page header: destination title, "AI Generated" badge, date/day/traveler/budget summary line, Share/Save Trip buttons. |
| `src/features/Itinerary/components/daySelector.tsx` | Horizontal tab list for picking the active day of the trip. |
| `src/features/Itinerary/components/itinerarySectionHeader.tsx` | Per-day section header with "Add Activity" and "Regenerate Day" buttons. |
| `src/features/Itinerary/components/timeline.tsx` | Renders a day's activities as a vertical timeline with category-colored icon markers (`ActivityCard` per entry). |
| `src/features/Itinerary/components/activityCard.tsx` | Card for a single activity; normalizes string-or-object `Activity` data and supports inline edit/save/cancel and delete. |
| `src/features/Itinerary/components/tripSummarySidebar.tsx` | Sidebar with budget/duration/activity/traveler summary cards, a budget-used progress bar, and "Ask AI to Modify Trip"/"Export PDF" buttons. |
| `src/features/Itinerary/components/emptyItineraryMessage.tsx` | Empty-state panel shown when there's no trip or no days to display. |
| `src/features/chatbot/pages/chatPage.tsx` | Chat page: holds message state, posts each prompt to `POST /chat`, and renders the response (with optional itinerary preview) via `MessageList`/`MessageComposer`. |
| `src/features/chatbot/components/chatHeader.tsx` | Chat panel header — assistant identity, history and "more options" icon buttons. |
| `src/features/chatbot/components/messageList.tsx` | Scrollable message list; shows an empty-state prompt, chat bubbles, a loading bubble, and error `Alert`. |
| `src/features/chatbot/components/chatMessageBubble.tsx` | Renders a single message bubble (user vs. assistant styling), timestamp, status, and an optional `ItineraryPreviewCard`. |
| `src/features/chatbot/components/itineraryPreviewCard.tsx` | Card summarizing an itinerary suggestion returned inline in chat (title, destination/cities/interests pills, optional image and "View itinerary" link). |
| `src/features/chatbot/components/messageComposer.tsx` | Multiline input + send button (Enter to send, Shift+Enter for newline) plus an AI-accuracy disclaimer. |
| `src/features/chatbot/types/chatbot.types.ts` | `ChatRole`, `ChatMessage`, `ItineraryPreview`, and `ChatResponse` (tolerant of several possible response shapes) types. |
| `src/features/chatbot/utils/chatResponse.ts` | `getResponseText`/`getItineraryPreview` helpers that pull the reply text and an optional itinerary preview out of a loosely-typed `ChatResponse`. |
| `src/features/chatbot/styles/chatbot.styles.ts` | Griffel style hook for the chat page (header, message bubbles, composer, preview card). |
| `src/common/AppButton/AppButton.tsx` (+ `.styles.ts`) | Shared button wrapping MUI `Button` with `primary`/`secondary` appearance variants and app-specific styling. |
| `src/common/TopNav/TopNav.tsx` (+ `.styles.ts`) | Shared top nav bar with the TravelAI logo/brand and an optional "back to home" button (`homeLink` prop). |
| `src/common/theme/colors.ts` | Design-token palette (coral/rose brand colors, gray scale, gradients) and `semanticColors` (text/background/border/shadow tokens) used across Griffel style hooks. |
| `src/common/theme/typography.ts` | Shared typography tokens/styles used by Griffel style hooks. |
| `src/data/cities.json` | Static city-by-country dataset used to populate the trip form's city autocomplete once a country is chosen. |
| `src/assets/logo.svg`, `src/assets/image.svg` | Brand logo and home-page hero image. |
| `src/api/api.tsx` | Configured `axios` instance pointing at the backend (`http://127.0.0.1:8000/`) — used for both backend calls (`/itinerary`) and the chat endpoint (`/chat`, currently backend-routed even though `/chat` is implemented in `aiServices`, not `backend`). |
| `src/index.css` | Global stylesheet. |
| `vite.config.ts` | Vite config; enables the `@vitejs/plugin-react` plugin. |
| `eslint.config.mjs` | Flat ESLint config combining recommended JS/React/React-Hooks/TypeScript rules plus project style rules (double quotes, 2-space indent, always semicolons, `eqeqeq`, etc). |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | TypeScript project references splitting app code vs. Vite/Node tooling config. |
| `package.json` | Scripts (`dev`, `build`, `lint`, `format`, `format:check`, `preview`), dependencies (React, MUI, MUI X Date Pickers, Griffel, axios, i18next, `country-state-city`, `dayjs`, react-router-dom), and `lint-staged` config run via Husky pre-commit. |
| `package-lock.json` | Locked dependency versions for reproducible installs. |
| `.prettierignore` | Paths excluded from Prettier formatting. |
| `.gitattributes` | Git line-ending/diff attributes for the frontend package. |
| `.husky/pre-commit` | Git pre-commit hook that runs `npx lint-staged` (which runs Prettier + ESLint `--fix` on staged files). |
| `.husky/_/*` | Husky's internal shim scripts (auto-generated; not hand-edited). |
| `README.md` | Tech stack and getting-started instructions for the frontend. |

## Known gaps / inconsistencies worth knowing about

- The frontend chat page (`src/features/chatbot/pages/chatPage.tsx`) calls `POST /chat` on the **backend** API instance (`src/api/api.tsx`, base URL `127.0.0.1:8000`), but the backend does not register a `/chat` router — the RAG chat endpoint (`POST /chat/`) lives in `aiServices` (a separate service/port). This needs either a backend proxy route or the frontend pointed at `aiServices` directly.
- `backend/app/schemas/itinerary.py` defines richer `Itinerary`/`DayPlan`/`Activity` models than what `backend/app/routers/itinerary.py` actually serves (an always-empty in-memory list) — persistence for itineraries isn't implemented yet.
- `aiServices/app/services/chat.py` (the original single-shot `ask()` chat helper) and its README are stale; `app/main.py` now wires up `rag.py`/`itinerary.py` instead.
- `frontend/src/components/tripPlanningForm/tripPlanningForm.tsx` doesn't call any API on submit — it simulates progress and `console.log`s the trip request.

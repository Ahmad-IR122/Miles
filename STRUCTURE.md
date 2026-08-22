# Project Structure

AI-powered travel assistant ("Project A"): a React frontend (sign in → plan a
trip → chat with AI → view/edit itinerary → browse recommendations), a FastAPI
backend that owns persistence (Supabase/Postgres via SQLAlchemy) for users,
trips, itineraries, and conversations, and a separate FastAPI `aiServices` app
that wraps Azure OpenAI + Azure AI Search for itinerary generation and
RAG-based chat. Auth is handled by Clerk on the frontend, verified by the
backend, and kept in sync via a Clerk webhook. Azure Pipelines build each of
the three sub-projects independently on PR, and separate pipelines deploy
`frontend/` and `backend/` on merges to `main`.

```
.
├── .pipelines/           # Azure Pipelines PR build + deploy definitions
├── aiServices/           # FastAPI service wrapping Azure OpenAI + Azure AI Search
├── backend/              # FastAPI backend (users, trips, itineraries, DB)
├── frontend/             # React + TypeScript + Vite web app
├── .gitignore
└── README.md
```

## `.pipelines/` — CI/CD definitions

| Path | Purpose |
|---|---|
| `aiServices/prBuild.yml` | On PRs touching `aiServices/**`: installs deps, verifies `app.main` imports with Azure OpenAI/Search env vars. |
| `backend/prBuild.yml` | On PRs touching `backend/**`: installs deps, runs `ruff check .`, verifies `app.main` imports with `DATABASE_URL`. |
| `backend/deploy.yml` | On push to `main`: deploys the backend, polling `scripts/wait-for-health.sh` against `/health` until it's live. |
| `frontend/prBuild.yml` | On PRs touching `frontend/**`: `npm ci`, lint, build. |
| `frontend/deploy.yml` | On push to `main`: builds and deploys `frontend/` to Azure Static Web Apps. |

## `backend/` — Users, trips, itineraries, and conversations

FastAPI service backed by Postgres (Supabase) via SQLAlchemy. Data model:

- **User** — synced from Clerk (via `auth_provider_id`); has many **Trips** and **Conversations**.
- **Trip** — has one **TripPreference**, many-to-many **Interests** (through `TripInterest`), and one or more versioned **Itineraries**.
- **Itinerary** — has many **ItineraryDays**, each with many **Activities** (time, cost, category, order).

| Path | Purpose |
|---|---|
| `app/main.py` | Entry point; loads `.env`, configures CORS, registers all routers. |
| `app/core/config.py` | `Settings` (env, `DATABASE_URL`, etc.) loaded from `.env`. |
| `app/core/security.py` | Verifies Clerk session JWTs against Clerk's JWKS; provides `get_current_user` for protected routes. |
| `app/db/db.py` | SQLAlchemy engine/session setup and the `get_db()` dependency. |
| `app/models/` | ORM models: `user`, `trip`, `trip_preference`, `interest`, `trip_interest`, `itinerary`, `itinerary_day`, `activity`, `conversation`. |
| `app/routers/` | REST endpoints, one file per resource: `users` (`/users/me`), `trip`, `trip_preference`, `interest`, `trip_interest`, `itinerary`, `activity`, `conversation`, `health`, `test_db`, plus `clerk_webhook` (handles Clerk `user.created/updated/deleted` events via `svix` to keep the local `users` table in sync). |
| `app/schemas/` | Pydantic request/response models, mirroring the routers above. |
| `app/services/` | Business logic per resource, plus `ai_client.py` (calls the `aiServices` app to generate/regenerate itineraries) and `store.py` (older in-memory scaffolding — see gaps below). |
| `requirements.txt`, `ruff.toml`, `.pre-commit-config.yaml` | Dependencies and lint/format tooling. |

## `aiServices/` — Azure OpenAI + RAG service

FastAPI service exposing itinerary-generation endpoints (Azure OpenAI,
JSON-structured output) and a RAG-style `/chat` endpoint (query rewriting +
Azure AI Search retrieval — retrieval step is still a placeholder), backed by
in-memory chat history.

| Path | Purpose |
|---|---|
| `app/main.py` | Registers the `rag` and `itinerary` routers. |
| `app/config/config.py` | `Settings` for Azure OpenAI + Azure AI Search, loaded from `.env`. |
| `app/clients/` | Azure OpenAI and Azure AI Search client builders. |
| `app/models/` | Pydantic models for chat (`rag.py`) and itinerary generation (`travel.py`). |
| `app/routers/` | `rag.py` (`POST /chat/`), `itinerary.py` (`POST /itinerary/`, `/regenerate`, `/regenerate-day`). |
| `app/services/` | `itinerary.py` (calls Azure OpenAI, validates output into `Itinerary` models), `rag.py` (query rewriting + response generation), `chat.py` (older, unused — see gaps below). |
| `app/prompts/` | Prompt templates for itinerary generation and RAG chat. |
| `scripts/setup_search_index.py` | One-off script to create/seed the Azure AI Search index. |

## `frontend/` — React web app

React 19 + TypeScript + Vite SPA using React Router, MUI, Griffel for
styling, i18next for copy, and Clerk for auth. Flow: `Home` → sign in/up
(Clerk) → `PlanTrip` → `ChatPage` → `Itinerary`, plus a public
`Recommendations` browser.

| Path | Purpose |
|---|---|
| `src/main.tsx`, `src/routes/router.tsx` | App entry and route table: `/` (public), `/sign-in`/`/sign-up` (Clerk, public), `/recommendation` (public), `/plan-trip`, `/itinerary`, `/chatbot` (protected), `*` → 404. |
| `src/common/appLayout/` | Root layout — `<Outlet>` plus conditional `TopNav`/`Footer` per route. |
| `src/common/topNav/` | Top nav bar; `accountMenu/` is the custom account dropdown (replacing Clerk's default UserButton) — shows profile info, a read-only calendar marking the user's trip dates, a dark/light toggle, and sign-out. |
| `src/common/theme/` | Dark/light mode system: mode is stored and applied to `<html>` before paint (`themeModeProvider.tsx`), then fed into MUI (`appThemeProvider.tsx`) and CSS variables (`theme.css`). |
| `src/common/footer/`, `src/common/notFound/`, `src/common/AppButton/` | Shared footer, 404 page, and app-styled button. |
| `src/features/auth/` | Clerk integration — `appClerkProvider.tsx` (wraps `<ClerkProvider>`, themed to match dark/light mode), `protectedRoute.tsx` (gates routes on sign-in), `signIn.tsx`/`signUp.tsx` pages. |
| `src/components/tripPlanningForm/` | Multi-step trip planning wizard (destination/dates, travelers/budget, interests). |
| `src/components/loadingSprite/` + `src/assets/loadingIcons/` | Animated sprite shown during trip generation. |
| `src/components/itinerary/interestsEditor.tsx`, `src/constants/interests.ts` | Shared interests list and editor UI, used by the trip form and itinerary editing. |
| `src/features/Itinerary/` | Itinerary page, day selector, timeline, activity cards, trip summary sidebar; `utils/adaptItinerary.ts` converts the backend's itinerary shape into the frontend's `Itinerary` type. |
| `src/features/chatbot/` | Chat page and components — sends prompts to the AI chat endpoint, renders replies with optional itinerary previews. |
| `src/features/recommendations/` | Public page for browsing Attractions/Restaurants/Hotels/Activities with category/budget filters (UI scaffolding — not yet backed by real data). |
| `src/api/` | Typed API modules: `itinerary.ts` (get/regenerate itinerary, days, activities), `trip.ts` (get/create trips), `api.tsx` (shared axios instance). |
| `src/types/` | Shared `itinerary.ts`/`trip.ts` types used across API modules and components. |
| `src/hooks/` | `useRegenerate.ts` (shared busy/error state for regenerate actions), `useScrollDirection.ts` (nav show/hide on scroll). |
| `src/data/cities.json` | Static city-by-country dataset for the trip form's city picker. |
| `src/locales/en.ts`, `src/i18n.ts` | Copy and i18next setup. |

## Known gaps / inconsistencies worth knowing about

- `backend/app/services/store.py` still holds older in-memory scaffolding for trip requests/itineraries, alongside the newer SQLAlchemy-backed `Trip`/`Itinerary` models — worth consolidating.
- `aiServices/app/services/chat.py` (the original single-shot `ask()` chat helper) is no longer wired into `main.py` (superseded by `rag.py`) and can likely be removed.
- `aiServices`'s RAG `/chat` retrieval step is still a placeholder (always returns empty results).
- `frontend/src/features/recommendations/` renders from an empty `places` array — no backend data source wired up yet.

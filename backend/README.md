# Project A — Backend

## Project Overview

This is the backend service for **Project A**, an AI-powered trip planner. It's a FastAPI application that owns persistence (Postgres via Supabase, accessed through SQLAlchemy) for users, trips, itineraries, and conversations, and exposes the REST API the frontend calls for everything except AI generation itself.

Authentication is handled by Clerk on the frontend. This service verifies the Clerk session JWT on every protected request and keeps its own local `users` table in sync with Clerk via a webhook (`user.created` / `user.updated` / `user.deleted`).

For AI-generated itineraries and chat, this service calls out to the separate `aiServices` FastAPI app (Azure OpenAI + Azure AI Search) rather than doing that work itself — see `app/services/ai_client.py`.

At a glance, the data model is:

- **User** — synced from Clerk; has many **Trips** and **Conversations**.
- **Trip** — has one **TripPreference**, many-to-many **Interests** (through `TripInterest`), and one or more versioned **Itineraries**.
- **Itinerary** — has many **ItineraryDays**, each with many **Activities**.

## Tech Stack

- **Framework**: FastAPI (0.140), served by Uvicorn
- **Language**: Python 3.11+ (CI runs 3.11; local dev has also been done on 3.13)
- **Database**: PostgreSQL via Supabase, accessed through SQLAlchemy 2.0
- **Migrations**: Alembic
- **Auth**: Clerk session JWTs, verified locally via `PyJWT` + Clerk's JWKS endpoint; Clerk webhooks verified via `svix`
- **Validation/config**: Pydantic v2 / Pydantic Settings
- **Lint/format**: Ruff (`ruff check`, `ruff format`), enforced both locally via pre-commit and in CI
- **CI/CD**: Azure Pipelines — `.pipelines/backend/prBuild.yml` (install, lint, import-check) on every PR touching `backend/**`, `.pipelines/backend/deploy.yml` (zip-deploys to an Azure App Service on merge to `main`, then polls `/health`)

See `requirements.txt` for exact pinned versions of every dependency.

## Prerequisites

- Python 3.11 or newer
- pip
- Git
- Access to a Postgres database (the team uses a shared Supabase project — ask a teammate or your monitor for a connection string if you don't have one)
- A Clerk account/application for this project (for `CLERK_WEBHOOK_SECRET` and issuer details) — again, ask a teammate for the dev values rather than creating your own
- (Optional but recommended) the `aiServices` app running locally too, if you want to exercise the trip/itinerary generation endpoints end-to-end rather than just CRUD

## Getting Started

1. Clone the repository and check out your working branch.

2. Move into the `backend/` folder, then create and activate a virtual environment:

   Windows (cmd):
   ```
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   ```

   macOS/Linux:
   ```
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   ```

   Every time you come back to work on the backend in a new terminal, you only need to `cd backend` and re-activate the venv (`.venv\Scripts\activate` on Windows) — no need to recreate it.

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env` and fill in real values:
   ```
   copy .env.example .env
   ```
   (macOS/Linux: `cp .env.example .env`)

   At minimum you need real values for `DATABASE_URL` and `CLERK_WEBHOOK_SECRET` — the app will not start without them. See [Common Issues](#common-issues-when-setting-up) below for what each variable does and where to get it.

5. Apply database migrations (see [Common Issues](#common-issues-when-setting-up) — this step is easy to miss and isn't optional):
   ```
   alembic upgrade head
   ```

6. Run the app:
   ```
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`, with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

7. Set up pre-commit hooks (one-time, catches lint/format issues before you commit):
   ```
   pip install pre-commit
   pre-commit install
   ```

### Verifying it's working

There's no build step — this is a plain Python/FastAPI project. To confirm everything is wired up correctly:

1. Start the server (step 6 above).
2. Visit `/docs` and confirm the Swagger UI loads.
3. Call `GET /health` — should return `{"status": "ok"}`.
4. Call `GET /test-db` — should return `{"connected": true, ...}`. If this fails, your `DATABASE_URL` or network access to the DB is the problem, not your code.

There's no automated test suite yet (worth flagging to the team if you're picking up testing work).

## Project Structure

```
backend/
├── app/
│   ├── main.py            # Entry point: loads .env, configures CORS, registers all routers
│   ├── core/
│   │   ├── config.py      # Settings (env vars) loaded from .env
│   │   └── security.py    # Verifies Clerk JWTs against Clerk's JWKS; get_current_user dependency
│   ├── db/
│   │   └── db.py          # SQLAlchemy engine/session setup and the get_db() dependency
│   ├── models/             # SQLAlchemy ORM models: user, trip, trip_preference, interest,
│   │                       # trip_interest, itinerary, itinerary_day, activity, conversation
│   ├── routers/            # REST endpoints, one file per resource (see table below)
│   ├── schemas/             # Pydantic request/response models, mirroring the routers
│   └── services/            # Business logic per resource, plus ai_client.py (calls aiServices)
├── alembic/                 # Migration environment and versioned migration scripts
├── requirements.txt
├── ruff.toml                 # Lint config
├── .pre-commit-config.yaml
├── alembic.ini
├── .env.example
└── README.md
```

Routers, one file per resource under `app/routers/`:

| Router | Prefix | Notes |
|---|---|---|
| `health` | `/health` | Liveness check, no auth |
| `test_db` | `/test-db` | Confirms DB connectivity, no auth |
| `users` | `/users` | `GET /users/me` — current authenticated user |
| `trip` | `/trips` | CRUD for trips, scoped to the authenticated user; rejects overlapping date ranges on create |
| `trip_preference` | — | Trip preferences (budget, pace, etc.) |
| `interest` | — | Interest catalog |
| `trip_interest` | — | Many-to-many join between trips and interests |
| `itinerary` | — | Itinerary CRUD; delegates generation to `aiServices` |
| `activity` | — | Activities within an itinerary day |
| `conversation` | — | Chat conversation history |
| `clerk_webhook` | `/webhooks/clerk` | Receives Clerk `user.created`/`updated`/`deleted` events, verified via `svix`, keeps the local `users` table in sync |

Everything protected requires a valid Clerk session JWT in the `Authorization: Bearer <token>` header; `app/core/security.get_current_user` verifies it and looks up (or 401s on) the matching local `User` row.

## Common Issues When Setting Up

- **App won't start / Pydantic validation error on `DATABASE_URL` or `CLERK_WEBHOOK_SECRET`**: both are required with no default in `app/core/config.py`. Make sure your `.env` actually has real values, not the placeholders from `.env.example`.

- **`GET /test-db` fails / "Database connection failed"**: usually a wrong `DATABASE_URL`, or the Supabase project pausing due to inactivity (free-tier projects do this) — check the Supabase dashboard if it's been idle.

- **New tables/columns missing after pulling latest `main`**: someone added a migration and you haven't applied it yet. Run `alembic upgrade head`. This is easy to forget since the old scaffolding-only README never mentioned Alembic at all — if a teammate's feature relies on a new column and you're getting SQL errors, this is almost always why.

- **`401 Unauthorized` on protected endpoints when testing via Swagger `/docs`**: Swagger doesn't have a Clerk session for you. Either grab a real session token from the frontend (log in, open browser devtools → Application/Storage → find the Clerk session, or log the token client-side temporarily) and use the "Authorize" button in Swagger, or test through the actual frontend instead.

- **`401 "No local account linked to this Clerk user"` even with a valid Clerk token**: your Clerk token is valid, but the webhook that creates the local `User` row never fired for your account — this happens most often in local dev because Clerk can't reach `http://127.0.0.1:8000/webhooks/clerk` directly. You need a tunnel (e.g. ngrok) pointed at your local server and registered as the webhook endpoint in the Clerk dashboard, or just rely on the shared dev/staging environment where the webhook is already wired up.

- **Trip/itinerary generation endpoints fail or hang, but everything else works**: those endpoints call out to the separate `aiServices` app via `AI_SERVICE_URL` (defaults to `http://127.0.0.1:8001`). If you're not running `aiServices` locally, either start it or point `AI_SERVICE_URL` at a running environment.

- **CORS errors in the browser console when calling from the frontend**: your frontend's origin isn't in `CORS_ORIGINS`. The default covers the standard Vite dev ports (`5173`, `3000`); if you're running the frontend somewhere else, add that origin.

- **Windows-specific**: `set VAR=value` (not `export`) sets an env var for the current terminal session only; `.venv\Scripts\activate` (not `source .venv/bin/activate`) activates the virtual environment. If a script or doc assumes macOS/Linux syntax, adapt it.

- **Adding a new dependency**: install it in your activated venv, then regenerate the lockfile with `pip freeze > requirements.txt` before committing — don't hand-edit version numbers.

## Contribute

- Branch naming: `user/<username>/<short-description>`.
- Every PR touching `backend/**` runs `ruff check .` and an import-check (`python -c "from app.main import app"`) in CI — run these locally before pushing to catch issues early:
  ```
  ruff check .
  python -c "from app.main import app"
  ```
- Pre-commit hooks (ruff check/format, trailing whitespace, end-of-file, YAML validation, large-file check) run automatically on commit once installed (see step 7 above).
# Miles

Miles is a full-stack AI travel planning platform with:
- a React frontend for trip planning and itinerary management,
- a FastAPI backend for authenticated APIs and persistence,
- a separate FastAPI AI service for itinerary generation, chat, and recommendations.

## Purpose and value

Miles helps travelers build multi-day plans, regenerate activities, browse destination/restaurant/activity recommendations, and chat with an assistant using trip context.

## Main features

- Clerk-authenticated user experience with protected routes.
- Multi-step trip planning form (destinations, dates, travelers, budget, interests, notes).
- AI-generated itineraries with full/day/activity regeneration.
- Manual activity add/edit/delete/reorder in itinerary timelines.
- Recommendation browsing (destinations, restaurants, activities).
- Saved trips dashboard.
- Chat widget (“Milo”) with conversation history support.

## System architecture

```text
Frontend (React/Vite, Clerk)
        |
        v
Backend API (FastAPI, SQLAlchemy, Alembic, Clerk JWT verification)
   |                        \
   |                         \--> PostgreSQL-compatible DB (via DATABASE_URL)
   |
   \--> AI Services API (FastAPI)
           |--> Azure OpenAI (chat + itinerary generation + embeddings)
           |--> Azure AI Search (query/search, vector + keyword fallback)
           \--> Azure Blob Storage (recommendation CSV datasets)
```

## Frontend overview (`/frontend`)

- React 19 + TypeScript + Vite.
- Routing with `react-router-dom`.
- UI with MUI + Griffel.
- i18n via `i18next` (English resources currently present).
- Axios API client that attaches Clerk session tokens.
- Key routes:
  - `/` home
  - `/plan-trip` (protected)
  - `/discover`
  - `/trips` (protected)
  - `/itinerary` and `/itinerary/:itineraryId` (protected)
  - `/sign-in`, `/sign-up`

## Backend overview (`/backend`)

- FastAPI service (`app/main.py`) with CORS middleware and modular routers.
- SQLAlchemy ORM models for users, trips, preferences, interests, itineraries, activities, and conversations/messages.
- Alembic migrations in `backend/alembic/versions`.
- Clerk auth:
  - verifies bearer JWTs using Clerk JWKS,
  - enforces user-scoped access on protected resources.
- Clerk webhook endpoint syncs local user records (`user.created/updated/deleted`).
- Proxies/coordinates AI flows by calling the AI service over HTTP.

## AI services and recommendation system (`/aiServices`)

- FastAPI service (`app/main.py`) with routers for itinerary generation, chat, RAG endpoint, health, and recommendations.
- Uses Azure OpenAI for:
  - itinerary generation/regeneration,
  - chat responses,
  - embedding generation for vector search.
- Uses Azure AI Search for retrieval in itinerary generation (`SearchService`).
- Uses Azure Blob Storage CSV datasets (`destinations`, `activities`, `restaurants`) and pandas/numpy scoring for recommendation endpoints.

## Database overview

The backend persists domain data through SQLAlchemy models and Alembic migrations. Core entities:

| Entity | Purpose |
|---|---|
| `users` | Local account linked to Clerk user ID |
| `trips` | Trip details, date range, budget, travelers, notes |
| `interests` | Canonical interest catalog |
| `trip_interests` | Many-to-many link between trips and interests |
| `trip_preferences` | One preference record per trip |
| `itineraries` | Versioned itinerary per trip |
| `itinerary_days` | Day-level itinerary structure |
| `activities` | Timed activities per itinerary day |
| `conversations`, `messages` | Chat history storage |

## Authentication

- Frontend uses Clerk React SDK.
- Backend expects `Authorization: ****** for protected endpoints.
- Backend validates token signature/issuer and resolves the local user by `auth_provider_id`.
- Clerk webhook endpoint: `POST /webhooks/clerk`.

## Azure services used

| Service | Usage in repo |
|---|---|
| Azure OpenAI | Chat and itinerary generation in `aiServices` |
| Azure AI Search | Retrieval/search used by AI itinerary flow |
| Azure Blob Storage | Recommendation datasets loaded from CSV blobs |
| Azure App Service (Linux) | Backend and AI services deployment targets |
| Azure Static Web Apps | Frontend deployment target |
| Azure Pipelines | PR validation and deployment pipelines |

## Main APIs and endpoints

### Backend (primary app API)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/test-db` | DB connectivity check |
| POST | `/webhooks/clerk` | Clerk user sync webhook |
| GET | `/users/me` | Current authenticated user |
| CRUD | `/trips` | User trip management |
| POST/GET/DELETE | `/trips/{trip_id}/interests` | Trip interest links |
| POST/GET/PATCH/DELETE | `/trips/{trip_id}/preferences` | Trip preference record |
| GET/POST | `/itinerary` | List legacy in-memory + generate itinerary |
| POST | `/itinerary/{itinerary_id}/regenerate` | Regenerate full itinerary |
| POST | `/itinerary/{itinerary_id}/days/{day_number}/regenerate` | Regenerate day |
| POST | `/itinerary/{itinerary_id}/days/{day_number}/activities/{activity_id}/regenerate` | Regenerate activity |
| POST | `/itinerary/{itinerary_id}/days/{day_number}/activities` | Add activity |
| GET | `/itinerary/by-trip/{trip_id}` | Itinerary by trip |
| GET | `/itinerary/upcoming` | Nearest upcoming itinerary |
| POST | `/chat/message` | Milo chat endpoint |
| POST/GET | `/api/recommendations/...` | Recommendation proxy endpoints |
| CRUD | `/activities/...` | Activity CRUD endpoints |
| CRUD | `/conversations` + `/conversations/{id}/messages` | Conversation/message APIs |

### AI services (called by backend)

| Method | Endpoint |
|---|---|
| GET | `/health` |
| POST | `/itinerary/` |
| POST | `/itinerary/regenerate` |
| POST | `/itinerary/regenerate-day` |
| POST | `/itinerary/regenerate-activity` |
| POST | `/chat/message` |
| POST | `/chat/` (RAG route) |
| POST/GET | `/api/recommendations/...` |

## Project folder structure

```text
Miles/
├── frontend/                # React + Vite client
├── backend/                 # FastAPI API + DB models/migrations
├── aiServices/              # FastAPI AI and recommendation services
├── .pipelines/              # Azure Pipelines (PR + deploy)
│   ├── frontend/
│   ├── backend/
│   ├── aiServices/
│   └── scripts/wait-for-health.sh
└── README.md
```

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, MUI, Griffel, Axios, i18next, Clerk |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic, PyJWT, svix, httpx |
| AI services | FastAPI, Azure OpenAI SDK, Azure AI Search SDK, Azure Storage Blob SDK, pandas, numpy |
| CI/CD | Azure Pipelines, Azure Static Web Apps, Azure App Service |

## Prerequisites

- Node.js 22.x and npm (frontend pipeline uses Node 22).
- Python 3.11 (backend/aiServices pipelines use Python 3.11).
- Access to required Azure and Clerk configuration values.
- PostgreSQL-compatible database URL for backend.

## Installation

```bash
git clone <repo-url>
cd Miles
```

### Frontend setup

```bash
cd /home/runner/work/Miles/Miles/frontend
npm ci
```

### Backend setup

```bash
cd /home/runner/work/Miles/Miles/backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
```

### AI services setup

```bash
cd /home/runner/work/Miles/Miles/aiServices
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Required environment variables

### Frontend (`frontend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | App throws at startup if missing |
| `VITE_API_URL` | No | Defaults to `http://127.0.0.1:8000/` in code |

### Backend (`backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | SQLAlchemy connection string |
| `CLERK_WEBHOOK_SECRET` | Yes | Verifies Clerk webhook signatures |
| `AI_SERVICE_URL` | No | Default `http://127.0.0.1:8001` |
| `AI_SERVICE_TIMEOUT` | No | Default `120.0` |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `CLERK_ISSUER` | No | Has default in settings |
| `CLERK_JWKS_URL` | No | Auto-derived from issuer if blank |
| `CLERK_AUTHORIZED_PARTIES` | No | Optional `azp` allow-list |

### AI services (`aiServices/.env`)

| Variable | Required | Notes |
|---|---|---|
| `AZURE_OPENAI_ENDPOINT` | Yes | Chat/generation endpoint |
| `AZURE_OPENAI_DEPLOYMENT` | Yes | Chat/generation model deployment |
| `AZURE_OPENAI_API_KEY` | Yes | Used by client when set |
| `AZURE_OPENAI_API_VERSION` | Yes | API version |
| `AZURE_SEARCH_ENDPOINT` | Yes | Azure AI Search endpoint |
| `AZURE_SEARCH_API_KEY` | Yes | Azure AI Search key |
| `AZURE_SEARCH_INDEX_NAME` | Yes | Index name |
| `AZURE_STORAGE_CONTAINER` | Required for recommendations | Blob container name |
| `AZURE_STORAGE_ACCOUNT_URL` | Required for recommendations | Used by data loader |
| `AZURE_OPENAI_EMBEDDING_ENDPOINT` | Optional | Enables vector embedding client |
| `AZURE_OPENAI_EMBEDDING_API_KEY` | Optional | Enables vector embedding client |
| `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` | Optional | Defaults to `text-embedding-3-small` |
| `ALLOWED_ORIGINS` | Optional | CORS origins list for AI service |

## Run locally

### Run frontend

```bash
cd /home/runner/work/Miles/Miles/frontend
npm run dev
```

### Run backend

```bash
cd /home/runner/work/Miles/Miles/backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Run AI services

```bash
cd /home/runner/work/Miles/Miles/aiServices
source .venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

> The backend default `AI_SERVICE_URL` points to `http://127.0.0.1:8001`, so run AI services on port 8001 locally (or change `AI_SERVICE_URL`).

## Testing and validation commands

| Component | Command |
|---|---|
| Frontend lint | `cd /home/runner/work/Miles/Miles/frontend && npm run lint` |
| Frontend build check | `cd /home/runner/work/Miles/Miles/frontend && npm run build` |
| Frontend QA e2e | `cd /home/runner/work/Miles/Miles/frontend && npm run test:qa` |
| Backend lint | `cd /home/runner/work/Miles/Miles/backend && ruff check .` |
| Backend import/build check | `cd /home/runner/work/Miles/Miles/backend && python -c "from app.main import app"` |
| Backend tests | `cd /home/runner/work/Miles/Miles/backend && python -m unittest discover -s tests -v` |
| AI services import/build check | `cd /home/runner/work/Miles/Miles/aiServices && python -c "from app.main import app"` |
| AI services tests | `cd /home/runner/work/Miles/Miles/aiServices && python -m pytest` |

## Build commands

| Component | Build command |
|---|---|
| Frontend | `npm run build` (`tsc -b && vite build`) |
| Backend | `python -c "from app.main import app"` (pipeline build check) |
| AI services | `python -c "from app.main import app"` (pipeline build check) |

## Deployment and CI/CD overview

Azure Pipelines live under `.pipelines/`:

- **Frontend**
  - PR build: `.pipelines/frontend/prBuild.yml` (npm ci, lint, build).
  - Deploy: `.pipelines/frontend/deploy.yml` using `AzureStaticWebApp@0`.
- **Backend**
  - PR build: `.pipelines/backend/prBuild.yml` (pip install, ruff, import check).
  - Deploy: `.pipelines/backend/deploy.yml` (zip package via `git archive`, deploy to Azure App Service Linux, health check script).
- **AI services**
  - PR build: `.pipelines/aiServices/prBuild.yml` (pip install, import check).
  - Deploy: `.pipelines/aiServices/deploy.yml` (App Service settings push + zip deploy + health check).

Shared deploy helper:
- `.pipelines/scripts/wait-for-health.sh` polls `/health` until HTTP 200.

## Development notes

- Apply backend migrations with `alembic upgrade head` after pulling DB-related changes.
- Backend and AI services are independent FastAPI apps and run as separate processes.
- `aiServices/start_uvicorn.py` points to an `Ai-services` folder name and is not aligned with current folder naming.
- Frontend SPA fallback is configured in `frontend/public/staticwebapp.config.json`.

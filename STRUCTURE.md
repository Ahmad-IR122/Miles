# Project Structure

Project A is an AI-powered travel planner made up of three independently deployed applications:

- `frontend/`: React and TypeScript single-page application.
- `backend/`: FastAPI API for authentication, persistence, and orchestration.
- `aiServices/`: FastAPI API for itinerary generation, RAG chat, and destination recommendations.

Clerk handles frontend authentication. The backend verifies Clerk JWTs and synchronizes user records through a webhook. PostgreSQL (Supabase) is accessed through SQLAlchemy, while the AI service uses Azure OpenAI, Azure AI Search, and recommendation CSVs stored in Azure Blob Storage.

```text
.
|-- .pipelines/       # Azure Pipelines build and deployment definitions
|-- aiServices/       # AI generation, chat, search, and recommendations API
|-- backend/          # Persistent application API
|-- frontend/         # React web application
|-- .gitignore
|-- README.md
`-- STRUCTURE.md
```

## `.pipelines/` - CI/CD

Each application has a PR build and a deployment pipeline:

| Path | Purpose |
|---|---|
| `aiServices/prBuild.yml` | Installs and validates the AI service on relevant pull requests. |
| `aiServices/deploy.yml` | Deploys the AI service to Azure App Service, then checks `/health`. |
| `backend/prBuild.yml` | Installs dependencies, runs Ruff, and validates the backend. |
| `backend/deploy.yml` | Deploys the backend to Azure App Service and checks `/health`. |
| `frontend/prBuild.yml` | Installs dependencies, lints, and builds the frontend. |
| `frontend/deploy.yml` | Builds and deploys the frontend to Azure Static Web Apps. |
| `scripts/wait-for-health.sh` | Shared deployment health-check polling script. |

## `backend/` - Application API and persistence

The backend owns users, trips, preferences, interests, versioned itineraries, days, activities, and conversations. A user has many trips and conversations; a trip has one preference record, many interests, and multiple itinerary versions; an itinerary contains ordered days and activities.

| Path | Purpose |
|---|---|
| `app/main.py` | FastAPI entry point, CORS configuration, and router registration. |
| `app/core/config.py` | Environment-backed application settings. |
| `app/core/security.py` | Clerk JWT verification and protected-route user dependency. |
| `app/db/db.py` | SQLAlchemy engine, session factory, and `get_db()` dependency. |
| `app/models/` | SQLAlchemy models for users, trips, preferences, interests, itineraries, activities, and conversations. |
| `app/schemas/` | Pydantic request and response schemas, including recommendations. |
| `app/routers/` | Resource endpoints, health and database checks, and Clerk webhooks. |
| `app/routers/recommendations.py` | Proxies `POST /api/recommendations` to the AI service. |
| `app/services/` | Resource business logic and the AI service client. |
| `app/services/store.py` | Legacy in-memory storage retained for `/trip-requests`. |
| `alembic/`, `alembic.ini` | Database migration environment and version history. |
| `requirements.txt`, `ruff.toml` | Dependencies and lint configuration. |

The main authenticated trip API is `/trips`; the older in-memory `/trip-requests` API remains registered during the migration to persisted trips.

## `aiServices/` - AI and recommendation API

This service generates structured itineraries with Azure OpenAI, exposes a RAG-style chat flow using Azure AI Search, and ranks destination recommendations from preference and destination data.

| Path | Purpose |
|---|---|
| `app/main.py` | FastAPI entry point and itinerary, RAG, and recommendation router registration. |
| `app/config/config.py` | Azure OpenAI and Azure AI Search settings. |
| `app/clients/` | Azure OpenAI and Azure AI Search client builders. |
| `app/models/rag.py` | Chat request and response models. |
| `app/models/travel.py` | Structured itinerary models. |
| `app/models/recommendation.py` | Recommendation request and response models. |
| `app/prompts/itinerary_prompt.py` | Generation, itinerary-regeneration, and day-regeneration prompts. |
| `app/prompts/rag_prompts.py` | Query-rewriting and answer-generation prompts. |
| `app/routers/itinerary.py` | Itinerary generation and regeneration endpoints. |
| `app/routers/rag.py` | `POST /chat/` RAG chat endpoint. |
| `app/routers/recommendations.py` | `POST /api/recommendations` endpoint. |
| `app/services/itinerary.py` | Calls Azure OpenAI and validates structured itinerary output. |
| `app/services/rag.py` | Query rewriting, retrieval, response generation, and in-memory chat history. |
| `app/services/data_loader.py` | Loads destination, activity, and restaurant CSVs from Azure Blob Storage. |
| `app/services/recommendation_service.py` | Ranks destinations by interests, budget, season, and style. |
| `app/services/chat.py` | Older single-shot chat helper; not registered by `main.py`. |
| `scripts/setup_search_index.py` | One-off Azure AI Search index setup script. |
| `start_uvicorn.py` | Local/service startup helper. |
| `pyproject.toml`, `requirements.txt` | Python tooling and dependencies. |

## `frontend/` - React web application

The frontend uses React 19, TypeScript, Vite, React Router, MUI, Griffel, i18next, Axios, and Clerk. Public routes include home, authentication, and destination discovery. Trip planning, saved trips, and itinerary routes are protected.

| Path | Purpose |
|---|---|
| `src/main.tsx` | Application entry point and provider setup. |
| `src/routes/router.tsx`, `routesPaths.ts` | Routes for `/`, `/plan-trip`, `/discover`, `/trips`, `/itinerary`, `/itinerary/:itineraryId`, authentication, and 404. |
| `src/common/appLayout/` | Shared page shell with navigation, footer, and route outlet. |
| `src/common/topNav/` | Navigation and account menu, including trip dates, theme control, and sign-out. |
| `src/common/theme/` | Light/dark state, MUI theme, tokens, typography, and CSS variables. |
| `src/common/chatWidget/` | Shared floating chat widget UI. |
| `src/common/footer/`, `notFound/`, `AppButton/` | Shared footer, 404 page, and styled button. |
| `src/features/auth/` | Clerk provider, protected-route wrapper, and auth pages. |
| `src/components/tripPlanningForm/` | Multi-step destination, date, traveler, budget, and interest form. |
| `src/components/loadingScreen/`, `loadingSprite/`, `splashScreen/` | Loading experiences. |
| `src/features/Itinerary/` | Itinerary fetching, adaptation, day navigation, timeline, editing, and summary UI. |
| `src/features/recommendations/` | Preference-driven destination discovery with loading, error, empty, and filter states. |
| `src/features/savedTrips/` | Authenticated trip list with upcoming, ongoing, and completed statuses. |
| `src/api/` | Axios client and typed trip, itinerary, and recommendation API modules. |
| `src/types/`, `src/hooks/` | Shared API types and application hooks. |
| `src/data/destinations.json` | Static destination data used by trip planning. |
| `src/locales/en.ts`, `src/i18n.ts` | English copy and i18next setup. |
| `src/config/env.ts` | Typed frontend environment configuration. |

## Known transitional areas

- `backend/app/services/store.py` and `/trip-requests` are legacy in-memory scaffolding alongside the SQLAlchemy-backed `/trips` flow.
- `aiServices/app/services/chat.py` is superseded by `rag.py` and is not wired into the application.
- RAG chat history is held in memory, so it is not durable across restarts or multiple service instances.
- The recommendation UI uses a placeholder image and a default mock preference payload when no recent trip preferences are available.

# Introduction 
# Project A — Backend
This is the backend service for Project A (AI Trip Planner), built with FastAPI. This initial version covers Task 510 — Initialize BE: it sets up the base project scaffolding, folder structure, and tooling only. No feature logic (trip planning, itineraries, recommendations, etc.) has been implemented yet.

## Getting Started

### Installation process

1. Clone the repository and check out this branch.
2. Create and activate a virtual environment:
3. Install dependencies:
4. Copy `.env.example` to `.env` and adjust values if needed.

### Software dependencies

- Python 3.10+
- FastAPI
- Uvicorn
- Pydantic Settings

See `requirements.txt` for exact pinned versions.

### Running the app
The API will be available at `http://127.0.0.1:8000`, with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

## Build and Test

There's no build step — this is a plain FastAPI/Python project. To verify the app runs correctly:

1. Start the server with the command above.
2. Visit `/docs` and confirm the Swagger UI loads.
3. Call `GET /health` and confirm it returns `{"status": "ok"}`.

No automated test suite exists yet, since this task was scaffolding only.

## Contribute

- Project layout: `app/routers` holds API endpoints, `app/schemas` holds Pydantic request/response models, `app/services` holds business logic, `app/core` holds shared config.
- Branch naming: `user/<username>/<short-description>`.
- Add new dependencies to `requirements.txt` via `pip freeze > requirements.txt` inside your virtual environment before committing.

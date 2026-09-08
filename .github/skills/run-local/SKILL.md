---
name: run-local
description: Start Project A's complete local development stack: run Alembic migrations, then backend on 8000, aiServices on 8001, and Vite on 5173, with required environment variables.
metadata:
  short-description: Run Project A locally
---

# run-local

Bring the complete Project A local stack up in this order:

1. Run Alembic migrations from `backend/`
2. Start backend on `127.0.0.1:8000`
3. Start aiServices on `127.0.0.1:8001`
4. Start Vite on `localhost:5173`

Use the existing Python environment. Do not create, recreate, repair, or manage `.venv`.

## Required environment variables

Check the existing `.env` files without printing their values.

### backend/.env

Required:

- `DATABASE_URL`
- `CLERK_WEBHOOK_SECRET`
- `AI_SERVICE_URL`

For local development:

```text
AI_SERVICE_URL=http://127.0.0.1:8001
```

### aiServices/.env

Required:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_SEARCH_ENDPOINT`
- `AZURE_SEARCH_API_KEY`
- `AZURE_SEARCH_INDEX_NAME`

Check the current `aiServices/.env.example` if additional required variables need to be confirmed.

### frontend/.env

Required:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL`

For local development:

```text
VITE_API_URL=http://127.0.0.1:8000
```

Never print environment variable values or secrets.

If a required variable is missing, stop and report only its name.

## Ports

Before starting, check:

- `8000` — backend
- `8001` — aiServices
- `5173` — Vite

If a port is already occupied, identify the process and ask before stopping it. Do not automatically kill processes.

## Step 1 — Alembic

Alembic is inside the backend.

The working directory MUST be:

```text
backend/
```

Run:

```powershell
cd backend
..\.venv\Scripts\python.exe -m alembic upgrade head
```

Do not run Alembic from the repository root.

If the migration fails, stop and report the actual error. Do not start any services.

## Step 2 — Backend

After migrations succeed, start the backend from `backend/`:

```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Keep it running in its own terminal/process.

Backend:

```text
http://127.0.0.1:8000
```

Verify `/health` if available.

Do not continue if the backend fails to start.

## Step 3 — aiServices

After the backend is running, start aiServices from `aiServices/`:

```powershell
cd aiServices
..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

Keep it running in its own terminal/process.

aiServices:

```text
http://127.0.0.1:8001
```

Verify `/health` if available.

Do not use `aiServices/start_uvicorn.py`.

## Step 4 — Frontend

After the backend and aiServices are running, start Vite from `frontend/`:

```powershell
cd frontend
npm run dev -- --host localhost --port 5173
```

Frontend:

```text
http://localhost:5173
```

Verify that it is reachable.

## Completion

The task is complete when:

- Alembic migrations succeeded
- backend is running on `:8000`
- aiServices is running on `:8001`
- Vite is running on `:5173`
- required environment variables are present
- backend points to aiServices at `http://127.0.0.1:8001`

Report:

```text
Local stack is running:

Migrations: completed
Backend:    http://127.0.0.1:8000
aiServices: http://127.0.0.1:8001
Frontend:   http://localhost:5173
```

If any step fails, report the actual error and do not claim the stack is running.
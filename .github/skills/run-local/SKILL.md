---
name: run-local
description: Start the complete Project A local development stack: backend on port 8000, aiServices on port 8001, and Vite on port 5173. Use this when asked to run or bring up the local Project A stack.
---

# run-local

Bring the complete Project A local development stack up in this exact order:

1. Start the backend on `127.0.0.1:8000`.
2. Start aiServices on `127.0.0.1:8001`.
3. Start Vite on `localhost:5173`.

The services have a hard dependency chain:

- The backend requires `DATABASE_URL` and `CLERK_WEBHOOK_SECRET`.
- The backend communicates with aiServices.
- Itinerary endpoints depend on aiServices being available.
- The frontend depends on the backend.

Do not start a later service if a required earlier service fails.

Do not create, recreate, repair, or manage `.venv`.

## Environment variables

Check the existing `.env` files without printing their values or secrets.

### `backend/.env`

Required:

- `DATABASE_URL`
- `CLERK_WEBHOOK_SECRET`
- `AI_SERVICE_URL`

`AI_SERVICE_URL` must point to:

```text
http://127.0.0.1:8001
```

### `aiServices/.env`

Required:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_SEARCH_ENDPOINT`
- `AZURE_SEARCH_API_KEY`
- `AZURE_SEARCH_INDEX_NAME`

Check `aiServices/.env.example` if additional required variables need to be confirmed.

### `frontend/.env`

Required:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL`

`VITE_API_URL` must point to:

```text
http://127.0.0.1:8000
```

Never print environment variable values or secrets.

If a required variable is missing, stop and report only its name.

## Ports

Before starting services, check:

- `8000` — backend
- `8001` — aiServices
- `5173` — Vite

If a required port is already occupied:

1. Identify the process using the port.
2. Ask before stopping it.
3. Never automatically kill the process.

## Step 1 — Backend

Start the backend from `backend/`:

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

If the backend fails to start, report its actual startup error and stop.

## Step 2 — aiServices

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

If aiServices fails to start, report its actual startup error and stop.

## Step 3 — Frontend

After the backend and aiServices are running, start Vite from `frontend/`:

```powershell
cd frontend
npm run dev -- --host localhost --port 5173
```

Keep Vite running in its own terminal/process.

Frontend:

```text
http://localhost:5173
```

Verify that it is reachable.

## Completion

Only report success when all three services are running:

```text
Local stack is running:

Backend:    http://127.0.0.1:8000
aiServices: http://127.0.0.1:8001
Frontend:   http://localhost:5173
```

If any service fails, report the actual error and do not claim the stack is running.
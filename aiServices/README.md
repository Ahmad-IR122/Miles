# AI Services

The AI Services API is the intelligence layer for the travel assistant. It accepts travel questions and preferences, uses Azure OpenAI to generate answers and itineraries, and is prepared to use Azure AI Search for travel recommendations.

## What it does

- `POST /chat/` answers a travel question.
- `POST /itinerary/` creates a multi-day itinerary from travel preferences.
- The regeneration endpoints update a complete itinerary, one day, or an activity.
- `scripts/setup_search_index.py` creates the Azure AI Search index and loads one sample document.

## Tech stack

| Area | Technology |
| --- | --- |
| Language | Python 3.11+ |
| API | FastAPI and Uvicorn |
| Validation and configuration | Pydantic and pydantic-settings |
| AI | Azure OpenAI (`openai`) |
| Search | Azure AI Search (`azure-search-documents`) |
| Testing and code quality | Pytest, Ruff, pre-commit |

## Prerequisites

Before starting, make sure you have:

- Git
- Python 3.11 or newer (`python --version`)
- An Azure OpenAI resource, deployment name, endpoint, API key, and API version
- An Azure AI Search service, API key, and index name

The app loads its settings as soon as it imports `app`, so every configuration value below is required even if you only want to start the API locally.

## Getting started

### 1. Clone and enter the service

```bash
git clone <repository-url>
cd <repository-folder>/aiServices
```

All remaining commands assume that `aiServices` is the current directory.

### 2. Create and activate a virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 4. Configure environment variables

Create `aiServices/.env` and add your Azure values:

```dotenv
AZURE_OPENAI_ENDPOINT=https://<resource-name>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=<deployment-name>
AZURE_OPENAI_API_KEY=<azure-openai-api-key>
AZURE_OPENAI_API_VERSION=<api-version>

AZURE_SEARCH_ENDPOINT=https://<service-name>.search.windows.net
AZURE_SEARCH_API_KEY=<azure-search-api-key>
AZURE_SEARCH_INDEX_NAME=<index-name>
```

`.env` is ignored by Git. Never commit real credentials; get development values through the team's approved secret-sharing process.

### 5. Set up Azure AI Search (first time only)

If the configured index does not already exist, create it and upload the included sample document:

```bash
python -m scripts.setup_search_index
```

This command uses `create_or_update_index`, so confirm the index name with the Azure resource owner before running it against a shared environment.

### 6. Run the API

```bash
python -m uvicorn app.main:app --reload
```

Then open <http://127.0.0.1:8000/docs>. FastAPI's Swagger UI lists the current request and response schemas and lets you call each endpoint.

To confirm the service works, send a chat request:

```bash
curl -X POST http://127.0.0.1:8000/chat/ -H "Content-Type: application/json" -d "{\"message\":\"What are three family-friendly activities in Lisbon?\"}"
```

Expected response shape:

```json
{
  "answer": "..."
}
```

## API at a glance

| Endpoint | Purpose |
| --- | --- |
| `POST /chat/` | Answer a travel question; body: `{ "message": "..." }` |
| `POST /itinerary/` | Generate an itinerary from preferences and optional travel data |
| `POST /itinerary/regenerate` | Regenerate a full itinerary |
| `POST /itinerary/regenerate-day` | Regenerate one itinerary day |
| `POST /itinerary/regenerate-activity` | Regenerate one itinerary activity |

Use `/docs` as the source of truth for the full regeneration request bodies. A minimal itinerary-generation request looks like this:

```json
{
  "preferences": {
    "destination": "Lisbon",
    "start_date": "2026-09-10",
    "end_date": "2026-09-13",
    "interests": ["food", "history"],
    "budget": "moderate"
  },
  "travel_data": []
}
```

## Project structure

```text
aiServices/
|-- app/
|   |-- main.py                 FastAPI application and router registration
|   |-- clients/                Azure OpenAI and Azure Search clients
|   |-- config/                 Environment-backed settings
|   |-- models/                 Pydantic request and response models
|   |-- prompts/                Prompt templates and builders
|   |-- routers/                HTTP endpoint definitions
|   `-- services/               Chat, RAG, and itinerary logic
|-- scripts/
|   `-- setup_search_index.py   Creates the search index and sample document
|-- requirements.txt            Runtime and test dependencies
|-- pyproject.toml              Package metadata and Python version
`-- .pre-commit-config.yaml     Formatting and lint hooks
```

Request flow: `routers` validate an HTTP request, `services` apply the chat or itinerary logic, `prompts` prepare model input, and `clients` communicate with Azure services. `models` defines the data exchanged at the API boundary.

## Test and quality checks

Run the automated test command from `aiServices`:

```bash
python -m pytest
```

There is currently no committed `tests/` directory, so a fresh checkout reports that no tests were collected. Use the Swagger UI or the cURL request above as the current smoke test. New tests should mock Azure calls so they do not require live credentials or spend model quota.

Optional local hooks match the project's formatting and lint checks:

```bash
python -m pip install pre-commit
pre-commit install
pre-commit run --all-files
```

## Common setup issues

| Problem | Fix |
| --- | --- |
| Missing-settings `ValidationError` at startup | Check that `.env` is in `aiServices`, contains all seven variables, and that Uvicorn was launched from `aiServices`. |
| `ModuleNotFoundError: No module named 'app'` | Run `cd aiServices` before starting Uvicorn or the setup module. |
| `ModuleNotFoundError` when creating the index | Use `python -m scripts.setup_search_index`, not `python scripts/setup_search_index.py`. |
| Azure authentication/deployment error | Recheck the OpenAI endpoint, API key, deployment name, API version, and your resource permissions. |
| Search index not found | Verify `AZURE_SEARCH_INDEX_NAME`; create it with the setup command only when appropriate for that environment. |
| `422 Unprocessable Entity` | Compare the request body with the schema in `/docs`; `/chat/` requires a string field named `message`. |
| Port 8000 is already in use | Start on a different port: `python -m uvicorn app.main:app --reload --port 8001`. |
| PowerShell refuses to activate `.venv` | In a PowerShell session, run `Set-ExecutionPolicy -Scope Process Bypass`, then activate the environment again. |

## Development notes

- Do not use `start_uvicorn.py`; it points to an obsolete `Ai-services` directory.
- Keep credentials out of source control.
- Keep Azure integration tests separate from unit tests and mock remote calls by default.

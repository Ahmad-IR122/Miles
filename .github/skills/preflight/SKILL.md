---
name: preflight
description: Run local CI checks for the applications affected by the current changes.
---

# Preflight

Run the relevant CI checks locally before changes are pushed.

Do not modify repository files while running preflight checks.

## Step 1: Inspect Changed Files

Inspect the current Git changes and identify all changed file paths.

Include:

- committed changes on the current branch compared with `main`
- staged changes
- unstaged changes
- untracked files

Use Git commands to inspect the repository directly.

Do not use a separate preflight shell script.

## Step 2: Detect Affected Applications

Match the changed files against these paths:

```text
backend/**     -> Backend
aiServices/**  -> AI Services
frontend/**    -> Frontend
```

Only run checks for applications that have changed files.

If an application has no changed files, skip it.

## Step 3: Resolve Python Environments

For Python applications, always use the project-local virtual environment.

Do not use the global:

```text
python
python3
py
```

commands for application import checks.

### Backend Python

On Windows, use:

```text
backend/.venv/Scripts/python.exe
```

On Linux or macOS, use:

```text
backend/.venv/bin/python
```

### AI Services Python

On Windows, use:

```text
aiServices/.venv/Scripts/python.exe
```

On Linux or macOS, use:

```text
aiServices/.venv/bin/python
```

Before running application checks, verify the selected interpreter:

```text
<python-path> --version
```

The expected Python version is:

```text
Python 3.13.x
```

Do not create a virtual environment automatically.

Do not install, upgrade, downgrade, or reinstall packages automatically.

If the required virtual environment does not exist, report the environment problem.

If the selected environment is not using Python 3.13, report the mismatch instead of switching to another Python installation.

## Step 4: Run Backend Checks

If any changed file matches:

```text
backend/**
```

run the checks for the Backend.

Run Ruff from the `backend` directory:

```bash
ruff check .
```

Then verify the FastAPI application import using the Backend virtual environment.

On Windows:

```text
backend/.venv/Scripts/python.exe -c "from app.main import app"
```

On Linux or macOS:

```text
backend/.venv/bin/python -c "from app.main import app"
```

Run the import command with `backend` as the working directory.

If Ruff fails, report the Ruff errors.

If the application import fails, report the import error and the Python interpreter that was used.

Do not automatically run:

```text
ruff check . --fix
```

If no Backend files changed, skip Backend checks.

## Step 5: Run AI Services Checks

If any changed file matches:

```text
aiServices/**
```

run the checks for AI Services.

Run Ruff from the `aiServices` directory:

```bash
ruff check .
```

Then verify the FastAPI application import using the AI Services virtual environment.

On Windows:

```text
aiServices/.venv/Scripts/python.exe -c "from app.main import app"
```

On Linux or macOS:

```text
aiServices/.venv/bin/python -c "from app.main import app"
```

Run the import command with `aiServices` as the working directory.

Use the existing local environment variables.

Do not hardcode, print, expose, or modify secrets.

If Ruff fails, report the Ruff errors.

If the application import fails, report the import error and the Python interpreter that was used.

Do not automatically run:

```text
ruff check . --fix
```

If no AI Services files changed, skip AI Services checks.

## Step 6: Run Frontend Checks

If any changed file matches:

```text
frontend/**
```

run these commands from the `frontend` directory:

```bash
npm run lint
npm run build
```

If either command fails, report the error.

Do not automatically modify frontend files.

If no Frontend files changed, skip Frontend checks.

## Step 7: Report Results

After running all relevant checks, provide a short summary.

Use this format:

```text
Preflight Results

Backend: passed / failed / skipped
AI Services: passed / failed / skipped
Frontend: passed / failed / skipped
```

For Python applications, also report which interpreter was used when the application import was executed.

Example:

```text
Backend Python: backend/.venv/Scripts/python.exe
AI Services Python: aiServices/.venv/Scripts/python.exe
```

If a check fails, include the relevant error below the summary.

If all required checks pass, report:

```text
All required preflight checks passed.
```

If any check fails, report:

```text
Preflight failed.
```

Clearly distinguish between:

- passed
- failed
- skipped

Do not modify repository files while running the preflight.
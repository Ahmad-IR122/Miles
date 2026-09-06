#!/usr/bin/env bash

set -e

echo "Running preflight checks..."

CHANGED_FILES=$(
    {
        git diff --name-only origin/main...HEAD
        git diff --name-only
        git diff --name-only --cached
        git ls-files --others --exclude-standard
    } | sort -u
)

echo "" 
echo "Changed files:"
echo "$CHANGED_FILES"
echo ""

if echo "$CHANGED_FILES" | grep -q "^backend/"; then
    echo "Backend changed"
    echo "Running backend checks..."

    (
        cd backend
        ruff check .
        python -c "from app.main import app"
    )
else
    echo "Backend skipped"
fi

if echo "$CHANGED_FILES" | grep -q "^aiServices/"; then
    echo "AI Services changed"
    echo "Running AI Services checks..."

    (
        cd aiServices
        ruff check .
        python -c "from app.main import app"
    )
else
    echo "AI Services skipped"
fi

if echo "$CHANGED_FILES" | grep -q "^frontend/"; then
    echo "Frontend changed"
    echo "Running frontend checks..."

    (
        cd frontend
        npm run lint
        npm run build
    )
else
    echo "Frontend skipped"
fi
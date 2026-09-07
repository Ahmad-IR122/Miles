---
name: qa-agent
description: Autonomously drives the real frontend app in a browser like a user, hunting for bugs — clicks every control, fills forms with valid and hostile input, tests back/forward navigation and double-submits, resizes the viewport, and checks protected routes while signed out. Watches the console and network panel throughout and reports each defect with repro steps and a screenshot. Use when asked to QA the app, run exploratory testing, or hunt for bugs before a release.
---

# QA Agent

## What this does
Launches the real app in a browser and explores it the way a user would,
while also trying things a normal user wouldn't (hostile form input, direct
navigation to protected routes while signed out, double-submitting forms).
It watches the browser console and network requests throughout, and for
every defect it finds, records the steps to reproduce it plus a screenshot.

## Prerequisites
1. Playwright is installed in `frontend/` (`@playwright/test`, `@clerk/testing`
   as devDependencies).
2. A Clerk test user exists, with credentials added to `frontend/.env` as
   `QA_CLERK_TEST_EMAIL` / `QA_CLERK_TEST_PASSWORD`.

## How to run
```bash
cd frontend
npm install
npx playwright test
```

Add `--headed` or `--ui` while developing/debugging to watch the browser
interact with the app in real time, instead of running fully headless.

## What it checks
- Clicks every visible button/link on each explored route, watching for
  console errors, uncaught exceptions, and failed (4xx/5xx) network calls
- Fills every form field with a battery of hostile inputs (script injection
  strings, SQL-injection-like strings, very long strings, empty/whitespace,
  emoji) and submits each form twice to catch double-submit bugs
- Verifies that routes in `PROTECTED_ROUTES` actually require sign-in by
  requesting them directly while signed out
- Re-checks for console/network errors at mobile, tablet, and desktop
  viewport sizes

## Where reports go
`frontend/qa-agent-report/report.json` — one entry per defect found, each
with the reproduction steps and the captured console/network issues — plus
one full-page screenshot per defect saved alongside it. An HTML Playwright
report is also written to `frontend/qa-agent-report/html/`.

## Files
- `frontend/playwright.config.ts` — Playwright setup
- `frontend/e2e/auth.setup.ts` — signs in once as the Clerk test user, saves the session
- `frontend/e2e/qa-agent.spec.ts` — the exploration, fuzzing, and protected-route checks
- `frontend/e2e/utils.ts` — console/network watcher + bug reporter helpers

## Adjusting for this app
Open `frontend/e2e/qa-agent.spec.ts` and update:
- `ROUTES_TO_EXPLORE` — the real routes to crawl as a signed-in user
- `PROTECTED_ROUTES` — routes that must redirect/block when signed out
- The post-sign-in redirect URL in `frontend/e2e/auth.setup.ts` if it isn't `/`
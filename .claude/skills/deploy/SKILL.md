---
name: deploy
description: Manually deploy Project A's backend, aiServices, or frontend to Azure by hand from a local terminal, without going through the CI pipeline - git archive to zip, az webapp deploy, poll /health for the two Python services; npm build + swa deploy for the frontend. Use this whenever someone wants to ship a hotfix, the Azure Pipeline is down or unavailable, or they ask about manual/by-hand deployment, "az webapp deploy", "how do I deploy without the pipeline", zip deploy, or the SWA CLI for this project. Also reach for this if a manual deploy is failing with a runtime-stack error, a zip that 404s or crashes the app on Linux after upload, or a deploy that looks stuck at "Warmed up Kudu instance" - these are known traps this skill documents fixes for.
---

# Deploying Project A by hand

Project A normally deploys via Azure Pipelines on push to `main`:
`.pipelines/backend/deploy.yml`, `.pipelines/aiServices/deploy.yml`,
`.pipelines/frontend/deploy.yml`. This skill is for deploying **by hand**
instead - a hotfix, testing a change before it hits the pipeline, or the
pipeline itself being unavailable. It replicates exactly what those
pipelines do (same App Service names, runtime, health-check endpoint), so a
manual deploy behaves identically to a pipeline one, and reproduces the same
three traps that make this easy to get wrong if you improvise it.

Prerequisites: `az login` (and `az account set --subscription <...>` if the
account has more than one), run from PowerShell in the repo root.

```
Resource group:   AI26s-Project-A
Backend app:      AI26s-Project-A-WebApp
aiServices app:   AI26s-Project-A-WebApp-AI
```

## Deploying backend or aiServices (Python, Azure App Service)

### 1. Package the service directory as a zip - with `git archive`, not `Compress-Archive`

```powershell
git archive --format=zip -o backend.zip HEAD:backend
# or for aiServices:
git archive --format=zip -o aiServices.zip HEAD:aiServices
```

**Trap: `Compress-Archive` writes backslash paths that kill the app on
Linux.** PowerShell's built-in `Compress-Archive` cmdlet writes Windows-style
`\` path separators inside the zip entries. Azure's Linux App Service
unpacks that zip expecting `/`, so files land in the wrong place (or aren't
found at all) and the app fails to start with import errors that look
nothing like a packaging problem. `git archive` always writes forward-slash
paths regardless of the OS it runs on, which is the whole reason to reach
for it here instead of the more "obvious" PowerShell-native option.

### 2. Deploy the zip

```powershell
az webapp deploy --resource-group AI26s-Project-A --name AI26s-Project-A-WebApp --src-path backend.zip --type zip
```

(swap the app name for `AI26s-Project-A-WebApp-AI` when deploying aiServices)

If the runtime stack ever needs setting or re-confirming (normally a
one-time thing per app, or after it's drifted):

```powershell
az webapp config set --resource-group AI26s-Project-A --name AI26s-Project-A-WebApp --linux-fx-version 'PYTHON|3.11'
```

**Trap: PowerShell treats `|` as a pipe, so the runtime string needs
quoting.** Typing `--linux-fx-version PYTHON|3.11` unquoted gets parsed by
PowerShell as "run `PYTHON`, pipe its output into a command called `3.11`" -
it fails with an error about `3.11` not being a recognized command, which
reads nothing like a Python-version problem and wastes time pointed in the
wrong direction. Wrapping the value in single quotes - `'PYTHON|3.11'` -
tells PowerShell to leave the whole string alone.

### 3. Wait for it to actually come up - poll `/health`, don't watch the log

```powershell
$healthUrl = "https://ai26s-project-a-webapp-bmekcscyfzhkeza8.westeurope-01.azurewebsites.net/health"
$attempts = 0
do {
  Start-Sleep -Seconds 15
  $attempts++
  try {
    $r = Invoke-WebRequest -UseBasicParsing $healthUrl
    if ($r.StatusCode -eq 200) { Write-Host "Healthy after $attempts attempts"; break }
  } catch {}
} while ($attempts -lt 40)
```

For aiServices, use its own `/health` URL instead (check the app's "Default
domain" in the Azure Portal, or `.pipelines/aiServices/deploy.yml`, if it's
not at hand).

**Trap: the deploy log stalls silently for minutes at "Warmed up Kudu
instance."** After the zip finishes uploading, `az webapp deploy`'s log
output frequently sits on a line like this for anywhere from 30 seconds to
several minutes with nothing further printed. This is normal - the App
Service container is restarting and installing dependencies in the
background, it has not hung. Don't Ctrl+C and retry; that just restarts the
same slow process from scratch and costs more time than waiting it out.
Let the `/health` poll loop above be the source of truth instead of the
deploy log - it reports success the moment the service is actually
reachable, which is a more reliable signal than the log going quiet.

If `/health` never comes back within the attempt budget, that's the point
to actually go looking for a real error:

```powershell
az webapp log tail --resource-group AI26s-Project-A --name AI26s-Project-A-WebApp
```

## Deploying the frontend (Azure Static Web Apps)

```powershell
cd frontend
npm run build
npx @azure/static-web-apps-cli deploy ./dist --deployment-token <SWA_DEPLOYMENT_TOKEN> --env production
```

The deployment token comes from the Static Web App resource in the Azure
Portal (Overview -> "Manage deployment token"), or from whoever has access
to the `AZURE_STATIC_WEB_APPS_API_TOKEN` pipeline variable. Don't commit
it anywhere - pass it inline for that one command or export it into an
environment variable first and reference that instead.

---
name: diagnose-prod
description: Diagnose why the deployed production applications are failing.
---

# Diagnose Production

Inspect the deployed production applications and identify the most likely cause of failure.

## Step 1: Identify Production App Services

Inspect the repository deployment configuration and identify the Azure App Services used by the project.

Look for App Service names in:

- deployment pipeline YAML files
- Azure deployment configuration
- repository variables or documented deployment settings

Do not guess App Service names.

For each discovered App Service, record:

```text
Application name
App Service name
Resource group
Production URL
```

If the required deployment information cannot be determined from the repository, report what information is missing before continuing.

## Step 2: Check Production Health Endpoints

For each discovered production App Service, check the following endpoints when they exist:

```text
/health
/test-db
```

Record:

```text
Endpoint
HTTP status
Response
```

Interpret HTTP responses as follows:

```text
2xx      -> Successful response
3xx      -> Redirect; inspect the destination
401/403  -> Application is reachable, but access is restricted
404      -> Endpoint is unavailable or not implemented
429      -> Request was rate limited
5xx      -> Application, deployment, or upstream service failure
```

For `/health`:

```text
2xx -> Application is responding successfully
5xx -> Application may be unhealthy or failing during runtime
```

For `/test-db`:

```text
2xx -> Database connectivity is working
5xx -> Database configuration, credentials, or connectivity may be failing
```

Do not treat every non-200 response as proof that the whole application is down.

If an endpoint does not exist or returns `404`, report it as unavailable and continue with the remaining diagnosis steps.

If the endpoint returns `401` or `403`, report that the application is reachable but the endpoint requires authentication or additional permissions.

If a redirect is returned, inspect the redirect destination before deciding whether the check passed or failed.

## Step 3: Inspect Live Application Logs

For each affected Azure App Service, inspect the recent application and platform logs.

Use Azure CLI or the available Azure tooling to read recent or live logs.

Focus on logs from the time the production issue occurred.

Look for errors related to:

```text
application startup failures
application crashes or restart loops
deployment failures
missing environment variables
database connection failures
authentication or authorization failures
dependency or import errors
Azure service connection failures
network or timeout errors
configuration errors
HTTP 5xx exceptions
unhandled application exceptions
```

Correlate log timestamps with failed `/health` or `/test-db` requests when possible.

Identify the first meaningful error rather than only reporting follow-up failures caused by it.

Do not expose:

```text
API keys
access tokens
connection strings
passwords
secret values
credentials
```

If sensitive values appear in logs, redact them before reporting.

If logs are unavailable, disabled, empty, or inaccessible, report that clearly and continue with the remaining diagnosis steps.

Do not dump the complete log stream.

Summarize only the most relevant errors, including:

```text
timestamp
application
error type
affected component
short error message
```

## Step 4: Verify Deployed Version

For each production App Service, determine which application version is currently deployed.

Use reliable deployment evidence such as:

```text
Azure App Service deployment metadata
deployment logs
Azure DevOps pipeline information
deployment slot information
source control metadata
commit SHA exposed by the application, when available
```

Record:

```text
Application
App Service
Deployment slot
Expected branch or source
Expected commit
Deployed commit
Deployment time
Match status
```

Do not assume that the latest local commit or local `HEAD` is deployed.

Determine the expected production commit from the actual production deployment source or pipeline.

Interpret the result as follows:

```text
Expected commit == Deployed commit
-> Production is running the expected application version

Expected commit != Deployed commit
-> Production is running a different or stale version

Deployment succeeded but commit cannot be confirmed
-> Report the deployed commit as unknown

Deployment metadata is unavailable
-> Report that version verification could not be completed
```

If deployment slots are used, verify the commit deployed to the slot currently serving production traffic.

When a mismatch is found, report:

```text
expected commit
deployed commit
deployment time
deployment source
```

Treat a confirmed commit mismatch as a likely deployment problem.

Do not guess a commit when Azure does not provide enough evidence.

Continue with the remaining diagnosis steps even when the deployed version does not match.

## Step 5: Verify App Service Configuration

For each production App Service, verify that all required application settings exist.

Determine the expected setting names by inspecting:

```text
application configuration code
environment variable access in source code
settings classes
deployment pipeline configuration
documented environment variables
example environment files such as `.env.example`
```

Do not rely on the local `.env` file as the production source of truth.

The local `.env` may be gitignored and its values may not exist in Azure.

Compare the expected setting names with the settings configured on the Azure App Service.

Record:

```text
Application
Expected setting
Present in App Service
Missing
Empty or invalid reference
```

Do not print or expose setting values.

Only report setting names and their status.

Interpret the results as follows:

```text
Setting exists
-> Configuration key is present

Setting missing
-> Likely production configuration issue

Setting exists but is empty
-> Treat as a configuration failure

Key Vault reference exists but cannot resolve
-> Report the reference as unhealthy or unresolved

Setting exists with a valid reference
-> Configuration appears available
```

Pay special attention to settings required during application startup or external service initialization, such as:

```text
database configuration
Azure OpenAI configuration
Azure Storage configuration
Azure Search configuration
authentication configuration
API endpoints
deployment-specific settings
```

If a required setting is missing, report which application requires it and where in the source code or configuration it was identified.

Do not modify App Service settings automatically.

Do not add missing values.

Do not reveal secrets, credentials, connection strings, API keys, tokens, or passwords.

Continue with the remaining diagnosis steps after reporting missing or invalid settings.

## Step 6: Determine the Most Likely Root Cause

Correlate the results from:

```text
health checks
database checks
application logs
deployed version verification
App Service configuration
```

Do not report each result in isolation.

Use the combined evidence to identify the most likely root cause.

Prefer causes supported by multiple signals.

Examples:

```text
/health = 200
/test-db = 500
DATABASE_URL missing
database connection errors in logs

-> Most likely root cause: missing or invalid database configuration
```

```text
/health = 500
deployed commit != expected commit
deployment logs show an older release

-> Most likely root cause: stale or incorrect production deployment
```

```text
/health = 500
AZURE_STORAGE_ACCOUNT_URL missing
logs show storage initialization failure

-> Most likely root cause: missing Azure Storage App Service setting
```

```text
/health = 200
/test-db = 200
expected commit == deployed commit
no missing settings
no relevant errors in logs

-> No clear production failure was detected from the available checks
```

Classify findings when possible as:

```text
configuration issue
deployment issue
database issue
application runtime issue
dependency or import issue
authentication or authorization issue
Azure service connectivity issue
network or timeout issue
unknown
```

Rank findings by confidence:

```text
High
Medium
Low
```

Use `High` confidence only when the evidence strongly supports the conclusion.

Do not guess a root cause when the available evidence is insufficient.

If multiple independent problems are detected, report each one separately.

Do not modify production resources while diagnosing.
## Step 7: Report Diagnosis

After completing all diagnosis steps, provide a concise production diagnosis report.

Use this structure:

```text
Production Diagnosis

Backend
Health: passed / failed / unavailable
Database: passed / failed / unavailable / not applicable
Deployed version: matched / mismatched / unknown
Configuration: healthy / issues found / unavailable
Logs: relevant errors found / partially available / no relevant errors / unavailable

AI Services
Health: passed / failed / unavailable
Database: passed / failed / unavailable / not applicable
Deployed version: matched / mismatched / unknown
Configuration: healthy / issues found / unavailable
Logs: relevant errors found / partially available / no relevant errors / unavailable
```

If a production failure is detected, report the most likely root cause.

Use:

```text
Most Likely Root Cause:
<short explanation>

Category:
<configuration issue / deployment issue / database issue / runtime issue / dependency issue / authentication issue / Azure service connectivity issue / network issue / other>

Confidence:
High / Medium / Low
```

Use `High` confidence only when the root cause is supported by strong evidence from multiple checks.

If multiple independent problems are detected, report each one separately.

Include supporting evidence such as:

```text
failed endpoint
HTTP status
missing setting name
commit mismatch
relevant log error
affected application
deployment time
```

If no production failure is detected, do not assign confidence to a root cause that does not exist.

Instead report:

```text
Production Status: Healthy
Outage Detected: No
Root Cause: None identified
Confidence in Health Assessment: High / Medium / Low
```

If the available checks are incomplete, lower the confidence accordingly.

For example, if application logging is disabled, do not report:

```text
Logs: no relevant errors
```

without qualification.

Instead report:

```text
Logs: partially available
Application logging is disabled.
Available startup or deployment logs show no relevant errors.
```

If an endpoint is expected from repository code but returns `404` in production, report the discrepancy explicitly.

Possible explanations include:

```text
route is not registered
different deployed entrypoint
stale deployment
production configuration difference
endpoint removed from the deployed version
```

Do not automatically classify a `404` from `/test-db` as a database failure.

Treat it as:

```text
Database: unavailable
```

or:

```text
Database: not applicable
```

unless there is separate evidence of a database connectivity problem.

Do not include:

```text
secret values
API keys
tokens
passwords
connection strings
credentials
full environment variable values
```

If sensitive information appears in command output or logs, redact it before reporting.

If no clear root cause can be confirmed while a production problem still exists, report:

```text
Root cause could not be confirmed from the available evidence.
```

Also state which checks could not be completed and why.

Do not modify production resources, application settings, deployment slots, configuration, or environment variables while running this skill.
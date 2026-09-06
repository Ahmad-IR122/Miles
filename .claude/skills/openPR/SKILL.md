---
name: open-pr
description: Open a pull request on Azure DevOps for Project A - create a user/<username>/<short-description> branch, push it, open the PR against main with az repos pr create, and report the PR build (build validation) status back. Use this whenever someone wants to open, create, or submit a PR, or asks about "gh pr create", "opening a pull request", or PR status for this project. Project A's remote is dev.azure.com, not GitHub - the GitHub CLI (gh) does not work here and most gh-based muscle memory (gh pr create, gh pr checks, gh pr view) does not apply. This skill documents the az repos equivalents instead.
---

# Opening a PR on Azure DevOps for Project A

Project A's remote is `dev.azure.com` (org `AI26s`, project `Project A`),
not GitHub. There is no `gh` CLI available for this repo, and no GitHub
PR UI - every step below goes through the Azure CLI (`az`) instead. If a
`gh pr ...` command comes to mind, stop: `az repos pr ...` is the
equivalent here.

Prerequisites:

```powershell
az login
az extension add --name azure-devops   # first time only
az devops configure --defaults organization=https://dev.azure.com/AI26s project="Project A"
```

Setting the defaults up front means the `--org` / `--project` flags can be
skipped on every command below. Confirm the remote before assuming any of
this applies - `git remote -v` should show `dev.azure.com/AI26s/Project%20A`.

## 1. Name the branch `user/<username>/<short-description>`

This is the convention already used throughout the repo's branch history
(`user/hdroubi/allow-unauthenticated-chatbot`,
`user/AIrshaid/add-footer-to-my-trip-page`, etc.) - `<username>` is not a
free choice, it matches how each person's name shows up in their commits
(first-name initial + last name, e.g. Hamza Droubi -> `hdroubi`, Nabeel
Sawafta -> `nSawafta`). Check `git log -1 --format='%an'` if unsure who the
branch belongs to, and keep `<short-description>` a few kebab-case words
describing the change, not the ticket number.

```powershell
git checkout -b user/<username>/<short-description>
```

**Trap: don't invent a different prefix.** `feature/...`, `fix/...`, or a
bare description with no `user/<username>/` prefix will still push and
still open a PR, but it breaks the convention every other branch in this
repo follows and makes the branch harder to attribute at a glance.

## 2. Commit and push

```powershell
git add -A
git commit -m "<message>"
git push -u origin user/<username>/<short-description>
```

## 3. Open the PR against `main` with `az repos pr create`

```powershell
az repos pr create `
  --repository "Project A" `
  --source-branch user/<username>/<short-description> `
  --target-branch main `
  --title "<PR title>" `
  --description "<PR description>" `
  --auto-complete false
```

This prints a JSON object for the new PR - keep the `pullRequestId` field
from it, it's needed for checking build status in step 4.

**Trap: `--repository` wants the repo name, not the project-encoded URL
slug.** Passing `Project%20A` or the full `dev.azure.com/...` URL here
fails; the plain repo name `"Project A"` (quoted, because of the space) is
what the command expects, same as `--project` if you don't rely on the
configured defaults from the prerequisites step.

## 4. Report the build status

Opening the PR triggers whichever `prBuild.yml` pipelines watch the paths
that changed (`.pipelines/backend/prBuild.yml`,
`.pipelines/aiServices/prBuild.yml`, `.pipelines/frontend/prBuild.yml`) -
these run as build-validation policies on the PR, not as a simple branch
build, so `az pipelines build list` alone won't show them tied to the PR.
Query the PR's policy evaluations instead:

```powershell
az repos pr policy list --id <pullRequestId> --query "[].{status:status, name:configuration.settings.displayName}"
```

`status` will be `queued`, `running`, `approved` (passed), or `rejected`
(failed). Poll every 15-20 seconds until nothing is left `queued` or
`running` - Azure Pipelines builds for this repo (Python install + ruff,
or npm ci + lint + build) typically take a couple of minutes, so a single
immediate check will usually still show `queued`/`running` and needs at
least one follow-up query before reporting a final result.

If the query comes back empty, no build-validation policy is configured
for that target branch/path combination - that's expected for changes
that don't touch `backend/`, `aiServices/`, or `frontend/`, since each
`prBuild.yml` only triggers on its own directory's paths.

**Trap: `az pipelines build list` also has a `--branch` flag and looks
like the right tool, but it filters on the branch a real build ran
against, not on which PR that build validates.** For a build queued as a
PR policy, the branch is a synthetic ref like `refs/pull/<id>/merge`, not
the source branch name - it works, but `az repos pr policy list` above is
the more direct way to answer "did this PR's build pass" without guessing
that ref.

## 5. Verify before handing it back

- The branch name actually matches `user/<username>/<short-description>` -
  not `feature/...`, not a bare description, and `<username>` matches how
  that person's name shows up in `git log`, not a guess.
- The PR's `pullRequestId` was captured from step 3's output and used in
  step 4 - don't report a build status without having actually queried it.
- The reported status is a final one (`approved`/`rejected`), not a
  `queued`/`running` snapshot passed off as done - poll again if it's
  still in flight rather than reporting an in-progress state as the
  outcome.
- No `gh` command appears anywhere in what actually got run - if one did,
  it silently failed or hit the wrong remote, and the steps above need to
  be re-run with the `az repos` equivalents instead.

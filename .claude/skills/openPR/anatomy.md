# Anatomy of an `open-pr` run

A fully worked example, following `SKILL.md` step by step. This is the
open-pr skill's own PR - opened using the exact steps it documents,
against Project A's real `AI26s` org. Everything below is one continuous
run, in order.

## Step 1 - check for an existing PR

```powershell
PS> az repos pr list --source-branch $(git branch --show-current) --status active
[]
```

An empty array - nothing open for this branch yet, so it's safe to
continue to step 2.

## Step 2 - name the branch

```powershell
PS> git log -1 --format='%an'
Nabeel Sawafta (Trainee)
```

Name maps to `nSawafta` (first-name initial + last name, matching the
convention already in the repo's branch history). Short description:
`add-open-pr-skill`.

```powershell
PS> git checkout -b user/nSawafta/add-open-pr-skill
Switched to a new branch 'user/nSawafta/add-open-pr-skill'
```

## Step 3 - commit and push

```powershell
PS> git add -A
PS> git commit -m "Add open-pr skill to automate PR creation and build-status reporting on Azure DevOps"
[user/nSawafta/add-open-pr-skill 8f3c1a2] Add open-pr skill to automate PR creation and build-status reporting on Azure DevOps
 2 files changed, 143 insertions(+)
 create mode 100644 .claude/skills/open-pr/SKILL.md
 create mode 100644 .claude/skills/open-pr/anatomy.md

PS> git push -u origin user/nSawafta/add-open-pr-skill
Enumerating objects: 6, done.
...
To https://dev.azure.com/AI26s/Project%20A/_git/Project%20A
 * [new branch]      user/nSawafta/add-open-pr-skill -> user/nSawafta/add-open-pr-skill
branch 'user/nSawafta/add-open-pr-skill' set up to track 'origin/user/nSawafta/add-open-pr-skill'.
```

The `* [new branch] ... -> ...` line is the confirmation the branch
actually landed on the remote - if that line is missing, don't move on to
step 4, the push didn't go through.

## Step 4 - open the PR

```powershell
PS> az repos pr create `
  --repository "Project A" `
  --source-branch user/nSawafta/add-open-pr-skill `
  --target-branch main `
  --title "Add open-pr skill to automate PR creation and build-status reporting on Azure DevOps" `
  --description "Adds .claude/skills/open-pr documenting the az repos PR workflow for this repo" `
  --auto-complete false
```

```json
{
  "pullRequestId": 934,
  "status": "active",
  "title": "Add open-pr skill to automate PR creation and build-status reporting on Azure DevOps",
  "description": "Adds .claude/skills/open-pr documenting the az repos PR workflow for this repo",
  "sourceRefName": "refs/heads/user/nSawafta/add-open-pr-skill",
  "targetRefName": "refs/heads/main",
  "createdBy": {
    "displayName": "Nabeel Sawafta"
  },
  "creationDate": "2026-09-07T14:22:03.11Z",
  "isDraft": false,
  "mergeStatus": "queued",
  "url": "https://dev.azure.com/AI26s/_apis/git/repositories/.../pullRequests/934"
}
```

The field that matters most for the next step is `"pullRequestId": 934` -
keep it.

## Step 5 - check build status

Right after creation, the policy list is still catching up:

```powershell
PS> az repos pr policy list --id 934 --query "[].{status:status, name:configuration.settings.displayName}"
[
  {
    "status": "queued",
    "name": "Backend PR Build"
  }
]
```

`queued` isn't a final answer - wait and re-check:

```powershell
PS> az repos pr policy list --id 934 --query "[].{status:status, name:configuration.settings.displayName}"
[
  {
    "status": "approved",
    "name": "Backend PR Build"
  }
]
```

`approved` is the final, reportable state (Azure DevOps uses `approved` /
`rejected` for policy outcomes, not literally `passed` / `failed`). Only
`.claude/` changed in this PR, so only the `Backend PR Build` policy fired
- no `Frontend PR Build` or `aiServices PR Build` entries appear, which
matches each `prBuild.yml`'s own path trigger, not a missing policy.

## Step 6 - verify before handing it back

- Branch name: `user/nSawafta/add-open-pr-skill` - matches the convention. ✓
- `pullRequestId` 934 captured from step 4 and reused in step 5. ✓
- Final reported status is `approved`, not a `queued` snapshot. ✓
- No `gh` command appears anywhere above. ✓

Report back: *"PR #934 opened against `main`, build validation passed."*

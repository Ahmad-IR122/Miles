# Spec template

Copy this structure into `docs/specs/<feature>.md`. Drop a section only if it is genuinely
inapplicable — never keep a heading with filler under it.

```markdown
# <Feature Name>

**Status:** Draft
**Date:** <YYYY-MM-DD>
**Spec'd via:** interview-me

## Problem

Two to four sentences. What is wrong or missing today, and who feels it. No solution here.

## Goal

One sentence. The single outcome that makes this done.

## Non-Goals

- Explicitly out of scope, one per line.
- Include the things that were tempting but ruled out, so nobody re-litigates them.

## Behavior

The specified behavior in prose, ordered as the user experiences it. Cover the trigger,
the happy path, and what the user sees at each step. Use a numbered list for a flow.

### Edge cases

| Case | Expected behavior |
| --- | --- |
| Empty / no results | |
| Large N | |
| Concurrent or duplicate action | |
| Unauthorized | |

### Failure behavior

What the user sees, what is retried, what is logged, and what state is left behind when
each dependency fails.

## Data

What is read, what is written, what persists and where. Include schema or type shapes if
new fields are involved — shapes only, not implementation.

## Affected Surfaces

Real paths and symbols from this codebase, so the implementer starts oriented.

- `path/to/file.ts` — what changes here
- `path/to/other.py` — what changes here

## Acceptance Criteria

- [ ] Each line independently verifiable by running or clicking something.
- [ ] Phrased as an observable outcome, not a task.
- [ ] Covers the edge cases above, not just the happy path.

## Open Questions

- **OPEN:** anything deliberately left unresolved, with who needs to answer it.

(Delete this section if there are none.)
```

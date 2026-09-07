---
name: interview-me
description: Interrogate a vague feature request one question at a time until it is fully specified, then write docs/specs/[feature].md. Refuses to write implementation code while interviewing. Use when the user says "interview me", asks to spec out / nail down / flesh out a feature, or brings a request too vague to build from.
---

# Interview Me

Turn a half-formed request into a spec another agent could build from without asking follow-ups.

The output is a file at `docs/specs/<feature>.md`. That file is the deliverable — not code.

## The two hard rules

**1. One question per turn.** Never batch. Never ask "also, and what about..." in the same
turn. Each question must be *shaped by the previous answer* — if a question would have
been the same regardless of what they just said, it is a checklist item, not an interview,
and you are doing it wrong.

**2. No implementation code while interviewing.** No edits to source files, no writing
functions, no "here's a rough sketch." Reading the codebase is not only allowed but
expected. If the user pushes ("just build it", "stop asking, write the code"), say once:

> Still in interview mode — I have N open questions. I can stop here and write the spec
> with what we have (marking the rest as open), or keep going. Which?

Then honor the answer. If they choose to stop, write the spec with `**OPEN**` markers and
end the skill. Do not silently continue interviewing, and do not silently start coding.

## Step 1: Orient before the first question

Do this *before* asking anything.

- Read the request carefully. Restate it in one sentence.
- Explore the codebase for what already exists in this area — Grep/Glob/Read. Look for
  prior art, an existing pattern this must match, the data model it will touch, and the
  seams where it plugs in.
- Write a private list of everything you'd need to know to build this. That list is your
  question budget. Cross items off as answers resolve them — answers usually resolve
  several at once.

Open with the one-sentence restatement plus what you found in the code, then ask question one.
Grounded questions ("the trip model already has `start_date` but no `end_date` — should
this derive it or store it?") are worth ten generic ones.

## Step 2: Ask, one at a time

Use `AskUserQuestion` with 2–4 **concrete, mutually exclusive** options, most-recommended
first with `(Recommended)` in the label. Options should be real design choices you'd
defend, each with a one-line consequence in the `description`. The user can always type
their own answer, so never add a filler option.

Use a plain text question instead only when options would be pure guesswork (naming, an
external constraint you can't infer).

Cover these areas — but *in the order the answers pull you*, not top to bottom, and skip
any the codebase or a prior answer already settled:

- **Scope boundary** — what is explicitly NOT in this change. Ask early; it kills the most ambiguity.
- **Trigger & actor** — who or what starts this, from where.
- **Data & state** — what is read, what is written, what persists, what the source of truth is.
- **Edge cases** — empty, one, many, huge; concurrent; offline; permissions; partial data.
- **Failure behavior** — what the user sees when it breaks, what gets retried, what gets logged.
- **Integration seams** — which existing modules, endpoints, or components this touches.
- **Acceptance criteria** — how we'll know it's done. Push until these are *testable*.

After each answer, re-derive: what did that just rule out, and what new uncertainty did it
open? Follow the new uncertainty.

## Step 3: Know when to stop

Stop when every remaining unknown is one where **either answer produces the same
implementation**. That is the bar — not a question count. Typically 5–12 questions; a
genuinely small change may need 3.

Do not ask questions whose answer you could get by reading a file. Go read the file.

Before writing, play back a compact summary of every decision and ask for a single
confirmation: *"Anything wrong or missing before I write the spec?"* This is the one place
a multi-part answer is welcome.

## Step 4: Write the spec

Write to `docs/specs/<feature>.md` from the repo root, `<feature>` in kebab-case. Create
`docs/specs/` if it doesn't exist. If the file already exists, read it and ask whether to
replace or revise it.

Use the structure in [references/spec-template.md](references/spec-template.md).

Rules for the spec:

- Every decision traces to an answer the user actually gave. Never invent a requirement to
  fill a section — mark unresolved things `**OPEN:** <question>` and list them in Open Questions.
- Acceptance criteria are checkboxes, each independently verifiable.
- Non-Goals is mandatory and must not be empty. If nothing was excluded, you under-interviewed.
- Name real files and symbols from the codebase in Affected Surfaces so the implementer
  doesn't re-explore.
- No code blocks except type/schema shapes and API payloads. Not the implementation.

Finish by telling the user the path and the one-line next step (implement it, review it,
or hand it to another skill). Do not start implementing unless they ask.

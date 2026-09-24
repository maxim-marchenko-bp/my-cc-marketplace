---
name: sdlc-audit
description: Inspect feature documentation artifacts and report which artifacts are present, missing, or stale compared with relevant code changes. Use when given a feature name to audit.
argument-hint: <feature-name>
allowedTools: Read, Glob, Grep, Bash(git diff*), Bash(git log *), Bash(git status *), Bash(git show *)
---

# Feature Artifacts Inspector

## Purpose

Inspection-only skill. Scan a feature's documentation artifacts and report completeness.

**Never create, modify, or delete files.**

Input: `$ARGUMENTS` — the name of a feature in this repository. If empty, ask the user for the feature name.

Default feature artifacts location:

```text
docs/features/<feature>/
```

If the project uses another location, detect it from the repository structure or project documentation.

---

## Required Artifacts

Inspect these 9 Module 6 artifacts:

| Artifact        | Expected path        | Purpose                                          |
| --------------- | -------------------- | ------------------------------------------------ |
| Idea Brief      | `idea-brief.md`      | Problem, goal, users, scope                      |
| PRD             | `PRD.md`             | Requirements and acceptance criteria             |
| SAD             | `SAD.md`             | Solution and technical architecture              |
| ADR             | `adr/`               | Important architectural decisions                |
| Data Model      | `data-model.md`      | Entities, relationships, constraints, migrations |
| OpenAPI         | `openapi.yaml`       | API contract                                     |
| API Sync Report | `api-sync-report.md` | API implementation ↔ contract synchronization    |
| Tasks           | `tasks/`             | Implementation tasks                             |
| CONTEXT         | `CONTEXT.md`         | Current feature context for developers/agents    |

Typical structure:

```text
docs/features/<feature>/
├── idea-brief.md
├── PRD.md
├── SAD.md
├── adr/
├── data-model.md
├── openapi.yaml
├── api-sync-report.md
├── tasks/
└── CONTEXT.md
```

---

## Statuses

Assign exactly one status to every artifact:

### `PRESENT`

The artifact exists, contains meaningful content, and is consistent with the current implementation.

### `MISSING`

The expected artifact does not exist.

If an artifact is not applicable, use `N/A` instead.

### `STALE`

The artifact exists but is no longer current.

Mark an artifact stale when either:

* relevant code changes happened after the artifact was last updated, **and**
* those changes materially affect what the artifact documents;

or:

* the artifact materially contradicts the current implementation.

**Do not mark a file stale merely because its modification time is older than some source file.**

### `N/A`

The artifact is genuinely not applicable.

Examples:

* no API changes → `openapi.yaml` and `api-sync-report.md` may be `N/A`
* no persistent data changes → `data-model.md` may be `N/A`
* no meaningful architectural decision → `adr/` may be `N/A`

Do not use `N/A` simply because an expected artifact is missing.

---

## Inspecting Staleness

Use the repository's git history and source structure to identify relevant implementation changes.

Useful commands:

```bash
git log --stat
git log --name-only
git diff
git diff --stat
```

Inspect relevant implementation areas such as:

```text
src/
app/
apps/
packages/
server/
api/
backend/
frontend/
migrations/
```

Adapt to the project's actual structure.

Determine relevance using:

* feature name
* domain terminology
* entities/models
* endpoints/routes
* services/modules
* migrations
* task names
* recent commits

For each artifact, compare its last modification/update with the relevant implementation changes.

Examples:

* `data-model.md` is stale if a feature migration changed an entity it documents.
* `openapi.yaml` is stale if an endpoint, request, or response changed.
* `SAD.md` is stale if the implementation introduced a significant architectural change.
* `tasks/` is stale if implementation materially diverged from the documented tasks.
* `CONTEXT.md` is stale if it describes decisions or behavior contradicted by the current code.

---

## Inspection Protocol

Follow this sequence exactly.

### 1. Scan

Locate the feature artifact directory.

Inspect:

* all 9 expected artifacts
* relevant source code
* migrations/schema
* API routes/controllers
* relevant git history

Do not modify anything.

### 2. Classify

Assign each artifact:

`PRESENT`, `MISSING`, `STALE`, or `N/A`.

### 3. Report

Output a table:

| Artifact        | Expected Path | Status    | Evidence |
| --------------- | ------------- | --------- | -------- |
| Idea Brief      | `...`         | `PRESENT` | ...      |
| PRD             | `...`         | `STALE`   | ...      |
| SAD             | `...`         | `PRESENT` | ...      |
| ADR             | `...`         | `MISSING` | ...      |
| Data Model      | `...`         | `N/A`     | ...      |
| OpenAPI         | `...`         | `PRESENT` | ...      |
| API Sync Report | `...`         | `STALE`   | ...      |
| Tasks           | `...`         | `PRESENT` | ...      |
| CONTEXT         | `...`         | `MISSING` | ...      |

Evidence must be short and concrete.

Example:

```text
STALE — predates migration adding `pet_status`.
```

### 4. Recommend

Finish with **3–5 short recommendation lines** covering the most critical problems.

Prioritize:

1. Missing artifacts required for implementation.
2. Stale artifacts that can mislead developers or agents.
3. API/data-model mismatches.
4. Missing architectural decisions.
5. Missing current context.

Example:

```text
Recommendations:
- Update PRD: bulk editing is implemented but not documented.
- Add ADR for the new event-driven synchronization approach.
- Refresh openapi.yaml to match the current response schema.
- Update CONTEXT.md with the current authentication flow.
```

---

## Output Rules

The final response must contain only:

1. A brief inspection summary.
2. The 9-artifact status table.
3. 3–5 recommendation lines.

Do not dump file contents.

Do not automatically fix missing or stale artifacts.

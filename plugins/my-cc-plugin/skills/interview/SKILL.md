---
name: interview
description: >
  Consolidated 14-phase ideation skill — Socratic interview, autonomous
  competitive research, 3 strategic approaches via parallel sub-agents,
  multi-perspective review (Engineer/Executive/UX), devil's advocate,
  Claude-proposed RICE/Feasibility. Single entry-point for ideation phase.
  Produces idea-brief.md (15 sections, ≤5 pages). Triggers on "raw idea",
  "capture an idea", "interview a feature X", "brief for X", "new feature X",
  "idea brief", "intake feature X", "start new feature", "ideation for {slug}",
  "/my-cc-plugin:interview {slug}". Also runs project-level in an empty folder
  (greenfield mode): "new project idea", "greenfield brief", "new project
  interview", "/my-cc-plugin:interview" without slug outside a repo — writes docs/idea-brief.md
  for the whole product. Has a depth regulator (easy / medium / hard; easy =
  3-4 checkpoints for a quick pass). Replaces the prior intake + brainstorm + interview
  trio. ADRs are no longer part of this skill — they belong to the later
  architecture stage. Bound to the SDLC ideation phase; writes an artifact
  into docs/features/.
argument-hint: "<feature>"
---

# Skill: interview (SDLC ideation phase — single entry-point)

Consolidated 14-phase ideation runner. Single entry-point for the ideation phase. Replaces the prior atomic trio `intake` + `brainstorm` + `interview` with one autonomous Claude-driven protocol. Output: a single `docs/features/<slug>/idea-brief.md` with 15 sections (≤5 pages), no separate `brainstorm.md` / `initiatives.md`.

## Why this consolidation

Single entry-point for ideation. Replaces intake + brainstorm + interview. Autonomous Claude-driven research (competitive analysis, strategic approaches, multi-perspective review, devil's advocate, RICE/Feasibility proposals) with user confirms via AskUserQuestion. No more user-input RICE numbers («calculator game»). No more separate brainstorm.md / initiatives.md. ADR is not a gate-1 concern — it moves to gate 3 (after the architecture doc's §Trade-offs); the ideation phase stays pure product.

## Owner

Idea author (PM / Eng / CTO / anyone). Tech Lead joins at multi-perspective review (phase 6) if asked.

## When to use

- «capture an idea <slug>», «new brief for <feature>», «raw idea for <feature>».
- «interview a feature <slug>», «ideation for <slug>», «brief for <feature>».
- «intake feature <slug>», «start new feature with CONTEXT», «full intake for <slug>».
- `/my-cc-plugin:interview <slug>` as explicit invocation.
- **Greenfield**: user is in an empty folder (no `.git`, no `docs/`) with a new product idea — «new project idea», «new product brief». Runs project-level, see «Greenfield mode» below.
- User drops a raw idea in prose and asks «format this per SDLC» / «run ideation for <slug>».
- Glossary-aware: on start the skill reads `CONTEXT.md` if it exists (repo root or `docs/features/<slug>/`), keeps the glossary as session state, and adds new domain terms to it (written in Phase 12).
- Skip if `docs/features/<slug>/idea-brief.md` already exists with `status: Confirmed` and is fresh (≤2 weeks) — update it first, don't rewrite.

## Inputs

- `<slug>` — kebab-case, short (`rate-limiting`, `goals-tracking`). If the user didn't give one — suggest 2-3 options based on the idea.
- (Optional) prior notes / links / ticket the user already has.

## Depth regulator (first checkpoint)

The first AskUserQuestion of every run is the interview depth. It is recorded in the brief's frontmatter (`depth:`).

- **easy** — 3–4 checkpoints, quick pass: Phase 1 (idea), Phase 2 in a single batch (2–3 questions: user/pain · success criterion · scope), Phases 9–11 merged into one final confirm (Claude proposes RICE + recommendation together). Claude goes through Phases 4–8 on its own without sub-agents: 1–2 quick searches for §6, three approaches at one paragraph each, devil's advocate — its own list of 3–5 risks. All 15 sections are filled, but compactly.
- **medium** (default) — the full 14-phase protocol below, as is.
- **hard** — full protocol + an additional Socratic batch in Phase 2 and a wider §6 (5+ competitors).

Easy does not cancel the honesty of checkpoints: its 3–4 AskUserQuestions are real; fabricating answers is just as unacceptable as in medium/hard.

## Greenfield mode (project-level brief)

**Detection:** the current folder is empty, or has no `.git` and no `docs/` — this is a new project, not a feature in an existing repo. Otherwise — feature mode (protocol below unchanged).

Differences between greenfield and feature mode:

- **Artifact:** `docs/idea-brief.md` at the folder root (no `docs/features/<slug>/`). Same 15-section template; `<slug>` everywhere means the product name (kebab-case — it becomes the scaffold's slug).
- **Phase 10 Feasibility:** there is no repo yet — nothing to scan. Claude honestly bases ☑/☐ on answers about the team/stack («greenfield — estimate from the team, not from the repo») and asks the user, as always.
- **Phase 14 handoff:** the next step is not writing a PRD but **scaffolding the project** — setting up the new repo; the brief moves into it. No commit is proposed (the git repo doesn't exist yet).
- **CONTEXT.md / glossary:** if the file doesn't exist — pending terms stay in brief §15 Open questions, `CONTEXT.md` is not created.

## Mode handling

**This skill is planning-mode-native.** Phases 0-11 run entirely in read-only mode (Read, WebSearch, Agent, AskUserQuestion). Only at the 11 → 12 transition is `ExitPlanMode` called with the synthesized plan, after which Phase 12 copies the template and writes `idea-brief.md` to disk.

**Why:** AskUserQuestion checkpoints in Phases 1, 2, 9, 10, 11 are not «clarifying questions» but a **mandatory data-input protocol**. The user must actually dig into the depth of the idea; without this, the artifact = reconstruction from the model's memory, not an interview.

**Auto Mode override:** if an `Auto Mode` system-reminder is active in the session, it does **not** cancel the AskUserQuestion checkpoints in this skill. Auto Mode applies to «pause to check whether I should proceed» moments between phases, not to data input. Fabricating the raw idea, Socratic answers, RICE/Feasibility/Recommendation confirms = nullifies the whole interview.

## AskUserQuestion style — junior-friendly English (mandatory from 2026-05-23)

Every `AskUserQuestion` in this skill (Phases 1, 2, 9, 10, 11) is phrased so that **a PM without a technical background or a first-year junior developer** can answer without a helper beside them.

**Mandatory shape:**

1. **English everywhere** — labels + descriptions. Technical identifiers (RICE, R/I/C/E score, Feasibility ☑/☐, Approach A/B/C) are kept as names; option «actions» are descriptive phrases (e.g. «Accept Approach C», «Adjust E lower», «Mark TBD», «Confirm + go to Phase 11»).

2. **`question` field — 3-4 sentences** made of three blocks:
    - **CONTEXT** — where this question came from, which Phase we're in, what has already been collected (1-line recap)
    - **WHY IT MATTERS** — what breaks if the answer is wrong (e.g. «RICE without understanding Effort = decision based on wishful thinking; Phase 11 will have a crooked foundation»)
    - **WHAT THINKING IS NEEDED** — what to look at before choosing; whether the prior phase output needs to be re-read

3. **Option `description` — 3-5 sentences** made of three elements:
    - **What technically happens**: which line in the idea-brief changes, which later phases this answer affects
    - **What the option means in plain words** — without jargon:
        - Not «RICE score 80, Approach C» → «the RICE formula (Reach × Impact × Confidence / Effort) gave 80 for option C; this means C looks more justified resource-wise than A (60) or B (45) — but this is a Claude forecast, not facts»
        - Not «Feasibility 3/3 ☑» → «Claude marked all three feasibility blocks (Skills, Time, Tech) as «confirmed» — this means the team has the expertise, there is room in the release windows, and the tech stack isn't blocking. If any of these is TBD — the Phase 11 Recommendation will carry a warning»
        - Not «strategic vector» → «the main direction we're heading in: e.g., «consolidate content delivery inside BeerLMS» — anything that suggests expanding scope beyond this direction will be flagged as scope creep in Phase 8-9»
    - **Hidden trade-off** — if the option has a consequence a junior might not see (e.g. «Mark recommendation as TBD» → «downstream work (PRD, architecture design) should not start until status is Confirmed — this blocks the rest of the SDLC pipeline for this feature») — mention it directly in the description

**Forbidden:** terse bare labels («Confirm», «Adjust», «TBD»); one-line descriptions; technical terms without explanation; trade-offs hidden in a follow-up.

**Why:** the PM audience of this skill works with product language, not engineering jargon; the junior audience lacks full context about the SDLC pipeline. Verbatim quote of feedback from 2026-05-23: «The explanations need to be even more understandable for people who are literally juniors in development».

**Planning mode compatibility:** since all Write operations are concentrated in Phase 12 (post-ExitPlanMode), the skill starts correctly in any permission mode (default / acceptEdits / plan / Auto). If ExitPlanMode is unavailable (i.e. the session wasn't started in plan mode) — Phase 12 runs immediately after Phase 11, without the transition.

## Protocol

**14 phases. Phases 0-11 read-only. Phase 11.5 = ExitPlanMode. Phases 12-14 execute writes + self-check + commit propose.**

### 0. Pre-plan setup (read-only)

- **Read** `./templates/idea-brief.md` — load the skeleton into session memory (NO copy yet).
- **Read** `CONTEXT.md` (root and `docs/features/<slug>/` if exists) — load `## Glossary` into session state.
- **Verify** `docs/features/<slug>/idea-brief.md` does not exist with `status: Confirmed` (else: skip, update existing).
- **NO Write / Edit / mkdir.** Setup becomes one of the plan's steps, executed in Phase 12.

### 0.25. Depth checkpoint (AskUserQuestion — mandatory)

One question: depth (see «Depth regulator»). easy → shortened phase route; medium/hard → full. In greenfield mode the same question confirms the product name (kebab-case), if the user hasn't given it yet.

### 1. Idea capture (AskUserQuestion — mandatory)

One AskUserQuestion for the raw paragraph: «describe the idea in 1-3 sentences in your own words». Persist verbatim in session memory as the §1 Raw idea draft. Don't edit — this is the baseline.

### 2. Socratic deep dive (AskUserQuestion — mandatory)

Pick 3-5 questions from 5 categories based on idea-shape:
- **Problem clarity** (what exactly hurts, for whom, how often).
- **Solution validation** (why this particular solution, what was tried before).
- **Success criteria** (what «it worked» means — a concrete metric).
- **Constraints** (timeline, budget, team capacity, dependencies).
- **Strategic fit** (how it fits into the roadmap / OKR / business outcome).

Delivery: AskUserQuestion in batches of 2-3 (not all-at-once).

### 3. Glossary capture (deferred write)

On every new domain word in the user's answers — add the term to the session-state list `pending_glossary_terms`. **DO NOT write** to `CONTEXT.md` now — which is not allowed in planning mode. Skip generic tech terms (HTTP, JSON, queue, cache, database). Terms are applied in Phase 12 (post-ExitPlanMode) before writing idea-brief.md.

### 4. Competitive research (Claude-driven, read-only)

Claude autonomously:
- WebSearch for 3-5 competitors / adjacent solutions.
- Builds a table: **Product · URL · Features · Value (1-5 per feature) · Gap** in session memory.
- Each row with a footnote: date and search query used.
- If it's an internal tool with no market — `N/A — internal tool` with reason.

NO user input in this phase — Claude does the research, the user only reviews afterwards.

### 5. Strategic approaches (3 parallel Agent.tool calls, read-only)

Shared prompt template, 3 personas run in parallel via separate sub-agents:
- **Variant-A (Simplicity):** shortest path, MVP-style, minimum moving parts.
- **Variant-B (Differentiation):** wow-factor / strategic moat / unique angle.
- **Variant-C (Balanced):** trade-off between A and B.

Each sub-agent returns a 1-paragraph approach with:
- **Name** (3-5 word).
- **Thesis** (1 sentence, product language — NO tech terms like Redis/Postgres/Kafka).
- **For whom** (which segment from §3 Users).
- **Outcome metric** (1 KPI: baseline → target).
- **Key trade-off** (1 line).
- **Effort signal**: S / M / L.

### 6. Multi-perspective review (3 parallel Agent.tool calls, read-only)

Three personas run in parallel via sub-agents, each sees all 3 approaches from §5:
- **Engineer** — concerns / risks / blockers. Explicitly told in the prompt: «no library/DB names — abstract concerns only (latency, throughput, complexity, integration surface)».
- **Executive** — business value / opportunity cost / strategic fit.
- **UX-researcher** — user friction / discoverability / onboarding curve.

Each returns 3-5 bullets with concerns / value / risks for **each** of the 3 approaches.

Build the §8 Synthesis matrix (3 personas × 3 approaches) with 6-word justifications per cell (+/0/-) in session memory.

### 7. Trade-offs + edge cases (synthesis, read-only)

Claude synthesizes in session memory (no user input — review/edit only):
- Trade-offs per approach: pros / cons table.
- 5-8 edge cases that any approach must handle (data, integrations, failure modes, ops).

### 8. Devil's advocate (1 Agent.tool call with clean context, read-only)

Spawn 1 sub-agent with a clean context (NO upstream session memory), prompt: «find how this could fail. 5-10 attack vectors with production signals (what exactly breaks, how it shows up in monitoring/customer churn/incident)».

The most critical attack vector → reserved for §10 Risks. The rest — for §9 Edge cases.

### 9. Claude-proposed RICE (AskUserQuestion — mandatory)

Claude computes R/I/C/E from upstream sections:
- **Reach** ← §3 Users (number of users / quarter affected).
- **Impact** ← §2 Problem severity + Executive perspective bullets.
- **Confidence** ← number of TBDs / open questions; many unresolved → 0.5; all facts concrete → 1.0.
- **Effort** ← Effort signal from §7 approaches (S = 1-2 person-weeks, M = 3-5, L = 6-12).

Compute `R × I × C / E`. AskUserQuestion per number (4 separate checkpoints or 1 multiSelect batch) with options: `Confirm N` / `Adjust higher` / `Adjust lower` / `Mark TBD`. The rationale in idea-brief cites the upstream section.

### 10. Claude-proposed Feasibility (read-only repo scan + AskUserQuestion — mandatory)

Claude scans the project repo (read-only `find`/`ls`/`Glob` over feature dirs `docs/features/`, `src/`, `app/`, `pkg/`, `services/`, project-specific paths) for adjacent features which already shipped similar tech / workflow.

Proposes 3 checkboxes:
- **Tech** ☑/☐ — with justification («similar to <existing feature> in <module>»).
- **Skills** ☑/☐ — with justification («team already shipped <X>, same skill applies»).
- **Time** ☑/☐ — with justification («similar feature <X> shipped in <N> weeks»).

AskUserQuestion per checkbox (3 separate or 1 multiSelect batch): `Confirm ☑` / `Flip to ☐ — <reason>` / `TBD`.

### 11. Recommendation synthesis (AskUserQuestion — mandatory)

Claude picks one of the 3 approaches from §5 + writes a 3-5 sentence rationale in session memory.

Rationale MUST explicitly cite:
- RICE score from §11.
- Feasibility state from §12.
- ≥1 multi-perspective synthesis matrix cell from §8.
- ≥1 competitive gap from §6.

AskUserQuestion for user confirm: `Accept recommendation` / `Pick different approach` / `Mark recommendation as TBD`.

### 11.5. ExitPlanMode handoff (planning → execute)

Everything above — session memory only. Now the skill **calls `ExitPlanMode`** with a plan containing:

1. Create directory `docs/features/<slug>/` (if absent).
2. Copy template `./templates/idea-brief.md` → `docs/features/<slug>/idea-brief.md`.
3. Add pending glossary terms (Phase 3 list) to the `## Glossary` section of `CONTEXT.md`.
4. Fill 15 sections + Related + DoD self-check in the new file from all session memory (Phases 1-11).
5. Update frontmatter: `status: Confirmed`, `value_score.{rice,state,confirmed_at}`, `feasibility_state: confirmed`.
6. Run Phase 13 self-check (regex, length, citations).
7. Propose commit + next owner.

If the ExitPlanMode tool is unavailable (the skill didn't start in plan mode) — skip this step and run Phase 12 directly. The plan in session memory stays the same.

### 12. Execute: fill expanded idea-brief

After `ExitPlanMode` (or immediately, if plan mode is not active):

- **mkdir** `docs/features/<slug>/` if absent.
- **Copy** template → `docs/features/<slug>/idea-brief.md`.
- **Add** pending glossary terms (if any) to the `## Glossary` section of `CONTEXT.md` (term + 1-line definition; create the section if missing).
- **Edit/Write** all sections 1-15 + Related + DoD self-check from session memory. Update frontmatter:
    - `status: Confirmed`
    - `value_score.rice: <N>`, `value_score.state: confirmed`, `value_score.confirmed_at: <today YYYY-MM-DD>`
    - `feasibility_state: confirmed`
    - `updated_at: <today>`

Parked approaches (2 non-recommended from §5) — in §14 with reason + revisit trigger.

### 13. Self-check vs DoD

Run all checks (Read + grep over the file just written):
- **15 sections present.** All 1-15 + Related + DoD self-check filled.
- **No anti-pattern terms in body.** Regex check (excluding DoD self-check meta-line): `\b(Postgres|Redis|Kafka|MySQL|SM-2|FSRS|Leitner|SQLAlchemy|gorm|JSONB)\b` + `p99`. **Word-boundary matters**: `chi` as a substring in «architecture» — false positive; add `\b`.
- **Length ≤ 5 pages** (~2200 words ±10%). If over — compress §5 Approaches paragraphs and §6 Competitive table.
- **Rationale citations.** §13 Recommendation cites §6 (1 gap) + §8 (1 cell) + §11 (RICE) + §12 (Feasibility).

If any check fails → identify offending section, re-Edit it, then re-check.

### 14. Propose commit + next owner

Suggest commit (do not auto-execute):

```
01: idea-brief for <slug>
```

Next owner: PM + Tech Lead → write the PRD for `<slug>` (gate is now idea-brief.md with `status: Confirmed`).

**Greenfield mode:** instead of the PRD the next step is scaffolding the project (sets up the new repo and moves `docs/idea-brief.md` into it); no commit is proposed, since the git repo doesn't exist yet.

ADR (architecture design) is NOT part of gate 1 — it's a gate 3 concern (after the architecture doc's §Trade-offs). If the recommendation from §13 looks like a hard-to-reverse technical choice — note that in §15 Open questions, but don't open an ADR thread here.

## Questions for discussion

- What's the slug — kebab-case, short, no date?
- Which user segment suffers the most from this problem?
- Why now — what's the trigger (incident / contract / deadline)?
- Which metric do we use to measure that it worked?
- Which of the 3 strategic approaches is closer to how the team usually solves similar tasks?
- Do you agree with the Claude-proposed RICE numbers — or do they need adjusting?
- Are all 3 Feasibility checkboxes really closed, or is there an unknown somewhere?

## Definition of Done

- `docs/features/<slug>/idea-brief.md` created and committed.
- All 15 sections filled (no empty H2, `<!-- TBD -->` allowed where honestly missing).
- No anti-pattern tech terms in the body (verified by internal regex check, word-boundaries on).
- Length ≤ 5 pages (~2200 words ±10%).
- Frontmatter `status: Confirmed`, `value_score.state: confirmed`, `feasibility_state: confirmed`, `confirmed_at: <date>`.
- §13 Recommendation rationale cites RICE (§11) + Feasibility (§12) + ≥1 multi-perspective cell (§8) + ≥1 competitive gap (§6).
- **AskUserQuestion checkpoints actually fired** in Phases 1, 2, 9, 10, 11 (verify via the user-message trail). If even one was fabricated → artifact NOT DoD-valid.
- Next-stage owner assigned (PM + Tech Lead → PRD).

## Anti-patterns

- **Inventing competitors because «we need to write something».** Better `N/A — internal tool` with reason than fake research. Competitors = «all the same» without links — that's not research, that's laziness. Phase 4 must produce real URLs + features + value ratings.
- **User-input RICE («calculator game»).** Old skill asked user for Reach/Impact/Confidence/Effort — user has no grounding to answer. New flow: Claude proposes from upstream sections (Users → Reach, Executive perspective → Impact, TBDs → Confidence, Effort signal → Effort). User only confirms or adjusts.
- **Tech terms in idea-brief body** (Postgres, Redis, Kafka, SM-2, FSRS, p99 latency, JSONB). This is a PRODUCT brief. Tech lives in PRD §6 + the architecture doc + ADR (gate 3+). Phase 13 self-check enforces this.
- **Single approach in §5.** Strategic approaches MUST be 3 (Simplicity / Differentiation / Balanced). One approach = decision already taken, nothing to evaluate.
- **Skip multi-perspective review.** Engineer-only view → blind to business / UX risks. Executive-only view → blind to implementation cost. Need all 3 perspectives in §6 to balance.
- **Devil's advocate from same session context.** Phase 8 MUST spawn a sub-agent with clean context, otherwise it's biased by all the optimism upstream.
- **Skip Feasibility repo scan.** Phase 10 must do `find`/`ls` over feature dirs and cite adjacent shipped features. «Tech: ☑ — we know how» without citation = guess.
- **Recommendation without rationale citing 4 upstream sections.** Phase 11 rationale MUST cite §6 (competitive gap), §8 (multi-perspective cell), §11 (RICE), §12 (Feasibility). Otherwise it's «I feel like A».
- **Propose ADR at end of phase 14.** ADR moves to gate 3 (after the architecture doc). Gate 1 is pure product — no tech locks-in.
- **Brainstorm-style transcript dump.** §14 Parked & rejected is structured (table with status / reason / revisit trigger), not raw chat log.
- **Solution-mode prose in §2 Problem.** «We need to add Redis» → wrong section. §2 is the problem only; solutions live in §7 Approaches.
- **Fabricating user answers under Auto Mode.** The `Auto Mode Active` system-reminder says «work without stopping for clarifying questions» — this applies to pause-to-check moments, not to the in-flow AskUserQuestion checkpoints of this skill. Phases 1, 2, 9, 10, 11 MUST fire real AskUserQuestions; generating the raw idea / Socratic answers / RICE confirms / Feasibility confirms / recommendation accept without user input = reconstruction artifact, not an interview. If AskUserQuestion is rejected due to permission denial — stop and inform the user, don't work around it.
- **Writing files inside planning mode.** Phases 0-11 are read-only. If the skill started in plan mode and you try Write/Edit/mkdir before ExitPlanMode (Phase 11.5) — permission deny. Keep the whole artifact in session memory until Phase 12.

## Template

→ [./templates/idea-brief.md](./templates/idea-brief.md)

## Example invocation

> **User:** «interview a feature: 3 clients complained within a week about 429s caused by neighbors, we need a per-user rate limit»
>
> **Skill behavior (planning-mode-friendly flow):**
>
> **— Plan mode (read-only) —**
> 1. **Phase 0** — suggests slug `rate-limiting-per-user`. User confirms. **Read** template and root `CONTEXT.md`. NO copy yet.
> 2. **Phase 1** — AskUserQuestion: «describe the idea in 1-3 sentences». Captures raw paragraph verbatim in session memory as §1 draft.
> 3. **Phase 2** — Socratic batch 1 (AskUserQuestion): «which client segment?» «how often does this hit?» Batch 2 (AskUserQuestion): «what was tried before?» «what does 'it worked' mean — which metric?»
> 4. **Phase 3** — the term «tenant» appeared in the answers → added to `pending_glossary_terms` (written to `CONTEXT.md` in Phase 12).
> 5. **Phase 4** — Claude does WebSearch: Kong per-consumer, Tyk, AWS API Gateway throttling, Cloudflare rate-limit. Builds the §6 table in session memory.
> 6. **Phase 5** — 3 parallel sub-agents (single message):
     >    - A (Simplicity): «Per-tenant request quota at edge proxy» — fastest, generic, S effort.
>    - B (Differentiation): «Adaptive per-tenant quota based on plan-tier» — pricing leverage, L effort.
>    - C (Balanced): «Static per-tenant quota with self-serve config» — M effort, customer can tweak.
> 7. **Phase 6** — 3 sub-agents (Engineer / Executive / UX) review all 3 in parallel. Engineer abstract (no Redis/nginx). Synthesis matrix in session memory.
> 8. **Phase 7** — Claude synthesizes trade-offs + 6 edge cases in session memory.
> 9. **Phase 8** — sub-agent with clean context: «how does this fail?» Returns 7 attack vectors. Top → reserved for §10 Risks.
> 10. **Phase 9** — Claude proposes RICE: R=200, I=2, C=0.8, E=3 → 107. AskUserQuestion per number; user adjusts Effort to 4 → Score = 80.
> 11. **Phase 10** — Claude scans repo (read-only): finds adjacent `usage-metering`. Proposes 3 ☑. AskUserQuestion per checkbox; user confirms all 3.
> 12. **Phase 11** — Claude picks **Approach C**. Rationale cites: RICE=80, Feasibility 3/3 ☑, Engineer bullet, Kong gap. AskUserQuestion: user accepts.
>
> **— ExitPlanMode handoff —**
> 13. **Phase 11.5** — `ExitPlanMode` with plan: «create dir, copy template, add tenant to CONTEXT.md glossary, fill 15 sections, run self-check, propose commit».
>
> **— Execute (post-plan) —**
> 14. **Phase 12** — `mkdir docs/features/rate-limiting-per-user/`, copy template, add «tenant» to `CONTEXT.md` glossary, Write idea-brief.md with all sections. Frontmatter `status: Confirmed`, `confirmed_at: 2026-05-21`.
> 15. **Phase 13** — self-check: 15 sections ✓, no Postgres/Redis in body ✓, 4.2 pages ✓, citations ✓.
> 16. **Phase 14** — Commit message proposed: `01: idea-brief for rate-limiting-per-user` (user executes). Next: PM + Tech Lead → write the PRD for `rate-limiting-per-user`.

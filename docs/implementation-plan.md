# MVP Implementation Plan — Personal Job-Application Automation

Synthesizes every decision made while working the wayfinder map [Personal job-application automation](https://github.com/SashaGordin/job-app/issues/1) (issues #2–#11) into a buildable plan. The map planned; this document is the follow-up execution plan it pointed to.

## System overview

A single-user, assisted-apply pipeline:

1. **Scan** — pull fresh job postings from Greenhouse, Lever, Adzuna, RemoteOK, and Arbeitnow, on a daily schedule plus an on-demand "scan now" trigger that calls the same job.
2. **Match** — soft-score every new posting against the user's profile; bucket into strong / weak-but-surface / discard, all visible.
3. **Tailor** — render a per-job resume (and, when called for, a cover letter) from a structured base profile; never fabricate facts, only select/reorder/reword.
4. **Review** — human reviews a diff-against-base-profile, per-change approve/reject, in the itemized-change-list UI already prototyped.
5. **Submit** — on approval, a headless browser fills and submits the ATS apply form (Greenhouse/Lever); the human has already clicked submit in the review UI, so this step never runs unattended.

Automation level is fixed as **assisted apply**: nothing submits without a human decision on that specific application (map Notes; Out of scope: fully autonomous submission).

## Architecture (decided)

- **Hosting**: persistent VM/container (Fly.io/Railway-style), not serverless — required for headless-browser (Playwright-style) apply-form automation, which doesn't fit serverless execution/cold-start constraints. [Channel & architecture strategy](https://github.com/SashaGordin/job-app/issues/7)
- **Storage**: SQLite, single file on the VM's persistent disk, holding job postings and application state. Backed up via periodic file snapshot. [#7](https://github.com/SashaGordin/job-app/issues/7)
- **Scan trigger**: one scheduled daily job; a "scan now" UI action calls the *same* job, not a separate code path. [#7](https://github.com/SashaGordin/job-app/issues/7)
- **Credentials**: Adzuna `app_id`/`app_key` in a gitignored `.env` on the VM (env vars, no secrets manager — matches single-user VM-you-control scale). Greenhouse uses a persistent MyGreenhouse candidate account with its login cookie jar as a **separate file on disk** (not in SQLite), alongside `.env`. Lever uses anonymous guest-apply — transient, per-run cookies only, nothing persisted (confirmed: Lever has no candidate-account/autofill feature). RemoteOK/Arbeitnow are keyless. [#8](https://github.com/SashaGordin/job-app/issues/8), [#11](https://github.com/SashaGordin/job-app/issues/11)
- **Rate limiting**: submission and scan governed separately.
  - Submission (Greenhouse, Lever): per-platform, 10 applications/day each, spaced out rather than bursty, **soft cap** — warns and requires explicit confirmation to exceed, never blocks outright (the human is already reviewing every submission).
  - Scan (Adzuna/RemoteOK/Arbeitnow): Adzuna's daily quota is one shared budget across the scheduled scan and manual "scan now" triggers; if a manual scan fires after that budget's spent, skip Adzuna and still run RemoteOK + Arbeitnow (keyless, no quota risk) rather than blocking the whole scan.
  [Application rate limiting policy](https://github.com/SashaGordin/job-app/issues/9)

## Channels (decided)

| Channel | Role | Mechanism |
|---|---|---|
| Greenhouse | ATS, MVP | Public no-auth listing API for discovery; headless-browser apply-form automation for submission; persistent MyGreenhouse account |
| Lever | ATS, MVP | Public no-auth listing API for discovery; headless-browser apply-form automation for submission; anonymous guest-apply session |
| Adzuna | Job board, MVP | Keyed API, primary discovery source |
| RemoteOK | Job board, MVP | Keyless API, discovery |
| Arbeitnow | Job board, MVP | Keyless API, discovery |
| LinkedIn | Deferred | Manual paste-in only, no automation ever (ToS risk ruled it out — [#2](https://github.com/SashaGordin/job-app/issues/2)) — separate lightweight flow, add after the automated pipeline is proven |
| Ashby | Deferred | Add once Greenhouse+Lever pipeline is proven |
| Remotive | Deferred | 4 req/day cap would constrain the shared scan design; revisit later |
| Indeed, Workday, iCIMS, others | Dropped | No usable public surface for an individual — [#3](https://github.com/SashaGordin/job-app/issues/3), [#4](https://github.com/SashaGordin/job-app/issues/4) |

MVP build order within ATS: **Greenhouse first, then Lever** — form-fill/discovery logic largely transfers. [#3](https://github.com/SashaGordin/job-app/issues/3)

## Data model (SQLite)

Sketch, to firm up in Phase 0:

- **`profile`** — the canonical structured base profile (roles, bullets, skills, education, dates) that all resumes render from. Source of truth; never edited per-job. [#6](https://github.com/SashaGordin/job-app/issues/6)
- **`job_postings`** — `id, source, external_id, title, company, location, url, description, posted_at, discovered_at, raw_json`. Deduplicated by `(source, external_id)`.
- **`job_scores`** — `job_id, role_tier_score, seniority_score, tech_fit_score, location_score, comp_score, industry_score, total_score, bucket` (strong / weak-but-surface / discard), per the weighting in [User profile & job-matching criteria](https://github.com/SashaGordin/job-app/issues/5).
- **`applications`** — `id, job_id, state (matched → drafted → reviewed → submitted/rejected), tailored_resume_ref, cover_letter_ref, diff_json, created_at, submitted_at`.
- **`submission_log`** — `application_id, platform, submitted_at, response_status` — doubles as the source for the per-platform daily rate-limit counters.

Credentials (Adzuna key, Greenhouse cookie jar) stay in flat files on disk, **not** in SQLite, per [#8](https://github.com/SashaGordin/job-app/issues/8).

## Pipeline / modules

1. **Discovery adapters** (one per channel) — normalize each source's response into `job_postings` rows. Greenhouse/Lever adapters hit their public listing APIs; Adzuna/RemoteOK/Arbeitnow adapters hit their job-search APIs. Shared interface so adding Ashby/Remotive later is additive, not a rewrite.
2. **Scheduler** — one daily job running all discovery adapters → scoring → (optionally) tailoring for strong matches. The "scan now" UI action invokes this same job on demand.
3. **Scoring engine** — implements the [#5](https://github.com/SashaGordin/job-app/issues/5) model: role tier heaviest, seniority/tech-stack fit next, location/comp/industry as light boosters; no hard discards, everything stays visible and sorted.
4. **Tailoring engine** — template-renders a resume from `profile` per the [#6](https://github.com/SashaGordin/job-app/issues/6) rules (select/reorder/reword, never fabricate), outputs PDF + `diff_json`; generates a cover letter only when the posting/channel calls for one.
5. **Review UI** — build out the winning prototype shape: itemized per-change approve/reject cards, live preview pane with "Tailored preview" / "Job posting" tabs, bulk approve/reject, submit button. Prototype branch [`prototype/review-submission-ui`](https://github.com/SashaGordin/job-app/tree/prototype/review-submission-ui) (`index.html`, single-file React, no build step) is the starting point — decide in Phase 0 whether to lift it directly or rebuild integrated with the backend. [#10](https://github.com/SashaGordin/job-app/issues/10)
6. **Apply automation** — Playwright-driven form-fill for Greenhouse and Lever, triggered only after human approval in the review UI. Enforces the per-platform daily submission cap with soft-cap override prompt.
7. **Rate limiter** — shared module used by both the scheduler (Adzuna scan budget) and the apply-automation step (per-platform submission caps), per [#9](https://github.com/SashaGordin/job-app/issues/9).

## Build phases

Ordered to prove the low-risk data pipeline before touching browser automation (the highest-risk, ToS-sensitive piece):

1. **Phase 0 — Scaffolding**: pick and confirm the stack (see Open Questions), set up the VM/container, SQLite schema/migrations, `.env` handling, local dev parity.
2. **Phase 1 — Discovery + matching**: Adzuna, RemoteOK, Arbeitnow adapters; scheduled scan job; scoring engine; a minimal listing view (doesn't need to be the final UI) to validate matches look right.
3. **Phase 2 — Tailoring**: structured `profile` schema, template renderer, diff generation.
4. **Phase 3 — Review UI**: integrate the winning prototype, wire to real tailoring output, persist approve/reject/edit state to `applications`.
5. **Phase 4 — Greenhouse apply automation**: Playwright form-fill, MyGreenhouse account + cookie-jar integration, real submit wired to the review UI's submit button, submission rate limiting live.
6. **Phase 5 — Lever apply automation**: reuse the Greenhouse form-filler abstractions, guest-apply session handling, rate limiting extended.
7. **Phase 6 — Hardening**: manual "scan now" end-to-end, shared Adzuna budget + graceful degradation, backup snapshotting for the SQLite file.
8. **Phase 7 — Post-MVP (deferred channels)**: LinkedIn manual paste-in flow, Ashby, Remotive re-add — only after the above is proven in daily use.

## Open implementation questions (not settled by the map)

The wayfinder map deliberately left these open ("Tech stack/hosting is undecided" — map Notes); they need a decision before or during Phase 0, but aren't blocking this plan:

- **Language/framework**: needs first-class Playwright support and should ideally share one language across the scan/match/tailor backend and the review UI. Recommendation: **Node.js + TypeScript** — Playwright's most mature target, and the review-UI prototype is already React. Open to Python if preferred.
- **Deployment target**: Fly.io vs. Railway vs. a bare VM — #7 named the *style* ("Fly.io/Railway-style"), not a specific provider.
- **Scheduling mechanism**: OS-level cron vs. an in-process scheduler (e.g. `node-cron`) calling the same job the "scan now" button calls.
- **Scoring implementation**: #5 fixed the priority order and bucket semantics, not the mechanism — a weighted formula vs. an LLM-assisted scorer is still open.
- **Review UI access**: single-user, but does it sit behind any auth, or is it VM-local/VPN-only?
- **Backup cadence** for the SQLite snapshot.

## References

- Map: [Personal job-application automation](https://github.com/SashaGordin/job-app/issues/1)
- Decisions: [#2](https://github.com/SashaGordin/job-app/issues/2) LinkedIn feasibility · [#3](https://github.com/SashaGordin/job-app/issues/3) ATS mechanics · [#4](https://github.com/SashaGordin/job-app/issues/4) job-board APIs · [#5](https://github.com/SashaGordin/job-app/issues/5) matching criteria · [#6](https://github.com/SashaGordin/job-app/issues/6) tailoring approach · [#7](https://github.com/SashaGordin/job-app/issues/7) channel & architecture · [#8](https://github.com/SashaGordin/job-app/issues/8) credentials & sessions · [#9](https://github.com/SashaGordin/job-app/issues/9) rate limiting · [#10](https://github.com/SashaGordin/job-app/issues/10) review UI shape · [#11](https://github.com/SashaGordin/job-app/issues/11) Lever session model
- Research: `research/linkedin-findings.md`, `research/ats-findings.md`, `research/jobboards-findings.md`, `research/lever-session-findings.md`
- Prototype: [`prototype/review-submission-ui`](https://github.com/SashaGordin/job-app/tree/prototype/review-submission-ui)

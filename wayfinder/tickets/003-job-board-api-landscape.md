---
id: 003
title: Job-board API landscape (Indeed and alternatives)
type: research
status: closed
blocked_by: []
assignee: research-jobboards
---

## Question

What is the current (2026) access status of Indeed's job-search APIs for an individual/personal-use developer — is the Publisher Program or an equivalent still open, what does it cost, and what does it return? Survey comparable job-board APIs (e.g. Adzuna, USAJobs, RemoteOK, The Muse, Jooble, LinkedIn Jobs via third parties, Google for Jobs / Google Talent Solution) for auth model, cost, coverage, and rate limits. Conclude with a ranked shortlist of which job-board APIs are realistic MVP data sources for job discovery.

## Answer

**Indeed: not viable.** Publisher Program closed to new applicants since October 2022, Publisher API deprecated 2023-2024; the only remaining path is an enterprise partner deal, out of reach for an individual project.

**Ranked shortlist for MVP:**
1. **Adzuna** — best overall: free self-serve key, broad multi-country coverage, salary/location metadata, reasonably documented. Primary source.
2. **RemoteOK + Remotive + Arbeitnow** (combined) — free, keyless, good remote/tech complement to Adzuna. Respect Remotive's "max 4 requests/day" and no-resyndication terms.
3. **The Muse** — optional addition for curated/vetted-company listings; generous rate limit (3,600/hr with a free key).
4. **USAJobs** — low priority, add later only if US federal roles matter.
5. **Jooble** — deprioritize: free tier is 500 calls *lifetime*, not recurring.
6. **Google Talent Solution / Google for Jobs** — not usable as discovery sources at all; both are for publishing *your own* postings, not searching others'. Drop entirely.

Full per-provider table (auth, cost, coverage, rate limits) and sources: [research-jobboards-findings.md](../research-jobboards-findings.md)

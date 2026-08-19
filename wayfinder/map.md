---
name: Personal job-application automation
labels: [wayfinder:map]
---

## Destination

Resolve the decisions needed to build a first working MVP of an assisted job-application pipeline — which channels to target, how matching/ranking works, how resume & cover-letter tailoring works, and the system architecture — so implementation can start as a straightforward build. The map stops short of writing the MVP itself.

## Notes

- Single-user personal tool; the user is the applicant.
- Legal/ToS risk (especially LinkedIn's anti-automation stance) is a first-class constraint on channel choice, not an afterthought.
- Consult `/research` for channel-feasibility tickets; `/grilling` + `/domain-modeling` for the rest.
- Tech stack/hosting is undecided — don't assume a Vercel/Next.js stack by default; the architecture ticket weighs options once channel research lands.
- No Notes override: this map plans, it doesn't execute — the MVP build happens in a follow-up effort once the map is clear.
- Automation level is fixed as **assisted apply**: the system finds/ranks jobs and drafts a tailored resume + cover letter, but a human clicks submit on each application. See Out of scope.
- Tracker: this repo has no external issue tracker configured, so the map and its tickets are plain markdown files under `wayfinder/` (map at `wayfinder/map.md`, tickets under `wayfinder/tickets/`). Front matter on each ticket carries `status`, `type`, `blocked_by`, and `assignee` in place of native tracker fields.

## Decisions so far

- [LinkedIn automation feasibility & ToS risk](tickets/001-linkedin-automation-feasibility.md) — not viable to automate (no consumer API exists, unofficial automation is a real 2026 ToS/detection risk); treat as a manual paste-in channel only.
- [Company ATS mechanics (Greenhouse, Lever, Workday, etc.)](tickets/002-ats-mechanics.md) — Greenhouse and Lever are the top MVP targets (open no-auth listing APIs, stable apply forms), then Ashby; submission APIs are employer-gated everywhere so actual submission always means automating the public apply form.
- [Job-board API landscape (Indeed and alternatives)](tickets/003-job-board-api-landscape.md) — Indeed is a dead end for individuals; Adzuna is the primary MVP source, layered with free keyless RemoteOK/Remotive/Arbeitnow.

## Not yet specified

- Review/submission UI shape — how the human reviews a drafted application before it goes out.
- Credential & session management per channel (how the automation authenticates to LinkedIn / ATS platforms / job boards).
- Where application state/history is stored (jobs seen, applications drafted, applications submitted).
- How tailoring quality gets evaluated/QA'd before a human sees the draft.
- Rate limiting / how many applications per day or week is reasonable per channel.

## Out of scope

- Fully autonomous submission with no human review — ruled out by the user's explicit "assisted apply" choice when this map was charted.

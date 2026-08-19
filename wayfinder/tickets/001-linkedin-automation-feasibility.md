---
id: 001
title: LinkedIn automation feasibility & ToS risk
type: research
status: closed
blocked_by: []
assignee: research-linkedin
---

## Question

What does LinkedIn's official API actually permit for a personal job-search assistant (job search, listing retrieval, applying)? Separately, what do unofficial automation approaches (browser automation, scraping, session reuse) risk in practice today — rate limiting, account suspension/ban, and legal exposure under LinkedIn's Terms of Service? Conclude with a recommendation: is LinkedIn viable as an MVP channel, and if so, through which mechanism (official API vs. some form of automation) and at what risk level?

## Answer

**Not viable as an automated MVP channel, via either official API or automation.**

- No consumer-facing jobs API exists at all — LinkedIn's official APIs (Job Posting API, Apply Connect) are employer/ATS-partner surfaces for *posting* jobs and receiving Easy Apply submissions, not for a job seeker to search or apply. Individual developers are explicitly ineligible for the partner programs that would matter here.
- Unofficial automation (scraping/browser automation/session reuse) is a direct breach of LinkedIn's User Agreement (Section 8.2). hiQ Labs v. LinkedIn — often cited as "scraping is legal" — actually ended in a confidential 2022 settlement with hiQ liable for $500K and a permanent injunction, and only ever concerned public/logged-out CFAA exposure, not authenticated-session ToS breach. Detection has gotten materially more aggressive in 2026 (behavioral biometrics, session fingerprinting, suspension-on-first-detection for many violations); LinkedIn has also gone after automation vendors directly (e.g. the HeyReach takedown in March 2026).
- **Recommendation:** treat LinkedIn as a **manual paste-in channel only** — the human copies a job URL/description into the assistant; the assistant never touches linkedin.com programmatically. Zero ToS/account risk, fits the existing "human clicks submit" design. Prioritize channels with real public APIs (see [Company ATS mechanics](../tickets/002-ats-mechanics.md), [Job-board API landscape](../tickets/003-job-board-api-landscape.md)) for automated discovery instead.

Full findings, including the API/legal detail and all sources: [research-linkedin-findings.md](../research-linkedin-findings.md)

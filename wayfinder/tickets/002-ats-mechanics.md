---
id: 002
title: Company ATS mechanics (Greenhouse, Lever, Workday, etc.)
type: research
status: closed
blocked_by: []
assignee: research-ats
---

## Question

Which applicant-tracking-system platforms (Greenhouse, Lever, Workday, Ashby, iCIMS, SmartRecruiters, etc.) expose public job-listing APIs or feeds that could be used to discover open roles at companies using them? For each major platform, what does actually *submitting* an application require — is there an official API for application submission, or does it require automating the public-facing apply form? Note any per-platform rate limits, CAPTCHA/bot-detection measures, or ToS constraints. Conclude with a ranked shortlist of which ATS platforms are realistic MVP targets.

## Answer

**Ranked shortlist:** Greenhouse and Lever tie for best fit (both fully open, no-auth, well-documented job-listing APIs; similarly structured, stable apply forms) → Ashby (also open no-auth listings; its gated apply schema is a useful reference for a generic form-filler) → Workable/Personio (trivial public listing endpoints, worth bolting on opportunistically) → SmartRecruiters (listing API is tier-gated, no self-service submission credentials) → Workday/iCIMS (deprioritize — no public listing API, no candidate application API, Workday has the most aggressive bot detection observed) → BambooHR/Breezy/Taleo/SuccessFactors (skip — no meaningful public surface).

**Cross-cutting finding:** across every platform researched, the real application-*submission* API — where one exists at all — is gated to the employer or an approved partner integration; none expose self-service submission credentials to an individual job seeker. In practice, submission on any ATS means automating the public apply form, which fits the project's existing "human clicks submit" design (most CAPTCHA/bot-detection risk concentrates at submit time and is mitigated by a live human doing that click).

**MVP build order:** start with Greenhouse, add Lever next (discovery/form-fill logic largely transfers), then Ashby.

Full per-platform detail (endpoints, auth, rate limits, sources) for all 6 requested platforms plus Workable, Personio, BambooHR, Breezy HR, Taleo, and SAP SuccessFactors: [research-ats-findings.md](../research-ats-findings.md)

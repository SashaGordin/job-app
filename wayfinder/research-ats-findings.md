# ATS Platform Research: Job Discovery & Application Submission

Research question: which ATS platforms expose public job-listing APIs/feeds usable for discovery, and what does actually submitting an application require (official API for a job-seeker, vs. automating the public apply form) — including rate limits, CAPTCHA/bot-detection, and ToS constraints relevant to an individual automating applications to their own job search.

## 1. Per-platform summary

### Greenhouse
- **Job listings**: `GET https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs` — public, no authentication required, returns full JSON of every open role at that company. The board token is the slug found in `boards.greenhouse.io/{token}`. Official docs: developers.greenhouse.io/job-board.html.
- **Application submission**: `POST https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs/{id}` exists and accepts `multipart/form-data` or `application/json`. Required fields are only first name, last name, and email (the API does not validate/reject missing required fields client-side). However, it requires HTTP Basic Auth with an API key issued to the **employer**, and the official docs explicitly warn: "Any direct post to the /applications POST method would reveal your secret key to anybody that views source — which would be a very bad thing," meaning it must be proxied through the employer's own server. This is not usable by an individual job seeker with their own credentials.
- **Assist-fill UX precedent**: Greenhouse has its own "MyGreenhouse Quick Apply" feature where a candidate saves a profile once and gets an "Autofill with Greenhouse" button on future applications — a legitimate vendor-provided pattern of autofill + human clicks submit.
- **CAPTCHA/bot detection**: reCAPTCHA is invisible and fires only at submission time; if the invisible check fails, a visible fallback challenge is shown. No CAPTCHA on browsing/reading job data.
- **Rate limits**: no explicit published limits for the read API; only generic "spam protection measures" mentioned for the embedded form.

### Lever
- **Job listings**: `GET api.lever.co/v0/postings/{company}` (EU accounts: `api.eu.lever.co/v0/postings/{site_slug}`) — public, no authentication, supports query params `team`, `department`, `location`, `commitment`, `level`, `skip`, `limit`. Officially documented at hire.lever.co/developer/postings and github.com/lever/postings-api.
- **Application submission**: documented endpoints exist — "Apply to a posting" (POST), "Upload a file" (for resumes), and "Retrieve posting application questions" (`GET api.lever.co/v1/postings/:posting/apply`) to discover the form fields for a given posting. Two fields (name, email) are always required; other required fields are posting-specific and returned by the questions endpoint. However, to actually POST an application you need an API key that "must be configured by a Lever employee" for that company's account — i.e., employer-provisioned, not self-service for an outside job seeker.
- **Rate limits**: Lever returns HTTP 429 if a custom job site issues more than 2 application POST requests per second.
- **CAPTCHA**: no specifics surfaced in the docs found, but the same employer-gated-key pattern as Greenhouse applies, so it's moot for an individual without that key.

### Workday
- **Job listings**: no official public API. Every Workday customer's career site lives at a `{tenant}.myworkdayjobs.com` subdomain, and the page's own search UI calls an internal JSON endpoint of the shape `/wday/cxs/{tenant}/{site}/jobs`. This works in practice but is undocumented, unofficial, and its shape varies across tenant/version — a fragile integration surface, not a supported contract.
- **Official APIs that do exist**: the Workday Staffing REST API (workers, time-off, etc.) and the Public Web Services SOAP API (50+ services across HCM/finance/recruiting) — both require OAuth credentials granted per-tenant by the employer, intended for that employer's own back-office integrations, not for outside job seekers or job aggregators.
- **Application submission**: no API of any kind for candidates. Submission requires driving Workday's own multi-step web application wizard.
- **Bot detection**: reported as the most aggressive of the major ATSs — sophisticated anti-bot scoring combining rapid submission timing, repetitive/robotic field-entry patterns, browser fingerprinting, and IP reputation. Real-world benchmarking of AI application-bots found Workday to be the single largest source of end-to-end submission failures among the ATSs tested (4 of 8 total failures in one 50-application test run were Workday-specific).

### Ashby
- **Job listings**: `GET https://api.ashbyhq.com/posting-api/job-board/{clientname}?includeCompensation=true` — public, no authentication, returns all currently published job postings; no filtering/search parameters supported. Documented at developers.ashbyhq.com/docs/public-job-posting-api and docs.ashbyhq.com (lightweight job posting API guide).
- **Application submission**: Ashby documents an `applicationForm.submit` endpoint intended for building a fully custom careers page, including resume file upload via `multipart/form-data` (or `application/json`). This is the most complete/well-specified application-submission schema of all six platforms researched. However it requires BasicAuth plus a `candidatesWrite`-scoped API key, issued to the organization or an approved integration partner — not to individual applicants. There's also a separate `application.create` endpoint, but Ashby's own docs say job boards should use `applicationForm.submit` instead.
- **Practical value**: even though gated, its field schema is a useful reference for designing a generic apply-form filler, since it enumerates exactly what a real application record needs.
- **CAPTCHA/rate limits**: not specified in available docs.

### iCIMS
- **Job listings**: no free/public job API. Some iCIMS- and Jibe-powered career sites expose an internal, undocumented `/api/jobs`-style endpoint that powers their own on-page search — usable in practice (faster/cheaper than browser scraping) but unofficial and inconsistent across site versions.
- **Official API**: the iCIMS Talent Cloud API / Job Portal API is partner-gated — obtaining credentials requires joining the iCIMS Partner Program, which typically requires a sponsoring iCIMS customer. This is the hardest of the six platforms to get even indirect, semi-official access to.
- **Application submission**: no candidate-facing API surfaced; submission requires automating the public application form on each employer's career portal.

### SmartRecruiters
- **Job listings**: public Posting API returns a flat JSON list of postings (title, location, department, custom fields, apply URL) with no auth when the customer has it enabled — but it is **tier-dependent**, i.e. not every SmartRecruiters customer has it turned on, and each call only covers one customer's postings.
- **Application submission**: the most complete **documented public flow** among the six — a real 3-step candidate-application flow:
  1. `GET /postings/{uuid}/configuration` — fetch required screening/diversity questions for the job
  2. `POST /postings/{uuid}/candidates` — submit the application (must include screening/diversity answers and privacy-policy consent)
  3. `GET /postings/{uuid}/candidates/{candidateId}/status` — check application status
- **Rate limits**: strict — 8 concurrent requests max, 128-second request timeout, HTTP 429 on excess, plus "adaptive throttling" that tightens further under platform load.
- **Access model**: despite being the most complete flow on paper, the docs frame everything as being done "on behalf of a candidate" by an integration, implying institutional/job-board-partner usage; there's no clearly documented public self-service path for an individual job seeker to obtain credentials. Would likely require direct outreach to SmartRecruiters.

### Other platforms found
- **Workable**: public, unauthenticated read endpoint `GET https://apply.workable.com/api/v1/widget/accounts/{clientname}` (add `details=true` for full job description); no filtering support. The authenticated REST API v3 (bearer token) is for HR back-office integrations, not job seekers. No public application-submission API.
- **Personio**: public, unauthenticated XML feed per customer: `GET https://{company}.jobs.personio.de/xml?language=en`. No public application-submission API.
- **BambooHR**: no public read API — job postings require an authorization token issued to the employer; closed for outside discovery.
- **Breezy HR**: same pattern as BambooHR — no public read API, employer-issued token required.
- **Taleo / SAP SuccessFactors** (legacy enterprise ATSs): no public APIs surfaced in research; same closed pattern as Workday/iCIMS, likely worse given the age and fragmentation of these platforms.

### Cross-cutting observation
Across every platform researched, the genuine application-submission API — where one exists at all — is gated to the employer or an approved partner integration (a vendor-issued key scoped to that specific company's account, or a vetted partner program requiring a sponsoring customer). **None expose a self-service "submit my own application" API to an arbitrary individual job seeker.** Practically, actual submission on any of these platforms means automating the public-facing HTML apply form. Since the intended product design keeps a human in the loop for the final submit click, most CAPTCHA/bot-detection risk (which concentrates specifically at submit time, per Greenhouse's own docs) is substantially mitigated — the human's presence for the last action is itself a mitigant, not just a safety feature.

## 2. Ranked shortlist — realistic MVP targets

1. **Greenhouse** — Best overall combination: fully open, well-documented, no-auth job-listing API; very large share of the well-known tech-company job market; a relatively stable, consistent apply-form structure to build a form-filler against; and CAPTCHA that only triggers at submit time (mitigated by human-click design). Top pick to build and validate the pipeline against first.
2. **Lever** — Essentially tied with Greenhouse on listing-API openness and quality (public, filterable, well-documented), with a similarly structured, well-understood apply form. Smaller market share than Greenhouse but cheap to add once Greenhouse support exists, since discovery and form-fill logic largely transfer.
3. **Ashby** — Solid no-auth public listing endpoint, and it's a fast-growing ATS among startups (increasingly common target). Its documented (if gated) `applicationForm.submit` schema is a valuable reference for the exact fields a robust generic apply-form filler needs to handle. Good third target.
4. **Workable / Personio** — Both have trivially public, no-auth listing endpoints. Smaller footprint in the US tech job market than the top three, but essentially free to bolt on to the discovery pipeline once it exists, and worth adding opportunistically rather than as a dedicated build phase.
5. **SmartRecruiters** — Lower priority for MVP. The listing API is tier-gated (not guaranteed to be enabled for a given employer), and despite having the most complete documented Application API on paper, there's no clear self-service path for an individual to get credentials — would require direct vendor outreach, which isn't worth blocking MVP scope on.
6. **Workday, iCIMS** — Deprioritize for MVP. Both are effectively closed: no public job-listing API (only unofficial internal endpoints), no candidate application API, and iCIMS additionally requires a partner-program relationship even to get semi-official access. Workday specifically has the most aggressive anti-bot detection observed in real-world testing. Given how many large enterprises run on Workday, it's worth revisiting post-MVP as a "hard mode" target via generic browser automation with human-submit, but it should not be a launch platform.
7. **BambooHR, Breezy HR, Taleo, SAP SuccessFactors** — Skip. No meaningful public surface for either discovery or submission; would require reverse-engineering internal endpoints with no stability guarantees, for platforms with comparatively low payoff.

**Rationale summary**: because the product design always puts a human in the loop for the actual submit action, CAPTCHA/bot-detection is a secondary concern (it's concentrated at submit time and a live human click sidesteps most of it). The real MVP-scoping differentiator is (a) how easy and stable job discovery is — Greenhouse, Lever, Ashby, Workable, and Personio all have trivial, public, no-auth listing APIs — and (b) how consistent/predictable the apply-form DOM is for building a reliable generic auto-fill assistant, where Greenhouse, Lever, and Ashby are the most uniform and Workday's multi-step wizard plus unstable internal endpoints make it by far the hardest to support generically.

## 3. Sources
- https://developers.greenhouse.io/job-board.html
- https://github.com/grnhse/greenhouse-api-docs/blob/master/source/includes/job-board/_applications.md
- https://support.greenhouse.io/hc/en-us/articles/10568627186203-Greenhouse-API-overview
- https://support.greenhouse.io/hc/en-us/articles/35746094035099-MyGreenhouse-job-alerts-and-quick-apply
- https://hire.lever.co/developer/postings
- https://hire.lever.co/developer/documentation
- https://github.com/lever/postings-api
- https://github.com/lever/postings-api/blob/master/README.md
- https://github.com/api-evangelist/workday-recruiting
- https://jobspipe.dev/sources/workday
- https://scale.jobs/blog/cheap-ai-apply-tools-fail-workday-applications
- https://developers.ashbyhq.com/docs/public-job-posting-api
- https://developers.ashbyhq.com/reference/applicationformsubmit
- https://docs.ashbyhq.com/using-the-lightweight-job-posting-api-to-list-openings-on-your-site
- https://docs.ashbyhq.com/build-an-entirely-custom-careers-page-using-the-ashby-api
- https://developer-community.icims.com/applications/applicant-tracking/job-portal
- https://jobspipe.dev/sources/icims
- https://jobspipe.dev/blog/icims-api-jobs
- https://developers.smartrecruiters.com/docs/posting-api
- https://developers.smartrecruiters.com/docs/application-api-1
- https://developers.smartrecruiters.com/docs/partners-job-board-api
- https://developers.smartrecruiters.com/docs/the-smartrecruiters-platform
- https://help.workable.com/hc/en-us/articles/115012771647-Using-the-Workable-API-to-create-a-careers-page
- https://help.workable.com/hc/en-us/articles/115013356548-Workable-API-Documentation
- https://fantastic.jobs/ats/personio
- https://fantastic.jobs/ats/bamboohr
- https://fantastic.jobs/ats/breezy
- https://fantastic.jobs/ats/workday
- https://blog.fastapply.co/ai-job-application-bots-which-actually-submit-2026
- https://www.browserless.io/blog/bot-detection
- https://dataresearchtools.com/how-to-scrape-lever-and-greenhouse-job-boards-programmatically-2026/

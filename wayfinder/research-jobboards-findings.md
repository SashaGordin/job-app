# Job-Board API Landscape for Assisted Job Application MVP (2026)

## 1. Indeed — current access status

**Closed to individual/personal-use developers, with no viable path in.**

- The Publisher Program (the old mechanism for getting a job-search API key as an outside developer) stopped accepting new applicants in **October 2022**, and the publisher portal (indeed.com/publisher) no longer resolves.
- The Publisher API itself was **deprecated in 2023–2024**; the `GET /publisher/jobs` endpoint documentation page (`developer.indeed.com/docs/publisher-jobs/get-job`) now hard-redirects (301) to `partners.indeed.com`, Indeed's B2B partner site — there is no self-serve API surface left.
- Indeed's remaining APIs (Indeed Apply, Job Sync, Disposition Sync, Sponsored Jobs) are all **employer/ATS-side** — built for pushing job postings and receiving applications, not for pulling/searching job listings. They sit behind a partner-sales process (team size, industry vetting, weeks-to-months to close) and are not reachable by an individual developer.
- Bottom line: **there is no first-party route to Indeed job data in 2026** short of a costly enterprise partnership. Third parties advertise "Indeed APIs" but these are scrapers wrapped in a paid API, which is against Indeed's ToS — not something to build MVP infra on.

## 2. Other providers surveyed

| Provider | Auth | Cost | Coverage | Rate limits |
|---|---|---|---|---|
| **Adzuna** | Free self-serve `app_id`/`app_key` from developer.adzuna.com | Free tier (reported ~1,000 calls/month, some sources say more; higher volume is negotiated, no public paid tier page) | Aggregates broadly — strong in UK/US/EU/AU; ~12 countries per third-party wrappers; salary/employment-trend endpoints too | Not officially published; free tier is capped low (order of dozens/day) |
| **USAJobs** | Free, instant self-serve key from developer.usajobs.gov (email-based, no approval) | Free, no fees | US federal government postings only — narrow but authoritative for that niche | Not clearly published in official docs; per-User-Agent throttling exists but no hard published number found |
| **RemoteOK** | None — fully open, no key required | Free | Remote-only jobs, global but skews tech/startup | Undocumented; no auth means no formal quota, but abuse will get you blocked |
| **The Muse** | Optional `api_key` (free registration) | Free | Curated employer listings (~500k+ jobs) from companies that publish on The Muse — skews US, professional/office roles, not a full-market aggregator | 500 req/hr unauthenticated, **3,600 req/hr with a registered key** |
| **Jooble** | Free API key, requested via form (short review, not instant) | Free tier: **500 requests total, lifetime** (not recurring) — very limiting | Very broad — 67 countries | 500 lifetime calls per key; each country/domain needs its own key |
| **Google Talent Solution (Cloud Talent Solution)** | GCP project + billing account + service-account credentials | Free up to 1,000–10,000 calls/month, then metered; contact sales above ~10M/month | **Not a discovery source** — it's a search/matching engine over jobs *you* upload, not a way to query third-party postings. Doesn't fit "find jobs from the web" use case at all | N/A (self-hosted data) |
| **Google for Jobs** | N/A — no query API exists | N/A | **Not a discovery source either** — it's the reverse: you publish `JobPosting` JSON-LD + Indexing API to get *your own* listings surfaced in Google's job search UI. Cannot be queried to pull other employers' listings | N/A |
| **Arbeitnow** | None — open, no key | Free | Europe-focused (Germany-heavy) tech/remote jobs aggregator | "Generous" but undocumented free tier |
| **Remotive** | None — open, no key | Free | Remote jobs, global, tech-leaning | No hard published limit, but Remotive explicitly asks for **max 4 requests/day** and forbids resyndicating to Jooble/Google Jobs/LinkedIn/etc. |

## 3. Ranked shortlist — realistic MVP data sources

1. **Adzuna** — best overall fit: broad multi-country coverage, real salary/location metadata, free self-serve key, reasonably documented. Best default primary source for a general job-discovery MVP.
2. **RemoteOK + Remotive + Arbeitnow (combined)** — all free, keyless, low-friction; good for remote/tech-role coverage to complement Adzuna. Remotive's "max 4 calls/day" and no-resyndication clause are easy to honor at MVP scale (cache results, don't push to other boards) but worth respecting explicitly given the "assisted, human-clicks-submit" design already avoids the resyndication problem.
3. **The Muse** — worth adding for curated/higher-quality professional listings if the product wants a "vetted companies" angle; registered-key rate limit (3,600/hr) is generous enough for real usage.
4. **USAJobs** — only relevant if/when the product wants US federal-job coverage as a niche; trivially free to add later, low priority for a general MVP.
5. **Jooble** — deprioritize despite broad geographic coverage: the **500-lifetime-call free tier** (not recurring) makes it unusable beyond a demo without moving to a paid arrangement.
6. **Google Talent Solution / Google for Jobs** — **not usable as discovery sources at all** — architecturally backwards for this use case (they're for publishing your own jobs, not searching others'). Drop from consideration.
7. **Indeed** — **not viable** for an individual/personal project in 2026. No realistic path without an enterprise partner deal. Any "Indeed API" offered by a third party is unofficial scraping wrapped in a paid service — a ToS and reliability risk not worth building the MVP's core data pipeline on.

**Recommendation for MVP:** Adzuna as primary, layered with the free keyless trio (RemoteOK, Remotive, Arbeitnow) for remote/tech breadth, optionally The Muse for curated listings. Treat Indeed and Google as out of scope until/unless a formal partnership becomes viable.

## 4. Sources

- [Indeed API — GitHub api-evangelist survey](https://github.com/api-evangelist/indeed)
- [Get Job (Deprecated) — developer.indeed.com](https://developer.indeed.com/docs/publisher-jobs/get-job) (redirects to partners.indeed.com)
- [Additional API Terms and Guidelines — Indeed Partner Docs](https://docs.indeed.com/legal-terms/additional-api-terms-and-guidelines)
- [Indeed Affiliate Program: 2026 Status — Job Boardly](https://www.jobboardly.com/blog/indeed-affiliate-program)
- [Indeed API for jobs: a clean alternative to scraping — JobsPipe](https://jobspipe.dev/sources/indeed)
- [Adzuna API — developer.adzuna.com/overview](https://developer.adzuna.com/overview)
- [Adzuna Search ads docs](https://developer.adzuna.com/docs/search)
- [Adzuna API: the free jobs API developers find first — JobsPipe](https://jobspipe.dev/blog/adzuna-api)
- [USAJobs API — Jentic](https://jentic.com/apis/usajobs.gov/usajobs-gov)
- [USAJOBS API: the developer's guide — JobsPipe](https://jobspipe.dev/guides/usajobs-api)
- [RemoteOK — Is there an API or RSS/JSON feed of remote jobs? (official help)](https://remoteok.featurebase.app/help/articles/3140840-is-there-an-api-or-rssjson-feed-of-remote-jobs)
- [RemoteOK Jobs API — Go client library](https://github.com/go-api-libs/remote-ok-jobs)
- [The Muse — Developers API v2](https://www.themuse.com/developers/api/v2)
- [Jooble REST API documentation](https://help.jooble.org/en/support/solutions/articles/60001448238-rest-api-documentation)
- [Jooble REST API — jooble.org/api/about](https://jooble.org/api/about)
- [Cloud Talent Solution Job Search — Before You Begin (Google Cloud docs)](https://docs.cloud.google.com/talent-solution/job-search/docs/before-you-begin)
- [Cloud Talent Solution Job Matching APIs — Google Cloud](https://cloud.google.com/solutions/talent-solution)
- [Learn About Job Posting Schema Markup — Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/job-posting)
- [Job Posting Schema for Google Jobs (2026 Guide) — Job Boardly](https://www.jobboardly.com/blog/google-jobs-api-integration-guide)
- [Arbeitnow — Job Board API blog post](https://www.arbeitnow.com/blog/job-board-api)
- [Remotive — Remote Jobs API](https://remotive.com/remote-jobs/api)
- [Remotive — remote-jobs-api GitHub repo](https://github.com/remotive-com/remote-jobs-api)

# Lever Candidate-Account / Autofill Support

Research question: does Lever (api.lever.co / hire.lever.co / jobs.lever.co) offer any candidate-facing persistent account, saved profile, or autofill feature analogous to Greenhouse's "MyGreenhouse Quick Apply" — something a candidate creates once that carries a login session usable to speed up applications across multiple Lever-hosted job postings? Resolves [issue #11](https://github.com/SashaGordin/job-app/issues/11), which was surfaced while resolving [issue #8](https://github.com/SashaGordin/job-app/issues/8) (Credential & session management per channel) — that ticket settled Greenhouse on a persistent MyGreenhouse account but found no equivalent evidence for Lever and deferred the question here.

## Conclusion

**(b) Lever has no candidate-facing persistent account, saved profile, or autofill feature.** Anonymous guest-apply — transient, per-run cookies only (e.g. any CSRF token issued for a single form submission), nothing persisted across sessions or postings — is confirmed as the correct session model for Lever, matching the fallback assumption stated in issue #8.

Every "candidate account" or "candidate profile" concept that exists in Lever's own documentation is **internal to the hiring company's recruiting team** (their CRM view of a candidate/opportunity record), not a self-service account a job seeker creates or logs into. There is no Lever-hosted equivalent of MyGreenhouse.

## Findings

### 1. Lever's own job-seeker-facing support page disclaims any candidate self-service
[lever.co/job-seeker-support](https://www.lever.co/job-seeker-support) (a page Lever maintains specifically to answer job-seeker questions) states plainly that Lever's support team "can't help you apply for jobs or check application status," and directs candidates back to the individual employer's own career page or to third-party job boards (Indeed, LinkedIn, ZipRecruiter, Glassdoor) instead. There is no mention anywhere on the page of a candidate account, saved profile, or a way to track/manage applications across companies through Lever itself. This is a strong first-party signal that no such candidate-facing product surface exists — if it did, this is exactly the page that would point to it.

### 2. Lever's developer documentation has no candidate-account concept
The developer docs (`hire.lever.co/developer/documentation`, `hire.lever.co/developer/support`) define "Candidate," "Opportunity," and "Contact" purely as **data objects inside a hiring company's Lever account** — i.e., recruiter-side CRM records, not accounts a job seeker owns or authenticates into. The developer FAQ (`hire.lever.co/developer/support`) has no mention of any candidate login, session, or autofill mechanism — its content is exclusively about the employer-facing API (postings, webhooks, opportunity data) and internal hiring workflows.

Similarly, Lever's help-center articles that reference "candidate profiles" — e.g. "Adding new opportunities to existing candidate profiles" and "Granting candidate access to users" — are written for the hiring company's own users (recruiters/hiring managers granting each other visibility into candidate records inside Lever's admin UI), not for candidates themselves.

### 3. No login/account UI on a live Lever-hosted careers page
Fetched Lever's own careers page, `jobs.lever.co/lever` (Lever uses its own product to host its own job postings), directly via curl with a browser user-agent (HTTP 200, ~712 KB of real HTML including the postings list). Searched the raw HTML for any sign-in, log-in, "create account", "my account", or "my applications" strings — **none were found**. This is consistent with the apply flow being a stateless, guest form submission rather than something gated behind or offering account creation.

### 4. Corroborating (non-primary) evidence from third-party autofill-tool vendors
Several commercial browser-extension vendors that specifically exist to solve the "fill out ATS application forms faster" problem describe Lever's lack of a candidate portal as a starting premise for their own product, e.g.:
- JobWizard's blog: "Unlike Workday or Greenhouse, Lever does not have a candidate portal... it gives candidates almost zero self-service visibility."
- Fylla's marketing copy: positions itself as filling the exact gap Greenhouse's own MyGreenhouse feature covers natively — "the same profile autofills Greenhouse, Workday, LinkedIn, Indeed... so moving between companies that use different ATS takes zero extra setup," implying Lever itself provides no equivalent.

These are vendor blogs/marketing pages, not authoritative sources on their own, and are cited here only as corroboration layered on top of the primary-source findings above (#1–#3), not as the basis for the conclusion.

## Implication for session/credential design

This confirms the fallback stated in issue #8: for the Lever channel, there is no persistent account or vendor-native "carry a login across applications" feature to build against. Session handling for Lever should be **anonymous guest-apply** — transient, per-run cookies (e.g. any CSRF/form token Lever issues for a single application POST) held only for the duration of that run, with nothing persisted to disk between runs (unlike Greenhouse, which uses a persistent MyGreenhouse account with a per-vendor cookie-jar file).

## Sources

- https://www.lever.co/job-seeker-support
- https://hire.lever.co/developer/documentation
- https://hire.lever.co/developer/support
- https://help.lever.co/hc/en-us/articles/360030953271-Adding-new-opportunities-to-existing-candidate-profiles
- https://help.lever.co/s/article/Granting-candidate-access-to-users
- https://help.lever.co/hc/en-us/articles/20087243347741-Configuring-your-Lever-application-form
- https://jobs.lever.co/lever (fetched directly, HTTP 200, checked for candidate account/login UI strings)
- https://www.jobwizard.ai/post/how-to-autofill-lever-job-applications-with-jobwizard (corroborating, non-primary)
- https://fylla.app/autofill-lever-jobs (corroborating, non-primary)
- https://fillhero.com/autofill/lever/ (corroborating, non-primary)

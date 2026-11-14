# Legacy engine safety audit: first-pass findings

**Date:** 14 November 2026. **Status:** Source-level preliminary audit; not a complete code, security or clinical validation review.  
**Scope inspected:** `components/simulator/HazardLogSimulator.tsx`, `components/simulator/feedback.ts`, `components/simulator/validation.ts` and `components/simulator/pdf/types.ts`. Legacy training routes remain retired from the public interface.

## Release blockers before any reuse

| Priority | Evidence from code | Why it is unsafe for decision validation | Required correction |
| --- | --- | --- | --- |
| P0 | `buildControlsList` in `HazardLogSimulator.tsx` assigns `implementationStatus: "Implemented"` and `verificationStatus: "Verified"` to all text in existing control fields. The UI explicitly says "Existing entries default to Implemented and Verified." | A user-entered claim becomes purported verification with no evidence. `generateActions` then excludes those entries from requests to verify controls. | Collect implementation and verification status **independently**, with evidence identifiers and reviewer adjudication; default unknown/unverified. |
| P0 | `acceptabilityFor(band)` maps `Low` → `Acceptable` and `Medium` → `Acceptable with active monitoring`; report's `overallAcceptability` falls back to this function. | Risk score alone is not evidence of acceptable residual risk; organisational acceptance criteria, context, authority and control effectiveness are absent. | Remove implicit risk acceptance; separate claimed risk band, supported residual risk and accountable acceptance decision. |
| P0 | `validation.ts` comments and `runValidation` use scenario `feedback.severity.expected` and `feedback.likelihood.expected` to calculate governance-adjusted scores. | A teaching reference value is not validated evidence for the real deployment. Keyword/text heuristics cannot independently establish correct severity or likelihood. | Do not auto-correct professional risk ratings from reference answers. Produce reviewable evidence-gap/inconsistency findings. |
| P1 | `feedback.ts` `matchKeywordGroups` uses case-insensitive substring checks to determine whether a concept is covered; `evaluateControls` joins user lines then uses that matcher. | Mentioning a term (including negation or an ineffective control) may count as meeting the required safeguard. Semantic context, implementation and effectiveness are not established. | Treat matchers as retrieval aids only; every consequential coverage conclusion requires evidence, context and qualified verification. |
| P1 | `HazardLogSimulator.tsx` uses a 10-step `STEPS` flow ending in "Reference answer & feedback". | The interaction assesses user answers and reflects a training/simulator experience rather than professional decision-validation records. | Never expose this workflow as the professional interface. Build an independent evidence-and-findings workflow. |
| P1 | `buildHazardLogReport` defaults the report's `author` to "Clinical Safety Officer / Product Safety Lead" if user ownership is not recognised, and produces `lastReviewed: now`. | Metadata might be mistaken for actual authorship or completed review. | Require authenticated actor/role and explicit review events; never synthesize reviewer identity or review date. |
| P1 | `runValidation` produces a severity adjustment/concern/recommendation status from heuristic text and scenario expectations. | May create false reassurance or over-confident escalations. | Isolate this legacy scoring from new method; introduce independently reviewed rules with source applicability and uncertainty. |

## Further checks before engine reuse

- Inventory all import paths to confirm retired simulator cannot be reached via alternate public routes or API endpoints.
- Audit existing PDF templates for misleading "audit-ready", verified, accepted, reviewed or approved language (not yet completed).
- Audit existing keyword rules against counterexamples including negation, false statements and controls that exist but are ineffective.
- Verify residual risk scoring and risk acceptance against organisation-specific criteria; no global threshold.
- Review privacy, authentication, data handling, retention, security and permissions before accepting confidential safety cases.
- Verify accessibility, reproducibility, chronology and version provenance for any exported safety record.
- Construct clinical reference cases and obtain independent CSO adjudication.

## Decision

**Do not reuse the legacy engine as professional safety decision validation.** Preserve source for controlled review and regression only. The new method specification defines separate, evidence-led behaviour. Until qualified validation is completed, the project website must continue to describe both professional capabilities as **in development**.

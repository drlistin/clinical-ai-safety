# Decision-validity core v0.2: internal implementation note

**Date:** 18 November 2026  
**Status:** Research implementation, pending independent CSO review. This is a bounded decision-validation method prototype, not a validated professional service, deployment authoriser or general medical AI evaluator.

**Approved design basis:** `docs/safety-decision-validity-design-v0.2-proposed.md` on the parent design branch (draft PR #15).  
**Clinical case:** Oxford-inspired fictional scenario v0.1 in draft PR #14, deliberately unchanged.

## Implemented without breaking v0.1

- New typed v0.2 case and claim contract at `lib/safety-decision/decision-validity-types-v0.2.ts`.
- Separate deterministic evaluator at `lib/safety-decision/decision-validity-v0.2.ts`; no public route or existing engine rewiring.
- `tests/safety-decision-validity-v0.2.test.cjs` includes synthetic structurally coherent, flawed, borderline and mismatch examples.

### Rule coverage

| Criterion | New bounded behavior | Explicit limitation |
| --- | --- | --- |
| SDC-01 | Requires material context dimensions declared *for this scenario*, flags unknown or unreasoned exclusions | Does not independently decide which clinical dimensions matter; empty dimension plan is challenged |
| SDC-03 | Checks named owner for safeguard | Presence of name does not prove delegated responsibility |
| SDC-04 | Challenges implementation claims without local implementation evidence matching model, population, setting and workflow | Reviewer-supplied source metadata cannot verify an actual implementation |
| SDC-05 | Challenges effectiveness claims without local evaluation and defined method, outcome and denominator | A complete method field does not prove the study is valid or powered |
| SDC-06 | Challenges claimed independence when two listed controls share explicitly documented dependencies | Does not infer hidden common-cause mechanisms or discover unknown hazards |
| SDC-07 | Requires initial + residual risk assessments, an organisation risk-method reference, and evidence-linked control-specific risk-change claims; identified hazards without assessments flagged | Cannot verify risk matrix thresholds, mathematically rescore risks, or assign risk bands |
| SDC-08 | Tracks CSO review, risk acceptance, deployment authorisation and monitoring separately | Does not authenticate authority, signatures or enforce national regulatory compliance |
| SDC-09 | Detects evidence time-boundary errors, missing or duplicate references, and local evidence scope mismatch | Does not establish authenticity, scientific validity or citation truth |
| **SDC-10** | Flags a control that is merely a workflow activity when the risk argument credits it with mitigation; challenges undefined safeguard mechanism and invalid hazard link | Explicit structured relationship required; does **not** interpret natural-language control descriptions or automatically call any real system unsafe |

No runtime SDC-02 hazard-discovery claim: the expert-reference comparator remains conditional on independently approved reference cases. No new CIR engine: versioned change-impact and historical evidence snapshots are future implementation stages.

## Example: transfer workflow versus patient-identity safeguard

A `workflow-activity` such as manual copying of a generated note into an EPR may itself produce misfiled, truncated or mismatched records. If the residual-risk argument credits **that activity alone** with reducing transfer risk, the new engine emits a *candidate* SDC-10 control-mechanism concern and SDC-07 unsubstantiated risk-reduction concern.

By contrast, a separately declared patient-identity and source/destination verification control with a clear `detect` mechanism is not automatically flagged as circular. **Neither case receives a clinical safety verdict.**

## Evidence and false-reassurance boundaries

Evidence marked `local-effectiveness` must contain claimed review metadata, exact case scope, a methodology, outcome and denominator definition before the *minimum documentation check* passes. These fields may still be untrue, inaccurate, methodologically inadequate or nonrepresentative. A zero-warning case can therefore still be unsafe.

**Do not use these results as independent clinical findings.** No expert case adjudication exists; software passing only demonstrates bounded consistency properties. Critical output remains:
- `reviewStatus: unadjudicated`
- `residualRiskClassification: not-determined`
- `deploymentApproval: not-assessed`
- each finding `reviewerDisposition: null`

## Next release gates

1. Review design and source clauses with independently qualified CSOs. Do not convert prior preliminary Oxford Q1-Q7 observations into gold labels.
2. Preserve transparent Oxford v0.1 unchanged; prepare a less-cued v0.2 case with separate restricted case-author notes and reviewer-facing packet. **Do not commit hidden gold labels to this public repository.**
3. Ask two blinded CSOs to independently review the v0.2 packet; use a third qualified adjudicator and preserve dissent.
4. Compare candidate findings against adjudication for consequential omissions and unsupported warnings. Include sound cases, baseline structured CSO review and honest uncertainty.
5. Only then consider a restricted professional-facing safety decision report. No public assessment form, patient data ingestion, automated approval or deployment.

**Operational restraint:** No service deployment, document-upload backend, database, general-purpose agent, background monitoring, authentication or monetisation implementation is justified at this phase.

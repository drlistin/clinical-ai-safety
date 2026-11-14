# Safety evidence checks v0.1.0: implementation boundary

**Date:** 14 November 2026. **Status:** internal prototype, no professional release.

## Implemented

The deterministic `evaluateSafetyEvidence` function provides only document/claim-level consistency prompts for:
- SDC-01 incomplete context;
- SDC-03 missing control ownership;
- SDC-04 claimed implementation unsupported by reviewed local operational evidence;
- SDC-05 claimed effectiveness unsupported by reviewed local operational evidence plus recorded reviewer reasoning;
- SDC-07 residual-risk claim missing a versioned risk method, missing control or relying on unverified control;
- SDC-08 missing acceptance authority/documentary evidence;
- SDC-09 broken evidence references.

**Never outputs risk acceptability or a risk score.** Returns `deploymentApproval: "not-assessed"` and `residualRiskClassification: "not-determined"` even when no evidence gaps are found.

An evidence register entry, reviewed date and note are **not** proof of true control effectiveness: checks confirm minimum documentation presence only. Evidence authenticity, applicability, clinical validity and sufficiency require independent qualified review. The method must not be used to sign a clinical safety case.

## Not implemented

SDC-02 clinical hazard coverage, SDC-06 interactions, source clause applicability under SDC-09, organisational acceptance criteria evaluation, expert adjudication, and CIR-01/CIR-02 reassessment logic. These need validated reference cases and source mapping. This version does not evaluate the content of documentation, only structured assertions/evidence links.

## Release gate

The test suite contains synthetic boundary/counterexample fixtures and is a **software regression check only**. No clinical sensitivity, specificity, false-negative rate, completeness, NHS endorsement or deployment acceptability is implied.

The public website continues to say both professional capabilities are under development. No route/API invokes this engine.

## To run

`npm run test:safety` (Node test runner; TypeScript module transpiled in memory for test only). Also run `npm run lint` and `npm run build`.

## Known remaining threats

- User can falsely mark a document as local operational evidence and falsely state it was reviewed.
- Reviewer notes can be inadequate despite being non-empty.
- A cited acceptance document can contain an unapproved or inapplicable decision.
- Linked evidence can belong to a different version, population or practice.
- Missing or duplicate control/hazard identifiers need input-schema checks.
- A missing finding is **not** evidence that no hazard exists.
- Evidence review workflow, secure storage, provenance and source-version verification remain absent.

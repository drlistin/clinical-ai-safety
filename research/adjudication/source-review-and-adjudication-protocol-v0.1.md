# CSO source dossier and independent adjudication package v0.1

**14 November 2026 | Internal research artefact | No approved clinical conclusions**

## What is included

Three evidence dossiers in `research/adjudication/dossiers-v0.1.json`:

1. Oxford NHS AVT evaluation: 398 logged uses and documented editing; error frequencies are not patient harm.
2. GOSH multicentre AVT evaluation: clinician interviews on attribution, negative findings and over-summarisation; not proven injury incidents.
3. HSSIB e-RS second interim report: investigated visibility hazard and local assurance problems in **non-AI** clinical IT. Test only transferable clinical risk arguments, not an AVT incident.

The selected cases are **not independent patient incidents**; several recorded observations originate from the same report.

## Evidence boundary and publication check

A reviewer must verify each PDF page or official HTML section against the version recorded in the source register and report corrections with exact locator/date. At this stage Oxford screenshots and textual content were inspected; GOSH textual content at report pp.73-74 was examined but a screenshot fetch failed and a separate PDF visual verification is pending. HSSIB official HTML was inspected. No one has independently signed a source-verification statement.

Do not insert verbatim copyrighted reports into the repo. Use short anchored paraphrases and link to publisher documents.

## Reviewer allocation

Proposed: at least two independent qualified CSOs, with a third qualified adjudicator to resolve or preserve disagreement. The roles must be identified and credentials/conflicts checked. No project author, model or engine output can substitute for independent review.

1. Verify source observations with version/date/section.
2. Separately judge whether each candidate hazard is supported, plausible, unsupported, or indeterminate.
3. Identify whether the evidence is from a post-event evaluation/investigation. Do **not** assume it could have been known pre-deployment.
4. Assess candidate controls and strength of available operational implementation/effectiveness evidence; mark not supplied where appropriate.
5. Record an evidence-bound residual risk rationale **without creating numeric risk bands**. Actual acceptance authority and signature must be real and separately verified.
6. Identify governance and further evidence requests.
7. Record each independent reviewer finding before comparison or consensus meeting. Record disagreements verbatim (with consent and access control).
8. Only panel-adjudicated findings may become reference labels; no automatic import of unreviewed dossiers into runtime.

## Blinding

Keep completed reviewer forms and adjudicated reference findings in access-controlled storage, not this public repository. Blind test assessors to reference findings, and if comparing conventional review/CSC-QT and our SDC, allocate reviewers/cases to avoid carryover. CSC-QT remains a comparator only, never the source of reference truth.

## Format and fields

The companion `reviewer-record-template-v0.1.json` is intentionally entirely unfilled. Use a separate copy per dossier, reviewer and review occasion. Complete source checking first, then independent judgement; identify evidence uncertainty and proposed governance actions. The adjudicator records disagreement without overriding the underlying independent records.

## Study gate

Do not claim sensitivity, specificity, compliance, reduced harm or residual risk acceptability from the initial three dossiers. A source-rich dossier is not an independent clinical gold standard. Before prospective performance claims, expand sources and cases, pre-register selection rules, and obtain suitable research governance determination.

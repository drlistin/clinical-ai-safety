# AVT Safety Decision Challenge: independent adjudication protocol v0.1

**Created:** 14 November 2026. **Status:** Research protocol, not an approved clinical study or validated instrument.

## Purpose and reference standard

Evaluate whether the Clinical AI Safety method identifies evidence gaps, invalid control assumptions, interactions and unsupported residual-risk reasoning **beyond conventional structured document review**. The output is not a deployment recommendation.

The initial 12 scenarios are fictional, constructed from failure mechanisms discussed in NHS England's ambient scribing guidance (v3, updated 29 July 2026). They are **not real incident reports**, and supplied evidence descriptions are narrative placeholders, not genuine assessed records. Some scenarios deliberately include extensive documented controls to assess overcalling. No scenario in this pack has yet been adjudicated.

Sources:
- [NHS England ambient scribing guidance, v3](https://www.england.nhs.uk/long-read/guidance-on-the-use-of-ai-enabled-ambient-scribing-products-in-health-and-care-settings/), especially 1.1–1.5, 3.1, A2.1.1 and A2.8.
- [NHS England / MHRA AVT regulatory status information](https://www.england.nhs.uk/long-read/medical-device-regulation-for-ambient-voice-technology-products/), July 2026. Distinguish documentation from intended diagnosis, treatment and automated action.
- [NHS England DCB0129 / DCB0160 national review](https://www.england.nhs.uk/long-read/national-review-of-clinical-risk-management-standardsdcb0129-and-dcb0160-supporting-information/), June 2026. This is review background, **not an enacted replacement standard**.
- Oskrochi and Grimes, CSC-QT (BMJ Innovations, August 2026). Full 36-indicator instrument still required for defensible overlap analysis: https://innovations.bmj.com/content/early/2026/08/26/bmjinnov-2026-001660

## Data and case controls

- All patient, supplier and practice details must be fictional. Do not accept real patient records in this repository.
- Each case has an immutable ID and version. Amendments create a new version with a change log.
- The case pack includes **no gold labels** and all `expertReferenceStatus` values must remain `draft` until documented adjudication.
- Narrative evidence descriptions cannot be presented as verified operational evidence.
- No automatic inference of medical-device status solely from a feature name; examine actual intended purpose and current regulatory criteria with appropriate expertise.

## Adjudication design

**Proposed panel:** at least 3 qualified professionals, including two practising Clinical Safety Officers with relevant digital health deployment experience. An independent clinical specialist familiar with AVT workflows is preferable. Verify expertise, role, conflicts of interest and confidentiality arrangements before assigning cases.

1. **Source review:** reviewers independently inspect current official sources and the complete CSC-QT. The project maintainer documents exact versions, retrieved dates and clause applicability; disputed interpretations are marked unresolved.
2. **Independent first pass:** each adjudicator separately reviews each scenario, records credible hazards and interactions, evidence sufficiency, control ownership/implementation/effectiveness, residual-risk argument and necessary governance response. No group discussion.
3. **Reference finding formation:** capture finding ID, supporting scenario facts, exact source or clinical rationale, relevance, materiality, uncertainty, possible alternative explanations and what additional information could change the conclusion.
4. **Consensus meeting:** compare independent judgements, explicitly preserve dissent and uncertainty. Do not force consensus when evidence is insufficient. An agreed finding is **panel-adjudicated within this scenario only**, not clinically proven or universally applicable.
5. **Blinded comparative evaluation:** reviewers assess cases under two distinct conditions (structured document review versus proposed SDC output), using separate persons or counterbalanced case allocations to limit contamination and order effects. Reviewers must not have seen the reference key for the test set.
6. **Error analysis:** document false alarms, unresolved true negatives, missed consequential findings, differences between reviewers, time taken, additional evidence requests and the proportion of findings acted on or rejected.
7. **Decision gate:** no public operational interface or claims of diagnostic performance based on this small feasibility pack. Expand the sample, settings, reviewers and source coverage before clinical performance claims.

**Blinding caution:** Keeping the open-case narratives in a repository does not ensure blinding. The adjudicated reference key must remain under separate restricted access, with reviewers allocated appropriately; do not store private keys or clinical data in a public repository.

## Reviewer record fields

For each reviewer and case, record:

- Case ID / version, review identifier, date, reviewer professional role and relevant experience.
- Initial independent findings; exact hazard/control/interaction references; cited source and version; factual support; relevance and severity of *the potential consequence* (not automatic numerical risk score).
- Proposed classification: `substantiated gap`, `potential concern`, `no significant gap on supplied facts`, or `indeterminate / further evidence needed`. These labels refer only to the **reviewer's judgement**, not a software safety verdict.
- Source applicability and control evidence limitations.
- Alternative explanations, uncertainty, requested evidence and governance actions.
- Final adjudicated state, dissent and rationale; reviewer signature or approved identity.
- Whether the finding was detected by structured review and/or SDC, time, and any unsupported extra findings.

## Proposed feasibility analysis

Report counts per finding and per case; detection relative to adjudicated findings with confidence intervals only if sample size and design permit meaningful estimates; unsupported finding rate, adjudicator agreement, review effort and incremental findings beyond CSC-QT-style document review. Provide numerator/denominator and state that a 12-case study is too small for generalisable accuracy or patient-safety benefit claims.

**Primary gate:** qualified CSOs consider identified findings clinically consequential and the review process has a tolerable unsupported-finding burden.

**Governance:** obtain necessary research/service-evaluation determinations before any real-world recruitment or data access. No assumption of NHS endorsement or automatic DCB/DTAC compliance.

## After adjudication

Only after independent approval, create an access-controlled expert-reference version compatible with `reference-contracts.ts`: authorised reviewer ID, verified case context, mapped conditional hazards and interactions, cited evidence records and traceable review status. Until then, the `evaluateReferenceChallenges` engine is **not applicable** to these drafts.

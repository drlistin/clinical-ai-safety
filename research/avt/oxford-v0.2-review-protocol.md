# CAS-SDC-AVT-02 | Review allocation and source-boundary protocol

**19 November 2026 | Version 0.2.0 | Protocol status: draft, unadjudicated**

This is a **safety decision validation exercise** for qualified CSOs. It is neither a simulation platform, a teaching case nor a professional performance test.

## Scope and nonnegotiable boundaries

- A fictional November 2026 AVT deployment decision informed by a real external Oxford AVT evaluation published February 2026. **No Oxford NHS safety decision or supplier safety case is reconstructed.**
- Only the Oxford source is real. All local numbers, supplier claims, named roles, system versions, product, SOP, clinical risk method and local assurances in the reviewer packet are **synthetic case materials**.
- No individual patient details, real confidential trust records or real clinical risk approvals are included.
- This packet is an *independent reviewer input*, not a published clinical risk classification, gold-standard hazard list, or approved clinical reference case.
- The existing v0.1 Oxford packet and project Q1–Q7 critique are **not** reviewer materials. They were used during design and may cue intended weaknesses.
- Do not claim external validity, sensitivity/specificity, harm reduction, DCB0129/DCB0160 compliance or deployment readiness from a single dossier.

## Files and allocation

| File | Audience | Purpose |
| --- | --- | --- |
| `oxford-v0.2-reviewer-packet.md` | Qualified independent reviewer | Case and fictional source/evidence synopsis, with primary Oxford source link |
| `oxford-v0.2-submitted-exhibits.md` | Qualified independent reviewer | Synthetic document extracts: supplier validation, local audit, SOP, risk method |
| `oxford-v0.2-independent-review-form.md` | Qualified independent reviewer | Blank structured record; no suggested right answer |
| This protocol | Project coordinator and reviewers where needed | Allocation, confidentiality, contamination and source handling |
| `oxford-v0.2-case-manifest.json` | Project coordinator | Version, classification and source time boundary; no expected findings |

**External source**: TheHill and Oxford University Hospitals NHS Foundation Trust, *Ambient Voice Technology in Acute Services: An Evaluation*, February 2026, https://www.thehilloxford.org/wp-content/uploads/2026/02/Ambient-Voice-Technology-AVT-in-Acute-Services-An-Evaluation.pdf ; relevant printed pp. 5 (editing data) and 25 (limitations). Project reinspection of source PDF content and page images occurred 19 November 2026; **independent CSO source verification has not occurred**.

The source describes 398 logged AVT uses and 37.3% requiring an accuracy edit; reported editing categories are not necessarily mutually exclusive, not incident counts, and not a measure of the ability of review to find all errors.

## Reviewer eligibility and separation

1. Obtain appropriate local/research governance determination and a privacy-safe method of capturing reviewer responses, proportional to the fact that the case is wholly synthetic.
2. Select **two qualified independent CSOs** with relevant experience of DCB0160 and workflow/hazard-log assessment. Use separate reviewer IDs and record credentials, affiliations and conflicts.
3. Exclude or classify as non-blind any reviewer who helped develop this case, reviewed v0.1, saw prior Oxford critique, engine output, case-author intentions or another reviewer's findings. The project author and a prior v0.1 reviewer are **not blind participants**.
4. Supply the frozen reviewer packet, submitted documentary extracts and blank form directly. **Do not direct blind reviewers to the public GitHub repository** because v0.1 critiques and the engine design are discoverable there.
5. No project interpretation, coaching, target hazard count, change of prompt or interim reviewer comparison before the first independent returns. Clarification requests must be logged, answered consistently, and distributed without the hidden rationale.
6. Obtain a **third qualified adjudicator** after both independent opinions are locked. The adjudicator receives the original case, the two independent records and source-verified facts, and records agreements and persistent dissent.
7. Store signed forms, professional identifiers, conflict declarations and any adjudicated reference records in restricted project-managed access, **never in this public repository**.

## Timing and version integrity

The decision time is **19 November 2026**. Real external evidence from February 2026 is available at that time. Fictional observations and governance papers are dated before the proposed decision. No later finding, incident, model update or subsequent rule should be imported as though contemporaneous.

Before sending the case, record its Git blob SHA or document hash, source URLs/date, exact case/form version and recipient IDs. Freeze it during the initial review. If a material error is discovered, issue a **new** case version and record which reviewers received which version; do not silently replace files.

## Review outcome structure

Record findings separately for:
- insufficient or sufficiently specified context;
- credible hazard/interaction mechanisms and justified exclusions;
- whether each control is *causally distinct*, implemented and effective in the actual workflow;
- evidence correctness, applicability, denominators, version, scope and clinical outcome measurement;
- risk-method, initial-to-residual and governance validity;
- materially relevant concerns, competing explanations, unsupported warnings and unresolved uncertainty.

No statement from the project author becomes a reference label before independent adjudication. Even an adjudicated finding is a **case-specific reviewer conclusion**, not proof of clinical outcomes.

## Method-comparison safeguard

The internal v0.2 engine currently only evaluates **structured inputs**. It does not read this prose independently or discover unlisted clinical hazards. A person translating the dossier into structured claims could bias the comparison by encoding expected failures. Therefore:

1. Preserve the raw reviewer packet and responses.
2. Predefine and freeze a neutral extraction/mapping protocol **independent of reviewer results**, recording all judgements introduced during transcription.
3. If the mapping requires interpretation, use independent extractor review or record divergence; do not silently classify a control as `workflow-activity` because of the author's intended challenge.
4. Run the engine only after the independent review outputs and mapping rules are locked. Report what the *automated deterministic rules actually detected* and what was supplied by the extractor.
5. Compare with an appropriate conventional structured review when more cases exist. Report missed material findings and unsupported warnings, not just total flags.

## Next permitted and prohibited steps

**Permitted:** independent review invitations, frozen distribution, authenticated source checking, blinded assessments, adjudication planning, access-controlled response collection.

**Not permitted without further evidence:** treating the unadjudicated packet as a golden reference, deploying an assessment portal, accepting clinical risk, marking a control effective merely because metadata is present, deriving an automatic hazard-completeness claim, or public release of confidential reviewer records.

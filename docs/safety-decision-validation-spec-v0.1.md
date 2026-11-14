# Clinical AI Safety Decision Validation Specification v0.1

**Status:** Design baseline, not a validated evaluation method or deployment approval mechanism.  
**Date:** 14 November 2026  
**Owner:** Clinical AI Safety project; independent CSO review outstanding.  
**System definition:** A system for stress-testing clinical AI safety decisions before deployment.

## 1. Purpose and users

Support Clinical Safety Officers, digital clinical safety leads and AI governance reviewers in challenging the evidence and reasoning behind a proposed clinical AI safety decision. A second use is reviewing whether a previously documented decision requires reconsideration following a material change.

The method is **not** a teaching platform, simulation, qualification, risk acceptance authority, regulatory compliance certification or substitute for manufacturer and deployer clinical risk management.

## 2. Two professional decisions

### SDC: Safety Decision Challenge

**Inputs:** AI system/intended purpose/version, relevant clinical workflow and setting, patient groups, scope and assumptions, proposed decision, hazards, controls, evidence, initial and residual risk under the **organisation's declared risk methodology**, ownership and governance arrangements.

**Process:** scenario → hazards → control applicability and effectiveness → residual-risk reasoning → governance.

**Output:** numbered findings with facts, challenged claim, evidence cited or missing, reasoned concern, clinical consequence, assessment uncertainty, required action and accountable reviewer. **Do not issue a "safe to deploy" verdict.**

### CIR: Change Impact Review

**Inputs:** a reproducible prior decision record and the evidence it relied on; the changed model/version, configuration, workflow, staffing, supplier responsibility, monitoring outcome, incident, new evidence or new requirement.

**Process:** identify changed assumptions → identify impacted hazards/controls/evidence → determine what previous risk argument must be reviewed → document governance action.

**Output:** specific affected decisions and *reassessment requirements*; not an automatic inference that the changed system is unsafe or safe.

## 3. Evidence model

Every claim is associated with:

- **Provenance:** source title, author/publisher, stable URL or controlled document identifier, version/date, and observed/reviewed date.
- **Classification:** applicable published standard or law; official guidance; peer-reviewed research; professional recommendation; supplier statement; local operating evidence; expert judgement; assumption.
- **Applicability:** jurisdiction, product intended purpose, manufacturer/deployer responsibilities, clinical setting, patient group, system/model version and effective period.
- **Assessment:** relevance to hazard/control, limitations, reviewer identity and review date, disputes or conflicting information.
- **Confidentiality:** only data authorised for processing; no patient-identifiable information in a public workflow.

A citation proves provenance, not truth or applicability. A named control is not evidence that it is implemented. An implemented control is not automatically verified. A verified implementation does not automatically establish clinical effectiveness.

## 4. Minimum validation criteria

| ID | Criterion | Trigger | Finding / required action |
| --- | --- | --- | --- |
| SDC-01 | Defined decision context | Intended purpose, deployment configuration or workflow not described sufficiently | Context insufficient; request missing information; do not imply assessment completeness |
| SDC-02 | Hazard coverage | Plausible patient-harm mechanism omitted from scope, with scenario facts and reviewer-supported rationale | Potential hazard for expert review; never assert a discovered hazard solely by keyword absence |
| SDC-03 | Control ownership | Safeguard relies on an organisation or role without named accountable ownership | Ownership unestablished; request responsibility and operational acceptance |
| SDC-04 | Implementation claim | Safeguard labelled implemented without implementation evidence | Implementation unverified; request evidence |
| SDC-05 | Effectiveness claim | Safeguard's effectiveness claimed without appropriate operational evidence | Effectiveness not established; identify test/operational verification needed |
| SDC-06 | Interaction / dependency | Two or more conditions may combine to defeat an otherwise plausible safeguard | Explain the scenario-specific interaction; require qualified reviewer confirmation |
| SDC-07 | Residual-risk consistency | Proposed lower risk relies on controls with unverified effectiveness or ungrounded assumptions | Risk reduction unsupported on supplied evidence; **do not automatically assign or lower a numeric category** |
| SDC-08 | Acceptance and escalation | Decision authority, applicable acceptance criteria or treatment of unresolved findings missing | Escalation/review required; do not declare risk acceptable |
| SDC-09 | Source applicability | Cited rule/standard not applicable, superseded or version unknown | Flag uncertain/superseded source and require confirmation; no silent automatic rule changes |
| CIR-01 | Change linkage | Material system/workflow/evidence change affects an earlier assumption or control | Identify linked prior finding and request targeted reassessment |
| CIR-02 | Reproducibility | Prior evidence, model version, risk method or reviewer decision cannot be reconstructed | Mark comparison indeterminate and require historical evidence |

## 5. Findings and conclusion semantics

Finding states: **potential concern**, **identified inconsistency**, **evidence insufficient**, **requires qualified review**, or **resolved with reviewed evidence**. Each finding must allow a documented disagreement and source-cited reviewer resolution.

Residual risk must be recorded **explicitly and separately** from whether the supplied evidence is sufficient. If an organisation provides its approved risk matrix and acceptance criteria, record its *claimed* risk category, methods and approved decision-maker, and challenge inconsistencies. If this information is missing, report **"Residual risk classification cannot be substantiated from supplied information"**, not an invented Low/Medium/High value.

A rule may suggest a governance step but may not independently authorise deployment, certify compliance or override accountable professional decisions. Critical or uncertain findings must remain visible in the exported record.

## 6. First scenario scope

**Candidate:** AI-enabled ambient clinical documentation in England, especially supplier-to-deployer transfer and local validity of clinician-review controls.

Test intended use, generated documentation (including omissions and misattribution), verification before sign-off, system integration, correction process, workflow burden, clinical accountability and monitoring. These are **investigation prompts**, not universally mandated controls; map precise requirements to current source clauses before declaring a violation.

Avoid first-launch expansion into generic medical AI certification, automated diagnosis, broad NHS compliance checking or general-purpose e-health software.

## 7. Comparison, validation and release gates

1. Obtain and map full CSC-QT 36-indicator instrument; distinguish duplicated document-review checks from proposed added operational challenge.
2. Develop independently adjudicated reference cases, including sound decisions, boundary cases, unowned controls, weak evidence, interacting hazards and change-trigger cases.
3. Blindly compare detection and unsupported findings with structured document review / appropriately qualified CSO review. Record adjudication, disagreements, timing, uncertainty and limitations; do not extrapolate from a small pilot.
4. Test counterexamples and false reassurance: a mentioned keyword is **not** proof of a control; an "existing" label is **not** proof of effectiveness; a low risk score is **not** an authorisation.
5. Independent CSO review is required before professional claims or exposure of an operational assessment interface.

**Release status:** No professional decision-support engine approved. No validated sensitivity, specificity, false-negative rate or effect on patient safety is claimed.

## 8. Source register (initial entries: verification still required at clause level)

| Source ID | Source | Status and relevance | URL |
| --- | --- | --- | --- |
| NHS-DCB0129 | Clinical risk management in manufacture, DCB0129 | Published information standard; applicability to supplier/manufacturer | https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0129-clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems |
| NHS-DCB0160 | Clinical risk management in deployment and use, DCB0160 | Published information standard; applicability to deploying organisations | https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0160-clinical-risk-management-its-application-in-the-deployment-and-use-of-health-it-systems/ |
| NHS-AVT-2026 | NHS England ambient scribing guidance, version 3, updated 29 July 2026 | Official guidance, England-specific; not a universal approval criterion | https://www.england.nhs.uk/long-read/guidance-on-the-use-of-ai-enabled-ambient-scribing-products-in-health-and-care-settings/ |
| NHS-REVIEW-2026 | National DCB0129/DCB0160 review supporting information, 29 June 2026 | Consultation context; **not a replacement standard** | https://www.england.nhs.uk/long-read/national-review-of-clinical-risk-management-standardsdcb0129-and-dcb0160-supporting-information/ |
| CSC-QT-2026 | Oskrochi & Grimes, BMJ Innovations, CSC-QT | Published research, 36-indicator instrument; overlap analysis pending | https://innovations.bmj.com/content/early/2026/08/26/bmjinnov-2026-001660 |

**Important:** The sources register above is not an approved clause-level compliance mapping. UK statutory duties and their current application require precise legal review; the 2026 NHS national review states that the *currently published* standards remain subject to the existing "have regard to" position for bodies exercising health and care functions notwithstanding changes enabling enhanced future duties.

## 9. Deferred architecture (not yet implemented)

Versioned source rules; immutable historical assessment snapshots; provenance-linked findings; deterministic check evaluations with explicit uncertainty; expert-review/override log; impact graph linking changed elements to earlier assumptions; access-control and retention policies; change monitoring only after reliable source checks.

**No automatic publication of revised safety criteria when an external source changes.**

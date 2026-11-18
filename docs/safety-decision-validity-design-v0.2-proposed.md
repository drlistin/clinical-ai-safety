# Clinical AI Safety: decision-validity method specification v0.2 (proposal)

**Date:** 18 November 2026  
**Status:** Proposed design, not implemented or independently validated. Review required before modifying runtime rules.  
**Identity:** A system for stress-testing clinical AI safety decisions before deployment.  
**Primary users:** Clinical Safety Officers, digital clinical safety leads and AI governance/DTAC reviewers.  
**Scope:** Safety Decision Challenge (SDC) and Change Impact Review (CIR).  
**Not:** a simulator, educational platform, compliance certificate, clinical risk acceptance authority, or generic AI benchmark.

## 1. Design evidence and independence

This proposal draws on the Oxford AVT source-anchored fictional decision case `OUH-PROSPECTIVE-SDC-001` (draft PR #14) and a first Q1-Q7 preliminary clinical review. The review raised clinical context omissions, inadequate hazard coverage, invalid/circular safeguard reasoning, poor evidence transferability, unsupported residual-risk claims, governance omissions and false-alarm risks.

**These preliminary findings are design hypotheses, not independent CSO-adjudicated reference truth.** Preserve the original Oxford case and unmodified reviewer observations; do not use them as gold labels. Source material about actual Oxford AVT use does not provide local safety cases or patient-harm incidence.

External anchors:
- NHS England DCB0129 manufacturer and DCB0160 deployer standards: https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0129-clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems and https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/dcb0160-clinical-risk-management-its-application-in-the-deployment-and-use-of-health-it-systems
- NHS England AI-enabled ambient scribing guidance (updated 29 July 2026): https://www.england.nhs.uk/long-read/guidance-on-the-use-of-ai-enabled-ambient-scribing-products-in-health-and-care-settings/
- Oxford AVT evaluation: https://www.thehilloxford.org/wp-content/uploads/2026/02/Ambient-Voice-Technology-AVT-in-Acute-Services-An-Evaluation.pdf

Do not turn published guidance or a pending DCB standards consultation into a claimed newly binding requirement without exact version/clause review. DTAC assurance and DPIA/data protection are adjacent evidence dependencies; neither independently proves clinical safety or replaces DCB0160.

## 2. What is validated

The object is a **specific, date-bounded proposed safety decision**, with its context, claims, dependencies, evidence and designated authority. It is **not** a general quality assessment of an AI product or the individual professional making the decision.

The central question for each claimed mitigation is:

> What plausible patient-harm pathway is this control intended to interrupt, by what preventive/detective/recovery mechanism, in what versioned local workflow, with what evidence of implementation and effectiveness, and how is the resulting risk argument accepted or escalated by the correct authority?

A record can be syntactically complete yet unsupported, causally circular or outdated.

## 3. Minimum decision packet

| Object | Essential elements | Avoid false completeness |
| --- | --- | --- |
| Decision boundary | As-of date; proposed scope/authorisation; organisation; product, model and configuration; user groups; intended purpose; excluded uses | A generic product name or populated workflow paragraph is insufficient |
| Clinical workflow | Encounter types, patient groups, baseline/current documentation process, timing of review, audio capture/downtime, draft-to-EPR stages, recipients/downstream action, structured data | Store known, unknown, not-applicable and evidence of applicability distinctly |
| Supplier/deployer evidence | Versioned supplier DCB0129 artefacts where applicable; deployer DCB0160 documents, owner, local testing, signed approvals, assumptions | Supplier statements ≠ local verification, DCB0129 ≠ substitute for DCB0160 |
| Hazard mechanism | Initiating condition → hazardous situation → exposure/downstream effect → credible harm; source and applicable conditions | Distinguish a distinct hazard from cause, contributor, consequence, change trigger or proposed control |
| Safeguard | ID, which harm pathway it interrupts, `prevents | detects | mitigates | recovers`, operational position, owner, implementation status, effectiveness evidence, dependencies and bypass/failure pathways | “Clinician signs note” ≠ evidence errors are detected; manual copy activity ≠ transfer-error mitigation |
| Risk argument | Approved method and criteria reference; initial risk and assessment justification; control-specific claimed change in likelihood/severity; residual risk and uncertainty; unresolved actions | No matrix supplied → proposed category recorded only, not independently verified |
| Governance | CSO review/evidence, control owners, authorised risk-acceptance decision, local decision to deploy, time/scope conditions, incident route, monitoring and stop/reassessment triggers | CSO safety-case review, acceptance and operational authorisation are distinct, organisation-defined steps |
| Evidence object | Source ID/document; publisher or local custodian; version/date; availability at decision date; applicability to product, population, setting and workflow; method, denominator, limitations; reviewer conclusion | Citation is provenance, not proof of local control effectiveness |

Sensitive source documents and real patient records must **not** be introduced into a public repository or website. Authenticated access, retention, information governance and security requirements are prerequisite for any confidential production workflow; these are not part of the initial research prototype.

## 4. Reasoning graph and check types

Represent the assessment as a typed graph rather than free-text fields alone:

`decision → relies on → risk claim → reduced by → safeguard → interrupts → hazard mechanism → potentially causes → patient harm`

Each material edge includes **source/evidence provenance, version/time boundary, status, uncertainty and an accountable reviewer or owner where relevant**. Additional edges: `depends on`, `shares failure condition with`, `is superseded by`, `assigned to`, `accepted by`, `transfers to downstream workflow`.

### Layer A: deterministic integrity checking (automatable now)

- Missing/unknown source references, unversioned risk methods, unowned controls.
- Unsupported implementation/effectiveness *claims* where documented evidence is absent.
- Risk-reduction claims that rely on unlinked or unsupportable safeguards.
- Hazards without initial/residual assessments; missing approval evidence; invalid source time boundaries.
- Evidence version, product, setting or denominators *when explicitly structured and independently supplied*.
- Do not equate populated metadata to a verified source; absence of a warning is not a positive safety conclusion.

### Layer B: scenario-specific causal challenges (clinical review required)

- **SDC-01:** context adequacy, including review delay, user type, downstream transfer and comparator.
- **SDC-02:** omitted/oversimplified harm pathways, when the mechanism is credible and scoped.
- **SDC-05:** whether the study measures control detection performance, not just usability/edit count.
- **SDC-06:** interacting conditions and common-cause dependencies (e.g. fatigue diminishes multiple nominal checks; patient identity and EPR transfer).
- **SDC-09:** published external evaluation ≠ local evidence; study design, denominators and applicability must support the exact claim.
- **Proposed SDC-10: control-mechanism validity**: a stated control must define a plausible risk-reducing mechanism distinct from simply performing the hazard-generating workflow. Example: “copy the note” is not itself evidence of preventing wrong-patient transfer. Flag for qualified reviewer confirmation, not universal automatic invalidity.

A candidate hazard or causal challenge suggested by an LLM or heuristic is **not** verified clinical truth. For MVP, use human-authored case facts and clinically reviewed conditional reference patterns; research-only machine-generated hypotheses may be evaluated separately and never silently converted to approved findings.

### Layer C: residual-risk and governance validity

- **SDC-07:** capture initial and proposed residual assessments under an organisation-approved, versioned method; document which specific control is claimed to change which risk component and on what evidence. If controls are unverified, **do not credit a quantified reduction**; do not assert actual residual risk equals initial risk.
- **SDC-08:** separate CSO safety-case review, accountable risk acceptance, and deployment/rollout authorisation; confirm applicable scope, conditions and outstanding actions.
- **CIR-01/CIR-02:** supplier model or system updates, deployment context, staffing/workflow changes, incident/monitoring findings or new evidence trigger targeted reassessment of impacted claims/controls, with immutable prior snapshots.

## 5. Output contract

For each finding generate an auditable record:

1. Finding ID and criterion; subject hazard/control/claim IDs.
2. Specific **challenged claim** with its owner/date/version.
3. Scenario fact(s) and exact evidence references (including unsupported/unknown).
4. Explanation of the clinical hazard or causal reasoning, including dependence on other failures.
5. **Finding class:** identified logical inconsistency, evidence insufficient, potential clinically material concern, or requires qualified review. No undifferentiated “unsafe” label.
6. Competing explanation / possibility of false alarm; what evidence could resolve it.
7. Proposed evidence request, corrective action or governance escalation, with owner **to be assigned or confirmed**, not fabricated.
8. Professional reviewer disposition, disagreement, rationale and link to approved decision where available.

Decision-level summary fields remain:
- `residualRiskClassification: not-determined | claimed-only | substantiated-under-supplied-method` (do not output a new risk band);
- `clinicalSafetyApproval: not-assessed` unless an authentic recorded approval is provided and independently verified;
- `deploymentApproval: not-assessed` by the method, regardless of warnings;
- unresolved material findings and review requirements.

“Substantiated under supplied method” must never be interpreted as independent acceptance or automatic deployment approval.

**Example (research-only):** `H-TRANSFER-02 → C-TRANSFER-02`: “Manual copy is listed as a risk-reducing safeguard, but the description only repeats the potentially error-generating transfer activity. No source-destination identity or content-verification mechanism is specified. Potential circular control claim; qualified review required. Residual risk not determined.” This is a candidate analytic finding, not expert-approved truth.

## 6. Prevent false alarms and false reassurance

- The system must allow a reviewer to mark a candidate finding **not applicable**, **already controlled**, **not clinically material**, **insufficient information**, or **unresolved**, with evidence and reason.
- Distinguish an edit for style/grammar from a consequential clinical inaccuracy; never use overall editing percentage as patient harm or review sensitivity.
- Compare introduced hazard profiles with current practice where appropriate, without treating “non-inferior” as automatically acceptable.
- A documentation-only AVT function reduces some direct-action pathways but can still alter downstream clinical decisions through the record.
- A similar legacy transcription workflow may provide transferable evidence *only if* the relevant mechanism, population and configuration are shown to be applicable.
- Use negative-control/sound-decision cases as well as flawed decisions. Do not equate more findings with better safety validation.
- Keep reviewable dissent, provenance and bounded uncertainty; no user performance scoring.

## 7. Independent validation protocol: Oxford v0.1 vs v0.2

**v0.1 transparent case:** retain unchanged as a technical regression and evidence-of-missing-document challenge, not a meaningful independent hazard-discovery benchmark.

**v0.2 less-cued case:** create a distinct synthetic prospective assessment with realistic, internally coherent documents, named owners and plausible supplier metrics. Preserve all fabricated data as synthetic in the restricted case-authoring record; never attribute fabricated performance to Oxford or a real vendor. Do not reveal intended failure mechanisms in the blinded reviewer packet. Make some signals correct/adequate so the method is tested for false positives.

**Study protection:** reviewers must not be exposed to v0.1, its critiques, method output or hidden candidate findings before independently assessing v0.2. Prevent contamination by case allocation or use independent groups; do not assume within-reviewer v0.1→v0.2 comparisons are blinded.

**Review process:** two qualified independent CSOs, conflict declarations, verification of report source facts, and third qualified adjudicator who records agreement/dissent. Preserve original responses. Determine a reference finding per clinically consequential concern only after independent review. Human adjudication does not imply clinical deployment validity.

**Measure later, with denominators:** consequential validated findings identified/missed; unsupported warnings; quality of causal and evidence trace; reviewer agreement; time required; effects versus a defined structured-review comparator. Report uncertainty and disagreements. A single fictional case cannot support sensitivity/specificity or claims of safety benefit. No professional release until appropriate validation/governance.

## 8. Architecture stages and stop gates

**Stage 0 — agreement and source truth:** independent expert review of this proposed spec; verify actual relevant standards clauses and Oxford locators; freeze v0.1. No new public interface.

**Stage 1 — minimal typed evidence/claim graph:** extend existing internal `contracts.ts` with time-bounded decision context, hazard mechanism nodes, control action/mechanism distinction, initial-risk/risk-change claims, evidence applicability and authority. Preserve old fixtures through explicit migration/versioning; use deterministic tests only.

**Stage 2 — bounded rule implementation:** add SDC-10 causal-mismatch candidate checks and SDC-07 initial-to-residual evidence trace. Tests must include deliberately sound and borderline counterexamples, not just known-bad cases.

**Stage 3 — independent case adjudication:** independently review a less-cued Oxford case before any reference-key construction; compare method to review and record both misses and false alarms. No automatic acceptance.

**Stage 4 — professional decision report:** only after adjudication demonstrates useful incremental decision validation, define a restricted evidence-to-finding report and explore professional workflow with minimal security/operational cost. Do not create a general upload portal, agent, dashboard, simulator or educational content without a validated safety decision need.

**Go/no-go:** If qualified reviewers judge findings unactionable, method overflags good decisions, or the method is not demonstrably distinct from ordinary hazard-log documentation checking, stop or narrow rather than expand the website.

## 9. Change control of this proposal

This document is **design-only**. It does not update live evaluation semantics, retrospectively alter v0.1 case outcomes, automatically approve reference labels or change production. Every proposed new check must ultimately be tested against reviewed valid, invalid, borderline and version-change cases before being presented as professionally useful.

# Clinical AI Safety: Foundational Evidence and Safety Reasoning Framework v1.0

**Prepared:** 19 November 2026 | **Status:** Research draft, source audit in progress, **not independently CSO-verified** | **Scope:** Safety Decision Challenge (SDC) | **No software or website release**

**Identity:** A system for stress-testing clinical AI safety decisions before deployment.

## 1. Purpose and boundary

This framework governs how externally available standards, guidance, evaluations and investigations can inform **candidate** clinical safety-decision challenges. It is not a safety case, regulated compliance ruling, training material or hazard-generation engine. It creates **no approved runtime rules** and **no expert gold-standard labels**.

The project-specific safety question is whether a dated, context-specific proposed clinical AI deployment decision adequately identifies foreseeable harm pathways, substantiates the controls credited, justifies its residual-risk reasoning and demonstrates appropriate governance. A source-rich case does not itself prove patient safety, and a case that passes deterministic checks is not safe by default.

**Required distinction:**

1. **Normative clause**: requirement in a specifically versioned applicable standard, with subject, condition, verb and clause.
2. **Empirical observation**: what the research or investigation actually reported, in its original population and setting.
3. **Safety hypothesis**: an explicitly **inferred**, plausible cause-to-harm pathway, not an observed incident or established property of another product.
4. **Local assurance claim**: what a deployer or supplier alleges is implemented or effective, requiring local corroboration where relevant.
5. **Qualified professional judgement**: clinical materiality, reasonable foreseeable hazard coverage, control effectiveness, residual-risk/acceptance and governance disposition, not supplied automatically by a source.

A reference proving that inaccuracy *can occur* does not establish a particular deployment's error rate, that an inaccurate record was signed, or that a specified clinician-review control failed.

## 2. Evidence categories and priority

| Category | Representative initial sources | What may be derived | What must not be derived |
| --- | --- | --- | --- |
| Published specifications | DCB0129 specification **v4.2**; DCB0160 specification **v3.2**, both 2018 publications | Exact versioned clause statements, responsibilities and documented-process requirements subject to applicability | An automatic finding of statutory breach, unconditional compliance, or safe deployment |
| Official implementation/whole-system guidance | NHS digital clinical safety assurance (2025); healthcare AMLAS supplement (2023); ambient scribing guidance version 3 (29 July 2026) | Supported interpretation and candidate investigation methods | Converting optional advice into a binding `MUST` requirement without normative authority |
| Official consultation/review | NHS England June 2026 national standards-review supporting information | State of review, contemporary concerns, legal nuance | Treating consultations as adopted amendments or definitive legal advice |
| Published empirical service evaluations | TheHill/OUH AVT (Feb 2026); GOSH DRIVE AVT multicentre report v1.3 | Observations with design and denominator limits | Local clinician-review sensitivity, a generalised patient-harm rate or an established event in another organisation |
| Independent national safety investigation | HSSIB e-RS second interim report (22 Oct 2026) | Investigated mechanisms in the specific non-AI system | Retroactively inventing what a particular prior reviewer knew, or claiming the same failure occurs in AVT |
| Local clinical safety records | Signed DCB0160 artefacts, system/workflow and verified control tests, where legitimately provided | Evidence applicable to the versioned local decision | Automatic clinical truth from a populated field or supplier assurance |
| Adjudicated clinical reference | Future independent CSO record with dissent and provenance | Case-specific judged materiality and testable reference findings | Universal completeness of hazards or proof that a product is safe |

**Methods are not legal requirements.** HAZID, SWIFT, SHARD and FRAM may be candidate analysis techniques for a given system and are not imposed on every Trust merely because they appear in NHS supplementary guidance.

**CSC-QT remains an external quality-assessment comparator** under `docs/methodological-independence-policy.md`. It must never supply our engine's rules, gold labels, risk bands or reference truth.

## 3. Source-to-claim data model

Every material source claim needs:

- `sourceId`, publisher, exact title, original publisher URL, document version, publication/effective date, date accessed and file hash when locally archived.
- Exact locator: clause (preferable for standards), printed page, figure/table or HTML heading. Preserve PDF page index separately.
- `evidenceClass`: normative specification / official guidance / consultation / service evaluation / investigation / supplier statement / local operating evidence.
- Short **faithful paraphrase** of the supported statement; not bulk-copied source text.
- Actor and scope: manufacturer / deployer / CSO; system/version; care setting, population, workflow, jurisdiction, and decision-as-of date.
- **Does not establish**: explicit prohibited overinterpretations; study bias, outcome definition, denominator, selection, missing data and whether patient outcomes were assessed.
- `retrievalStatus` and `verificationStatus` separately. A web snippet can establish a candidate source lead but not verify whole-document claims.
- `interpretationStatus`: proposed / expert-reviewed / disputed; `reviewerId`, review date, disposition and rationale where appropriate.
- Provenance edge from source claim to candidate hazard/control/governance question, with **inference** marked.

The companion `foundation-source-claim-register-v1.0.json` is the initial structured register. It is **not** executable input for the current v0.2 engine.

## 4. Reasoning graph and causal test

Use this chain for each possible finding:

`dated decision/context → workflow fact → initiating condition → hazardous situation → credible patient-harm pathway → existing controls → evidence of implementation → evidence of effectiveness → claimed residual risk → governance action`

For each edge, test:

1. **Relevant?** Does the source describe this use, population, component and version?
2. **Supported?** Is the content directly stated, or is the step a hypothesis?
3. **Causal?** Could the proposed control plausibly *interrupt* the specified pathway? An activity that causes the risk is not necessarily a risk control.
4. **Independent?** Do two controls share staff capacity, information source, interface, version, timing or another common-cause failure? Record unknown rather than automatically asserting dependence.
5. **Testable?** What result, denominator, comparator, patient-safety outcome or verified procedure would support or refute the effect?
6. **Decision-relevant?** Would the unresolved issue change the CSO's review or organisation's risk acceptance? Avoid floods of generic low-value warnings.
7. **Disconfirmable?** What contextual fact or existing evidence would make the concern inapplicable or already adequately controlled?

**Example, explicitly an inference:** An AVT service evaluation reports drafts requiring edits. For a fictional hospital crediting clinician sign-off as eliminating consequential error, request evidence that the local workflow detects material errors before signed records are used. Do not state that the external evaluation measured local review failure.

## 5. Initial source-anchored challenge patterns (NOT approved rules)

| Pattern ID | Source anchor | Conditional question | Counterexample / false-alarm guard |
| --- | --- | --- | --- |
| FND-CTX-01 | DCB0160 v3.2 §§4.2.1–4.2.3 | Is the intended use, clinical scope and operational context defined for this deployment? | A separately controlled and reviewable local annex may meet the requirement even if the summary omits detail |
| FND-HAZ-01 | DCB0160 v3.2 §4.3.1; NHS AMLAS whole-system guidance | Were plausible normal/fault-condition hazards, including human and information-flow interactions, considered within the defined scope? | No tool can prove all conceivable hazards are identified; distinguish scope exclusions and pre-existing equivalent hazard coverage |
| FND-CTL-01 | DCB0160 v3.2 §§6.3.1–6.3.3 | Does the deployment evidence distinguish implementation, verification and effectiveness of controls? | A valid control may have strong equivalent evidence in controlled documents not attached to a brief |
| FND-CLI-01 | Oxford AVT report p.5 and p.25; GOSH AVT report pp.73–74 (GOSH visual verification pending) | For a local note-review claim, has the correct clinical outcome been assessed rather than merely edit frequency, usability or transcript agreement? | A separate locally validated test may provide exactly that evidence; published edit counts are not signed-record error/harm rates |
| FND-INT-01 | NHS AMLAS whole-system guidance; HSSIB e-RS investigation (full-text recheck pending) | Can technology design, information visibility and reduced operational capacity combine to defeat an apparent safeguard? | Do not assume the e-RS 180-day feature exists in the system under review or that similar resources/worklists are present |
| FND-RSK-01 | DCB0160 v3.2 §§4.4.1, 5.1.1, 6.3.3 | Is the claimed initial-to-residual change justified using the relevant organisation's method and verified control effect? | The specification does not prescribe one universal matrix, numeric risk reduction or automatic alternative rating |
| FND-GOV-01 | DCB0160 v3.2 §§3.3, 3.5, 7.1–7.3 | Are the relevant clinical safety case, risk review, monitoring and material-change responsibilities documented? | A pending *approval* must not be misreported as a recorded rejection; separate CSO document approval from wider risk acceptance |

A pattern is eligible only for **future expert review and research testing**. It is not an automated non-compliance verdict. No finding is accepted merely because it contains a matching keyword.

## 6. Accuracy controls and release gates

### Gate S1: Primary source verification
Retrieve the current original. Record version/date, exact locator, textual and PDF visual check when needed, and extraction uncertainty. Mark remote fetch failures and GOSH screenshot failure as pending. Never silently replace inaccessible originals with summaries.

### Gate S2: Fidelity and temporal applicability
Two-pass review of material paraphrases and numerical quantities, including evidence denominators and category overlap. Keep research observation separate from causal interpretation, and 2026 knowledge separate from earlier historical decisions.

### Gate S3: Independent expert interpretation
A qualified CSO reviews and signs the proposed normative-to-clinical reasoning for its applicability and materiality. Disagreement must be preserved. **No independent source/CSO review has occurred for this v1.0 draft.**

### Gate S4: Counterexamples and prospective test design
For each candidate rule, define sound, boundary, inapplicable and uncertain cases; monitor false alarms and missed clinically consequential findings. Do not use case-author assumptions or earlier Q1–Q7 analysis as adjudicated truth.

### Gate S5: Change management
Require a dated source snapshot, reason for amendment, approval, tests, and repeat evaluation on relevant source changes. A standards consultation is not an adopted replacement. Confirm the actual legal scope of DCB duties before any legal/compliance categorisation.

### Gate S6: Engine promotion
Only a reviewed, tested, bounded finding type may be considered for the runtime engine. Inferences must remain labelled. Even promoted checks do not determine actual residual-risk bands or deployability.

## 7. Verification blockers logged on 19 November 2026

1. **GOSH report v1.3:** full PDF text was accessible, and the relevant clinician-interview passages were found at printed pp.73–74; PDF image screenshot calls failed. Mark `pdf-visual-pending`; independently recheck page layout, context and version before claiming fully verified source extraction.
2. **HSSIB e-RS second interim:** official search result and dated HSSIB publication page corroborate the 180-day worklist removal mechanism, but the detailed page could not be reopened in this web session. Mark `full-original-retrieval-pending`; do not derive specific risk ratings or historical control decisions.
3. **Ambient scribing guidance v3:** official version/date and key DCB0160/CSO/DPIA summary were available from publisher search results but full text access did not succeed; mark `full-document-recheck-pending`. Do not overstate procurement or liability implications.
4. **Standards legal duty:** June 2026 NHS England review notes changes to section 250 and states that existing bodies exercising health/care functions continue to have regard to the current standards. Other NHS pages use `mandatory`. Treat as a legal/applicability question requiring current legal/CSO review, **not** a generic automated claim of statutory breach.
5. **Independent CSO verification:** not started. No source claim is marked independently expert-approved, regardless of project desk checks.

## 8. Deliverable and next step

Deliverable v1.0 consists of **this methodology**, a versioned source/claim register and a **verification-gaps log**. It does **not** change `lib/`, the website, the locked one-case demonstration in GitHub Issue #19 or the separate blinded Oxford reviewer package in draft PR #18.

Next permitted work: correct source verification gaps and independently check the normative-to-causal mappings, then use the versioned evidence with the transparent Oxford v0.1 case. Keep v0.2 blinded CSO materials separate.

**No current clinical hazard-discovery accuracy, sensitivity, specificity, safe-deployment judgement or operational compliance certification is claimed.**

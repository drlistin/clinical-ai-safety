# Oxford-informed AVT one-case Safety Decision Challenge: technical demonstration v0.1

**Decision under challenge:** 18 November 2026 (fictional).  
**Run:** 19 November 2026, research-only.  
**Engine:** unchanged internal `evaluateDecisionValidityV02`, rule set `0.2.0-proposal` from `main`.  
**Scope:** A system for stress-testing clinical AI safety decisions before deployment.  
**Provenance:** `OUH-PROSPECTIVE-SDC-001`, v0.1.0, original public draft PR #14 at commit `2a96b478c8d18e1572a44c0bdea63a0e4e6736d9`; copied unchanged to `research/proof/oxford-prospective-case-v0.1-frozen.json`. **All local Trust, supplier, workflow, risk and governance facts are synthetic. Not an Oxford Trust decision or incident.**  
**Source status:** The published Oxford evaluation is external background, researcher desk-checked, not independently clinically or source-adjudicated. No real patient data. **Do not supply this transparent case or its findings to blind reviewers** using the separately prepared Oxford v0.2 case in PR #18.

## 1. Reproducible execution and unaltered data

- Script: `research/proof/run-oxford-one-case.cjs`, transpiles and executes the actual unchanged `lib/safety-decision/decision-validity-v0.2.ts` using TypeScript already installed for project tests. No new engine rules, risk calculator or LLM inference.
- Runner: https://github.com/drlistin/clinical-ai-safety/actions/runs/44582069218 (successful, `npm ci --ignore-scripts`, Node 22); build/reproducibility source available in draft PR #21.
- **Raw machine output:** `research/proof/results/oxford-raw-engine-output-v0.2.json` (verbatim JSON exported by successful run).
- **Actual engine input:** `research/proof/results/oxford-extracted-input-v0.2.json`.
- **Human extraction choices and primary source hash:** `research/proof/results/oxford-extraction-audit-v0.1.json`.
- **Machine run summary:** `research/proof/results/oxford-run-summary-v0.1.json`.
- Source data contains exactly **2 already-authored hazard records** (`H-DOC-01`, `H-TRANSFER-02`) and **2 already-authored control records** (`C-REVIEW-01`, `C-TRANSFER-02`). No independent SDC-02 hazard discovery occurred.
- **Actual raw output:** **13 candidate findings**, not 13 clinically confirmed defects. **SDC-01: 1; SDC-04: 1; SDC-05: 1; SDC-07: 6; SDC-08: 4**. No other criterion fired on this input.
- Explicit results: `reviewStatus = unadjudicated`; `residualRiskClassification = not-determined`; `deploymentApproval = not-assessed`. All `reviewerDisposition = null`.

## 2. One traceable decision challenge: clinician review as an effective safeguard

| Link | Exact supplied source or software fact | Interpretation boundary |
| --- | --- | --- |
| Decision | Fictional team proposes broader clinic deployment and a provisional **'Low'** residual category for documentation inaccuracy, relying on mandatory clinician review and proposed SOP | A claim, not independently determined risk or actual acceptance |
| Hazard | `H-DOC-01`: AVT may omit, misattribute or invent clinically significant note content; undetected inaccurate signed record may affect subsequent management | Hazard supplied by case author, **not discovered by engine** |
| Safeguard | `C-REVIEW-01`: clinician checks/edits draft and signs it before EPR entry; v0.1 source marks `effectiveness-supported` | Extractor maps to `effectiveness-claimed`; this is a claim, not verification |
| Stated implementation evidence | `E-SOP-01`: fictional draft SOP, classified **assumption**, not independently observed local implementation | SDC-04 rejects this as a `local-implementation` record; finding **V02-F-002** |
| Stated effectiveness evidence | `E-OUH-01`: published external evaluation; `E-SUPPLIER-01`: fictional supplier assertion; `E-WALKTHROUGH-01`: six-user synthetic usability walkthrough | None is typed as a local methodologically defined effectiveness study. SDC-05 produces **V02-F-003**. Does not establish that the control is clinically ineffective |
| Risk method and initial risk | Fictional method name exists, **no versioned method evidence record**; initial risk category and rationale missing | SDC-07 **V02-F-004** and **V02-F-005** |
| Causal effect on risk | Team says review makes risk Low but does not specify whether likelihood or severity is affected. Extractor maps `claimedRiskChange=reduced` and `assertedEffectOn=none` because no component is stated | SDC-07 **V02-F-006**; **extractor-sensitive** inference, not proof the team literally asserted 'none' |
| Credited local effect evidence | The claimed reduction cites the external study, supplier statement and walkthrough rather than a local reviewed error-detection evaluation | SDC-07 **V02-F-007**; overlaps **V02-F-003**, not two independently proven clinical failures |
| Residual risk | Output retains `not-determined` | The system cannot authoritatively reclassify Low as Moderate or High |

**Defensible technical statement:** Given the supplied records and extractor mappings, the deterministic engine identified that the fictional team's claimed clinician-review effectiveness and consequent risk reduction lack linked, locally applicable *documented* evaluation evidence. This is a **candidate challenge for CSO review**, not a validated finding that review fails in practice or that deployment is unsafe.

## 3. Complete raw-finding disposition inventory

| Raw ID | Criterion | Software-identified issue | Independent clinical status |
| --- | --- | --- | --- |
| V02-F-001 | SDC-01 | Researcher-selected `review-opportunity` context dimension marked unknown | Extraction-dependent; not independently discovered |
| V02-F-002 | SDC-04 | SOP assumption does not support claimed implementation of `C-REVIEW-01` | Documentation gap; source could be an abbreviated packet |
| V02-F-003 | SDC-05 | No linked reviewed local effectiveness evaluation for `C-REVIEW-01` | Relevant candidate finding; no effectiveness judgement |
| V02-F-004 | SDC-07 | Missing applicable reviewed risk-method evidence for `H-DOC-01` | Documentary deficiency |
| V02-F-005 | SDC-07 | Initial/residual assessment details incomplete for `H-DOC-01` | Documentary deficiency |
| V02-F-006 | SDC-07 | Risk-reduction claim lacks a named likelihood/severity component | **Extractor-sensitive** `assertedEffectOn=none` |
| V02-F-007 | SDC-07 | No local control-specific effectiveness evidence supporting risk reduction | Overlaps F-003 |
| V02-F-008 | SDC-07 | No reviewed risk-method record for `H-TRANSFER-02` | Same missing-method family as F-004 |
| V02-F-009 | SDC-07 | Missing initial/residual transfer-hazard risk detail | Missing or draft-stage material |
| V02-F-010 | SDC-08 | CSO review/decision record not present | **Stage-sensitive:** review may be pending in prospective dossier |
| V02-F-011 | SDC-08 | Organisation risk acceptance record not present | **Stage-sensitive:** proposed board does not equal acceptance |
| V02-F-012 | SDC-08 | Deployment-authorisation record not present | **Stage-sensitive:** prospective deployment may not yet require signature |
| V02-F-013 | SDC-08 | No recorded reviewed monitoring-plan evidence | Draft-stage gap; not proof monitoring will be absent |

**Grouping:** Thirteen row-level software warnings correspond to approximately **five analytic families** (context, claimed implementation, claimed effectiveness, risk argument, governance). The row count is not a count of unique hazards or clinically consequential errors. **No false-positive fraction can be calculated without independent reference decisions.**

## 4. Preliminary Q1–Q7 comparison (NOT clinical gold)

The earlier Q1–Q7 observations were project-generated preliminary critique, **not** a versioned independent CSO adjudication dossier. This is a qualitative comparison of topics, not measured sensitivity or agreement.

| Preliminary topic | Where the engine overlapped | What the engine missed or cannot verify |
| --- | --- | --- |
| **Q1. Scenario context**: review opportunity, intended workflow, downstream use and practical detail incomplete | SDC-01 flags **one researcher-selected unknown dimension** | Does not autonomously determine necessary context; other dimensions are not inspected unless supplied in `materialContextDimensionIds` |
| **Q2. Hazard completeness**: candidate omitted or wrong-patient content, automation bias, integration/session failure and inequitable performance | None; two hazard IDs were supplied before evaluation | **SDC-02 independent hazard discovery is not implemented**; cannot establish missed material hazards |
| **Q3. Control adequacy**: SOP, walkthrough and sign-off not equivalent to demonstrated detection or effective implementation | SDC-04, SDC-05; one C-REVIEW evidence track | No authentic control testing; no qualified judgement of clinical efficacy; lacks independent check on `C-TRANSFER-02` owner because extractor classifies copy as a workflow activity |
| **Q4. Evidence applicability**: external evaluation/supplier claims cannot verify local control | SDC-05/SDC-07 reject metadata class as locally effective | Does not independently read the Oxford PDF, appraise study quality or judge a new supplier's generalisability |
| **Q5. Residual-risk reasoning**: claimed Low category lacks methodology/initial risk/causal evidence | Six SDC-07 rows across two hazards | Cannot determine actual numerical or categorical residual risk |
| **Q6–Q7. Interactions, governance and disposition**: shared human/workflow dependencies, approval/monitoring and accountable owners require examination | Four SDC-08 governance alerts | Does not generate a novel common-cause interaction without a supplied independence assertion, or authenticate signatures and decision authority |

**Source caution:** Do not cite this comparison as a benchmark, formal Q1–Q7 gold label or replicated CSO agreement. It is descriptive prior-project critique.

## 5. What was found, missed, and might be a false alarm

**Found by deterministic rules:** missing declared local implementation/effectiveness documentation, unsupported control-specific risk reduction, incomplete hazard risk arguments, absence of recorded governance milestones and a researcher-labelled unknown context.

**Not independently found:** additional clinically consequential hazard types, multiple-speaker misattribution mechanism, wrong-patient transfer, loss of structured data, additional control interactions, alternative explanations or counterexamples, adequacy of the local reviewing clinician's accuracy and workload.

**Potentially unsupported warning mechanisms:**
1. `review-opportunity` was **selected and marked unknown by the extractor**, not inferred by the engine.
2. SDC-07 component inconsistency F-006 arises because extractor chose `assertedEffectOn=none` when the case did not specify likelihood/severity. An implicit likelihood claim is a plausible alternative interpretation.
3. SDC-08 'missing CSO/risk acceptance/deployment authority' could represent appropriate *not-yet-due* approvals in a **prospective proposed decision**. The report must distinguish an actionable pre-approval requirement from a compliance failure.
4. Duplicate SDC-05 / SDC-07 concern and shared risk-method warnings could overwhelm reviewers if presented as independent unsafe findings.
5. Case was deliberately constructed with weak evidence, increasing likelihood of a positive technical result.

**Potential material miss:** The synthetic case lists `C-TRANSFER-02` as a "control" without a named owner, yet it was mapped to `workflow-activity`. The v0.2 rule checks safeguard owners only and did **not** flag this. Whether the original activity should be credited as a separate control is a professional causal judgement; mapping may itself determine which alerts appear. No `SDC-10` alert occurred. No SDC-06 independence alert occurred because the case made **no explicit independence claim**.

**Experimental demonstration result:** 13 deterministic alerts, zero adjudicated findings, two supplied hazards, zero novel hazard discovery. This case alone cannot measure sensitivity, specificity, positive predictive value, precision, or false-positive burden.

## 6. Bounded go/no-go

| Decision | Determination |
| --- | --- |
| Is one run reproducibly executable against a frozen synthetic case with source-to-finding links? | **YES: technical proof achieved**, including exact input and raw output and a checked provenance audit |
| Does the engine expose missing controls/evidence/risk documentation for a deliberately incomplete case? | **YES, as structured metadata alerts**, not as independently validated clinical safety concerns |
| Has the core scientific hypothesis been demonstrated: incremental clinically consequential findings beyond ordinary CSO review at tolerable false-alert cost? | **NO. Untested.** No independent adjudicated reference, no blind comparator and no sound/counterexample case tested |
| Is there evidence to add more generic rules, publish clinical validation, or introduce public assessment service? | **NO** |
| Is an independent blinded case review justified as a bounded research next step? | **Conditional research go**, subject to original-source checks, reviewer independence and prespecified professional reference criteria |

**Recommendation:** Freeze this proof as a technical result, avoid optimising rules to make this case look more impressive, and develop the independent CSO adjudication/comparator process on a distinct less-cued case. Examine **incremental true clinical materiality and unsupported-alert burden**, not total warning volume.

## 7. Scope and regulatory limitations

This is a **research method**, not a compliance certificate, medical device approval, clinical safety case, DCB0129/DCB0160 risk acceptance, a product deployment or a substitute for a Clinical Safety Officer. A fictional 'Low' proposal does not imply a justified Low residual-risk band. No direct evidence of improved real-world patient outcomes or of reduced deployment risk has been produced.

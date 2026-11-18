# Source evidence audit: Oxford AVT, GOSH AVT and HSSIB e-RS

**Desk review date:** 18 November 2026
**Review status:** Preliminary source-to-claim check by project researcher. Not independent CSO review, not qualified source-verification sign-off, and not an adjudicated reference standard.
**Related files:** research/adjudication/dossiers-v0.1.json; research/real-world/evidence-register-v0.1.json; research/adjudication/reviewer-record-template-v0.1.json.

## Evidence classification and review status

| Dossier | Source and exact locator | Desk-review finding | Outstanding release gate |
| --- | --- | --- | --- |
| DOS-OUH-001 | TheHill/Oxford evaluation, printed pp. 5 and 12, PDF indices 4 and 11 | Core figures and workflow-complexity statements match publisher PDF text and page images inspected 18 Nov 2026. Published pilot evaluation, not adjudicated harm. | Independent source confirmation and separate qualified CSO adjudication. |
| DOS-GOSH-001 | GOSH DRIVE v1.3 dated 11 Feb 2026, printed pp. 73-74, PDF indices 72-73 | Publisher PDF's indexed text supports the attribution, negatives, proofreading and over-summarisation themes. The original publisher PDF page images could not be fetched during this review; visual page check remains open. | Independently inspect the original PDF page images/layout and verify source context, then qualified CSO adjudication. |
| DOS-HSSIB-ERS-001 | HSSIB second interim report, published 22 Oct 2026, Executive summary and sections 2.1-2.4 | The official HSSIB indexed report text supports the 180-day removal mechanism, missing national hazard-log reference and provider DCB0160 evidence gaps. Direct full-page retrieval failed; this is an indexed-source desk check, not a signed full source audit. Non-AI clinical IT. | Independently inspect current official full report and section contexts, then qualified CSO adjudication of prospective transfer. |

## Claim-specific checks

### Oxford: source SRC-OUH-2026

Original: https://www.thehilloxford.org/wp-content/uploads/2026/02/Ambient-Voice-Technology-AVT-in-Acute-Services-An-Evaluation.pdf

- Printed page 5 reports **37.3% of 398 logged AVT uses** needed accuracy edits. It reports 126 entries for clinical-information accuracy, 43 for spelling/punctuation/grammar, and 24 for invented/hallucinated information.
- **Do not sum 126 + 43 + 24 as disjoint encounters**. The published wording does not establish mutually exclusive categories and the sum exceeds 37.3% of 398; categories and denominators need clarification before quantitative secondary analysis.
- Distinguish **24 recorded hallucination-related editing usages** (report labels 6.2% of logged usages) from **44.4% of post-pilot survey respondents reporting at least one hallucination experience**. These refer to different collection frames and cannot be pooled.
- The report itself questions whether some user-labelled hallucinations represented mis-transcriptions or templating effects. Treat these as self-reported editing categories, not independently verified invented events.
- Printed page 12 associates greater issues with complex, multi-voice and qualitative workflows; it also reports positive documentation-accuracy ratings in several questions. A local control's effectiveness cannot be inferred solely from the pilot.
- **Required dossier care:** preserve numerator/denominator definitions, uncertainty in error classification and the evaluation's reported benefits. Neither patient injury nor control failure is established by the frequency of edits.

### GOSH: source SRC-GOSH-2026

Original: https://media.gosh.nhs.uk/documents/AAI_Phase_4_NHSE_Final_Report_1.3.pdf
Publisher listing: https://www.gosh.nhs.uk/our-research/drive-unit-for-digital-innovation/drive-resources/

- Version 1.3 (11 February 2026), printed page 73, section 5 interview themes, discusses fabricated diagnoses, incorrect clinical impressions, wrong attribution of symptoms or treatments, difficulty retaining explicit negatives, and clinician proofreading.
- Printed page 74 reports over-summarisation or filtering of clinically important details, particularly descriptive or multiple-problem consultations; also reports benefits of information capture.
- These are **qualitative clinician interview findings**. There is no basis here for a unique error-event denominator, a verified patient-harm count, or a particular trust's pre-deployment risk-acceptance failure.
- **Source limitation retained:** PDF text was accessible and checked at reported page boundaries, but attempts to fetch screenshots of PDF indices 72 and 73 failed. Do not claim visual original-page verification or independent source sign-off.
- **Required dossier care:** preserve favourable as well as unfavourable observations, and ask experts separately about the plausibility and clinical materiality of candidate harm pathways.

### HSSIB e-RS: source SRC-HSSIB-ERS-2026

Original: https://www.hssib.org.uk/patient-safety-investigations/electronic-patient-record-systems-electronic-referrals-for-ongoing-care/second-interim-report/

- Published 22 October 2026. The 180-day worklist removal was designed partly to prevent performance degradation but simultaneously created a referral-visibility hazard under current conditions.
- HSSIB reports that the national e-RS hazard log version 1.3 (January 2024), and the live log described to its investigators, lacked a reference to that function. HSSIB states it could not fully ascertain why.
- HSSIB reports that the providers it engaged with could not produce evidence of DCB0160 requirements having been met for e-RS. **Do not generalise this sample to every NHS provider or conclude misconduct from unavailable documentation.**
- Administrative controls varied in formality and effectiveness; reduced capacity and unclear roles were associated with repeat incidents in investigated settings.
- HSSIB reports over 1.3 million entries removed from e-RS worklists Feb-Jul 2026, including 127,450 from inbound worklists. **These are not a count of harmed patients, unbooked referrals or proven missed appointments.** National data do not establish each entry's local processing status.
- Unlike the AVT evaluation dossiers, this is an **investigated non-AI digital safety mechanism**. Its use is limited to a prospective safety-decision reasoning test, never an AVT incident or real historical AI deployment decision.
- The source's EBSX12 weekly worklist drop-off extract and provider escalation/ownership prompts provide candidate *control verification questions*, not proof any particular control is implemented or effective.
- **Source limitation retained:** official indexed report content checked, but direct original HTML fetch failed. Further independent full-report verification is required.

## Adjacent watch entry (not an adjudication source)

HSSIB's AVT investigation (6 August 2026) still shows **launched**, with a report expected summer 2027 at the recorded review. Do not promote an investigation announcement into a confirmed clinical incident, finding, or test label.

Official: https://www.hssib.org.uk/patient-safety-investigations/the-use-of-ambient-voice-technology-in-hospitals/

## What the sources do NOT provide

No dossier contains the original supplier and deployer clinical risk management files, a reliably dated pre-deployment decision, locally verified controls, a relevant risk-acceptance matrix, recorded risk acceptance by its authority, full patient outcomes, or independent CSO findings. A historical safety decision cannot be reconstructed by filling these gaps with assumptions.

## Reviewer-ready package: next controlled steps

1. Obtain independent confirmation of the exact publisher source versions/locators, including GOSH original page images and complete HSSIB report.
2. Freeze a versioned dossier set with evidence class, source access date, known unknowns and time-knowledge boundaries. Avoid retrospectively leaking findings into earlier decisions.
3. Issue separate blank reviewer-record templates to **two independent qualified CSOs**; verify roles, relevant deployment experience, conflicts, confidentiality and freedom from access to any model output/reference key.
4. Have reviewers assess scenario-specific hazards, candidate controls, implementation/effectiveness evidence, residual-risk argument **using an actual organisation's declared method where available**, and governance actions independently.
5. Obtain a **third qualified adjudicator** to resolve or explicitly preserve disagreement; retain independent originals under appropriate controlled access, not in the public repository.
6. Keep the published observations, the later analytical hypotheses and any synthetic prospective decision materials distinct.
7. Do not import a draft dossier as an expert reference or publish clinical performance claims until review, comparison and relevant research governance requirements are satisfied.

**Dispositions as of 18 Nov 2026:** Oxford = source claim desk check completed / independent verification pending; GOSH = source text corroborated / visual check and independent verification pending; HSSIB = official indexed text corroborated / complete report and independent verification pending. **All three = CSO adjudication not started.**

## Unresolved questions for the next review

- Should quantitative interpretation be restricted to the Oxford report's own categories until mutually exclusive denominators are obtained?
- Can publisher-authenticated GOSH v1.3 original pages 73-74 be visually verified and preserved as page/section locators without reproducing the report?
- Can an independent reviewer obtain and inspect the full HSSIB interim report, including the factual boundary around the 127,450 inbound removals?
- Will the prospective v0.1 validation use a **synthetic, dated pre-deployment decision record**, clearly separated from post-event data, as the actual thing challenged?

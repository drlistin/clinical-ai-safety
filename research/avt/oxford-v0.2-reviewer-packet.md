# CAS-SDC-AVT-02 | Proposed ambient documentation deployment

**Independent clinical safety decision review | Case version 0.2.0 | Decision as of 19 November 2026**

**Fictional research case.** All organisation, supplier, product, local study and risk-governance details below are constructed for this assessment. No real patient data are included. The only real-world external evaluation cited is the published Oxford AVT report. This packet is not an actual NHS safety case or deployment request.

## Decision submitted for review

Northbridge Acute Trust (fictional) asks its Digital Assurance Group to consider an **eight-week controlled expansion** of an ambient voice documentation product, **Orion Scribe**, configuration `2.4.1-clinic`, in adult general medicine outpatient follow-up clinics. The existing limited pilot has involved eight clinicians. The proposal would extend use to **24 clinicians across four clinic streams**.

The project team considers its listed risk controls proportionate to the proposed documentation-only purpose and recommends that the expansion be authorised subject to routine monitoring and the usual Trust governance process. A final deployment decision has **not** been recorded.

Please assess whether the **submitted safety reasoning and evidence** are sufficient for that decision and identify any material additional information, safeguards or governance action required. You may agree, disagree or qualify any claim. Do not infer that the document is complete merely because it supplies a named control or risk category.

## A. Intended use and clinical workflow

| Item | Submitted position |
| --- | --- |
| Product / version | Orion Scribe, synthetic supplier Orion Clinical Systems, application 2.4.1-clinic, model family `OS-Med-2.4` |
| Intended function | Draft clinic notes and letters from spoken consultations; no prescribing, diagnostic recommendation, triage, order entry or autonomous EPR write-back |
| Intended users | Consultants, registrars and advanced clinical practitioners with local induction; use voluntary during this phase |
| Care setting | Adult general medicine follow-up, 15-minute appointment slots, predominantly face-to-face; some patients accompanied by relatives |
| Exclusions | Interpreted consultations, remote consultations and patients declining audio capture are excluded from this expansion |
| Current documentation | Digital dictation followed by transcription and clinician review, with letters manually filed in the EPR |
| AVT capture | Clinician initiates and ends a consultation session in a standalone browser application; an encounter identifier is entered at session start |
| Review | Clinician edits the generated draft and signs the final EPR text; the SOP recommends review before the next patient where feasible, and otherwise by the close of the next working day |
| Transfer | Clinician copies the edited text into the open EPR record, checks patient identifiers and signs the document. Structured medication and allergy fields remain separate EPR tasks |
| Downstream use | Signed text forms the clinic record and is used to generate correspondence to the GP and, where appropriate, the patient |
| Downtime | Revert to digital dictation or direct EPR entry. Local helpdesk handles product availability problems |
| Data handling | Supplier describes encrypted audio and draft storage with a 30-day standard retention setting; a local DPIA summary is recorded as reviewed by the IG lead |

The proposed scope does not include emergency departments, inpatient ward rounds or autonomous clinical decision-making.

## B. Submitted evidence register

| ID | Document or observation | Scope and reported result |
| --- | --- | --- |
| S-01 | Orion Clinical Systems, Clinical Safety Summary, rev. 2.4, dated 2 Nov 2026 (synthetic) | Manufacturer summary refers to a DCB0129 clinical safety case and hazard log for OS-Med-2.4. A full hazard-log extract can be requested from the supplier. |
| S-02 | Supplier technical validation excerpt, rev. 2.4 (synthetic) | Reports **98.2% agreement** with reference transcription over **18,400 assessed phrase units** from 210 synthetic and consented recordings. The summary describes predominantly single-speaker encounters. |
| L-01 | Local six-week feasibility report, issued 12 Nov 2026 (synthetic) | Eight clinicians used the product in **168 consultations**, producing **154 signed notes**. The implementation team reviewed a sample of **80 signed notes**; 77 were marked acceptable with no more than minor changes at the time of review. |
| L-02 | Review timing extract from the same pilot (synthetic) | Median clinician editing time **3.6 minutes** (IQR 2.2–6.5). Of 154 signed notes, **127** were finalised before clinicians left clinic that day; the remainder were completed later. |
| L-03 | Transfer assurance sample, 13 Nov 2026 (synthetic) | The EPR analyst sampled **36 completed AVT-derived EPR documents**, comparing source and destination text. All 36 were classified as transferred without content loss; exceptions were not recorded in this sample. |
| L-04 | Current-practice baseline snapshot, October 2026 (synthetic) | A convenience review of **80 dictated letters** identified **nine** requiring substantive clinician corrections after transcription. Median documented turnaround from consultation to signed letter: **31 hours**. |
| G-01 | Local SOP `DOC-AVT-04` v1.2, approved 6 Nov 2026 (synthetic) | Covers capture, draft review, manual EPR transfer, patient-identifier confirmation, sign-off, refusal of recording and downtime fallback. |
| G-02 | Local assurance register, rev. 4, compiled 17 Nov 2026 (synthetic) | Contains the hazard/control summary below, names operational owners and references the Trust's fictional risk matrix `CRM-MAT-05` v3.1. |
| G-03 | CSO review note, 17 Nov 2026 (synthetic) | The Trust's named CSO, Dr A. Hale (fictional), recorded review of the expansion proposal and requested that the Digital Assurance Group consider the residual-risk claims. |
| G-04 | Governance and monitoring proposal, 17 Nov 2026 (synthetic) | Proposes weekly safety sampling, an AVT incident flag in the local reporting system, supplier change notifications, four-week and eight-week reviews, and immediate escalation of serious concerns. |
| E-01 | Published Oxford University Hospitals and TheHill AVT evaluation, February 2026 (real external source) | Four products across heterogeneous acute services; **398 logged uses**, with **37.3%** recording accuracy edits. The report also describes reported time savings and staff-wellbeing benefits. |

The synthetic documents are summarised as supplied to the decision-maker, not independently authenticated records. A reviewer may request their fuller methods, raw observations, signatures, or version history.

**Real external source E-01:** TheHill and Oxford University Hospitals NHS Foundation Trust, *Ambient Voice Technology in Acute Services: An Evaluation*, February 2026. https://www.thehilloxford.org/wp-content/uploads/2026/02/Ambient-Voice-Technology-AVT-in-Acute-Services-An-Evaluation.pdf (especially printed pp. 5, 12 and 25).

## C. Current hazard and control summary

| Hazard | Described hazardous situation and potential harm | Submitted safeguards | Owner |
| --- | --- | --- | --- |
| H-01 | Generated note contains clinically inaccurate content; downstream clinicians may act on a misleading record | C-01 clinician draft review and EPR sign-off; C-03 incident review and supplier escalation | Medical service lead |
| H-02 | Differences arise while moving the corrected note into the EPR; resulting record may be incomplete or inaccurate | C-02 controlled transfer using the SOP and identifier confirmation; C-01 final review/sign-off | Outpatient operations lead |
| H-03 | Product unavailability delays documentation | C-04 dictation/direct-EPR fallback; C-03 operational incident escalation | Digital service manager |

**Control descriptions from G-02 (fictional):**

**C-01: Clinician document verification.** Clinicians review the AVT draft, make necessary clinical corrections, and sign the final EPR document. The SOP records clinician responsibility for the content and the pilot describes routine use of review functionality.

**C-02: Controlled AVT-to-EPR transfer.** The treating clinician opens the destination EPR encounter, confirms name and date of birth against the active consultation, transfers the reviewed text, checks the document display and signs it. This is recorded as a combined identity and content-integrity safeguard.

**C-03: Reporting, correction and escalation.** Clinicians can report safety concerns using the local AVT flag; the outpatient service lead can correct records and notify the supplier if a product issue is suspected.

**C-04: Documentation continuity.** Clinicians use the pre-existing digital dictation or direct EPR pathway if AVT is unavailable or a patient does not wish to be recorded.

The project team describes C-01 and C-02 as operating during the pilot, supported by local observations L-01 to L-03. There is no assertion that every error has been or could be detected.

## D. Risk method and proposed risk argument

The submitted fictional Trust method `CRM-MAT-05` v3.1 uses severity and likelihood categories numbered **1–5**, and a product score for local review. The following *fictional* bands are stated in the project summary: 1–4 Low; 5–9 Moderate; 10–16 High; 17–25 Very High. These are **not NHS-wide thresholds**.

| Hazard | Initial S × L | Proposed residual S × L | Claimed effect | Evidence named |
| --- | --- | --- | --- | --- |
| H-01 | 4 × 3 = 12 (High) | 4 × 1 = 4 (Low) | Lower likelihood after clinician review and incident escalation | S-01, S-02, L-01, L-02, E-01 |
| H-02 | 4 × 2 = 8 (Moderate) | 4 × 1 = 4 (Low) | Lower likelihood through controlled transfer and sign-off | G-01, L-03 |
| H-03 | 3 × 2 = 6 (Moderate) | 3 × 1 = 3 (Low) | Reduced consequence of product disruption through fallback | G-01, G-04 |

The risk matrix version is named in G-02. Its underlying approval record and detailed likelihood definitions are held in the Trust policy library; the submitted summary contains the categories above.

The project team proposes retaining the identified controls during the expansion and reconsidering the risk assessment if material incidents, substantial workflow changes or supplier-reported safety changes arise.

## E. Governance and decision requested

- **Clinical risk management:** Dr A. Hale, CSO (fictional), documented a review note on 17 November. The outpatient operations lead and clinical service lead are responsible for their assigned control areas.
- **Supplier assurance:** The procurement team records receipt of the supplier's safety summary and a request route for its full supporting hazard-log artefacts.
- **Data protection and product assurance:** The IG lead records the DPIA summary as reviewed. Other applicable organisational digital-assurance requirements are managed through the established procurement pathway.
- **Monitoring:** Weekly samples of signed documents, incident review, and four-week/eight-week checkpoints are proposed. Reports are to go to the clinical service lead and CSO.
- **Change control:** The supplier communicates material application/model changes through release notices; the digital programme lead reviews changes with the clinical service lead.
- **Acceptance:** The Digital Assurance Group is the proposed approving body for the limited expansion under Trust policy. The recorded team recommendation is for a controlled eight-week expansion. **The Group's decision is pending.**

**Question for professional review:** Is the decision sufficiently supported to recommend approval, conditional approval, deferral or another governance action? Explain the material evidence and reasoning, state uncertainty, and identify what would change your view. Do not treat any proposed risk rating or local summary as independently validated.

## F. Independent review instructions

Please use a separate **CAS-SDC-AVT-02 reviewer response form** and record:

1. How you interpret the proposed safety decision and its context.
2. Hazardous situations, interacting factors and any significant exclusions.
3. Control design, ownership, implementation and demonstrated effectiveness.
4. Whether each important source actually supports the claim made from it.
5. Whether the initial-to-residual risk and governance argument is defensible under the submitted method.
6. Material concerns, uncertain concerns and possible false alarms, with reasons and evidence requests.

Do not use model outputs, prior versions of this case or another reviewer's response. This is an **independent safety-decision assessment**, not a professional competency test. There is no required number of findings or target conclusion. Documenting that a claim is adequately supported is as useful as identifying a problem.

**Review boundary:** No actual NHS Trust, supplier, product, local pilot, patient or decision is represented by the fictional material above. Real Oxford findings are external background only and do not establish this fictional product's safety, incident rate or clinical effectiveness.

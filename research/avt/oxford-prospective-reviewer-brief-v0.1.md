# OUH-PROSPECTIVE-SDC-001: independent reviewer brief

**Version:** 0.1.0 (18 November 2026)  
**Study status:** Fictional, real-world-informed prospective safety decision. Not a historic decision, incident or expert adjudication.  
**Audience:** Qualified CSOs / digital clinical safety leads participating in a controlled independent review.  
**No patient, supplier or trust in the proposed deployment is real.**

## The external evidence available at the proposed decision date

A February 2026 evaluation by TheHill and Oxford University Hospitals NHS Foundation Trust examined four ambient voice technologies in heterogeneous services. It reported 398 logged uses, of which 37.3% required editing for accuracy, with reasons including 126 clinical-information edits, 43 language edits and 24 invented-information edits. These categories cannot be assumed mutually exclusive or clinically harmful. The report also found that complex and multi-voice settings had particular challenges and recommended timely clinician review and phased deployment. Its limitations explicitly include self-report, absent randomisation/control groups and no direct patient-outcome or systematic error tracking.

**Primary source:** https://www.thehilloxford.org/wp-content/uploads/2026/02/Ambient-Voice-Technology-AVT-in-Acute-Services-An-Evaluation.pdf  
**Exact locators:** printed pp.5, 12, 25 and 27 (PDF indices 4, 11, 24, 26).  
**Evidence status:** Project desk check only, with independent source verification pending. The 2026 publication is contemporaneously available to this later fictional decision; it is not local testing of the proposed product.

## Fictional proposed deployment

A fictional acute trust in England is considering AVT note drafting in adult general-medicine follow-up clinics. Appointments are normally 15 minutes; some consultations are multi-problem or include relatives. The candidate system drafts notes in a stand-alone web application. The treating clinician is expected to edit and verify the draft, manually copy final text into the EPR and sign the record. The system does not autonomously diagnose, triage, prescribe or take clinical action. The system/model identifiers are synthetic.

The fictional project team has proposed:

- **H-DOC-01:** an inaccurate, omitted, misattributed or invented detail may survive into a signed note and influence later management.
- **H-TRANSFER-02:** text signed in the EPR may not match the final corrected AVT note.
- **C-REVIEW-01:** treating-clinician review and sign-off is described as implemented and effective. A draft SOP is mentioned, a six-user usability walkthrough is reported, an unspecified synthetic supplier assertion is cited, and the published Oxford report is referenced. No authenticated, reviewed local evaluation of clinically consequential error detection is supplied.
- **C-TRANSFER-02:** the clinician manually copies and signs the note. An accountable owner for this transfer safeguard is not identified in the supplied packet.
- **Risk argument:** the project team proposes a **Low** residual-risk category for H-DOC-01, attributing risk reduction to C-REVIEW-01. A fictional risk-method name is supplied, but its actual method text and a recorded acceptance decision are not provided. H-TRANSFER-02 has no proposed residual-risk category.

The team requests a safety-decision challenge before deployment. The proposed rating and wording are fictional assertions to be tested, **not actual findings of a CSO or a trust's decision**.

## Independent review task

Document separately:

1. Clinical context and any critical missing decision information.
2. Credible and material patient-harm pathways, and any hazards to add, reject or defer with reasons.
3. Whether each proposed control's *existence*, local implementation, technical verification and clinical effectiveness are separately supported.
4. Interaction or dependency concerns, such as workload, multi-speaker attribution, timing of review, and manual EPR transfer, recording when the supplied material cannot resolve them.
5. What can and cannot be concluded about each claimed residual-risk classification under a verified organisational method.
6. Required source, operational, supplier and local evidence; accountable governance/escalation actions.
7. Alternative interpretations, uncertain findings and possible false alarms.

Do **not** calculate a universal severity/likelihood band or infer risk acceptance. Do not treat Oxford's editing counts as patient injuries or as the detection failure rate of clinician review. Do not infer negligence or a historic failure at Oxford.

## Review and blinding

Reviewers should receive this scenario and original report, **not** engine output or an adjudicated answer key. Use a separate blank reviewer form for each independent review. Record role/experience/conflicts, source access, findings, exact evidence, uncertainty and dissent. Store completed forms in restricted access, never in the public repository. Two independent qualified CSOs, followed by a third qualified adjudicator, are proposed. No adjudication or performance measurement has yet occurred.

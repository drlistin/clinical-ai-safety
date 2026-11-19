# CAS-SDC-AVT-02 | Submitted documentary extracts

**Companion to case v0.2.0 | Decision date: 19 November 2026**

**Fictional research extracts, not real NHS or supplier records.** All names, versions, operational data, methods and conclusions below were constructed for this case. These extracts form part of the material submitted to independent CSO reviewers; they are not adjudicated findings.

## Exhibit A | Supplier technical excerpt S-02

**Supplier:** Orion Clinical Systems (fictional)  
**Product:** Orion Scribe, model family OS-Med-2.4, technical validation rev. 2.4 dated 2 November 2026

> **Technical transcription validation summary**
>
> The validation dataset comprised 210 recorded encounters and 18,400 reference phrase units. Accuracy was estimated by automated comparison of transcribed phrases with the reference phrases. Overall phrase agreement was reported as **98.2%**. The evaluation included clinical vocabulary and dictated follow-up consultations; most recordings were in English and involved one primary speaker. Performance was aggregated across the dataset. 
>
> Intended use is the generation of a clinical draft subject to confirmation by a qualified healthcare professional. It does not make autonomous treatment decisions.

The manufacturer's clinical safety summary S-01 refers to a separate DCB0129 hazard log and risk management file. The supplier contact will provide these to the Trust assurance lead on request. This excerpt is a fictional evidence claim and does **not** represent the actual Oxford trial's supplier performance.

## Exhibit B | Local pilot review extract L-01/L-02

**Pilot:** Northbridge Acute Trust general medicine follow-up clinics (fictional)  
**Period:** 28 September to 9 November 2026  
**Product configuration:** Orion Scribe 2.4.1-clinic  
**Participating clinicians:** eight volunteers, including consultants, registrars and advanced clinical practitioners

| Measure | Recorded pilot summary |
| --- | --- |
| Consultations in which AVT was initiated | 168 |
| Completed and signed EPR notes originating in AVT | 154 |
| Signed notes in the documentation-quality sample | 80 |
| Sample assessed as suitable with no more than minor amendments at clinician review | 77 of 80 |
| Median active editing time | 3.6 minutes (IQR 2.2–6.5) |
| Signed before clinician left clinic on encounter day | 127 of 154 |
| Other signed notes | 27 of 154, completed subsequently |

**Quality review method:** the local implementation lead generated a simple random sample from the signed-note list. The signing clinician was asked to indicate whether the final record appeared suitable for routine onward correspondence, using `acceptable without major correction` or `needs further major correction`. Auditors did not routinely replay original audio for this review. The result was recorded as a feasibility and documentation-quality observation.

**Workflow observations:** users reported time saved compared with dictation. Some drafts were corrected during clinic; some were finalised later. The project team considers the present sign-off process compatible with existing local documentation practice.

## Exhibit C | Transfer assurance extract L-03

**EPR source-to-destination comparison:** the EPR analyst selected 36 AVT-derived documents from a list of **completed signed documents** and compared the displayed signed text with the stored final text in the AVT browser output.

**Reported result:** 36/36 compared documents matched in the main text field, without recorded content truncation or formatting loss that required correction.

**Audit scope:** the comparison used the note IDs from the completed-document list and text comparison. Patient-identity confirmation is described in the local SOP, and the comparison used note IDs drawn from the completed-document list.

**Baseline L-04:** nine of 80 digital-dictation letters in a convenience sample were revised for substantive content after initial transcription. Sample selection and timing were not matched to the AVT pilot.

## Exhibit D | Approved SOP extract G-01

**Document:** `DOC-AVT-04` v1.2 | Approved 6 November 2026 by the fictional outpatient governance lead.

1. Confirm an appropriate outpatient encounter is selected and record the encounter identifier in Orion Scribe.
2. Explain the documentation method in accordance with Trust policy; respect a patient's refusal to be recorded and use the conventional pathway.
3. Start and stop capture explicitly. Where a session is interrupted, review its contents before proceeding.
4. Check the generated output for the clinical information expected in the final record and correct it in the AVT interface.
5. Open the destination EPR encounter, compare patient name and date of birth, paste the corrected text into the document editor, review its display, and sign.
6. Update medication, allergy and other structured EPR modules separately when required by clinical decisions.
7. If AVT is unavailable, use dictation or direct EPR entry. Report product or documentation issues through the local reporting route.

**Timing:** completion during clinic is preferred; routine documentation must be signed by the end of the next working day. This SOP does not itself define a mandatory interval between consultation and initial verification.

**Recordkeeping:** the EPR records the final signing clinician and time; the AVT service retains a draft audit history for the supplier's standard 30-day retention interval.

## Exhibit E | Risk matrix excerpt and governance G-02/G-03/G-04

**Trust method:** `CRM-MAT-05` v3.1 (fictional). The Trust summary defines severity from 1 (negligible) to 5 (catastrophic) and likelihood from 1 (rare) to 5 (almost certain). Proposed overall band is the product of the two scores: 1–4 Low; 5–9 Moderate; 10–16 High; 17–25 Very High. The full policy document contains governance approval thresholds, individual descriptions and guidance on scoring frequency; it has not been reproduced in this extract.

**CSO review note:** Dr A. Hale, fictional Trust CSO, reviewed the pack on 17 November 2026. The note states that the Digital Assurance Group should make a scope-limited expansion decision after considering the supplier summary, local pilot and current risk register. It records no final decision by that Group.

**Monitoring outline:** weekly sample of 20 signed AVT documents during the proposed eight weeks; local incident review each week, with immediate notification of incidents assessed locally as serious. Four-week and eight-week governance checkpoints are proposed. Clinicians can suspend AVT and revert to baseline documentation. The proposal assigns the digital programme lead to oversee supplier change notices and determine when further clinical safety review is required.

**Approval request:** the project team proposes expansion to 24 clinicians in four clinic streams for eight weeks. The Digital Assurance Group may amend the scope, impose conditions or decline the request.

---

**Source boundary:** The fictional supplier and local extracts above are not derived from the Oxford publication and cannot be cited as evidence about any real product or NHS organisation. The primary real-world background report is separately linked in the case packet.

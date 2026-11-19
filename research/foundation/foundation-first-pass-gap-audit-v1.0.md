# Foundation v1.0 — Bounded first-pass evidence gap audit

**Audit date:** 19 November 2026  
**Status:** Research-only **web source-discovery audit**; **not** a completed PubMed/MEDLINE, Embase, systematic or comprehensive scoping search.  
**Method:** Sixteen dated keyword/site-query strings executed through ranked public web search, with targeted inspection of publisher/original-source and PubMed-indexed records. Exact query text and provisional candidate dispositions are preserved in `foundation-search-execution-log-v1.0.json`. Exact per-query time, total web result counts, export hashes and database-wide denominators were not available and are **not imputed**. The nine earlier sources remain pre-protocol seeds.

## 1. Reproducibility boundary: what was and was not executed

| Search component | Actually performed | Not performed / cannot be claimed |
| --- | --- | --- |
| S1 standards and guidance | Six site-targeted search strings; selected official original pages / indexed guidance located | Systematic full-site enumeration; independently certified legal interpretation |
| S2 safety engineering | Three targeted web discovery strings, plus follow-up title searches; selected original publisher/abstract records inspected | Complete safety-engineering bibliographic search, full texts of all papers, independent source adjudication |
| S3 ambient clinical AI | Four distinct web discovery strings including `site:pubmed.ncbi.nlm.nih.gov`, plus follow-up title searches; selected original JMIR/Springer/PubMed abstracts inspected | **PubMed fielded query did not execute** (direct search/E-utilities access unsuccessful); **Ovid Embase was not accessible/connected**; zero database search denominators are reported |
| S4 investigated IT failures | Three HSSIB domain-specific discovery strings, followed by inspection of selected HSSIB official full HTML pages | Complete HSSIB investigation census or formal transferability assessment |

**Selected web candidates:** 19 unique recorded records, of which 10 were provisionally marked core, 6 context-only, and 3 excluded (two wrong-purpose studies, one duplicate of the existing HSSIB seed). These are **not PRISMA flow counts**; the selected 19 are a subset of ranked web results intentionally retained for screening. The true number of search results and screened records remains unknown.

## 2. Material missing evidence families

| Priority | Candidate sources (record IDs) | Why the source family matters to Clinical AI Safety | What it does NOT establish |
| --- | --- | --- | --- |
| **High** | **2018 safety-case review of 20 national/local systems** (`DISC-S2-01`): https://www.sciencedirect.com/science/article/pii/S0925753517310238 | Prior empirical critique of safety-case reasoning in England; reported limitations in depth and clarity of hazard analysis. Sets an important baseline for our value proposition and comparator | That an LLM review improves those cases, or that the 20 constitute an independent generalisable reference set |
| **High** | **2019 proactive health IT hazard-analysis software study** (`DISC-S2-02`): https://pubmed.ncbi.nlm.nih.gov/31165661/ | Existing research precedent for software-supported hazard identification and traceable safety-case production in electronic prescribing. Requires a direct comparison before we claim novelty | That this earlier software has or lacks our particular capabilities; original methods/full text require review |
| **High** | **SEIPS 2.0** (`DISC-S2-03`): https://pubmed.ncbi.nlm.nih.gov/24088063/; **STPA in healthcare interoperability** (`DISC-S2-04`): https://pmc.ncbi.nlm.nih.gov/articles/PMC7233088/ | Stronger explicit sociotechnical/work-system and control-feedback reasoning than generic lists of LLM errors | That SEIPS or STPA is mandated by DCB0129/DCB0160, or that one method guarantees all hazard identification |
| **High** | **English integrated ambient scribe evaluation** (`DISC-S3-04`): https://medinform.jmir.org/2026/1/e88472 | Published 29 May 2026; longitudinal qualitative data from 45 individuals and 16 hours of observation document integration tradeoffs and contextual consequences. Highly relevant to local AVT control validity | A patient harm incidence, measured comparative efficacy of a particular control, or universal effects across Trusts |
| **High** | **2026 prospective note-safety audit** (`DISC-S3-03`): https://medinform.jmir.org/2026/1/e86474 | Of 7,545 draft notes generated, 356 (4.7%) received physician quality assessment. Reported 337/356 (94.7%) without significant errors and 19/356 (5.3%) with potentially serious errors if not corrected. Provides both reassuring and concerning observations and a concrete example of selection/denominator limits | Incident rate, rate after clinician correction, a random sample estimate from all 7,545, or reviewer sensitivity. Outcomes are **potential severity of draft errors**, not proven patient injury |
| **High** | **2025/26 randomised ambient-scribe trial** (`DISC-S3-02`): https://pubmed.ncbi.nlm.nih.gov/41497288/ | 238 outpatient physicians; documented improvements in some clinician/workload outcomes but occasional inaccuracies. Important negative control against “AI scribing is always unsafe” framing | Demonstration that all clinical errors are corrected, or harm prevented; outcome primarily documentation time and surveys |
| **Medium** | **Scribe assessment instrument validation** (`DISC-S3-01`): https://pubmed.ncbi.nlm.nih.gov/39869899/ | An existing measurement approach against which a clinical-note accuracy subcomponent could be compared | Validation of our broader hazard/control/residual-risk decision method |
| **Medium** | **Simulated cross-platform note assessment** (`DISC-S3-06`): https://pmc.ncbi.nlm.nih.gov/articles/PMC12605248/ | Provides cross-platform error-type examples and performance measurement method | Real-world harm rates or proof that the same failure frequencies occur in a local Trust |
| **Medium** | **Australian outpatient evaluation** (`DISC-S3-05`): https://link.springer.com/article/10.1186/s12913-025-13954-5 | Reported accurate summaries, note-quality and clinician/patient experience improvements alongside some incorrect outputs. Broadens the evidence base beyond harms-only selection | Unqualified endorsement of AVT safety, controlled patient-outcome improvement or direct UK transferability |
| **Medium** | **HSSIB 2025 EPR thematic review** (`DISC-S4-01`): https://www.hssib.org.uk/patient-safety-investigations/electronic-patient-record-epr-systems-thematic-review/investigation-report/ | Investigative themes from 112 executive summaries, 63 taken forward; multiple system-workflow mechanisms. Valuable for candidate cross-system interaction patterns | A new single event investigation, an AI-specific incident or case-specific decision-time knowledge |
| **Medium** | **HSSIB ePMA procurement and safety learning** (`DISC-S4-03`): https://www.hssib.org.uk/patient-safety-investigations/medication-related-harm/fourth-investigation-report/ | Original HSSIB report illustrating interface and procurement safety considerations, potentially transferable analytical principles | Direct AVT evidence or assumption that different workflows share the same failure mechanism |
| **High — context only** | **HSSIB AVT investigation launched 6 Aug 2026** (`DISC-S4-02`): https://www.hssib.org.uk/patient-safety-investigations/the-use-of-ambient-voice-technology-in-hospitals/ | Direct national investigation in our first chosen domain; will ultimately merit an updated evidence check | **Not a completed investigation report.** HSSIB says the findings are expected in summer 2027. No injury counts or causal conclusions can be taken from the launch notice |
| Medium | **2026 clinician–AI STPA study** (`DISC-S2-05`): https://www.nature.com/articles/s41598-026-64180-w | A published, worked control-structure/unsafe-control-action analysis of clinician–AI interaction; demonstrates an alternative mechanism-mapping approach | Evidence that the hypothetical CADx risk pathways were proven in clinical outcomes, or that this method alone ensures complete hazard coverage |
| Medium | **2026 NHS ambient voice medical-device regulation guidance** (`DISC-S1-01`): https://www.england.nhs.uk/long-read/medical-device-regulation-for-ambient-voice-technology-products/ | New, domain-specific intended-purpose/medical-device boundary source for subsequent applicability review | That our current research prototype is a medical device or is categorically exempt; direct full text still requires verification |

## 3. Balanced evidence: do not build a hazard-only selection

**Potentially reassuring findings** are present:
- Gold Coast outpatient evaluation described improved documentation quality and patient/clinician experience, despite some incorrect outputs.
- Randomised trial found benefit in some time/task-load outcomes, with variation between products.
- Prospective US draft-note audit reported **94.7% of its 356 physician-reviewed notes** free from significant errors.

**Potential safety concerns** are also present:
- That same draft-note audit included some errors that reviewers rated as potentially serious **if left uncorrected**.
- Simulated multi-platform comparisons reported differences in error rates and occasional clinically material failures.
- English integrated AVT evaluation documented context-specific workflow/integration tradeoffs and unintended consequences.
- EPR investigations show that function, local workflow and operational ownership can interact in clinically relevant ways.

**Do not pool** these different metrics or equate any with real-world patient injury. Product, reviewer, sample selection, clinical setting, outcome and unit of analysis differ. The initial empirical foundation must separately represent benefits, failure observations and unknowns.

## 4. Provisional screening and exclusions

The machine-readable log has 19 named records, one identity and provisional disposition per record:

- 10 **include-core, provisional**: high-direct relevance to methodological foundations, evidence evaluation, local workflow or investigated safety mechanisms.
- 6 **include-context-only, provisional**: complementary safety, regulatory or beneficial-evidence context, including the ongoing HSSIB AVT investigation.
- 3 **exclude, provisional**: `DISC-X-01` medical-student OSCE notes (EX-05; wrong evidence purpose), `DISC-X-02` educational feedback notes (EX-05), `DISC-X-03` HSSIB e-RS report already held as seed source (EX-04; deduplicate without deleting original).

Provisional decisions were made by one project review process and are not independently checked. They **must not** be described as comprehensive title/abstract or full-text screening.

## 5. Research implications: amendments to test, NOT approved rules

1. **Prior work and novelty:** compare the 2019 health IT hazard-analysis tool, the 2018 safety-case review and 2026 STPA work with our specific claim-to-control/residual-risk stress-test. Do not assert that no comparable software exists.
2. **Sociotechnical decomposition:** test whether a structured SEIPS/STPA-style workflow representation helps identify hazards from patients, clinicians, work processes, IT interfaces and organisational dependencies, without turning either named method into a mandatory DCB requirement.
3. **Causal evidence limits:** require proof that a measured metric assesses the exact mechanism credited to a control (draft error rate versus signed-record harm, edit counts versus clinician detection sensitivity).
4. **Balanced detection:** create sound-decision/counterexample cases so that the method is penalised for overcalling plausible but unsupported hazards.
5. **Evidence monitoring:** distinguish an ongoing HSSIB investigation from a completed one. No new rule should be based on unreported future findings.

These are **research priorities and candidate validation questions only**. They do not modify any of the seven existing rules or the deterministic v0.2 engine.

## 6. Verification limitations and next practical gate

### Completion limits
- The **exact PubMed field-tagged queries in the protocol were not executed**. Attempts to open direct PubMed query URLs and NCBI E-utilities failed; PubMed indexed article pages were only selectively accessible.
- **Ovid Embase was not available**. No publication total, record count or search completeness claim is possible.
- Source-discovery was run through a ranked web search engine; exact per-run hit totals and exports were not available.
- Full texts for the 2018 safety-case review, 2019 hazard software study and some clinical papers are not yet independently inspected. Claims from them are appropriately limited to indexed abstracts/publisher descriptions.
- No independent reviewer, CSO adjudication, study risk-of-bias evaluation, full formal data extraction, systematic denominator, sensitivity or specificity assessment exists.

### Next bounded tasks, in order
1. Run and archive the **actual** protocol-defined PubMed queries through a usable PubMed interface/API, with search details and exact counts. If unavailable, do not manufacture results.
2. Obtain licensed Embase access or explicitly document non-availability and its selection-bias consequence.
3. Independently verify high-priority original full texts, especially the 2018 and 2019 predecessors and English AVT implementation study.
4. Re-screen the nine **pre-protocol seed sources** against the written criteria with inclusion/role and rationale, without claiming they arose from the new search.
5. Have an independent source checker audit material claims and a suitably qualified CSO review **causal applicability**, preserving disagreement.
6. Only then consider promoting new candidate evidence-anchored claims into the controlled register, and return to locked Oxford technical Issue #19.

**No new clinically approved source claims, deployed features, findings, residual-risk classifications, or real Trust safety case decisions are authorised by this audit.**

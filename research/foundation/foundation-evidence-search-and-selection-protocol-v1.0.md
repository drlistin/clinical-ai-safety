# Clinical AI Safety — Evidence Search and Selection Protocol v1.0

**Date:** 19 November 2026 | **Search coverage amendment v1.1:** 19 November 2026  
**Status:** Proposed prospective **targeted evidence-map protocol**, not a completed review and not a registered systematic/scoping review  
**Owner:** Clinical AI Safety research project  
**Purpose:** Establish a traceable basis for a system for stress-testing clinical AI safety decisions before deployment.  
**Scope:** Safety Decision Challenge, with **ambient clinical documentation** as the first test domain. Change Impact Review remains deferred.  
**Repository relationship:** Companion to the Foundation v1.0 methodology, the versioned source-to-claim register and outstanding verification gaps (draft PR #20); GitHub Issue #19 remains the separate one-case technical proof.

## 1. Why the protocol exists

The nine sources and 18 source-anchored claims already recorded were **selected during project development**, not obtained from a documented comprehensive search. They are **seed sources** only. We must not retrospectively invent searches, screened totals, exclusions or independent selection decisions.

**Primary question:** What published requirements, safety-engineering methods, empirical findings and investigated failures legitimately inform a *bounded, reproducible* challenge to a proposed clinical AI safety decision (clinical context → hazards → controls → evidence → residual-risk reasoning → governance)?

**Secondary question:** Which gaps, contradictory findings and limits of applicability make the initial foundation unsafe to treat as an approved rule set?

This is a **targeted evidence map** designed to establish an initial research foundation, *not* a systematic review, meta-analysis, regulatory opinion, proof of hazard completeness, or clinical performance validation. PRISMA-S principles are used to make searches reproducible; JBI scoping-review guidance informs explicit eligibility and selection procedures. **Do not claim PRISMA-S or PRISMA-ScR compliance unless the corresponding reporting requirements have been met.**

## 2. Four thematic source streams and their database coverage

| Stream | Question | Primary sources to search | Type of synthesis |
| --- | --- | --- | --- |
| S1 — current normative and official guidance | What are the applicable manufacturer/deployer obligations and their clinical safety implications? | NHS Digital/NHS England DCB0129/DCB0160 specification, guidance, amendments, consultations and NHS digital/clinical safety guidance; legislation and MHRA sources **only for applicable scope/status** | Versioned, clause-specific statement with actor, verb, condition and effective date; legal ambiguity separately flagged |
| S2 — safety engineering and human factors | Which established analysis methods support detection of hazards, interactions, control failures and unintended consequences? | NHS supplementary safety guidance, source methodological publications, human-factors and safety-science reviews, relevant engineering databases | Method-to-hazard-mechanism mapping and counterexamples; not presumed regulatory duties |
| S3 — empirical clinical AI safety | What errors, workflow factors, review limitations and downstream risks have actually been observed, particularly in ambient documentation? | PubMed/MEDLINE, Embase **if licensed access**, author/publisher original evaluations and relevant bibliographies | Critical appraisal of findings, measurement, population, context, denominator and transferability |
| S4 — investigated clinical IT/system failures | Which independently investigated system failures demonstrate transferable mechanisms (including non-AI failures)? | HSSIB official reports, NHS official safety notices where appropriate, equivalent reputable investigation bodies | Source observation → explicitly hypothetical mechanism → applicability test → potential decision-challenge question |

**Authority is claim-dependent**: legislation and versioned standards govern specific normative statements; empirical evaluations establish observations; independent investigations establish facts within the investigated case; none alone verifies another organisation's local safety controls.


### Database coverage amendment v1.1 (19 November 2026)

The **four streams describe types of evidence**, not four databases. Search interfaces and indexed databases are different concepts:

| Evidence stream | Source/database and planned role | Priority and access | Overlap or limitations |
| --- | --- | --- | --- |
| S1 | Publisher originals: DCB0129/DCB0160, NHS, HSSIB where normative, MHRA and applicable law | **Essential**; official open materials | Version/actor/effective-date check; no PubMed substitute for current specifications |
| S2 + S3 | **MEDLINE searched via PubMed**, covering MEDLINE-indexed citations and additional PubMed citations | **Essential**, free interface; exact advanced search pending | **Do not count MEDLINE and PubMed as two independent databases**. Save total PubMed retrieval; record MEDLINE-status subset separately if useful |
| S3 | **Embase via Ovid or Embase.com** | Important complementary biomedical source; licensed interface **not yet available** | Uses **Emtree**, not MeSH; capture platform-specific syntax and overlapping MEDLINE citations for deduplication |
| S3 | **Cochrane Library: CDSR and CENTRAL** | **Targeted**, for existing systematic reviews and primary controlled-trial records | CENTRAL overlaps MEDLINE/Embase/trial registries; CDSR is synthesis, not an additional independent trial |
| S2 | **IEEE Xplore** | **High priority** for hazard analysis, safety assurance, AI/software engineering; access to metadata depends on interface | Search Command/Advanced interface and record exact fields; conference and journal records can overlap other indexes |
| S2 | **ACM Digital Library / ACM Guide to Computing Literature** | **High priority** for human factors, systems safety and clinical software | Different collections have different coverage; record which one was searched |
| S2/S3 | **Scopus OR Web of Science Core Collection**, if accessible | **Supplementary** cross-disciplinary search and backward/forward citation tracking | Not required to run both for this bounded pilot; broad overlap and licence/access considerations |
| S4 | **HSSIB and other original investigation publishers** | **Essential**; search original report repositories | Investigated non-AI systems can supply causal hypotheses, not clinical AI harm-rate estimates |

**Preferred biomedical plan:** one **PubMed search (MEDLINE plus other PubMed citations)**, and one separately run **Embase** search if access permits. An *Ovid MEDLINE* search may replace or supplement the PubMed interface for methodological reasons, but it is **not a third independent biomedical evidence database**; report separately retrieved PubMed-only records and deduplicate.

**Search sensitivity:** Controlled vocabulary (MeSH/Emtree) is combined with relevant free text to capture newly published or unindexed articles. Don't force an error/safety term into every search: it can omit evaluations with non-explicit safety language. Keep a wider ambient-documentation sensitivity query and a narrower safety/error query; document their union and overlaps. Do not exclude reassuring or no-effect evaluations.

**Database search reporting:** Name the precise database, platform/interface, institutional coverage, exact interpreted query, subject-heading expansions, dates and filters, number of hits reported by that platform, exported records (PMID/DOI/title), download/checksum and deduplication log. Treat each database output as a distinct source set, and merge only after provenance-preserving deduplication. A **ranked web or Arca PubMed-index search is not equivalent** to a complete formal PubMed, MEDLINE or Embase search.

## 3. Eligibility criteria established before searches

### Include
- Original primary specifications, amendments and official implementation guidance potentially applicable to UK health IT/clinical AI decision safety. Preserve superseded versions separately for **as-of-date** checks.
- Original safety-engineering methodologies or authoritative methodological reviews with explicit analysis of hazard generation, human factors, control dependencies, unintended control consequences or assurance-case reasoning.
- Empirical evaluations (quantitative, qualitative or mixed methods), systematic reviews and relevant observational evidence on AI-enabled clinical documentation, human review, clinical workflow and safety; include both failures **and demonstrated strengths/adequate safeguards**.
- Original independent investigations of clinical IT or organisational safety failures with a plausible **explicitly tested transferability** to the intended clinical AI workflow.
- Negative, null and contradictory evidence relevant to a safety claim; not just papers illustrating known problems.
- Peer-reviewed and authoritative unpublished/grey literature where source, date, methods and evidential limitations are identifiable.

### Exclude or classify as context-only
- Promotional vendor material or unverified supplier assertions **as evidence of effectiveness**. Supplier material may be retained as an attributable claim requiring local verification.
- Secondary commentary without recoverable original evidence when a primary source is obtainable.
- General AI ethics/opinion pieces lacking a concrete hazard mechanism, applicable governance requirement or evaluation method, unless required to explain methodological context.
- Studies of unrelated algorithms with no defensible pathway to the narrowly specified safety reasoning question.
- Duplicate records and superseded versions presented as if current (retain historical versions in a separate provenance record where material).
- Claims unavailable in the original or with unreliable attribution; record as **awaiting verification**, not excluded without explanation.
- Products or studies that show a benefit but contain no relevant safety outcome may be included as **context/control evidence**, not fabricated hazard evidence.

**Scope boundaries:** England/UK for normative obligations; international empirical and engineering evidence may be included with country, healthcare system and transferability recorded. No default English-language restriction at identification; language and translation limitations must be logged. No arbitrary publication-year cutoff for foundational methods. Search S3 prioritises contemporary clinical AI while preserving older relevant evidence via citation chasing. **No patient-identifiable, confidential Trust or proprietary supplier documents** are accepted in the public research repository.

## 4. Exact *proposed* searches and execution rules

The following are **search strings to run and validate**, not results. Every executed run must preserve the *actual platform-interpreted strategy*, platform, date/time (UTC), database coverage, interface, applied filters, reported hit count, export file/checksum and query changes in the companion `foundation-search-execution-log-v1.0.json`. Web-search ranking and counts are unstable: do not claim reproducible totals from screenshots/snippets or this protocol alone.

### S1: standards and guidance — publisher websites (planned)

Search official publisher sources and follow links to **the exact downloadable specification/version**:

- `site:digital.nhs.uk DCB0129 clinical risk management specification amendment`
- `site:digital.nhs.uk DCB0160 clinical risk management specification amendment`
- `site:england.nhs.uk "ambient scribing" clinical safety risk`
- `site:england.nhs.uk "clinical risk management standards" review`
- `site:digital.nhs.uk "healthcare supplementary guidance" hazard`
- `site:gov.uk MHRA software medical device intended purpose`

For each standard: capture version, publication/effective dates, exact clause number, which actor it binds/addresses, and document status. A search result is a lead; **an original official source must be retrieved to verify a clause**.

Do not treat consultation proposals as implemented obligations. An uncertain statutory interpretation is a separate legal-verification issue, not an automatically supported compliance finding.

### S2: safety engineering / human factors — planned targeted search

Search methodological reviews and source documents using these conceptual terms, then record the exact interface-specific strings used:

`("clinical safety" OR "patient safety" OR healthcare) AND ("hazard analysis" OR "functional failure analysis" OR HAZID OR SWIFT OR "systems theoretic process analysis" OR STPA OR "functional resonance analysis method" OR FRAM OR "human factors" OR "safety assurance") AND (software OR digital OR "artificial intelligence" OR automation)`

Search an accessible bibliographic index and the relevant publisher/source documents. Use citation chasing for influential methodological sources. Record method limitations and relevance, and **do not imply any named method is a universal DCB requirement**.

### S3: PubMed/MEDLINE — proposed, directly pasteable initial query

```text
(
 "ambient scribe"[tiab] OR "ambient scribing"[tiab] OR
 "ambient clinical documentation"[tiab] OR "ambient voice technology"[tiab] OR
 ("clinical documentation"[tiab] AND (automated[tiab] OR generative[tiab] OR "large language model"[tiab])) OR
 ("clinical note"[tiab] AND ("large language model"[tiab] OR transcription[tiab]))
)
AND
(
 safety[tiab] OR error*[tiab] OR omission*[tiab] OR accuracy[tiab] OR
 hallucinat*[tiab] OR misattribut*[tiab] OR workflow[tiab] OR
 "human factors"[tiab] OR review[tiab] OR verification[tiab]
)
```

**Execution validation required:** Test that PubMed accepts the syntax, inspect term mapping and a small reference set; save the *platform-generated search details*, count and retrieved citation IDs. The query is intentionally bounded to ambient documentation; run a **separate broader safety-decision literature search** before making general clinical AI hazard-performance claims.

**Broader methodological PubMed search (separate run):**

```text
("artificial intelligence"[tiab] OR "machine learning"[tiab] OR
 "clinical decision support"[tiab] OR "health information technology"[tiab])
AND
("hazard analysis"[tiab] OR "safety case"[tiab] OR
 "clinical risk management"[tiab] OR "failure mode"[tiab] OR
 "safety assurance"[tiab] OR "human factors"[tiab])
```

### S3: Embase — Ovid candidate translation **not yet platform-tested**

```text
1. (ambient adj3 (scrib* or documentation or voice)).ti,ab,kw.
2. ((clinical or medical) adj3 (note* or documentation)).ti,ab,kw.
3. (automated or generative or "large language model*" or transcription).ti,ab,kw.
4. 1 or (2 and 3)
5. (safety or error* or omission* or accuracy or hallucinat* or misattribut* or workflow or "human factors" or verification).ti,ab,kw.
6. 4 and 5
```

If Ovid Embase is unavailable, record **not run / access unavailable**, rather than claiming zero matches. If Embase.com is used instead of Ovid, translate and save the actual executable syntax; do not label an Ovid strategy an Embase.com strategy. Consider checking synonyms, controlled vocabulary and PRESS peer review with an information specialist before formal evaluation.


### v1.1 platform-specific search strategy revision (PROPOSED, NOT RUN)

The v1.0 PubMed title/abstract query and Ovid Embase free-text translation above are **retained as historical candidates**, not presented as validated comprehensive strategies. The following replace them for any forthcoming formal execution. Each platform must first be tested using index terms, a known-paper recall set and actual platform search details. **All lines below are unexecuted.**

#### S3A: PubMed including MEDLINE — clinical AI documentation sensitivity set (candidate syntax)

PubMed supports \`[mh]\`/MeSH and \`[tiab]\` fields. MEDLINE is the largest component but PubMed also includes other citations; don't apply \`medline[sb]\` to the main search, or recently added/non-MEDLINE records could be lost. Check the validity and scope of the proposed MeSH descriptors in the current MeSH browser before publication of a final search.

\`\`\`text
(
  "Artificial Intelligence"[MeSH Terms] OR
  "Natural Language Processing"[MeSH Terms] OR
  "Large Language Models"[MeSH Terms] OR
  "ambient scribe"[tiab] OR "ambient scribes"[tiab] OR
  "ambient scribing"[tiab] OR "ambient voice technology"[tiab] OR
  "ambient documentation"[tiab] OR "ambient listening"[tiab] OR
  "AI scribe"[tiab] OR "AI scribes"[tiab] OR
  "digital scribe"[tiab] OR "digital scribes"[tiab] OR
  "automated documentation"[tiab] OR
  "generative artificial intelligence"[tiab] OR
  "large language model"[tiab] OR "large language models"[tiab]
)
AND
(
  "Documentation"[MeSH Terms] OR
  "Electronic Health Records"[MeSH Terms] OR
  "Medical Records Systems, Computerized"[MeSH Terms] OR
  "clinical documentation"[tiab] OR "clinical note"[tiab] OR
  "clinical notes"[tiab] OR "medical note"[tiab] OR
  "medical notes"[tiab] OR "medical record"[tiab] OR
  "medical records"[tiab] OR "scribe"[tiab] OR "scribes"[tiab] OR
  "transcription"[tiab] OR "consultation summary"[tiab]
)
\`\`\`

**High-sensitivity supplement:** run the following independently and take the **union** with the above, to avoid requiring both broad MeSH concepts when an ambient-scribe record is new, unindexed, or does not say “clinical documentation” in its abstract:

\`\`\`text
"ambient scribe"[tiab] OR "ambient scribes"[tiab] OR
"ambient scribing"[tiab] OR "ambient voice technology"[tiab] OR
"AI scribe"[tiab] OR "AI scribes"[tiab] OR
"ambient documentation"[tiab] OR "ambient listening"[tiab]
\`\`\`

Then classify safety/error/control-relevant records **during screening**. If an additional precision-focused safety search is run, document it as a supplementary run rather than using it to exclude records from the wider set.

**S3A thematic safety supplement** (optional, to retrieve safety research beyond ambient scribes):

\`\`\`text
(
  "Artificial Intelligence"[MeSH Terms] OR "Natural Language Processing"[MeSH Terms]
  OR "clinical decision support"[tiab] OR "health information technology"[tiab]
  OR "machine learning"[tiab] OR "large language model"[tiab]
)
AND
(
  "Patient Safety"[MeSH Terms] OR "Risk Management"[MeSH Terms] OR
  "Medical Errors"[MeSH Terms] OR
  "hazard analysis"[tiab] OR "safety case"[tiab] OR
  "clinical risk management"[tiab] OR "safety assurance"[tiab] OR
  "failure mode"[tiab] OR "human factors"[tiab]
)
\`\`\`

**Required checks:** inspect Search Details and subject-heading mappings; confirm PubMed recognises the descriptors and phrases; test recall of known records such as SMART, CREOLA and the 2026 integrated AVT paper (some may require the methodological branch or citation chasing); store actual PubMed total, \`medline[sb]\` breakdown if needed, PMIDs, date, applied filters and exact search history. No results or coverage claims are asserted here.

#### S3B: Embase through Ovid — free-text candidate plus Emtree mapping

Embase uses **Emtree**, which must be selected by browsing that platform's thesaurus; **do not paste PubMed MeSH descriptors as if they were verified Emtree subject headings**. Ovid \`adj3\` and \`.ti,ab,kw.\` differ from Embase.com's \`NEAR/n\` and \`:ti,ab,kw\` syntax.

\`\`\`text
1. (ambient adj3 (scrib* or voice or documentation or listen*)).ti,ab,kw.
2. ((clinical or medical) adj3 (note* or documentation or record*)).ti,ab,kw.
3. (("large language model*" or "generative AI" or "artificial intelligence" or "digital scribe*" or transcription)).ti,ab,kw.
4. 1 or (2 and 3)
5. (safety or error* or hallucinat* or omission* or accuracy or review* or workflow or "human factors" or verification).ti,ab,kw.
6. 4 and 5
\`\`\`

**Run set 4 as the broad candidate search**, and set 6 as a *supplementary precision set*, not the only records screened. Add platform-verified Emtree headings for AI, clinical documentation/electronic records and patient safety with the correct explosion choices **after thesaurus validation**. Preserve the exact resulting executed line history; if using Embase.com, translate syntax on that site. Licensed access currently unavailable.

#### S3C: Cochrane Library — targeted CDSR review and CENTRAL record search

Use Cochrane Search Manager and record whether searching **CDSR**, **CENTRAL**, or both. Proposed free-text set:

\`\`\`text
("ambient scribe" OR "ambient scribing" OR "ambient voice technology" OR
 "ambient documentation" OR "AI scribe" OR "clinical documentation" OR
 "artificial intelligence" OR "generative AI"):ti,ab,kw
\`\`\`

A second focused concept, if the broad set is noisy:

\`\`\`text
(safety OR accuracy OR omission* OR workflow OR "medical record" OR
 documentation OR "electronic health record"):ti,ab,kw
\`\`\`

Use the union of a targeted ambient-scribe query with an AI-documentation combination; avoid an unhelpfully broad OR of all AI terminology as a claimed AVT search. Browse Cochrane MeSH separately for confirmed descriptors such as \`[mh "Artificial Intelligence"]\`, \`[mh "Electronic Health Records"]\`, \`[mh "Patient Safety"]\`; add only those validated on the current platform. **CENTRAL may include records imported from MEDLINE and Embase**; deduplicate at study/record level. This is a targeted review/controlled-study search, not the primary source of all AI safety research.

#### S2A: IEEE Xplore — engineering and assurance literature

Use **Command Search** or **Advanced Search**, specifying document title/abstract/metadata rather than the full-text corpus when possible. Candidate Boolean concepts (translate into the actual selected interface fields):

\`\`\`text
("hazard analysis" OR "safety case" OR "safety assurance" OR
 "systems theoretic process analysis" OR "STPA" OR "failure mode" OR
 "human factors" OR "assurance case")
AND
(healthcare OR "health information technology" OR medical OR clinical)
AND
("artificial intelligence" OR "machine learning" OR software OR digital OR automation)
\`\`\`

If this is too narrow, run a **two-concept** variant combining the first two groups and screen for AI/IT applicability; log both. Do not claim that this untested string automatically uses IEEE's selected search fields. Search originals/conference proceedings and identify versions/duplicate publications.

#### S2B: ACM Digital Library — computer science, interaction and safety methods

In **Advanced Search**, select and record **ACM Guide to Computing Literature** versus ACM Full-Text Collection. Enter:
- Row 1, grouped alternatives: \`"hazard analysis" OR "safety assurance" OR "safety case" OR "systems theoretic" OR "human factors"\`
- Row 2, grouped alternatives: \`healthcare OR clinical OR "health information technology" OR "medical software"\`
- Row 3, optional technology refinement: \`"artificial intelligence" OR "machine learning" OR software OR "clinical decision support"\`

Apply \`AND\` across rows, record the chosen field selectors (prefer Title, Abstract and Author Keyword; document full-text inclusion if used) and export bibliographic metadata. Rerun without optional row 3 if the search misses established engineering methods. These are **conceptual input groups**, not an untested ACM-specific command string.

#### S2/S3 supplementary: Scopus OR Web of Science

If licensed, choose **one first** for cross-disciplinary coverage and forward-citation tracing. Candidate Scopus advanced-search syntax:

\`\`\`text
TITLE-ABS-KEY(
  ("hazard analysis" OR "safety case" OR "safety assurance" OR STPA OR "human factors")
  AND (healthcare OR clinical OR "health information technology")
  AND (software OR "artificial intelligence" OR "machine learning")
)
\`\`\`

Web of Science Core Collection candidate translation:

\`\`\`text
TS=(
  ("hazard analysis" OR "safety case" OR "safety assurance" OR STPA OR "human factors")
  AND (healthcare OR clinical OR "health information technology")
  AND (software OR "artificial intelligence" OR "machine learning")
)
\`\`\`

Record the subscribed index coverage and field translation; these are **not** interchangeable database counts. Supplement with backward/forward citation searching of 2018 safety-case study, SMART, SEIPS 2.0, STPA and CREOLA.

#### Database overlap, deduplication and bias

- Store **per database-run** counts and exports *before* deduplication. Record all provenance IDs when an article appears in more than one database.
- Primary duplicate keys: DOI, PMID and exact official report identifier; secondary matching: title, first author, year, version and sample/case identity. Avoid conflating an original research paper with a subsequent systematic review about it.
- For a fully documented review, account for overlap and duplicate decisions in a reproducible master record. Do not add PubMed+MEDLINE counts as independent retrievals or infer Embase/CENTRAL unique yield from subscriptions unavailable to us.
- Preserve both **adverse** and **reassuring** findings, external-site/region variation, no-effect reports, and population/workflow constraints.
- Decide whether gaps from an unavailable licensed source prevent advancement to external review; document this explicitly rather than pretending the replacement search is equivalent.

#### Official search and syntax documentation (checked as contextual methodological sources)

- NLM: https://pubmed.ncbi.nlm.nih.gov/about/ and https://pubmed.ncbi.nlm.nih.gov/help/ (MEDLINE as a subset, field tags and \`medline[sb]\`).
- Cochrane: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04 and https://onlinelibrary.wiley.com/cochranelibrary/search/mesh/quick (database-specific strategies, MeSH and Search Manager).
- Elsevier: https://www.elsevier.com/en-gb/products/embase/content and https://service.elsevier.com/app/answers/detail/a_id/17875/supporthub/embase/kw/proximity/ (Embase coverage and platform syntax).
- IEEE Xplore: https://ieeexplore.ieee.org/Xplorehelp/searching-ieee-xplore/search-tips (Command/Advanced searches).
- ACM/UCL guide: https://library-guides.ucl.ac.uk/ACM-Digital-Library/advanced-search (collection and field selection).
- Scopus: https://service.elsevier.com/app/answers/detail/a_id/11365/supporthub/scopus/ (TITLE-ABS-KEY).
- Clarivate: https://webofscience.help.clarivate.com/Content/wos-core-collection/woscc-search-field-tags.htm (TS topic field).

### S4: official safety investigations — planned publisher searches

- `site:hssib.org.uk patient safety investigation electronic referral worklist 180 days`
- `site:hssib.org.uk "electronic patient record" "clinical risk"`
- `site:hssib.org.uk "digital" "patient safety" investigation`

Record publisher page, report date/version, whether the publication is final/interim, investigated context, specific mechanism, recommendations and any retrospective-versus-prospective knowledge differences. Citation chasing may locate analogous published investigations. An investigation of **non-AI software is not evidence of an AI-specific incident**.

### Citation chasing and search changes

For each influential included source, screen cited primary work and forward citations if access allows; mark identification method. Log any added term and rationale **before** incorporating it into an updated run; retain old queries and counts. Changes after seeing outcomes must be dated and treated as amendments, not the original search.

## 5. Screening, selection and documentation

**Identification:** Each bibliographic/official record gets a stable source/record ID, URL/DOI, query/run ID, retrieval date, source type, original publisher, document/version, and file hash when a permitted local copy exists. No invented record counts.

**Deduplication:** Match DOI/PMID/report URL, then title/author/version. Preserve original records and deduplication decisions, rather than deleting versions needed for dated legal/source applicability.

**Title/abstract stage:** Screen against stream-specific relevance using `include for full-text`, `exclude`, or `uncertain`. A missing abstract is not an automatic rejection for official reports.

**Full-text stage:** Record `include-core`, `include-context-only`, `exclude`, or `pending-access` with one primary reason and optional secondary reasons. Do not count inaccessible reports as assessed full texts. Apply reasons:

- EX-01: wrong subject / no causal connection to decision-validation problem
- EX-02: non-original commentary without verifiable primary source
- EX-03: unsupported promotional effectiveness assertions
- EX-04: duplicate (link to retained canonical record)
- EX-05: wrong evidence purpose (not relevant to specified claim or review domain)
- EX-06: irrecoverable source/provenance after reasonable effort
- EX-07: superseded for *current* requirement (preserve in historical appendix if relevant)
- EX-08: evidence insufficient for **specific proposed inference** (may still be included as descriptive context)

**Reviewer model at current research stage:** One initial screener may build the bounded map; a second independent source checker audits all material DCB clauses and all high-impact safety/harm/control-effectiveness claims, plus a documented sample of other selections/exclusions. Formal validation studies require an explicitly justified more rigorous procedure agreed in advance. Disagreements are logged and unresolved items remain pending.

**Missingness and selection bias:** Include good-outcome/controlled cases and counterexamples. Screen for studies that *contradict* expected hazards and for reports of effective controls, to mitigate confirmation bias.

**Search accounting:** Maintain records identified per run, duplicates, unique records screened, excluded at first pass, full texts sought, not retrieved, full texts assessed, included core/context-only, and exclusion reasons. The numerical flow is **not available until actual searches/selection occur**.

## 6. Data extraction, appraisal and claim promotion

For each `include-core` source:

1. Primary citation: publisher, title, exact version/date, stable URL/DOI, retrieval date, source hash if applicable.
2. Exact supporting locator, paraphrase and relevant population, system version, geography, clinical setting and as-of decision date.
3. Source type: specification / official guidance / consultation / investigation / empirical study / method / local evidence.
4. Evidence method and limits: design, recruitment/selection, appropriate denominator, observation unit, outcomes, missingness, conflicts, and possible bias. **Do not treat a qualitative theme as an incidence rate.**
5. **Does not establish** fields: what this source cannot prove (e.g. causal effect, local control effectiveness, patient injury, national duty).
6. Explicit tag of **direct observation / normative requirement / analytical inference / candidate question**.
7. Alternative explanation, potentially reassuring evidence, scenario applicability and disconfirming facts.
8. Proposed claim-to-hazard-to-control-to-residual-risk relationship, with inference and proposed review owner.
9. Desk-check status, independent source-check status, CSO applicability review status; none should default to approved.

**Appraisal is source-type specific.** Apply suitable methods for quantitative designs, qualitative research, safety investigations and standards. Avoid inventing a universal numeric quality score that confuses methodological trustworthiness with legal authority or local applicability.

**Rule-promotion barrier:** New candidate finding patterns **cannot become approved runtime rules** solely because a source exists. Independent clause verification, clinical mechanism/counterexample review, explicit scope and empirical testing of false warnings are prerequisites. Risk acceptance and deployment authority remain with accountable humans.

## 7. Pilot scope, stop conditions and next gate

**Time budget proposal:** up to **8 focused researcher-hours** for an initial subset of S1–S4 searches, with expansion requiring an explicit scope decision. MEDLINE via PubMed and publisher-original standards are first priorities; Embase, Cochrane and engineering database runs are separately tracked as executed, pending access or not run. The eight-hour cap is a proposed effort gate, **not** evidence that all named databases have been searched. If access barriers or substantive missing source families arise, pause and reassess scope/cost rather than claim exhaustive coverage.

Pilot deliverables:
- Versioned protocol and honest execution log (prior ranked searches are retained; formal database search gaps remain explicit);
- Actual dated queries and search results (including database access gaps);
- List of seed sources, their re-screening decisions and newly found material or contradictory sources;
- Revised foundation claim register **only after verifying** the new source and its applicability;
- A transparent limitations/gap statement, without percentages or sensitivity claims.

**Gate to external review:** Search and selection history must be reproducible enough for an independent reviewer to challenge inclusion bias and identify important omissions. The professional CSO and safety-methodologist reviews are separate from the blind Oxford case adjudication.

**Excluded now:** changing the clinical engine, deploying a website workflow, patient-data intake, fine-tuning, ratings, public clinical validity claims or launching a full systematic review.

## 8. Methodological source references

- Rethlefsen et al., *PRISMA-S* (2021), primary paper: https://doi.org/10.1186/s13643-020-01542-z — search reporting and reproducibility principles.
- JBI Manual for Evidence Synthesis, *Searching for the evidence* (scoping review methodology): https://jbi-global.atlassian.net/wiki/spaces/MANUAL/pages/355862749/10.2.6+Searching+for+the+evidence — explicit eligibility, multi-source/grey literature searching and selection.
- NHS England, *Digital clinical safety assurance*: https://www.england.nhs.uk/long-read/digital-clinical-safety-assurance/ — systematic hazard identification methods.
- DCB0129 and DCB0160 originals: https://digital.nhs.uk/services/clinical-safety/clinical-risk-management-standards — version and direct specification retrieval.
- This project's methodological independence policy: `docs/methodological-independence-policy.md`.

**Verification statement:** Writing this protocol does **not** mean that searches, review screening, source retrieval or clinical source-sign-off have been completed. Counts remain unreported until logged from executed platforms.

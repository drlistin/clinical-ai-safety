# Real-world evidence reconstruction and adjudication protocol v0.1

**14 November 2026 | Internal research-only | No validated gold standard**

## Decision

Real published evidence becomes the **primary** source for validating Safety Decision Challenge. The existing `research/avt/case-pack-v0.1.json` remains supplementary, fictional, and explicitly unadjudicated. No record is promoted automatically into `ExpertReferenceCase.status: "expert-reviewed"`.

## Three distinct evidence classes

1. **Investigated safety findings** (e.g. HSSIB e-RS second interim report, 22 October 2026): findings about a documented clinical IT hazard and governance/control weaknesses. e-RS is *not* an AI/AVT case; its use is restricted to transferable supplier–deployer assurance and hazard/control reasoning.
2. **Published AVT evaluation observations** (e.g. Oxford and GOSH): reported technical errors, omissions, editing requirements, staff experience and workflow limitations. Such observations cannot be presented as confirmed patient injury, a missing clinical safety case, or a specific violation of DCB0129/DCB0160.
3. **Investigation announcements**: tracked only for future findings. HSSIB's August 2026 AVT investigation remains ongoing as of the recorded review date. No concluded hazard or patient-harm finding may be inferred from the launch page.

These classes are not interchangeable and cannot be pooled as identical clinical incident observations.

## Dated evidence reconstruction

For every record store:

- Official source, exact version and publication date, stable URL, source location (page/section) and review date;
- **What was reported** in neutral paraphrase, with caveats, numerator/denominator only when supported;
- **What is unknown**: original proposed decision, scope, hazard log, control implementation and effectiveness, local risk matrix, governance authority, patient outcome;
- **What we propose to challenge**: a labelled *research question*, not an assertion about the original organisation;
- **Time boundary**: facts potentially available to the original reviewer at the decision time versus facts known only after pilot reporting/investigation;
- **Applicability**: system category, intended use, jurisdiction, organisation and version;
- **Independent review**: reviewer identity, competing interpretations, limits, amendments and dissent.

If pre-deployment material is unavailable, mark retrospective reconstruction **not possible from public evidence**. We can still evaluate prospective relevance of the documented hazard type, but must not falsely benchmark whether a past professional ought to have foreseen a specific incident.

## Independent reference judgement and release requirements

1. Reviewer independently verifies the primary source, page, version, quotation context and uncertainties.
2. Reviewer distinguishes observation, actual incident, investigated causal finding and hypothesised control failure.
3. For a future **prospective** challenge case, separately author and clearly label any synthetic decision inputs needed to make the observed failure mechanism testable. A hybrid is **real-world-informed synthetic**, not a real recorded deployment decision.
4. Two qualified CSOs should independently adjudicate operational-control implications, and a further reviewer should resolve or preserve disagreements. Do not claim expert review until this has occurred.
5. Keep source-based evidence extraction separate from adjudicated expected findings and the engine's output; comparisons should be blinded with no hidden labels in public files.
6. Construct counterexamples with sound local safeguards and document where our method incorrectly complains.
7. Compare against competent structured safety-case review, then against the CSC-QT instrument once its full item-level content has been acquired. Avoid claims of incremental value until actually measured.

## Selection and reporting protections

- Avoid cherry-picking: maintain an inclusion/exclusion log, record screened sources and search dates. Include studies of AVT benefits and low error rates, not just failures.
- Split records from the same report without counting them as independent incidents or independent studies.
- Consider publication and reporting bias; observed absence of incidents is not a proof of safety.
- No patient-identifiable records in repository or public app. Any restricted local artefacts require lawful basis, approved governance, access controls and retention.
- Document unknowns rather than substituting imagined facts.
- Do not produce automated risk acceptance, compliance certification, or clinically validated performance claims.

## Source-specific corrections and boundaries

**Oxford:** 398 logged uses with reported editing categories; the report itself cautions that some reported hallucinations may be misclassified transcription/template errors. Do not equate editing rate to patient harm.

**GOSH:** qualitative interview descriptions of fabricated clinical details, misattribution and omitted negatives; not a count of proven adverse events.

**HSSIB e-RS:** the **22 October 2026 second interim report**, rather than the earlier investigation announcement, supports findings about the 180-day drop-off function and local control weaknesses. The 180-day feature is itself both a service-availability control and a referral-visibility hazard.

**HSSIB AVT:** investigation initiated August 2026; planned findings in 2027. Track, do not invent a conclusion.

## Research status

The accompanying `research/real-world/evidence-register-v0.1.json` is a *source-derived candidate evidence register*. It is not an approved reference test set and is not consumed by any public-facing engine.

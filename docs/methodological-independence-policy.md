# Methodological Independence and Source Traceability Policy v1.0

**Decision adopted 14 November 2026.** Applies to the Clinical AI Safety project and all future proposed rule changes.

## System identity

A system for stress-testing clinical AI safety decisions before deployment.

**Primary safety reasoning:** scenario → hazards → controls (ownership, implementation, applicability, effectiveness) → residual-risk claim → accountable governance. Change Impact Review asks whether a recorded decision's assumptions remain supportable after a relevant change.

## Independent foundations

- Relevant published DCB0129 and DCB0160 requirements, read in their current form and applied according to party and setting.
- Systematic clinical hazard reasoning, human factors and operational evidence; provenance, uncertainty and source applicability.
- Real reported NHS evaluations and investigated safety issues, with careful handling of retrospective knowledge.
- Independent adjudication by qualified reviewers and explicit documentation of dissent.

## CSC-QT boundary

CSC-QT is **an external comparator only**. It is neither a prerequisite for a challenge, nor a source of runtime rules, criteria identifiers, risk thresholds, reference conclusions, architecture, or authorisation. It must be possible to remove all CSC-QT references from the engine without changing engine outputs.

The published CSC-QT instrument can be examined in a separate research comparison to understand overlap or limitations; this does not imply validation against it establishes clinical safety or that a similar indicator is automatically original. No CSC-QT checklist is copied into product code.

**Non-circular evaluation:** adjudicated findings should be derived from clinical evidence, dated decision context and independent CSO reasoning. CSC-QT assessment, when performed, is a separate blinded comparator and cannot supply gold labels.

## Provenance-to-decision separation

A paper, published investigation or incident report provides evidence about **what happened or was observed**. It does not by itself establish which pre-deployment decisions were taken, which local controls were implemented, whether a particular organisation breached a duty, or what a reviewer could know at the time.

Each real-world record must distinguish:
1. Source observation and locator;
2. candidate hazard mechanism (explicitly an analytical inference unless investigated);
3. missing historical context and unknown actual controls;
4. proposed control-validity challenge, not a claim about the source organisation;
5. residual-risk implications requiring review, with **no inferred acceptance or score**;
6. governance question and accountable professional;
7. retrospective information only available after the decision, with no hindsight leakage.

A reconstruction that cannot be supported from a public source is labelled **not reconstructable**, not filled with fictitious details. A hypothetical prospective test derived from a publication is labelled **real-world-informed synthetic**.

## Release gates

- Traceable dated sources; independently checked exact sections; explicit source limitations and competing interpretations.
- Rule changes require change log, version, rationale, test cases and, before professional use, qualified CSO review.
- No automatic risk band, safety certification, regulatory compliance claim, clinician performance scoring or deployment approval.
- No patient-identifiable information in public test material.
- Software CI does not imply clinical validity.

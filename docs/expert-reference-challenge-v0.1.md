# Expert-reference hazards and interaction challenge: v0.1.1

**Status:** Internal research-only structural checks. Not an automated clinical hazard discovery engine and not independently validated.

## Problem

A generic keyword matcher cannot determine if a clinical hazard is truly missing, especially if a reviewer has described an equivalent hazard differently, or if an apparent absence is justified by the actual deployment scope. It can also misread negated text.

## Approach

The method accepts **expert-reviewed and versioned reference cases**, including reviewer name/identity, review date, reference evidence, expected hazard IDs and explicit multi-condition interactions. The deploying assessment provides its observed conditions with evidence, reviewed hazard mappings and interaction traces.

- **SDC-02:** When all reference conditions have been reviewed and recorded as present, an expected hazard without a reviewed assessment mapping is flagged only as a *potential concern*.
- **SDC-06:** When two or more reviewed conditions are present and a reference interaction is applicable, the method requires a documented, reviewed trace linking relevant hazards and controls. Missing or incomplete links produce a *potential concern* or *evidence-insufficient* finding.
- If a reference is not expert-approved, the context does not match, IDs are duplicated, or references lack provenance, the comparison is blocked.
- The method does not interpret free text as a clinical hazard, automatically discover novel hazards, mark a decision as safe, determine residual risk acceptability, or confirm control effectiveness.
- The mapping/trace review is a documented assertion, not independently verified expertise or proof of clinical adequacy.

**Important ambiguity:** an absent mapping is not necessarily an omitted hazard. The method requests adjudication, not automatic addition to a hazard log.

## Evidence and release limitations

Fixtures are synthetic AVT-flavoured cases; they contain no real patient records and establish **software behaviour only**. They must not be described as clinical validation.

Before release: independently adjudicated test cases, a source-level regulatory mapping, overlap assessment against the complete CSC-QT, reviewer authentication, application-specific safety reasoning validation, false-positive and missed-hazard analysis, confidentiality safeguards and clear qualified sign-off.

**Not yet implemented:** actual semantic clinical hazard detection, verifying the truth of local observations, incident-triggered review, rigorous interaction control effectiveness testing, CIR-01/CIR-02.

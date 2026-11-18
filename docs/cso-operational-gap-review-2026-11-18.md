# Clinical Safety Officer operational-expectations gap review

**18 November 2026. Research prioritisation only.** The project is a system for stress-testing clinical AI safety decisions before deployment, not a CSO course, conventional simulator, compliance certifier, or delegated risk-acceptance authority.

## External professional context

- Example employer expectations: DPM Digital Health Consultancy's November 2026 acute-trust CSO vacancy, and the responsibilities described by the employer. https://uk.linkedin.com/jobs/view/clinical-safety-officer-at-dpm-digital-health-consultancy-4488167778
- Supplier versus deployer context: NHS England DCB0129 and DCB0160 published information standards. Verify exact clause/version applicability before creating binding assertions.
- Investigated operational evidence: HSSIB's 22 October 2026 e-RS interim report at https://www.hssib.org.uk/patient-safety-investigations/electronic-patient-record-systems-electronic-referrals-for-ongoing-care/second-interim-report/

These sources inform **relevance**, not an exhaustive or verified list of statutory CSO duties. Three years' experience is a particular employer's requirement, not a universal standard.

## Trace from professional work to our decision-validation checks

| Operational CSO expectation | Corresponding safety-decision validation challenge | Current repository capability | Remaining gap / release need |
| --- | --- | --- | --- |
| Review manufacturer clinical safety documentation and local deployment applicability | Source and context relevance, supplier/deployer hand-off | SDC-01, -09 context and reference-presence prompts | Clause-level source review and actual local applicability remain unimplemented. |
| Maintain risk management plan, hazard log, safety case and evidence trail | Trace proposed decision to hazards, controls, evidence and open actions | Typed record contract and internal claim checks | No real file-ingest/assurance workflow, authenticated owner or immutable reviewed record. |
| Lead multidisciplinary hazard identification | Challenge missing credible harms | SDC-02 reviewed-reference **mapping** only | No novel clinical-hazard discovery; requires independently approved reference cases and clinical review. |
| Consider coupled failures and workflow dependencies | Test interaction traces and combined failure paths | SDC-06 structural trace checks | Presence of links does not verify a real interaction or control effectiveness. |
| Confirm controls are implemented, owned and effective | Separate named, implemented and effectiveness-supported controls | SDC-03/-04/-05 document-presence checks | Cannot establish authenticity or adequacy of implementation/effectiveness evidence from metadata. |
| Review residual risk, acceptance criteria and authority | Detect unsupported risk reduction and missing accountable acceptance | SDC-07/-08 missing-evidence checks; default risk classification not-determined | No organisational criteria appraisal; never infer an acceptability decision from a band. |
| Investigate incidents, monitor changes and assess reassessment needs | Revisit prior hazard/control assumptions when evidence or workflows change | CIR input/output contract only | CIR-01/-02 logic and historical evidence snapshots absent. |
| Escalate unresolved risks to appropriate governance | Trace challenged finding to accountable decision and unresolved action | Findings/governance action types | No authentic governance decision, sign-off, dispute workflow or audit log. |
| Preserve trust, confidentiality and safe document handling | Limit use to authorised sources and prevent false claims of review | Public website has safety limitations | No access-controlled confidential assessment environment; do not accept patient records. |

## Priorities and stop rules

**P0 validation:** Verify source record truth and exact timing; obtain independent clinical reference judgments; compare missed consequential findings and unsupported warnings with competent structured review. Do not conflate CI passing with clinical validation.

**P1 coherence:** Define a minimum reviewer-signed evidence record; trace unowned/unverified controls to unresolved risk and governance actions without fabricating decisions; audit retired simulator imports/PDF output for dangerous accidental exposure.

**P1 documentation:** Update README to reflect current method, Next.js versions and retired training routes; remove unsupported credential/certification claims.

**Defer:** New scenarios, publicly callable evaluation engine, general-purpose document ingestion, agent, auth/payments, dashboards, automated risk bands and website feature expansion. Proceed only if they demonstrably improve safety decision validation and pass relevant governance and validation gates.

## Conservative response semantics

A check may identify a missing document reference or an internal inconsistency, but may **not** conclude that an unlisted safeguard is clinically absent, that a source is true in the local setting, that an assessment is complete, that residual risk is acceptable, or that deployment can proceed. Where local risk category/method is unsupported, state **"Residual risk classification cannot be substantiated from supplied information."** Leave actual authority and escalation with the documented organisation.

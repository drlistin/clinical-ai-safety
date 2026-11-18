# Clinical AI Safety

**A system for stress-testing clinical AI safety decisions before deployment.**

Independent, research-stage clinical safety decision validation method for Clinical Safety Officers, digital clinical safety leads and AI governance reviewers. It is informed by UK clinical risk management practice including DCB0129, DCB0160 and the clinical safety elements of DTAC, without claiming certification, compliance approval or NHS endorsement.

## What is being developed

- **Safety Decision Challenge (SDC):** inspect a proposed decision through the chain scenario → hazards → controls and their supporting evidence → residual risk → governance. Surface unsupported reasoning, missing safeguards and review requirements.
- **Change Impact Review (CIR):** identify earlier safety arguments requiring reconsideration after a material system, model, workflow, evidence or governance change.

Outputs are reviewable concerns, uncertainty and required evidence/actions. The project does **not** approve deployments, certify compliance, assign automatic acceptability from a risk band, or replace a qualified Clinical Safety Officer.

**Current status:** The public website explains proposed professional capabilities; it is not an operational validated evaluation service. Internally there are deterministic document/claim consistency checks, structurally gated expert-reference hazard/interaction checks, fictional test cases and draft real-world evidence dossiers. No case has received independent clinical gold-standard adjudication and no clinical performance metric is established.

## Technical stack

- Next.js **16.4.6** (App Router)
- React **19.2.6**
- TypeScript and Tailwind CSS
- Vercel deployment

## Repository structure

- app/: public information pages (/method, /applications, /standards, /evidence, /about, /contact)
- lib/safety-decision/: internal contracts, evidence checks, guarded reference comparisons and trace validators
- docs/: specifications, source boundaries, methodological independence and audit records
- research/avt/: fictional, unadjudicated scenarios and protocol
- research/real-world/: source-extracted evidence register and unadjudicated reasoning traces
- research/adjudication/: three source dossiers, blank independent reviewer forms and verification protocols
- tests/: synthetic software-regression and research-data integrity checks

The former curriculum/simulator routes have been redirected away from public use. **Legacy simulator code remains only for controlled review and must not be reused for professional assessment:** its preliminary audit identifies unsafe control auto-verification and risk-acceptance defaults. See docs/legacy-engine-preliminary-safety-audit.md.

## Development

Run from the repository root:

    npm ci
    npm run lint
    npm run test:safety
    npm run build

Software tests demonstrate bounded behaviour and structural integrity only; they do **not** establish clinical validity or fitness for deployment decisions.

## Evidence and governance

- Method specification: docs/safety-decision-validation-spec-v0.1.md
- Independent methodological boundary: docs/methodological-independence-policy.md
- Adjudication protocol: research/adjudication/source-review-and-adjudication-protocol-v0.1.md
- Source desk audit: research/adjudication/source-audit-2026-11-18.md
- Operational CSO gap review: docs/cso-operational-gap-review-2026-11-18.md

No patient-identifiable data should be entered into the public site or public repository. Do not represent an extracted observation as an incident, an unreviewed hypothesis as an expert reference, or a clinical safety check as risk acceptance. CSC-QT is an **external research comparator** and is not a source of engine rules or reference truth.

Website: https://clinicalaisafety.co.uk

Independent project; not affiliated with or endorsed by NHS England, MHRA or another regulator.

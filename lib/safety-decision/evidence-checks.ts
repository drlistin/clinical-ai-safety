/**
 * INTERNAL research-only evidence and claim-consistency checks.
 *
 * This is not a clinical inference engine, risk classifier, standards compliance
 * assessor, approval authority, or patient-facing decision support. These checks
 * establish evidence *gaps* and internally contradictory claims only.
 *
 * Rule version 0.1.0. Independent CSO validation remains mandatory.
 */
import type {
  EvidenceReference,
  SafetyDecisionRecord,
  SafetyFinding,
  Safeguard,
  ResidualRiskClaim,
} from "./contracts";

export const SAFETY_CHECK_RULESET_VERSION = "0.1.0" as const;

function hasValue(text: string | null | undefined): boolean {
  return typeof text === "string" && text.trim().length > 0;
}

type Input = Pick<
  SafetyDecisionRecord,
  "context" | "proposedDecision" | "controls" | "hazards" | "evidence" | "residualRiskClaims"
>;

type FindingDraft = Omit<
  SafetyFinding,
  "id" | "accountableReviewer" | "reviewerResolutionEvidenceIds"
>;

function evidences(ids: string[], references: Map<string, EvidenceReference>): EvidenceReference[] {
  return ids.map((id) => references.get(id)).filter((entry): entry is EvidenceReference => Boolean(entry));
}

/**
 * Presence of an evidence reference is not verification. Require a reviewer
 * to have examined *local operational* evidence and documented its relevance.
 *
 * This is a conservative minimum for marking a claim as review-supported,
 * not a determination that a clinical control actually works.
 */
function reviewedLocalEvidence(ids: string[], references: Map<string, EvidenceReference>): EvidenceReference[] {
  return evidences(ids, references).filter(
    (item) =>
      item.classification === "local-operational-evidence" &&
      hasValue(item.sourceUriOrDocumentId) &&
      hasValue(item.reviewedAt) &&
      hasValue(item.applicabilityNote),
  );
}

function makeFinding(
  criterionId: string,
  status: SafetyFinding["status"],
  challengedStatement: string,
  reason: string,
  requiredAction: string,
  evidenceIds: string[] = [],
  scenarioFacts: string[] = [],
): FindingDraft {
  return {
    criterionId,
    status,
    challengedStatement,
    scenarioFacts,
    referencedEvidenceIds: evidenceIds,
    reason,
    uncertainty:
      "This check examines stated evidence and consistency only; clinical relevance, effectiveness and acceptance require an appropriately qualified reviewer.",
    requiredAction,
  };
}

function checkControl(
  control: Safeguard,
  refs: Map<string, EvidenceReference>,
  findings: FindingDraft[],
): void {
  if (control.status === "not-applicable") return;

  if (!hasValue(control.accountableOwner)) {
    findings.push(makeFinding(
      "SDC-03",
      "evidence-insufficient",
      control.statement,
      "The control has no recorded accountable owner.",
      "Identify the party responsible for implementing, operating and confirming the local control.",
      [],
      [`Control ${control.id}`],
    ));
  }

  const implClaimed =
    control.status === "implemented-evidence-provided" ||
    control.status === "effectiveness-under-review" ||
    control.status === "effectiveness-supported";
  const implementationEvidence = reviewedLocalEvidence(control.implementationEvidenceIds, refs);
  if (implClaimed && implementationEvidence.length === 0) {
    findings.push(makeFinding(
      "SDC-04",
      "evidence-insufficient",
      control.statement,
      "Implementation is claimed but no linked, reviewed local operational implementation evidence is documented.",
      "Provide implementation evidence with the local setting, provenance and review recorded.",
      control.implementationEvidenceIds,
      [`Control ${control.id}; claimed state ${control.status}`],
    ));
  }

  if (control.status === "effectiveness-supported") {
    const effectivenessEvidence = reviewedLocalEvidence(control.effectivenessEvidenceIds, refs);
    if (effectivenessEvidence.length === 0 || !hasValue(control.reviewerNotes)) {
      findings.push(makeFinding(
        "SDC-05",
        "evidence-insufficient",
        control.statement,
        "Control effectiveness is claimed, but reviewed local operational evidence and documented review reasoning are not both present.",
        "Provide reviewed effectiveness evidence, relevance to the specific hazard and an attributable clinical safety review.",
        control.effectivenessEvidenceIds,
        [`Control ${control.id}`],
      ));
    }
  }

  const knownIds = [...control.implementationEvidenceIds, ...control.effectivenessEvidenceIds];
  for (const id of new Set(knownIds)) {
    if (!refs.has(id)) {
      findings.push(makeFinding(
        "SDC-09",
        "identified-inconsistency",
        control.statement,
        `The control refers to evidence ID ${id}, which is absent from this assessment record.`,
        "Restore the referenced evidence record or correct the reference.",
        [id],
        [`Control ${control.id}`],
      ));
    }
  }
}

function checkRisk(
  risk: ResidualRiskClaim,
  controls: Map<string, Safeguard>,
  refs: Map<string, EvidenceReference>,
  findings: FindingDraft[],
): void {
  if (!hasValue(risk.methodId) || !hasValue(risk.methodVersion)) {
    findings.push(makeFinding(
      "SDC-07",
      "evidence-insufficient",
      risk.claimedReasoning,
      "The residual-risk claim lacks a defined and versioned organisational risk methodology.",
      "Record the applicable risk method and version before interpreting the claimed category.",
      [],
      [`Hazard ${risk.hazardId}`],
    ));
  }
  for (const id of new Set(risk.reliedOnControlIds)) {
    const control = controls.get(id);
    if (!control) {
      findings.push(makeFinding(
        "SDC-07",
        "identified-inconsistency",
        risk.claimedReasoning,
        `Residual-risk reasoning relies on control ${id}, which is not in this assessment.`,
        "Resolve the missing control reference and re-evaluate the risk argument.",
        [],
        [`Hazard ${risk.hazardId}`],
      ));
      continue;
    }
    // Only reviewed local evidence + explicit review reasoning is adequate
    // to avoid an *automatic evidence gap* finding. No positive verdict follows.
    const supported =
      control.status === "effectiveness-supported" &&
      reviewedLocalEvidence(control.implementationEvidenceIds, refs).length > 0 &&
      reviewedLocalEvidence(control.effectivenessEvidenceIds, refs).length > 0 &&
      hasValue(control.reviewerNotes);
    if (!supported) {
      findings.push(makeFinding(
        "SDC-07",
        "evidence-insufficient",
        risk.claimedReasoning,
        `The residual-risk claim relies on control ${id}, whose effectiveness is not supported by reviewed local operational evidence and recorded review reasoning.`,
        "Do not attribute risk reduction to this control without qualified review of implementation, effectiveness and applicability.",
        [...control.implementationEvidenceIds, ...control.effectivenessEvidenceIds],
        [`Hazard ${risk.hazardId}`, `Control ${id}`],
      ));
    }
  }
  if (!hasValue(risk.acceptanceAuthority) || !hasValue(risk.acceptanceDecisionEvidenceId)) {
    findings.push(makeFinding(
      "SDC-08",
      "requires-qualified-review",
      risk.claimedReasoning,
      "Accountable risk acceptance authority or its documented decision evidence is absent.",
      "Record the accountable authority and documentary evidence of its decision; do not infer acceptance from a risk score.",
      risk.acceptanceDecisionEvidenceId ? [risk.acceptanceDecisionEvidenceId] : [],
      [`Hazard ${risk.hazardId}`],
    ));
  } else if (risk.acceptanceDecisionEvidenceId && !refs.has(risk.acceptanceDecisionEvidenceId)) {
    findings.push(makeFinding(
      "SDC-08",
      "identified-inconsistency",
      risk.claimedReasoning,
      "The claimed acceptance decision points to an evidence record that is not present.",
      "Verify the acceptance decision and link its source record.",
      [risk.acceptanceDecisionEvidenceId],
      [`Hazard ${risk.hazardId}`],
    ));
  }
}

export type InternalChallengeResult = {
  ruleSetVersion: typeof SAFETY_CHECK_RULESET_VERSION;
  /** No positive declaration of risk acceptability can be made by this engine. */
  deploymentApproval: "not-assessed";
  residualRiskClassification: "not-determined";
  findings: SafetyFinding[];
};

/** Deterministic review prompts; never a substitute for an accountable CSO assessment. */
export function evaluateSafetyEvidence(input: Input): InternalChallengeResult {
  const drafts: FindingDraft[] = [];
  const refs = new Map(input.evidence.map((item) => [item.id, item]));
  const controls = new Map(input.controls.map((control) => [control.id, control]));

  const context = input.context;
  if (
    !hasValue(context.systemName) ||
    !hasValue(context.productVersion) ||
    !hasValue(context.intendedPurpose) ||
    !hasValue(context.careSetting) ||
    !hasValue(context.deploymentOrganisation) ||
    !hasValue(context.workflowDescription) ||
    !hasValue(input.proposedDecision)
  ) {
    drafts.push(makeFinding(
      "SDC-01",
      "evidence-insufficient",
      input.proposedDecision,
      "The deployment context or proposed safety decision is incomplete.",
      "Specify intended purpose, product version, deploying organisation, setting, workflow and proposed decision.",
    ));
  }

  for (const control of input.controls) checkControl(control, refs, drafts);
  for (const risk of input.residualRiskClaims) checkRisk(risk, controls, refs, drafts);

  const findings: SafetyFinding[] = drafts.map((finding, index) => ({
    ...finding,
    id: `F-${String(index + 1).padStart(3, "0")}`,
    accountableReviewer: null,
    reviewerResolutionEvidenceIds: [],
  }));

  return {
    ruleSetVersion: SAFETY_CHECK_RULESET_VERSION,
    deploymentApproval: "not-assessed",
    residualRiskClassification: "not-determined",
    findings,
  };
}

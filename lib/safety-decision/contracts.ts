/**
 * Safety Decision Challenge input/output contract, v0.1.
 *
 * INTERNAL DESIGN TYPES ONLY. No running assessment engine is implemented here.
 * A source citation, named control or declared risk band is not evidence
 * that a safeguard is effective or that a deployment is acceptable.
 */

export type SourceClassification =
  | "published-standard-or-law"
  | "official-guidance"
  | "peer-reviewed-research"
  | "published-service-evaluation"
  | "professional-recommendation"
  | "supplier-assertion"
  | "local-operational-evidence"
  | "expert-judgement"
  | "assumption";

export type EvidenceReference = {
  id: string;
  title: string;
  classification: SourceClassification;
  sourceUriOrDocumentId: string;
  version: string | null;
  publishedOrEffectiveDate: string | null;
  reviewedAt: string | null;
  jurisdiction: string | null;
  applicabilityNote: string;
  limitations: string[];
};

export type SafeguardStatus =
  | "declared"
  | "implementation-unverified"
  | "implemented-evidence-provided"
  | "effectiveness-under-review"
  | "effectiveness-supported"
  | "not-applicable";

export type Safeguard = {
  id: string;
  hazardIds: string[];
  statement: string;
  claimedBy: string;
  accountableOwner: string | null;
  status: SafeguardStatus;
  implementationEvidenceIds: string[];
  effectivenessEvidenceIds: string[];
  localDependencies: string[];
  reviewerNotes: string | null;
};

export type DecisionContext = {
  id: string;
  systemName: string;
  productVersion: string;
  modelVersion: string | null;
  intendedPurpose: string;
  careSetting: string;
  deploymentOrganisation: string;
  workflowDescription: string;
  relevantPopulation: string;
  scopeLimits: string[];
};

export type ResidualRiskClaim = {
  hazardId: string;
  methodId: string | null;
  methodVersion: string | null;
  claimedCategory: string | null;
  claimedReasoning: string;
  reliedOnControlIds: string[];
  acceptanceAuthority: string | null;
  acceptanceDecisionEvidenceId: string | null;
};

export type FindingStatus =
  | "potential-concern"
  | "identified-inconsistency"
  | "evidence-insufficient"
  | "requires-qualified-review"
  | "resolved-with-reviewed-evidence";

export type SafetyFinding = {
  id: string;
  criterionId: string;
  status: FindingStatus;
  challengedStatement: string;
  scenarioFacts: string[];
  referencedEvidenceIds: string[];
  reason: string;
  uncertainty: string;
  requiredAction: string;
  accountableReviewer: string | null;
  reviewerResolutionEvidenceIds: string[];
};

/** Historical records are immutable once approved. Changes generate new revisions. */
export type SafetyDecisionRecord = {
  schemaVersion: "0.1";
  id: string;
  revision: number;
  context: DecisionContext;
  proposedDecision: string;
  hazards: { id: string; description: string; potentialHarm: string }[];
  controls: Safeguard[];
  residualRiskClaims: ResidualRiskClaim[];
  evidence: EvidenceReference[];
  findings: SafetyFinding[];
  governanceActions: { findingId: string; owner: string | null; action: string; status: "open" | "in-review" | "closed" }[];
  methodVersion: string;
  ruleSetVersion: string;
  recordedAt: string;
  reviewedBy: string | null;
  reviewCompletedAt: string | null;
};

export type ChangeInput = {
  previousRecordId: string;
  previousRevision: number;
  changedComponent: "model" | "system" | "workflow" | "control" | "evidence" | "guidance" | "governance";
  previousValueOrReference: string;
  newValueOrReference: string;
  changeEvidenceIds: string[];
};

export type ChangeImpactFinding = {
  affectedPriorHazardIds: string[];
  affectedPriorControlIds: string[];
  affectedPriorFindingIds: string[];
  reviewReason: string;
  reassessmentRequired: boolean | "undetermined";
  accountableReviewer: string | null;
};

// No acceptabilityFor(), automatic verification, approval or scoring here.

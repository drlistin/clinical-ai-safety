/**
 * INTERNAL proposed decision-validity v0.2 contracts.
 *
 * New bounded research input: does not replace the v0.1 assessment contract,
 * infer actual hazard coverage, adjudicate a clinical finding, compute a
 * clinical risk band, or authorise a deployment.
 */

export type EvidenceKindV02 =
  | "published-evaluation"
  | "supplier-assertion"
  | "local-implementation"
  | "local-effectiveness"
  | "organisation-risk-method"
  | "governance-decision"
  | "assumption";

export type ApplicabilityScopeV02 = {
  productVersion: string | null;
  modelVersion: string | null;
  careSetting: string | null;
  population: string | null;
  workflowId: string | null;
};

export type EvidenceV02 = {
  id: string;
  title: string;
  kind: EvidenceKindV02;
  /** Exact publisher URL or controlled identifier, not proof of authenticity. */
  sourceId: string;
  sourceDate: string | null;
  reviewerId: string | null;
  reviewedAt: string | null;
  appliesTo: ApplicabilityScopeV02;
  limitations: string[];
};

export type ContextStatusV02 = "known" | "unknown" | "not-applicable";
export type ContextDimensionV02 = {
  id: string;
  status: ContextStatusV02;
  description: string | null;
  /** A reason is required if declaring a material dimension not applicable. */
  applicabilityReason: string | null;
};

export type DecisionContextV02 = {
  id: string;
  asOfDate: string;
  deploymentOrganisation: string;
  productVersion: string;
  modelVersion: string | null;
  careSetting: string;
  population: string;
  workflowId: string;
  intendedUse: string;
  proposedDecision: string;
  /** Explicitly selected for this scenario: not a universal clinical checklist. */
  materialContextDimensionIds: string[];
  contextDimensions: ContextDimensionV02[];
};

export type HazardV02 = {
  id: string;
  hazardousSituation: string;
  potentialHarm: string;
  scenarioConditionIds: string[];
};

export type SafeguardV02 = {
  id: string;
  hazardIds: string[];
  statement: string;
  /** Workflow steps are not, without an additional mechanism, risk controls. */
  role: "safeguard" | "workflow-activity";
  mechanism: "prevent" | "detect" | "mitigate" | "recover" | "none";
  mechanismExplanation: string | null;
  accountableOwner: string | null;
  status: "proposed" | "implementation-claimed" | "effectiveness-claimed";
  implementationEvidenceIds: string[];
  effectivenessEvidenceIds: string[];
  /** Known common-cause dependencies; absence does not establish independence. */
  dependencyIds: string[];
};

export type HazardRiskAssessmentV02 = {
  /** Category is supplied by an organisation, never assigned by the engine. */
  category: string | null;
  reasoning: string | null;
};

export type ControlRiskEffectV02 = {
  controlId: string;
  assertedEffectOn: "likelihood" | "severity" | "both" | "none";
  /** Whether an actual risk reduction is being claimed, not engine-inferred. */
  reductionClaimed: boolean;
  rationale: string | null;
  effectEvidenceIds: string[];
};

export type HazardRiskArgumentV02 = {
  hazardId: string;
  riskMethodEvidenceId: string | null;
  initial: HazardRiskAssessmentV02;
  residual: HazardRiskAssessmentV02;
  controlEffects: ControlRiskEffectV02[];
};

export type ControlIndependenceClaimV02 = {
  controlIds: string[];
  assertion: "independent" | "not-independent" | "undetermined";
  rationale: string | null;
};

export type GovernanceClaimsV02 = {
  csoIdentifier: string | null;
  csoReviewEvidenceId: string | null;
  riskAcceptanceAuthority: string | null;
  riskAcceptanceEvidenceId: string | null;
  deploymentAuthority: string | null;
  deploymentAuthorisationEvidenceId: string | null;
  monitoringPlanEvidenceId: string | null;
};

export type DecisionChallengeV02 = {
  schemaVersion: "0.2";
  id: string;
  /** All records in v0.2 proof-of-method work are synthetic. */
  caseType: "synthetic-research";
  context: DecisionContextV02;
  hazards: HazardV02[];
  controls: SafeguardV02[];
  evidence: EvidenceV02[];
  riskArguments: HazardRiskArgumentV02[];
  independenceClaims: ControlIndependenceClaimV02[];
  governance: GovernanceClaimsV02;
};

export type CandidateFindingV02 = {
  id: string;
  criterionId: "SDC-01" | "SDC-03" | "SDC-04" | "SDC-05" |
    "SDC-06" | "SDC-07" | "SDC-08" | "SDC-09" | "SDC-10";
  status: "identified-inconsistency" | "evidence-insufficient" |
    "potential-concern" | "requires-qualified-review";
  subjectIds: string[];
  reason: string;
  requiredAction: string;
  evidenceIds: string[];
  uncertainty: string;
  /** The candidate is not a reference label or an accepted finding. */
  reviewerDisposition: null;
};

export type DecisionChallengeResultV02 = {
  ruleSetVersion: "0.2.0-proposal";
  reviewStatus: "unadjudicated";
  deploymentApproval: "not-assessed";
  residualRiskClassification: "not-determined";
  findings: CandidateFindingV02[];
};

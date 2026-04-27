/**
 * Governance validation for the Hazard Log Builder.
 *
 * Eight rules check the draft entry for issues a senior Clinical Safety
 * Officer would flag during review. Output drives the governance status
 * shown on Page 1 of the PDF and the recommended next step on Page 4.
 */

import type {
  GovernanceConcern,
  GovernanceStatus,
  Recommendation,
} from "./pdf/types";
import type { Scenario } from "@/lib/scenarios/types";

export type ValidationInput = {
  scenario: Scenario;
  hazard: string;
  cause: string;
  consequence: string;
  severity: number;
  likelihood: number;
  residualSeverity: number;
  residualLikelihood: number;
  residualRationale: string;
  preventativeControls: string[];
  detectiveControls: string[];
  correctiveControls: string[];
  monitoringMetric: string;
  triggerThreshold: string;
  reviewFrequency: string;
  capa: string;
  owner: string;
  severityEvidence: string[];
  likelihoodEvidence: string[];
};

export type ValidationResult = {
  status: GovernanceStatus;
  governanceConcern: GovernanceConcern;
  governanceConcernRationale: string;
  criticalWarnings: string[];
  requiredImprovements: string[];
  recommendation: Recommendation;
  recommendationNote: string;
};

// Phrases that indicate a "soft" control rather than a real one.
const WEAK_CONTROL_PATTERNS = [
  /\btrain(ing|s)?\s+staff\b/i,
  /\bstaff\s+training\b/i,
  /\bbe\s+careful\b/i,
  /\bawareness\b/i,
  /\bpolicy\s+(only|alone)\b/i,
  /\breport\s+if\s+noticed\b/i,
  /^\s*monthly\s+review\s+only\s*$/i,
  /\breminder\s+to\b/i,
  /\bencourage(d)?\s+to\b/i,
];

// Phrases that indicate a weak monitoring or CAPA approach.
const WEAK_MONITORING_PATTERNS = [
  /no\s+issues\s+reported/i,
  /many\s+complaints/i,
  /\byearly\b/i,
  /\bannual(ly)?\b/i,
  /discuss\s+internally/i,
  /informal\s+review/i,
  /^\s*tbd\s*$/i,
];

// AI triage hazards must not claim risk has been eliminated.
const ELIMINATED_PATTERNS = [
  /\beliminat(ed|es|e)\b/i,
  /\bzero\s+risk\b/i,
  /\bno\s+residual\s+risk\b/i,
  /\bcompletely\s+removed?\b/i,
];

// Real clinical ownership signals.
const CLINICAL_OWNERSHIP_PATTERNS = [
  /clinical\s+safety\s+officer/i,
  /\bcso\b/i,
  /clinical\s+lead/i,
  /clinician/i,
  /medical\s+director/i,
  /pathway\s+lead/i,
  /caldicott/i,
];

// IT-only ownership (insufficient on its own).
const IT_ONLY_PATTERNS = [/^\s*it\s+team\s*$/i, /^\s*it\s*$/i, /^\s*technology\s+team\s*$/i];

function anyMatches(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function listMatches(items: string[], patterns: RegExp[]): string[] {
  return items.filter((it) => anyMatches(it, patterns));
}

export function runValidation(input: ValidationInput): ValidationResult {
  const critical: string[] = [];
  const improvements: string[] = [];

  const refSeverity = input.scenario.feedback.severity.expected;
  const refLikelihood = input.scenario.feedback.likelihood.expected;
  const allText = [
    input.hazard,
    input.cause,
    input.consequence,
    input.residualRationale,
    input.capa,
  ]
    .join(" ")
    .toLowerCase();
  const isAiTriage = input.scenario.id === "cancer-referral-triage";

  // Rule 1. Underestimated severity.
  if (input.severity > 0 && input.severity < refSeverity - 1) {
    critical.push(
      `Severity scored ${input.severity}. Reference position is ${refSeverity} given the worst-credible patient outcome. Reassess before sign-off.`,
    );
  } else if (input.severity > 0 && input.severity < refSeverity) {
    improvements.push(
      `Severity is one band below the reference. Consider whether the worst-credible outcome is fully captured.`,
    );
  }

  // Rule 2. Underestimated likelihood.
  if (input.likelihood > 0 && input.likelihood < refLikelihood - 1) {
    improvements.push(
      `Likelihood appears optimistic relative to deployment volume. Cross-check with incident data or pilot evidence.`,
    );
  }

  // Rule 3. Unrealistic residual severity reduction.
  if (
    input.severity >= 4 &&
    input.residualSeverity > 0 &&
    input.residualSeverity <= input.severity - 2
  ) {
    critical.push(
      `Residual severity ${input.residualSeverity} is implausibly low for an initial severity of ${input.severity}. Controls reduce likelihood, rarely severity.`,
    );
  }

  // Rule 4. Unsupported low residual risk.
  const residualLow =
    input.residualSeverity > 0 &&
    input.residualLikelihood > 0 &&
    input.residualSeverity * input.residualLikelihood <= 5;
  const allEvidence = new Set([
    ...input.severityEvidence,
    ...input.likelihoodEvidence,
  ]);
  const onlyAssumption =
    allEvidence.size === 1 && allEvidence.has("Assumption only");
  if (residualLow && onlyAssumption) {
    improvements.push(
      `Residual risk is rated Low based only on expert assumption. Pilot or audit evidence is needed before claiming acceptability.`,
    );
  }
  const proposedHasContent =
    [
      ...input.preventativeControls,
      ...input.detectiveControls,
      ...input.correctiveControls,
    ].length > 0;
  if (residualLow && !proposedHasContent) {
    improvements.push(
      `Residual risk is rated Low but no controls have been entered. Document the controls that justify the reduction.`,
    );
  }

  // Rule 5. Weak controls.
  const allControls = [
    ...input.preventativeControls,
    ...input.detectiveControls,
    ...input.correctiveControls,
  ];
  const weakControls = listMatches(allControls, WEAK_CONTROL_PATTERNS);
  if (weakControls.length > 0) {
    improvements.push(
      `${weakControls.length} control entr${weakControls.length === 1 ? "y reads" : "ies read"} as a soft expectation rather than an enforced control. Tighten wording so the control is auditable.`,
    );
  }

  // Rule 6. Weak monitoring or CAPA.
  const monitoringText = [
    input.monitoringMetric,
    input.triggerThreshold,
    input.reviewFrequency,
    input.capa,
  ];
  const weakMonitoring = monitoringText.some((t) =>
    anyMatches(t, WEAK_MONITORING_PATTERNS),
  );
  if (weakMonitoring) {
    improvements.push(
      `Monitoring or CAPA wording is too informal for governance review. Define measurable triggers and a clear escalation path.`,
    );
  }

  // Rule 7. Missing clinical ownership.
  if (!input.owner.trim()) {
    critical.push("No owner has been assigned to this hazard.");
  } else if (anyMatches(input.owner, IT_ONLY_PATTERNS)) {
    critical.push(
      `Ownership is recorded as IT only. Clinical Safety Officer or clinical lead accountability is required.`,
    );
  } else if (!anyMatches(input.owner, CLINICAL_OWNERSHIP_PATTERNS)) {
    improvements.push(
      `Owner does not name a Clinical Safety Officer, clinical lead, or pathway lead. Add named clinical accountability.`,
    );
  }

  // Rule 8. "Risk eliminated" language for AI triage.
  if (isAiTriage && anyMatches(allText, ELIMINATED_PATTERNS)) {
    critical.push(
      `AI triage hazards cannot be described as eliminated or zero-risk. Restate the residual risk in measurable terms.`,
    );
  }

  // Governance concern follows severity, independent of likelihood.
  const concern = governanceConcernFor(
    Math.max(input.severity, input.residualSeverity),
  );
  const concernRationale = governanceConcernRationale(input.scenario, concern);

  // Status: critical = not ready, soft only = needs review, else acceptable.
  let status: GovernanceStatus;
  if (critical.length > 0) {
    status = "Not governance-ready";
  } else if (improvements.length > 0) {
    status = "Needs review";
  } else {
    status = "Acceptable draft";
  }

  // Recommendation derives from status.
  let recommendation: Recommendation;
  let recommendationNote: string;
  if (status === "Not governance-ready") {
    recommendation = "Not acceptable pending mitigation";
    recommendationNote =
      "Resolve the critical issues listed above before this entry is taken to governance.";
  } else if (status === "Needs review") {
    recommendation = "Proceed to governance review";
    recommendationNote =
      "Take to the Clinical Safety Group with the noted improvements addressed.";
  } else {
    recommendation = "Proceed to governance review";
    recommendationNote =
      "Entry is suitable for review by the Clinical Safety Group as a working draft.";
  }

  return {
    status,
    governanceConcern: concern,
    governanceConcernRationale: concernRationale,
    criticalWarnings: critical,
    requiredImprovements: improvements,
    recommendation,
    recommendationNote,
  };
}

function governanceConcernFor(severity: number): GovernanceConcern {
  if (severity >= 5) return "Severe";
  if (severity >= 4) return "High";
  if (severity >= 3) return "Moderate";
  return "Low";
}

function governanceConcernRationale(
  scenario: Scenario,
  concern: GovernanceConcern,
): string {
  if (concern === "Severe" || concern === "High") {
    return `Worst-credible outcome is ${describeWorstOutcome(scenario)}. Numerical residual reduction does not lower clinical concern.`;
  }
  if (concern === "Moderate") {
    return "Outcomes are recoverable but warrant active oversight.";
  }
  return "Outcomes are minor and within routine clinical management.";
}

function describeWorstOutcome(scenario: Scenario): string {
  if (scenario.id === "cancer-referral-triage") {
    return "delayed diagnosis of upper GI cancer";
  }
  return "patient harm with potential for lasting clinical impact";
}

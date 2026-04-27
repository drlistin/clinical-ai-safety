/**
 * Governance validation for the Hazard Log Builder.
 *
 * Rules check the draft entry for issues a senior Clinical Safety Officer
 * would flag during review. Output drives the governance status shown on
 * Page 1 of the PDF and the recommended next step on Page 4.
 *
 * Produces a bidirectional governance-adjusted score:
 *   - When the user UNDER-scored severity/likelihood relative to the
 *     scenario reference, the adjusted score uses the reference (upward).
 *   - When the user OVER-scored relative to the credible severity or
 *     likelihood implied by the described hazard text (e.g. scoring 5/5
 *     for "minor inconvenience"), the adjusted score uses the inferred
 *     ceiling (downward).
 *
 * Safety-direction critical warnings (under-scoring, missing owner,
 * eliminated language, implausible residual) floor governance concern to
 * at least "High". Integrity-direction critical warnings (over-scoring)
 * do NOT floor concern - the actual described hazard remains low.
 *
 * Any critical warning forces the overall-acceptability label to a
 * non-acceptable variant.
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
  /** Reference values used to compute the governance-adjusted score. */
  referenceSeverity: number;
  referenceLikelihood: number;
  /** True when the user's score is governance-incorrect in EITHER direction. */
  severityChallenged: boolean;
  likelihoodChallenged: boolean;
  /** True when the user's score exceeds the credible value implied by the described hazard. */
  severityOverstated: boolean;
  likelihoodOverstated: boolean;
  /** Governance-adjusted score uses the governance-correct severity/likelihood. */
  adjustedSeverity: number;
  adjustedLikelihood: number;
  adjustedRiskScore: number;
  adjustedRiskBand: "Low" | "Medium" | "High" | "Extreme";
  /** Overall direction of the score adjustment, if any. */
  scoreAdjustmentDirection: "upward" | "downward" | "mixed" | "none";
  /**
   * If non-empty this MUST be used in place of the band-derived
   * overall acceptability string. Triggered by any critical warning.
   */
  overallAcceptabilityOverride: string;
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

// Phrases that imply a credible severity ceiling around 1-2 (minor / admin /
// non-urgent / no clinical impact). Used to detect over-scored severity.
const LOW_SEVERITY_TEXT_MARKERS = [
  /\bminor\s+(inconvenience|delay|disruption|impact|issue|nuisance)\b/i,
  /\badministrative\s+(delay|impact|burden|only|issue)\b/i,
  /\bnon[\s-]?urgent\b/i,
  /\bno\s+(clinical|patient)\s+(impact|harm|consequence)\b/i,
  /\bsmall\s+delay\b/i,
  /\bslight\s+delay\b/i,
  /\bbrief\s+delay\b/i,
  /\boutpatient\s+follow[\s-]?up\b/i,
  /\blow[\s-]?acuity\b/i,
  /\bpatient\s+inconvenience\b/i,
  /\bnon[\s-]?clinical\b/i,
  /\bschedul(e|ing|ed)\s+delay\b/i,
  /\brebooked?\b/i,
  /\breschedul(e|ed|ing)\b/i,
];

// Phrases that imply a credible likelihood ceiling around 1-2 (rare /
// isolated / occasional). Used to detect over-scored likelihood.
const RARE_LIKELIHOOD_MARKERS = [
  /\bisolated\s+(incident|case|event|occurrence)\b/i,
  /\brarely?\b/i,
  /\boccasional(ly)?\b/i,
  /\buncommon\b/i,
  /\bone[\s-]?off\b/i,
  /\bedge[\s-]?case\b/i,
  /\bexceptional\b/i,
  /\binfrequent(ly)?\b/i,
  /\bvery\s+rare\b/i,
  /\bseldom\b/i,
];

function anyMatches(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function listMatches(items: string[], patterns: RegExp[]): string[] {
  return items.filter((it) => anyMatches(it, patterns));
}

export function runValidation(input: ValidationInput): ValidationResult {
  // Two buckets so we can distinguish "the entry is unsafe" criticals from
  // "the entry has integrity issues" criticals. Concern is only floored to
  // High by the former.
  const safetyCritical: string[] = [];
  const integrityCritical: string[] = [];
  const improvements: string[] = [];

  const refSeverity = input.scenario.feedback.severity.expected;
  const refLikelihood = input.scenario.feedback.likelihood.expected;
  // Scoring text is the user-described hazard surface area. Residual
  // rationale and CAPA are intentionally NOT included in the scoring-text
  // signal because their wording can drift away from the hazard itself.
  const scoringText = [input.hazard, input.cause, input.consequence]
    .join(" ")
    .toLowerCase();
  // Full text is used by ownership / language rules that look across the
  // whole entry.
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

  // Inferred ceilings driven by the user-described hazard text. When the
  // text patently implies a low-severity / rare event, scoring 4-5 is a
  // governance issue independent of the scenario reference.
  const sevCeiling = anyMatches(scoringText, LOW_SEVERITY_TEXT_MARKERS) ? 2 : null;
  const likCeiling = anyMatches(scoringText, RARE_LIKELIHOOD_MARKERS) ? 2 : null;

  // Direction flags driven by reference (under) and inferred ceiling (over).
  const severityUnderstated =
    input.severity > 0 && input.severity < refSeverity;
  const likelihoodUnderstated =
    input.likelihood > 0 && input.likelihood < refLikelihood;
  const severityOverstated =
    sevCeiling != null && input.severity > 0 && input.severity > sevCeiling;
  const likelihoodOverstated =
    likCeiling != null && input.likelihood > 0 && input.likelihood > likCeiling;

  // Rule 1. Underestimated severity.
  if (input.severity > 0 && input.severity < refSeverity - 1) {
    safetyCritical.push(
      `Severity scored ${input.severity}. Reference position is ${refSeverity} given the worst-credible patient outcome. Reassess before sign-off.`,
    );
  } else if (input.severity > 0 && input.severity < refSeverity) {
    improvements.push(
      `Severity is one band below the reference. Consider whether the worst-credible outcome is fully captured.`,
    );
  }

  // Rule 1b. Overstated severity (text implies low-impact event).
  if (severityOverstated && input.severity >= sevCeiling! + 2) {
    integrityCritical.push(
      `Severity scored ${input.severity}. Described hazard reads as ${describeLowSeverityFrame(scoringText)} (credible severity around ${sevCeiling}). Score does not match the described workflow impact, reassess before sign-off.`,
    );
  } else if (severityOverstated) {
    improvements.push(
      `Severity scored ${input.severity} but described hazard reads as low-impact. Verify worst-credible severity is genuinely ${input.severity} rather than ${sevCeiling}.`,
    );
  }

  // Rule 2. Underestimated likelihood.
  if (input.likelihood > 0 && input.likelihood < refLikelihood - 1) {
    improvements.push(
      `Likelihood appears optimistic relative to deployment volume. Cross-check with incident data or pilot evidence.`,
    );
  }

  // Rule 2b. Overstated likelihood (text implies isolated/uncommon event).
  if (likelihoodOverstated && input.likelihood >= likCeiling! + 2) {
    integrityCritical.push(
      `Likelihood scored ${input.likelihood}. Described hazard reads as isolated, uncommon or occasional (credible likelihood around ${likCeiling}). Reassess before sign-off.`,
    );
  } else if (likelihoodOverstated) {
    improvements.push(
      `Likelihood scored ${input.likelihood} but described hazard reads as rare or occasional. Verify deployment volume justifies this likelihood.`,
    );
  }

  // Rule 3. Unrealistic residual severity reduction.
  if (
    input.severity >= 4 &&
    input.residualSeverity > 0 &&
    input.residualSeverity <= input.severity - 2
  ) {
    safetyCritical.push(
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
    safetyCritical.push("No owner has been assigned to this hazard.");
  } else if (anyMatches(input.owner, IT_ONLY_PATTERNS)) {
    safetyCritical.push(
      `Ownership is recorded as IT only. Clinical Safety Officer or clinical lead accountability is required.`,
    );
  } else if (!anyMatches(input.owner, CLINICAL_OWNERSHIP_PATTERNS)) {
    improvements.push(
      `Owner does not name a Clinical Safety Officer, clinical lead, or pathway lead. Add named clinical accountability.`,
    );
  }

  // Rule 8. "Risk eliminated" language for AI triage.
  if (isAiTriage && anyMatches(allText, ELIMINATED_PATTERNS)) {
    safetyCritical.push(
      `AI triage hazards cannot be described as eliminated or zero-risk. Restate the residual risk in measurable terms.`,
    );
  }

  // Governance-adjusted scoring (bidirectional). When the user under-scored
  // a dimension we adopt the scenario reference; when they over-scored it
  // we adopt the inferred ceiling implied by the described hazard text.
  // When neither, we adopt the user-entered value (or fall back to the
  // reference if no value was entered yet).
  const severityChallenged = severityUnderstated || severityOverstated;
  const likelihoodChallenged = likelihoodUnderstated || likelihoodOverstated;

  let adjustedSeverity: number;
  if (severityOverstated) adjustedSeverity = sevCeiling!;
  else adjustedSeverity = input.severity || refSeverity;

  let adjustedLikelihood: number;
  if (likelihoodOverstated) adjustedLikelihood = likCeiling!;
  else if (likelihoodUnderstated) adjustedLikelihood = refLikelihood;
  else adjustedLikelihood = input.likelihood || refLikelihood;

  const adjustedRiskScore = adjustedSeverity * adjustedLikelihood;
  const adjustedRiskBand = bandFor(adjustedRiskScore);

  // Overall direction discriminator for downstream UI styling.
  let scoreAdjustmentDirection: "upward" | "downward" | "mixed" | "none";
  const anyUp = severityUnderstated || likelihoodUnderstated;
  const anyDown = severityOverstated || likelihoodOverstated;
  if (anyUp && anyDown) scoreAdjustmentDirection = "mixed";
  else if (anyUp) scoreAdjustmentDirection = "upward";
  else if (anyDown) scoreAdjustmentDirection = "downward";
  else scoreAdjustmentDirection = "none";

  // Governance concern follows the governance-adjusted severity (which is
  // already the reference when under-scored, or the inferred ceiling when
  // over-scored, or the user value when honest). This means concern reflects
  // the ACTUAL described hazard - over-scoring no longer inflates concern.
  const worstCredibleSeverity = Math.max(
    adjustedSeverity,
    input.residualSeverity,
    0,
  );
  let concern = governanceConcernFor(worstCredibleSeverity);

  // Combine criticals. Safety-direction criticals (under-scoring, missing
  // owner, eliminated language, implausible residual) genuinely indicate an
  // unsafe entry. Integrity-direction criticals (over-scoring) indicate a
  // governance-integrity issue but the actual hazard is low.
  const critical = [...safetyCritical, ...integrityCritical];

  // Status: critical = not ready, soft only = needs review, else acceptable.
  let status: GovernanceStatus;
  if (critical.length > 0) {
    status = "Not governance-ready";
  } else if (improvements.length > 0) {
    status = "Needs review";
  } else {
    status = "Acceptable draft";
  }

  // Floor: only safety-direction criticals lift concern to at least "High".
  // Over-scoring criticals are NOT a safety underestimate, so they must not
  // inflate concern - the actual described hazard is still low.
  if (safetyCritical.length > 0) {
    concern = liftConcernToAtLeastHigh(concern);
  }

  const concernRationale = governanceConcernRationale(
    input.scenario,
    concern,
    severityUnderstated,
    severityOverstated,
    likelihoodOverstated,
    safetyCritical.length > 0,
    scoringText,
  );

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

  // Overall acceptability override: when any critical warning is present
  // the report MUST NOT show "Acceptable" or any positive variant. This
  // overrides the band-derived acceptability label downstream.
  let overallAcceptabilityOverride = "";
  if (critical.length > 0) {
    overallAcceptabilityOverride = "Requires mitigation before sign-off";
  }

  return {
    status,
    governanceConcern: concern,
    governanceConcernRationale: concernRationale,
    criticalWarnings: critical,
    requiredImprovements: improvements,
    recommendation,
    recommendationNote,
    referenceSeverity: refSeverity,
    referenceLikelihood: refLikelihood,
    severityChallenged,
    likelihoodChallenged,
    severityOverstated,
    likelihoodOverstated,
    adjustedSeverity,
    adjustedLikelihood,
    adjustedRiskScore,
    adjustedRiskBand,
    scoreAdjustmentDirection,
    overallAcceptabilityOverride,
  };
}

function bandFor(score: number): "Low" | "Medium" | "High" | "Extreme" {
  if (score <= 5) return "Low";
  if (score <= 10) return "Medium";
  if (score <= 15) return "High";
  return "Extreme";
}

function liftConcernToAtLeastHigh(c: GovernanceConcern): GovernanceConcern {
  if (c === "Severe" || c === "High") return c;
  return "High";
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
  severityUnderstated: boolean,
  severityOverstated: boolean,
  likelihoodOverstated: boolean,
  hasSafetyCritical: boolean,
  scoringText: string,
): string {
  // Order matters. Over-scoring branches FIRST so the rationale never
  // paraphrases a scenario worst-outcome that doesn't match the described
  // hazard (e.g. cancer wording leaking into an outpatient-delay entry).
  if (severityOverstated && likelihoodOverstated) {
    return "Submitted scoring overestimates both severity and likelihood compared with the described workflow impact. Governance position is taken from the credible severity and likelihood implied by the described hazard.";
  }
  if (severityOverstated) {
    return "Submitted scoring overestimates the credible severity compared with the described workflow impact. Governance position is taken from the severity implied by the described hazard, not the user-entered value.";
  }
  if (likelihoodOverstated) {
    return "Submitted scoring overestimates the credible likelihood compared with the described frequency of the event. Governance position is taken from the likelihood implied by the described hazard.";
  }
  // Under-scored severity. Rationale must not paraphrase the unsafe user
  // value, but must also only invoke the scenario worst-outcome when the
  // user's text is consistent with that scenario.
  if (severityUnderstated) {
    return `Potential for ${describeWorstOutcomeFor(scenario, scoringText)} and avoidable harm. Submitted scoring underestimates credible severity, governance position is taken from the reference worst-credible outcome.`;
  }
  if (hasSafetyCritical) {
    return `Critical governance issues are unresolved. Worst-credible outcome remains ${describeWorstOutcomeFor(scenario, scoringText)}, this entry is not acceptable until those issues are mitigated.`;
  }
  if (concern === "Severe" || concern === "High") {
    return `Worst-credible outcome is ${describeWorstOutcomeFor(scenario, scoringText)}. Numerical residual reduction does not lower clinical concern.`;
  }
  if (concern === "Moderate") {
    return "Outcomes are recoverable but warrant active oversight.";
  }
  return "Outcomes are minor and within routine clinical management.";
}

/**
 * Worst-outcome wording is scenario-aware AND text-aware. We only emit the
 * scenario-specific phrase when the user's described hazard text is actually
 * aligned with the scenario template - otherwise we fall back to a generic
 * frame. Prevents stale cancer wording from leaking into outpatient-delay
 * (or any other) entries when the user re-uses the cancer scenario as a
 * canvas for a different hazard.
 */
function describeWorstOutcomeFor(scenario: Scenario, scoringText: string): string {
  if (scenario.id === "cancer-referral-triage") {
    if (/\b(cancer|oncolog|tumour|tumor|malignan|metastas|carcinoma|GI bleed|dysphagia|anaemia|weight loss|red[\s-]?flag)\b/i.test(scoringText)) {
      return "delayed diagnosis of upper GI cancer";
    }
  }
  return "patient harm with potential for lasting clinical impact";
}

/** Short fragment used inside an over-scored severity critical warning. */
function describeLowSeverityFrame(scoringText: string): string {
  if (/\b(minor\s+inconvenience|patient\s+inconvenience)\b/i.test(scoringText)) {
    return "a minor inconvenience";
  }
  if (/\badministrative\b/i.test(scoringText)) {
    return "an administrative-only impact";
  }
  if (/\bnon[\s-]?urgent\b/i.test(scoringText)) {
    return "a non-urgent workflow impact";
  }
  if (/\bschedul/i.test(scoringText)) {
    return "a scheduling-only impact";
  }
  return "a low-impact workflow event";
}

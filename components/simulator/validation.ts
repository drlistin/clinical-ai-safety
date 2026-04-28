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
  /**
   * Text-aware rationales that REPLACE the scenario-template rationales
   * downstream. Required because scenario.feedback.*.rationale is hard-coded
   * to the cancer-pathway frame and must never appear on a non-cancer hazard.
   * Generated from the user's described hazard text, the scoring direction
   * and the user-entered score.
   */
  derivedSeverityRationale: string;
  derivedLikelihoodRationale: string;
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
  /\bminor\s+(inconvenience|delay|disruption|impact|issue|nuisance|wait)\b/i,
  /\badministrative\s+(delay|impact|burden|only|issue)\b/i,
  /\bnon[\s-]?urgent\b/i,
  /\bno\s+(clinical|patient)\s+(impact|harm|consequence)\b/i,
  /\bsmall\s+delay\b/i,
  /\bslight\s+delay\b/i,
  /\bbrief\s+delay\b/i,
  /\boutpatient\s+follow[\s-]?up\b/i,
  /\bfollow[\s-]?up\s+appointment\b/i,
  /\blow[\s-]?acuity\b/i,
  /\bpatient\s+inconvenience\b/i,
  /\binconvenience\s+to\s+(the\s+)?patient\b/i,
  /\bnon[\s-]?clinical\b/i,
  /\bschedul(e|ing|ed)\s+delay\b/i,
  /\brebooked?\b/i,
  /\breschedul(e|ed|ing)\b/i,
  /\bextended\s+wait\b/i,
  /\bappointment\s+delay\b/i,
  /\broutine\s+(appointment|booking|review)\b/i,
];

// Wording that is a positive signal of CREDIBLE high severity (5). Used to
// distinguish a deliberate Sev 5 from an over-scored Sev 5. If any of these
// fire AND a low-severity marker also fires, we treat the entry as ambiguous
// and let the low-severity ceiling apply (the described workflow impact
// dominates).
const HIGH_SEVERITY_TEXT_MARKERS = [
  /\b(death|mortality|fatal|fatality)\b/i,
  /\b(catastrophic|life[\s-]?threatening)\b/i,
  /\b(permanent|lasting|irreversible)\s+(harm|disability|injury|damage)\b/i,
  /\bsevere\s+harm\b/i,
  /\b(missed|delayed)\s+(diagnosis|treatment)\b/i,
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

  // Rule 3 has been moved below the governance-adjusted scoring block so the
  // residual plausibility check compares against `adjustedSeverity` rather
  // than the user-entered value. See "Rule 3 (post-adjustment)" further down.

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
  else if (severityUnderstated) adjustedSeverity = refSeverity;
  else adjustedSeverity = input.severity || refSeverity;

  let adjustedLikelihood: number;
  if (likelihoodOverstated) adjustedLikelihood = likCeiling!;
  else if (likelihoodUnderstated) adjustedLikelihood = refLikelihood;
  else adjustedLikelihood = input.likelihood || refLikelihood;

  const adjustedRiskScore = adjustedSeverity * adjustedLikelihood;
  const adjustedRiskBand = bandFor(adjustedRiskScore);

  // Rule 3 (post-adjustment). Unrealistic residual severity reduction.
  //
  // Compared against the governance-adjusted severity, NOT the user-entered
  // value. Rationale: when a user over-scores initial severity (e.g. Sev 5
  // for "minor inconvenience"), the governance-correct severity is the
  // inferred ceiling (Sev 2). A residual severity of 1 against an adjusted
  // severity of 2 is plausible and must not raise a critical warning.
  // Conversely, when the user under-scores, the adjusted severity adopts
  // the reference, so a Sev 1 residual against an adjusted Sev 5 still
  // correctly fires.
  //
  // The check is gated to adjustedSeverity >= 4 because controls don't
  // typically reduce a credible high-severity outcome by more than one band.
  if (
    adjustedSeverity >= 4 &&
    input.residualSeverity > 0 &&
    input.residualSeverity <= adjustedSeverity - 2
  ) {
    safetyCritical.push(
      `Residual severity ${input.residualSeverity} is implausibly low for a governance-adjusted severity of ${adjustedSeverity}. Controls reduce likelihood, rarely severity.`,
    );
  }

  // Overall direction discriminator for downstream UI styling.
  let scoreAdjustmentDirection: "upward" | "downward" | "mixed" | "none";
  const anyUp = severityUnderstated || likelihoodUnderstated;
  const anyDown = severityOverstated || likelihoodOverstated;
  if (anyUp && anyDown) scoreAdjustmentDirection = "mixed";
  else if (anyUp) scoreAdjustmentDirection = "upward";
  else if (anyDown) scoreAdjustmentDirection = "downward";
  else scoreAdjustmentDirection = "none";

  // Governance concern follows the governance-adjusted severity ALONE. This
  // value is already the reference when under-scored, or the inferred ceiling
  // when over-scored, or the user value when honest. Residual severity is
  // intentionally NOT included in the worst-credible calc because:
  //   1. In the over-scored case (e.g. Sev 5/Lik 5 with "minor inconvenience"),
  //      users typically also over-score residual to the same value, which
  //      would re-inflate concern via Math.max and defeat the downward
  //      correction. The actual worst credible severity is the adjusted
  //      ceiling, not the residual the user happened to type.
  //   2. Residual severity by definition cannot exceed initial severity in a
  //      coherent risk assessment (controls reduce risk, they don't add to
  //      it), so it cannot legitimately raise the worst-credible ceiling.
  const worstCredibleSeverity = adjustedSeverity;
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

  // Text-aware rationales that REPLACE the scenario-template rationales.
  // These are what Page 3's score panels and any in-app score-comparison view
  // should use; the scenario.feedback rationales are cancer-frame specific
  // and must never appear on a non-cancer hazard text.
  const derivedSeverityRationale = deriveSeverityRationale({
    scenario: input.scenario,
    userSeverity: input.severity,
    refSeverity,
    sevCeiling,
    severityUnderstated,
    severityOverstated,
    scoringText,
  });
  const derivedLikelihoodRationale = deriveLikelihoodRationale({
    scenario: input.scenario,
    userLikelihood: input.likelihood,
    refLikelihood,
    likCeiling,
    likelihoodUnderstated,
    likelihoodOverstated,
    scoringText,
  });

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

  const result: ValidationResult = {
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
    derivedSeverityRationale,
    derivedLikelihoodRationale,
  };

  // Dev-mode diagnostic: log the validation summary so reviewers can verify
  // the over/under-scoring branches fired against their actual hazard text
  // without rebuilding. Prefixed so it is easy to filter in DevTools.
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    // eslint-disable-next-line no-console
    console.debug("[hazard-log/validation]", {
      scoringText,
      sevCeiling,
      likCeiling,
      userSeverity: input.severity,
      userLikelihood: input.likelihood,
      refSeverity,
      refLikelihood,
      severityUnderstated,
      severityOverstated,
      likelihoodUnderstated,
      likelihoodOverstated,
      adjustedSeverity,
      adjustedLikelihood,
      adjustedRiskScore,
      adjustedRiskBand,
      scoreAdjustmentDirection,
      concern: result.governanceConcern,
    });
  }

  return result;
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
    return "Submitted scoring overestimates the credible severity compared with the described workflow impact. Governance position is based on the credible severity implied by the hazard narrative.";
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
  if (/\b(minor\s+inconvenience|patient\s+inconvenience|inconvenience\s+to\s+(the\s+)?patient)\b/i.test(scoringText)) {
    return "a minor inconvenience";
  }
  if (/\badministrative\b/i.test(scoringText)) {
    return "an administrative-only impact";
  }
  if (/\bnon[\s-]?urgent\b/i.test(scoringText)) {
    return "a non-urgent workflow impact";
  }
  if (/\bschedul|\brebook|\breschedul/i.test(scoringText)) {
    return "a scheduling-only impact";
  }
  if (/\boutpatient\s+follow[\s-]?up\b|\bfollow[\s-]?up\s+appointment\b/i.test(scoringText)) {
    return "a routine follow-up workflow impact";
  }
  return "a low-impact workflow event";
}

/**
 * Builds a text-aware severity rationale that REPLACES
 * scenario.feedback.severity.rationale downstream. Branches on direction so
 * the wording matches what actually happened to the score, never paraphrases
 * a scenario worst-outcome that doesn't fit the described hazard.
 */
function deriveSeverityRationale(args: {
  scenario: Scenario;
  userSeverity: number;
  refSeverity: number;
  sevCeiling: number | null;
  severityUnderstated: boolean;
  severityOverstated: boolean;
  scoringText: string;
}): string {
  const { scenario, userSeverity, refSeverity, sevCeiling, severityUnderstated, severityOverstated, scoringText } = args;
  if (severityOverstated && sevCeiling != null) {
    return `Submitted severity of ${userSeverity} overestimates the credible severity for the described hazard, which reads as ${describeLowSeverityFrame(scoringText)}. Governance position is severity ${sevCeiling}, taken from the credible workflow impact implied by the entered text.`;
  }
  if (severityUnderstated) {
    return `Submitted severity of ${userSeverity} underestimates the credible worst-case outcome (${describeWorstOutcomeFor(scenario, scoringText)}). Governance position is severity ${refSeverity}, taken from the worst-credible outcome for this scenario.`;
  }
  // Honest scoring or no signal in either direction. Describe the user
  // value in neutral terms; do not paraphrase the scenario template.
  if (userSeverity > 0) {
    return `Submitted severity of ${userSeverity} is consistent with the described hazard. No governance correction applied.`;
  }
  return "Severity has not been scored.";
}

/**
 * Builds a text-aware likelihood rationale that REPLACES
 * scenario.feedback.likelihood.rationale downstream.
 */
function deriveLikelihoodRationale(args: {
  scenario: Scenario;
  userLikelihood: number;
  refLikelihood: number;
  likCeiling: number | null;
  likelihoodUnderstated: boolean;
  likelihoodOverstated: boolean;
  scoringText: string;
}): string {
  const { userLikelihood, refLikelihood, likCeiling, likelihoodUnderstated, likelihoodOverstated, scoringText } = args;
  void scoringText;
  if (likelihoodOverstated && likCeiling != null) {
    return `Submitted likelihood of ${userLikelihood} overestimates the credible frequency for the described hazard, which reads as isolated, occasional or infrequent. Governance position is likelihood ${likCeiling}.`;
  }
  if (likelihoodUnderstated) {
    return `Submitted likelihood of ${userLikelihood} appears optimistic relative to deployment volume for this scenario. Governance position is likelihood ${refLikelihood}, cross-checked against incident or pilot evidence.`;
  }
  if (userLikelihood > 0) {
    return `Submitted likelihood of ${userLikelihood} is consistent with the described frequency of the event. No governance correction applied.`;
  }
  return "Likelihood has not been scored.";
}

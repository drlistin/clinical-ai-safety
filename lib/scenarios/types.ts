/**
 * Hazard Log Builder, scenario type definitions.
 */

export type SeverityScore = 1 | 2 | 3 | 4 | 5;
export type LikelihoodScore = 1 | 2 | 3 | 4 | 5;

export type RiskBand = "Low" | "Medium" | "High" | "Extreme";

export type KeywordGroup = {
  label: string;
  any: string[];
};

export type TextStepFeedback = {
  groups: KeywordGroup[];
  shortInputHint: string;
  failureModeMarkers?: string[];
  failureModeHint?: string;
};

export type ScoreFeedback = {
  expected: SeverityScore | LikelihoodScore;
  tolerance: number;
  rationale: string;
};

export type ControlsBundle = {
  preventative: string[];
  detective: string[];
  corrective: string[];
};

export type Scenario = {
  id: string;
  name: string;
  shortName: string;

  briefing: {
    deployment: string;
    safetyEvent: string;
    learningGoals: string[];
  };

  reference: {
    hazard: string;
    cause: string;
    sequenceOfEvents: string;
    hazardousSituation: string;
    potentialHarm: string;
    consequence: string;
    severity: SeverityScore;
    likelihood: LikelihoodScore;
    controls: ControlsBundle;
    residualRisk: RiskBand;
    residualRiskNote: string;
    monitoringTrigger: string;
    owner: string;
  };

  feedback: {
    hazard: TextStepFeedback;
    cause: TextStepFeedback;
    consequence: TextStepFeedback;
    severity: ScoreFeedback;
    likelihood: ScoreFeedback;
    controls: {
      preventative: KeywordGroup[];
      detective: KeywordGroup[];
      corrective: KeywordGroup[];
    };
  };

  /**
   * Optional minimum-bar set of controls. Distinct from `feedback.controls`
   * (the teaching/reference library shown by FeedbackStep): essentialControls
   * is the SAFETY MINIMUM — any one of these absent fires a critical warning
   * in the governance engine. Scoped per type so the matcher only counts
   * coverage in the correct preventative/detective/corrective bucket.
   *
   * Optional so future scenarios can opt in without forcing every existing
   * scenario to declare a minimum bar. When omitted, the missing-essentials
   * engine is a no-op for that scenario.
   */
  essentialControls?: {
    preventative: KeywordGroup[];
    detective: KeywordGroup[];
    corrective: KeywordGroup[];
  };

  /**
   * Phase 4A — Scenario-Aware Intelligence.
   *
   * Richer, scenario-specific expectations covering the full hazard lifecycle:
   * controls (preventative / detective / corrective), monitoring (KPI /
   * trigger threshold / review cadence) and accountability (required clinical
   * roles plus acceptable owner phrasings). Drives the
   * `evaluateScenarioExpectations` engine, which surfaces missing items in
   * Step 8 and Step 9 and routes them into governance scoring.
   *
   * Each sub-section is independently optional so a scenario can adopt the
   * pattern incrementally — e.g. declare expectedControls without yet
   * declaring expectedMonitoring. Sections that aren't declared are treated
   * as a no-op for the engine.
   *
   * NOTE: this co-exists with `essentialControls` for now. essentialControls
   * is the simpler "minimum-bar" engine introduced in Phase 2.2; the richer
   * Phase 4A engine reads scenarioExpectations.expectedControls and may
   * eventually subsume it. Keep both populated for the cancer scenario until
   * the migration is verified end-to-end.
   *
   * Naming: this field uses the British "preventative" spelling for
   * consistency with the rest of the codebase (essentialControls.preventative,
   * feedback.controls.preventative, ControlType "preventative"). The Phase 4A
   * brief used the American "preventive" — they are interchangeable.
   */
  scenarioExpectations?: ScenarioExpectations;
};

/**
 * Phase 4A scenario expectation block. Each sub-section is independently
 * optional so a scenario can declare any subset.
 *
 * Routing of findings (handled in the engine, not the schema):
 *   - expectedControls.*           → safety-direction critical
 *   - expectedMonitoring.kpis      → improvement (warning level)
 *   - expectedMonitoring.triggerThresholds → safety-direction critical
 *   - expectedMonitoring.reviewCadence     → improvement (warning level)
 *   - expectedAccountability.requiredRoles → safety-direction critical
 *
 * acceptableOwnerPatterns is an OPTIONAL set of alternative phrasings that
 * count as satisfying the clinical accountability chain. When ANY of these
 * patterns is present in the owner field, the missing-required-role findings
 * are suppressed entirely — useful when a scenario considers e.g. "Caldicott
 * Guardian" or "Senior Oncologist" as acceptable substitutes for one of the
 * named requiredRoles. Strings are matched case-insensitively as substrings,
 * with word-boundary checks, mirroring the existing keywordGroupCovered
 * helper.
 */
export type ScenarioExpectations = {
  expectedControls?: {
    preventative: KeywordGroup[];
    detective: KeywordGroup[];
    corrective: KeywordGroup[];
  };
  expectedMonitoring?: {
    kpis: KeywordGroup[];
    triggerThresholds: KeywordGroup[];
    reviewCadence: KeywordGroup[];
  };
  expectedAccountability?: {
    requiredRoles: KeywordGroup[];
    acceptableOwnerPatterns?: string[];
  };
};

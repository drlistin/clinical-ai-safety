/**
 * Hazard Log Builder — scenario type definitions.
 *
 * A Scenario captures everything the simulator needs to drive a single
 * end-to-end hazard log exercise: the user-facing briefing, the reference
 * answer used for the final summary and PDF, and the feedback configuration
 * the keyword-matching engine consumes.
 *
 * Adding a new scenario means producing one Scenario object and registering
 * it in lib/scenarios/index.ts. No simulator code needs to change.
 */

export type SeverityScore = 1 | 2 | 3 | 4 | 5;
export type LikelihoodScore = 1 | 2 | 3 | 4 | 5;

export type RiskBand = "Low" | "Medium" | "High" | "Extreme";

/** A keyword group: any keyword in the array counts as a match for the concept. */
export type KeywordGroup = {
  /** Canonical label for this concept (shown in feedback when missed). */
  label: string;
  /** Substrings (case-insensitive) that count as evidence of the concept. */
  any: string[];
};

export type TextStepFeedback = {
  /** Concept groups; user input that hits at least one keyword in each group is on track. */
  groups: KeywordGroup[];
  /** Hint shown when input is too short or thin. */
  shortInputHint: string;
  /** Substrings that suggest the user is describing a failure mode rather than a hazard. */
  failureModeMarkers?: string[];
  /** Hint shown when failureModeMarkers are detected without patient-harm signal. */
  failureModeHint?: string;
};

export type ScoreFeedback = {
  expected: SeverityScore | LikelihoodScore;
  /** Allowed deviation that still counts as "close to reference". */
  tolerance: number;
  /** Why the reference score is what it is — shown in feedback. */
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
};

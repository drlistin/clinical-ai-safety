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
};

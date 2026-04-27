/**
 * Shared types and design tokens for the Hazard Log PDF report.
 */

export type ControlEntry = {
  text: string;
  type: "Preventative" | "Detective" | "Corrective";
  origin: "Existing" | "Proposed";
  owner: string;
  implementationStatus: "Implemented" | "Planned" | "Under review" | "Not started";
  verificationStatus: "Not verified" | "Planned" | "Verified";
};

export type ActionEntry = {
  action: string;
  owner: string;
  dueDate: string;
  status: string;
};

export type GovernanceStatus = "Acceptable draft" | "Needs review" | "Not governance-ready";
export type GovernanceConcern = "Low" | "Moderate" | "High" | "Severe";
export type Recommendation =
  | "Proceed to implementation"
  | "Proceed to governance review"
  | "Not acceptable pending mitigation";

export type HazardLogReport = {
  documentTitle: string;
  scenarioName: string;
  hazardId: string;
  version: string;
  dateCreated: Date;
  lastReviewed: Date;
  reviewDate: Date;
  status: "Open" | "Mitigated" | "Closed";
  author: string;
  approver: string;
  reviewer: string;
  owner: string;

  hazardClassifications: string[];
  systemName: string;
  systemVersion: string;
  workflowStep: string;
  safetyRequirement: string;
  benefitJustification: string;

  hazard: string;
  causeFailureMode: string;
  sequenceOfEvents: string;
  hazardousSituation: string;
  potentialHarm: string;
  clinicalConsequence: string;

  initialSeverity: number;
  severityRationale: string;
  severityEvidence: string[];
  initialLikelihood: number;
  likelihoodRationale: string;
  likelihoodEvidence: string[];
  initialRiskScore: number;
  initialRiskBand: string;

  residualSeverity: number;
  residualLikelihood: number;
  residualRationale: string;
  residualRiskScore: number;
  residualRiskBand: string;
  overallAcceptability: string;

  governanceConcern: GovernanceConcern;
  governanceConcernRationale: string;

  controls: ControlEntry[];

  monitoringMetric: string;
  triggerThreshold: string;
  reviewFrequency: string;
  capa: string;

  stakeholders: string;
  assumptions: string;

  governanceStatus: GovernanceStatus;
  criticalWarnings: string[];
  requiredImprovements: string[];

  actions: ActionEntry[];

  recommendation: Recommendation;
  recommendationNote: string;
};

export type RGB = readonly [number, number, number];

export const PAGE_BG: RGB = [255, 255, 255];
export const HEADER_BG: RGB = [243, 246, 250];
export const FRAME: RGB = [220, 226, 235];
export const NAVY: RGB = [10, 25, 48];
export const NAVY_MID: RGB = [45, 69, 99];
export const NAVY_SOFT: RGB = [120, 138, 165];
export const NAVY_LIGHT: RGB = [196, 208, 224];
export const NAVY_BG: RGB = [245, 247, 250];
export const CLINICAL: RGB = [37, 89, 153];
export const TEXT_BODY: RGB = [30, 49, 80];
export const WHITE: RGB = [255, 255, 255];

export type BandPalette = { bg: RGB; fg: RGB; border: RGB };

export const BAND_PALETTES: Record<string, BandPalette> = {
  Low: { bg: [232, 245, 233], fg: [27, 94, 32], border: [165, 214, 167] },
  Moderate: { bg: [255, 248, 225], fg: [121, 85, 0], border: [255, 213, 79] },
  Medium: { bg: [255, 248, 225], fg: [121, 85, 0], border: [255, 213, 79] },
  High: { bg: [255, 234, 222], fg: [191, 70, 36], border: [255, 171, 145] },
  Severe: { bg: [255, 235, 238], fg: [156, 28, 60], border: [244, 143, 177] },
  Extreme: { bg: [255, 235, 238], fg: [156, 28, 60], border: [244, 143, 177] },
};

export const STATUS_PALETTES: Record<string, BandPalette> = {
  "Acceptable draft": { bg: [232, 245, 233], fg: [27, 94, 32], border: [165, 214, 167] },
  "Needs review": { bg: [255, 248, 225], fg: [121, 85, 0], border: [255, 213, 79] },
  "Not governance-ready": { bg: [255, 235, 238], fg: [156, 28, 60], border: [244, 143, 177] },
};

export const DISCLAIMER =
  "Simulation-generated draft requiring local Clinical Safety Officer review before operational use.";
export const FRAMEWORK_LINE = "Mapped against ISO 14971, DCB0129, DCB0160";

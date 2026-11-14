/** Research-only source-to-decision trace data. Not clinical assessment records. */
export type ResearchTrace = {
  traceId: string;
  evidenceRecordId: string;
  sourceFact: string;
  candidateHazard: string;
  candidateControl: string;
  controlValidationQuestion: string;
  residualRiskQuestion: string;
  governanceQuestion: string;
  historicalDecisionEvidence: "unavailable";
  actualControlStatus: "unknown";
  timeKnowledgeBoundary: string;
  classification: "research-hypothesis-not-incident" | "investigation-mechanism-non-ai";
  reviewStatus: "not-adjudicated";
};
export type RealWorldTraceRegister = {
  schemaVersion: "0.1";
  status: "draft-analytical-links-require-cso-review";
  collectedAt: string;
  independentMethod: true;
  externalComparator: string;
  records: ResearchTrace[];
};

/**
 * INTERNAL research trace validator.
 *
 * Validates the provenance/claim boundary only; does not verify facts,
 * assign safety grades, or transform analytical hypotheses into expert findings.
 */
import type { RealWorldTraceRegister } from "./trace-types";

export function validateTraceRegister(input: RealWorldTraceRegister, register: {
  sources: Record<string, { sourceType: string }>;
  records: { recordId: string; sourceId: string; evidenceType: string; authorisedReferenceStatus: string }[];
}) {
  const issues: string[] = [];
  const byId = new Map(register.records.map((r) => [r.recordId, r]));
  const traceIds = new Set<string>();
  if (input.status !== "draft-analytical-links-require-cso-review") issues.push("Trace register must remain unadjudicated.");
  if (!input.independentMethod) issues.push("Methodological independence guard is missing.");
  for (const t of input.records) {
    if (traceIds.has(t.traceId)) issues.push(`Duplicate trace ID: ${t.traceId}`);
    traceIds.add(t.traceId);
    const fact = byId.get(t.evidenceRecordId);
    if (!fact) {
      issues.push(`Trace ${t.traceId} refers to missing source record.`);
      continue;
    }
    if (fact.authorisedReferenceStatus !== "not-approved") issues.push(`Trace ${t.traceId} must not inherit approved reference labels.`);
    if (fact.evidenceType === "ongoing-investigation-no-findings") issues.push(`Trace ${t.traceId} treats an investigation announcement as a finding.`);
    if (!input.independentMethod || t.reviewStatus !== "not-adjudicated") issues.push(`Trace ${t.traceId} has unsupported approval state.`);
    if (t.actualControlStatus !== "unknown" || t.historicalDecisionEvidence !== "unavailable") issues.push(`Trace ${t.traceId} presumes unpublished controls or decisions.`);
    if (!t.sourceFact.trim() || !t.candidateHazard.trim() || !t.candidateControl.trim() ||
        !t.controlValidationQuestion.trim() || !t.residualRiskQuestion.trim() ||
        !t.governanceQuestion.trim() || !t.timeKnowledgeBoundary.trim()) {
      issues.push(`Trace ${t.traceId} is missing an essential evidence-to-decision link.`);
    }
    if (!t.controlValidationQuestion.endsWith("?") || !t.governanceQuestion.endsWith("?") || !t.residualRiskQuestion.endsWith("?")) issues.push(`Trace ${t.traceId} misstates a research question as a finding.`);
    if (t.classification !== "research-hypothesis-not-incident" && t.classification !== "investigation-mechanism-non-ai") issues.push(`Trace ${t.traceId} has invalid evidence classification.`);
  }
  return { valid: issues.length === 0, issues, clinicalValidation: "not-performed" as const, deploymentApproval: "not-assessed" as const };
}

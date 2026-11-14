/* Regression checks for the INTERNAL conservative evidence engine.
 * These fixtures are synthetic and are not a clinical validation study.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const sourcePath = path.join(__dirname, "../lib/safety-decision/evidence-checks.ts");
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const mod = new Module(sourcePath, module);
mod.filename = sourcePath;
mod.paths = module.paths;
mod._compile(compiled, sourcePath);
const { evaluateSafetyEvidence } = mod.exports;

const evidence = (id, classification = "local-operational-evidence", reviewedAt = "2026-11-14") => ({
  id,
  title: "Synthetic local review record",
  classification,
  sourceUriOrDocumentId: `LOCAL:${id}`,
  version: "1",
  publishedOrEffectiveDate: "2026-11-14",
  reviewedAt,
  jurisdiction: "England",
  applicabilityNote: "Synthetic practice A, version 1, tested omission detection",
  limitations: [],
});

function fixture() {
  return {
    context: {
      id: "ctx-1",
      systemName: "Synthetic ambient scribe",
      productVersion: "1",
      modelVersion: "1",
      intendedPurpose: "Document clinical consultations",
      careSetting: "GP practice",
      deploymentOrganisation: "Synthetic practice A",
      workflowDescription: "Clinician reviews note before sign-off",
      relevantPopulation: "Adult primary care",
      scopeLimits: [],
    },
    proposedDecision: "Proposed local deployment assessment",
    hazards: [{ id: "H-1", description: "Important omission", potentialHarm: "Missed escalation" }],
    controls: [{
      id: "C-1",
      hazardIds: ["H-1"],
      statement: "Clinician reviews generated notes",
      claimedBy: "Supplier",
      accountableOwner: "Practice clinical lead",
      status: "declared",
      implementationEvidenceIds: [],
      effectivenessEvidenceIds: [],
      localDependencies: ["clinical time", "source availability"],
      reviewerNotes: null,
    }],
    evidence: [],
    residualRiskClaims: [{
      hazardId: "H-1",
      methodId: "LOCAL-RISK-MATRIX",
      methodVersion: "1",
      claimedCategory: "Low",
      claimedReasoning: "Risk reduced by clinician review",
      reliedOnControlIds: ["C-1"],
      acceptanceAuthority: "Safety committee",
      acceptanceDecisionEvidenceId: null,
    }],
  };
}
const criteria = (result) => result.findings.map((f) => f.criterionId);

test("a merely declared existing safeguard never establishes residual risk reduction or approval", () => {
  const res = evaluateSafetyEvidence(fixture());
  assert.ok(criteria(res).includes("SDC-07"));
  assert.equal(res.deploymentApproval, "not-assessed");
  assert.equal(res.residualRiskClassification, "not-determined");
  assert.ok(criteria(res).includes("SDC-08"));
});

test("an unowned safeguard is independently challenged", () => {
  const data = fixture();
  data.controls[0].accountableOwner = " ";
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-03"));
});

test("implemented label without local implementation evidence is insufficient", () => {
  const data = fixture();
  data.controls[0].status = "implemented-evidence-provided";
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-04"));
});

test("supplier statement cannot masquerade as reviewed local implementation evidence", () => {
  const data = fixture();
  data.controls[0].status = "implemented-evidence-provided";
  data.controls[0].implementationEvidenceIds = ["E-1"];
  data.evidence.push(evidence("E-1", "supplier-assertion"));
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-04"));
});

test("citation absent from evidence register is reported without assuming what it means", () => {
  const data = fixture();
  data.controls[0].status = "implemented-evidence-provided";
  data.controls[0].implementationEvidenceIds = ["MISSING"];
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-09"));
});

test("effective label alone cannot establish effectiveness", () => {
  const data = fixture();
  data.controls[0].status = "effectiveness-supported";
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-05"));
});

test("unreviewed local record cannot substantiate effectiveness", () => {
  const data = fixture();
  data.controls[0].status = "effectiveness-supported";
  data.controls[0].implementationEvidenceIds = ["I"];
  data.controls[0].effectivenessEvidenceIds = ["E"];
  data.controls[0].reviewerNotes = "Reviewed impact on omission detection";
  data.evidence = [evidence("I", undefined, null), evidence("E", undefined, null)];
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-05"));
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-07"));
});

test("reviewed operational evidence avoids basic presence warnings but never generates a safe verdict", () => {
  const data = fixture();
  data.controls[0].status = "effectiveness-supported";
  data.controls[0].implementationEvidenceIds = ["I"];
  data.controls[0].effectivenessEvidenceIds = ["E"];
  data.controls[0].reviewerNotes = "Clinician reviewed local applicability, data quality and limitations";
  data.evidence = [evidence("I"), evidence("E")];
  data.residualRiskClaims[0].acceptanceDecisionEvidenceId = "A";
  data.evidence.push(evidence("A", "expert-judgement"));
  const res = evaluateSafetyEvidence(data);
  assert.ok(!criteria(res).includes("SDC-04"));
  assert.ok(!criteria(res).includes("SDC-05"));
  assert.ok(!criteria(res).includes("SDC-07"));
  assert.ok(!criteria(res).includes("SDC-08"));
  assert.equal(res.deploymentApproval, "not-assessed");
  assert.equal(res.residualRiskClassification, "not-determined");
});

test("an invented low risk score with no organisational method is not treated as acceptable", () => {
  const data = fixture();
  data.residualRiskClaims[0].methodId = null;
  data.residualRiskClaims[0].methodVersion = null;
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-07"));
});

test("risk assertion referencing an unknown control is challenged", () => {
  const data = fixture();
  data.residualRiskClaims[0].reliedOnControlIds = ["C-404"];
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-07"));
});

test("missing context is treated as insufficient evidence, not a deployment verdict", () => {
  const data = fixture();
  data.context.workflowDescription = "";
  assert.ok(criteria(evaluateSafetyEvidence(data)).includes("SDC-01"));
  assert.equal(evaluateSafetyEvidence(data).deploymentApproval, "not-assessed");
});

test("output is deterministic and findings require review; no model-generated severity", () => {
  const data = fixture();
  assert.deepEqual(evaluateSafetyEvidence(data), evaluateSafetyEvidence(data));
  assert.ok(evaluateSafetyEvidence(data).findings.every((f) => f.accountableReviewer === null));
  assert.ok(evaluateSafetyEvidence(data).findings.every((f) => !("score" in f || "severity" in f)));
});

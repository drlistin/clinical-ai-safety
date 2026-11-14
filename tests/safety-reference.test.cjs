/* eslint-disable @typescript-eslint/no-require-imports -- isolated Node test harness transcompiles a TypeScript-only internal module. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

function loadModule(relPath) {
  const file = path.join(__dirname, "../", relPath);
  const compiled = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = new Module(file, module);
  mod.filename = file;
  mod.paths = module.paths;
  mod._compile(compiled, file);
  return mod.exports;
}
const { evaluateReferenceChallenges } = loadModule("lib/safety-decision/reference-challenge.ts");
const ids = (f) => f.findings.map((item) => item.criterionId);

function fixture() {
  return {
    contextId: "AVT-PRIMARY-CARE-TEST",
    hazards: [{ id: "H-1", description: "Note omission during consultation", potentialHarm: "Missed follow-up" }],
    controls: [{ id: "C-1", hazardIds: ["H-1"] }],
    evidence: [{ id: "REF" }, { id: "EXP" }, { id: "OBS-1" }, { id: "OBS-2" }, { id: "MAP" }, { id: "TRACE" }],
    reference: {
      id: "REFERENCE-1",
      version: "0.1",
      intendedContextId: "AVT-PRIMARY-CARE-TEST",
      status: "expert-reviewed",
      reviewerId: "SYNTHETIC-EXPERT",
      reviewedAt: "2026-11-14",
      referenceEvidenceIds: ["REF"],
      expectedHazards: [{
        id: "RH-1", clinicalReason: "Omission in the source conversation",
        potentialHarm: "Missed follow-up", appliesWhenAllConditions: ["CLINICIAN-REVIEW"], evidenceIds: ["EXP"],
      }],
      expectedInteractions: [{
        id: "RI-1", conditionIds: ["CLINICIAN-REVIEW", "HIGH-WORKLOAD"],
        referenceHazardIds: ["RH-1"],
        failureMechanism: "Review can be weakened during high workload",
        potentialHarm: "Missed follow-up", evidenceIds: ["EXP"],
      }],
    },
    observations: [
      { conditionId: "CLINICIAN-REVIEW", state: "present", observedEvidenceIds: ["OBS-1"], reviewedBy: "REVIEWER", reviewedAt: "2026-11-14" },
      { conditionId: "HIGH-WORKLOAD", state: "present", observedEvidenceIds: ["OBS-2"], reviewedBy: "REVIEWER", reviewedAt: "2026-11-14" },
    ],
    hazardMappings: [],
    interactionTraces: [],
  };
}
function mapHazard(data) {
  data.hazardMappings = [{ referenceHazardId: "RH-1", assessmentHazardId: "H-1", reviewerId: "REVIEWER", reviewedAt: "2026-11-14", evidenceIds: ["MAP"] }];
}
function traceInteraction(data) {
  data.interactionTraces = [{ referenceInteractionId: "RI-1", assessmentHazardIds: ["H-1"], controlIds: ["C-1"], reviewerId: "REVIEWER", reviewedAt: "2026-11-14", rationale: "Both conditions assessed locally", evidenceIds: ["TRACE"] }];
}

test("an applicable but unmapped expert hazard produces only a potential concern", () => {
  const out = evaluateReferenceChallenges(fixture());
  assert.equal(out.comparisonStatus, "requires-review");
  assert.equal(out.coverageConclusion, "not-determined");
  assert.equal(out.findings.find((f) => f.criterionId === "SDC-02").status, "potential-concern");
  assert.ok(ids(out).includes("SDC-06"));
});
test("equivalently worded or differently named hazard with reviewed mapping avoids false omission", () => {
  const data = fixture();
  data.hazards[0].description = "Critical omission despite apparently normal documentation";
  mapHazard(data);
  const out = evaluateReferenceChallenges(data);
  assert.ok(!ids(out).includes("SDC-02"));
  assert.ok(ids(out).includes("SDC-06"));
});
test("complete reviewed structural mapping suppresses structural gap, not clinical coverage conclusion", () => {
  const data = fixture();
  mapHazard(data); traceInteraction(data);
  const out = evaluateReferenceChallenges(data);
  assert.equal(out.findings.length, 0);
  assert.equal(out.coverageConclusion, "not-determined");
});
test("an expert reference draft must not trigger pseudo-clinical findings", () => {
  const data = fixture();data.reference.status = "draft";
  const out = evaluateReferenceChallenges(data);
  assert.equal(out.comparisonStatus, "blocked");
  assert.equal(out.findings.length, 0);
});
test("incorrect reference context blocks assessment", () => {
  const data = fixture();data.contextId = "SECOND-PRACTICE";
  assert.equal(evaluateReferenceChallenges(data).comparisonStatus, "blocked");
});
test("unknown observed condition does not activate interaction rule", () => {
  const data = fixture();data.observations[1].state = "unknown";mapHazard(data);
  const out = evaluateReferenceChallenges(data);
  assert.ok(!ids(out).includes("SDC-06"));
  assert.equal(out.coverageConclusion, "not-determined");
});
test("unreviewed observation does not establish a clinical condition", () => {
  const data = fixture();data.observations[1].reviewedBy = null;mapHazard(data);
  assert.ok(!ids(evaluateReferenceChallenges(data)).includes("SDC-06"));
});
test("trace without reviewer and substantiating references is insufficient", () => {
  const data = fixture();mapHazard(data);traceInteraction(data);
  data.interactionTraces[0].reviewerId = null;
  assert.equal(evaluateReferenceChallenges(data).findings.find((f) => f.criterionId === "SDC-06").status,"evidence-insufficient");
});
test("trace with missing control link is not considered complete", () => {
  const data = fixture();mapHazard(data);traceInteraction(data);
  data.interactionTraces[0].controlIds = ["C-404"];
  assert.ok(ids(evaluateReferenceChallenges(data)).includes("SDC-06"));
});
test("negation and keyword text alone do not count as coverage", () => {
  const data = fixture();
  data.hazards[0].description = "NO missed documentation or review failures whatsoever";
  const out = evaluateReferenceChallenges(data);
  assert.ok(ids(out).includes("SDC-02"));
  assert.equal(out.findings[0].status, "potential-concern");
});
test("duplicate identifiers block reliable mapping", () => {
  const data = fixture();data.hazards.push({ ...data.hazards[0] });
  assert.equal(evaluateReferenceChallenges(data).comparisonStatus, "blocked");
});
test("reference with missing provenance is rejected", () => {
  const data = fixture();data.reference.referenceEvidenceIds = ["MISSING"];
  assert.equal(evaluateReferenceChallenges(data).comparisonStatus, "blocked");
});
test("unapproved equivalent mapping does not silently satisfy the reference", () => {
  const data = fixture();mapHazard(data);data.hazardMappings[0].reviewerId = null;
  assert.ok(ids(evaluateReferenceChallenges(data)).includes("SDC-02"));
});
test("single condition cannot be mislabelled as an interaction expectation", () => {
  const data = fixture();data.reference.expectedInteractions[0].conditionIds = ["CLINICIAN-REVIEW"];
  assert.equal(evaluateReferenceChallenges(data).comparisonStatus, "blocked");
});

/* eslint-disable @typescript-eslint/no-require-imports -- Synthetic research pack integrity checks. */
/* Tests protect provenance and reviewer separation, not clinical validity. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "../research/avt");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const manifest = JSON.parse(read("oxford-v0.2-case-manifest.json"));
const packet = read("oxford-v0.2-reviewer-packet.md");
const exhibits = read("oxford-v0.2-submitted-exhibits.md");
const form = read("oxford-v0.2-independent-review-form.md");
const protocol = read("oxford-v0.2-review-protocol.md");

test("review case is explicitly synthetic and remains unadjudicated", () => {
  assert.equal(manifest.schemaVersion, "0.2");
  assert.equal(manifest.caseId, "CAS-SDC-AVT-02");
  assert.equal(manifest.status, "independent-review-packet-unadjudicated");
  assert.equal(manifest.caseType, "real-world-informed-synthetic-prospective-decision");
  assert.equal(manifest.hiddenAnswerKeyCreated, false);
  assert.deepEqual(manifest.referencesToAdjudicatedFindings, []);
  assert.equal(manifest.panelAdjudication, "not-started");
  assert.equal(manifest.riskAcceptance, "not-assessed");
  assert.equal(manifest.deploymentApproval, "not-assessed");
  assert.equal(manifest.methodComparison, "not-performed");
  assert.match(packet, /Fictional research case/);
  assert.match(exhibits, /Fictional research extracts/);
});

test("external Oxford report is the only identified real source and predates decision", () => {
  assert.equal(manifest.realWorldExternalEvidence.length, 1);
  const source = manifest.realWorldExternalEvidence[0];
  assert.equal(source.id, "E-01");
  assert.ok(source.published < manifest.decisionAsOfDate);
  assert.ok(manifest.decisionAsOfDate === "2026-11-19");
  assert.match(source.url, /^https:\/\/www\.thehilloxford\.org\/wp-content\/uploads\/2026\/02\//);
  assert.ok([5, 25].every((p) => source.printedPages.includes(p)));
  assert.ok(packet.includes(source.url));
  assert.equal(manifest.sourceIndependentVerification, "not-completed");
  assert.equal(manifest.dataProtection, "synthetic-only-no-patient-information");
});

test("the case has enough synthetic exhibits for substantive appraisal, not an answer key", () => {
  assert.equal(manifest.syntheticEvidenceIds.length, 10);
  for (const id of manifest.syntheticEvidenceIds) {
    assert.ok(packet.includes(id), "missing evidence register entry " + id);
  }
  assert.match(exhibits, /18,400/);
  assert.match(exhibits, /168/);
  assert.match(exhibits, /154/);
  assert.match(exhibits, /36\/36/);
  assert.match(exhibits, /CRM-MAT-05/);
  assert.match(exhibits, /DOC-AVT-04/);
  for (const file of Object.values(manifest.files)) {
    assert.ok(file.startsWith("research/avt/"));
    assert.ok(fs.existsSync(path.join(__dirname, "..", file)));
  }
  assert.equal(manifest.syntheticSupportingExtractsSupplied, true);
});

test("reviewer form collects professional reasoning and alternatives without a suggested finding count", () => {
  assert.match(form, /Independent CSO review record/);
  assert.match(form, /competing explanation/);
  assert.match(form, /possible false alarm/i);
  assert.match(form, /zero findings is permissible/i);
  assert.doesNotMatch(form, /expectedClinicalFindings|gold[- ]standard answer|target.*hazards/i);
});

test("allocation protocol restricts contamination and does not treat engine or author as reference", () => {
  assert.match(protocol, /two qualified independent CSOs/i);
  assert.match(protocol, /third qualified adjudicator/i);
  assert.match(protocol, /public GitHub repository/i);
  assert.match(protocol, /no.*reference label/i);
  assert.match(protocol, /structured inputs/i);
  assert.match(protocol, /not a.*clinical risk/i);
});

test("the submitted materials contain no hidden expected findings or engine output", () => {
  const all = packet + exhibits + form;
  for (const forbidden of [
    "expectedClinicalFindings", "adjudicatedExpectedFindings", "evaluateDecisionValidityV02",
    "SDC-10", "candidateGoldLabels", "hiddenFindingKey", "intended planted flaw",
  ]) {
    assert.ok(!all.includes(forbidden), "reviewer materials leaked: " + forbidden);
  }
  assert.ok(!packet.includes("OUH-PROSPECTIVE-SDC-001"));
  assert.ok(!packet.includes("PR #14"));
});

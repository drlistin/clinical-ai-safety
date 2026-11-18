/* eslint-disable @typescript-eslint/no-require-imports -- synthetic Node regression fixture */ 
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const caseFile = path.join(__dirname, "../research/avt/oxford-prospective-case-v0.1.json");
const item = JSON.parse(fs.readFileSync(caseFile, "utf8"));
const sourcePath = path.join(__dirname, "../lib/safety-decision/evidence-checks.ts");
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText;
const mod = new Module(sourcePath, module);
mod.filename = sourcePath;
mod.paths = module.paths;
mod._compile(compiled, sourcePath);
const { evaluateSafetyEvidence } = mod.exports;

test("Oxford case is strictly synthetic, prospective and not an expert reference", () => {
  assert.equal(item.status,"real-world-informed-synthetic-unadjudicated");
  assert.equal(item.allLocalFactsSynthetic,true);
  assert.equal(item.noHiddenReferenceKey,true);
  assert.equal(item.expectedClinicalFindings,null);
  assert.equal(item.independentAdjudicationStatus,"not-started");
  assert.equal(item.deploymentApproval,"not-assessed");
  assert.equal(item.clinicalRiskAcceptance,"not-assessed");
  assert.ok(item.asOfDecisionDate > item.sourcePublicationDate);
  assert.equal(item.linkedDossierId,"DOS-OUH-001");
});

test("external Oxford evaluation is distinguished from local operational evidence", () => {
  const e=item.assessmentInput.evidence.find(e=>e.id==="E-OUH-01");
  assert.equal(e.classification,"published-service-evaluation");
  assert.ok(e.sourceUriOrDocumentId.startsWith("https://www.thehilloxford.org/"));
  assert.ok(item.assessmentInput.evidence.filter(e=>e.classification==="local-operational-evidence").length===0);
  assert.ok(item.assessmentInput.evidence.every(e=>!e.sourceUriOrDocumentId.includes("/patient/")));
});

test("existing internal rules challenge unsupported review and governance claims without risk acceptance", () => {
  const result=evaluateSafetyEvidence(item.assessmentInput);
  const criteria=new Set(result.findings.map(f=>f.criterionId));
  for(const criterion of ["SDC-03","SDC-04","SDC-05","SDC-07","SDC-08"]) {
    assert.ok(criteria.has(criterion),criterion + " missing from structural regression");
  }
  assert.equal(result.deploymentApproval,"not-assessed");
  assert.equal(result.residualRiskClassification,"not-determined");
  assert.ok(result.findings.every(f=>f.accountableReviewer===null));
  assert.ok(result.findings.every(f=>!("severity" in f)&&!("score" in f)));
});

test("the external evaluation is not converted to local control verification by a user claim", () => {
  const input=JSON.parse(JSON.stringify(item.assessmentInput));
  input.controls[0].status="effectiveness-supported";
  input.controls[0].implementationEvidenceIds=["E-OUH-01"];
  input.controls[0].effectivenessEvidenceIds=["E-OUH-01"];
  const res=evaluateSafetyEvidence(input);
  assert.ok(res.findings.some(f=>f.criterionId==="SDC-04"));
  assert.ok(res.findings.some(f=>f.criterionId==="SDC-05"));
  assert.equal(res.residualRiskClassification,"not-determined");
});

test("source-grounded material is kept distinct from fictional inputs", () => {
  assert.equal(item.sourceGroundedFacts.length,4);
  assert.equal(item.assessmentInput.context.deploymentOrganisation.includes("Fictional"),true);
  assert.ok(item.syntheticScenarioFacts.every(s=>typeof s==="string"&&s.length>20));
  assert.ok(item.assessmentInput.evidence.every(e=>e.classification!=="peer-reviewed-research"));
  assert.ok(item.independentReviewerQuestions.length>=6);
});

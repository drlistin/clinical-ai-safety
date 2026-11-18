/* eslint-disable @typescript-eslint/no-require-imports -- Node regression tests transpile TypeScript. */
/* These are synthetic software checks, NOT qualified clinical reference labels. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const sourcePath = path.join(__dirname, "../lib/safety-decision/decision-validity-v0.2.ts");
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const mod = new Module(sourcePath, module);
mod.filename = sourcePath;
mod.paths = module.paths;
mod._compile(compiled, sourcePath);
const { evaluateDecisionValidityV02 } = mod.exports;

function evidence(id, kind) {
  return {
    id, title: "Fictional " + kind + " record",
    kind, sourceId: "SYNTHETIC:" + id, sourceVersion: "1",
    sourceDate: "2026-11-10", reviewerId: "Fictional reviewer",
    reviewedAt: "2026-11-17",
    appliesTo: {
      productVersion: "mock-1", modelVersion: "mock-model-1",
      careSetting: "Fictional adult medicine clinic", population: "Adult outpatient",
      workflowId: "fictional-workflow-1",
    },
    methodDescription: kind === "local-effectiveness" ? "Synthetic seeded-error and signed-record comparison" : null,
    outcomeDefinition: kind === "local-effectiveness" ? "Predefined consequential error detection" : null,
    denominatorDefinition: kind === "local-effectiveness" ? "All synthetic reference discrepancies" : null,
    limitations: ["Synthetic only; not genuine trust evidence"],
  };
}
function fixture() {
  return {
    schemaVersion: "0.2", id: "SYNTHETIC-SOUND-001", caseType: "synthetic-research",
    context: {
      id: "ctx-1", asOfDate: "2026-11-18",
      deploymentOrganisation: "Fictional Trust A",
      productVersion: "mock-1", modelVersion: "mock-model-1",
      careSetting: "Fictional adult medicine clinic",
      population: "Adult outpatient", workflowId: "fictional-workflow-1",
      intendedUse: "Draft notes only", proposedDecision: "Assess a proposed limited deployment",
      materialContextDimensionIds: ["review-timing", "downstream-use"],
      contextDimensions: [
        {id: "review-timing",status:"known",description:"Immediately after consultation",applicabilityReason:null},
        {id: "downstream-use",status:"known",description:"GP clinic letter after sign-off",applicabilityReason:null},
      ],
    },
    hazards: [{
      id:"H-DOC",hazardousSituation:"Incorrect clinical information in a signed note",
      potentialHarm:"Subsequent management may be affected",scenarioConditionIds:["complex-consultation"],
    }],
    controls: [{
      id:"C-VERIFY",hazardIds:["H-DOC"],
      statement:"Fictional matching check on all transferred records",
      role:"safeguard",mechanism:"detect",
      mechanismExplanation:"Checks patient ID and destination document against reviewed source",
      accountableOwner:"Fictional EPR lead",
      status:"effectiveness-claimed",
      implementationEvidenceIds:["E-IMP"],
      effectivenessEvidenceIds:["E-EFF"],
      dependencyIds:["staff-availability"],
    }],
    evidence:[
      evidence("E-IMP","local-implementation"),
      evidence("E-EFF","local-effectiveness"),
      evidence("E-METHOD","organisation-risk-method"),
      evidence("E-CSO","governance-decision"),
      evidence("E-ACCEPT","governance-decision"),
      evidence("E-AUTH","governance-decision"),
      evidence("E-MONITOR","local-implementation"),
    ],
    riskArguments:[{
      hazardId:"H-DOC",riskMethodEvidenceId:"E-METHOD",
      initial:{category:"Moderate (fictional)",reasoning:"Synthetic pre-control judgement"},
      residual:{category:"Moderate (fictional)",reasoning:"No change in claimed category"},
      claimedRiskChange:"unchanged",
      controlEffects:[{
        controlId:"C-VERIFY",assertedEffectOn:"none",reductionClaimed:false,
        rationale:"No credited reduction in this provisional record",effectEvidenceIds:[],
      }],
    }],
    independenceClaims:[],
    governance:{
      csoIdentifier:"Fictional CSO",csoReviewEvidenceId:"E-CSO",
      riskAcceptanceAuthority:"Fictional Trust board",riskAcceptanceEvidenceId:"E-ACCEPT",
      deploymentAuthority:"Fictional authorised executive",deploymentAuthorisationEvidenceId:"E-AUTH",
      monitoringPlanEvidenceId:"E-MONITOR",
    },
  };
}
const clone=(x)=>JSON.parse(JSON.stringify(x));
const run=(x)=>evaluateDecisionValidityV02(x);
const criteria=(x)=>run(x).findings.map(f=>f.criterionId);
const contains=(x,id)=>criteria(x).includes(id);

test("a structurally coherent fictional file is not declared clinically safe",()=>{
  const r=run(fixture());
  assert.deepEqual(r.findings,[]);
  assert.equal(r.deploymentApproval,"not-assessed");
  assert.equal(r.residualRiskClassification,"not-determined");
  assert.equal(r.reviewStatus,"unadjudicated");
});
test("ordinary transfer activity used to claim risk reduction triggers causal and risk warnings",()=>{
  const x=fixture();
  x.controls[0].role="workflow-activity";
  x.controls[0].mechanism="none";
  x.controls[0].mechanismExplanation=null;
  x.riskArguments[0].claimedRiskChange="reduced";
  x.riskArguments[0].residual.category="Low (claimed)";
  x.riskArguments[0].controlEffects[0]={controlId:"C-VERIFY",assertedEffectOn:"likelihood",
    reductionClaimed:true,rationale:"Copying note reduces risk",effectEvidenceIds:["E-EFF"]};
  assert.ok(contains(x,"SDC-10"));
  assert.ok(contains(x,"SDC-07"));
  assert.equal(run(x).residualRiskClassification,"not-determined");
});
test("a defined identity check is not labelled circular solely for being associated with manual transfer",()=>{
  const x=fixture();
  x.controls[0].statement="Verify patient ID and destination before EPR transfer";
  assert.ok(!contains(x,"SDC-10"));
});
test("no initial assessment makes an apparently complete residual assessment insufficient",()=>{
  const x=fixture(); x.riskArguments[0].initial.category=null;
  assert.ok(contains(x,"SDC-07"));
});
test("claimed reduction without a risk-reducing edge triggers SDC-07",()=>{
  const x=fixture();x.riskArguments[0].claimedRiskChange="reduced";
  x.riskArguments[0].residual.category="Low (claimed)";
  x.riskArguments[0].controlEffects=[];
  assert.ok(contains(x,"SDC-07"));
});
test("reviewed local effectiveness records can support metadata without any approval claim",()=>{
  const x=fixture();x.riskArguments[0].claimedRiskChange="reduced";
  x.riskArguments[0].residual.category="Low (claimed)";
  x.riskArguments[0].controlEffects[0]={
    controlId:"C-VERIFY",assertedEffectOn:"likelihood",reductionClaimed:true,
    rationale:"Predefined local comparison suggests detection of synthetic discrepancies",
    effectEvidenceIds:["E-EFF"]};
  const r=run(x);
  assert.ok(!r.findings.some(f=>["SDC-05","SDC-07","SDC-10"].includes(f.criterionId)));
  assert.equal(r.deploymentApproval,"not-assessed");
  assert.equal(r.residualRiskClassification,"not-determined");
});
test("published evaluation and supplier assertion cannot pass as local effectiveness",()=>{
  const x=fixture();
  x.evidence.find(e=>e.id==="E-EFF").kind="published-evaluation";
  x.riskArguments[0].claimedRiskChange="reduced";
  x.riskArguments[0].residual.category="Low (claimed)";
  x.riskArguments[0].controlEffects[0].reductionClaimed=true;
  x.riskArguments[0].controlEffects[0].assertedEffectOn="likelihood";
  x.riskArguments[0].controlEffects[0].effectEvidenceIds=["E-EFF"];
  assert.ok(contains(x,"SDC-05"));
  assert.ok(contains(x,"SDC-07"));
  x.evidence.find(e=>e.id==="E-EFF").kind="supplier-assertion";
  assert.ok(contains(x,"SDC-05"));
});
test("a local study with an absent denominator is not silently credited",()=>{
  const x=fixture();x.evidence.find(e=>e.id==="E-EFF").denominatorDefinition=null;
  assert.ok(contains(x,"SDC-05"));
});
test("model version or workflow mismatch blocks local-effectiveness metadata and flags scope",()=>{
  const x=fixture();x.evidence.find(e=>e.id==="E-EFF").appliesTo.modelVersion="different-model";
  assert.ok(contains(x,"SDC-05"));
  assert.ok(contains(x,"SDC-09"));
});
test("two safeguards asserted independent despite shared failure dependencies trigger interaction review",()=>{
  const x=fixture();
  const c=clone(x.controls[0]);c.id="C-SECOND";c.statement="Independent clinician verification";
  x.controls.push(c);
  x.independenceClaims=[{controlIds:["C-VERIFY","C-SECOND"],assertion:"independent",rationale:"Independent on paper"}];
  assert.ok(contains(x,"SDC-06"));
  x.independenceClaims[0].assertion="undetermined";
  assert.ok(!contains(x,"SDC-06"));
});
test("missing material review timing is flagged despite populated narrative context",()=>{
  const x=fixture();x.context.contextDimensions[0].status="unknown";
  x.context.contextDimensions[0].description=null;
  assert.ok(contains(x,"SDC-01"));
});
test("a missing risk method or a generic supplier statement cannot substantiate the method",()=>{
  const x=fixture();x.riskArguments[0].riskMethodEvidenceId=null;
  assert.ok(contains(x,"SDC-07"));
  x.riskArguments[0].riskMethodEvidenceId="E-METHOD";
  x.evidence.find(e=>e.id==="E-METHOD").kind="supplier-assertion";
  assert.ok(contains(x,"SDC-07"));
});
test("a second hazard with no risk argument is reported without inventing its severity",()=>{
  const x=fixture();x.hazards.push({
    id:"H-PATIENT",hazardousSituation:"Wrong-patient transfer",
    potentialHarm:"Incorrect record used for decisions",scenarioConditionIds:[]});
  assert.ok(contains(x,"SDC-07"));
  const r=run(x);assert.ok(r.findings.every(f=>!("severity" in f)&&!("score" in f)));
});
test("separate governance fields require documentary evidence but never infer approval",()=>{
  const x=fixture();x.governance.riskAcceptanceEvidenceId=null;
  x.governance.deploymentAuthorisationEvidenceId=null;
  assert.ok(criteria(x).filter(c=>c==="SDC-08").length>=2);
  assert.equal(run(x).deploymentApproval,"not-assessed");
});
test("post-decision evidence and review information is rejected as hindsight",()=>{
  const x=fixture();x.evidence[0].sourceDate="2026-12-01";
  assert.ok(contains(x,"SDC-09"));
  assert.ok(contains(x,"SDC-04"));
});
test("unknown context does not imply a discovered clinical hazard",()=>{
  const x=fixture();x.context.materialContextDimensionIds.push("multi-speaker");
  assert.ok(contains(x,"SDC-01"));
  assert.ok(!criteria(x).includes("SDC-02"));
});
test("same synthetic packet always produces the same review-required findings",()=>{
  const x=fixture();x.controls[0].accountableOwner=null;
  const a=run(x),b=run(x);
  assert.deepEqual(a,b);
  assert.ok(a.findings.every(f=>f.reviewerDisposition===null));
});

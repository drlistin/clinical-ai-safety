/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS regression harness. */
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const base=path.join(__dirname,"../research/adjudication");
const dossiers=JSON.parse(fs.readFileSync(path.join(base,"dossiers-v0.1.json"),"utf8"));
const reviewer=JSON.parse(fs.readFileSync(path.join(base,"reviewer-record-template-v0.1.json"),"utf8"));
const register=JSON.parse(fs.readFileSync(path.join(__dirname,"../research/real-world/evidence-register-v0.1.json"),"utf8"));
test("three dossiers are unique, research-only, and never authorised reference cases",()=>{
 assert.equal(dossiers.dossiers.length,3);
 assert.equal(new Set(dossiers.dossiers.map(x=>x.dossierId)).size,3);
 for(const d of dossiers.dossiers) {
  assert.equal(d.sourceVerificationStatus,"pending-independent-verification");
  assert.equal(d.independentClinicalAdjudicationStatus,"not-started");
  assert.equal(d.adjudicatedFindings,null);
  assert.equal(d.automatedRiskClassification,null);
  assert.equal(d.originalDecisionReconstruction,"not-supported-from-public-record");
 }
});
test("every dossier anchors facts to existing real-world source records",()=>{
 const records=new Set(register.records.map(x=>x.recordId));
 for(const d of dossiers.dossiers) {
  assert.ok(d.sourceLocations.length>0);
  assert.ok(d.evidenceRecordIds.length>0);
  for(const id of d.evidenceRecordIds) assert.ok(records.has(id),id);
  for(const loc of d.sourceLocations) assert.ok(register.sources[loc.sourceId],loc.sourceId);
 }
});
test("all dossier hazards and controls remain hypotheses and questions",()=>{
 for(const d of dossiers.dossiers) {
  assert.ok(d.candidateHazardHypotheses.every(h=>/not-adjudicated/.test(h.status)));
  assert.ok(d.candidateControlQuestions.every(q=>q.endsWith("?")));
  assert.ok(d.residualRiskQuestions.every(q=>q.endsWith("?")));
  assert.ok(d.governanceQuestions.every(q=>q.endsWith("?")));
  assert.ok(d.hindsightBoundary.length>60);
 }
});
test("HSSIB e-RS non-AI evidence cannot become an AVT incident",()=>{
 const d=dossiers.dossiers.find(x=>x.dossierId==="DOS-HSSIB-ERS-001");
 assert.match(d.evidenceClass,/non-ai/);
 assert.match(d.systemDomain,/non-AI/);
});
test("GOSH PDF source checking limitation is explicitly retained",()=>{
 assert.ok(dossiers.sourceReviewNotes.some(x=>/screenshot fetch failed/.test(x)));
});
test("blank reviewer form cannot be mistaken for adjudicated assessment",()=>{
 assert.equal(reviewer.status,"blank-reviewer-form");
 assert.equal(reviewer.reviewerId,null);
 assert.equal(reviewer.adjudicatorRecord.adjudicatorId,null);
 assert.deepEqual(reviewer.findingRecords,[]);
 assert.equal(reviewer.approvedReferenceStatus,"not-approved");
 assert.equal(reviewer.clinicalRiskAcceptance,"not-assessed");
 assert.equal(reviewer.cscQtUsedAsGoldStandard,false);
});

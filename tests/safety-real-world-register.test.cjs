/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS Node test harness. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "../research/real-world/evidence-register-v0.1.json");
const data = JSON.parse(fs.readFileSync(root, "utf8"));

test("published source register is explicit and contains no gold-standard claims", () => {
 assert.equal(data.status,"source-extracted-requires-independent-adjudication");
 assert.equal(data.rules.independentAdjudicationRequired,true);
 assert.equal(data.rules.noInventedDecisions,true);
 assert.equal(data.rules.noAutomaticRiskClassification,true);
 assert.equal(data.records.length,7);
 assert.equal(new Set(data.records.map(x=>x.recordId)).size,data.records.length);
});
test("each observation is separately sourced and never presented as a verified decision",()=>{
 for(const r of data.records){
  assert.ok(data.sources[r.sourceId],r.recordId);
  assert.ok(r.sourceLocator.length>10);
  assert.ok(r.documentedObservation.length>50);
  assert.ok(r.knownMissingDecisionInformation.length>0);
  assert.equal(r.authorisedReferenceStatus,"not-approved");
  assert.equal(r.clinicalOutcomeAsserted,false);
  assert.equal(r.riskAcceptanceInferred,false);
  assert.equal(r.reconstructedDecision,"not-reconstructed");
 }
});
test("AVT pilot observations cannot be labelled investigated patient-harm incidents",()=>{
 for(const r of data.records.filter(x=>x.recordId.startsWith("REAL-AVT"))){
   assert.match(r.evidenceType,/observed-/);
   assert.ok(!/investigated-digital-safety/.test(r.evidenceType));
 }
});
test("HSSIB AVT investigation announcement does not become a case finding",()=>{
 const r=data.records.find(x=>x.recordId==="REAL-WATCH-001");
 assert.equal(r.evidenceType,"ongoing-investigation-no-findings");
 assert.equal(r.authorisedReferenceStatus,"not-approved");
});
test("HSSIB e-RS incident report is kept distinct from AI AVT observations",()=>{
 const cases=data.records.filter(x=>x.sourceId==="SRC-HSSIB-ERS-2026");
 assert.ok(cases.length>=2);
 assert.ok(cases.every(x=>x.limitations.some(y=>/not an AI|not an AVT|non-AI/i.test(y))));
});
test("source dates and links are recorded for reproducibility",()=>{
 for(const [id,s] of Object.entries(data.sources)){
  assert.match(s.url,/^https:\/\//,id);
  assert.match(s.publicationDate,/^2026-/);
  assert.match(s.reviewedOn,/^2026-11-14$/);
  assert.ok(s.sourceType);
 }
});
test("none of the published source records can be imported as an approved reference case",()=>{
 assert.ok(data.records.every(x=>x.caseStatus==="evidence-extracted-not-adjudicated"));
 assert.ok(data.records.every(x=> !Object.hasOwn(x,"expertReviewed") && !Object.hasOwn(x,"acceptedRiskScore")));
});

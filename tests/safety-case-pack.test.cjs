/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test runner. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../research/avt/case-pack-v0.1.json"), "utf8"));
test("all AVT reference cases are marked drafts without adjudicated labels", () => {
 assert.equal(data.status, "draft-unadjudicated");
 assert.equal(data.cases.length, 12);
 for (const item of data.cases) {
   assert.equal(item.expertReferenceStatus, "draft");
   assert.equal(item.adjudicatedExpectedFindings, null);
   assert.equal(item.adjudicationAuthority, null);
 }
});
test("every case has unique ID, sufficient scenario facts and an explicit question", () => {
 assert.equal(new Set(data.cases.map(x=>x.caseId)).size, data.cases.length);
 for (const x of data.cases) {
   assert.match(x.caseId, /^AVT-\d{3}$/);
   assert.ok(x.scenarioFacts.length >= 3);
   assert.ok(x.proposedSafetyDecision.trim().length > 20);
   assert.ok(x.reviewQuestion.endsWith("?"));
   assert.ok(x.sourceIds.length >= 1);
 }
});
test("case sources resolve to official source register entries", () => {
 for (const item of data.cases)
   for (const id of item.sourceIds) {
     const source = data.sourceRegister[id];
     assert.ok(source, id);
     assert.match(source.url, /^https:\/\//);
     assert.ok(source.section);
   }
});
test("case pack cannot be mistaken for validated reference or product sign-off", () => {
 assert.match(data.intendedUse, /NOT clinical guidance/);
 assert.ok(data.cases.every(x=>x.adjudicatedExpectedFindings === null));
 assert.ok(data.cases.every(x=> !Object.hasOwn(x,"riskAccepted") && !Object.hasOwn(x,"clinicalValidityScore")));
});

/* eslint-disable @typescript-eslint/no-require-imports -- Node regression harness. */
const test=require("node:test"), assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),Module=require("node:module"),ts=require("typescript");
const root=path.join(__dirname,"..");
const src=path.join(root,"lib/safety-decision/trace-validation.ts");
const mod=new Module(src,module);mod.filename=src;mod.paths=module.paths;
mod._compile(ts.transpileModule(fs.readFileSync(src,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,src);
const {validateTraceRegister}=mod.exports;
const traces=JSON.parse(fs.readFileSync(path.join(root,"research/real-world/decision-traces-v0.1.json"),"utf8"));
const evidence=JSON.parse(fs.readFileSync(path.join(root,"research/real-world/evidence-register-v0.1.json"),"utf8"));
const copy=(obj)=>structuredClone(obj);
test("independent source-to-decision traces have valid references",()=>{const out=validateTraceRegister(traces,evidence);assert.deepEqual(out.issues,[]);assert.equal(out.valid,true)});
test("no CSC-QT dependencies enter any engine source",()=>{const dir=path.join(root,"lib/safety-decision");for(const name of fs.readdirSync(dir)){if(!name.endsWith(".ts"))continue;const content=fs.readFileSync(path.join(dir,name),"utf8");assert.doesNotMatch(content,/CSC-QT|curistica|36.indicator/i,`Engine file ${name}`)}}); 
test("unmapped source is blocked",()=>{const x=copy(traces);x.records[0].evidenceRecordId="FABRICATED";assert.equal(validateTraceRegister(x,evidence).valid,false)});
test("HSSIB AVT ongoing investigation cannot be promoted into a finding",()=>{const x=copy(traces);x.records[0].evidenceRecordId="REAL-WATCH-001";assert.ok(validateTraceRegister(x,evidence).issues.some(z=>z.includes("investigation announcement")))});
test("historical deployment controls cannot be presumed",()=>{const x=copy(traces);x.records[0].actualControlStatus="effective";assert.equal(validateTraceRegister(x,evidence).valid,false)});
test("expert approval cannot be self-assigned",()=>{const x=copy(traces);x.records[0].reviewStatus="expert-reviewed";assert.equal(validateTraceRegister(x,evidence).valid,false)});
test("duplicate traces rejected",()=>{const x=copy(traces);x.records.push({...x.records[0]});assert.equal(validateTraceRegister(x,evidence).valid,false)});
test("trace output cannot certify clinical validation or deployment",()=>{const r=validateTraceRegister(traces,evidence);assert.equal(r.clinicalValidation,"not-performed");assert.equal(r.deploymentApproval,"not-assessed")});

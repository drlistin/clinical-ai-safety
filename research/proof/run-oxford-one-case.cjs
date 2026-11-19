/* Research-only Oxford one-case technical demonstration.
 * No changes to decision-validity v0.2, no hazard discovery, no clinical reference labels.
 * The v0.1 source is an exact frozen copy from the public draft PR #14.
 * Run: node research/proof/run-oxford-one-case.cjs
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Module = require("node:module");
const ts = require("typescript");

const repoRoot = path.resolve(__dirname, "../..");
const sourcePath = path.join(__dirname, "oxford-prospective-case-v0.1-frozen.json");
const outputDir = path.join(__dirname, "output");
const readBytes = fs.readFileSync(sourcePath);
const source = JSON.parse(readBytes.toString("utf8"));
if (source.caseId !== "OUH-PROSPECTIVE-SDC-001" || source.caseVersion !== "0.1.0" ||
    source.asOfDecisionDate !== "2026-11-18" ||
    source.expectedClinicalFindings !== null ||
    source.allLocalFactsSynthetic !== true) {
  throw new Error("Unexpected source case version, date or adjudication state");
}
const a = source.assessmentInput;
if (a.hazards.length !== 2 || a.controls.length !== 2 || a.residualRiskClaims.length !== 2) {
  throw new Error("Original frozen assessment structures changed");
}
const workflowId = "fictional-manual-avt-epr-copy";
const context = {
  id: a.context.id,
  asOfDate: source.asOfDecisionDate,
  deploymentOrganisation: a.context.deploymentOrganisation,
  productVersion: a.context.productVersion,
  modelVersion: a.context.modelVersion,
  careSetting: a.context.careSetting,
  population: a.context.relevantPopulation,
  workflowId,
  intendedUse: a.context.intendedPurpose,
  proposedDecision: a.proposedDecision,
  materialContextDimensionIds: ["multiple-speakers", "manual-epr-transfer", "review-opportunity"],
  contextDimensions: [
    {
      id: "multiple-speakers", status: "known",
      description: "Some 15-minute consultations involve a relative or more than one speaker.",
      applicabilityReason: null,
    },
    {
      id: "manual-epr-transfer", status: "known",
      description: "Notes are copied from a stand-alone browser after clinician editing and before EPR signing.",
      applicabilityReason: null,
    },
    {
      id: "review-opportunity", status: "unknown", description: null,
      applicabilityReason: null,
    },
  ],
};
const evidenceMap = {
  "published-service-evaluation": "published-evaluation",
  "supplier-assertion": "supplier-assertion",
  assumption: "assumption",
};
const input = {
  schemaVersion: "0.2",
  id: source.caseId + "-EXTRACTION-1",
  caseType: "synthetic-research",
  context,
  hazards: a.hazards.map(h => ({
    id: h.id,
    hazardousSituation: h.description,
    potentialHarm: h.potentialHarm,
    scenarioConditionIds: [],
  })),
  controls: a.controls.map(c => ({
    id: c.id,
    hazardIds: [...c.hazardIds],
    statement: c.statement,
    // A distinct comparison of encounter against note is a *proposed*
    // detection action. Manual copy itself is an activity, not a safeguard.
    role: c.id === "C-REVIEW-01" ? "safeguard" : "workflow-activity",
    mechanism: c.id === "C-REVIEW-01" ? "detect" : "none",
    mechanismExplanation: c.id === "C-REVIEW-01"
      ? "Clinician compares clinically significant encounter details against the draft before EPR sign-off, as proposed in the case."
      : null,
    accountableOwner: c.accountableOwner,
    status: c.status === "effectiveness-supported" ? "effectiveness-claimed"
      : c.status === "declared" ? "proposed"
      : (() => { throw new Error("Unrecognised old control status: " + c.status); })(),
    implementationEvidenceIds: [...c.implementationEvidenceIds],
    effectivenessEvidenceIds: [...c.effectivenessEvidenceIds],
    dependencyIds: [...c.localDependencies],
  })),
  evidence: a.evidence.map(e => ({
    id: e.id, title: e.title,
    kind: evidenceMap[e.classification] ?? (() => {
      throw new Error("Unexpected evidence class " + e.classification);
    })(),
    sourceId: e.sourceUriOrDocumentId,
    sourceVersion: e.version,
    methodDescription: null,
    outcomeDefinition: null,
    denominatorDefinition: null,
    // Do NOT invent a date from source's month-only '2026-02'.
    sourceDate: /^\d{4}-\d{2}-\d{2}$/.test(e.publishedOrEffectiveDate ?? "")
      ? e.publishedOrEffectiveDate : null,
    // Original says a desk-check occurred, but supplies no attributable
    // evidence-review identifier qualifying under v0.2.
    reviewerId: null, reviewedAt: null,
    appliesTo: {
      productVersion: null, modelVersion: null,
      careSetting: null, population: null, workflowId: null,
    },
    limitations: [...e.limitations],
  })),
  riskArguments: a.residualRiskClaims.map(r => {
    const isDoc = r.hazardId === "H-DOC-01";
    return {
      hazardId: r.hazardId,
      // A named fictional risk method is NOT an evidence document.
      riskMethodEvidenceId: null,
      initial: { category: null, reasoning: null },
      residual: {
        category: r.claimedCategory,
        reasoning: r.claimedReasoning,
      },
      // This field is an explicit *extractor interpretation* of the
      // fictional team's statement that clinician review "makes" risk Low.
      claimedRiskChange: isDoc ? "reduced" : "indeterminate",
      controlEffects: isDoc ? [{
        controlId: "C-REVIEW-01",
        // The source does not specify likelihood/severity, so do not invent it.
        assertedEffectOn: "none",
        reductionClaimed: true,
        rationale: r.claimedReasoning,
        effectEvidenceIds: [
          ...a.controls.find(c => c.id === "C-REVIEW-01").effectivenessEvidenceIds,
        ],
      }] : [],
    };
  }),
  independenceClaims: [], // Source makes NO safeguard independence claim.
  governance: {
    csoIdentifier: null, csoReviewEvidenceId: null,
    riskAcceptanceAuthority: a.residualRiskClaims[0].acceptanceAuthority,
    riskAcceptanceEvidenceId: null,
    deploymentAuthority: null,
    deploymentAuthorisationEvidenceId: null,
    monitoringPlanEvidenceId: null,
  },
};

const extractionAudit = {
  status: "single-researcher-non-blinded-structured-extraction",
  originalCase: {
    repo: "drlistin/clinical-ai-safety",
    draftPR: 14,
    sourceCommit: "2a96b478c8d18e1572a44c0bdea63a0e4e6736d9",
    sourceBlobSha: "ad85cb2fabf510d473481a56415d3dc723f29ed8",
    frozenFile: "research/proof/oxford-prospective-case-v0.1-frozen.json",
    sha256: crypto.createHash("sha256").update(readBytes).digest("hex"),
    sourceDecisionDate: source.asOfDecisionDate,
    notRealOxfordCase: true,
  },
  extractionFields: [
    {field:"context.decision/workflow/product/setting",source:"assessmentInput.context, proposedDecision",treatment:"source-direct; workflowId assigned by extractor"},
    {field:"context.materialContextDimensionIds",source:"syntheticScenarioFacts[0:2]; controls[0].localDependencies",treatment:"researcher-selected material facts; known speaker/copy details; review opportunity unknown"},
    {field:"hazards",source:"assessmentInput.hazards",treatment:"source-supplied hazard IDs and harms, NOT independently discovered by engine"},
    {field:"controls.role, mechanism",source:"assessmentInput.controls[].statement",treatment:"researcher classification: review proposed detection; manual copy activity; susceptible to interpretation bias"},
    {field:"controls.status",source:"assessmentInput.controls[].status",treatment:"effectiveness-supported→effectiveness-claimed; declared→proposed; not verified effectiveness"},
    {field:"evidence[].kind",source:"assessmentInput.evidence[].classification",treatment:"explicit source-type map; no assumptions promoted to local evidence"},
    {field:"evidence[].reviewerId/reviewedAt",source:"no named independent source reviewer documented",treatment:"left null; desk-check date not misrepresented as reviewed independent record"},
    {field:"evidence[].sourceDate",source:"publishedOrEffectiveDate",treatment:"month-only dates left null; exact case-date synthetic records kept"},
    {field:"riskArguments[].initial",source:"not provided in residualRiskClaims",treatment:"left null rather than inventing initial risk"},
    {field:"riskArguments[].claimedRiskChange",source:"review makes Low statement for H-DOC-01",treatment:"researcher interprets reduction as claimed for documentation hazard only; alternative interpretation could differ"},
    {field:"riskArguments[].controlEffects[].assertedEffectOn",source:"not specified",treatment:"none; no likelihood/severity mechanism invented"},
    {field:"riskMethodEvidenceId",source:"methodId present but no applicable risk method record in evidence[]",treatment:"null, not invented evidence"},
    {field:"independenceClaims",source:"none stated",treatment:"[]; engine therefore cannot test shared dependency independence"},
    {field:"governance",source:"residualRiskClaims[].acceptanceAuthority, no signed records",treatment:"keep proposed board label, no invented CSO/review or approval evidence"},
  ],
  limitations: [
    "Source case itself is a visibly flaw-rich researcher-designed synthetic packet, not a blind validation case.",
    "Context relevance and classification are provided by a human extractor. Engine cannot identify missing hazard classes.",
    "Data completeness finding may reflect source's deliberate omissions, not clinically material real-world failure.",
    "Source URL is context-only public OUH evaluation, not proof of local control effectiveness.",
    "No Q1–Q7 independent clinical adjudication or case reviewer data are used.",
  ],
};
const sourceModule = path.join(repoRoot, "lib/safety-decision/decision-validity-v0.2.ts");
const transpiled = ts.transpileModule(fs.readFileSync(sourceModule, "utf8"), {
  compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022},
}).outputText;
const moduleInstance = new Module(sourceModule, module);
moduleInstance.filename = sourceModule;
moduleInstance.paths = module.paths;
moduleInstance._compile(transpiled, sourceModule);
const {evaluateDecisionValidityV02, DECISION_VALIDITY_RULESET} = moduleInstance.exports;
const result = evaluateDecisionValidityV02(input);
if (result.reviewStatus !== "unadjudicated" ||
    result.deploymentApproval !== "not-assessed" ||
    result.residualRiskClassification !== "not-determined" ||
    result.ruleSetVersion !== DECISION_VALIDITY_RULESET ||
    !result.findings.every(f => f.reviewerDisposition === null)) {
  throw new Error("Unexpected decision-validity output assertion");
}
const summary = {
  sourceCaseId: source.caseId,
  sourceCaseVersion: source.caseVersion,
  asOfDate: source.asOfDecisionDate,
  engineRuleSetVersion: result.ruleSetVersion,
  ruleCoverage: ["SDC-01","SDC-03","SDC-04","SDC-05","SDC-06","SDC-07","SDC-08","SDC-09","SDC-10"],
  unimplementedCriteria: ["SDC-02-independent-hazard-discovery"],
  sourceHazardsSuppliedToEngine: input.hazards.length,
  sourceControlsSuppliedToEngine: input.controls.length,
  candidateFindingCount: result.findings.length,
  findingCountsByCriterion: Object.fromEntries(
    [...new Set(result.findings.map(f => f.criterionId))].sort().map(id => [
      id,result.findings.filter(f => f.criterionId === id).length
    ])
  ),
  reviewStatus: result.reviewStatus,
  deploymentApproval: result.deploymentApproval,
  residualRiskClassification: result.residualRiskClassification,
  clinicalValidityNotEstablished: true,
};
fs.mkdirSync(outputDir, {recursive:true});
for (const [name,obj] of [
  ["oxford-extracted-input-v0.2.json",input],
  ["oxford-extraction-audit-v0.1.json",extractionAudit],
  ["oxford-raw-engine-output-v0.2.json",result],
  ["oxford-run-summary-v0.1.json",summary],
]) {
  fs.writeFileSync(path.join(outputDir,name), JSON.stringify(obj,null,2)+"\n","utf8");
}
console.log(JSON.stringify(summary,null,2));

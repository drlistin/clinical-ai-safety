"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  KeywordGroup,
  RiskBand,
  Scenario,
} from "@/lib/scenarios/types";
import {
  bandForRisk,
  bandStyles,
  calculateInitialRisk,
  evaluateControls,
  evaluateScore,
  evaluateTextStep,
  likelihoodLabels,
  severityLabels,
} from "./feedback";
import { exportHazardLogPdf, type HazardLogReport } from "./exportPdf";
import type {
  ActionEntry,
  ControlEntry,
} from "./pdf/types";
import {
  evaluateControlQuality,
  evaluateGovernanceQuality,
  evaluateLogicalConsistency,
  evaluateMissingEssentials,
  evaluateScenarioExpectations,
  runValidation,
  type ConsistencyFinding,
  type GovernanceQualityIssue,
  type ScenarioExpectationFinding,
} from "./validation";
// Phase 5A — Step 1. Unified visual status system. All status indicators
// (challenged badges, consistency findings, governance/scenario chips,
// missing-essentials and scenario-controls panels) consume STATUS_DEFINITIONS
// instead of inlining colour classes. This file is the only place that
// references "rose", "amber" etc. for SEMANTIC status; raw rose/amber/emerald
// usage that remains is for descriptive / non-status surfaces (band chip,
// concept lists, briefing card) which are intentionally on their own scale.
import {
  Badge,
  deriveChallengedStatus,
  statusFor,
  type StatusLevel,
} from "./status";

/* ------------------------------------------------------------------ */
/* Types & static metadata                                            */
/* ------------------------------------------------------------------ */

type StepKey =
  | "briefing"
  | "classification"
  | "hazard"
  | "cause"
  | "consequence"
  | "severity"
  | "likelihood"
  | "controls"
  | "residual"
  | "feedback";

type StepMeta = { id: number; key: StepKey; name: string };

const STEPS: StepMeta[] = [
  { id: 1, key: "briefing", name: "Scenario briefing" },
  { id: 2, key: "classification", name: "Classification & system context" },
  { id: 3, key: "hazard", name: "Identify the hazard" },
  { id: 4, key: "cause", name: "Cause / failure mechanism" },
  { id: 5, key: "consequence", name: "Clinical consequence" },
  { id: 6, key: "severity", name: "Score severity" },
  { id: 7, key: "likelihood", name: "Score likelihood" },
  { id: 8, key: "controls", name: "Existing & proposed controls" },
  { id: 9, key: "residual", name: "Residual risk, monitoring, ownership" },
  { id: 10, key: "feedback", name: "Reference answer & feedback" },
];

type Answers = {
  // Classification & system context
  hazardClassifications: string[];
  systemName: string;
  systemVersion: string;
  workflowStep: string;
  safetyRequirement: string;
  benefitJustification: string;

  // Hazard log entry (user-articulated)
  hazard: string;
  cause: string;
  consequence: string;

  // Initial risk
  severity: number | null;
  severityEvidence: string[];
  likelihood: number | null;
  likelihoodEvidence: string[];

  // Controls (existing vs proposed, P/D/C)
  existingPreventative: string;
  existingDetective: string;
  existingCorrective: string;
  proposedPreventative: string;
  proposedDetective: string;
  proposedCorrective: string;

  // Residual risk
  residualSeverity: number | null;
  residualLikelihood: number | null;
  residualRationale: string;

  // Monitoring & governance
  monitoringMetric: string;
  triggerThreshold: string;
  reviewFrequency: string;
  capa: string;

  // Stakeholders & assumptions
  stakeholders: string;
  assumptions: string;

  // Ownership
  owner: string;
};

const initialAnswers: Answers = {
  hazardClassifications: [],
  systemName: "",
  systemVersion: "",
  workflowStep: "",
  safetyRequirement: "",
  benefitJustification: "",
  hazard: "",
  cause: "",
  consequence: "",
  severity: null,
  severityEvidence: [],
  likelihood: null,
  likelihoodEvidence: [],
  existingPreventative: "",
  existingDetective: "",
  existingCorrective: "",
  proposedPreventative: "",
  proposedDetective: "",
  proposedCorrective: "",
  residualSeverity: null,
  residualLikelihood: null,
  residualRationale: "",
  monitoringMetric: "",
  triggerThreshold: "",
  reviewFrequency: "",
  capa: "",
  stakeholders: "",
  assumptions: "",
  owner: "",
};

export const HAZARD_CLASSIFICATION_TAGS = [
  "Clinical",
  "Technical",
  "Workflow",
  "AI-specific",
  "Interoperability",
  "Data quality",
] as const;

export const EVIDENCE_BASIS_TAGS = [
  "Incident data",
  "Pilot / audit data",
  "Supplier evidence",
  "Expert judgement",
  "Assumption only",
] as const;

/**
 * Defensive normalisation for textarea input. Some browsers / clipboards /
 * autocorrect paths swap straight quotes and dashes for typographic
 * variants, and very rarely a non-breaking space sneaks in. Normalising
 * these into ASCII equivalents BEFORE matching means the missing-controls
 * engines (which substring-match against ASCII synonym banks) don't miss a
 * line just because the user typed a smart quote. Also Unicode-NFC
 * normalises composed/decomposed accent forms.
 *
 * Substitutions:
 *   U+00A0  NBSP                       → regular space
 *   U+202F  narrow no-break space      → regular space
 *   U+200B  zero-width space           → regular space
 *   U+2018-201B  smart single quotes   → '
 *   U+201C-201F  smart double quotes   → "
 *   U+2013-2015  en/em/horizontal dash → -
 */
const normaliseInputText = (t: string): string =>
  t
    .normalize("NFC")
    .replace(/[   ]/g, " ") // various non-breaking spaces
    .replace(/[‘’‚‛]/g, "'") // smart single quotes
    .replace(/[“”„‟]/g, '"') // smart double quotes
    .replace(/[–—―]/g, "-"); // en/em dashes

const splitLines = (t: string): string[] =>
  normaliseInputText(t)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

function generateHazardId(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `HAZ-${y}${m}${day}-001`;
}

function acceptabilityFor(band: RiskBand | null): string {
  switch (band) {
    case "Low":
      return "Acceptable";
    case "Medium":
      return "Acceptable with active monitoring";
    case "High":
      return "Not acceptable without further mitigation";
    case "Extreme":
      return "Not acceptable, escalate immediately";
    default:
      return "Not assessed";
  }
}

function buildControlsList(
  answers: Answers,
  ownerStr: string,
): ControlEntry[] {
  const entries: ControlEntry[] = [];
  const groups: Array<{
    src: string;
    type: ControlEntry["type"];
    origin: ControlEntry["origin"];
    impl: ControlEntry["implementationStatus"];
    ver: ControlEntry["verificationStatus"];
  }> = [
    {
      src: answers.existingPreventative,
      type: "Preventative",
      origin: "Existing",
      impl: "Implemented",
      ver: "Verified",
    },
    {
      src: answers.existingDetective,
      type: "Detective",
      origin: "Existing",
      impl: "Implemented",
      ver: "Verified",
    },
    {
      src: answers.existingCorrective,
      type: "Corrective",
      origin: "Existing",
      impl: "Implemented",
      ver: "Verified",
    },
    {
      src: answers.proposedPreventative,
      type: "Preventative",
      origin: "Proposed",
      impl: "Planned",
      ver: "Not verified",
    },
    {
      src: answers.proposedDetective,
      type: "Detective",
      origin: "Proposed",
      impl: "Planned",
      ver: "Not verified",
    },
    {
      src: answers.proposedCorrective,
      type: "Corrective",
      origin: "Proposed",
      impl: "Planned",
      ver: "Not verified",
    },
  ];
  for (const g of groups) {
    for (const text of splitLines(g.src)) {
      entries.push({
        text,
        type: g.type,
        origin: g.origin,
        owner: ownerStr,
        implementationStatus: g.impl,
        verificationStatus: g.ver,
      });
    }
  }
  return entries;
}

function generateActions(
  controls: ControlEntry[],
  answers: Answers,
  ownerStr: string,
): ActionEntry[] {
  const actions: ActionEntry[] = [];
  const proposed = controls.filter((c) => c.origin === "Proposed");
  const unverified = controls.filter(
    (c) => c.verificationStatus !== "Verified",
  );

  if (proposed.length > 0) {
    actions.push({
      action: `Implement proposed controls (${proposed.length} entr${proposed.length === 1 ? "y" : "ies"})`,
      owner: ownerStr,
      dueDate: "Next safety review cycle",
      status: "Planned",
    });
  }
  if (unverified.length > 0) {
    actions.push({
      action: `Verify ${unverified.length} control${unverified.length === 1 ? "" : "s"} against operational evidence`,
      owner: ownerStr,
      dueDate: answers.reviewFrequency || "Within next review cycle",
      status: "Planned",
    });
  }
  if (answers.monitoringMetric.trim()) {
    actions.push({
      action: `Operationalise monitoring metric: ${answers.monitoringMetric.trim()}`,
      owner: ownerStr,
      dueDate: answers.reviewFrequency || "Before go-live",
      status: "Planned",
    });
  }
  if (answers.capa.trim()) {
    actions.push({
      action: "Document CAPA pathway and rehearse trigger response",
      owner: ownerStr,
      dueDate: "Before go-live",
      status: "Planned",
    });
  }
  if (actions.length === 0) {
    actions.push({
      action: "Complete entry and resubmit for governance review",
      owner: ownerStr,
      dueDate: "Before next governance meeting",
      status: "Planned",
    });
  }
  return actions;
}

type BuildArgs = {
  scenario: Scenario;
  answers: Answers;
  initialRisk: number;
  initialBand: RiskBand;
  residualRisk: number | null;
  residualBand: RiskBand | null;
};

function buildHazardLogReport(args: BuildArgs): HazardLogReport {
  const { scenario, answers } = args;
  const now = new Date();
  const reviewDate = new Date(now);
  reviewDate.setMonth(reviewDate.getMonth() + 3);

  const ownerStr = answers.owner.trim() || "(to be assigned)";
  const controls = buildControlsList(answers, ownerStr);

  // Author defaults to the named clinical owner if one was supplied. If the
  // user named only IT or left ownership blank, default to the standard
  // clinical role title rather than a non-clinical placeholder.
  const ownerLooksClinical = /clinical|clinician|cso|safety officer|pathway|caldicott|medical director/i.test(
    answers.owner,
  );
  const authorStr = answers.owner.trim() && ownerLooksClinical
    ? answers.owner.trim()
    : "Clinical Safety Officer / Product Safety Lead";

  const validation = runValidation({
    scenario,
    hazard: answers.hazard,
    cause: answers.cause,
    consequence: answers.consequence,
    severity: answers.severity ?? 0,
    likelihood: answers.likelihood ?? 0,
    residualSeverity: answers.residualSeverity ?? 0,
    residualLikelihood: answers.residualLikelihood ?? 0,
    residualRationale: answers.residualRationale,
    preventativeControls: [
      ...splitLines(answers.existingPreventative),
      ...splitLines(answers.proposedPreventative),
    ],
    detectiveControls: [
      ...splitLines(answers.existingDetective),
      ...splitLines(answers.proposedDetective),
    ],
    correctiveControls: [
      ...splitLines(answers.existingCorrective),
      ...splitLines(answers.proposedCorrective),
    ],
    monitoringMetric: answers.monitoringMetric,
    triggerThreshold: answers.triggerThreshold,
    reviewFrequency: answers.reviewFrequency,
    capa: answers.capa,
    owner: answers.owner,
    severityEvidence: answers.severityEvidence,
    likelihoodEvidence: answers.likelihoodEvidence,
  });

  const actions = generateActions(controls, answers, ownerStr);

  return {
    documentTitle: "Clinical Safety Hazard Log Report",
    scenarioName: scenario.name,
    hazardId: generateHazardId(now),
    version: "1.0",
    dateCreated: now,
    lastReviewed: now,
    reviewDate,
    status: "Open",
    author: authorStr,
    approver: "",
    reviewer: "",
    owner: ownerStr,
    hazardClassifications: answers.hazardClassifications,
    systemName: answers.systemName.trim() || "(not specified)",
    systemVersion: answers.systemVersion.trim(),
    workflowStep: answers.workflowStep.trim(),
    // Defaults are intentionally NEUTRAL placeholders. The previous
    // cancer-pathway default ("Urgent referrals meeting defined red-flag
    // criteria...") leaked oncology-pathway wording onto Page 2 of every
    // unrelated entry that left this field empty. If the user has not
    // entered a safety requirement we render a generic placeholder; never
    // a scenario-template phrase.
    safetyRequirement:
      answers.safetyRequirement.trim() ||
      "(to be defined during clinical safety review)",
    benefitJustification:
      answers.benefitJustification.trim() || "(not specified)",
    hazard: answers.hazard,
    causeFailureMode: answers.cause,
    // Narrative fields are derived ONLY from the user's current scenario
    // inputs. They MUST NOT be sourced from scenario.reference, otherwise
    // the previous scenario's wording (e.g. cancer pathway language) will
    // contaminate an unrelated entry. When user input is empty we fall
    // back to a neutral placeholder, never to scenario.reference content.
    sequenceOfEvents:
      answers.cause.trim() ||
      "(to be documented during clinical safety review)",
    hazardousSituation:
      answers.hazard.trim() ||
      "(to be documented during clinical safety review)",
    potentialHarm:
      answers.consequence.trim() ||
      "(to be documented during clinical safety review)",
    clinicalConsequence: answers.consequence,
    initialSeverity: answers.severity ?? 0,
    // Severity / likelihood rationales render on Page 3 score panels. They
    // MUST NOT be sourced from scenario.feedback.*.rationale because those
    // are hard-coded to the cancer-pathway frame ("Missed or significantly
    // delayed cancer diagnosis is a catastrophic patient outcome..." etc.)
    // and would contaminate every non-cancer entry. Use the validation
    // engine's text-aware derived rationales instead - these branch on
    // direction (over / under / honest) and reference the user's entered
    // hazard text rather than the scenario template.
    severityRationale: validation.derivedSeverityRationale,
    severityEvidence: answers.severityEvidence,
    initialLikelihood: answers.likelihood ?? 0,
    likelihoodRationale: validation.derivedLikelihoodRationale,
    likelihoodEvidence: answers.likelihoodEvidence,
    initialRiskScore: args.initialRisk,
    initialRiskBand: args.initialBand,
    referenceSeverity: validation.referenceSeverity,
    referenceLikelihood: validation.referenceLikelihood,
    severityChallenged: validation.severityChallenged,
    likelihoodChallenged: validation.likelihoodChallenged,
    severityOverstated: validation.severityOverstated,
    likelihoodOverstated: validation.likelihoodOverstated,
    adjustedSeverity: validation.adjustedSeverity,
    adjustedLikelihood: validation.adjustedLikelihood,
    adjustedRiskScore: validation.adjustedRiskScore,
    adjustedRiskBand: validation.adjustedRiskBand,
    scoreAdjustmentDirection: validation.scoreAdjustmentDirection,
    residualSeverity: answers.residualSeverity ?? 0,
    residualLikelihood: answers.residualLikelihood ?? 0,
    residualRationale:
      answers.residualRationale.trim() ||
      "Rationale to be added on review.",
    residualRiskScore: args.residualRisk ?? 0,
    residualRiskBand: args.residualBand ?? "Low",
    overallAcceptability:
      validation.overallAcceptabilityOverride ||
      acceptabilityFor(args.residualBand),
    governanceConcern: validation.governanceConcern,
    governanceConcernRationale: validation.governanceConcernRationale,
    controls,
    monitoringMetric:
      answers.monitoringMetric.trim() || "(to be defined)",
    triggerThreshold:
      answers.triggerThreshold.trim() || "(to be defined)",
    reviewFrequency:
      answers.reviewFrequency.trim() || "(to be defined)",
    capa: answers.capa.trim() || "(to be defined)",
    stakeholders: answers.stakeholders.trim(),
    assumptions: answers.assumptions.trim(),
    governanceStatus: validation.status,
    criticalWarnings: validation.criticalWarnings,
    requiredImprovements: validation.requiredImprovements,
    actions,
    recommendation: validation.recommendation,
    recommendationNote: validation.recommendationNote,
  };
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function HazardLogSimulator({
  scenario,
}: {
  scenario: Scenario;
}) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll into view on step change so the user always lands at the top.
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const initialRisk = useMemo(
    () => calculateInitialRisk(answers.severity, answers.likelihood),
    [answers.severity, answers.likelihood],
  );
  const initialBand = useMemo(() => bandForRisk(initialRisk), [initialRisk]);

  const update = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const canAdvance = useMemo(() => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return (
          answers.hazardClassifications.length > 0 &&
          answers.systemName.trim().length > 0 &&
          answers.safetyRequirement.trim().length >= 8 &&
          answers.benefitJustification.trim().length >= 8
        );
      case 3:
        return answers.hazard.trim().length >= 12;
      case 4:
        return answers.cause.trim().length >= 12;
      case 5:
        return answers.consequence.trim().length >= 12;
      case 6:
        return answers.severity != null;
      case 7:
        return answers.likelihood != null;
      case 8:
        return [
          answers.existingPreventative,
          answers.existingDetective,
          answers.existingCorrective,
          answers.proposedPreventative,
          answers.proposedDetective,
          answers.proposedCorrective,
        ].some((t) => t.trim().length > 0);
      case 9:
        return (
          answers.residualSeverity != null &&
          answers.residualLikelihood != null &&
          answers.owner.trim().length > 0
        );
      default:
        return false;
    }
  }, [step, answers]);

  const handleReset = () => {
    setAnswers(initialAnswers);
    setStep(1);
    setExportError(null);
  };

  const residualRisk = useMemo(
    () =>
      calculateInitialRisk(answers.residualSeverity, answers.residualLikelihood),
    [answers.residualSeverity, answers.residualLikelihood],
  );
  const residualBand = useMemo(() => bandForRisk(residualRisk), [residualRisk]);

  // Phase 4B — component-level governance-adjusted severity. Used by the
  // Step 9 ConsistencyFindingsPanel (via ResidualStep) so the live ownership
  // check compares against the TRUE worst-credible severity, not the
  // user-typed Step 6 value. Also keeps the live panel wording identical to
  // what the PDF will render at export time, since both surfaces feed off
  // the same runValidation output. runValidation is pure and re-runs on
  // every keystroke (as does buildHazardLogReport on export) so there is no
  // staleness risk; the cost is acceptable for a single-record simulator.
  const adjustedSeverity = useMemo(() => {
    const validation = runValidation({
      scenario,
      hazard: answers.hazard,
      cause: answers.cause,
      consequence: answers.consequence,
      severity: answers.severity ?? 0,
      likelihood: answers.likelihood ?? 0,
      residualSeverity: answers.residualSeverity ?? 0,
      residualLikelihood: answers.residualLikelihood ?? 0,
      residualRationale: answers.residualRationale,
      preventativeControls: [
        ...splitLines(answers.existingPreventative),
        ...splitLines(answers.proposedPreventative),
      ],
      detectiveControls: [
        ...splitLines(answers.existingDetective),
        ...splitLines(answers.proposedDetective),
      ],
      correctiveControls: [
        ...splitLines(answers.existingCorrective),
        ...splitLines(answers.proposedCorrective),
      ],
      monitoringMetric: answers.monitoringMetric,
      triggerThreshold: answers.triggerThreshold,
      reviewFrequency: answers.reviewFrequency,
      capa: answers.capa,
      owner: answers.owner,
      severityEvidence: answers.severityEvidence,
      likelihoodEvidence: answers.likelihoodEvidence,
    });
    return validation.adjustedSeverity;
  }, [scenario, answers]);

  const handleExport = async () => {
    if (initialRisk == null || !initialBand) return;
    setExportError(null);
    setExporting(true);
    try {
      const report = buildHazardLogReport({
        scenario,
        answers,
        initialRisk,
        initialBand,
        residualRisk,
        residualBand,
      });
      await exportHazardLogPdf(report);
    } catch (err) {
      console.error(err);
      setExportError(
        "Could not generate the PDF in this browser. Please try again.",
      );
    } finally {
      setExporting(false);
    }
  };

  const current = STEPS[step - 1];
  const isFirst = step === 1;
  const isFinal = step === 10;

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm"
    >
      <ProgressIndicator step={step} />

      <div className="border-b border-navy-100 bg-navy-50/40 px-6 py-5 md:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
          Step {current.id} of {STEPS.length}
        </p>
        <h3 className="mt-1.5 text-xl font-semibold text-navy-950 md:text-2xl">
          {current.name}
        </h3>
      </div>

      <div className="px-6 py-8 md:px-10 md:py-10">
        {step === 1 && <BriefingStep scenario={scenario} />}
        {step === 2 && (
          <ClassificationStep
            answers={answers}
            onChange={(field, v) => update(field, v)}
          />
        )}
        {step === 3 && (
          <HazardStep
            value={answers.hazard}
            onChange={(v) => update("hazard", v)}
            scenario={scenario}
          />
        )}
        {step === 4 && (
          <TextStep
            value={answers.cause}
            onChange={(v) => update("cause", v)}
            scenario={scenario}
            field="cause"
            label="Cause / failure mechanism"
            description="Describe how the system actually went wrong. What did the model do or fail to do, and why did that produce the wrong label?"
            placeholder="e.g. Risk features were split across the referral letter, blood results and prior notes; the model did not aggregate them and treated each in isolation."
          />
        )}
        {step === 5 && (
          <TextStep
            value={answers.consequence}
            onChange={(v) => update("consequence", v)}
            scenario={scenario}
            field="consequence"
            label="Clinical consequence"
            description="Describe the downstream impact on the patient. Think pathway: what gets delayed, and what happens because of the delay?"
            placeholder="e.g. Delay to specialist assessment, possible disease progression, delayed treatment and avoidable harm."
          />
        )}
        {step === 6 && (
          <ScaleStep
            kind="severity"
            value={answers.severity}
            onChange={(v) => update("severity", v)}
            evidence={answers.severityEvidence}
            onEvidenceChange={(v) => update("severityEvidence", v)}
          />
        )}
        {step === 7 && (
          <ScaleStep
            kind="likelihood"
            value={answers.likelihood}
            onChange={(v) => update("likelihood", v)}
            initialRisk={initialRisk}
            initialBand={initialBand}
            severity={answers.severity}
            evidence={answers.likelihoodEvidence}
            onEvidenceChange={(v) => update("likelihoodEvidence", v)}
          />
        )}
        {step === 8 && (
          <ControlsStep
            scenario={scenario}
            answers={answers}
            onChange={(field, v) => update(field, v)}
          />
        )}
        {step === 9 && (
          <ResidualStep
            scenario={scenario}
            answers={answers}
            initialRisk={initialRisk}
            initialBand={initialBand}
            residualRisk={residualRisk}
            residualBand={residualBand}
            adjustedSeverity={adjustedSeverity}
            onChange={(field, v) => update(field, v)}
          />
        )}
        {step === 10 && (
          <FeedbackStep
            scenario={scenario}
            answers={answers}
            initialRisk={initialRisk}
            initialBand={initialBand}
            residualRisk={residualRisk}
            residualBand={residualBand}
            onExport={handleExport}
            onReset={handleReset}
            exporting={exporting}
            exportError={exportError}
          />
        )}
      </div>

      {!isFinal && (
        <div className="flex items-center justify-between border-t border-navy-100 bg-white px-6 py-5 md:px-10">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="text-sm font-medium text-navy-600 transition-colors hover:text-navy-900 disabled:cursor-not-allowed disabled:text-navy-300"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            {!canAdvance && step > 1 && (
              <span className="hidden text-xs text-navy-500 sm:inline">
                {validationHint(step)}
              </span>
            )}
            <button
              type="button"
              disabled={!canAdvance}
              onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
              className="inline-flex items-center rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-navy-300"
            >
              {isFirst ? "Begin exercise" : step === 9 ? "Review answers" : "Next"}
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-navy-100 bg-navy-50/40 px-6 py-3 md:px-10">
        <p className="text-[11px] leading-relaxed text-navy-500">
          <span className="font-semibold text-navy-700">
            Educational simulation only.
          </span>{" "}
          Not a substitute for local clinical safety sign-off or
          organisational risk assessment.
        </p>
      </div>
    </div>
  );
}

function validationHint(step: number): string {
  switch (step) {
    case 2:
      return "Pick at least one classification, a system name, a safety requirement, and a benefit justification.";
    case 3:
    case 4:
    case 5:
      return "Please write at least one clear sentence.";
    case 6:
      return "Pick a severity score.";
    case 7:
      return "Pick a likelihood score.";
    case 8:
      return "Add at least one control, existing or proposed.";
    case 9:
      return "Score the residual risk and name an owner.";
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/* Progress indicator                                                  */
/* ------------------------------------------------------------------ */

function ProgressIndicator({ step }: { step: number }) {
  const pct = Math.round(((step - 1) / (STEPS.length - 1)) * 100);
  return (
    <div className="border-b border-navy-100 bg-white px-6 pt-4 md:px-10">
      <div className="mb-3 flex items-center justify-between text-[11px] font-medium text-navy-500">
        <span>Progress</span>
        <span>{pct}%</span>
      </div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-navy-100">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-clinical-600 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 hidden grid-cols-10 gap-1 pb-3 text-[10px] font-medium uppercase tracking-wider md:grid">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`truncate text-center ${
              s.id === step
                ? "text-clinical-700"
                : s.id < step
                ? "text-navy-700"
                : "text-navy-300"
            }`}
            title={s.name}
          >
            {String(s.id).padStart(2, "0")}
          </div>
        ))}
      </div>
      <div className="md:hidden pb-3" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step components                                                     */
/* ------------------------------------------------------------------ */

function BriefingStep({ scenario }: { scenario: Scenario }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
          Deployment
        </p>
        <p className="mt-3 text-base leading-relaxed text-navy-800 md:text-lg">
          {scenario.briefing.deployment}
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800">
          Safety event
        </p>
        <p className="mt-2 text-base leading-relaxed text-navy-800">
          {scenario.briefing.safetyEvent}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
          What you&apos;ll work through
        </p>
        <ul className="mt-3 space-y-2.5">
          {scenario.briefing.learningGoals.map((goal) => (
            <li key={goal} className="flex items-start gap-3">
              <CheckIcon className="mt-[7px]" />
              <span className="text-sm leading-relaxed text-navy-800 md:text-base">
                {goal}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ClassificationStep({
  answers,
  onChange,
}: {
  answers: Answers;
  onChange: <K extends keyof Answers>(field: K, v: Answers[K]) => void;
}) {
  const toggleClassification = (tag: string) => {
    const next = answers.hazardClassifications.includes(tag)
      ? answers.hazardClassifications.filter((t) => t !== tag)
      : [...answers.hazardClassifications, tag];
    onChange("hazardClassifications", next);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header>
          <h4 className="text-base font-semibold text-navy-950 md:text-lg">
            Hazard classification
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-navy-700">
            Pick every classification that applies. Most AI deployments touch
            more than one.
          </p>
        </header>
        <div className="flex flex-wrap gap-2">
          {HAZARD_CLASSIFICATION_TAGS.map((tag) => {
            const selected = answers.hazardClassifications.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleClassification(tag)}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "border-clinical-600 bg-clinical-50 text-clinical-800"
                    : "border-navy-200 bg-white text-navy-700 hover:border-clinical-300"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </section>

      <hr className="border-navy-100" />

      <section className="space-y-5">
        <header>
          <h4 className="text-base font-semibold text-navy-950 md:text-lg">
            Affected system or component
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-navy-700">
            Identify the deployed system the hazard relates to.
          </p>
        </header>
        <FieldShell label="System / module name">
          <input
            type="text"
            value={answers.systemName}
            onChange={(e) => onChange("systemName", e.target.value)}
            className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
            placeholder="e.g. Upper GI cancer referral triage tool"
          />
        </FieldShell>
        <div className="grid gap-5 md:grid-cols-2">
          <FieldShell
            label="Software version"
            hint="Optional. Useful when a model update changes safety behaviour."
          >
            <input
              type="text"
              value={answers.systemVersion}
              onChange={(e) => onChange("systemVersion", e.target.value)}
              className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
              placeholder="e.g. v2.3"
            />
          </FieldShell>
          <FieldShell
            label="Workflow step affected"
            hint="Optional. Where in the clinical pathway the hazard sits."
          >
            <input
              type="text"
              value={answers.workflowStep}
              onChange={(e) => onChange("workflowStep", e.target.value)}
              className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
              placeholder="e.g. Initial referral triage"
            />
          </FieldShell>
        </div>
      </section>

      <hr className="border-navy-100" />

      <section className="space-y-5">
        <header>
          <h4 className="text-base font-semibold text-navy-950 md:text-lg">
            Clinical safety requirement
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-navy-700">
            What must always be true for this deployment to be safe?
          </p>
        </header>
        <textarea
          value={answers.safetyRequirement}
          onChange={(e) => onChange("safetyRequirement", e.target.value)}
          rows={3}
          className="w-full rounded-md border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
          placeholder="e.g. Urgent referrals meeting defined red-flag criteria must not be downgraded without clinician review."
        />
      </section>

      <section className="space-y-5">
        <header>
          <h4 className="text-base font-semibold text-navy-950 md:text-lg">
            Benefit / benefit-risk justification
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-navy-700">
            What benefit justifies use despite residual risk?
          </p>
        </header>
        <textarea
          value={answers.benefitJustification}
          onChange={(e) => onChange("benefitJustification", e.target.value)}
          rows={3}
          className="w-full rounded-md border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
          placeholder="e.g. Faster triage of urgent referrals, reduced clinician backlog, earlier specialist assessment for high-risk patients."
        />
      </section>
    </div>
  );
}

function HazardStep({
  value,
  onChange,
  scenario,
}: {
  value: string;
  onChange: (v: string) => void;
  scenario: Scenario;
}) {
  const evalResult = evaluateTextStep(value, scenario.feedback.hazard);
  const showHint = !evalResult.tooShort && !!evalResult.liveHint;

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-base font-semibold text-navy-950 md:text-lg">
          What is the clinical hazard?
        </h4>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-700 md:text-base">
          A hazard is the patient-facing harm that could occur, not the
          mechanism by which the system goes wrong. Describe what could happen
          to the patient, in clinical terms.
        </p>
      </div>

      <Textarea
        value={value}
        onChange={onChange}
        placeholder="e.g. Delayed diagnosis of upper GI cancer because the AI assigned routine to a referral that should have been urgent."
        rows={4}
      />

      {showHint && (
        <InlineHint tone="warning">{evalResult.liveHint}</InlineHint>
      )}
      <CharCount value={value} min={12} />
    </div>
  );
}

function TextStep({
  value,
  onChange,
  scenario,
  field,
  label,
  description,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  scenario: Scenario;
  field: "cause" | "consequence";
  label: string;
  description: string;
  placeholder: string;
}) {
  const evalResult = evaluateTextStep(value, scenario.feedback[field]);
  const showHint = !evalResult.tooShort && !!evalResult.liveHint;
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-base font-semibold text-navy-950 md:text-lg">
          {label}
        </h4>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-700 md:text-base">
          {description}
        </p>
      </div>
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
      />
      {showHint && <InlineHint tone="info">{evalResult.liveHint}</InlineHint>}
      <CharCount value={value} min={12} />
    </div>
  );
}

function ScaleStep({
  kind,
  value,
  onChange,
  initialRisk,
  initialBand,
  severity,
  evidence,
  onEvidenceChange,
}: {
  kind: "severity" | "likelihood";
  value: number | null;
  onChange: (n: number) => void;
  initialRisk?: number | null;
  initialBand?: RiskBand | null;
  severity?: number | null;
  evidence: string[];
  onEvidenceChange: (tags: string[]) => void;
}) {
  const labels = kind === "severity" ? severityLabels : likelihoodLabels;
  const heading =
    kind === "severity"
      ? "How severe is the hazard if it occurs?"
      : "How likely is the hazard to occur?";
  const sub =
    kind === "severity"
      ? "Score the worst-credible patient outcome, not the most common one."
      : "Score across the population this AI tool will see in routine use.";

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-semibold text-navy-950 md:text-lg">
          {heading}
        </h4>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-700 md:text-base">
          {sub}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-all md:p-4 ${
                selected
                  ? "border-clinical-600 bg-clinical-50 ring-1 ring-clinical-600"
                  : "border-navy-100 bg-white hover:border-clinical-300 hover:bg-navy-50/60"
              }`}
            >
              <span
                className={`text-xl font-semibold md:text-2xl ${
                  selected ? "text-clinical-700" : "text-navy-900"
                }`}
              >
                {n}
              </span>
              <span
                className={`mt-1 text-[10px] font-medium uppercase tracking-wider md:text-[11px] ${
                  selected ? "text-clinical-700" : "text-navy-500"
                }`}
              >
                {labels[n]}
              </span>
            </button>
          );
        })}
      </div>

      <EvidenceBasisPicker
        value={evidence}
        onChange={onEvidenceChange}
        label="Evidence basis for this score"
      />

      {kind === "likelihood" &&
        severity != null &&
        value != null &&
        initialRisk != null &&
        initialBand && (
          <RiskBanner
            severity={severity}
            likelihood={value}
            initialRisk={initialRisk}
            band={initialBand}
          />
        )}
    </div>
  );
}

function EvidenceBasisPicker({
  value,
  onChange,
  label,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  label: string;
}) {
  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };
  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50/30 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clinical-700">
        {label}
      </p>
      <p className="mt-1.5 text-xs text-navy-600">
        Pick every evidence type that supports this score. Selecting only
        Assumption flags the score for governance review.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {EVIDENCE_BASIS_TAGS.map((tag) => {
          const selected = value.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                selected
                  ? "border-clinical-600 bg-clinical-50 text-clinical-800"
                  : "border-navy-200 bg-white text-navy-700 hover:border-clinical-300"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RiskBanner({
  severity,
  likelihood,
  initialRisk,
  band,
  label = "Initial risk score",
}: {
  severity: number;
  likelihood: number;
  initialRisk: number;
  band: RiskBand;
  label?: string;
}) {
  const styles = bandStyles[band];
  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy-950">
            {severity} <span className="text-navy-300">×</span> {likelihood}{" "}
            <span className="text-navy-300">=</span>{" "}
            <span className="text-clinical-700">{initialRisk}</span>
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${styles.chip}`}
        >
          {band}
        </span>
      </div>
    </div>
  );
}

function ControlsStep({
  scenario,
  answers,
  onChange,
}: {
  scenario: Scenario;
  answers: Answers;
  onChange: <K extends keyof Answers>(field: K, v: Answers[K]) => void;
}) {
  return (
    <div className="space-y-9">
      <div>
        <h4 className="text-base font-semibold text-navy-950 md:text-lg">
          Existing and proposed controls
        </h4>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-700 md:text-base">
          One control per line. Separate what is already in place from what
          you propose to add. Each is grouped by purpose: prevent, detect,
          or correct.
        </p>
        <p className="mt-2 text-xs text-navy-500">
          Existing entries default to Implemented and Verified. Proposed
          entries default to Planned and Not verified.
        </p>
      </div>

      <section className="space-y-5">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clinical-700">
            Existing controls
          </p>
          <p className="mt-1 text-xs text-navy-600">
            Already in place and operational.
          </p>
        </header>
        <ControlField
          label="Preventative (existing)"
          hint="Stops the hazard occurring."
          value={answers.existingPreventative}
          onChange={(v) => onChange("existingPreventative", v)}
        />
        <ControlField
          label="Detective (existing)"
          hint="Spots the hazard after it occurs."
          value={answers.existingDetective}
          onChange={(v) => onChange("existingDetective", v)}
        />
        <ControlField
          label="Corrective (existing)"
          hint="Limits harm and feeds learning back."
          value={answers.existingCorrective}
          onChange={(v) => onChange("existingCorrective", v)}
        />
      </section>

      <hr className="border-navy-100" />

      <section className="space-y-5">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clinical-700">
            Proposed additional controls
          </p>
          <p className="mt-1 text-xs text-navy-600">
            New controls required to bring residual risk to an acceptable
            level.
          </p>
        </header>
        <ControlField
          label="Preventative (proposed)"
          hint="e.g. mandatory clinician review before downgrade."
          value={answers.proposedPreventative}
          onChange={(v) => onChange("proposedPreventative", v)}
        />
        <ControlField
          label="Detective (proposed)"
          hint="e.g. quarterly audit of routine-ranked cases."
          value={answers.proposedDetective}
          onChange={(v) => onChange("proposedDetective", v)}
        />
        <ControlField
          label="Corrective (proposed)"
          hint="e.g. clinician override pathway, incident reporting route."
          value={answers.proposedCorrective}
          onChange={(v) => onChange("proposedCorrective", v)}
        />
      </section>

      <MissingEssentialsPanel scenario={scenario} answers={answers} />
      <ScenarioControlsPanel scenario={scenario} answers={answers} />
    </div>
  );
}

/**
 * Phase 4A — live scenario-aware control expectations panel. Mirrors the
 * MissingEssentialsPanel pattern but reads `scenarioExpectations.expectedControls`
 * instead of `essentialControls`. Both panels co-exist during the bedding-in
 * period; once the migration is verified end-to-end, essentialControls can be
 * removed and this panel can stand alone.
 *
 * Hidden when:
 *   - the scenario doesn't declare scenarioExpectations.expectedControls
 *   - the user hasn't typed anything in any of the six control textareas yet
 *   - every expected control is covered (no findings of kind
 *     "missing-expected-control")
 */
function ScenarioControlsPanel({
  scenario,
  answers,
}: {
  scenario: Scenario;
  answers: Answers;
}) {
  const userHasTypedAnything = useMemo(
    () =>
      [
        answers.existingPreventative,
        answers.existingDetective,
        answers.existingCorrective,
        answers.proposedPreventative,
        answers.proposedDetective,
        answers.proposedCorrective,
      ].some((s) => s.trim().length > 0),
    [
      answers.existingPreventative,
      answers.existingDetective,
      answers.existingCorrective,
      answers.proposedPreventative,
      answers.proposedDetective,
      answers.proposedCorrective,
    ],
  );

  const findings = useMemo(() => {
    const preventative = [
      ...splitLines(answers.existingPreventative),
      ...splitLines(answers.proposedPreventative),
    ];
    const detective = [
      ...splitLines(answers.existingDetective),
      ...splitLines(answers.proposedDetective),
    ];
    const corrective = [
      ...splitLines(answers.existingCorrective),
      ...splitLines(answers.proposedCorrective),
    ];
    const result = evaluateScenarioExpectations({
      scenario,
      preventativeControls: preventative,
      detectiveControls: detective,
      correctiveControls: corrective,
      // Pass empty Step 9 inputs so this panel only ever surfaces control
      // findings — Step 9-related scenario expectations are rendered by the
      // ResidualStep panel, not here.
      monitoringMetric: "",
      triggerThreshold: "",
      reviewFrequency: "",
      owner: "",
    }).filter((f) => f.kind === "missing-expected-control");
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      // eslint-disable-next-line no-console
      console.debug("[hazard-log/scenario-controls-panel]", {
        preventative,
        detective,
        corrective,
        missing: result.map((f) => `${f.controlType}/${f.label}`),
      });
    }
    return result;
  }, [
    scenario,
    answers.existingPreventative,
    answers.existingDetective,
    answers.existingCorrective,
    answers.proposedPreventative,
    answers.proposedDetective,
    answers.proposedCorrective,
  ]);

  if (!scenario.scenarioExpectations?.expectedControls) return null;
  if (!userHasTypedAnything) return null;
  if (findings.length === 0) return null;

  const grouped: Record<
    "preventative" | "detective" | "corrective",
    ScenarioExpectationFinding[]
  > = {
    preventative: findings.filter((f) => f.controlType === "preventative"),
    detective: findings.filter((f) => f.controlType === "detective"),
    corrective: findings.filter((f) => f.controlType === "corrective"),
  };

  const sections: Array<{
    key: "preventative" | "detective" | "corrective";
    title: string;
  }> = [
    { key: "preventative", title: "Scenario expects (preventative)" },
    { key: "detective", title: "Scenario expects (detective)" },
    { key: "corrective", title: "Scenario expects (corrective)" },
  ];

  // Scenario-specific missing controls always indicate the entry is not
  // shippable — wired through the unified status system at "not-ready".
  const status = statusFor("not-ready");
  return (
    <div className={status.classes.panel}>
      <div className="flex items-center gap-2">
        <Badge variant="critical" />
        <h5 className={status.classes.panelHeading}>
          Scenario-specific controls are missing
        </h5>
      </div>
      <p className={status.classes.panelSubtle}>
        These items are expected by this scenario&apos;s safety case. Add a
        matching control above (in the correct category) to clear the finding.
      </p>
      <div className="mt-4 space-y-4">
        {sections.map((s) => {
          const items = grouped[s.key];
          if (items.length === 0) return null;
          return (
            <div key={s.key}>
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${status.classes.rowTitleAccent}`}
              >
                {s.title}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {items.map((f) => (
                  <li
                    key={`scenario-${s.key}-${f.label}`}
                    className={`rounded-md border bg-white/60 px-3 py-2 text-[12px] leading-relaxed ${status.borderColor} ${status.classes.rowText}`}
                  >
                    <span className="font-semibold">&ldquo;{f.label}&rdquo;</span>
                    <p
                      className={`mt-1 text-[11px] ${status.classes.rowText}`}
                    >
                      {f.message}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Live, scenario-driven minimum-bar panel. Re-runs the same engine that
 * runValidation uses, so what the user sees here is exactly what the PDF
 * will show under "Critical warnings" on Page 1. Hidden when (a) the
 * scenario doesn't declare essentialControls, or (b) the user has not
 * entered any controls yet (suppressed by the engine itself), or
 * (c) every essential is covered.
 */
function MissingEssentialsPanel({
  scenario,
  answers,
}: {
  scenario: Scenario;
  answers: Answers;
}) {
  // Suppression is now based on the RAW answer strings, not on the
  // post-splitLines arrays. Previously the engine itself suppressed when
  // every parsed array was empty - that was the Phase-2.2 bug (the panel
  // never rendered live on Step 8). With raw-string suppression the panel
  // appears the moment the user types ANY non-whitespace character into
  // ANY of the six control textareas.
  const userHasTypedAnything = useMemo(
    () =>
      [
        answers.existingPreventative,
        answers.existingDetective,
        answers.existingCorrective,
        answers.proposedPreventative,
        answers.proposedDetective,
        answers.proposedCorrective,
      ].some((s) => s.trim().length > 0),
    [
      answers.existingPreventative,
      answers.existingDetective,
      answers.existingCorrective,
      answers.proposedPreventative,
      answers.proposedDetective,
      answers.proposedCorrective,
    ],
  );

  const findings = useMemo(() => {
    const preventative = [
      ...splitLines(answers.existingPreventative),
      ...splitLines(answers.proposedPreventative),
    ];
    const detective = [
      ...splitLines(answers.existingDetective),
      ...splitLines(answers.proposedDetective),
    ];
    const corrective = [
      ...splitLines(answers.existingCorrective),
      ...splitLines(answers.proposedCorrective),
    ];
    const result = evaluateMissingEssentials({
      scenario,
      preventativeControls: preventative,
      detectiveControls: detective,
      correctiveControls: corrective,
    });
    if (
      typeof window !== "undefined" &&
      process.env.NODE_ENV !== "production"
    ) {
      // eslint-disable-next-line no-console
      console.debug("[hazard-log/missing-essentials-panel]", {
        preventative,
        detective,
        corrective,
        missing: result.map((f) => `${f.type}/${f.label}`),
      });
    }
    return result;
  }, [
    scenario,
    answers.existingPreventative,
    answers.existingDetective,
    answers.existingCorrective,
    answers.proposedPreventative,
    answers.proposedDetective,
    answers.proposedCorrective,
  ]);

  // Hidden cases:
  //   - scenario doesn't declare essentialControls (panel is irrelevant)
  //   - user has not typed anything yet (don't yell at an empty form)
  if (!scenario.essentialControls) return null;
  if (!userHasTypedAnything) return null;

  // Positive-confirmation case: user has typed something, all essentials
  // are covered. Render a calm green confirmation so the engine's run is
  // visible (and the user knows they cleared the bar).
  if (findings.length === 0) {
    const ready = statusFor("ready");
    return (
      <div className={ready.classes.panel.replace(" p-5", " p-4")}>
        <div className="flex items-center gap-2">
          <Badge variant="ready" label="Covered" />
          <p className={ready.classes.panelHeading}>
            All essential controls for this scenario are present.
          </p>
        </div>
      </div>
    );
  }

  const grouped: Record<"preventative" | "detective" | "corrective", typeof findings> = {
    preventative: findings.filter((f) => f.type === "preventative"),
    detective: findings.filter((f) => f.type === "detective"),
    corrective: findings.filter((f) => f.type === "corrective"),
  };

  const sections: Array<{
    key: "preventative" | "detective" | "corrective";
    title: string;
  }> = [
    { key: "preventative", title: "Preventative essentials missing" },
    { key: "detective", title: "Detective essentials missing" },
    { key: "corrective", title: "Corrective essentials missing" },
  ];

  // Missing essentials are always not-ready. Wired through the unified
  // status system so this panel reads visually identically with the rest of
  // the critical-tier UI.
  const status = statusFor("not-ready");
  return (
    <div className={status.classes.panel}>
      <div className="flex items-center gap-2">
        <Badge variant="critical" />
        <h5 className={status.classes.panelHeading}>
          Essential controls for this scenario are missing
        </h5>
      </div>
      <p className={status.classes.panelSubtle}>
        Each item below is a barrier this scenario cannot ship safely without.
        Add a matching control above (in the correct category) to clear the
        finding.
      </p>
      <div className="mt-4 space-y-4">
        {sections.map((s) => {
          const items = grouped[s.key];
          if (items.length === 0) return null;
          return (
            <div key={s.key}>
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${status.classes.rowTitleAccent}`}
              >
                {s.title}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {items.map((f) => (
                  <li
                    key={`${s.key}-${f.label}`}
                    className={`rounded-md border bg-white/60 px-3 py-2 text-[12px] leading-relaxed ${status.borderColor} ${status.classes.rowText}`}
                  >
                    <span className="font-semibold">&ldquo;{f.label}&rdquo;</span>
                    <p
                      className={`mt-1 text-[11px] ${status.classes.rowText}`}
                    >
                      {f.message}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ControlField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  // Live per-line Control Quality Engine feedback. Re-runs every keystroke so
  // the chip beneath the textarea updates as the user rewrites a vague or
  // non-control entry. Identical wording to what the PDF will surface, since
  // both surfaces consume the same engine in validation.ts.
  const issues = useMemo(() => {
    const lines = value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    return evaluateControlQuality(lines);
  }, [value]);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-navy-900">{label}</label>
        <span className="text-[11px] text-navy-500">one per line</span>
      </div>
      <p className="mt-1 text-xs text-navy-600">{hint}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
        placeholder="One control per line"
      />
      {issues.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {issues.map((issue, i) => {
            // Non-control entries are not-ready (they aren't a barrier at
            // all). Vague entries are review-required (they could be made
            // auditable with a rewrite). Both rendered through the unified
            // Badge component so they sit at the same height / typography
            // as every other badge in the simulator.
            const isNonControl = issue.level === "non-control";
            const issueStatus = statusFor(isNonControl ? "not-ready" : "review");
            const chipClass = issueStatus.classes.rowChip;
            return (
              <li
                key={`${issue.level}-${i}-${issue.text}`}
                className={chipClass}
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={isNonControl ? "critical" : "warning"}
                    label={isNonControl ? "Not a control" : "Vague control"}
                  />
                  <span className="font-semibold">&ldquo;{issue.text}&rdquo;</span>
                </div>
                <p className="mt-1">{issue.message}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ResidualStep({
  scenario,
  answers,
  initialRisk,
  initialBand,
  residualRisk,
  residualBand,
  adjustedSeverity,
  onChange,
}: {
  scenario: Scenario;
  answers: Answers;
  initialRisk: number | null;
  initialBand: RiskBand | null;
  residualRisk: number | null;
  residualBand: RiskBand | null;
  /**
   * Governance-adjusted severity from the parent's runValidation output.
   * Used by the Phase 4B Logical Consistency engine to compare against
   * ownership wording (a high-severity hazard demands a clinical owner
   * regardless of what the user typed in Step 6, so this needs the
   * adjusted value, not answers.severity).
   */
  adjustedSeverity: number;
  onChange: <K extends keyof Answers>(field: K, v: Answers[K]) => void;
}) {
  // Live Governance & Monitoring Engine output. Re-runs every keystroke so
  // the per-field chips and missing-chain banner update as the user edits
  // KPI / threshold / cadence / owner. Wording is identical to what the PDF
  // surfaces because both consume the same engine in validation.ts.
  const governanceIssues = useMemo(
    () =>
      evaluateGovernanceQuality({
        monitoringMetric: answers.monitoringMetric,
        triggerThreshold: answers.triggerThreshold,
        reviewFrequency: answers.reviewFrequency,
        owner: answers.owner,
      }),
    [
      answers.monitoringMetric,
      answers.triggerThreshold,
      answers.reviewFrequency,
      answers.owner,
    ],
  );
  const issuesByField = useMemo(
    () => ({
      "monitoring-metric": governanceIssues.filter(
        (i) => i.field === "monitoring-metric",
      ),
      "trigger-threshold": governanceIssues.filter(
        (i) => i.field === "trigger-threshold",
      ),
      "review-cadence": governanceIssues.filter(
        (i) => i.field === "review-cadence",
      ),
      owner: governanceIssues.filter((i) => i.field === "owner"),
    }),
    [governanceIssues],
  );

  // Phase 4A scenario-aware findings for Step 9 inputs. We pass empty
  // control arrays so this engine call ONLY surfaces monitoring +
  // accountability findings — the Step 8 panel handles control findings.
  const scenarioFindings = useMemo(
    () =>
      evaluateScenarioExpectations({
        scenario,
        preventativeControls: [],
        detectiveControls: [],
        correctiveControls: [],
        monitoringMetric: answers.monitoringMetric,
        triggerThreshold: answers.triggerThreshold,
        reviewFrequency: answers.reviewFrequency,
        owner: answers.owner,
      }),
    [
      scenario,
      answers.monitoringMetric,
      answers.triggerThreshold,
      answers.reviewFrequency,
      answers.owner,
    ],
  );
  const scenarioFindingsByField = useMemo(
    () => ({
      "monitoring-metric": scenarioFindings.filter(
        (f) => f.kind === "missing-expected-kpi",
      ),
      "trigger-threshold": scenarioFindings.filter(
        (f) => f.kind === "missing-expected-trigger-threshold",
      ),
      "review-cadence": scenarioFindings.filter(
        (f) => f.kind === "missing-expected-review-cadence",
      ),
      owner: scenarioFindings.filter(
        (f) => f.kind === "missing-required-role",
      ),
    }),
    [scenarioFindings],
  );

  // Phase 4B Logical Consistency findings. Re-runs the same engine that
  // runValidation uses, so the panel wording is identical to the PDF.
  // Pulls all live Step 8 + Step 9 inputs plus the parent's adjusted
  // severity (the consistency engine compares ownership against the
  // governance-correct severity, not the user-typed value, so an under-
  // scored hazard still flags generic ownership). Empty when no
  // inconsistencies are present.
  const consistencyFindings = useMemo(
    () =>
      evaluateLogicalConsistency({
        preventativeControls: [
          ...splitLines(answers.existingPreventative),
          ...splitLines(answers.proposedPreventative),
        ],
        detectiveControls: [
          ...splitLines(answers.existingDetective),
          ...splitLines(answers.proposedDetective),
        ],
        correctiveControls: [
          ...splitLines(answers.existingCorrective),
          ...splitLines(answers.proposedCorrective),
        ],
        residualSeverity: answers.residualSeverity ?? 0,
        residualLikelihood: answers.residualLikelihood ?? 0,
        residualRationale: answers.residualRationale,
        monitoringMetric: answers.monitoringMetric,
        triggerThreshold: answers.triggerThreshold,
        capa: answers.capa,
        owner: answers.owner,
        adjustedSeverity,
      }),
    [
      answers.existingPreventative,
      answers.existingDetective,
      answers.existingCorrective,
      answers.proposedPreventative,
      answers.proposedDetective,
      answers.proposedCorrective,
      answers.residualSeverity,
      answers.residualLikelihood,
      answers.residualRationale,
      answers.monitoringMetric,
      answers.triggerThreshold,
      answers.capa,
      answers.owner,
      adjustedSeverity,
    ],
  );

  return (
    <div className="space-y-9">
      {/* Section A: residual scoring */}
      <section className="space-y-5">
        <header>
          <h4 className="text-base font-semibold text-navy-950 md:text-lg">
            Residual risk after controls
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-navy-700">
            Re-score the hazard assuming your controls are in place. Severity
            usually does not move. Controls reduce <em>likelihood</em>.
          </p>
        </header>

        {initialRisk != null && initialBand && (
          <div className="rounded-lg border border-navy-100 bg-navy-50/40 px-4 py-3 text-sm text-navy-700">
            Initial risk:{" "}
            <span className="font-semibold text-navy-950">{initialRisk}</span> ·{" "}
            <span className="font-semibold text-navy-950">{initialBand}</span>
          </div>
        )}

        <FieldShell label="Residual severity">
          <CompactScale
            value={answers.residualSeverity}
            onChange={(n) => onChange("residualSeverity", n)}
            labels={severityLabels}
          />
        </FieldShell>

        <FieldShell label="Residual likelihood">
          <CompactScale
            value={answers.residualLikelihood}
            onChange={(n) => onChange("residualLikelihood", n)}
            labels={likelihoodLabels}
          />
        </FieldShell>

        {residualRisk != null && residualBand && (
          <RiskBanner
            severity={answers.residualSeverity ?? 0}
            likelihood={answers.residualLikelihood ?? 0}
            initialRisk={residualRisk}
            band={residualBand}
            label="Residual risk after controls"
          />
        )}

        <FieldShell
          label="Residual rationale"
          hint="Why this position? What your controls reduce, and what they don't."
        >
          <textarea
            value={answers.residualRationale}
            onChange={(e) => onChange("residualRationale", e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
            placeholder="e.g. Severity unchanged, missed cancer is still catastrophic. Likelihood reduced by mandatory human review and explicit red-flag escalation, not removed."
          />
        </FieldShell>
      </section>

      <hr className="border-navy-100" />

      {/* Section B: monitoring and governance */}
      <section className="space-y-5">
        <header>
          <h4 className="text-base font-semibold text-navy-950 md:text-lg">
            Monitoring and governance
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-navy-700">
            How will you know if the hazard is occurring, what triggers
            escalation, and how often this entry is reviewed?
          </p>
        </header>

        <FieldShell
          label="Monitoring metric / KPI"
                hint="What you measure on an ongoing basis."
        >
          <input
            value={answers.monitoringMetric}
            onChange={(e) => onChange("monitoringMetric", e.target.value)}
            type="text"
            className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
            placeholder="e.g. False-negative rate on routine-ranked cases (audit sample)."
          />
          <GovernanceIssueChips issues={issuesByField["monitoring-metric"]} />
          <ScenarioExpectationChips
            findings={scenarioFindingsByField["monitoring-metric"]}
          />
        </FieldShell>

        <FieldShell
          label="Trigger threshold"
          hint="The point at which the metric forces action."
        >
          <input
            value={answers.triggerThreshold}
            onChange={(e) => onChange("triggerThreshold", e.target.value)}
            type="text"
            className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
            placeholder="e.g. Any confirmed delayed cancer diagnosis where AI assigned routine, or false-negative rate above 1%."
          />
          <GovernanceIssueChips issues={issuesByField["trigger-threshold"]} />
          <ScenarioExpectationChips
            findings={scenarioFindingsByField["trigger-threshold"]}
          />
        </FieldShell>

        <FieldShell
          label="Review frequency"
          hint="How often this hazard log entry is formally reviewed."
        >
          <input
            value={answers.reviewFrequency}
            onChange={(e) => onChange("reviewFrequency", e.target.value)}
            type="text"
            className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
            placeholder="e.g. Quarterly, or sooner if trigger fires."
          />
          <GovernanceIssueChips issues={issuesByField["review-cadence"]} />
          <ScenarioExpectationChips
            findings={scenarioFindingsByField["review-cadence"]}
          />
        </FieldShell>

        <FieldShell
          label="Actions required / CAPA"
          hint="What happens if the trigger threshold is breached."
        >
          <textarea
            value={answers.capa}
            onChange={(e) => onChange("capa", e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
            placeholder="e.g. Pause AI tool for routine triage, notify clinical leadership, full audit of routine-ranked cases over the prior period, supplier engagement, post-event review."
          />
        </FieldShell>
      </section>

      <hr className="border-navy-100" />

      <section className="space-y-5">
        <header>
          <h4 className="text-base font-semibold text-navy-950 md:text-lg">
            Stakeholders and assumptions
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-navy-700">
            Optional but recommended for board-level review.
          </p>
        </header>

        <FieldShell
          label="Stakeholders / impacted users"
          hint="Who is affected, and who needs to be consulted on changes?"
        >
          <input
            type="text"
            value={answers.stakeholders}
            onChange={(e) => onChange("stakeholders", e.target.value)}
            className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
            placeholder="e.g. GPs, secondary care triage clinicians, cancer pathway team, patients."
          />
        </FieldShell>

        <FieldShell
          label="Assumptions and limitations"
          hint="Optional. Note any assumptions the safety case relies on."
        >
          <textarea
            value={answers.assumptions}
            onChange={(e) => onChange("assumptions", e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
            placeholder="e.g. Audit sample is representative of routine-ranked volume. Override pathway reaches the supplier within 24 hours."
          />
        </FieldShell>
      </section>

      <hr className="border-navy-100" />

      <section className="space-y-5">
        <header>
          <h4 className="text-base font-semibold text-navy-950 md:text-lg">
            Ownership
          </h4>
          <p className="mt-1 text-sm leading-relaxed text-navy-700">
            Clinical accountability is required. Suggested combination:
            Clinical Safety Officer, pathway clinical lead, and product or
            AI owner.
          </p>
        </header>

        <FieldShell
          label="Owner / responsible team"
          hint="Name a clinical owner. Entries that read as IT only will be flagged on review."
        >
          <input
            value={answers.owner}
            onChange={(e) => onChange("owner", e.target.value)}
            type="text"
            className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
            placeholder="e.g. Clinical Safety Officer, supported by cancer pathway clinical lead and AI product owner."
          />
          <GovernanceIssueChips issues={issuesByField.owner} />
          <ScenarioExpectationChips
            findings={scenarioFindingsByField.owner}
          />
        </FieldShell>
      </section>

      {/* Phase 4B — Logical Consistency findings panel. Cross-field
          contradictions across the user's risk argument as a whole. Hidden
          when no inconsistencies are present. */}
      <ConsistencyFindingsPanel findings={consistencyFindings} />
    </div>
  );
}

/**
 * Phase 4B — live Logical Consistency findings panel. Renders one card per
 * cross-field contradiction surfaced by `evaluateLogicalConsistency`. Critical
 * findings use rose styling (matching Phase 3 critical chips and the Step 8
 * scenario-controls panel). Warning findings use amber styling. Hidden when
 * the array is empty so the panel does not appear on a clean draft.
 *
 * The wording is identical to what the PDF surfaces because both consume
 * `evaluateLogicalConsistency` — any wording change is made once, in
 * validation.ts, and propagates everywhere.
 */
function ConsistencyFindingsPanel({
  findings,
}: {
  findings: ConsistencyFinding[];
}) {
  if (findings.length === 0) return null;
  const criticals = findings.filter((f) => f.level === "critical");
  const warnings = findings.filter((f) => f.level === "warning");
  // Phase 5A — header status reflects the worst level present. Critical
  // consistency findings are not-ready; warning-only is review-required.
  // The badge variants (critical / warning) match the user-facing severity
  // vocabulary; colours come from the status system.
  const headerStatus = statusFor(criticals.length > 0 ? "not-ready" : "review");
  const headerVariant: "critical" | "warning" =
    criticals.length > 0 ? "critical" : "warning";

  return (
    <div className={headerStatus.classes.panel}>
      <div className="flex items-center gap-2">
        <Badge variant={headerVariant} />
        <h5 className={headerStatus.classes.panelHeading}>
          Consistency findings across this risk argument
        </h5>
      </div>
      <p className={headerStatus.classes.panelSubtle}>
        These items flag where parts of the entry contradict each other or
        where reasoning across the answers is weak. Resolve them so the
        argument holds together end-to-end.
      </p>
      <ul className="mt-4 space-y-2">
        {findings.map((finding, i) => {
          const itemStatus = statusFor(
            finding.level === "critical" ? "not-ready" : "review",
          );
          const itemVariant: "critical" | "warning" =
            finding.level === "critical" ? "critical" : "warning";
          // Per-finding chip uses the row-on-white pattern (white/60 surface
          // inside the panel) rather than the standalone rowChip variant —
          // matches existing in-panel finding-row pattern across the
          // simulator.
          const itemClass = `rounded-md border bg-white/60 px-3 py-2 text-[12px] leading-relaxed ${itemStatus.borderColor} ${itemStatus.classes.rowText}`;
          return (
            <li
              key={`consistency-${finding.kind}-${i}`}
              className={itemClass}
            >
              <div className="flex items-center gap-2">
                <Badge variant={itemVariant} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                  {consistencyFindingTitle(finding.kind)}
                </span>
              </div>
              <p className="mt-1 text-[12px]">{finding.message}</p>
            </li>
          );
        })}
      </ul>
      {/* Footer summary helps a reviewer scanning the panel see the count
          breakdown without re-counting items. Wording uses the original
          "critical / warning" terms because the count maps directly to
          ConsistencyFinding.level — the user-facing chips above already
          translate those into the unified status vocabulary. */}
      {(criticals.length > 0 && warnings.length > 0) && (
        <p className="mt-3 text-[11px] text-navy-700">
          {criticals.length} critical · {warnings.length} warning
        </p>
      )}
    </div>
  );
}

/**
 * Short uppercase title for each consistency finding kind, surfaced as the
 * row badge so reviewers can identify the failure class at a glance without
 * reading the full sentence. Wording mirrors the engine kind in
 * validation.ts.
 */
function consistencyFindingTitle(kind: ConsistencyFinding["kind"]): string {
  switch (kind) {
    case "controls-residual-mismatch":
      return "Controls vs residual";
    case "weak-controls-low-residual":
      return "Residual under-rated";
    case "elimination-wording-mismatch":
      return "Elimination wording";
    case "elimination-score-mismatch":
      return "Elimination score";
    case "kpi-threshold-mismatch":
      return "KPI vs threshold";
    case "capa-severity-mismatch":
      return "CAPA vs trigger";
    case "ownership-severity-mismatch":
      return "Ownership vs severity";
  }
}

/**
 * Renders the live Governance & Monitoring Engine chips beneath a Step 9
 * input. Critical-level issues use rose styling (matching the non-control
 * chip in Step 8). Warning-level issues use amber styling (matching the
 * vague-control chip). Renders nothing when the array is empty.
 *
 * The chip wording is identical to what the PDF surfaces because both
 * surfaces consume the same engine output - any wording change is made
 * once, in validation.ts, and propagates everywhere.
 */
/**
 * Phase 4A scenario-aware chips. Renders one chip per finding beneath the
 * matching Step 9 input (KPI / threshold / cadence / owner). Critical-level
 * findings use rose styling (matching the Phase 3 critical chips and the
 * Step 8 missing-expected-control panel). Improvement-level findings use
 * amber styling. Renders nothing when the array is empty.
 *
 * The chip wording is identical to what the PDF surfaces because both
 * surfaces consume `evaluateScenarioExpectations` — any wording change is
 * made once, in validation.ts, and propagates everywhere.
 */
function ScenarioExpectationChips({
  findings,
}: {
  findings: ScenarioExpectationFinding[];
}) {
  if (findings.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1.5">
      {findings.map((finding, i) => {
        // Critical scenario expectations are not-ready (the scenario cannot
        // ship safely without them). Improvements are review-required (the
        // scenario suggests them but they're not deployment-blocking).
        // Badge label is "Scenario expects / suggests" — context-specific
        // wording overrides the variant default; colour follows the variant.
        const isCritical = finding.level === "critical";
        const status = statusFor(isCritical ? "not-ready" : "review");
        const chipClass = status.classes.rowChip;
        return (
          <li
            key={`${finding.kind}-${i}-${finding.label}`}
            className={chipClass}
          >
            <div className="flex items-center gap-2">
              <Badge
                variant={isCritical ? "critical" : "warning"}
                label={isCritical ? "Scenario expects" : "Scenario suggests"}
              />
              <span className="font-semibold">&ldquo;{finding.label}&rdquo;</span>
            </div>
            <p className="mt-1">{finding.message}</p>
          </li>
        );
      })}
    </ul>
  );
}

function GovernanceIssueChips({ issues }: { issues: GovernanceQualityIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1.5">
      {issues.map((issue, i) => {
        // Critical governance issues (weak trigger / weak owner / missing
        // clinical chain) are not-ready. Warnings (vague KPI / cadence) are
        // review-required. Both wired through the unified Badge component.
        const isCritical = issue.level === "critical";
        const status = statusFor(isCritical ? "not-ready" : "review");
        const chipClass = status.classes.rowChip;
        // The "missing-clinical-chain" finding has no offending phrase to
        // quote (the problem is the absence of a role), so we just render
        // the message body without a quoted snippet.
        const showQuoted = issue.kind !== "missing-clinical-chain";
        return (
          <li
            key={`${issue.kind}-${i}-${issue.text}`}
            className={chipClass}
          >
            <div className="flex items-center gap-2">
              <Badge variant={isCritical ? "critical" : "warning"} />
              {showQuoted ? (
                <span className="font-semibold">&ldquo;{issue.text}&rdquo;</span>
              ) : (
                <span className="font-semibold">Clinical accountability</span>
              )}
            </div>
            <p className="mt-1">{issue.message}</p>
            {issue.kind === "missing-clinical-chain" ? (
              <p className={`mt-1 text-[10px] ${status.classes.rowTitleAccent}`}>
                Add a Clinical Safety Officer, clinical lead, pathway lead, or
                named consultant.
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function CompactScale({
  value,
  onChange,
  labels,
}: {
  value: number | null;
  onChange: (n: number) => void;
  labels: Record<number, string>;
}) {
  return (
    <div className="mt-2 grid grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex flex-col items-center justify-center rounded-md border p-2 text-center transition-all ${
              selected
                ? "border-clinical-600 bg-clinical-50 ring-1 ring-clinical-600"
                : "border-navy-100 bg-white hover:border-clinical-300 hover:bg-navy-50/60"
            }`}
          >
            <span className={`text-lg font-semibold ${selected ? "text-clinical-700" : "text-navy-900"}`}>
              {n}
            </span>
            <span className={`mt-0.5 text-[10px] font-medium uppercase tracking-wider ${selected ? "text-clinical-700" : "text-navy-500"}`}>
              {labels[n]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FeedbackStep({
  scenario,
  answers,
  initialRisk,
  initialBand,
  residualRisk,
  residualBand,
  onExport,
  onReset,
  exporting,
  exportError,
}: {
  scenario: Scenario;
  answers: Answers;
  initialRisk: number | null;
  initialBand: RiskBand | null;
  residualRisk: number | null;
  residualBand: RiskBand | null;
  onExport: () => void;
  onReset: () => void;
  exporting: boolean;
  exportError: string | null;
}) {
  const hazardEval = evaluateTextStep(answers.hazard, scenario.feedback.hazard);
  const causeEval = evaluateTextStep(answers.cause, scenario.feedback.cause);
  const consequenceEval = evaluateTextStep(answers.consequence, scenario.feedback.consequence);
  const severityResult = evaluateScore(answers.severity ?? 0, scenario.feedback.severity);
  const likelihoodResult = evaluateScore(answers.likelihood ?? 0, scenario.feedback.likelihood);
  const allPreventative = [
    ...splitLines(answers.existingPreventative),
    ...splitLines(answers.proposedPreventative),
  ];
  const allDetective = [
    ...splitLines(answers.existingDetective),
    ...splitLines(answers.proposedDetective),
  ];
  const allCorrective = [
    ...splitLines(answers.existingCorrective),
    ...splitLines(answers.proposedCorrective),
  ];
  const preventativeEval = evaluateControls(allPreventative, scenario.feedback.controls.preventative);
  const detectiveEval = evaluateControls(allDetective, scenario.feedback.controls.detective);
  const correctiveEval = evaluateControls(allCorrective, scenario.feedback.controls.corrective);

  return (
    <div className="space-y-12">
      <section>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
          Reference answer
        </p>
        <h4 className="mt-2 text-xl font-semibold text-navy-950 md:text-2xl">
          How your hazard log compares.
        </h4>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-700">
          The reference is one defensible answer, not the only answer. Your framing may differ, what matters is whether the right concepts are present.
        </p>
      </section>

      <ComparisonCard
        title="Hazard"
        userValue={answers.hazard}
        referenceValue={scenario.reference.hazard}
        matched={hazardEval.matched}
        missed={hazardEval.missed}
        extraNote={hazardEval.describesFailureMode ? scenario.feedback.hazard.failureModeHint : null}
      />
      <ComparisonCard
        title="Cause / failure mechanism"
        userValue={answers.cause}
        referenceValue={scenario.reference.cause}
        matched={causeEval.matched}
        missed={causeEval.missed}
      />
      <ComparisonCard
        title="Clinical consequence"
        userValue={answers.consequence}
        referenceValue={scenario.reference.consequence}
        matched={consequenceEval.matched}
        missed={consequenceEval.missed}
      />

      <ScoreComparisonCard
        title="Severity"
        userValue={answers.severity}
        referenceValue={scenario.feedback.severity.expected}
        result={severityResult}
        labels={severityLabels}
        rationale={scenario.feedback.severity.rationale}
      />
      <ScoreComparisonCard
        title="Likelihood"
        userValue={answers.likelihood}
        referenceValue={scenario.feedback.likelihood.expected}
        result={likelihoodResult}
        labels={likelihoodLabels}
        rationale={scenario.feedback.likelihood.rationale}
      />

      <ControlsComparisonCard
        title="Preventative controls"
        userLines={allPreventative}
        referenceLines={scenario.reference.controls.preventative}
        matched={preventativeEval.matched}
        missed={preventativeEval.missed}
      />
      <ControlsComparisonCard
        title="Detective controls"
        userLines={allDetective}
        referenceLines={scenario.reference.controls.detective}
        matched={detectiveEval.matched}
        missed={detectiveEval.missed}
      />
      <ControlsComparisonCard
        title="Corrective controls"
        userLines={allCorrective}
        referenceLines={scenario.reference.controls.corrective}
        matched={correctiveEval.matched}
        missed={correctiveEval.missed}
      />

      <div className="rounded-lg border border-navy-100 bg-navy-50/30 p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
          Residual risk
        </p>
        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">Your decision</p>
            <p className="mt-1 text-base text-navy-900">
              {residualBand && residualRisk != null ? `${residualBand} (${residualRisk})` : "-"}
              {answers.residualRationale ? `, ${answers.residualRationale}` : ""}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">Reference</p>
            <p className="mt-1 text-base text-navy-900">
              {scenario.reference.residualRisk}, {scenario.reference.residualRiskNote}
            </p>
          </div>
        </div>
      </div>

      <SummaryCard
        scenario={scenario}
        answers={answers}
        initialRisk={initialRisk}
        initialBand={initialBand}
        residualRisk={residualRisk}
        residualBand={residualBand}
      />

      <div className="flex flex-wrap items-center gap-4 border-t border-navy-100 pt-8">
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="inline-flex items-center rounded-md bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-navy-300"
        >
          {exporting ? "Generating PDF..." : "Export Hazard Log (PDF)"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center rounded-md border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-700 transition-colors hover:border-navy-300 hover:bg-navy-50"
        >
          Start over
        </button>
        {exportError && <span className="text-sm text-rose-700">{exportError}</span>}
      </div>
    </div>
  );
}

function ComparisonCard({
  title,
  userValue,
  referenceValue,
  matched,
  missed,
  extraNote,
}: {
  title: string;
  userValue: string;
  referenceValue: string;
  matched: KeywordGroup[];
  missed: KeywordGroup[];
  extraNote?: string | null;
}) {
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">{title}</p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">Your answer</p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-navy-900">
            {userValue || <span className="italic text-navy-400">(empty)</span>}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">Reference</p>
          <p className="mt-1 text-sm leading-relaxed text-navy-900">{referenceValue}</p>
        </div>
      </div>
      {extraNote && <InlineHint tone="warning" className="mt-5">{extraNote}</InlineHint>}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ConceptList tone="positive" label="Concepts you captured" items={matched} />
        <ConceptList tone="missing" label="Concepts you missed" items={missed} />
      </div>
    </div>
  );
}

function ScoreComparisonCard({
  title,
  userValue,
  referenceValue,
  result,
  labels,
  rationale,
}: {
  title: string;
  userValue: number | null;
  referenceValue: number;
  result: "match" | "close" | "off";
  labels: Record<number, string>;
  rationale: string;
}) {
  const tone = result === "match" ? "positive" : result === "close" ? "neutral" : "warning";
  const summary =
    result === "match"
      ? "Your score matches the reference."
      : result === "close"
      ? "Your score is close to the reference."
      : "Your score differs from the reference.";
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">{title}</p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">You</p>
          <p className="mt-1 text-2xl font-semibold text-navy-950">
            {userValue ?? "-"}
            {userValue ? <span className="ml-2 text-xs font-medium text-navy-500">{labels[userValue]}</span> : null}
          </p>
        </div>
        <div className="text-navy-300">{">"}</div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">Reference</p>
          <p className="mt-1 text-2xl font-semibold text-clinical-700">
            {referenceValue}
            <span className="ml-2 text-xs font-medium text-navy-500">{labels[referenceValue]}</span>
          </p>
        </div>
      </div>
      <InlineHint tone={tone} className="mt-5">
        <strong className="font-semibold">{summary}</strong> {rationale}
      </InlineHint>
    </div>
  );
}

function ControlsComparisonCard({
  title,
  userLines,
  referenceLines,
  matched,
  missed,
}: {
  title: string;
  userLines: string[];
  referenceLines: string[];
  matched: KeywordGroup[];
  missed: KeywordGroup[];
}) {
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">{title}</p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">Your controls</p>
          {userLines.length === 0 ? (
            <p className="mt-1 text-sm italic text-navy-400">(none entered)</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {userLines.map((l, i) => (
                <li key={i} className="text-sm leading-relaxed text-navy-900">- {l}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">Reference</p>
          <ul className="mt-2 space-y-1.5">
            {referenceLines.map((l, i) => (
              <li key={i} className="text-sm leading-relaxed text-navy-900">- {l}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <ConceptList tone="positive" label="Concepts you captured" items={matched} />
        <ConceptList tone="missing" label="Concepts you missed" items={missed} />
      </div>
    </div>
  );
}

// Mirrors validation.ts text-marker logic so the dark client-side card
// agrees with the validation engine when detecting OVER-scoring. Kept
// minimal - the source of truth remains validation.ts; this is a preview
// helper that runs before the user has triggered PDF export.
const LOW_SEVERITY_PREVIEW_RE =
  /\bminor\s+(inconvenience|delay|disruption|impact|issue|nuisance)\b|\badministrative\s+(delay|impact|burden|only|issue)\b|\bnon[\s-]?urgent\b|\bno\s+(clinical|patient)\s+(impact|harm|consequence)\b|\bsmall\s+delay\b|\bslight\s+delay\b|\bbrief\s+delay\b|\boutpatient\s+follow[\s-]?up\b|\blow[\s-]?acuity\b|\bpatient\s+inconvenience\b|\bnon[\s-]?clinical\b|\bschedul(e|ing|ed)\s+delay\b|\brebooked?\b|\breschedul(e|ed|ing)\b/i;
const RARE_LIKELIHOOD_PREVIEW_RE =
  /\bisolated\s+(incident|case|event|occurrence)\b|\brarely?\b|\boccasional(ly)?\b|\buncommon\b|\bone[\s-]?off\b|\bedge[\s-]?case\b|\bexceptional\b|\binfrequent(ly)?\b|\bvery\s+rare\b|\bseldom\b/i;

function SummaryCard({
  scenario,
  answers,
  initialRisk,
  initialBand,
  residualRisk,
  residualBand,
}: {
  scenario: Scenario;
  answers: Answers;
  initialRisk: number | null;
  initialBand: RiskBand | null;
  residualRisk: number | null;
  residualBand: RiskBand | null;
}) {
  // Bidirectional governance challenge. Under-scoring uses scenario reference
  // values; over-scoring uses the inferred ceiling implied by the described
  // hazard text. Both directions surface as "Challenged" in the UI; the
  // Governance-adjusted line reflects the corrected score either way.
  const refSeverity = scenario.feedback.severity.expected;
  const refLikelihood = scenario.feedback.likelihood.expected;
  const scoringText = `${answers.hazard} ${answers.cause} ${answers.consequence}`.toLowerCase();
  const sevCeiling = LOW_SEVERITY_PREVIEW_RE.test(scoringText) ? 2 : null;
  const likCeiling = RARE_LIKELIHOOD_PREVIEW_RE.test(scoringText) ? 2 : null;

  const severityUnderstated =
    answers.severity != null && answers.severity > 0 && answers.severity < refSeverity;
  const severityOverstated =
    sevCeiling != null && answers.severity != null && answers.severity > sevCeiling;
  const likelihoodUnderstated =
    answers.likelihood != null && answers.likelihood > 0 && answers.likelihood < refLikelihood;
  const likelihoodOverstated =
    likCeiling != null && answers.likelihood != null && answers.likelihood > likCeiling;

  const severityChallenged = severityUnderstated || severityOverstated;
  const likelihoodChallenged = likelihoodUnderstated || likelihoodOverstated;

  let adjustedSeverity = answers.severity ?? 0;
  if (severityOverstated && sevCeiling != null) adjustedSeverity = sevCeiling;
  else if (severityUnderstated) adjustedSeverity = refSeverity;

  let adjustedLikelihood = answers.likelihood ?? 0;
  if (likelihoodOverstated && likCeiling != null) adjustedLikelihood = likCeiling;
  else if (likelihoodUnderstated) adjustedLikelihood = refLikelihood;

  const adjustedRisk =
    adjustedSeverity > 0 && adjustedLikelihood > 0
      ? adjustedSeverity * adjustedLikelihood
      : null;
  const adjustedBand = bandForRisk(adjustedRisk);
  const showChallenged = severityChallenged || likelihoodChallenged;
  const anyOver = severityOverstated || likelihoodOverstated;
  const anyUnder = severityUnderstated || likelihoodUnderstated;
  const directionLabel =
    anyOver && anyUnder
      ? "governance correction applied"
      : anyOver
        ? "downward correction"
        : "upward correction";
  const bannerText =
    anyOver && !anyUnder
      ? "One or more scores overestimate the credible severity or likelihood compared with the described hazard."
      : anyOver && anyUnder
        ? "Submitted scores are governance-incorrect in both directions for the described hazard."
        : "One or more scores underestimate the credible severity or likelihood.";

  return (
    <div className="rounded-2xl border border-navy-200 bg-navy-950 p-6 text-white md:p-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-300">
          Audit-ready hazard log entry
        </p>
        <p className="text-[11px] uppercase tracking-widest text-navy-300">{scenario.shortName}</p>
      </div>
      {showChallenged && (() => {
        // Phase 5A — challenge severity is centralised. REVIEW for any
        // challenge by default; NOT-READY when adjusted band lands in High;
        // ESCALATE when adjusted band lands in Extreme. The banner pill
        // uses the CHALLENGED variant — the broader framing of the
        // situation. Per-stat pills below use the CORRECTED variant for the
        // specific number-was-fixed framing.
        //
        // BadgeVariant escalates with severity: REVIEW → "challenged",
        // NOT-READY → "critical", ESCALATE → "escalate". This keeps the
        // banner pill colour-aligned with the SummaryStat per-stat pills.
        const challengeLevel = deriveChallengedStatus({
          severityChallenged,
          likelihoodChallenged,
          adjustedRiskBand: adjustedBand ?? "Low",
        });
        const challengeStatus = statusFor(challengeLevel);
        const bannerVariant: "challenged" | "critical" | "escalate" =
          challengeLevel === "escalate"
            ? "escalate"
            : challengeLevel === "not-ready"
              ? "critical"
              : "challenged";
        return (
          <div
            className={`mt-4 flex flex-wrap items-center gap-3 ${challengeStatus.classes.bannerOnDark}`}
          >
            {/* Phase 5A — Step 2.1. Compact mode slims the banner pill so it
                still feels premium but no longer dominates the dark surface
                callout. Same height as the default badge; ~10–15% less
                horizontal density via reduced padding and dropped
                min-width floor. */}
            <Badge variant={bannerVariant} surface="dark" compact />
            <p
              className={`text-xs leading-relaxed ${challengeStatus.classes.bannerOnDarkText}`}
            >
              {bannerText} Governance-adjusted score ({directionLabel}):{" "}
              <strong className="font-semibold">
                {adjustedSeverity} × {adjustedLikelihood} = {adjustedRisk ?? "-"}
                {adjustedBand ? ` (${adjustedBand})` : ""}
              </strong>
              .
            </p>
          </div>
        );
      })()}
      <dl className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
        <SummaryField label="Hazard" value={answers.hazard} />
        <SummaryField label="Cause / failure mode" value={answers.cause} />
        <SummaryField label="Clinical consequence" value={answers.consequence} />

        {/* Phase 5A — challenge severity is computed once at the SummaryCard
            level (where adjustedBand is in scope) and passed to every
            challenged SummaryStat. Centralised so all three pills agree on
            severity even if the underlying rule changes later. */}
        {(() => {
          const summaryChallengeLevel = showChallenged
            ? deriveChallengedStatus({
                severityChallenged,
                likelihoodChallenged,
                adjustedRiskBand: adjustedBand ?? "Low",
              })
            : "review";
          return (
            // Phase 5A — Step 2.1. Span both parent dl columns so the three
            // stat columns each get a fair share of width. Inside the
            // single-column slot the previous layout used, "LIKELIHOOD" and
            // "INITIAL RISK" headers (text-[10px] + tracking-[0.22em] is wide)
            // were colliding visually. md:col-span-2 restores the full row
            // width, gap-x-8 matches the surrounding dl gutter so the three
            // column headers never run together.
            <div className="grid grid-cols-3 gap-x-8 gap-y-2 md:col-span-2">
              <SummaryStat
                label="Severity"
                value={answers.severity}
                challenged={severityChallenged}
                challengeLevel={summaryChallengeLevel}
                adjusted={severityChallenged ? adjustedSeverity : null}
              />
              <SummaryStat
                label="Likelihood"
                value={answers.likelihood}
                challenged={likelihoodChallenged}
                challengeLevel={summaryChallengeLevel}
                adjusted={likelihoodChallenged ? adjustedLikelihood : null}
              />
              <SummaryStat
                label="Initial risk"
                value={initialRisk}
                extra={initialBand}
                challenged={showChallenged}
                challengeLevel={summaryChallengeLevel}
                adjusted={showChallenged ? adjustedRisk : null}
                adjustedExtra={showChallenged ? adjustedBand : null}
              />
            </div>
          );
        })()}

        <SummaryList
          label="Preventative controls"
          items={[...splitLines(answers.existingPreventative), ...splitLines(answers.proposedPreventative)]}
        />
        <SummaryList
          label="Detective controls"
          items={[...splitLines(answers.existingDetective), ...splitLines(answers.proposedDetective)]}
        />
        <SummaryList
          label="Corrective controls"
          items={[...splitLines(answers.existingCorrective), ...splitLines(answers.proposedCorrective)]}
        />

        {/* Phase 5A — Step 2.1. Same column-span fix as the initial-risk
            grid above so "Residual severity / likelihood / risk" headers
            don't visually merge inside the narrower single-column slot. */}
        <div className="grid grid-cols-3 gap-x-8 gap-y-2 md:col-span-2">
          <SummaryStat label="Residual severity" value={answers.residualSeverity} />
          <SummaryStat label="Residual likelihood" value={answers.residualLikelihood} />
          <SummaryStat label="Residual risk" value={residualRisk} extra={residualBand} />
        </div>

        <SummaryField label="Residual rationale" value={answers.residualRationale} />
        <SummaryField label="Monitoring metric / KPI" value={answers.monitoringMetric} />
        <SummaryField label="Trigger threshold" value={answers.triggerThreshold} />
        <SummaryField label="Review frequency" value={answers.reviewFrequency} />
        <SummaryField label="Actions / CAPA" value={answers.capa} />
        <SummaryField label="Owner / responsible team" value={answers.owner} />
      </dl>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-clinical-300">{label}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-navy-50">
        {value || <span className="italic text-navy-400">(not provided)</span>}
      </dd>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  extra,
  challenged,
  challengeLevel,
  adjusted,
  adjustedExtra,
}: {
  label: string;
  value: number | null;
  extra?: string | null;
  challenged?: boolean;
  /**
   * Phase 5A — passed in by the SummaryCard parent, which knows the
   * adjusted band and can therefore call deriveChallengedStatus once.
   * Defaulted to "review" so older callers without this prop still render
   * the amber "review required" pill (the default when challenge severity
   * isn't otherwise specified).
   */
  challengeLevel?: StatusLevel;
  adjusted?: number | null;
  adjustedExtra?: string | null;
}) {
  const status = challenged ? statusFor(challengeLevel ?? "review") : null;
  // Phase 5A — Step 2.1. Per-stat chips ALWAYS use the CORRECTED variant.
  //
  // The previous Step 2 behaviour escalated the variant alongside the
  // challenge level (corrected → critical → escalate). That conflated two
  // separate signals: a per-stat chip describes a SCORE ADJUSTMENT, not an
  // active critical incident or an escalation event. CRITICAL is now
  // reserved for actual deployment blockers / critical findings; ESCALATE
  // for the highest-severity escalation surface (the banner pill above
  // already escalates as the situation worsens, which keeps the visual
  // hierarchy intact).
  //
  // The caption text below the number ("Governance-adjusted: X") still uses
  // the underlying challenge-level colour via status.classes.bannerOnDarkText
  // so the secondary text remains aligned with the banner above.
  //
  // Compact mode is enabled because these chips sit in three narrow
  // SummaryCard columns where the default min-width caused overflow.
  const statBadgeVariant: "corrected" | null = challenged ? "corrected" : null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-clinical-300">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-white">
        {value ?? "-"}
        {extra ? <span className="ml-1.5 text-xs font-medium text-navy-200">{extra}</span> : null}
        {statBadgeVariant ? (
          <Badge
            variant={statBadgeVariant}
            surface="dark"
            compact
            className="ml-2"
          />
        ) : null}
      </dd>
      {challenged && status && adjusted != null ? (
        <p
          className={`mt-1 text-[11px] font-medium ${status.classes.bannerOnDarkText}`}
        >
          Governance-adjusted: {adjusted}
          {adjustedExtra ? ` (${adjustedExtra})` : ""}
        </p>
      ) : null}
    </div>
  );
}

function SummaryList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-clinical-300">{label}</dt>
      <dd className="mt-1.5">
        {items.length === 0 ? (
          <span className="text-sm italic text-navy-400">(none)</span>
        ) : (
          <ul className="space-y-1.5">
            {items.map((it, i) => (
              <li key={i} className="text-sm leading-relaxed text-navy-50">- {it}</li>
            ))}
          </ul>
        )}
      </dd>
    </div>
  );
}

function ConceptList({ tone, label, items }: { tone: "positive" | "missing"; label: string; items: KeywordGroup[] }) {
  if (items.length === 0) {
    return (
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">{label}</p>
        <p className="mt-2 text-xs italic text-navy-400">none</p>
      </div>
    );
  }
  const chipClass =
    tone === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-amber-200 bg-amber-50 text-amber-800";
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((g) => (
          <span key={g.label} className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${chipClass}`}>
            {g.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full rounded-lg border border-navy-200 bg-white px-4 py-3 text-base text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
    />
  );
}

function FieldShell({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-semibold text-navy-900">{label}</label>
      {hint ? <p className="mt-1 text-xs text-navy-600">{hint}</p> : null}
      {children}
    </div>
  );
}

function CharCount({ value, min }: { value: string; min: number }) {
  const len = value.trim().length;
  return (
    <p className={`text-[11px] ${len >= min ? "text-navy-500" : "text-navy-400"}`}>
      {len < min ? `Add at least ${min - len} more characters.` : `${len} characters.`}
    </p>
  );
}

function InlineHint({
  tone,
  children,
  className,
}: {
  tone: "info" | "warning" | "positive" | "neutral";
  children: React.ReactNode;
  className?: string;
}) {
  const styles =
    tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "neutral"
      ? "border-navy-200 bg-navy-50 text-navy-800"
      : "border-clinical-200 bg-clinical-50 text-clinical-900";
  return (
    <div className={`rounded-md border px-4 py-3 text-sm leading-relaxed ${styles} ${className ?? ""}`}>
      {children}
    </div>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className={`h-3.5 w-3.5 flex-none text-clinical-600 ${className}`}
    >
      <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

/* ------------------------------------------------------------------ */
/* Types & static metadata                                            */
/* ------------------------------------------------------------------ */

type StepKey =
  | "briefing"
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
  { id: 2, key: "hazard", name: "Identify the hazard" },
  { id: 3, key: "cause", name: "Cause / failure mechanism" },
  { id: 4, key: "consequence", name: "Clinical consequence" },
  { id: 5, key: "severity", name: "Score severity" },
  { id: 6, key: "likelihood", name: "Score likelihood" },
  { id: 7, key: "controls", name: "Specify controls" },
  { id: 8, key: "residual", name: "Residual risk & ownership" },
  { id: 9, key: "feedback", name: "Reference answer & feedback" },
];

type Answers = {
  hazard: string;
  cause: string;
  consequence: string;
  severity: number | null;
  likelihood: number | null;
  preventative: string;
  detective: string;
  corrective: string;
  residualBand: RiskBand | "";
  residualNote: string;
  monitoringTrigger: string;
  owner: string;
};

const initialAnswers: Answers = {
  hazard: "",
  cause: "",
  consequence: "",
  severity: null,
  likelihood: null,
  preventative: "",
  detective: "",
  corrective: "",
  residualBand: "",
  residualNote: "",
  monitoringTrigger: "",
  owner: "",
};

const splitLines = (t: string): string[] =>
  t
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

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
        return answers.hazard.trim().length >= 12;
      case 3:
        return answers.cause.trim().length >= 12;
      case 4:
        return answers.consequence.trim().length >= 12;
      case 5:
        return answers.severity != null;
      case 6:
        return answers.likelihood != null;
      case 7:
        return (
          [answers.preventative, answers.detective, answers.corrective].some(
            (t) => t.trim().length > 0,
          )
        );
      case 8:
        return answers.residualBand !== "";
      default:
        return false;
    }
  }, [step, answers]);

  const handleReset = () => {
    setAnswers(initialAnswers);
    setStep(1);
    setExportError(null);
  };

  const handleExport = async () => {
    if (initialRisk == null || !initialBand) return;
    setExportError(null);
    setExporting(true);
    try {
      const report: HazardLogReport = {
        scenarioName: scenario.name,
        generatedAt: new Date(),
        hazard: answers.hazard,
        cause: answers.cause,
        consequence: answers.consequence,
        severity: answers.severity ?? 0,
        likelihood: answers.likelihood ?? 0,
        initialRisk,
        riskBand: initialBand,
        preventative: splitLines(answers.preventative),
        detective: splitLines(answers.detective),
        corrective: splitLines(answers.corrective),
        residualRisk: answers.residualBand
          ? `${answers.residualBand}${
              answers.residualNote ? " — " + answers.residualNote : ""
            }`
          : "(not specified)",
        monitoringTrigger: answers.monitoringTrigger || "(not specified)",
        owner: answers.owner || "(not specified)",
      };
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
  const isFinal = step === 9;

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
          <HazardStep
            value={answers.hazard}
            onChange={(v) => update("hazard", v)}
            scenario={scenario}
          />
        )}
        {step === 3 && (
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
        {step === 4 && (
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
        {step === 5 && (
          <ScaleStep
            kind="severity"
            value={answers.severity}
            onChange={(v) => update("severity", v)}
          />
        )}
        {step === 6 && (
          <ScaleStep
            kind="likelihood"
            value={answers.likelihood}
            onChange={(v) => update("likelihood", v)}
            initialRisk={initialRisk}
            initialBand={initialBand}
            severity={answers.severity}
          />
        )}
        {step === 7 && (
          <ControlsStep
            preventative={answers.preventative}
            detective={answers.detective}
            corrective={answers.corrective}
            onChange={(field, v) => update(field, v)}
          />
        )}
        {step === 8 && (
          <ResidualStep
            band={answers.residualBand}
            note={answers.residualNote}
            monitoringTrigger={answers.monitoringTrigger}
            owner={answers.owner}
            initialRisk={initialRisk}
            initialBand={initialBand}
            onChange={(field, v) => update(field, v)}
          />
        )}
        {step === 9 && (
          <FeedbackStep
            scenario={scenario}
            answers={answers}
            initialRisk={initialRisk}
            initialBand={initialBand}
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
              {isFirst ? "Begin exercise" : step === 8 ? "Review answers" : "Next"}
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
    case 3:
    case 4:
      return "Please write at least one clear sentence.";
    case 5:
      return "Pick a severity score.";
    case 6:
      return "Pick a likelihood score.";
    case 7:
      return "Add at least one control.";
    case 8:
      return "Pick a residual risk band.";
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
      <div className="mt-3 hidden grid-cols-9 gap-1 pb-3 text-[10px] font-medium uppercase tracking-wider md:grid">
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
          A hazard is the patient-facing harm that could occur — not the
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
}: {
  kind: "severity" | "likelihood";
  value: number | null;
  onChange: (n: number) => void;
  initialRisk?: number | null;
  initialBand?: RiskBand | null;
  severity?: number | null;
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

function RiskBanner({
  severity,
  likelihood,
  initialRisk,
  band,
}: {
  severity: number;
  likelihood: number;
  initialRisk: number;
  band: RiskBand;
}) {
  const styles = bandStyles[band];
  return (
    <div className="rounded-lg border border-navy-100 bg-navy-50/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-navy-500">
            Initial risk score
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
  preventative,
  detective,
  corrective,
  onChange,
}: {
  preventative: string;
  detective: string;
  corrective: string;
  onChange: (
    field: "preventative" | "detective" | "corrective",
    v: string,
  ) => void;
}) {
  return (
    <div className="space-y-7">
      <div>
        <h4 className="text-base font-semibold text-navy-950 md:text-lg">
          What controls will manage this hazard?
        </h4>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-700 md:text-base">
          One control per line. Group them by what they do —{" "}
          <span className="font-semibold text-navy-900">prevent</span> the
          hazard,{" "}
          <span className="font-semibold text-navy-900">detect</span> it after
          the fact, or{" "}
          <span className="font-semibold text-navy-900">correct</span> the harm
          and feed learning back.
        </p>
      </div>

      <ControlField
        label="Preventative controls"
        hint="Stop the hazard occurring (e.g. mandatory human review before downgrade)."
        value={preventative}
        onChange={(v) => onChange("preventative", v)}
      />
      <ControlField
        label="Detective controls"
        hint="Spot the hazard after it occurs (e.g. audit sample, drift monitoring)."
        value={detective}
        onChange={(v) => onChange("detective", v)}
      />
      <ControlField
        label="Corrective controls"
        hint="Limit harm and learn (e.g. clinician override, incident reporting)."
        value={corrective}
        onChange={(v) => onChange("corrective", v)}
      />
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
    </div>
  );
}

function ResidualStep({
  band,
  note,
  monitoringTrigger,
  owner,
  initialRisk,
  initialBand,
  onChange,
}: {
  band: RiskBand | "";
  note: string;
  monitoringTrigger: string;
  owner: string;
  initialRisk: number | null;
  initialBand: RiskBand | null;
  onChange: <K extends keyof Answers>(field: K, v: Answers[K]) => void;
}) {
  const bands: RiskBand[] = ["Low", "Medium", "High", "Extreme"];
  return (
    <div className="space-y-7">
      {initialRisk != null && initialBand && (
        <div className="rounded-lg border border-navy-100 bg-navy-50/40 p-4 text-sm text-navy-700">
          Initial risk before controls:{" "}
          <span className="font-semibold text-navy-950">{initialRisk}</span> ·{" "}
          <span className="font-semibold text-navy-950">{initialBand}</span>.
          What residual risk band do your controls leave you in?
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-navy-900">
          Residual risk band (after controls)
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {bands.map((b) => {
            const selected = band === b;
            const styles = bandStyles[b];
            return (
              <button
                key={b}
                type="button"
                onClick={() => onChange("residualBand", b)}
                className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  selected
                    ? styles.chip + " ring-1 ring-clinical-500"
                    : "border-navy-200 bg-white text-navy-700 hover:border-clinical-300"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      <FieldShell
        label="Why this band?"
        hint="One short sentence — what your controls reduce, and what they don't."
      >
        <textarea
          value={note}
          onChange={(e) => onChange("residualNote", e.target.value)}
          rows={2}
          className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
          placeholder="e.g. Medium after controls — not acceptable without active human review and ongoing monitoring."
        />
      </FieldShell>

      <FieldShell
        label="Monitoring trigger"
        hint="What signal would tell you the hazard is occurring or that controls are failing?"
      >
        <input
          value={monitoringTrigger}
          onChange={(e) => onChange("monitoringTrigger", e.target.value)}
          type="text"
          className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
          placeholder="e.g. Confirmed delayed cancer diagnosis where AI assigned routine."
        />
      </FieldShell>

      <FieldShell
        label="Owner / responsible team"
        hint="Who is accountable for this hazard and the controls?"
      >
        <input
          value={owner}
          onChange={(e) => onChange("owner", e.target.value)}
          type="text"
          className="mt-2 w-full rounded-md border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
          placeholder="e.g. Clinical Safety Officer + cancer pathway clinical lead."
        />
      </FieldShell>
    </div>
  );
}

function FeedbackStep({
  scenario,
  answers,
  initialRisk,
  initialBand,
  onExport,
  onReset,
  exporting,
  exportError,
}: {
  scenario: Scenario;
  answers: Answers;
  initialRisk: number | null;
  initialBand: RiskBand | null;
  onExport: () => void;
  onReset: () => void;
  exporting: boolean;
  exportError: string | null;
}) {
  const hazardEval = evaluateTextStep(answers.hazard, scenario.feedback.hazard);
  const causeEval = evaluateTextStep(answers.cause, scenario.feedback.cause);
  const consequenceEval = evaluateTextStep(
    answers.consequence,
    scenario.feedback.consequence,
  );
  const severityResult = evaluateScore(
    answers.severity ?? 0,
    scenario.feedback.severity,
  );
  const likelihoodResult = evaluateScore(
    answers.likelihood ?? 0,
    scenario.feedback.likelihood,
  );
  const preventativeEval = evaluateControls(
    splitLines(answers.preventative),
    scenario.feedback.controls.preventative,
  );
  const detectiveEval = evaluateControls(
    splitLines(answers.detective),
    scenario.feedback.controls.detective,
  );
  const correctiveEval = evaluateControls(
    splitLines(answers.corrective),
    scenario.feedback.controls.corrective,
  );

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
          The reference is one defensible answer, not the only answer. Your
          framing may differ — what matters is whether the right concepts are
          present.
        </p>
      </section>

      {/* Text-step comparisons */}
      <ComparisonCard
        title="Hazard"
        userValue={answers.hazard}
        referenceValue={scenario.reference.hazard}
        matched={hazardEval.matched}
        missed={hazardEval.missed}
        extraNote={
          hazardEval.describesFailureMode
            ? scenario.feedback.hazard.failureModeHint
            : null
        }
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

      {/* Score comparisons */}
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

      {/* Controls comparisons */}
      <ControlsComparisonCard
        title="Preventative controls"
        userLines={splitLines(answers.preventative)}
        referenceLines={scenario.reference.controls.preventative}
        matched={preventativeEval.matched}
        missed={preventativeEval.missed}
      />
      <ControlsComparisonCard
        title="Detective controls"
        userLines={splitLines(answers.detective)}
        referenceLines={scenario.reference.controls.detective}
        matched={detectiveEval.matched}
        missed={detectiveEval.missed}
      />
      <ControlsComparisonCard
        title="Corrective controls"
        userLines={splitLines(answers.corrective)}
        referenceLines={scenario.reference.controls.corrective}
        matched={correctiveEval.matched}
        missed={correctiveEval.missed}
      />

      {/* Residual */}
      <div className="rounded-lg border border-navy-100 bg-navy-50/30 p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
          Residual risk
        </p>
        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
              Your decision
            </p>
            <p className="mt-1 text-base text-navy-900">
              {answers.residualBand || "—"}
              {answers.residualNote ? ` — ${answers.residualNote}` : ""}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
              Reference
            </p>
            <p className="mt-1 text-base text-navy-900">
              {scenario.reference.residualRisk} —{" "}
              {scenario.reference.residualRiskNote}
            </p>
          </div>
        </div>
      </div>

      {/* Audit-ready summary */}
      <SummaryCard
        scenario={scenario}
        answers={answers}
        initialRisk={initialRisk}
        initialBand={initialBand}
      />

      {/* Export & reset */}
      <div className="flex flex-wrap items-center gap-4 border-t border-navy-100 pt-8">
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="inline-flex items-center rounded-md bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:bg-navy-300"
        >
          {exporting ? "Generating PDF…" : "Export Hazard Log (PDF)"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center rounded-md border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-700 transition-colors hover:border-navy-300 hover:bg-navy-50"
        >
          Start over
        </button>
        {exportError && (
          <span className="text-sm text-rose-700">{exportError}</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback sub-components                                             */
/* ------------------------------------------------------------------ */

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
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
        {title}
      </p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
            Your answer
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-navy-900">
            {userValue || <span className="italic text-navy-400">(empty)</span>}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
            Reference
          </p>
          <p className="mt-1 text-sm leading-relaxed text-navy-900">
            {referenceValue}
          </p>
        </div>
      </div>

      {extraNote && (
        <InlineHint tone="warning" className="mt-5">
          {extraNote}
        </InlineHint>
      )}

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
  const tone =
    result === "match"
      ? "positive"
      : result === "close"
      ? "neutral"
      : "warning";
  const summary =
    result === "match"
      ? "Your score matches the reference."
      : result === "close"
      ? "Your score is close to the reference."
      : "Your score differs from the reference.";

  return (
    <div className="rounded-lg border border-navy-100 bg-white p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
        {title}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
            You
          </p>
          <p className="mt-1 text-2xl font-semibold text-navy-950">
            {userValue ?? "—"}
            {userValue ? (
              <span className="ml-2 text-xs font-medium text-navy-500">
                {labels[userValue]}
              </span>
            ) : null}
          </p>
        </div>
        <div className="text-navy-300">→</div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
            Reference
          </p>
          <p className="mt-1 text-2xl font-semibold text-clinical-700">
            {referenceValue}
            <span className="ml-2 text-xs font-medium text-navy-500">
              {labels[referenceValue]}
            </span>
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
        {title}
      </p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
            Your controls
          </p>
          {userLines.length === 0 ? (
            <p className="mt-1 text-sm italic text-navy-400">(none entered)</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {userLines.map((l, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed text-navy-900"
                >
                  • {l}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
            Reference
          </p>
          <ul className="mt-2 space-y-1.5">
            {referenceLines.map((l, i) => (
              <li key={i} className="text-sm leading-relaxed text-navy-900">
                • {l}
              </li>
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

function SummaryCard({
  scenario,
  answers,
  initialRisk,
  initialBand,
}: {
  scenario: Scenario;
  answers: Answers;
  initialRisk: number | null;
  initialBand: RiskBand | null;
}) {
  return (
    <div className="rounded-2xl border border-navy-200 bg-navy-950 p-6 text-white md:p-8">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-300">
          Audit-ready hazard log entry
        </p>
        <p className="text-[11px] uppercase tracking-widest text-navy-300">
          {scenario.shortName}
        </p>
      </div>
      <dl className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
        <SummaryField label="Hazard" value={answers.hazard} />
        <SummaryField label="Cause" value={answers.cause} />
        <SummaryField label="Clinical consequence" value={answers.consequence} />
        <div className="grid grid-cols-3 gap-4">
          <SummaryStat label="Severity" value={answers.severity} />
          <SummaryStat label="Likelihood" value={answers.likelihood} />
          <SummaryStat label="Initial risk" value={initialRisk} extra={initialBand} />
        </div>
        <SummaryList label="Preventative controls" items={splitLines(answers.preventative)} />
        <SummaryList label="Detective controls" items={splitLines(answers.detective)} />
        <SummaryList label="Corrective controls" items={splitLines(answers.corrective)} />
        <SummaryField
          label="Residual risk"
          value={
            answers.residualBand
              ? `${answers.residualBand}${answers.residualNote ? " — " + answers.residualNote : ""}`
              : ""
          }
        />
        <SummaryField label="Monitoring trigger" value={answers.monitoringTrigger} />
        <SummaryField label="Owner / responsible team" value={answers.owner} />
      </dl>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-clinical-300">
        {label}
      </dt>
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
}: {
  label: string;
  value: number | null;
  extra?: string | null;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-clinical-300">
        {label}
      </dt>
      <dd className="mt-1 text-2xl font-semibold text-white">
        {value ?? "—"}
        {extra ? (
          <span className="ml-1.5 text-xs font-medium text-navy-200">
            {extra}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

function SummaryList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.22em] text-clinical-300">
        {label}
      </dt>
      <dd className="mt-1.5">
        {items.length === 0 ? (
          <span className="text-sm italic text-navy-400">(none)</span>
        ) : (
          <ul className="space-y-1.5">
            {items.map((it, i) => (
              <li
                key={i}
                className="text-sm leading-relaxed text-navy-50"
              >
                • {it}
              </li>
            ))}
          </ul>
        )}
      </dd>
    </div>
  );
}

function ConceptList({
  tone,
  label,
  items,
}: {
  tone: "positive" | "missing";
  label: string;
  items: KeywordGroup[];
}) {
  if (items.length === 0) {
    return (
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
          {label}
        </p>
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
      <p className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((g) => (
          <span
            key={g.label}
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${chipClass}`}
          >
            {g.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

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

function FieldShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
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
    <p
      className={`text-[11px] ${
        len >= min ? "text-navy-500" : "text-navy-400"
      }`}
    >
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
    <div
      className={`rounded-md border px-4 py-3 text-sm leading-relaxed ${styles} ${
        className ?? ""
      }`}
    >
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
      <path
        d="M3 8.5l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

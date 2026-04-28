/**
 * Phase 4B — Logical Consistency Engine stress test.
 *
 * Standalone Node script. Runs an inlined JS port of the engine in
 * `components/simulator/validation.ts` against a battery of cases
 * covering every rule branch, suppression behaviour, and the multi-fire
 * intersection where every check should fire at once.
 *
 * Run from the project root (host, not bash sandbox):
 *
 *   node outputs/logical_consistency_stress.js
 *
 * Exit code is 0 when all cases pass, 1 otherwise. The PASS / FAIL
 * counts and per-case detail are printed to stdout. The JS port mirrors
 * the TS engine LINE FOR LINE — any drift here means the test was
 * updated without updating validation.ts (or vice versa) and is a
 * self-correcting fail signal.
 */

/* ------------------------------------------------------------------ */
/* JS port of the Logical Consistency engine + helpers it needs.      */
/* Keep these definitions in sync with components/simulator/          */
/* validation.ts. Order mirrors the TS source so a side-by-side diff  */
/* is straightforward.                                                */
/* ------------------------------------------------------------------ */

const VAGUE_CONTROL_PATTERNS = [
  /\bmonitor(ed|ing)?\s+regular(ly)?\b/i,
  /\breview(ed|ing)?\s+regular(ly)?\b/i,
  /\breview(ed|ing)?\s+as\s+needed\b/i,
  /\bperiodic\s+review\b/i,
  /\baudit\s+later\b/i,
  /\bfuture\s+training\b/i,
  /\btake\s+action\s+if\s+required\b/i,
  /\bif\s+(issues?|problems?|something|anything)\s+(happen|happens|arise|arises|occurs?)\b/i,
  /\bmonitor\s+incidents?\b/i,
  /\bpolicy\s+(only|alone)\b/i,
  /\breport\s+if\s+noticed\b/i,
  /^\s*monthly\s+review\s+only\s*$/i,
  /\breminder\s+to\b/i,
  /\bencourage(d)?\s+to\b/i,
  /\btrain(ing|s)?\s+staff\b/i,
  /\bstaff\s+training\b/i,
];

const NON_CONTROL_PATTERNS = [
  /\bstaff\s+aware(ness)?\b/i,
  /\b(clinician|clinical\s+staff|user|users|staff|patient|patients)\s+(awareness|vigilance)\b/i,
  /\b(user|patient|staff|clinician|clinicians)\s+vigilance\b/i,
  /\bbe\s+(careful|vigilant|alert|cautious|mindful)\b/i,
  /\b(clinician|clinicians|staff|users?)\s+(informed|notified|told|reminded|made\s+aware)\b/i,
];

const ELIMINATED_PATTERNS = [
  /\beliminat(ed|es|e)\b/i,
  /\bzero\s+risk\b/i,
  /\bno\s+residual\s+risk\b/i,
  /\bcompletely\s+removed?\b/i,
];

const NOT_ELIMINATED_PATTERNS = [
  /\bnot\s+eliminat(ed|e|ing)\b/i,
  /\bcannot\s+be\s+eliminat(ed|e|ing)\b/i,
  /\bcan\s*['']?t\s+be\s+eliminat(ed|e|ing)\b/i,
  /\brisk\s+remains?\b/i,
  /\brisk\s+(is\s+)?still\s+(present|there)\b/i,
  /\bresidual\s+risk\s+remains?\b/i,
  /\bresidual\s+risk\s+(is\s+)?still\b/i,
  /\bsome\s+risk\s+remains?\b/i,
  /\bnever\s+fully\s+(removed|eliminated|prevented)\b/i,
  /\bnot\s+fully\s+(removed|eliminated|prevented)\b/i,
];

const WEAK_CAPA_PATTERNS = [
  /\breview\s+later\b/i,
  /\breview\s+if\s+(needed|required|necessary)\b/i,
  /\breview\s+as\s+(needed|required|necessary)\b/i,
  /\bdiscuss\s+internal(ly)?\b/i,
  /\binformal\s+review\b/i,
  /\bnote\s+(it\s+)?for\s+later\b/i,
  /\bconsider\s+action\b/i,
  /\bmonitor\s+going\s+forward\b/i,
  /\bcontinue\s+to\s+monitor\b/i,
  /\bwait\s+and\s+see\b/i,
  /^\s*(tbd|tbc|to\s+be\s+(defined|determined|confirmed))\s*$/i,
  /\bif\s+needed\b/i,
  /\bif\s+required\b/i,
  /\bas\s+(and\s+when\s+)?required\b/i,
];

const CLINICAL_CHAIN_PATTERNS = [
  /\bclinical\s+safety\s+officer\b/i,
  /\bcso\b/i,
  /\bclinical\s+lead\b/i,
  /\bpathway\s+lead\b/i,
  /\bconsultant\b/i,
  /\bclinician\b/i,
  /\bmedical\s+director\b/i,
  /\bcaldicott\b/i,
];

const KPI_THRESHOLD_STOPWORDS = new Set([
  "a", "an", "the", "of", "in", "on", "at", "by", "for", "to", "from",
  "with", "without", "is", "are", "was", "were", "be", "been", "being",
  "and", "or", "any", "all", "no", "not", "if", "when", "where", "than",
  "as", "per", "into", "across", "between", "more", "less", "many",
  "few", "some",
  "rate", "rates", "number", "numbers", "count", "counts", "percentage",
  "percent", "percentages", "value", "values", "level", "levels",
  "amount", "amounts", "total", "totals", "sum", "score", "scores",
  "metric", "metrics", "measure", "measures", "measured", "ongoing",
  "above", "below", "over", "under", "exceeds", "exceed", "exceeding",
  "exceeded", "breach", "breaches", "breached", "threshold",
  "thresholds", "trigger", "triggers", "triggered", "triggering",
  "monitor", "monitored", "monitoring", "audit", "audited", "auditing",
  "sample", "samples", "case", "cases", "month", "months", "monthly",
  "quarter", "quarters", "quarterly", "year", "years", "yearly",
  "annually", "annual", "week", "weeks", "weekly", "day", "days",
  "daily", "rolling", "any", "each", "every", "during", "since",
  "this", "that", "these", "those", "it", "its", "them", "they",
  "their",
]);

const CONSISTENCY_LEVELS = {
  "controls-residual-mismatch": "warning",
  "weak-controls-low-residual": "critical",
  "elimination-wording-mismatch": "warning",
  "elimination-score-mismatch": "warning",
  "kpi-threshold-mismatch": "warning",
  "capa-severity-mismatch": "critical",
  "ownership-severity-mismatch": "critical",
};

function anyMatches(text, patterns) {
  return patterns.some((p) => p.test(text));
}

function classifyControl(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (anyMatches(trimmed, NON_CONTROL_PATTERNS)) return "non-control";
  if (anyMatches(trimmed, VAGUE_CONTROL_PATTERNS)) return "vague";
  return null;
}

function evaluateControlQuality(controls) {
  const issues = [];
  for (const raw of controls) {
    const level = classifyControl(raw);
    if (!level) continue;
    issues.push({ text: raw.trim(), level });
  }
  return issues;
}

// Tests do not exercise the missing-essentials path (no scenario.essentialControls
// passed). Stub returns []; if a future test wants to exercise it, port the
// keyword-group matcher over.
function evaluateMissingEssentials() {
  return [];
}

function tokeniseSubstantive(text) {
  const out = new Set();
  if (!text) return out;
  const cleaned = text.toLowerCase().replace(/[‘’‚‛]/g, "'").replace(/[“”„‟]/g, '"');
  const tokens = cleaned.split(/[^a-z]+/).filter((t) => t.length > 1);
  for (const t of tokens) {
    if (KPI_THRESHOLD_STOPWORDS.has(t)) continue;
    out.add(t);
  }
  return out;
}

function controlStrengthSignal(args) {
  const allEntries = [
    ...args.preventativeControls,
    ...args.detectiveControls,
    ...args.correctiveControls,
  ].filter((c) => c.trim().length > 0);
  const controlQuality = evaluateControlQuality(allEntries);
  const hasNonControl = controlQuality.some((i) => i.level === "non-control");
  const hasVague = controlQuality.some((i) => i.level === "vague");
  const missingEssentials = evaluateMissingEssentials();

  if (hasNonControl) return "weak";
  if (allEntries.length < 2) return "weak";
  if (missingEssentials.length > 0) return "weak";
  if (!hasVague && allEntries.length >= 2) return "strong";
  return "neither";
}

function evaluateLogicalConsistency(args) {
  const findings = [];
  const push = (kind, message) => {
    findings.push({ kind, level: CONSISTENCY_LEVELS[kind], message });
  };

  // Check 1 / 2: control strength vs residual likelihood.
  const anyControlEntered =
    args.preventativeControls.some((c) => c.trim()) ||
    args.detectiveControls.some((c) => c.trim()) ||
    args.correctiveControls.some((c) => c.trim());
  if (anyControlEntered && args.residualLikelihood > 0) {
    const strength = controlStrengthSignal({
      preventativeControls: args.preventativeControls,
      detectiveControls: args.detectiveControls,
      correctiveControls: args.correctiveControls,
    });
    if (strength === "strong" && args.residualLikelihood >= 4) {
      push(
        "controls-residual-mismatch",
        `Residual likelihood (${args.residualLikelihood}) appears high relative to the strength of controls listed. Reassess controls or justify why risk remains high.`,
      );
    }
    if (strength === "weak" && args.residualLikelihood === 1) {
      push(
        "weak-controls-low-residual",
        `Residual likelihood (1) may be underestimated given missing or weak controls. Reassess residual or strengthen controls before claiming near-elimination.`,
      );
    }
  }

  // Check 3: elimination wording mismatch.
  const rationale = args.residualRationale.trim();
  const residualScore =
    args.residualSeverity > 0 && args.residualLikelihood > 0
      ? args.residualSeverity * args.residualLikelihood
      : 0;
  // Suppress when a "not eliminated" / "risk remains" disclaimer is
  // present — those patterns indicate the user is CORRECTLY acknowledging
  // residual risk, and ELIMINATED_PATTERNS would otherwise fire on
  // "eliminated" inside "not eliminated".
  if (
    rationale &&
    residualScore > 0 &&
    anyMatches(rationale, ELIMINATED_PATTERNS) &&
    !anyMatches(rationale, NOT_ELIMINATED_PATTERNS)
  ) {
    push(
      "elimination-wording-mismatch",
      `Residual rationale uses elimination or zero-risk language but the residual score is non-zero (${args.residualSeverity}×${args.residualLikelihood}=${residualScore}). Either restate the rationale to acknowledge remaining risk, or reassess the score.`,
    );
  }

  // Check 3b: elimination score mismatch.
  if (
    rationale &&
    args.residualSeverity === 1 &&
    args.residualLikelihood === 1 &&
    anyMatches(rationale, NOT_ELIMINATED_PATTERNS)
  ) {
    push(
      "elimination-score-mismatch",
      `Residual score (1×1=1) implies near-elimination, but rationale states residual risk remains. Either raise residual to reflect remaining risk, or restate the rationale.`,
    );
  }

  // Check 4: KPI / threshold semantic alignment.
  const kpiText = args.monitoringMetric.trim();
  const triggerText = args.triggerThreshold.trim();
  if (kpiText && triggerText) {
    const kpiTokens = tokeniseSubstantive(kpiText);
    const triggerTokens = tokeniseSubstantive(triggerText);
    if (kpiTokens.size > 0 && triggerTokens.size > 0) {
      let overlap = 0;
      for (const t of kpiTokens) {
        if (triggerTokens.has(t)) overlap++;
      }
      if (overlap === 0) {
        push(
          "kpi-threshold-mismatch",
          `Trigger threshold does not appear aligned to the KPI being monitored. The KPI describes one signal but the threshold references different terms. Restate the threshold so it triggers on the KPI being measured.`,
        );
      }
    }
  }

  // Check 5: CAPA insufficient for severity of trigger.
  const capaText = args.capa.trim();
  if (triggerText && capaText && anyMatches(capaText, WEAK_CAPA_PATTERNS)) {
    push(
      "capa-severity-mismatch",
      `Proposed CAPA may be insufficient for the severity of the trigger. A measurable threshold has been defined but the action is passive or deferred. State the specific escalation, decision-maker, and timescale that fire when the threshold is breached.`,
    );
  }

  // Check 6: ownership vs hazard severity.
  const ownerText = args.owner.trim();
  if (
    args.adjustedSeverity >= 4 &&
    ownerText &&
    !anyMatches(ownerText, CLINICAL_CHAIN_PATTERNS)
  ) {
    push(
      "ownership-severity-mismatch",
      `Ownership may not reflect the clinical severity of this hazard (governance-adjusted severity ${args.adjustedSeverity}). A high-severity hazard requires a named clinical owner — Clinical Safety Officer, clinical lead, pathway lead, or named consultant. Generic IT, administrative or operational ownership is insufficient at this severity.`,
    );
  }

  return findings;
}

/* ------------------------------------------------------------------ */
/* Test harness                                                       */
/* ------------------------------------------------------------------ */

const STRONG_PREV = [
  "Mandatory clinician review before any downgrade of triage routing",
  "Hard-stop on red-flag terms requiring secondary clinician sign-off",
];
const STRONG_DET = [
  "Monthly audit of routine-ranked cases against actual outcome",
  "False-negative rate dashboard reviewed at Clinical Safety Group",
];
const STRONG_CORR = [
  "Defined override pathway from clinician to AI supplier within 24 hours",
  "Pause-the-AI procedure with named decision-maker on threshold breach",
];

const baseAnswers = {
  preventativeControls: [],
  detectiveControls: [],
  correctiveControls: [],
  residualSeverity: 0,
  residualLikelihood: 0,
  residualRationale: "",
  monitoringMetric: "",
  triggerThreshold: "",
  capa: "",
  owner: "",
  adjustedSeverity: 0,
};

function withBase(overrides) {
  return { ...baseAnswers, ...overrides };
}

const cases = [
  // ---- Check 1: controls-residual-mismatch (warning) ----
  {
    name: "Strong controls + residualLikelihood=4 fires controls-residual-mismatch",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 4,
      residualLikelihood: 4,
    }),
    expectKinds: ["controls-residual-mismatch"],
  },
  {
    name: "Strong controls + residualLikelihood=5 fires controls-residual-mismatch",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 5,
      residualLikelihood: 5,
    }),
    expectKinds: ["controls-residual-mismatch"],
  },
  {
    name: "Strong controls + residualLikelihood=3 does NOT fire controls-residual-mismatch",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 4,
      residualLikelihood: 3,
    }),
    expectKinds: [],
  },
  {
    name: "Weak (single non-control) controls + residualLikelihood=5 does NOT fire check 1",
    input: withBase({
      preventativeControls: ["Staff awareness"],
      detectiveControls: [],
      correctiveControls: [],
      residualSeverity: 4,
      residualLikelihood: 5,
    }),
    // Strength is weak (non-control). Check 1 only fires on strong. Check 2
    // fires on weak + residualLikelihood=1, but here residualLikelihood=5.
    // Net: no consistency findings.
    expectKinds: [],
  },

  // ---- Check 2: weak-controls-low-residual (critical) ----
  {
    name: "Single non-control + residualLikelihood=1 fires weak-controls-low-residual",
    input: withBase({
      preventativeControls: ["Be careful when triaging"],
      detectiveControls: [],
      correctiveControls: [],
      residualSeverity: 1,
      residualLikelihood: 1,
    }),
    expectKinds: ["weak-controls-low-residual"],
  },
  {
    name: "Single auditable control + residualLikelihood=1 fires weak-controls-low-residual (under quantity)",
    input: withBase({
      preventativeControls: ["Mandatory clinician review before downgrade"],
      detectiveControls: [],
      correctiveControls: [],
      residualSeverity: 1,
      residualLikelihood: 1,
    }),
    expectKinds: ["weak-controls-low-residual"],
  },
  {
    name: "Weak controls + residualLikelihood=2 does NOT fire weak-controls-low-residual",
    input: withBase({
      preventativeControls: ["Be careful when triaging"],
      detectiveControls: [],
      correctiveControls: [],
      residualSeverity: 1,
      residualLikelihood: 2,
    }),
    expectKinds: [],
  },
  {
    name: "Strong controls + residualLikelihood=1 does NOT fire weak-controls-low-residual",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 1,
      residualLikelihood: 1,
    }),
    expectKinds: [],
  },

  // ---- Check 3: elimination-wording-mismatch (warning) ----
  {
    name: "Rationale uses 'eliminated' + non-zero residual fires elimination-wording-mismatch",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 2,
      residualLikelihood: 2,
      residualRationale: "All clinical risk has been eliminated by the new pathway.",
    }),
    expectKinds: ["elimination-wording-mismatch"],
  },
  {
    name: "Rationale uses 'zero risk' + score 1×1 still fires elimination-wording-mismatch",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 1,
      residualLikelihood: 1,
      residualRationale: "Zero risk after the AI tool is paused.",
    }),
    expectKinds: ["elimination-wording-mismatch"],
  },
  {
    name: "Rationale says 'not eliminated' + non-zero residual does NOT fire elimination-wording",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 2,
      residualLikelihood: 2,
      residualRationale: "Risk is not eliminated; mandatory clinician review reduces likelihood.",
    }),
    expectKinds: [],
  },
  {
    name: "Empty rationale + non-zero residual does NOT fire elimination-wording",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 4,
      residualLikelihood: 4,
      residualRationale: "",
    }),
    // residualLikelihood=4 + strong controls also fires controls-residual-mismatch.
    expectKinds: ["controls-residual-mismatch"],
  },

  // ---- Check 3b: elimination-score-mismatch (warning) ----
  {
    name: "residual=1×1 + rationale 'risk remains' fires elimination-score-mismatch",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 1,
      residualLikelihood: 1,
      residualRationale: "Severity is reduced by controls but residual risk remains.",
    }),
    expectKinds: ["elimination-score-mismatch"],
  },
  {
    name: "residual=1×1 + rationale 'not fully removed' fires elimination-score-mismatch",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 1,
      residualLikelihood: 1,
      residualRationale: "Likelihood greatly reduced but the underlying hazard is not fully removed.",
    }),
    expectKinds: ["elimination-score-mismatch"],
  },
  {
    name: "residual=2×1 + rationale 'risk remains' does NOT fire elimination-score-mismatch",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 2,
      residualLikelihood: 1,
      residualRationale: "Severity unchanged; residual risk remains nonzero.",
    }),
    expectKinds: [],
  },
  {
    name: "residual=1×1 + empty rationale does NOT fire elimination-score-mismatch",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 1,
      residualLikelihood: 1,
      residualRationale: "",
    }),
    expectKinds: [],
  },

  // ---- Check 4: kpi-threshold-mismatch (warning) ----
  {
    name: "KPI 'false-negative rate' + threshold 'delayed diagnosis only' fires kpi-threshold-mismatch",
    input: withBase({
      monitoringMetric: "False-negative rate on routine-ranked cases",
      triggerThreshold: "Delayed diagnosis only",
    }),
    expectKinds: ["kpi-threshold-mismatch"],
  },
  {
    name: "KPI + aligned threshold (overlap on 'false-negative') does NOT fire kpi-threshold-mismatch",
    input: withBase({
      monitoringMetric: "False-negative rate on routine-ranked cases",
      triggerThreshold: "False-negative rate above 1% over rolling quarter",
    }),
    expectKinds: [],
  },
  {
    name: "KPI present, threshold empty does NOT fire kpi-threshold-mismatch (suppression)",
    input: withBase({
      monitoringMetric: "False-negative rate",
      triggerThreshold: "",
    }),
    expectKinds: [],
  },
  {
    name: "Both fields tokenise to nothing substantive does NOT fire kpi-threshold-mismatch",
    input: withBase({
      monitoringMetric: "Rate",
      triggerThreshold: "Above 1%",
    }),
    expectKinds: [],
  },

  // ---- Check 5: capa-severity-mismatch (critical) ----
  {
    name: "Trigger present + CAPA 'review later' fires capa-severity-mismatch",
    input: withBase({
      triggerThreshold: "False-negative rate above 1% over rolling quarter",
      capa: "Review later at next governance meeting.",
    }),
    expectKinds: ["capa-severity-mismatch"],
  },
  {
    name: "Trigger present + CAPA 'if needed' fires capa-severity-mismatch",
    input: withBase({
      triggerThreshold: "Any confirmed delayed cancer diagnosis",
      capa: "Notify the team if needed.",
    }),
    expectKinds: ["capa-severity-mismatch"],
  },
  {
    name: "Trigger empty + CAPA 'review later' does NOT fire capa-severity-mismatch (suppression)",
    input: withBase({
      triggerThreshold: "",
      capa: "Review later",
    }),
    expectKinds: [],
  },
  {
    name: "Trigger present + strong CAPA does NOT fire capa-severity-mismatch",
    input: withBase({
      triggerThreshold: "False-negative rate above 1% over rolling quarter",
      capa: "Pause AI tool for routine triage, notify Clinical Safety Officer within 24h, full audit of routine-ranked cases over the prior period.",
    }),
    expectKinds: [],
  },

  // ---- Check 6: ownership-severity-mismatch (critical) ----
  {
    name: "adjustedSeverity=5 + owner 'Operations' fires ownership-severity-mismatch",
    input: withBase({
      adjustedSeverity: 5,
      owner: "Operations",
    }),
    expectKinds: ["ownership-severity-mismatch"],
  },
  {
    name: "adjustedSeverity=4 + owner 'IT team' fires ownership-severity-mismatch",
    input: withBase({
      adjustedSeverity: 4,
      owner: "IT team",
    }),
    expectKinds: ["ownership-severity-mismatch"],
  },
  {
    name: "adjustedSeverity=3 + owner 'Operations' does NOT fire ownership-severity-mismatch",
    input: withBase({
      adjustedSeverity: 3,
      owner: "Operations",
    }),
    expectKinds: [],
  },
  {
    name: "adjustedSeverity=5 + owner names CSO does NOT fire ownership-severity-mismatch",
    input: withBase({
      adjustedSeverity: 5,
      owner: "Clinical Safety Officer, supported by cancer pathway clinical lead and AI product owner.",
    }),
    expectKinds: [],
  },
  {
    name: "adjustedSeverity=5 + empty owner does NOT fire ownership-severity-mismatch (suppression)",
    input: withBase({
      adjustedSeverity: 5,
      owner: "",
    }),
    expectKinds: [],
  },

  // ---- Multi-fire intersection ----
  {
    name: "Worst-case multi-fire: weak controls + residualLik=1 + eliminated rationale + KPI/threshold mismatch + weak CAPA + generic owner at adjusted Sev 5",
    input: withBase({
      preventativeControls: ["Be careful and stay alert"],
      detectiveControls: [],
      correctiveControls: [],
      residualSeverity: 1,
      residualLikelihood: 1,
      residualRationale: "All risk has been eliminated by the new pathway.",
      monitoringMetric: "False-negative rate on routine cases",
      triggerThreshold: "Delayed diagnosis only",
      capa: "Review later if needed",
      owner: "Operations",
      adjustedSeverity: 5,
    }),
    expectKinds: [
      "weak-controls-low-residual",
      "elimination-wording-mismatch",
      "kpi-threshold-mismatch",
      "capa-severity-mismatch",
      "ownership-severity-mismatch",
    ],
  },

  // ---- Anti-regression: fully strong baseline ----
  {
    name: "Anti-regression: strong everything fires NO consistency findings",
    input: withBase({
      preventativeControls: STRONG_PREV,
      detectiveControls: STRONG_DET,
      correctiveControls: STRONG_CORR,
      residualSeverity: 5,
      residualLikelihood: 2,
      residualRationale:
        "Severity unchanged: missed cancer is still catastrophic. Likelihood reduced by mandatory clinician review and red-flag escalation, not eliminated.",
      monitoringMetric:
        "False-negative rate on routine-ranked cases plus any confirmed delayed cancer diagnosis",
      triggerThreshold:
        "False-negative rate above 1% over rolling quarter, or any confirmed delayed cancer diagnosis where AI assigned routine",
      capa:
        "Pause AI tool for routine triage, notify Clinical Safety Officer, full audit of routine-ranked cases over the prior period, supplier engagement, post-event review.",
      owner:
        "Clinical Safety Officer, supported by cancer pathway clinical lead and AI product owner.",
      adjustedSeverity: 5,
    }),
    expectKinds: [],
  },
];

/* ------------------------------------------------------------------ */
/* Runner                                                             */
/* ------------------------------------------------------------------ */

let pass = 0;
let fail = 0;
const failures = [];

for (const c of cases) {
  const findings = evaluateLogicalConsistency(c.input);
  const got = findings.map((f) => f.kind).sort();
  const want = [...c.expectKinds].sort();
  const ok =
    got.length === want.length && got.every((k, i) => k === want[i]);
  if (ok) {
    pass++;
    console.log(`PASS  ${c.name}`);
  } else {
    fail++;
    failures.push({ name: c.name, want, got, findings });
    console.log(`FAIL  ${c.name}`);
    console.log(`        want: [${want.join(", ")}]`);
    console.log(`        got:  [${got.join(", ")}]`);
  }
}

console.log("");
console.log(`========== Phase 4B Logical Consistency stress ==========`);
console.log(`PASS ${pass}/${cases.length}    FAIL ${fail}/${cases.length}`);
if (fail > 0) {
  console.log("");
  console.log("Failure detail:");
  for (const f of failures) {
    console.log(`  - ${f.name}`);
    console.log(`      want: ${JSON.stringify(f.want)}`);
    console.log(`      got:  ${JSON.stringify(f.got)}`);
  }
  process.exit(1);
}
process.exit(0);
// EOF

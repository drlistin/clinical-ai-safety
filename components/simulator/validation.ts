/**
 * Governance validation for the Hazard Log Builder.
 *
 * Rules check the draft entry for issues a senior Clinical Safety Officer
 * would flag during review. Output drives the governance status shown on
 * Page 1 of the PDF and the recommended next step on Page 4.
 *
 * Produces a bidirectional governance-adjusted score:
 *   - When the user UNDER-scored severity/likelihood relative to the
 *     scenario reference, the adjusted score uses the reference (upward).
 *   - When the user OVER-scored relative to the credible severity or
 *     likelihood implied by the described hazard text (e.g. scoring 5/5
 *     for "minor inconvenience"), the adjusted score uses the inferred
 *     ceiling (downward).
 *
 * Safety-direction critical warnings (under-scoring, missing owner,
 * eliminated language, implausible residual) floor governance concern to
 * at least "High". Integrity-direction critical warnings (over-scoring)
 * do NOT floor concern - the actual described hazard remains low.
 *
 * Any critical warning forces the overall-acceptability label to a
 * non-acceptable variant.
 */

import type {
  GovernanceConcern,
  GovernanceStatus,
  Recommendation,
} from "./pdf/types";
import type { KeywordGroup, Scenario } from "@/lib/scenarios/types";

export type ValidationInput = {
  scenario: Scenario;
  hazard: string;
  cause: string;
  consequence: string;
  severity: number;
  likelihood: number;
  residualSeverity: number;
  residualLikelihood: number;
  residualRationale: string;
  preventativeControls: string[];
  detectiveControls: string[];
  correctiveControls: string[];
  monitoringMetric: string;
  triggerThreshold: string;
  reviewFrequency: string;
  capa: string;
  owner: string;
  severityEvidence: string[];
  likelihoodEvidence: string[];
};

/**
 * Control Quality Engine output. Per-line classification of a single control
 * entry. Surfaced both through criticalWarnings/requiredImprovements (PDF +
 * governance scoring) and as a structured field on ValidationResult so the
 * Step 8 UI can render live per-line feedback without re-implementing the
 * regex banks. Scenario-agnostic by design.
 *   - "non-control" : entry is a state-of-mind or one-off communication, not
 *                     an enforceable barrier. Treated as a SAFETY-direction
 *                     critical so it floors governance concern to High.
 *   - "vague"       : entry is auditable in principle but missing the WHO /
 *                     HOW OFTEN / MEASURABLE ACTION needed for governance.
 *                     Surfaced as a required improvement.
 */
export type ControlQualityLevel = "vague" | "non-control";

export type ControlQualityIssue = {
  /** The offending control text (trimmed). */
  text: string;
  level: ControlQualityLevel;
  /** Verbatim user-facing message. Identical between PDF and live UI. */
  message: string;
};

export type ControlType = "preventative" | "detective" | "corrective";

/**
 * Missing-essential finding from the scenario-driven minimum-bar engine.
 * One finding per essential KeywordGroup that wasn't matched in the user's
 * controls of that type. Surfaced both through criticalWarnings (PDF +
 * governance scoring) and through Step 8's MissingEssentialsPanel.
 */
export type MissingEssentialControl = {
  type: ControlType;
  /** Human-readable name of the absent essential (e.g. "clinician review before downgrade"). */
  label: string;
  /** Verbatim user-facing message. Identical between PDF and live UI. */
  message: string;
};

/**
 * Governance & Monitoring Engine output. Per-field classification of the
 * Step 9 "Monitoring and governance" + ownership inputs. Surfaced both
 * through criticalWarnings/requiredImprovements (PDF + governance scoring)
 * and as a structured field on ValidationResult so the Step 9 UI can render
 * live per-field feedback without re-implementing the regex banks.
 *
 * Five rule branches:
 *   1. vague-kpi              (warning) - monitoringMetric is non-measurable
 *   2. weak-trigger           (critical) - triggerThreshold is non-actionable
 *   3. vague-cadence          (warning) - reviewFrequency lacks an interval
 *   4. weak-owner             (critical) - owner is dominated by IT/admin/management/operations with no clinical chain
 *   5. missing-clinical-chain (critical) - owner lacks a clinical accountability indicator
 *
 * "field" identifies which Step 9 input the chip should render under.
 * "owner" issues both render under the single owner field.
 */
export type GovernanceQualityField =
  | "monitoring-metric"
  | "trigger-threshold"
  | "review-cadence"
  | "owner";

export type GovernanceQualityKind =
  | "vague-kpi"
  | "weak-trigger"
  | "vague-cadence"
  | "weak-owner"
  | "missing-clinical-chain";

export type GovernanceQualityLevel = "warning" | "critical";

export type GovernanceQualityIssue = {
  field: GovernanceQualityField;
  kind: GovernanceQualityKind;
  level: GovernanceQualityLevel;
  /** The offending text (trimmed). Full field value, since these are single-input fields. */
  text: string;
  /** Verbatim user-facing message. Identical between PDF and live UI. */
  message: string;
};

export type ValidationResult = {
  status: GovernanceStatus;
  governanceConcern: GovernanceConcern;
  governanceConcernRationale: string;
  criticalWarnings: string[];
  requiredImprovements: string[];
  /** Per-line Control Quality Engine findings, used by Step 8 live UI. */
  controlQuality: ControlQualityIssue[];
  /**
   * Scenario-driven missing-essential controls. Empty when the scenario
   * doesn't declare an `essentialControls` minimum bar, or when the user
   * has not yet entered any controls (suppressed to avoid spamming an
   * empty form).
   */
  missingEssentialControls: MissingEssentialControl[];
  /**
   * Per-field Governance & Monitoring Engine findings, used by Step 9
   * live UI. Includes both warning-level (vague KPI / cadence) and
   * critical-level (weak trigger / weak owner / missing clinical chain)
   * issues. Same engine output also drives PDF criticals/improvements.
   */
  governanceQuality: GovernanceQualityIssue[];
  recommendation: Recommendation;
  recommendationNote: string;
  /** Reference values used to compute the governance-adjusted score. */
  referenceSeverity: number;
  referenceLikelihood: number;
  /** True when the user's score is governance-incorrect in EITHER direction. */
  severityChallenged: boolean;
  likelihoodChallenged: boolean;
  /** True when the user's score exceeds the credible value implied by the described hazard. */
  severityOverstated: boolean;
  likelihoodOverstated: boolean;
  /** Governance-adjusted score uses the governance-correct severity/likelihood. */
  adjustedSeverity: number;
  adjustedLikelihood: number;
  adjustedRiskScore: number;
  adjustedRiskBand: "Low" | "Medium" | "High" | "Extreme";
  /** Overall direction of the score adjustment, if any. */
  scoreAdjustmentDirection: "upward" | "downward" | "mixed" | "none";
  /**
   * If non-empty this MUST be used in place of the band-derived
   * overall acceptability string. Triggered by any critical warning.
   */
  overallAcceptabilityOverride: string;
  /**
   * Text-aware rationales that REPLACE the scenario-template rationales
   * downstream. Required because scenario.feedback.*.rationale is hard-coded
   * to the cancer-pathway frame and must never appear on a non-cancer hazard.
   * Generated from the user's described hazard text, the scoring direction
   * and the user-entered score.
   */
  derivedSeverityRationale: string;
  derivedLikelihoodRationale: string;
};

/* ------------------------------------------------------------------ */
/* Control Quality Engine                                              */
/*                                                                     */
/* Two pattern banks, scenario-agnostic. Vague controls = the wording  */
/* could be auditable but isn't (no WHO / HOW OFTEN / measurable       */
/* trigger). Non-controls = the entry isn't a control barrier at all   */
/* (state-of-mind, one-off communication, "be careful" style copy).   */
/*                                                                     */
/* These supersede the previous WEAK_CONTROL_PATTERNS aggregate. The   */
/* engine is consumed both by runValidation (governance scoring + PDF) */
/* and by Step 8's live UI (per-line feedback chips).                  */
/* ------------------------------------------------------------------ */

// Vague / non-auditable control wording. The activity exists in principle
// but a reviewer can't tell who does it, how often, or what triggers an
// action. These produce a "Required improvement", not a critical warning.
const VAGUE_CONTROL_PATTERNS: RegExp[] = [
  /\bmonitor(ed|ing)?\s+regular(ly)?\b/i,
  /\breview(ed|ing)?\s+regular(ly)?\b/i,
  /\breview(ed|ing)?\s+as\s+needed\b/i,
  /\bperiodic\s+review\b/i,
  /\baudit\s+later\b/i,
  /\bfuture\s+training\b/i,
  /\btake\s+action\s+if\s+required\b/i,
  /\bif\s+(issues?|problems?|something|anything)\s+(happen|happens|arise|arises|occurs?)\b/i,
  /\bmonitor\s+incidents?\b/i,
  // Carry-overs from the previous WEAK_CONTROL_PATTERNS that describe
  // wording-quality issues; the underlying activity COULD be auditable if
  // rewritten with a measurable trigger, so they remain in the vague bucket.
  /\bpolicy\s+(only|alone)\b/i,
  /\breport\s+if\s+noticed\b/i,
  /^\s*monthly\s+review\s+only\s*$/i,
  /\breminder\s+to\b/i,
  /\bencourage(d)?\s+to\b/i,
  // Standalone "staff training" / "training staff" - vague rather than non-
  // control, because "Mandatory annual staff training with competency
  // assessment" IS auditable when written that way. Surfaced as an
  // improvement so the user can rewrite to add WHO / HOW OFTEN / measurable
  // assessment, not as a critical that escalates governance status.
  /\btrain(ing|s)?\s+staff\b/i,
  /\bstaff\s+training\b/i,
];

// Non-controls disguised as controls. State-of-mind, one-off communication,
// or vigilance-style copy. No rewording turns these into an enforceable
// barrier. These produce a CRITICAL warning and are treated as a safety-
// direction critical so they floor governance concern to at least High.
//
// Patterns are deliberately TIGHT (no bare /awareness/ or /vigilance/ — those
// catch legitimate controls like "mandatory situational awareness module
// delivered quarterly with assessment"). A control that genuinely is just
// "staff awareness" still fires via the more specific staff/clinician/user
// + awareness/vigilance patterns below.
const NON_CONTROL_PATTERNS: RegExp[] = [
  /\bstaff\s+aware(ness)?\b/i,
  /\b(clinician|clinical\s+staff|user|users|staff|patient|patients)\s+(awareness|vigilance)\b/i,
  /\b(user|patient|staff|clinician|clinicians)\s+vigilance\b/i,
  /\bbe\s+(careful|vigilant|alert|cautious|mindful)\b/i,
  /\b(clinician|clinicians|staff|users?)\s+(informed|notified|told|reminded|made\s+aware)\b/i,
];

// Verbatim user-facing copy. Kept in one place so the live Step 8 chip and
// the PDF's improvements / criticals lists carry identical wording.
const CONTROL_QUALITY_MESSAGES: Record<ControlQualityLevel, string> = {
  vague:
    "This control is vague or non-auditable. Specify who performs it, how often, and what measurable action occurs.",
  "non-control":
    "This entry does not describe an actual control barrier.",
};

/**
 * Classify a single control entry. Returns null when no issue is detected.
 *
 * Non-control takes precedence over vague: a control that matches both
 * banks (e.g. "staff awareness reviewed regularly") returns the stronger
 * finding. Empty / whitespace-only inputs return null so the caller can
 * pass raw textarea lines without pre-filtering.
 */
export function classifyControl(text: string): ControlQualityLevel | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (anyMatches(trimmed, NON_CONTROL_PATTERNS)) return "non-control";
  if (anyMatches(trimmed, VAGUE_CONTROL_PATTERNS)) return "vague";
  return null;
}

/**
 * Run the Control Quality Engine over a list of control entries. Returns
 * one issue per offending entry, in input order. Scenario-agnostic by
 * design - the same engine is used by every simulator.
 *
 * Consumed by:
 *   1. Step 8's ControlField (live per-line feedback chips)
 *   2. runValidation (governance scoring + PDF criticals/improvements)
 */
export function evaluateControlQuality(
  controls: string[],
): ControlQualityIssue[] {
  const issues: ControlQualityIssue[] = [];
  for (const raw of controls) {
    const level = classifyControl(raw);
    if (!level) continue;
    issues.push({
      text: raw.trim(),
      level,
      message: CONTROL_QUALITY_MESSAGES[level],
    });
  }
  return issues;
}

/* ------------------------------------------------------------------ */
/* Missing Critical Controls Engine                                    */
/*                                                                     */
/* Scenario-driven. Uses the scenario's optional essentialControls     */
/* keyword groups as the minimum-bar set. For each essential group,    */
/* checks whether ANY synonym appears in the user's controls of that   */
/* type. Per-type scoping is intentional: a corrective barrier typed   */
/* into the preventative box does not satisfy the preventative         */
/* essential, because category placement is part of the contract.      */
/*                                                                     */
/* Extensible for future scenarios: any scenario that defines          */
/* essentialControls inherits this behaviour automatically. Scenarios  */
/* that omit the field skip the engine entirely (no-op).               */
/* ------------------------------------------------------------------ */

const CONTROL_TYPE_LABEL: Record<ControlType, string> = {
  preventative: "preventative",
  detective: "detective",
  corrective: "corrective",
};

/** Phrasing per type. Kept short so it composes cleanly into the message. */
const MISSING_ESSENTIAL_TAILS: Record<ControlType, string> = {
  preventative:
    "Add an upstream barrier that explicitly names this control - the scenario cannot ship safely without it.",
  detective:
    "Without this you cannot prove the system is operating safely after go-live.",
  corrective:
    "Document a route to act when the system fails or drifts in production.",
};

/**
 * Test whether ANY of a keyword group's synonyms appears in the joined,
 * lower-cased user text. Word-boundary aware to avoid false positives like
 * "report" matching the substring "reporter".
 */
function keywordGroupCovered(group: KeywordGroup, joinedLower: string): boolean {
  for (const kw of group.any) {
    const needle = kw.toLowerCase().trim();
    if (!needle) continue;
    if (joinedLower.includes(needle)) return true;
  }
  return false;
}

/**
 * Run the missing-essentials engine for one scenario.
 *
 * Returns one finding per essential KeywordGroup that didn't match in the
 * corresponding control type. Returns [] only when the scenario doesn't
 * declare essentialControls.
 *
 * NOTE: this function is intentionally pure - it does NOT suppress on
 * empty input. Callers decide when to call it. This was changed in the
 * Phase-2.2 bug fix because the prior internal suppression
 * (`totalEntered === 0`) was the root cause of the live panel never
 * appearing on Step 8 - a subtle data-path issue meant the engine could
 * be called with empty arrays even when the user had typed text. The two
 * callers handle suppression directly:
 *
 *   - runValidation: uses `allControls.length > 0` (Phase-1 behaviour
 *     preserved exactly)
 *   - Step 8 MissingEssentialsPanel: uses a raw-string check on the
 *     answers, so the panel appears the moment any non-empty text is in
 *     ANY of the six control textareas
 */
export function evaluateMissingEssentials(args: {
  scenario: Scenario;
  preventativeControls: string[];
  detectiveControls: string[];
  correctiveControls: string[];
}): MissingEssentialControl[] {
  const essentials = args.scenario.essentialControls;
  if (!essentials) return [];

  const findings: MissingEssentialControl[] = [];
  const checkType = (
    user: string[],
    groups: KeywordGroup[],
    type: ControlType,
  ) => {
    const joined = user.map((c) => c.toLowerCase()).join(" \n ");
    for (const group of groups) {
      if (keywordGroupCovered(group, joined)) continue;
      findings.push({
        type,
        label: group.label,
        message: `Essential ${CONTROL_TYPE_LABEL[type]} control appears to be missing: "${group.label}". ${MISSING_ESSENTIAL_TAILS[type]}`,
      });
    }
  };

  checkType(args.preventativeControls, essentials.preventative, "preventative");
  checkType(args.detectiveControls, essentials.detective, "detective");
  checkType(args.correctiveControls, essentials.corrective, "corrective");

  return findings;
}

/* ------------------------------------------------------------------ */
/* Governance & Monitoring Engine                                      */
/*                                                                     */
/* Per-field classification of Step 9 inputs against five rule banks.  */
/* Scenario-agnostic. Consumed by:                                     */
/*   1. runValidation - feeds criticalWarnings / requiredImprovements  */
/*      so the PDF and governance status reflect the new findings.     */
/*   2. Step 9 UI - per-field warning chips beneath each input plus a  */
/*      missing-chain banner for the ownership block.                  */
/*                                                                     */
/* Critical-level findings (weak-trigger, weak-owner,                  */
/* missing-clinical-chain) are routed into the SAFETY-direction        */
/* critical bucket so they floor governance concern to High and force  */
/* "Not governance-ready" status. Warning-level findings (vague-kpi,   */
/* vague-cadence) feed `improvements`.                                 */
/* ------------------------------------------------------------------ */

// Vague monitoring metrics. KPI must be auditable with a measurable surface.
const VAGUE_KPI_PATTERNS: RegExp[] = [
  /\bmonitor(ing)?\s+issues?\b/i,
  /\bmonitor(ing)?\s+incidents?\b/i,
  /\bwatch(ing)?\s+trends?\b/i,
  /\breview(ing)?\s+safety\b/i,
];

// Non-actionable trigger thresholds. A threshold must be measurable so a
// reviewer can tell, after the fact, whether escalation should have fired.
const VAGUE_TRIGGER_PATTERNS: RegExp[] = [
  /\bif\s+issues?\s+(happen|happens|occur|occurs|arise|arises)\b/i,
  /\bif\s+problems?\s+(arise|arises|happen|happens|occur|occurs)\b/i,
  /\bif\s+needed\b/i,
  /\bif\s+required\b/i,
  /\bwhen\s+concerns?\s+arise\b/i,
];

// Vague review cadences. A cadence must name a defined interval (weekly,
// monthly, quarterly, every six months, etc.) - bare "regularly" or
// "periodically" cannot be audited.
const VAGUE_CADENCE_PATTERNS: RegExp[] = [
  /^\s*sometimes\s*$/i,
  /\bsometimes\b/i,
  /^\s*regular(ly)?\s*$/i,
  /\bregularly\b/i,
  /^\s*periodic(al)?(ly)?\s*$/i,
  /\bperiodic(al)?ly\b/i,
  /\bad[\s-]?hoc\b/i,
  /\bas\s+(and\s+when\s+)?required\b/i,
  /\bas\s+needed\b/i,
];

// Weak / non-accountable owners. These phrases name a function or
// department but no individual or clinical role. Fired only when no
// clinical chain indicator appears in the same field, so a legitimate
// "Clinical Safety Officer with IT team support" does not trip.
const WEAK_OWNER_PATTERNS: RegExp[] = [
  /\bit\s+team\b/i,
  /^\s*it\s*$/i,
  /\btechnology\s+team\b/i,
  /\badmin(istration|s)?\b/i,
  /\bmanagement\b/i,
  /\boperations\b/i,
];

// Clinical accountability chain indicators. At least one must appear in
// the owner field. Spec lists CSO, Clinical Lead, Pathway Lead, Consultant,
// and "Product Owner + clinical role" - the last is handled naturally by
// requiring any clinical-role indicator (clinician, medical director,
// caldicott) to also satisfy the chain when "Product Owner" is named.
const CLINICAL_CHAIN_PATTERNS: RegExp[] = [
  /\bclinical\s+safety\s+officer\b/i,
  /\bcso\b/i,
  /\bclinical\s+lead\b/i,
  /\bpathway\s+lead\b/i,
  /\bconsultant\b/i,
  /\bclinician\b/i,
  /\bmedical\s+director\b/i,
  /\bcaldicott\b/i,
];

// Verbatim user-facing copy. One source of truth for both PDF and Step 9.
const GOVERNANCE_QUALITY_MESSAGES: Record<GovernanceQualityKind, string> = {
  "vague-kpi":
    "This KPI is vague or non-measurable. Specify an auditable metric.",
  "weak-trigger":
    "This trigger threshold is non-actionable. Define a measurable escalation threshold.",
  "vague-cadence":
    "This review cadence is vague. Specify a defined interval.",
  "weak-owner": "This owner lacks clear accountability.",
  "missing-clinical-chain":
    "No clear clinical accountability chain identified.",
};

const GOVERNANCE_QUALITY_LEVELS: Record<GovernanceQualityKind, GovernanceQualityLevel> = {
  "vague-kpi": "warning",
  "weak-trigger": "critical",
  "vague-cadence": "warning",
  "weak-owner": "critical",
  "missing-clinical-chain": "critical",
};

const GOVERNANCE_QUALITY_FIELDS: Record<GovernanceQualityKind, GovernanceQualityField> = {
  "vague-kpi": "monitoring-metric",
  "weak-trigger": "trigger-threshold",
  "vague-cadence": "review-cadence",
  "weak-owner": "owner",
  "missing-clinical-chain": "owner",
};

/**
 * Run the Governance & Monitoring Engine over the four Step 9 inputs.
 * Returns one issue per offending field plus an extra "missing chain"
 * issue when the owner field has content but no clinical accountability
 * indicator. Pure - empty inputs are tolerated and skipped per-field.
 *
 * Suppression behaviour:
 *   - vague-kpi / weak-trigger / vague-cadence: only fire when the field
 *     has content. Empty fields don't flag (Phase 1 already requires a
 *     basic owner check, but missing KPI/threshold/cadence is handled by
 *     the existing soft "to be defined" placeholder logic, not here).
 *   - weak-owner: fires only when owner contains a weak pattern AND no
 *     clinical chain indicator is present. Prevents false positives on
 *     "Clinical Safety Officer with IT team support".
 *   - missing-clinical-chain: fires only when owner has content but no
 *     clinical chain match. Empty owner is handled by Phase 1 Rule 7.
 */
export function evaluateGovernanceQuality(args: {
  monitoringMetric: string;
  triggerThreshold: string;
  reviewFrequency: string;
  owner: string;
}): GovernanceQualityIssue[] {
  const issues: GovernanceQualityIssue[] = [];

  const push = (kind: GovernanceQualityKind, text: string) => {
    issues.push({
      field: GOVERNANCE_QUALITY_FIELDS[kind],
      kind,
      level: GOVERNANCE_QUALITY_LEVELS[kind],
      text,
      message: GOVERNANCE_QUALITY_MESSAGES[kind],
    });
  };

  const kpi = args.monitoringMetric.trim();
  if (kpi && anyMatches(kpi, VAGUE_KPI_PATTERNS)) {
    push("vague-kpi", kpi);
  }

  const trigger = args.triggerThreshold.trim();
  if (trigger && anyMatches(trigger, VAGUE_TRIGGER_PATTERNS)) {
    push("weak-trigger", trigger);
  }

  const cadence = args.reviewFrequency.trim();
  if (cadence && anyMatches(cadence, VAGUE_CADENCE_PATTERNS)) {
    push("vague-cadence", cadence);
  }

  const owner = args.owner.trim();
  if (owner) {
    const ownerHasWeakPattern = anyMatches(owner, WEAK_OWNER_PATTERNS);
    const ownerHasClinicalChain = anyMatches(owner, CLINICAL_CHAIN_PATTERNS);
    if (ownerHasWeakPattern && !ownerHasClinicalChain) {
      push("weak-owner", owner);
    }
    if (!ownerHasClinicalChain) {
      push("missing-clinical-chain", owner);
    }
  }

  return issues;
}

// Phrases that indicate a weak monitoring or CAPA approach.
const WEAK_MONITORING_PATTERNS = [
  /no\s+issues\s+reported/i,
  /many\s+complaints/i,
  /\byearly\b/i,
  /\bannual(ly)?\b/i,
  /discuss\s+internally/i,
  /informal\s+review/i,
  /^\s*tbd\s*$/i,
];

// AI triage hazards must not claim risk has been eliminated.
const ELIMINATED_PATTERNS = [
  /\beliminat(ed|es|e)\b/i,
  /\bzero\s+risk\b/i,
  /\bno\s+residual\s+risk\b/i,
  /\bcompletely\s+removed?\b/i,
];

// NOTE: clinical-ownership and IT-only ownership patterns previously lived
// here as CLINICAL_OWNERSHIP_PATTERNS / IT_ONLY_PATTERNS. As of the
// Governance & Monitoring Engine they have moved into the engine's banks
// (CLINICAL_CHAIN_PATTERNS / WEAK_OWNER_PATTERNS) so the same logic drives
// both PDF criticals and Step 9 live UI without drift.

// Phrases that imply a credible severity ceiling around 1-2 (minor / admin /
// non-urgent / no clinical impact). Used to detect over-scored severity.
const LOW_SEVERITY_TEXT_MARKERS = [
  /\bminor\s+(inconvenience|delay|disruption|impact|issue|nuisance|wait)\b/i,
  /\badministrative\s+(delay|impact|burden|only|issue)\b/i,
  /\bnon[\s-]?urgent\b/i,
  /\bno\s+(clinical|patient)\s+(impact|harm|consequence)\b/i,
  /\bsmall\s+delay\b/i,
  /\bslight\s+delay\b/i,
  /\bbrief\s+delay\b/i,
  /\boutpatient\s+follow[\s-]?up\b/i,
  /\bfollow[\s-]?up\s+appointment\b/i,
  /\blow[\s-]?acuity\b/i,
  /\bpatient\s+inconvenience\b/i,
  /\binconvenience\s+to\s+(the\s+)?patient\b/i,
  /\bnon[\s-]?clinical\b/i,
  /\bschedul(e|ing|ed)\s+delay\b/i,
  /\brebooked?\b/i,
  /\breschedul(e|ed|ing)\b/i,
  /\bextended\s+wait\b/i,
  /\bappointment\s+delay\b/i,
  /\broutine\s+(appointment|booking|review)\b/i,
];

// Wording that is a positive signal of CREDIBLE high severity (5). Used to
// distinguish a deliberate Sev 5 from an over-scored Sev 5. If any of these
// fire AND a low-severity marker also fires, we treat the entry as ambiguous
// and let the low-severity ceiling apply (the described workflow impact
// dominates).
const HIGH_SEVERITY_TEXT_MARKERS = [
  /\b(death|mortality|fatal|fatality)\b/i,
  /\b(catastrophic|life[\s-]?threatening)\b/i,
  /\b(permanent|lasting|irreversible)\s+(harm|disability|injury|damage)\b/i,
  /\bsevere\s+harm\b/i,
  /\b(missed|delayed)\s+(diagnosis|treatment)\b/i,
];

// Phrases that imply a credible likelihood ceiling around 1-2 (rare /
// isolated / occasional). Used to detect over-scored likelihood.
const RARE_LIKELIHOOD_MARKERS = [
  /\bisolated\s+(incident|case|event|occurrence)\b/i,
  /\brarely?\b/i,
  /\boccasional(ly)?\b/i,
  /\buncommon\b/i,
  /\bone[\s-]?off\b/i,
  /\bedge[\s-]?case\b/i,
  /\bexceptional\b/i,
  /\binfrequent(ly)?\b/i,
  /\bvery\s+rare\b/i,
  /\bseldom\b/i,
];

function anyMatches(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

// Field labels surfaced into PDF criticals/improvements so a reviewer
// reading Page 1 can immediately see WHICH governance input was flagged.
const GOVERNANCE_FIELD_LABEL: Record<GovernanceQualityField, string> = {
  "monitoring-metric": "Monitoring metric / KPI",
  "trigger-threshold": "Trigger threshold",
  "review-cadence": "Review cadence",
  owner: "Owner",
};

/**
 * Compose the PDF / criticalWarnings string for a governance issue. The
 * "missing-clinical-chain" finding has no offending phrase to quote (the
 * problem is the absence of a role), so it formats differently from the
 * vague-/weak- findings that quote the user's text.
 */
function formatGovernanceIssueForPdf(issue: GovernanceQualityIssue): string {
  const fieldLabel = GOVERNANCE_FIELD_LABEL[issue.field];
  if (issue.kind === "missing-clinical-chain") {
    return `${fieldLabel}: ${issue.message} Add a Clinical Safety Officer, clinical lead, pathway lead, or named consultant.`;
  }
  return `${fieldLabel}: "${issue.text}" — ${issue.message}`;
}

export function runValidation(input: ValidationInput): ValidationResult {
  // Two buckets so we can distinguish "the entry is unsafe" criticals from
  // "the entry has integrity issues" criticals. Concern is only floored to
  // High by the former.
  const safetyCritical: string[] = [];
  const integrityCritical: string[] = [];
  const improvements: string[] = [];

  const refSeverity = input.scenario.feedback.severity.expected;
  const refLikelihood = input.scenario.feedback.likelihood.expected;
  // Scoring text is the user-described hazard surface area. Residual
  // rationale and CAPA are intentionally NOT included in the scoring-text
  // signal because their wording can drift away from the hazard itself.
  const scoringText = [input.hazard, input.cause, input.consequence]
    .join(" ")
    .toLowerCase();
  // Full text is used by ownership / language rules that look across the
  // whole entry.
  const allText = [
    input.hazard,
    input.cause,
    input.consequence,
    input.residualRationale,
    input.capa,
  ]
    .join(" ")
    .toLowerCase();
  const isAiTriage = input.scenario.id === "cancer-referral-triage";

  // Inferred ceilings driven by the user-described hazard text. When the
  // text patently implies a low-severity / rare event, scoring 4-5 is a
  // governance issue independent of the scenario reference.
  const sevCeiling = anyMatches(scoringText, LOW_SEVERITY_TEXT_MARKERS) ? 2 : null;
  const likCeiling = anyMatches(scoringText, RARE_LIKELIHOOD_MARKERS) ? 2 : null;

  // Direction flags driven by reference (under) and inferred ceiling (over).
  const severityUnderstated =
    input.severity > 0 && input.severity < refSeverity;
  const likelihoodUnderstated =
    input.likelihood > 0 && input.likelihood < refLikelihood;
  const severityOverstated =
    sevCeiling != null && input.severity > 0 && input.severity > sevCeiling;
  const likelihoodOverstated =
    likCeiling != null && input.likelihood > 0 && input.likelihood > likCeiling;

  // Rule 1. Underestimated severity.
  if (input.severity > 0 && input.severity < refSeverity - 1) {
    safetyCritical.push(
      `Severity scored ${input.severity}. Reference position is ${refSeverity} given the worst-credible patient outcome. Reassess before sign-off.`,
    );
  } else if (input.severity > 0 && input.severity < refSeverity) {
    improvements.push(
      `Severity is one band below the reference. Consider whether the worst-credible outcome is fully captured.`,
    );
  }

  // Rule 1b. Overstated severity (text implies low-impact event).
  if (severityOverstated && input.severity >= sevCeiling! + 2) {
    integrityCritical.push(
      `Severity scored ${input.severity}. Described hazard reads as ${describeLowSeverityFrame(scoringText)} (credible severity around ${sevCeiling}). Score does not match the described workflow impact, reassess before sign-off.`,
    );
  } else if (severityOverstated) {
    improvements.push(
      `Severity scored ${input.severity} but described hazard reads as low-impact. Verify worst-credible severity is genuinely ${input.severity} rather than ${sevCeiling}.`,
    );
  }

  // Rule 2. Underestimated likelihood.
  if (input.likelihood > 0 && input.likelihood < refLikelihood - 1) {
    improvements.push(
      `Likelihood appears optimistic relative to deployment volume. Cross-check with incident data or pilot evidence.`,
    );
  }

  // Rule 2b. Overstated likelihood (text implies isolated/uncommon event).
  if (likelihoodOverstated && input.likelihood >= likCeiling! + 2) {
    integrityCritical.push(
      `Likelihood scored ${input.likelihood}. Described hazard reads as isolated, uncommon or occasional (credible likelihood around ${likCeiling}). Reassess before sign-off.`,
    );
  } else if (likelihoodOverstated) {
    improvements.push(
      `Likelihood scored ${input.likelihood} but described hazard reads as rare or occasional. Verify deployment volume justifies this likelihood.`,
    );
  }

  // Rule 3 has been moved below the governance-adjusted scoring block so the
  // residual plausibility check compares against `adjustedSeverity` rather
  // than the user-entered value. See "Rule 3 (post-adjustment)" further down.

  // Rule 4. Unsupported low residual risk.
  const residualLow =
    input.residualSeverity > 0 &&
    input.residualLikelihood > 0 &&
    input.residualSeverity * input.residualLikelihood <= 5;
  const allEvidence = new Set([
    ...input.severityEvidence,
    ...input.likelihoodEvidence,
  ]);
  const onlyAssumption =
    allEvidence.size === 1 && allEvidence.has("Assumption only");
  if (residualLow && onlyAssumption) {
    improvements.push(
      `Residual risk is rated Low based only on expert assumption. Pilot or audit evidence is needed before claiming acceptability.`,
    );
  }
  const proposedHasContent =
    [
      ...input.preventativeControls,
      ...input.detectiveControls,
      ...input.correctiveControls,
    ].length > 0;
  if (residualLow && !proposedHasContent) {
    improvements.push(
      `Residual risk is rated Low but no controls have been entered. Document the controls that justify the reduction.`,
    );
  }

  // Rule 5 (Control Quality Engine). Per-line classification of every control
  // entry against the vague / non-control pattern banks. Replaces the previous
  // aggregate weak-control count with specific, actionable per-control
  // feedback so reviewers know exactly which entry to rewrite. Scenario-
  // agnostic - the same engine runs for every simulator.
  //
  // - "non-control" issues feed the SAFETY-direction critical bucket so they
  //   floor governance concern to High and force "Not governance-ready"
  //   status (an unenforceable barrier IS a safety problem, not just an
  //   integrity one).
  // - "vague" issues feed the improvements bucket - the underlying activity
  //   could be auditable if rewritten with measurable triggers.
  const allControls = [
    ...input.preventativeControls,
    ...input.detectiveControls,
    ...input.correctiveControls,
  ];
  const controlQuality = evaluateControlQuality(allControls);
  for (const issue of controlQuality) {
    if (issue.level === "non-control") {
      safetyCritical.push(
        `Control "${issue.text}" — ${issue.message} Replace with an enforceable barrier (procedure, hard stop, automated check, mandatory review).`,
      );
    } else {
      improvements.push(`Control "${issue.text}" — ${issue.message}`);
    }
  }

  // Rule 5b (Missing Critical Controls Engine). Scenario-driven minimum-bar
  // check. For each essential KeywordGroup the scenario declares, if no
  // synonym appears in the user's controls of the matching type we surface
  // a SAFETY-direction critical:
  //   - Preventative essentials missing = no upstream barrier to the hazard
  //   - Detective essentials missing    = no way to know if the system is
  //                                       failing safely after deployment
  //   - Corrective essentials missing   = no way to recover when it does
  // All three are safety-critical (not integrity-critical) so they floor
  // governance concern to High and force "Not governance-ready" status.
  // Engine is a no-op for scenarios that don't declare essentialControls.
  //
  // Suppression here uses `allControls.length > 0` to preserve the exact
  // Phase-1 behaviour. The engine itself is pure (no internal suppression);
  // the live UI in Step 8 uses a different, more permissive raw-string
  // check so the panel appears the moment the user types anything.
  const missingEssentialControls =
    allControls.length > 0
      ? evaluateMissingEssentials({
          scenario: input.scenario,
          preventativeControls: input.preventativeControls,
          detectiveControls: input.detectiveControls,
          correctiveControls: input.correctiveControls,
        })
      : [];
  for (const finding of missingEssentialControls) {
    safetyCritical.push(finding.message);
  }

  // Rule 6. Weak monitoring or CAPA.
  const monitoringText = [
    input.monitoringMetric,
    input.triggerThreshold,
    input.reviewFrequency,
    input.capa,
  ];
  const weakMonitoring = monitoringText.some((t) =>
    anyMatches(t, WEAK_MONITORING_PATTERNS),
  );
  if (weakMonitoring) {
    improvements.push(
      `Monitoring or CAPA wording is too informal for governance review. Define measurable triggers and a clear escalation path.`,
    );
  }

  // Rule 7 (Governance & Monitoring Engine). Per-field classification of the
  // four Step 9 inputs (KPI, threshold, cadence, owner). Replaces the
  // previous coarse Rule 7 (empty owner / IT-only / missing-clinical) with
  // the structured engine. The engine is consumed by both this code path
  // (for governance scoring + PDF) and the Step 9 live UI (per-field chips).
  //
  // Routing:
  //   - critical-level findings (weak-trigger, weak-owner, missing-clinical-
  //     chain) feed the SAFETY-direction critical bucket so they floor
  //     governance concern to High and force "Not governance-ready" status.
  //     The actual governance failure is real: no measurable trigger means
  //     no escalation will fire; no clinical chain means no clinician owns
  //     the hazard at sign-off.
  //   - warning-level findings (vague-kpi, vague-cadence) feed improvements.
  //     The activity exists in principle but is not auditable as written.
  //
  // The empty-owner check is preserved (was Phase 1 Rule 7); the engine
  // intentionally doesn't fire on empty fields for the other three inputs
  // because soft placeholders elsewhere (e.g. "to be defined") cover that
  // case at PDF render time.
  if (!input.owner.trim()) {
    safetyCritical.push("No owner has been assigned to this hazard.");
  }
  const governanceQuality = evaluateGovernanceQuality({
    monitoringMetric: input.monitoringMetric,
    triggerThreshold: input.triggerThreshold,
    reviewFrequency: input.reviewFrequency,
    owner: input.owner,
  });
  for (const issue of governanceQuality) {
    const target = issue.level === "critical" ? safetyCritical : improvements;
    target.push(formatGovernanceIssueForPdf(issue));
  }

  // Rule 8. "Risk eliminated" language for AI triage.
  if (isAiTriage && anyMatches(allText, ELIMINATED_PATTERNS)) {
    safetyCritical.push(
      `AI triage hazards cannot be described as eliminated or zero-risk. Restate the residual risk in measurable terms.`,
    );
  }

  // Governance-adjusted scoring (bidirectional). When the user under-scored
  // a dimension we adopt the scenario reference; when they over-scored it
  // we adopt the inferred ceiling implied by the described hazard text.
  // When neither, we adopt the user-entered value (or fall back to the
  // reference if no value was entered yet).
  const severityChallenged = severityUnderstated || severityOverstated;
  const likelihoodChallenged = likelihoodUnderstated || likelihoodOverstated;

  let adjustedSeverity: number;
  if (severityOverstated) adjustedSeverity = sevCeiling!;
  else if (severityUnderstated) adjustedSeverity = refSeverity;
  else adjustedSeverity = input.severity || refSeverity;

  let adjustedLikelihood: number;
  if (likelihoodOverstated) adjustedLikelihood = likCeiling!;
  else if (likelihoodUnderstated) adjustedLikelihood = refLikelihood;
  else adjustedLikelihood = input.likelihood || refLikelihood;

  const adjustedRiskScore = adjustedSeverity * adjustedLikelihood;
  const adjustedRiskBand = bandFor(adjustedRiskScore);

  // Rule 3 (post-adjustment). Unrealistic residual severity reduction.
  //
  // Compared against the governance-adjusted severity, NOT the user-entered
  // value. Rationale: when a user over-scores initial severity (e.g. Sev 5
  // for "minor inconvenience"), the governance-correct severity is the
  // inferred ceiling (Sev 2). A residual severity of 1 against an adjusted
  // severity of 2 is plausible and must not raise a critical warning.
  // Conversely, when the user under-scores, the adjusted severity adopts
  // the reference, so a Sev 1 residual against an adjusted Sev 5 still
  // correctly fires.
  //
  // The check is gated to adjustedSeverity >= 4 because controls don't
  // typically reduce a credible high-severity outcome by more than one band.
  if (
    adjustedSeverity >= 4 &&
    input.residualSeverity > 0 &&
    input.residualSeverity <= adjustedSeverity - 2
  ) {
    safetyCritical.push(
      `Residual severity ${input.residualSeverity} is implausibly low for a governance-adjusted severity of ${adjustedSeverity}. Controls reduce likelihood, rarely severity.`,
    );
  }

  // Overall direction discriminator for downstream UI styling.
  let scoreAdjustmentDirection: "upward" | "downward" | "mixed" | "none";
  const anyUp = severityUnderstated || likelihoodUnderstated;
  const anyDown = severityOverstated || likelihoodOverstated;
  if (anyUp && anyDown) scoreAdjustmentDirection = "mixed";
  else if (anyUp) scoreAdjustmentDirection = "upward";
  else if (anyDown) scoreAdjustmentDirection = "downward";
  else scoreAdjustmentDirection = "none";

  // Governance concern follows the governance-adjusted severity ALONE. This
  // value is already the reference when under-scored, or the inferred ceiling
  // when over-scored, or the user value when honest. Residual severity is
  // intentionally NOT included in the worst-credible calc because:
  //   1. In the over-scored case (e.g. Sev 5/Lik 5 with "minor inconvenience"),
  //      users typically also over-score residual to the same value, which
  //      would re-inflate concern via Math.max and defeat the downward
  //      correction. The actual worst credible severity is the adjusted
  //      ceiling, not the residual the user happened to type.
  //   2. Residual severity by definition cannot exceed initial severity in a
  //      coherent risk assessment (controls reduce risk, they don't add to
  //      it), so it cannot legitimately raise the worst-credible ceiling.
  const worstCredibleSeverity = adjustedSeverity;
  let concern = governanceConcernFor(worstCredibleSeverity);

  // Combine criticals. Safety-direction criticals (under-scoring, missing
  // owner, eliminated language, implausible residual) genuinely indicate an
  // unsafe entry. Integrity-direction criticals (over-scoring) indicate a
  // governance-integrity issue but the actual hazard is low.
  const critical = [...safetyCritical, ...integrityCritical];

  // Status: critical = not ready, soft only = needs review, else acceptable.
  let status: GovernanceStatus;
  if (critical.length > 0) {
    status = "Not governance-ready";
  } else if (improvements.length > 0) {
    status = "Needs review";
  } else {
    status = "Acceptable draft";
  }

  // Floor: only safety-direction criticals lift concern to at least "High".
  // Over-scoring criticals are NOT a safety underestimate, so they must not
  // inflate concern - the actual described hazard is still low.
  if (safetyCritical.length > 0) {
    concern = liftConcernToAtLeastHigh(concern);
  }

  const concernRationale = governanceConcernRationale(
    input.scenario,
    concern,
    severityUnderstated,
    severityOverstated,
    likelihoodOverstated,
    safetyCritical.length > 0,
    scoringText,
  );

  // Text-aware rationales that REPLACE the scenario-template rationales.
  // These are what Page 3's score panels and any in-app score-comparison view
  // should use; the scenario.feedback rationales are cancer-frame specific
  // and must never appear on a non-cancer hazard text.
  const derivedSeverityRationale = deriveSeverityRationale({
    scenario: input.scenario,
    userSeverity: input.severity,
    refSeverity,
    sevCeiling,
    severityUnderstated,
    severityOverstated,
    scoringText,
  });
  const derivedLikelihoodRationale = deriveLikelihoodRationale({
    scenario: input.scenario,
    userLikelihood: input.likelihood,
    refLikelihood,
    likCeiling,
    likelihoodUnderstated,
    likelihoodOverstated,
    scoringText,
  });

  // Recommendation derives from status.
  let recommendation: Recommendation;
  let recommendationNote: string;
  if (status === "Not governance-ready") {
    recommendation = "Not acceptable pending mitigation";
    recommendationNote =
      "Resolve the critical issues listed above before this entry is taken to governance.";
  } else if (status === "Needs review") {
    recommendation = "Proceed to governance review";
    recommendationNote =
      "Take to the Clinical Safety Group with the noted improvements addressed.";
  } else {
    recommendation = "Proceed to governance review";
    recommendationNote =
      "Entry is suitable for review by the Clinical Safety Group as a working draft.";
  }

  // Overall acceptability override: when any critical warning is present
  // the report MUST NOT show "Acceptable" or any positive variant. This
  // overrides the band-derived acceptability label downstream.
  let overallAcceptabilityOverride = "";
  if (critical.length > 0) {
    overallAcceptabilityOverride = "Requires mitigation before sign-off";
  }

  const result: ValidationResult = {
    status,
    governanceConcern: concern,
    governanceConcernRationale: concernRationale,
    criticalWarnings: critical,
    requiredImprovements: improvements,
    controlQuality,
    missingEssentialControls,
    governanceQuality,
    recommendation,
    recommendationNote,
    referenceSeverity: refSeverity,
    referenceLikelihood: refLikelihood,
    severityChallenged,
    likelihoodChallenged,
    severityOverstated,
    likelihoodOverstated,
    adjustedSeverity,
    adjustedLikelihood,
    adjustedRiskScore,
    adjustedRiskBand,
    scoreAdjustmentDirection,
    overallAcceptabilityOverride,
    derivedSeverityRationale,
    derivedLikelihoodRationale,
  };

  // Dev-mode diagnostic: log the validation summary so reviewers can verify
  // the over/under-scoring branches fired against their actual hazard text
  // without rebuilding. Prefixed so it is easy to filter in DevTools.
  if (
    typeof window !== "undefined" &&
    process.env.NODE_ENV !== "production"
  ) {
    // eslint-disable-next-line no-console
    console.debug("[hazard-log/validation]", {
      scoringText,
      sevCeiling,
      likCeiling,
      userSeverity: input.severity,
      userLikelihood: input.likelihood,
      refSeverity,
      refLikelihood,
      severityUnderstated,
      severityOverstated,
      likelihoodUnderstated,
      likelihoodOverstated,
      adjustedSeverity,
      adjustedLikelihood,
      adjustedRiskScore,
      adjustedRiskBand,
      scoreAdjustmentDirection,
      concern: result.governanceConcern,
    });
  }

  return result;
}

function bandFor(score: number): "Low" | "Medium" | "High" | "Extreme" {
  if (score <= 5) return "Low";
  if (score <= 10) return "Medium";
  if (score <= 15) return "High";
  return "Extreme";
}

function liftConcernToAtLeastHigh(c: GovernanceConcern): GovernanceConcern {
  if (c === "Severe" || c === "High") return c;
  return "High";
}

function governanceConcernFor(severity: number): GovernanceConcern {
  if (severity >= 5) return "Severe";
  if (severity >= 4) return "High";
  if (severity >= 3) return "Moderate";
  return "Low";
}

function governanceConcernRationale(
  scenario: Scenario,
  concern: GovernanceConcern,
  severityUnderstated: boolean,
  severityOverstated: boolean,
  likelihoodOverstated: boolean,
  hasSafetyCritical: boolean,
  scoringText: string,
): string {
  // Order matters. Over-scoring branches FIRST so the rationale never
  // paraphrases a scenario worst-outcome that doesn't match the described
  // hazard (e.g. cancer wording leaking into an outpatient-delay entry).
  if (severityOverstated && likelihoodOverstated) {
    return "Submitted scoring overestimates both severity and likelihood compared with the described workflow impact. Governance position is taken from the credible severity and likelihood implied by the described hazard.";
  }
  if (severityOverstated) {
    return "Submitted scoring overestimates the credible severity compared with the described workflow impact. Governance position is based on the credible severity implied by the hazard narrative.";
  }
  if (likelihoodOverstated) {
    return "Submitted scoring overestimates the credible likelihood compared with the described frequency of the event. Governance position is taken from the likelihood implied by the described hazard.";
  }
  // Under-scored severity. Rationale must not paraphrase the unsafe user
  // value, but must also only invoke the scenario worst-outcome when the
  // user's text is consistent with that scenario.
  if (severityUnderstated) {
    return `Potential for ${describeWorstOutcomeFor(scenario, scoringText)} and avoidable harm. Submitted scoring underestimates credible severity, governance position is taken from the reference worst-credible outcome.`;
  }
  if (hasSafetyCritical) {
    return `Critical governance issues are unresolved. Worst-credible outcome remains ${describeWorstOutcomeFor(scenario, scoringText)}, this entry is not acceptable until those issues are mitigated.`;
  }
  if (concern === "Severe" || concern === "High") {
    return `Worst-credible outcome is ${describeWorstOutcomeFor(scenario, scoringText)}. Numerical residual reduction does not lower clinical concern.`;
  }
  if (concern === "Moderate") {
    return "Outcomes are recoverable but warrant active oversight.";
  }
  return "Outcomes are minor and within routine clinical management.";
}

/**
 * Worst-outcome wording is scenario-aware AND text-aware. We only emit the
 * scenario-specific phrase when the user's described hazard text is actually
 * aligned with the scenario template - otherwise we fall back to a generic
 * frame. Prevents stale cancer wording from leaking into outpatient-delay
 * (or any other) entries when the user re-uses the cancer scenario as a
 * canvas for a different hazard.
 */
function describeWorstOutcomeFor(scenario: Scenario, scoringText: string): string {
  if (scenario.id === "cancer-referral-triage") {
    if (/\b(cancer|oncolog|tumour|tumor|malignan|metastas|carcinoma|GI bleed|dysphagia|anaemia|weight loss|red[\s-]?flag)\b/i.test(scoringText)) {
      return "delayed diagnosis of upper GI cancer";
    }
  }
  return "patient harm with potential for lasting clinical impact";
}

/** Short fragment used inside an over-scored severity critical warning. */
function describeLowSeverityFrame(scoringText: string): string {
  if (/\b(minor\s+inconvenience|patient\s+inconvenience|inconvenience\s+to\s+(the\s+)?patient)\b/i.test(scoringText)) {
    return "a minor inconvenience";
  }
  if (/\badministrative\b/i.test(scoringText)) {
    return "an administrative-only impact";
  }
  if (/\bnon[\s-]?urgent\b/i.test(scoringText)) {
    return "a non-urgent workflow impact";
  }
  if (/\bschedul|\brebook|\breschedul/i.test(scoringText)) {
    return "a scheduling-only impact";
  }
  if (/\boutpatient\s+follow[\s-]?up\b|\bfollow[\s-]?up\s+appointment\b/i.test(scoringText)) {
    return "a routine follow-up workflow impact";
  }
  return "a low-impact workflow event";
}

/**
 * Builds a text-aware severity rationale that REPLACES
 * scenario.feedback.severity.rationale downstream. Branches on direction so
 * the wording matches what actually happened to the score, never paraphrases
 * a scenario worst-outcome that doesn't fit the described hazard.
 */
function deriveSeverityRationale(args: {
  scenario: Scenario;
  userSeverity: number;
  refSeverity: number;
  sevCeiling: number | null;
  severityUnderstated: boolean;
  severityOverstated: boolean;
  scoringText: string;
}): string {
  const { scenario, userSeverity, refSeverity, sevCeiling, severityUnderstated, severityOverstated, scoringText } = args;
  if (severityOverstated && sevCeiling != null) {
    return `Submitted severity of ${userSeverity} overestimates the credible severity for the described hazard, which reads as ${describeLowSeverityFrame(scoringText)}. Governance position is severity ${sevCeiling}, taken from the credible workflow impact implied by the entered text.`;
  }
  if (severityUnderstated) {
    return `Submitted severity of ${userSeverity} underestimates the credible worst-case outcome (${describeWorstOutcomeFor(scenario, scoringText)}). Governance position is severity ${refSeverity}, taken from the worst-credible outcome for this scenario.`;
  }
  // Honest scoring or no signal in either direction. Describe the user
  // value in neutral terms; do not paraphrase the scenario template.
  if (userSeverity > 0) {
    return `Submitted severity of ${userSeverity} is consistent with the described hazard. No governance correction applied.`;
  }
  return "Severity has not been scored.";
}

/**
 * Builds a text-aware likelihood rationale that REPLACES
 * scenario.feedback.likelihood.rationale downstream.
 */
function deriveLikelihoodRationale(args: {
  scenario: Scenario;
  userLikelihood: number;
  refLikelihood: number;
  likCeiling: number | null;
  likelihoodUnderstated: boolean;
  likelihoodOverstated: boolean;
  scoringText: string;
}): string {
  const { userLikelihood, refLikelihood, likCeiling, likelihoodUnderstated, likelihoodOverstated, scoringText } = args;
  void scoringText;
  if (likelihoodOverstated && likCeiling != null) {
    return `Submitted likelihood of ${userLikelihood} overestimates the credible frequency for the described hazard, which reads as isolated, occasional or infrequent. Governance position is likelihood ${likCeiling}.`;
  }
  if (likelihoodUnderstated) {
    return `Submitted likelihood of ${userLikelihood} appears optimistic relative to deployment volume for this scenario. Governance position is likelihood ${refLikelihood}, cross-checked against incident or pilot evidence.`;
  }
  if (userLikelihood > 0) {
    return `Submitted likelihood of ${userLikelihood} is consistent with the described frequency of the event. No governance correction applied.`;
  }
  return "Likelihood has not been scored.";
}

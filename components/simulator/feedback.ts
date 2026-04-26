/**
 * Feedback engine for the Hazard Log Builder simulator.
 *
 * Tolerant keyword matching, not exact-phrase comparison. The goal is to
 * recognise when a user has captured the right *concept* in their own words
 * — "delayed diagnosis", "missed cancer", "late referral" should all count
 * for the same idea.
 */

import type {
  KeywordGroup,
  RiskBand,
  ScoreFeedback,
  TextStepFeedback,
} from "@/lib/scenarios/types";

export type GroupMatchResult = {
  matched: KeywordGroup[];
  missed: KeywordGroup[];
};

export type TextStepResult = GroupMatchResult & {
  /** True when the user is describing a failure mode rather than a hazard. */
  describesFailureMode: boolean;
  /** True when input is too short to provide a meaningful answer. */
  tooShort: boolean;
  /** Optional inline hint that the UI may surface live as the user types. */
  liveHint: string | null;
};

const MIN_MEANINGFUL_LENGTH = 12;

function matchKeywordGroups(
  text: string,
  groups: KeywordGroup[],
): GroupMatchResult {
  const lower = text.toLowerCase();
  const matched: KeywordGroup[] = [];
  const missed: KeywordGroup[] = [];
  for (const group of groups) {
    const hit = group.any.some((kw) => lower.includes(kw.toLowerCase()));
    if (hit) matched.push(group);
    else missed.push(group);
  }
  return { matched, missed };
}

export function evaluateTextStep(
  text: string,
  config: TextStepFeedback,
): TextStepResult {
  const trimmed = text.trim();
  const tooShort = trimmed.length < MIN_MEANINGFUL_LENGTH;
  const lower = trimmed.toLowerCase();

  const { matched, missed } = matchKeywordGroups(trimmed, config.groups);

  let describesFailureMode = false;
  if (config.failureModeMarkers && config.failureModeMarkers.length > 0) {
    const hasMarker = config.failureModeMarkers.some((m) =>
      lower.includes(m.toLowerCase()),
    );
    // Treat as "failure mode" only if no patient-harm concept landed.
    describesFailureMode = hasMarker && matched.length === 0;
  }

  let liveHint: string | null = null;
  if (tooShort) {
    liveHint = config.shortInputHint;
  } else if (describesFailureMode && config.failureModeHint) {
    liveHint = config.failureModeHint;
  }

  return { matched, missed, describesFailureMode, tooShort, liveHint };
}

export function evaluateScore(
  given: number,
  config: ScoreFeedback,
): "match" | "close" | "off" {
  const diff = Math.abs(given - config.expected);
  if (diff === 0) return "match";
  if (diff <= config.tolerance) return "close";
  return "off";
}

/**
 * Multi-line user input is split per line and each line is checked against
 * every reference control's keyword group. A control "lands" if any of the
 * user's lines contains any of its keywords.
 */
export function evaluateControls(
  userLines: string[],
  reference: KeywordGroup[],
): GroupMatchResult {
  const joined = userLines.map((l) => l.trim()).filter(Boolean).join(" \n ");
  if (!joined) {
    return { matched: [], missed: reference };
  }
  return matchKeywordGroups(joined, reference);
}

export function calculateInitialRisk(
  severity: number | null,
  likelihood: number | null,
): number | null {
  if (severity == null || likelihood == null) return null;
  return severity * likelihood;
}

export function bandForRisk(score: number | null): RiskBand | null {
  if (score == null) return null;
  if (score <= 5) return "Low";
  if (score <= 10) return "Medium";
  if (score <= 15) return "High";
  return "Extreme";
}

/** Tailwind-friendly colour tokens for each band. */
export const bandStyles: Record<RiskBand, { chip: string; label: string }> = {
  Low: {
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "text-emerald-700",
  },
  Medium: {
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    label: "text-amber-700",
  },
  High: {
    chip: "bg-orange-50 text-orange-700 border-orange-200",
    label: "text-orange-700",
  },
  Extreme: {
    chip: "bg-rose-50 text-rose-700 border-rose-200",
    label: "text-rose-700",
  },
};

export const severityLabels: Record<number, string> = {
  1: "Negligible",
  2: "Minor",
  3: "Moderate",
  4: "Major",
  5: "Catastrophic",
};

export const likelihoodLabels: Record<number, string> = {
  1: "Rare",
  2: "Unlikely",
  3: "Possible",
  4: "Likely",
  5: "Almost certain",
};

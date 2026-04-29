/**
 * Phase 5A — Step 1. Unified visual status system.
 *
 * Single source of truth for every status indicator across the Hazard Log
 * Builder simulator UI. Four fixed semantic levels drive every badge, panel,
 * pill and acceptability label so the surfaces speak one visual language.
 *
 *   ready      GREEN          Governance Ready
 *   review     AMBER          Governance Review Required
 *   not-ready  RED            Not Ready for Deployment
 *   escalate   DARK RED/BLACK Escalate Immediately
 *
 * The "escalate" tier is intentionally distinct from "not-ready". A red panel
 * means the entry is not yet shippable. A near-black-with-red-accent panel
 * means the entry has crossed into a state that requires governance to be
 * notified now (Extreme band, catastrophic under-scoring, severe unresolved
 * critical issues).
 *
 * Public API:
 *
 *   - StatusLevel              union of the four levels
 *   - STATUS_DEFINITIONS       record keyed by StatusLevel; exposes label,
 *                              shortLabel, severityRank, bgColor, textColor,
 *                              borderColor, icon, plus variant class strings
 *                              for the standard UI patterns this simulator
 *                              already uses (panel / pill / row chip / banner
 *                              variants for both light and dark surfaces).
 *   - statusFor(level)         convenience getter; equivalent to
 *                              STATUS_DEFINITIONS[level].
 *   - combineStatuses(...)     returns the worst of N levels by severityRank.
 *   - deriveChallengedStatus(validation)
 *                              maps a ValidationResult to the level that the
 *                              "score has been challenged" badge should show.
 *                              REVIEW by default, NOT-READY when adjusted band
 *                              lands in High, ESCALATE when it lands in
 *                              Extreme. Callers stay decoupled from the
 *                              underlying rules.
 *   - acceptabilityStatusFor(band)
 *                              maps a residual RiskBand to the status level
 *                              implied by acceptabilityFor() in the simulator
 *                              (Low → READY, Medium → REVIEW, High → NOT-READY,
 *                              Extreme → ESCALATE).
 *   - deriveOverallStatus({ validation, residualBand })
 *                              folds challenge state, consistency findings,
 *                              governance-quality issues, scenario expectations
 *                              and the residual band into a single page-level
 *                              status. Used by future Phase 5A steps for an
 *                              overall banner; exposed now so all consumers
 *                              share one derivation.
 *
 * Layout decisions deliberately deferred. This file standardises only the
 * SEMANTIC colours, labels and badge styles. Composition and placement of the
 * surfaces is not changed.
 *
 * Notes on the band chip:
 *   bandStyles in feedback.ts (Low/Medium/High/Extreme → emerald/amber/orange/
 *   rose) is INTENTIONALLY left on its own scale. Bands describe the magnitude
 *   of a numeric risk score, not whether the entry is governance-ready. Folding
 *   them into this palette would conflate "this hazard is high-risk" with
 *   "this entry is not ready", which are different statements. Phase 5A keeps
 *   the two scales separate.
 */

import type { ComponentType, SVGProps } from "react";
import type { RiskBand } from "@/lib/scenarios/types";
import type { ValidationResult } from "./validation";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type StatusLevel = "ready" | "review" | "not-ready" | "escalate";

export const STATUS_LEVELS: readonly StatusLevel[] = [
  "ready",
  "review",
  "not-ready",
  "escalate",
] as const;

/**
 * Tailwind class strings for the four canonical surface variants the
 * simulator already uses. Exposed individually so consumers compose only the
 * variant they actually need rather than slicing apart a single combined
 * string. Ad-hoc combinations are discouraged — pick the variant that matches
 * your surface.
 */
export type StatusVariantClasses = {
  /**
   * Outer rounded card / panel wrapper. Lighter surface tint over a coloured
   * border. Pairs with `panelHeading` and `panelSubtle` for the text inside.
   */
  panel: string;
  panelHeading: string;
  panelSubtle: string;

  /**
   * Compact inline-flex rounded-full pill, uppercase tracked-wider label.
   * The status's `shortLabel` is the typical content. Pairs with the panel
   * variant when used in a panel header, but is also used standalone next to
   * stats and inline labels.
   */
  pill: string;

  /**
   * Full-width row chip used to render a single finding inside a panel
   * (e.g. one consistency finding, one governance-quality issue). Slightly
   * stronger background than the panel surface so the row stands off the
   * panel without competing with it.
   */
  rowChip: string;
  rowText: string;
  rowTitleAccent: string;

  /**
   * Translucent variants for use on the dark navy SummaryCard surface where
   * the full-saturation light-surface variants would clash. Kept in the same
   * status palette so the SummaryCard reads consistently with the rest of
   * the UI without inventing a parallel scheme.
   */
  pillOnDark: string;
  bannerOnDark: string;
  bannerOnDarkText: string;
};

export type StatusDefinition = {
  /** Semantic level (matches the StatusLevel union). */
  level: StatusLevel;

  /** Full enterprise label per Phase 5A spec. Used in panel headers. */
  label: string;

  /**
   * Single-word label for compact pill chips where the full label is too
   * long. "Ready" / "Review" / "Critical" / "Escalate".
   */
  shortLabel: string;

  /**
   * 0=ready, 1=review, 2=not-ready, 3=escalate. Use Math.max(...) to combine
   * multiple signals into the worst level present.
   */
  severityRank: 0 | 1 | 2 | 3;

  /**
   * The strongest single colour-pair for this status. Usable directly when
   * you don't need a specialised variant. Per Phase 5A spec shape.
   */
  bgColor: string;
  textColor: string;
  borderColor: string;

  /**
   * Icon component, rendered as inline SVG. Default sizing is 14px square so
   * it sits cleanly inside the existing pill / panel header layouts. Pass a
   * className to override colour / size; the SVG uses currentColor so the
   * surrounding text colour determines the stroke / fill.
   */
  icon: ComponentType<SVGProps<SVGSVGElement>>;

  /**
   * Pre-composed Tailwind class strings for the four standard UI variants
   * this simulator already uses. Don't mix with the bare bgColor /
   * textColor / borderColor — pick one or the other for any given surface.
   */
  classes: StatusVariantClasses;
};

/* ------------------------------------------------------------------ */
/* Icons                                                              */
/* ------------------------------------------------------------------ */

/**
 * Inline SVG icons for the four status levels. Each uses currentColor so the
 * surrounding text colour drives the stroke. Sized 14px square by default;
 * callers pass className to override.
 */

function ReadyIcon({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className={`h-3.5 w-3.5 flex-none ${className ?? ""}`}
      {...rest}
    >
      <circle
        cx="8"
        cy="8"
        r="6.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 8.25l2.25 2.25L11 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReviewIcon({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className={`h-3.5 w-3.5 flex-none ${className ?? ""}`}
      {...rest}
    >
      <circle
        cx="8"
        cy="8"
        r="6.75"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="8"
        y1="7"
        x2="8"
        y2="11.25"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="8" cy="4.75" r="0.95" fill="currentColor" />
    </svg>
  );
}

function NotReadyIcon({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className={`h-3.5 w-3.5 flex-none ${className ?? ""}`}
      {...rest}
    >
      <path
        d="M8 1.75L14.75 13.75H1.25L8 1.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line
        x1="8"
        y1="6"
        x2="8"
        y2="9.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.5" r="0.95" fill="currentColor" />
    </svg>
  );
}

function EscalateIcon({ className, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className={`h-3.5 w-3.5 flex-none ${className ?? ""}`}
      {...rest}
    >
      {/* Octagon — universal "stop" / escalate visual. */}
      <polygon
        points="5.4,1.5 10.6,1.5 14.5,5.4 14.5,10.6 10.6,14.5 5.4,14.5 1.5,10.6 1.5,5.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line
        x1="8"
        y1="5"
        x2="8"
        y2="9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11" r="0.95" fill="currentColor" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Definitions                                                        */
/* ------------------------------------------------------------------ */

/**
 * The single source of truth. Every status indicator across the simulator UI
 * resolves to one of these four entries.
 *
 * Colour palette decisions:
 *   - ready / review / not-ready re-use the codebase's existing emerald /
 *     amber / rose ramps so the migration is largely a label and structural
 *     refactor rather than a visual change. Existing Phase 1-4B styling for
 *     positives, warnings and criticals continues to read identically.
 *   - escalate is a NEW palette: stone-900 surface with red-50 text and a
 *     red-700 border for light surfaces, plus a translucent red-500 variant
 *     on dark surfaces. The near-black-with-red-accent reads as a clear
 *     escalation step beyond the existing rose-based "critical".
 */
export const STATUS_DEFINITIONS: Record<StatusLevel, StatusDefinition> = {
  ready: {
    level: "ready",
    label: "Governance Ready",
    shortLabel: "Ready",
    severityRank: 0,
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-900",
    borderColor: "border-emerald-200",
    icon: ReadyIcon,
    classes: {
      panel: "rounded-lg border border-emerald-200 bg-emerald-50/60 p-5",
      panelHeading: "text-sm font-semibold text-emerald-900",
      panelSubtle: "mt-1.5 text-xs text-emerald-900",
      pill: "inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800",
      rowChip:
        "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] leading-relaxed text-emerald-900",
      rowText: "text-emerald-900",
      rowTitleAccent: "text-emerald-700",
      pillOnDark:
        "inline-flex items-center gap-1.5 rounded-full border border-emerald-300/50 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-50",
      bannerOnDark:
        "rounded-md border border-emerald-400/40 bg-emerald-500/10 px-4 py-3",
      bannerOnDarkText: "text-emerald-50",
    },
  },

  review: {
    level: "review",
    label: "Governance Review Required",
    shortLabel: "Review",
    severityRank: 1,
    bgColor: "bg-amber-50",
    textColor: "text-amber-900",
    borderColor: "border-amber-200",
    icon: ReviewIcon,
    classes: {
      panel: "rounded-lg border border-amber-200 bg-amber-50/60 p-5",
      panelHeading: "text-sm font-semibold text-amber-900",
      panelSubtle: "mt-1.5 text-xs text-amber-900",
      pill: "inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900",
      rowChip:
        "rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900",
      rowText: "text-amber-900",
      rowTitleAccent: "text-amber-800",
      pillOnDark:
        "inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-50",
      bannerOnDark:
        "rounded-md border border-amber-400/40 bg-amber-500/10 px-4 py-3",
      bannerOnDarkText: "text-amber-50",
    },
  },

  "not-ready": {
    level: "not-ready",
    label: "Not Ready for Deployment",
    shortLabel: "Critical",
    severityRank: 2,
    bgColor: "bg-rose-50",
    textColor: "text-rose-900",
    borderColor: "border-rose-200",
    icon: NotReadyIcon,
    classes: {
      panel: "rounded-lg border border-rose-200 bg-rose-50/60 p-5",
      panelHeading: "text-sm font-semibold text-rose-900",
      panelSubtle: "mt-1.5 text-xs text-rose-800",
      pill: "inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-800",
      rowChip:
        "rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] leading-relaxed text-rose-800",
      rowText: "text-rose-900",
      rowTitleAccent: "text-rose-700",
      pillOnDark:
        "inline-flex items-center gap-1.5 rounded-full border border-rose-300/50 bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-100",
      bannerOnDark:
        "rounded-md border border-rose-400/40 bg-rose-500/10 px-4 py-3",
      bannerOnDarkText: "text-rose-50",
    },
  },

  escalate: {
    level: "escalate",
    label: "Escalate Immediately",
    shortLabel: "Escalate",
    severityRank: 3,
    // Near-black with a red accent. Used at the highest severity step so the
    // user can never confuse "not yet ready" with "this needs escalating to
    // governance now".
    bgColor: "bg-stone-900",
    textColor: "text-red-50",
    borderColor: "border-red-700",
    icon: EscalateIcon,
    classes: {
      panel: "rounded-lg border border-red-700 bg-stone-900 p-5",
      panelHeading: "text-sm font-semibold text-red-50",
      panelSubtle: "mt-1.5 text-xs text-red-100",
      pill: "inline-flex items-center gap-1.5 rounded-full border border-red-700 bg-stone-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-50",
      rowChip:
        "rounded-md border border-red-800/70 bg-stone-900/95 px-3 py-2 text-[11px] leading-relaxed text-red-50",
      rowText: "text-red-50",
      rowTitleAccent: "text-red-200",
      pillOnDark:
        "inline-flex items-center gap-1.5 rounded-full border border-red-500/70 bg-red-600/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-50",
      bannerOnDark:
        "rounded-md border border-red-500/60 bg-red-600/25 px-4 py-3",
      bannerOnDarkText: "text-red-50",
    },
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Convenience getter; equivalent to STATUS_DEFINITIONS[level]. Spelled out
 * because callers usually want the def, not the record.
 */
export function statusFor(level: StatusLevel): StatusDefinition {
  return STATUS_DEFINITIONS[level];
}

/**
 * Returns the worst (highest severityRank) status of N levels. Falls back to
 * "ready" when no levels are passed. Used to fold multiple signals into a
 * single page or panel header status.
 */
export function combineStatuses(...levels: StatusLevel[]): StatusLevel {
  if (levels.length === 0) return "ready";
  let worst: StatusLevel = "ready";
  let worstRank = STATUS_DEFINITIONS.ready.severityRank;
  for (const level of levels) {
    const rank = STATUS_DEFINITIONS[level].severityRank;
    if (rank > worstRank) {
      worst = level;
      worstRank = rank;
    }
  }
  return worst;
}

/**
 * Resolves the status level the "score has been challenged" badge should
 * render at. Centralises the rule so every callsite (per-stat pill,
 * banner-style governance-adjusted callout, future overall-status banner)
 * agrees.
 *
 * Rules:
 *   - REVIEW by default for any challenged score (mild challenge is a "needs
 *     a second pair of eyes" state).
 *   - NOT-READY when the governance-adjusted band lands in High (the user's
 *     score, once corrected, sits in the High band).
 *   - ESCALATE when the adjusted band lands in Extreme — by definition the
 *     hazard is at the top of the matrix and the score should never have
 *     been allowed to under-state it.
 *
 * Callers that DON'T have a challenged score should not call this — there
 * is no badge to show. The function still returns a sensible default
 * ("ready") when called on a clean ValidationResult.
 */
export function deriveChallengedStatus(
  validation: Pick<
    ValidationResult,
    "severityChallenged" | "likelihoodChallenged" | "adjustedRiskBand"
  >,
): StatusLevel {
  const challenged =
    validation.severityChallenged || validation.likelihoodChallenged;
  if (!challenged) return "ready";
  if (validation.adjustedRiskBand === "Extreme") return "escalate";
  if (validation.adjustedRiskBand === "High") return "not-ready";
  return "review";
}

/**
 * Maps a residual RiskBand to the status level implied by the existing
 * acceptabilityFor() text helper:
 *   - Low                              → READY      "Acceptable"
 *   - Medium                           → REVIEW     "Acceptable with active monitoring"
 *   - High                             → NOT-READY  "Not acceptable without further mitigation"
 *   - Extreme                          → ESCALATE   "Not acceptable, escalate immediately"
 *   - null (residual not yet computed) → READY      neutral
 *
 * Centralised so future code can render a coloured acceptability pill from
 * the band without re-deriving the mapping.
 */
export function acceptabilityStatusFor(band: RiskBand | null): StatusLevel {
  switch (band) {
    case "Low":
      return "ready";
    case "Medium":
      return "review";
    case "High":
      return "not-ready";
    case "Extreme":
      return "escalate";
    default:
      return "ready";
  }
}

/**
 * Folds every available signal into a single page-level status. Used by
 * future Phase 5A steps for an overall banner; exposed now so derivations
 * are consistent across consumers.
 *
 * Inputs feeding the fold:
 *   - acceptability of the residual band (Extreme → ESCALATE, etc)
 *   - challenged status (per deriveChallengedStatus)
 *   - any entry in validation.criticalWarnings → at least NOT-READY
 *   - any consistency / governance-quality / scenario-expectation finding
 *     of level "critical" → at least NOT-READY
 *   - any non-critical finding → at least REVIEW
 *
 * The worst level present wins (combineStatuses). This intentionally treats
 * "Extreme residual band" as ESCALATE even when the user has provided strong
 * controls — that's the user's choice and they can explain it in the
 * residual rationale, but the page-level signal still says escalate.
 */
export function deriveOverallStatus(args: {
  validation: ValidationResult;
  residualBand: RiskBand | null;
}): StatusLevel {
  const { validation, residualBand } = args;
  const candidates: StatusLevel[] = [acceptabilityStatusFor(residualBand)];

  if (validation.severityChallenged || validation.likelihoodChallenged) {
    candidates.push(deriveChallengedStatus(validation));
  }
  if (validation.criticalWarnings.length > 0) candidates.push("not-ready");

  for (const f of validation.consistencyFindings) {
    candidates.push(f.level === "critical" ? "not-ready" : "review");
  }
  for (const i of validation.governanceQuality) {
    candidates.push(i.level === "critical" ? "not-ready" : "review");
  }
  for (const f of validation.scenarioExpectations) {
    candidates.push(f.level === "critical" ? "not-ready" : "review");
  }
  if (validation.controlQuality.length > 0) {
    // Any control-quality issue is at least a review-level signal.
    candidates.push("review");
  }
  if (validation.missingEssentialControls.length > 0) {
    candidates.push("not-ready");
  }

  return combineStatuses(...candidates);
}

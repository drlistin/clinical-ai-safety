import type { Scenario } from "./types";

export const cancerReferralTriage: Scenario = {
  id: "cancer-referral-triage",
  name: "AI Cancer Referral Prioritisation Tool",
  shortName: "AI Cancer Referral Triage",

  briefing: {
    deployment:
      "A healthcare organisation deploys an AI tool to prioritise suspected upper GI cancer referrals. The tool ingests the referral text, recent blood results and previous clinical notes, and labels each referral as urgent, soon, or routine.",
    safetyEvent:
      "A patient with weight loss, anaemia and intermittent dysphagia is labelled routine. The relevant red-flag features are present in the record but split across the referral letter, the blood results and the prior clinic notes. The model fails to aggregate them, so the case never reaches the urgent queue.",
    learningGoals: [
      "Distinguish a clinical hazard (patient-facing harm) from a failure mode (how the system went wrong).",
      "Recognise AI-specific failure mechanisms, here, fragmented evidence across data sources.",
      "Build a control set that survives audit: prevention, detection, and correction.",
    ],
  },

  reference: {
    hazard: "Delayed diagnosis of upper GI cancer due to incorrect AI triage prioritisation.",
    cause:
      "Fragmented clinical risk features across referral text, blood results and previous notes are not aggregated correctly by the AI model.",
    sequenceOfEvents:
      "Referral letter, blood results and prior clinic notes contain individual red-flag features (weight loss, anaemia, intermittent dysphagia). The AI model evaluates each data source in isolation and does not aggregate features across them. The referral is labelled routine. The patient enters the routine queue, where the next available appointment is significantly later than the urgent two-week pathway. The cancer progresses while the patient waits.",
    hazardousSituation:
      "A patient with red-flag features for upper GI cancer is placed in the routine assessment queue, exposing them to a clinically significant delay before specialist review.",
    potentialHarm:
      "Avoidable progression of upper GI cancer, delayed initiation of treatment, reduced treatment options at point of diagnosis, and in worst-credible case avoidable mortality.",
    consequence:
      "Delay in urgent specialist assessment, potential progression of malignancy, delayed treatment and possible avoidable harm.",
    severity: 5,
    likelihood: 3,
    controls: {
      preventative: [
        "Mandatory human clinical review before any case is downgraded to routine.",
        "Explicit escalation rule for red-flag combinations (e.g. weight loss + anaemia + dysphagia in older adults).",
        "Minimum data completeness check before the AI output is accepted.",
      ],
      detective: [
        "Audit sample of routine-ranked cases at a defined cadence.",
        "Monitoring of false-negative and downgrade events with a defined trigger threshold.",
      ],
      corrective: [
        "Clear override pathway for clinicians who disagree with the AI label.",
        "Incident reporting route that feeds back to model owners and the clinical safety case.",
      ],
    },
    residualRisk: "Medium",
    residualRiskNote:
      "Medium after controls, not acceptable without active human review and ongoing monitoring.",
    monitoringTrigger:
      "Any confirmed delayed cancer diagnosis where the AI assigned routine, or a false-negative rate above the agreed threshold on the audit sample.",
    owner:
      "Clinical Safety Officer, supported by the cancer pathway clinical lead and the supplier's safety case owner.",
  },

  feedback: {
    hazard: {
      groups: [
        {
          label: "patient-facing delay or missed diagnosis",
          any: ["delay", "delayed", "miss", "missed", "late", "failure to diagnos"],
        },
        {
          label: "the clinical entity (cancer / malignancy)",
          any: ["cancer", "malignan", "tumour", "tumor", "neoplas"],
        },
      ],
      shortInputHint:
        "A hazard is a sentence about patient harm, what could happen to the patient. One short clause is rarely enough.",
      failureModeMarkers: [
        "ai misclassif",
        "model misclassif",
        "wrong label",
        "incorrect label",
        "system error",
        "ai error",
        "model fails",
        "ai fails",
        "fails to aggregate",
        "misclassifies",
      ],
      failureModeHint:
        "That describes the failure mode, how the AI behaved. The hazard is the patient-facing harm, such as delayed diagnosis of upper GI cancer.",
    },
    cause: {
      groups: [
        {
          label: "fragmented or split evidence across sources",
          any: [
            "fragment",
            "split",
            "across",
            "multiple source",
            "different document",
            "different note",
            "different record",
          ],
        },
        {
          label: "failure to aggregate / combine signals",
          any: ["aggregat", "combin", "join", "synthesis", "synthesise", "synthesize", "integrate"],
        },
      ],
      shortInputHint:
        "Describe the mechanism, what the model did or didn't do, and why that produced the wrong label.",
    },
    consequence: {
      groups: [
        {
          label: "delay to specialist assessment or treatment",
          any: ["delay", "specialist", "treatment", "referral", "two-week", "2ww", "urgent"],
        },
        {
          label: "disease progression / avoidable harm",
          any: [
            "progress",
            "advance",
            "spread",
            "metastas",
            "harm",
            "death",
            "mortality",
            "avoidable",
          ],
        },
      ],
      shortInputHint:
        "The consequence is the downstream clinical impact on the patient. Think pathway: what gets delayed, and what happens because of the delay?",
    },
    severity: {
      expected: 5,
      tolerance: 1,
      rationale:
        "Missed or significantly delayed cancer diagnosis is a catastrophic patient outcome. Severity 5 is the standard reference position.",
    },
    likelihood: {
      expected: 3,
      tolerance: 1,
      rationale:
        "The fragmented-evidence pattern is plausible across a meaningful proportion of referrals where information is genuinely distributed across documents, moderate, not rare and not certain.",
    },
    controls: {
      preventative: [
        {
          label: "mandatory human clinical review before downgrade to routine",
          any: ["human review", "clinical review", "clinician review", "manual review", "mandatory review"],
        },
        {
          label: "explicit red-flag escalation rule",
          any: ["red flag", "red-flag", "escalation", "escalate", "rule"],
        },
        {
          label: "data completeness check before accepting AI output",
          any: ["data completeness", "completeness check", "minimum data", "input validation"],
        },
      ],
      detective: [
        {
          label: "audit sample of routine-ranked cases",
          any: ["audit", "sample", "review of routine", "routine ranked", "spot check"],
        },
        {
          label: "false-negative / downgrade monitoring",
          any: ["false negative", "false-negative", "downgrade", "monitor", "monitoring"],
        },
      ],
      corrective: [
        {
          label: "clinician override pathway",
          any: ["override", "manual override", "clinician override", "override pathway"],
        },
        {
          label: "incident reporting route to model owners and safety case",
          any: ["incident", "report", "feedback", "datix", "psirf"],
        },
      ],
    },
  },

  // Minimum-bar control set. Distinct from feedback.controls (the teaching
  // library): if any of these essentials is absent from the user's submission,
  // the governance engine fires a critical warning and floors readiness.
  // Synonym lists are intentionally rich so semantic matching catches
  // reworded user submissions.
  essentialControls: {
    preventative: [
      {
        label: "clinician review before downgrade",
        any: [
          "human review",
          "clinical review",
          "clinician review",
          "manual review",
          "mandatory review",
          "review before downgrade",
          "review prior to downgrade",
          "second opinion",
          "two-clinician",
          "two clinician",
          "double check",
          "double-check",
          "human-in-the-loop",
          "human in the loop",
        ],
      },
      {
        label: "rule-based red-flag escalation",
        any: [
          "red flag",
          "red-flag",
          "escalation rule",
          "rule-based escalation",
          "rule based escalation",
          "deterministic rule",
          "hard rule",
          "explicit rule",
          "guideline-based",
          "criteria-based",
          "trigger rule",
          "auto-escalate",
          "auto escalate",
          "automatic escalation",
        ],
      },
      {
        label: "aggregation / hard-stop logic",
        any: [
          "aggregation",
          "aggregate",
          "feature aggregation",
          "hard stop",
          "hard-stop",
          "block downgrade",
          "prevent downgrade",
          "fail closed",
          "fail-closed",
          "fail safe",
          "fail-safe",
          "interlock",
          "circuit breaker",
          "deny by default",
          "default to urgent",
        ],
      },
    ],
    detective: [
      {
        label: "downgrade audit",
        any: [
          "downgrade audit",
          "audit of downgrade",
          "audit downgrade",
          "downgrade review",
          "audit sample",
          "audit of routine",
          "review of routine",
          "routine ranked",
          "spot check",
          "case review",
        ],
      },
      {
        label: "false-negative monitoring",
        any: [
          "false negative",
          "false-negative",
          "false neg",
          "missed case",
          "missed cases",
          "miss rate",
          "missed diagnosis",
          "sensitivity monitoring",
          "outcome tracking",
          "downstream outcome",
          "downstream outcomes",
        ],
      },
      {
        label: "incident review / monitoring dashboard",
        any: [
          "incident review",
          "incident dashboard",
          "monitoring dashboard",
          "dashboard",
          "kpi tracking",
          "metric tracking",
          "performance dashboard",
          "safety dashboard",
          "telemetry",
          "weekly review meeting",
          "monthly review meeting",
        ],
      },
    ],
    corrective: [
      {
        label: "clinician override pathway",
        any: [
          "override",
          "manual override",
          "clinician override",
          "override pathway",
          "clinician escalation route",
          "manual escalation",
          "override mechanism",
        ],
      },
      {
        label: "pause / disable threshold",
        any: [
          // Variants that include the LABEL itself or are substrings of
          // it. Earlier these were missing — every synonym referenced
          // "model" but the label says "threshold", so a user typing the
          // visible label exactly cleared neither panel. Listed first so
          // the most natural phrasings match cheaply.
          "pause / disable threshold",
          "pause / disable",
          "pause threshold",
          "disable threshold",
          // "Pause-the-AI" phrasing used by the placeholder in
          // ResidualStep. Hyphenated and spaced variants are both kept so
          // a user pasting from the placeholder copy clears the finding.
          "pause the ai",
          "disable the ai",
          "pause ai",
          "disable ai",
          "pause-the-ai",
          // Original model-centric wording.
          "pause model",
          "pause the model",
          "disable model",
          "disable the model",
          "rollback",
          "roll back",
          "kill switch",
          "withdraw model",
          "deactivate model",
          "shut down model",
          "switch off model",
          "freeze deployment",
          "decommission",
          "stop using",
          "remove from production",
          "take offline",
        ],
      },
      {
        label: "supplier escalation / retraining process",
        any: [
          "supplier escalation",
          "vendor escalation",
          "supplier notification",
          "vendor notification",
          "manufacturer notification",
          "notify supplier",
          "notify vendor",
          "notify manufacturer",
          "retrain",
          "retraining",
          "model update",
          "model retrain",
          "post-market surveillance",
          "post market surveillance",
          "pms",
        ],
      },
    ],
  },

  // Phase 4A scenario expectations. Richer than essentialControls: covers
  // the full hazard lifecycle (controls + monitoring + accountability) so
  // governance feedback adapts to what THIS scenario specifically requires.
  // The eight controls in the Phase 4A brief are split across the three
  // ControlType buckets according to their actual function: preventative
  // controls stop the hazard before it occurs (red-flag escalation, urgent
  // pathway protection, clinician review before downgrade), detective
  // controls catch it after the fact (downgrade audit, false-negative
  // monitoring), and corrective controls limit harm and feed learning back
  // (override pathway, pause/disable threshold, supplier escalation /
  // retraining).
  scenarioExpectations: {
    expectedControls: {
      preventative: [
        {
          label: "rule-based red-flag escalation",
          any: [
            "red flag",
            "red-flag",
            "escalation rule",
            "rule-based escalation",
            "rule based escalation",
            "deterministic rule",
            "hard rule",
            "explicit rule",
            "guideline-based",
            "criteria-based",
            "trigger rule",
            "auto-escalate",
            "auto escalate",
            "automatic escalation",
          ],
        },
        {
          label: "urgent pathway protection (no AI downgrade)",
          any: [
            "urgent pathway",
            "two-week wait",
            "two week wait",
            "2ww",
            "two-week pathway",
            "2-week pathway",
            "protect urgent",
            "preserve urgent",
            "no downgrade from urgent",
            "block downgrade from urgent",
            "block downgrade",
            "prevent downgrade",
            "default to urgent",
            "fail safe to urgent",
            "fail-safe to urgent",
            "urgent by default",
          ],
        },
        {
          label: "clinician review before downgrade",
          any: [
            "human review",
            "clinical review",
            "clinician review",
            "manual review",
            "mandatory review",
            "review before downgrade",
            "review prior to downgrade",
            "second opinion",
            "two-clinician",
            "two clinician",
            "double check",
            "double-check",
            "human-in-the-loop",
            "human in the loop",
          ],
        },
      ],
      detective: [
        {
          label: "downgrade audit",
          any: [
            "downgrade audit",
            "audit of downgrade",
            "audit downgrade",
            "downgrade review",
            "audit sample",
            "audit of routine",
            "review of routine",
            "routine ranked",
            "spot check",
            "case review",
          ],
        },
        {
          label: "false-negative monitoring",
          any: [
            "false negative",
            "false-negative",
            "false neg",
            "missed case",
            "missed cases",
            "miss rate",
            "missed diagnosis",
            "sensitivity monitoring",
            "outcome tracking",
            "downstream outcome",
            "downstream outcomes",
          ],
        },
      ],
      corrective: [
        {
          label: "clinician override pathway",
          any: [
            "override",
            "manual override",
            "clinician override",
            "override pathway",
            "clinician escalation route",
            "manual escalation",
            "override mechanism",
          ],
        },
        {
          label: "pause / disable threshold",
          any: [
            // Variants that include the LABEL itself or are substrings of
            // it. Earlier these were missing — every synonym referenced
            // "model" but the label says "threshold", so a user typing
            // the visible label exactly cleared neither panel. Listed
            // first so the most natural phrasings match cheaply.
            "pause / disable threshold",
            "pause / disable",
            "pause threshold",
            "disable threshold",
            // "Pause-the-AI" phrasing used by the placeholder in
            // ResidualStep. Hyphenated and spaced variants are both kept
            // so a user pasting from the placeholder copy clears the
            // finding.
            "pause the ai",
            "disable the ai",
            "pause ai",
            "disable ai",
            "pause-the-ai",
            // Original model-centric wording.
            "pause model",
            "pause the model",
            "disable model",
            "disable the model",
            "rollback",
            "roll back",
            "kill switch",
            "withdraw model",
            "deactivate model",
            "shut down model",
            "switch off model",
            "freeze deployment",
            "decommission",
            "stop using",
            "remove from production",
            "take offline",
          ],
        },
        {
          label: "supplier escalation / retraining process",
          any: [
            "supplier escalation",
            "vendor escalation",
            "supplier notification",
            "vendor notification",
            "manufacturer notification",
            "notify supplier",
            "notify vendor",
            "notify manufacturer",
            "retrain",
            "retraining",
            "model update",
            "model retrain",
            "post-market surveillance",
            "post market surveillance",
            "pms",
          ],
        },
      ],
    },
    expectedMonitoring: {
      kpis: [
        {
          label: "false-negative rate in routine / downgraded referrals",
          any: [
            "false negative",
            "false-negative",
            "false neg",
            "miss rate",
            "missed case",
            "missed cases",
            "missed diagnosis",
            "downgrade rate",
            "sensitivity",
            "downstream outcome",
            "downstream outcomes",
          ],
        },
        {
          label: "confirmed delayed cancer diagnosis after AI downgrade",
          any: [
            "delayed diagnosis",
            "delayed cancer",
            "confirmed delayed",
            "missed cancer",
            "missed diagnosis",
            "delayed treatment",
            "late diagnosis",
            "harm event",
            "patient harm",
            "serious incident",
          ],
        },
      ],
      triggerThresholds: [
        {
          label: "measurable false-negative or downgrade rate threshold",
          any: [
            "false negative",
            "false-negative",
            "miss rate",
            "downgrade rate",
            "rate above",
            "rate exceeds",
            ">",
            "greater than",
            "more than",
            "threshold",
            "%",
            "per month",
            "per quarter",
            "rolling",
          ],
        },
      ],
      reviewCadence: [
        {
          label: "monthly or quarterly cadence",
          any: [
            "month",
            "monthly",
            "quarter",
            "quarterly",
            "every month",
            "every quarter",
            "every three months",
            "every 3 months",
            "every 30 days",
            "every 90 days",
            "csg",
            "clinical safety group",
          ],
        },
      ],
    },
    expectedAccountability: {
      requiredRoles: [
        {
          label: "Clinical Safety Officer",
          any: [
            "clinical safety officer",
            "cso",
            "cs officer",
            "clinical safety lead",
          ],
        },
        {
          label: "Cancer Pathway Clinical Lead",
          any: [
            "cancer pathway clinical lead",
            "cancer pathway lead",
            "pathway clinical lead",
            "pathway lead",
            "cancer lead",
            "cancer clinical lead",
            "tumour pathway lead",
            "tumor pathway lead",
          ],
        },
        {
          label: "Product Owner / AI Owner",
          any: [
            "product owner",
            "ai product owner",
            "ai owner",
            "model owner",
            "system owner",
            "supplier safety case owner",
          ],
        },
      ],
      // Reserved phrasings that count as satisfying the chain even if a
      // listed required role isn't named verbatim. Empty for now; can be
      // expanded as scenarios accumulate alternative legitimate ownership
      // patterns. Suppression rule: when ANY entry below appears in the
      // owner field, ALL missing-required-role findings are suppressed.
      acceptableOwnerPatterns: [],
    },
  },
};

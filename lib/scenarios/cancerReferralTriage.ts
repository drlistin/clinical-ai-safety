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
      "Recognise AI-specific failure mechanisms — here, fragmented evidence across data sources.",
      "Build a control set that survives audit: prevention, detection, and correction.",
    ],
  },

  reference: {
    hazard:
      "Delayed diagnosis of upper GI cancer due to incorrect AI triage prioritisation.",
    cause:
      "Fragmented clinical risk features across referral text, blood results and previous notes are not aggregated correctly by the AI model.",
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
      "Medium after controls — not acceptable without active human review and ongoing monitoring.",
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
          any: [
            "delay",
            "delayed",
            "miss",
            "missed",
            "late",
            "failure to diagnos",
          ],
        },
        {
          label: "the clinical entity (cancer / malignancy)",
          any: ["cancer", "malignan", "tumour", "tumor", "neoplas"],
        },
      ],
      shortInputHint:
        "A hazard is a sentence about patient harm — what could happen to the patient. One short clause is rarely enough.",
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
        "That describes the failure mode — how the AI behaved. The hazard is the patient-facing harm, such as delayed diagnosis of upper GI cancer.",
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
          any: [
            "aggregat",
            "combin",
            "join",
            "synthesis",
            "synthesise",
            "synthesize",
            "integrate",
          ],
        },
      ],
      shortInputHint:
        "Describe the mechanism — what the model did or didn't do, and why that produced the wrong label.",
    },
    consequence: {
      groups: [
        {
          label: "delay to specialist assessment or treatment",
          any: [
            "delay",
            "specialist",
            "treatment",
            "referral",
            "two-week",
            "2ww",
            "urgent",
          ],
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
        "The fragmented-evidence pattern is plausible across a meaningful proportion of referrals where information is genuinely distributed across documents — moderate, not rare and not certain.",
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
};

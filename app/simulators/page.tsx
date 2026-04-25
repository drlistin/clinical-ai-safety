import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Disclaimer from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "Simulators",
  description:
    "Interactive scenarios that let NHS Clinical Safety Officers rehearse hazard log authorship, supplier safety case evaluation, DPIA review, and PSIRF response under realistic conditions.",
};

const simulators = [
  {
    number: 4,
    title: "Hazard Log Builder",
    summary:
      "Work through a realistic AI deployment scenario. Identify hazards, apply controls, export an audit-ready hazard log.",
    href: "/simulators/hazard-log-builder",
    status: "Launch simulator",
  },
  {
    number: 1,
    title: "Safety Case Reviewer",
    summary:
      "Read a realistic supplier Safety Case Report. Flag the claims that need evidence, the controls that do not control, and the assumptions that break under AI.",
    status: "Planned",
  },
  {
    number: 2,
    title: "DPIA Workshop",
    summary:
      "Draft a Data Protection Impact Assessment for an AI-enabled clinical tool. Identify lawful bases, transfers, and residual risk.",
    status: "Planned",
  },
  {
    number: 3,
    title: "Clinical Risk Workshop",
    summary:
      "Facilitate a structured hazard identification session with a mixed clinical team. Walk a scenario from whiteboard to log entry.",
    status: "Planned",
  },
  {
    number: 5,
    title: "Go / No-Go Decision",
    summary:
      "A supplier has submitted final safety documentation. You are chairing the go-live meeting. What do you need to see, and what is missing?",
    status: "Planned",
  },
  {
    number: 6,
    title: "AI Drift Monitoring",
    summary:
      "A deployed model's performance is drifting in a specific patient cohort. Decide what to monitor, what to escalate, and when to pause use.",
    status: "Planned",
  },
  {
    number: 7,
    title: "PSIRF AI Incident",
    summary:
      "A suspected AI-contributed clinical incident has been reported. Plan a PSIRF-compliant response that learns rather than blames.",
    status: "Planned",
  },
  {
    number: 8,
    title: "Vendor Negotiation",
    summary:
      "Rehearse the conversations that most determine deployment safety — the ones with the vendor's clinical lead, not their account manager.",
    status: "Planned",
  },
  {
    number: 9,
    title: "Trust Board Brief",
    summary:
      "Brief a Trust board on the clinical risks of a proposed AI deployment in language that is accurate, honest, and actionable.",
    status: "Planned",
  },
  {
    number: 10,
    title: "Model Update Review",
    summary:
      "A supplier has released a new model version. Decide whether it counts as a change that requires a fresh safety case.",
    status: "Planned",
  },
];

export default function SimulatorsPage() {
  return (
    <>
      <PageHeader
        kicker="Simulators"
        title="Rehearse the decisions before you have to make them."
        lede="Ten interactive scenarios spanning the CSO workflow — from first hazard log through go-live decision to post-deployment drift. The Hazard Log Builder launches first."
      />

      <Section tone="light">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {simulators
            .slice()
            .sort((a, b) => a.number - b.number)
            .map((sim) => {
              const body = (
                <article className="flex h-full flex-col rounded-lg border border-navy-100 bg-white p-8 transition-colors group-hover:border-clinical-300 group-hover:bg-navy-50/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-clinical-700">
                      Simulator {sim.number.toString().padStart(2, "0")}
                    </span>
                    <span className="rounded-full border border-navy-200 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-navy-600">
                      {sim.status}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold leading-snug text-navy-900">
                    {sim.title}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-navy-700">
                    {sim.summary}
                  </p>
                  {sim.href ? (
                    <span className="mt-6 text-sm font-semibold text-clinical-700">
                      Open simulator &rarr;
                    </span>
                  ) : null}
                </article>
              );

              return sim.href ? (
                <Link
                  key={sim.number}
                  href={sim.href}
                  className="group block h-full"
                >
                  {body}
                </Link>
              ) : (
                <div key={sim.number} className="group h-full">
                  {body}
                </div>
              );
            })}
        </div>
      </Section>

      <Disclaimer />
    </>
  );
}

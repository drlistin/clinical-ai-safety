import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Disclaimer from "@/components/Disclaimer";
import HazardLogSimulator from "@/components/simulator/HazardLogSimulator";
import { defaultScenario } from "@/lib/scenarios";

export const metadata: Metadata = {
  title: "Hazard Log Builder",
  description:
    "Work through a realistic clinical AI deployment scenario, identify hazards, apply controls, and export a DCB0129-aligned hazard log entry as a branded PDF.",
};

export default function HazardLogBuilderPage() {
  return (
    <>
      <PageHeader
        kicker="Simulator 04 · Live"
        title="Hazard Log Builder."
        lede="A nine-step rehearsal of the single most important artefact a Clinical Safety Officer produces. Realistic AI deployment scenario, structured feedback at every step, audit-ready PDF export."
      />

      <Section tone="light" id="run">
        <div className="grid gap-10 md:grid-cols-5 md:gap-16">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
              Today&apos;s scenario
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tightish md:text-3xl">
              AI Cancer Referral Prioritisation Tool.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-navy-700 md:text-base">
              An AI tool reads referral text, blood results and prior notes,
              and labels suspected upper GI cancer referrals as urgent, soon,
              or routine. The simulator walks you through one defensible
              hazard log entry for the failure mode that follows when those
              data sources are not aggregated.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-navy-700">
              <li className="flex items-start gap-3">
                <Check />
                <span>9 structured steps · ~10 minutes</span>
              </li>
              <li className="flex items-start gap-3">
                <Check />
                <span>Reference answer with concept-level feedback</span>
              </li>
              <li className="flex items-start gap-3">
                <Check />
                <span>Branded PDF export, audit-ready</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <HazardLogSimulator scenario={defaultScenario} />
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
            What you rehearse
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            Five decisions every hazard entry has to get right.
          </h2>
        </div>

        <ol className="mt-12 grid gap-8 md:grid-cols-2">
          {[
            {
              label: "01",
              title: "Identify the hazard",
              body: "A hazard is not a failure mode. Rehearse the distinction on real clinical workflows where the temptation to merge the two is strongest.",
            },
            {
              label: "02",
              title: "Articulate the clinical consequence",
              body: "Vague consequences produce vague controls. Practise describing harm in clinical terms a reviewer cannot argue with.",
            },
            {
              label: "03",
              title: "Quantify severity and likelihood",
              body: "Honest scoring under time pressure, with the reasoning made explicit. The simulator surfaces the assumptions you did not realise you were making.",
            },
            {
              label: "04",
              title: "Specify a control that controls",
              body: "Training is not a control. Policy is not a control. Rehearse the difference on scenarios where the distinction actually matters.",
            },
            {
              label: "05",
              title: "Decide residual risk",
              body: "Accept, monitor, or reject. The simulator asks you to justify the decision and then pressure-tests the justification.",
            },
          ].map((step) => (
            <li
              key={step.label}
              className="rounded-lg border border-navy-100 bg-white p-8"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
                {step.label}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-navy-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-700">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Disclaimer />
    </>
  );
}

function Check() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className="mt-[6px] h-3.5 w-3.5 flex-none text-clinical-600"
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

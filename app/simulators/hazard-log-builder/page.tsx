import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Disclaimer from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "Hazard Log Builder",
  description:
    "The launch simulator — work through a realistic NHS AI deployment scenario, identify hazards, apply controls, and export a DCB0129-aligned hazard log.",
};

export default function HazardLogBuilderPage() {
  return (
    <>
      <PageHeader
        kicker="Simulator 04 · Launch simulator"
        title="Hazard Log Builder."
        lede="An interactive, feedback-driven rehearsal of the single most important artefact a Clinical Safety Officer produces. Launching with the first three curriculum modules."
      />

      <Section tone="light">
        <div className="grid gap-16 md:grid-cols-5">
          <div className="md:col-span-3 space-y-6 text-lg leading-relaxed text-navy-700">
            <p>
              The Hazard Log Builder walks you through a realistic NHS AI
              deployment scenario one decision at a time. You identify clinical
              hazards, articulate them in language that survives audit,
              quantify severity and likelihood, and specify controls that
              actually control.
            </p>
            <p>
              Structured feedback at each step is modelled on the kind of
              challenge an experienced CSO would bring to your first draft.
              Nothing is graded; everything is interrogated. The output is an
              exportable hazard log you can take back to your Trust and adapt.
            </p>
            <p>
              This is the first of ten simulators. It pairs with Module 5
              (Writing a Hazard Log That Actually Works) but stands alone.
            </p>
          </div>

          <aside className="md:col-span-2">
            <div className="rounded-lg border border-navy-100 bg-navy-50 p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
                Status
              </p>
              <p className="mt-3 text-xl font-semibold text-navy-900">
                In development
              </p>
              <p className="mt-4 text-sm leading-relaxed text-navy-700">
                The Hazard Log Builder is being built in parallel with Modules
                5, 7 and 11. Join the waitlist on the homepage to hear when
                it&apos;s available for the first round of CSO feedback.
              </p>
              <Link
                href="/#launch-modules"
                className="mt-6 inline-flex text-sm font-semibold text-clinical-700 underline-offset-4 hover:underline"
              >
                See the launch modules &rarr;
              </Link>
            </div>
          </aside>
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

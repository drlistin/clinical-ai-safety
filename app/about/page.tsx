import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Disclaimer from "@/components/Disclaimer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Clinical AI Safety is built by Dr Doju Cheriachan — Internal Medicine Trainee at Sheffield Teaching Hospitals, GMC registered, CSO certified. An independent, clinician-led resource for NHS Clinical Safety Officers.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="About"
        title="A resource built by a clinician, for the CSOs doing the work."
        lede="Clinical AI Safety is independent, NHS-focused, and written from frontline experience of the gap between certified theory and real clinical deployment."
      />

      <Section tone="light">
        <div className="grid gap-16 md:grid-cols-5">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
              The author
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Dr Doju Cheriachan
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-navy-600">
              {site.author.credentials}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-navy-600">
              PubMed-indexed author. LLM evaluator. Clinical AI collaborator.
            </p>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-navy-700 md:col-span-3">
            <p>
              The decision to build this resource came from a pattern I kept
              seeing on both sides of NHS AI deployment: certified Clinical
              Safety Officers who understand DCB0129 and DCB0160 in principle,
              and suppliers producing Safety Case documentation that technically
              meets the standard but does not actually describe how the system
              behaves in a real clinical workflow.
            </p>
            <p>
              The gap between those two things is where patients get hurt. And
              it is a gap that existing training, by design, does not fill —
              the certification is necessarily generic, and the application is
              necessarily local.
            </p>
            <p>
              Clinical AI Safety is an attempt to fill that gap honestly. Not
              as a replacement for CSO certification, and not as a substitute
              for a Trust&apos;s own clinical safety processes, but as the practical
              companion most CSOs say they wanted when they were first asked to
              sign off an AI deployment.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="mist">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
            What to expect
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight">
            Clinician-led. Framework-anchored. Scenario-driven.
          </h2>
          <div className="mt-10 grid gap-10 text-navy-700 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-navy-900">
                30 modules
              </h3>
              <p className="mt-3 text-sm leading-relaxed">
                A structured curriculum across hazard identification, safety
                case authorship and review, post-deployment monitoring,
                AI-specific failure modes, and incident response.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-900">
                10 simulators
              </h3>
              <p className="mt-3 text-sm leading-relaxed">
                Interactive scenarios. Hazard log authorship, safety case
                evaluation, DPIA review, PSIRF response exercises. Feedback
                modelled on how a senior CSO would challenge your reasoning.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-900">
                12 frameworks
              </h3>
              <p className="mt-3 text-sm leading-relaxed">
                Every module is explicitly anchored to the relevant standards
                — DCB0129, DCB0160, DTAC, PSIRF, ISO 14971, BS AAMI 34971,
                MHRA AIaMD, UK GDPR, NICE ESF, EU AI Act, AMLAS, ECSF.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-900">
                AI CSO Assistant
              </h3>
              <p className="mt-3 text-sm leading-relaxed">
                An agentic assistant, under active development, designed to
                help CSOs draft hazard entries, review supplier documentation,
                and stress-test a safety case against AI-specific failure
                modes.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Disclaimer />
    </>
  );
}

import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import ModuleCard from "@/components/ModuleCard";
import Disclaimer from "@/components/Disclaimer";
import { launchModules } from "@/lib/site";

export const metadata: Metadata = {
  title: "Modules",
  description:
    "30 modules across the Clinical AI Safety curriculum — hazard identification, safety case authorship and review, supplier evaluation, AI-specific failure modes, post-deployment monitoring, and incident response.",
};

const moduleTracks = [
  {
    title: "Track 1 — Foundations",
    blurb: "The standards, in context, as a practising CSO encounters them.",
    modules: [
      "DCB0129 and DCB0160 in practice",
      "DTAC: what really gets scrutinised",
      "The CSO role in an NHS Trust",
      "Clinical risk management lifecycle",
    ],
  },
  {
    title: "Track 2 — Hazard identification and the log",
    blurb: "From clinical workflow to auditable hazard entry.",
    modules: [
      "Writing a Hazard Log That Actually Works",
      "Quantifying severity and likelihood honestly",
      "Controls that actually control",
      "The hazard log as a living document",
    ],
  },
  {
    title: "Track 3 — Safety case authorship and review",
    blurb: "Writing, reading, and challenging the Clinical Safety Case.",
    modules: [
      "Evaluating a Supplier Safety Case",
      "Writing a deployment-side safety case",
      "What 'sufficient evidence' looks like",
      "Signing the Clinical Safety Case Report",
    ],
  },
  {
    title: "Track 4 — AI-specific failure modes",
    blurb:
      "Where DCB assumptions break and what to do about it.",
    modules: [
      "Why AI Breaks DCB Standards",
      "Distributional shift and drift in deployment",
      "Opacity, explainability and the informed consent question",
      "Human factors when the model is 'usually right'",
    ],
  },
  {
    title: "Track 5 — Post-deployment",
    blurb:
      "Monitoring, incident response, and continuous assurance.",
    modules: [
      "Post-market surveillance for AI",
      "PSIRF response to AI incidents",
      "When to pause, when to withdraw",
      "Re-assessing after model updates",
    ],
  },
];

export default function ModulesPage() {
  return (
    <>
      <PageHeader
        kicker="Curriculum"
        title="30 modules, written for the CSOs doing the work."
        lede="The curriculum is structured across five tracks — foundations, hazard logs, safety cases, AI-specific failure modes, and post-deployment assurance. The three launch modules go live first."
      />

      <Section tone="light" id="launch">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
              Launching first
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
              The three launch modules.
            </h2>
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {launchModules.map((m) => (
            <ModuleCard key={m.number} module={m} />
          ))}
        </div>
      </Section>

      <Section tone="mist" id="tracks">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
            Curriculum structure
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            Five tracks across 30 modules.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {moduleTracks.map((track) => (
            <article
              key={track.title}
              className="rounded-lg border border-navy-100 bg-white p-8"
            >
              <h3 className="text-lg font-semibold text-navy-900">
                {track.title}
              </h3>
              <p className="mt-2 text-sm text-navy-600">{track.blurb}</p>
              <ul className="mt-6 space-y-3 text-sm text-navy-700">
                {track.modules.map((m) => (
                  <li key={m} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-[7px] block h-1.5 w-1.5 flex-none rounded-full bg-clinical-500"
                    />
                    {m}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-navy-600">
          Module list is indicative and evolves with deployment experience.
          Full titles, learning outcomes and framework mappings are published
          as each module goes live.
        </p>
      </Section>

      <Disclaimer />
    </>
  );
}

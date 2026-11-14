import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "About",
  description: "Clinical AI Safety is an independent clinician-led project developing a structured method to challenge clinical AI safety decisions before deployment.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-white py-24 md:py-32">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clinical-700">About the project</p>
          <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.18] tracking-[-0.025em] text-navy-950 md:text-5xl">
            About Clinical AI Safety
          </h1>
          <p className="mt-9 max-w-3xl text-lg leading-[1.85] text-navy-600">
            Clinical AI Safety is an independent project developing a structured method
            for stress-testing clinical AI safety decisions before deployment.
          </p>
        </Container>
      </section>

      <section className="border-t border-navy-100 bg-[#f5f7f9] py-20 md:py-28">
        <Container className="grid gap-14 md:grid-cols-[1fr_1.2fr] md:gap-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clinical-700">The problem</p>
            <h2 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.02em] text-navy-950 md:text-3xl">
              Why safety decisions need testing
            </h2>
          </div>
          <div className="space-y-6 text-base leading-[1.9] text-navy-700">
            <p>
              A clinical AI system may produce a guideline-consistent answer while failing
              to account for delayed action, missing information, conflicting signals
              or the conditions in which a clinician reviews the result.
            </p>
            <p>
              The project examines these interacting hazards and challenges whether the
              proposed controls genuinely reduce risk in the intended clinical workflow.
            </p>
            <p>
              Its output is structured safety reasoning: identified hazards, safeguards,
              remaining risk, unresolved evidence and the governance decisions needed.
              It is not a deployment approval or a substitute for formal safety duties.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20 md:py-28">
        <Container className="grid gap-14 md:grid-cols-[1fr_1.2fr] md:gap-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clinical-700">Project lead</p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-navy-950">Dr Doju Cheriachan</h2>
            <p className="mt-3 text-base text-navy-600">Clinician working on clinical AI safety evaluation.</p>
          </div>
          <div>
            <p className="text-base leading-[1.9] text-navy-700">
              The method is being developed with a focus on UK clinical risk management
              and the practical limits of human oversight in clinical AI workflows.
              DCB0129, DCB0160 and DTAC provide important context, but their applicability
              must be considered for each system and intended use.
            </p>
            <Link href="/#method" className="mt-8 inline-flex rounded-full border border-navy-200 px-6 py-3 text-sm font-semibold text-navy-900 hover:bg-navy-50">
              Read the method <span className="ml-3" aria-hidden="true">↗</span>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

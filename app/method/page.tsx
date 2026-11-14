import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Safety Assessment Method",
  description: "The proposed clinical AI safety decision validation method. Evaluate scenarios, hazards, controls, residual risk and governance before deployment.",
};

const stages = [
  { n: "01", title: "Scenario", purpose: "Set out the AI system, intended use, clinical setting and decision affected.", checks: "Define the workflow boundary, intended users, relevant patient groups, input data and escalation pathway.", output: "A documented assessment context." },
  { n: "02", title: "Hazards", purpose: "Identify potential harm and the circumstances in which it could occur.", checks: "Consider missing information, interacting failures, delayed responses, automation bias and transferred risk.", output: "A traceable hazard and consequence statement." },
  { n: "03", title: "Controls", purpose: "Test whether the proposed safeguards address the identified hazards.", checks: "Check implementation status, operational feasibility, available evidence, ownership and failure of human review.", output: "Control findings with evidence gaps and required action." },
  { n: "04", title: "Residual risk", purpose: "Describe the risk remaining after controls are applied.", checks: "Challenge assumptions about severity, likelihood and risk acceptability. Do not infer risk reduction from an unverified control.", output: "An explicit residual risk judgement, including uncertainty." },
  { n: "05", title: "Governance", purpose: "Record decisions, accountability and escalation requirements.", checks: "Identify unresolved hazards, review authority, monitoring, change control and circumstances requiring reassessment.", output: "A documented decision and open actions for accountable review." },
] as const;

export default function MethodPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-white py-20 md:py-24">
        <Container>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-navy-950 md:text-5xl">Safety assessment method</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy-700">
            A structured method for stress-testing clinical AI safety decisions before deployment.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-navy-600">
            Each assessment moves from a defined scenario to hazards, controls, residual risk and governance.
            The aim is to expose missing safeguards, inconsistent safety reasoning and decisions that lack sufficient evidence.
          </p>
        </Container>
      </section>
      <section className="bg-white py-14 md:py-20">
        <Container>
          <div className="border-t border-navy-200">
            {stages.map((stage) => (
              <article key={stage.n} className="grid gap-5 border-b border-navy-200 py-8 md:grid-cols-[70px_220px_1fr] md:gap-10">
                <p className="font-mono text-sm text-clinical-700">{stage.n}</p>
                <h2 className="text-2xl font-semibold text-navy-950">{stage.title}</h2>
                <div className="max-w-2xl space-y-3 text-sm leading-[1.8] text-navy-700">
                  <p>{stage.purpose}</p>
                  <p><strong className="font-semibold text-navy-950">Validation:</strong> {stage.checks}</p>
                  <p><strong className="font-semibold text-navy-950">Output:</strong> {stage.output}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-t border-navy-100 bg-[#f4f7f9] py-14 md:py-20">
        <Container className="grid gap-8 md:grid-cols-[1fr_1.25fr] md:gap-16">
          <h2 className="text-2xl font-semibold text-navy-950 md:text-3xl">Assessment boundaries</h2>
          <div className="space-y-4 text-sm leading-[1.9] text-navy-700">
            <p>The method is under development. Published material describes the proposed assessment structure, not a clinically validated or certified service.</p>
            <p>It does not approve deployment, certify compliance, replace a Clinical Safety Officer or transfer a manufacturer's or deploying organisation's responsibility for clinical risk management.</p>
            <Link href="/evidence" className="inline-flex font-semibold text-clinical-700 hover:underline">Evidence and limitations →</Link>
          </div>
        </Container>
      </section>
    </>
  );
}

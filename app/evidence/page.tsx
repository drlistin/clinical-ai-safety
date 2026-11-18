import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Evidence and Limitations",
  description: "Development status, evidence requirements and limitations of the Clinical AI Safety decision validation method.",
};

const requirements = [
  ["Traceability", "Each finding should be linked to a scenario fact, identified hazard, proposed control or cited source."],
  ["Control mechanism", "A named safeguard must describe how it prevents, detects, mitigates or supports recovery from the specific hazardous situation."],
  ["Risk-reduction trace", "Initial risk, specific control effects, residual-risk claims and organisation-specific criteria must be linked without inventing risk bands."],
  ["Scenario-specific challenge", "Assessments should identify essential safeguards and interactions relevant to the actual clinical workflow."],
  ["Separate governance decisions", "CSO review, organisational risk acceptance and deployment authorisation must not be conflated."],
] as const;

export default function EvidencePage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-white py-20 md:py-24">
        <Container>
          <h1 className="text-4xl font-semibold leading-tight text-navy-950 md:text-5xl">Evidence and limitations</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy-700">Safety Decision Challenge has a bounded internal research implementation. Change Impact Review remains a proposed capability. Independent clinical validation is outstanding.</p>
        </Container>
      </section>
      <section className="border-b border-navy-100 bg-[#f4f7f9] py-12 md:py-16">
        <Container className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-clinical-700">Development status</p>
            <h2 className="mt-4 text-2xl font-semibold text-navy-950">Internal v0.2 research checks</h2>
          </div>
          <div className="space-y-4 text-sm leading-[1.85] text-navy-700">
            <p>A first deterministic Safety Decision Challenge implementation checks documented context gaps, control-to-hazard mechanisms, evidence links, initial-to-residual risk reasoning and separate governance decisions.</p>
            <p>Technical regression tests cover fictional sound and flawed cases. They establish only software behaviour, not sensitivity, specificity, clinical hazard discovery or real-world safety effectiveness.</p>
            <p>Oxford AVT informs a separate synthetic case. Its published findings cannot establish that any specific local deployment or clinician-review control is safe or effective.</p>
            <p><strong className="font-semibold text-navy-950">Not available:</strong> a public assessment tool, validated clinical decision support, patient-data upload or operational Change Impact Review.</p>
          </div>
        </Container>
      </section>
      <section className="bg-white py-14 md:py-20">
        <Container className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <h2 className="text-2xl font-semibold text-navy-950">Validation requirements</h2>
          <div className="border-t border-navy-200">
            {requirements.map(([title,detail]) => (
              <div key={title} className="border-b border-navy-200 py-6">
                <h3 className="text-base font-semibold text-navy-950">{title}</h3>
                <p className="mt-2 text-sm leading-[1.8] text-navy-700">{detail}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-t border-navy-100 bg-[#f4f7f9] py-14 md:py-20">
        <Container className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <h2 className="text-2xl font-semibold text-navy-950">Current limitations</h2>
          <div className="max-w-2xl space-y-5 text-sm leading-[1.9] text-navy-700">
            <p>No independent clinical validation results, sensitivity estimates or false-negative rates are published here. No automated assessment service or ongoing change monitoring is currently available. The proposed method should not be assumed to detect every unsafe clinical AI decision.</p>
            <p>The system is not a medical device certification, regulatory approval, clinical risk management system or substitute for professional judgement. The prototype does not generate or approve a clinical risk classification. A recorded or claimed category does not establish that a system is safe to deploy.</p>
            <p>Claims will need explicit test cases, reference judgements, evidence provenance, known failure modes and documented independent review before they can be presented as validated performance.</p>
            <Link href="/method" className="inline-flex font-semibold text-clinical-700 hover:underline">Read the proposed method →</Link>
          </div>
        </Container>
      </section>
    </>
  );
}

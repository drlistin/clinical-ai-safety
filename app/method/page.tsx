import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Safety Decision Challenge and Change Impact Review",
  description: "Explore research-stage Safety Decision Challenge v0.2: clinical context, causal safeguards, evidence applicability, residual-risk reasoning and governance. Not a validated assessment service.",
};

const stages = [
  { n: "01", title: "Scenario", purpose: "Define the proposed decision, AI product and version, current practice and clinical workflow.", checks: "Check intended use, users, review timing, consultation scope, downstream documentation and material unknowns.", output: "A dated assessment context with explicit uncertainties." },
  { n: "02", title: "Hazards", purpose: "Trace how conditions in the workflow could lead to patient harm.", checks: "Challenge omissions, wrong-patient transfer, misattribution and interactions between technical and human factors.", output: "Candidate hazard pathways for qualified clinical review." },
  { n: "03", title: "Controls", purpose: "Check whether a proposed safeguard has a genuine mechanism for reducing the associated risk.", checks: "Distinguish a workflow activity from prevention, detection or recovery; check ownership, implementation and effectiveness evidence.", output: "Traceable candidate control-mechanism and evidence findings." },
  { n: "04", title: "Residual risk", purpose: "Test whether the proposed change from initial to residual risk is justified.", checks: "Require the organisation's method, hazard-specific rationale and evidence for claimed control effects; do not assign risk bands.", output: "A challenged risk argument with uncertainty, not automatic acceptability." },
  { n: "05", title: "Governance", purpose: "Separate clinical safety review, organisational risk acceptance and deployment authorisation.", checks: "Check recorded accountability, unresolved findings, incident pathways, monitoring and reassessment triggers.", output: "Required governance evidence and accountable review actions." },
] as const;

export default function MethodPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-white py-20 md:py-24">
        <Container>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-navy-950 md:text-5xl">Safety assessment method</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy-700">
            Two intended professional uses: challenge a proposed safety decision and identify what must be reassessed after a material change.
          </p>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-navy-600">
            Each assessment moves from a defined scenario to hazards, controls, residual risk and governance.
            The aim is to expose missing safeguards, circular control claims, unsupported risk reduction and decisions that lack sufficient evidence.
          </p>
        </Container>
      </section>

      <section className="border-b border-navy-100 bg-[#f4f7f9] py-16">
        <Container className="grid gap-6 lg:grid-cols-2">
          <article id="decision-challenge" className="scroll-mt-28 rounded-xl border border-navy-200 bg-white p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-clinical-700">Before deployment</p>
            <h2 className="mt-4 text-2xl font-semibold text-navy-950">Safety Decision Challenge</h2>
            <p className="mt-5 text-sm leading-[1.85] text-navy-700"><strong>Input:</strong> proposed decision, clinical workflow, hazards, controls and supporting evidence.</p>
            <p className="mt-4 text-sm leading-[1.85] text-navy-700"><strong>Challenge:</strong> omitted or interacting hazards, unverified controls, operational dependencies and inconsistent residual risk claims.</p>
            <p className="mt-4 text-sm leading-[1.85] text-navy-700"><strong>Proposed output:</strong> traceable findings, uncertainty, missing evidence and actions for accountable review.</p>
          </article>
          <article id="change-review" className="scroll-mt-28 rounded-xl border border-navy-200 bg-white p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-clinical-700">After material changes</p>
            <h2 className="mt-4 text-2xl font-semibold text-navy-950">Change Impact Review</h2>
            <p className="mt-5 text-sm leading-[1.85] text-navy-700"><strong>Input:</strong> earlier decision and evidence, plus changes to the model, system, workflow, controls or guidance.</p>
            <p className="mt-4 text-sm leading-[1.85] text-navy-700"><strong>Challenge:</strong> which previous hazards, control assumptions and residual risk conclusions may no longer hold.</p>
            <p className="mt-4 text-sm leading-[1.85] text-navy-700"><strong>Proposed output:</strong> affected conclusions, evidence to revisit and governance review required.</p>
          </article>
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
      <section className="border-t border-navy-100 bg-white py-14 md:py-20">
        <Container>
          <div className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-clinical-700">Research implementation · v0.2</p>
              <h2 className="mt-4 text-2xl font-semibold leading-snug text-navy-950 md:text-3xl">What the internal checks currently test</h2>
              <p className="mt-4 text-sm leading-[1.85] text-navy-600">
                The first deterministic implementation is available in the research codebase. It examines documented
                claims and evidence relationships; it is not a public clinical assessment service.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Control mechanism", "Challenges claimed safeguards that merely describe the activity creating the exposure, or lack an explained risk-reduction mechanism."],
                ["Evidence and applicability", "Checks local evidence references, declared product and workflow scope, dated provenance and basic methodology metadata."],
                ["Initial to residual risk", "Checks that hazard-specific risk changes refer to a documented method, control mechanism and supporting evidence."],
                ["Governance separation", "Requests distinct evidence for CSO review, organisational risk acceptance, deployment authorisation and monitoring."],
              ].map(([title, detail]) => (
                <article key={title} className="rounded-lg border border-navy-200 bg-[#f8fafb] p-5">
                  <h3 className="text-base font-semibold text-navy-950">{title}</h3>
                  <p className="mt-3 text-sm leading-[1.75] text-navy-700">{detail}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-10 border-l-2 border-[#7babb3] bg-[#f4f7f9] px-6 py-5 text-sm leading-[1.85] text-navy-700">
            <strong className="font-semibold text-navy-950">Clinical validation is outstanding.</strong>
            {" "}The implementation does not independently discover hazards, verify real-world control effectiveness,
            authenticate decision-makers, determine risk acceptability or approve deployment. A finding requires
            qualified professional review; no warning is not a safety verdict.
          </div>
        </Container>
      </section>
      <section className="border-t border-navy-100 bg-[#f4f7f9] py-14 md:py-20">
        <Container className="grid gap-8 md:grid-cols-[1fr_1.25fr] md:gap-16">
          <h2 className="text-2xl font-semibold text-navy-950 md:text-3xl">Assessment boundaries</h2>
          <div className="space-y-4 text-sm leading-[1.9] text-navy-700">
            <p>The method is under development. Neither proposed capability is currently an operational, clinically validated or certified assessment service.</p>
            <p>It does not approve deployment, certify compliance, replace a Clinical Safety Officer or transfer a manufacturer&apos;s or deploying organisation&apos;s responsibility for clinical risk management.</p>
            <Link href="/evidence" className="inline-flex font-semibold text-clinical-700 hover:underline">Evidence and limitations →</Link>
          </div>
        </Container>
      </section>
    </>
  );
}

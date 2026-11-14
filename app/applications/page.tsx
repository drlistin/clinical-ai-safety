import type { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Applications",
  description: "Clinical AI use cases for stress-testing safety decisions: referral triage, clinical decision support and ambient clinical documentation.",
};

const applications = [
  {
    title: "Referral and triage systems",
    context: "AI-supported prioritisation of referrals or clinical queues.",
    hazards: "Missing or conflicting information, inappropriate downgrading, delays and loss of escalation signals.",
    controls: "Data aggregation, referral safety rules, clinician review arrangements and a defined override pathway.",
    challenge: "Does the complete workflow detect and act on the missed high-risk case before harm occurs?",
  },
  {
    title: "Clinical decision support",
    context: "AI recommendations used to inform diagnosis, investigation or management.",
    hazards: "Guideline-consistent recommendations that omit contraindications, evolving clinical findings or patient context.",
    controls: "Context checks, uncertainty reporting, clinician verification and defined escalation thresholds.",
    challenge: "Is the review process sufficiently independent and timely to detect consequential omissions?",
  },
  {
    title: "Ambient clinical documentation",
    context: "AI-generated summaries and records from clinical encounters.",
    hazards: "Omitted negatives, incorrect medication details, misattribution and propagation of errors into clinical records.",
    controls: "Source verification, review before sign-off, change tracking and routes to correct an erroneous record.",
    challenge: "What evidence shows that routine sign-off catches clinically significant errors under normal workload?",
  },
] as const;

export default function ApplicationsPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-white py-20 md:py-24">
        <Container>
          <h1 className="text-4xl font-semibold leading-tight text-navy-950 md:text-5xl">Clinical AI applications</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy-700">Examples of clinical workflows where safety decisions require a structured challenge.</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-navy-600">These are illustrative application areas. They are not completed risk assessments or claims about specific products.</p>
        </Container>
      </section>
      <section className="bg-white py-14 md:py-20">
        <Container className="space-y-16">
          {applications.map((item,i) => (
            <article key={item.title} className="grid gap-8 border-b border-navy-200 pb-14 md:grid-cols-[0.85fr_1.15fr] md:gap-20">
              <div>
                <span className="font-mono text-xs text-clinical-700">0{i+1}</span>
                <h2 className="mt-4 text-2xl font-semibold text-navy-950">{item.title}</h2>
                <p className="mt-4 text-sm leading-[1.8] text-navy-600">{item.context}</p>
              </div>
              <dl className="grid gap-6 text-sm leading-[1.8] text-navy-700">
                <div><dt className="font-semibold text-navy-950">Potential hazards</dt><dd className="mt-1">{item.hazards}</dd></div>
                <div><dt className="font-semibold text-navy-950">Controls to validate</dt><dd className="mt-1">{item.controls}</dd></div>
                <div><dt className="font-semibold text-navy-950">Safety challenge</dt><dd className="mt-1">{item.challenge}</dd></div>
              </dl>
            </article>
          ))}
        </Container>
      </section>
    </>
  );
}

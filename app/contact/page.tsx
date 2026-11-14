import type { Metadata } from "next";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Clinical AI Safety regarding clinical AI safety case review, control effectiveness and research collaboration.",
};

const audiences = [
  ["Clinical safety leads", "Independent challenge of hazard reasoning, safeguard effectiveness and residual risk."],
  ["Digital health teams", "Clinical workflow questions that should be resolved before deployment."],
  ["Technology suppliers", "Review of safety case arguments and the evidence supporting proposed controls."],
  ["Research collaborators", "Methods for identifying unsafe decisions and evaluating clinical AI safeguards."],
] as const;

export default function ContactPage() {
  return (
    <>
      <section className="bg-white py-24 md:py-32">
        <Container>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clinical-700">Contact</p>
          <h1 className="mt-7 max-w-4xl text-4xl font-semibold leading-[1.18] tracking-[-0.025em] text-navy-950 md:text-5xl">
            Contact Clinical AI Safety
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-[1.85] text-navy-600">
            For professional enquiries about safety decision validation,
            clinical workflow risks or potential research collaboration.
          </p>
        </Container>
      </section>
      <section className="border-t border-navy-100 bg-[#f5f7f9] py-20 md:py-28">
        <Container className="grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:gap-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clinical-700">Email enquiries</p>
            <p className="mt-6 break-words text-xl font-semibold tracking-tight text-navy-950 md:text-2xl">
              hello@clinicalaisafety.co.uk
            </p>
            <p className="mt-5 max-w-md text-sm leading-[1.85] text-navy-600">
              Please describe the system, intended clinical use and the question you
              would like to discuss. Do not send patient-identifiable information.
            </p>
          </div>
          <div className="border-t border-navy-200">
            {audiences.map(([title, detail]) => (
              <div key={title} className="grid gap-2 border-b border-navy-200 py-6 sm:grid-cols-[170px_1fr]">
                <h2 className="text-sm font-semibold text-navy-950">{title}</h2>
                <p className="text-sm leading-[1.8] text-navy-600">{detail}</p>
              </div>
            ))}
            <p className="mt-7 text-xs leading-relaxed text-navy-500">
              Enquiries do not constitute a clinical safety assessment or an agreement to provide services.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}

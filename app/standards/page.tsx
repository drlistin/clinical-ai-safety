import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";

export const metadata: Metadata = {
  title: "UK Clinical Safety Standards",
  description: "Primary NHS sources for DCB0129, DCB0160 and DTAC and their relationship to clinical AI safety decision validation.",
};

const sources = [
  {
    code: "DCB0129",
    name: "Clinical risk management for manufacturers",
    scope: "Clinical risk management for organisations developing and maintaining health IT systems.",
    relevance: "Supplier safety cases, documented hazards, risk controls and supporting evidence.",
    url: "https://standards.nhs.uk/published-standards/clinical-risk-management-its-application-in-the-manufacture-of-health-it-systems",
    publisher: "NHS England Standards Directory",
  },
  {
    code: "DCB0160",
    name: "Clinical risk management for deployment and use",
    scope: "Clinical risk management for organisations deploying and using health IT systems.",
    relevance: "Local workflow, transferred risk, implementation controls and accountable review.",
    url: "https://standards.nhs.uk/published-standards/clinical-risk-management-its-application-in-the-deployment-and-use-of-health-it-systems",
    publisher: "NHS England Standards Directory",
  },
  {
    code: "DTAC",
    name: "Digital Technology Assessment Criteria",
    scope: "NHS assessment criteria spanning clinical safety, data protection, technical assurance, interoperability and usability.",
    relevance: "Wider assessment context. DTAC does not replace a clinical safety case or local risk management.",
    url: "https://digital.nhs.uk/developer/assurance",
    publisher: "NHS England Digital",
  },
] as const;

export default function StandardsPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-white py-20 md:py-24">
        <Container>
          <h1 className="text-4xl font-semibold leading-tight text-navy-950 md:text-5xl">UK clinical safety standards</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy-700">
            Regulatory and assurance references relevant to clinical AI safety assessments.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-[1.8] text-navy-600">
            This project applies a decision validation method informed by clinical risk management practice. It is not endorsed by NHS England and does not determine compliance.
          </p>
        </Container>
      </section>
      <section className="bg-white py-14 md:py-20">
        <Container>
          <div className="border-t border-navy-200">
            {sources.map((item) => (
              <article key={item.code} className="grid gap-7 border-b border-navy-200 py-10 md:grid-cols-[200px_1fr] md:gap-16">
                <h2 className="text-2xl font-semibold text-navy-950">{item.code}</h2>
                <div className="max-w-2xl space-y-4 text-sm leading-[1.85] text-navy-700">
                  <h3 className="text-lg font-semibold text-navy-950">{item.name}</h3>
                  <p>{item.scope}</p>
                  <p><strong className="font-semibold text-navy-950">Relevance:</strong> {item.relevance}</p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex font-semibold text-clinical-700 hover:underline">
                    Official source: {item.publisher} ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm leading-[1.85] text-navy-600">
            NHS England announced a national review of DCB0129 and DCB0160 in 2026. Check the official standards at the point of assessment for current requirements and applicability.
          </p>
          <Link href="/evidence" className="mt-6 inline-flex text-sm font-semibold text-clinical-700 hover:underline">Evidence and limitations →</Link>
        </Container>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Disclaimer from "@/components/Disclaimer";
import { frameworks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Framework references, source documents, and further reading for NHS Clinical Safety Officers applying DCB0129, DCB0160, DTAC, PSIRF, ISO 14971 and AI safety frameworks.",
};

const primarySources = [
  {
    code: "DCB0129",
    title: "Clinical Risk Management: its Application in the Manufacture of Health IT Systems",
    publisher: "NHS Digital / NHS England",
    note: "Manufacturer-side clinical risk management and Safety Case requirements.",
  },
  {
    code: "DCB0160",
    title:
      "Clinical Risk Management: its Application in the Deployment and Use of Health IT Systems",
    publisher: "NHS Digital / NHS England",
    note: "Deployment-side clinical risk management obligations for NHS organisations.",
  },
  {
    code: "DTAC",
    title: "Digital Technology Assessment Criteria for Health and Social Care",
    publisher: "NHS England",
    note: "Baseline assessment across clinical safety, data protection, technical assurance, interoperability and usability.",
  },
  {
    code: "PSIRF",
    title: "Patient Safety Incident Response Framework",
    publisher: "NHS England",
    note: "National framework for responding to and learning from patient safety incidents.",
  },
  {
    code: "ISO 14971:2019",
    title: "Application of Risk Management to Medical Devices",
    publisher: "ISO",
    note: "The international baseline for risk management in medical devices.",
  },
  {
    code: "BS/AAMI 34971",
    title: "Application of ISO 14971 to Machine Learning in AI Medical Devices",
    publisher: "BSI / AAMI",
    note: "Guidance on AI-specific failure modes and risk management.",
  },
  {
    code: "MHRA",
    title: "Software and AI as a Medical Device Change Programme",
    publisher: "Medicines and Healthcare products Regulatory Agency",
    note: "The MHRA's evolving regulatory position on software and AI as a medical device in the UK.",
  },
  {
    code: "ICO",
    title: "Guidance on AI and Data Protection",
    publisher: "Information Commissioner's Office",
    note: "How UK GDPR applies to AI systems, including DPIA expectations.",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        kicker="Resources"
        title="The standards behind the curriculum."
        lede="Every module points back to primary sources. Start with the standards; the modules translate them into the decisions you will actually face on a Trust."
      />

      <Section tone="light">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
            Primary sources
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            Start with the documents that govern the work.
          </h2>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {primarySources.map((s) => (
            <li
              key={s.title}
              className="rounded-lg border border-navy-100 bg-white p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-clinical-700">
                {s.code}
              </p>
              <h3 className="mt-2 text-base font-semibold text-navy-900">
                {s.title}
              </h3>
              <p className="mt-1 text-xs text-navy-500">{s.publisher}</p>
              <p className="mt-4 text-sm leading-relaxed text-navy-700">
                {s.note}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-navy-500">
          Direct links to source documents are deliberately omitted from the
          MVP: authoritative URLs for several of these standards change
          without redirect. Search the publisher&apos;s site for the current
          version.
        </p>
      </Section>

      <Section tone="mist" id="frameworks">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
            Frameworks at a glance
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            Twelve frameworks, in one place.
          </h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-navy-100 bg-navy-100 sm:grid-cols-2 lg:grid-cols-3">
          {frameworks.map((fw) => (
            <div key={fw.code} className="bg-white p-6">
              <p className="text-sm font-semibold text-navy-900">{fw.code}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-clinical-700">
                {fw.name}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-navy-700">
                {fw.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Disclaimer />
    </>
  );
}

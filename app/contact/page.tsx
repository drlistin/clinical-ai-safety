import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Disclaimer from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Clinical AI Safety — for NHS trusts, CSOs, CCIOs, HealthTech founders, researchers, and collaborators.",
};

const audiences = [
  {
    heading: "NHS Trusts and ICBs",
    body: "Deploying AI and want an independent view of supplier safety case documentation, or training for CSOs and clinical digital teams.",
  },
  {
    heading: "HealthTech suppliers",
    body: "Preparing DCB0129 documentation, a DTAC submission, or MHRA AIaMD evidence and want to pressure-test it before a Trust does.",
  },
  {
    heading: "CCIOs, CSOs, CNIOs",
    body: "Navigating first AI deployments and want a thinking partner who has read the standards and worked in real clinical settings.",
  },
  {
    heading: "Researchers and collaborators",
    body: "Working on clinical AI safety and interested in joint projects, writing, or teaching.",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Get in touch."
        lede="Clinical AI Safety is built by a frontline clinician. Direct, signal-rich conversations only — no marketing funnels."
      />

      <Section tone="light">
        <div className="grid gap-16 md:grid-cols-5">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
              Email
            </p>
            <p className="mt-4 text-xl font-semibold text-navy-900">
              hello@clinicalaisafety.co.uk
            </p>
            <p className="mt-4 text-sm leading-relaxed text-navy-600">
              Email remains the most reliable way to get a thoughtful
              response. Please include a sentence or two of context so I can
              route your message.
            </p>

            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
              Press
            </p>
            <p className="mt-4 text-sm leading-relaxed text-navy-600">
              I am happy to speak to journalists writing on NHS digital
              clinical safety, AI governance, or CSO practice. Please identify
              the outlet and deadline in your first message.
            </p>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-2xl font-semibold text-navy-900">
              Who this resource is for
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {audiences.map((a) => (
                <div
                  key={a.heading}
                  className="rounded-lg border border-navy-100 bg-white p-6"
                >
                  <h3 className="text-base font-semibold text-navy-900">
                    {a.heading}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-700">
                    {a.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Disclaimer />
    </>
  );
}

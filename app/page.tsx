import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";

const stages = [
  { number: "01", title: "Scenario", detail: "Define the clinical decision, setting and people affected." },
  { number: "02", title: "Hazards", detail: "Identify failure paths, including combined low-risk signals." },
  { number: "03", title: "Controls", detail: "Test whether the safeguards would work in the actual workflow." },
  { number: "04", title: "Residual risk", detail: "State the remaining risk and the evidence behind the judgement." },
  { number: "05", title: "Governance", detail: "Record accountability, challenge and escalation requirements." },
] as const;

const applications = [
  {
    index: "01",
    title: "Clinical decision support",
    detail: "A recommendation may be clinically plausible while omitting context that changes the safe action.",
    focus: "Decision context and escalation",
  },
  {
    index: "02",
    title: "Referral and triage systems",
    detail: "Individually modest errors may interact with delays, workload and unclear handovers.",
    focus: "Cumulative risk and workflow",
  },
  {
    index: "03",
    title: "Ambient clinical documentation",
    detail: "Human review may be listed as a control without evidence that it catches important omissions.",
    focus: "Control effectiveness",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[59%] lg:block" aria-hidden="true">
          <Image
            src="/governance-hero.webp"
            alt=""
            fill
            priority
            sizes="(min-width: 1280px) 59vw, 60vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 via-[16%] to-transparent" />
        </div>
        <Container className="relative flex min-h-[570px] items-center py-20 md:min-h-[620px] md:py-24">
          <div className="max-w-[690px] lg:max-w-[670px]">
            <h1 className="text-[clamp(2.65rem,4.5vw,4.55rem)] font-semibold leading-[1.13] tracking-[-0.035em] text-navy-950">
              Validate safety decisions before deployment
            </h1>
            <p className="mt-8 max-w-[620px] text-lg leading-[1.75] text-navy-700 md:text-xl">
              A system for stress-testing clinical AI safety decisions before deployment.
            </p>
            <p className="mt-4 max-w-[600px] text-base leading-[1.8] text-navy-600">
              Identify hazards, assess controls, classify residual risk and establish governance requirements.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/method" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-navy-950 px-7 text-sm font-semibold text-white transition-colors hover:bg-navy-800">
                How the method works <span className="ml-3" aria-hidden="true">→</span>
              </Link>
              <Link href="/applications" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-navy-300 bg-white px-7 text-sm font-semibold text-navy-950 transition-colors hover:bg-navy-50">
                Applications
              </Link>
            </div>
          </div>
        </Container>
        <div className="absolute bottom-3 right-5 hidden text-[10px] text-navy-600 lg:block">
          Illustrative governance documentation. Not official publications.
        </div>
      </section>

      <section className="border-y border-navy-100 bg-white">
        <Container className="grid gap-0 py-7 sm:grid-cols-2 lg:grid-cols-4 lg:py-10">
          {[
            ["UK standards", "DCB0129, DCB0160 and DTAC", "/standards"],
            ["Clinical applications", "Decision support, triage and documentation", "/applications"],
            ["Control effectiveness", "Validate safeguards and evidence", "/method"],
            ["Governance decisions", "Risk ownership, review and escalation", "/method"],
          ].map(([title, detail, href]) => (
            <Link href={href} key={title} className="block border-b border-navy-100 px-0 py-5 last:border-b-0 sm:px-5 sm:first:pl-0 sm:nth-child-2:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:last:pr-0 lg:py-2">
              <h2 className="text-sm font-semibold text-navy-950">{title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-navy-600">{detail}</p>
            </Link>
          ))}
        </Container>
      </section>

      <section id="method" className="scroll-mt-24 bg-white py-24 md:py-32">
        <Container>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clinical-700">The method</p>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.2] tracking-[-0.025em] text-navy-950 md:text-4xl">
              Safety assessment method
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-[1.8] text-navy-600">
              Each scenario is assessed for hazards, safeguards, residual risk and governance requirements.
            </p>
          </div>
          <div className="mt-16 grid border-t border-navy-200 md:grid-cols-5">
            {stages.map((stage) => (
              <div key={stage.number} className="border-b border-navy-200 px-0 py-7 md:border-b-0 md:border-r md:px-5 md:py-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                <p className="font-mono text-xs tracking-widest text-clinical-700">{stage.number}</p>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-navy-950">{stage.title}</h3>
                <p className="mt-3 text-sm leading-[1.8] text-navy-600">{stage.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 border-l-2 border-[#7babb3] bg-[#f7f9fb] px-6 py-5 text-sm leading-[1.85] text-navy-700 md:max-w-4xl">
            The output is a documented challenge, not a certificate of safety or a substitute
            for a manufacturer&apos;s or deploying organisation&apos;s clinical risk management duties.
          </div>
        </Container>
      </section>

      <section id="application" className="scroll-mt-24 bg-[#f4f7f9] py-24 md:py-32">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_1.05fr] md:gap-24">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-clinical-700">Where it applies</p>
              <h2 className="mt-5 max-w-lg text-3xl font-semibold leading-[1.2] tracking-[-0.025em] text-navy-950 md:text-4xl">
                Clinical AI applications
              </h2>
            </div>
            <p className="max-w-xl self-end text-lg leading-[1.75] text-navy-600">
              The method examines risks in the intended clinical setting and workflow.
            </p>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[1.25rem] border border-navy-100 bg-navy-100 lg:grid-cols-3">
            {applications.map((item) => (
              <article key={item.index} className="flex min-h-[315px] flex-col bg-white p-8 md:p-10">
                <p className="font-mono text-xs text-clinical-700">{item.index} / Application</p>
                <h3 className="mt-8 text-2xl font-semibold leading-snug tracking-[-0.035em] text-navy-950">{item.title}</h3>
                <p className="mt-5 text-sm leading-[1.85] text-navy-600">{item.detail}</p>
                <p className="mt-auto border-t border-navy-100 pt-6 text-xs font-semibold tracking-wide text-navy-700">{item.focus}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-navy-500">These are example use cases, not claims of completed assessments.</p>
        </Container>
      </section>

      <section id="standards" className="scroll-mt-24 bg-white py-24 md:py-32">
        <Container className="grid items-start gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clinical-700">Regulatory context</p>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.2] tracking-[-0.025em] text-navy-950 md:text-4xl">
              UK clinical safety standards
            </h2>
            <p className="mt-7 text-base leading-[1.9] text-navy-600">
              The approach draws on DCB0129-style safety case reasoning and considers DCB0160 and DTAC in context. It does not establish compliance or provide certification.
            </p>
          </div>
          <div className="border-t border-navy-200">
            {[
              ["DCB0129", "Clinical risk management for health IT manufacturers"],
              ["DCB0160", "Clinical risk management for organisations deploying health IT"],
              ["DTAC", "NHS assessment criteria for digital health technologies"],
            ].map(([code, detail]) => (
              <div key={code} className="grid gap-3 border-b border-navy-200 py-6 sm:grid-cols-[140px_1fr] sm:items-baseline">
                <span className="text-lg font-semibold tracking-tight text-navy-950">{code}</span>
                <span className="text-sm leading-[1.8] text-navy-600">{detail}</span>
              </div>
            ))}
            <p className="mt-6 text-xs leading-relaxed text-navy-500">
              Applicable requirements depend on the product, its intended purpose and its deployment context.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-[#101e38] py-24 text-white md:py-32">
        <Container className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#aac8d2]">Professional enquiries</p>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.2] tracking-[-0.025em] md:text-4xl">
              Independent safety case review
            </h2>
            <p className="mt-6 max-w-xl text-base leading-[1.85] text-[#c4d0df]">
              Discuss hazards, control effectiveness and unresolved risks before deployment.
            </p>
          </div>
          <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center justify-center self-start rounded-full bg-white px-7 text-sm font-semibold text-navy-950 transition-colors hover:bg-navy-100">
            Contact <span className="ml-3" aria-hidden="true">↗</span>
          </Link>
        </Container>
      </section>
    </>
  );
}

import Section from "./Section";

const failureModes = [
  "Writing audit-ready hazard logs",
  "Challenging weak supplier safety cases",
  "Recognising AI-specific failure modes",
];

const standards = ["DCB0129", "DCB0160", "DTAC"];

const appliedPractice = [
  "Hazard logging",
  "Supplier safety review",
  "AI failure recognition",
];

export default function Problem() {
  return (
    <Section tone="light">
      <div className="grid gap-12 md:grid-cols-5 md:gap-16">
        {/* Left: anchor */}
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
            Why current training fails
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tightish md:text-4xl">
            Theory is not enough for real-world AI deployment.
          </h2>
        </div>

        {/* Right: argument */}
        <div className="max-w-xl md:col-span-3">
          {/* Lead pair — light setup, weighted punchline */}
          <div className="space-y-2">
            <p className="text-xl font-light leading-snug text-navy-700 md:text-2xl">
              Most training teaches standards.
            </p>
            <p className="text-xl font-semibold leading-snug text-navy-950 md:text-2xl">
              Few teach application under deployment pressure.
            </p>
          </div>

          {/* The three gaps — premium tick markers */}
          <ul className="mt-10 space-y-3.5">
            {failureModes.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <svg
                  aria-hidden
                  viewBox="0 0 16 16"
                  fill="none"
                  className="mt-[7px] h-3.5 w-3.5 flex-none text-clinical-600"
                >
                  <path
                    d="M3 8.5l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-base font-medium text-navy-900 md:text-lg">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Resolution — tight to the list so it reads as the same thought */}
          <p className="mt-6 text-base leading-relaxed text-navy-700 md:text-lg">
            This platform bridges that gap through practical modules and
            simulation.
          </p>
        </div>
      </div>

      {/* Transformation diagram — Standards → Applied practice */}
      <div className="mt-11 md:mt-14">
        <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
          {/* Standards */}
          <div className="rounded-lg border border-navy-100 bg-white px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="block h-px w-5 bg-clinical-600"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
                Standards
              </p>
            </div>
            <ul className="mt-3.5 space-y-1.5">
              {standards.map((s) => (
                <li
                  key={s}
                  className="text-sm font-semibold tracking-wide text-navy-900 md:text-base"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Connector arrow — horizontal on desktop, vertical on mobile */}
          <div
            aria-hidden
            className="flex items-center justify-center md:px-1"
          >
            <svg
              viewBox="0 0 40 12"
              fill="none"
              className="hidden h-3 w-10 text-clinical-500 md:block"
            >
              <path
                d="M0 6 H32 M26 1 L32 6 L26 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              viewBox="0 0 12 40"
              fill="none"
              className="h-10 w-3 text-clinical-500 md:hidden"
            >
              <path
                d="M6 0 V32 M1 26 L6 32 L11 26"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Applied practice */}
          <div className="rounded-lg border border-navy-100 bg-white px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="block h-px w-5 bg-clinical-600"
              />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-clinical-700">
                Applied practice
              </p>
            </div>
            <ul className="mt-3.5 space-y-1.5">
              {appliedPractice.map((p) => (
                <li
                  key={p}
                  className="text-sm font-medium text-navy-900 md:text-base"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

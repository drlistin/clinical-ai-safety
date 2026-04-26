import Section from "./Section";

const failureModes = [
  "Writing audit-ready hazard logs",
  "Challenging weak supplier safety cases",
  "Recognising AI-specific failure modes",
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
        <div className="max-w-xl space-y-12 md:col-span-3">
          {/* Lead pair — light/medium contrast creates the "but" without saying it */}
          <div className="space-y-2">
            <p className="text-xl font-light leading-snug text-navy-700 md:text-2xl">
              Most training teaches standards.
            </p>
            <p className="text-xl font-medium leading-snug text-navy-900 md:text-2xl">
              Few teach application under deployment pressure.
            </p>
          </div>

          {/* The three gaps */}
          <ul className="space-y-3.5">
            {failureModes.map((item) => (
              <li key={item} className="flex items-start gap-4">
                <span
                  aria-hidden
                  className="mt-[11px] block h-1.5 w-1.5 flex-none rounded-sm bg-clinical-600"
                />
                <span className="text-base font-medium text-navy-900 md:text-lg">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          {/* Resolution — separated, calmer */}
          <div className="border-t border-navy-100 pt-8">
            <p className="text-base leading-relaxed text-navy-700 md:text-lg">
              This platform bridges that gap through practical modules and
              simulation.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

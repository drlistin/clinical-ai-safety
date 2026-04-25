import Section from "./Section";

export default function Problem() {
  return (
    <Section tone="light">
      <div className="grid gap-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
            The gap
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            DCB theory is not enough for real-world AI deployments.
          </h2>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-navy-700 md:col-span-3">
          <p>
            Certified CSOs understand the standards. Where training falls short
            is application: writing a hazard log that stands up to audit,
            challenging a supplier safety case that reads like marketing, and
            recognising where AI systems violate the deterministic assumptions
            DCB0129 was built on.
          </p>
          <p>
            Every NHS Trust deploying AI is quietly discovering the same thing
            — the controls that worked for traditional health IT do not cleanly
            transfer to systems that learn, drift, and fail in distributional
            ways. This resource closes that gap, module by module, scenario by
            scenario.
          </p>
        </div>
      </div>
    </Section>
  );
}

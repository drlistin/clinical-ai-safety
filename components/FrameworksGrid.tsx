import Section from "./Section";
import { frameworks } from "@/lib/site";

export default function FrameworksGrid() {
  return (
    <Section tone="light" id="frameworks">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
          Frameworks covered
        </p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
          The standards CSOs actually have to apply.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-navy-700">
          Every module is anchored to the frameworks that define clinical
          safety for NHS digital health. We cover twelve — from the familiar to
          the emerging.
        </p>
      </div>

      <div className="mt-16 grid gap-px overflow-hidden rounded-lg border border-navy-100 bg-navy-100 sm:grid-cols-2 lg:grid-cols-3">
        {frameworks.map((fw) => (
          <div
            key={fw.code}
            className="flex flex-col bg-white p-6 transition-colors hover:bg-navy-50/40"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-navy-900">
                {fw.code}
              </span>
            </div>
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
  );
}

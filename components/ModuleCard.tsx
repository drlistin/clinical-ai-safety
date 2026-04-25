import type { Module } from "@/lib/site";

type Props = {
  module: Module;
};

export default function ModuleCard({ module }: Props) {
  return (
    <article className="group flex h-full flex-col rounded-lg border border-navy-100 bg-white p-8 transition-colors hover:border-clinical-300 hover:bg-navy-50/40">
      <header className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-clinical-700">
          Module {module.number.toString().padStart(2, "0")}
        </span>
        <span className="rounded-full border border-navy-200 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-navy-600">
          {module.status}
        </span>
      </header>

      <h3 className="mt-6 text-xl font-semibold leading-snug text-navy-900">
        {module.title}
      </h3>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-navy-700">
        {module.summary}
      </p>

      <div className="mt-8 flex flex-wrap gap-2 border-t border-navy-100 pt-6">
        {module.frameworks.map((fw) => (
          <span
            key={fw}
            className="rounded-sm bg-navy-50 px-2 py-1 text-[11px] font-medium text-navy-700"
          >
            {fw}
          </span>
        ))}
      </div>
    </article>
  );
}

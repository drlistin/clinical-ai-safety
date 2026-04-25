import Link from "next/link";
import Section from "./Section";
import ModuleCard from "./ModuleCard";
import { launchModules } from "@/lib/site";

export default function LaunchModules() {
  return (
    <Section tone="mist" id="launch-modules">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
            The three launch modules
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            Where most CSOs get stuck — and what to do about it.
          </h2>
        </div>
        <Link
          href="/modules"
          className="text-sm font-semibold text-clinical-700 underline-offset-4 hover:underline"
        >
          View all 30 modules &rarr;
        </Link>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {launchModules.map((module) => (
          <ModuleCard key={module.number} module={module} />
        ))}
      </div>
    </Section>
  );
}

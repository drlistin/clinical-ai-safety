import Link from "next/link";
import Section from "./Section";

export default function SimulatorHighlight() {
  return (
    <Section tone="navy">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-300">
            Launch simulator
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            The Hazard Log Builder.
          </h2>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-navy-100">
            Work through a realistic AI deployment scenario. Identify hazards,
            apply controls, and generate a DCB0129-aligned hazard log entry by
            entry. Structured feedback at every step — modelled on how an
            experienced CSO would challenge your thinking.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-navy-100">
            <li className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-[7px] block h-1.5 w-1.5 flex-none rounded-full bg-clinical-300"
              />
              Realistic NHS deployment scenarios, not sanitised case studies.
            </li>
            <li className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-[7px] block h-1.5 w-1.5 flex-none rounded-full bg-clinical-300"
              />
              Identify, articulate, and quantify clinical hazards with
              structured feedback.
            </li>
            <li className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-[7px] block h-1.5 w-1.5 flex-none rounded-full bg-clinical-300"
              />
              Export an audit-ready hazard log for review and iteration.
            </li>
          </ul>
          <div className="mt-10">
            <Link
              href="/simulators/hazard-log-builder"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-100"
            >
              Preview the simulator &rarr;
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-lg border border-navy-700 bg-navy-900/60 p-8 shadow-2xl shadow-navy-950/60">
            <div className="flex items-center justify-between border-b border-navy-700 pb-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-clinical-300">
                Hazard Log — draft
              </div>
              <div className="text-[11px] text-navy-300">Scenario 01</div>
            </div>
            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-navy-300">
                  Hazard
                </dt>
                <dd className="mt-1 text-navy-50">
                  AI triage model deprioritises frail elderly patients with
                  atypical presentation.
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-navy-300">
                  Clinical consequence
                </dt>
                <dd className="mt-1 text-navy-50">
                  Delayed recognition of sepsis. Severity: 4. Likelihood: 3.
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-navy-300">
                  Control
                </dt>
                <dd className="mt-1 text-navy-50">
                  Triage nurse override required for any patient &gt; 75 with
                  NEWS2 ≥ 5.
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-navy-300">
                  Residual risk
                </dt>
                <dd className="mt-1">
                  <span className="rounded-sm bg-clinical-600/30 px-2 py-1 text-clinical-100">
                    Acceptable with monitoring
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Section>
  );
}

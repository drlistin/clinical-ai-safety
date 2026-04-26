import Link from "next/link";
import Container from "./Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(50,114,178,0.25),_transparent_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_bottom,_transparent,_rgba(5,13,28,0.6))]"
      />
      <Container className="relative py-24 md:py-32">
        <div className="grid items-center gap-16 lg:grid-cols-[5fr_3fr] lg:gap-12 xl:gap-16">
          {/* Left: copy */}
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-300">
              For Clinical Safety Officers
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tightish md:text-[3.25rem]">
              AI can pass the guideline
              <br className="hidden md:inline" />{" "}
              and still harm patients.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 md:text-lg">
              Practical training and simulation for safe clinical AI deployment.
            </p>

            {/* Standards: premium credential bar + caption */}
            <div className="mt-12 space-y-4">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-clinical-200 backdrop-blur-sm">
                <span>DCB0129</span>
                <span
                  aria-hidden
                  className="block h-1 w-1 rounded-full bg-clinical-400/70"
                />
                <span>DCB0160</span>
                <span
                  aria-hidden
                  className="block h-1 w-1 rounded-full bg-clinical-400/70"
                />
                <span>DTAC</span>
              </div>
              <p className="text-sm text-navy-300">
                Where policy meets practice.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/modules"
                className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-100"
              >
                Start training
              </Link>
              <Link
                href="/simulators/hazard-log-builder"
                className="inline-flex items-center rounded-md border border-navy-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
              >
                Try the simulator
              </Link>
            </div>
          </div>

          {/* Right: glass dashboard mockup, desktop only */}
          <div className="hidden lg:block">
            <DeploymentMonitor />
          </div>
        </div>
      </Container>
    </section>
  );
}

function DeploymentMonitor() {
  return (
    <div className="relative">
      {/* Ambient glow behind the panel */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-3xl bg-clinical-500/10 blur-3xl"
      />

      <div className="relative rounded-2xl border border-white/10 bg-navy-900/60 p-6 shadow-2xl shadow-navy-950/70 backdrop-blur-md">
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="block h-2 w-2 rounded-full bg-clinical-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]"
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clinical-200">
              Deployment monitor
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-navy-400">
            Live
          </span>
        </div>

        {/* Metric cards */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/5 bg-navy-950/50 p-4">
            <div className="text-[10px] font-medium uppercase tracking-widest text-navy-400">
              Drift index
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">0.04</div>
            <div className="mt-1 text-[11px] text-clinical-300">
              within tolerance
            </div>
          </div>
          <div className="rounded-lg border border-white/5 bg-navy-950/50 p-4">
            <div className="text-[10px] font-medium uppercase tracking-widest text-navy-400">
              Open hazards
            </div>
            <div className="mt-2 text-2xl font-semibold text-white">12</div>
            <div className="mt-1 text-[11px] text-navy-400">3 monitored</div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="mt-3 rounded-lg border border-white/5 bg-navy-950/50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-medium uppercase tracking-widest text-navy-400">
              Model performance &middot; 14d
            </div>
            <div className="text-[11px] text-clinical-300">stable</div>
          </div>
          <svg
            viewBox="0 0 200 40"
            preserveAspectRatio="none"
            aria-hidden
            className="mt-3 h-10 w-full"
          >
            <defs>
              <linearGradient
                id="hero-spark"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#84b3dd" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#84b3dd" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 26 L 16 22 L 32 28 L 48 18 L 64 24 L 80 14 L 96 22 L 112 18 L 128 12 L 144 22 L 160 16 L 176 20 L 192 14 L 200 18 L 200 40 L 0 40 Z"
              fill="url(#hero-spark)"
            />
            <path
              d="M 0 26 L 16 22 L 32 28 L 48 18 L 64 24 L 80 14 L 96 22 L 112 18 L 128 12 L 144 22 L 160 16 L 176 20 L 192 14 L 200 18"
              fill="none"
              stroke="#84b3dd"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Activity feed */}
        <div className="mt-4 space-y-2.5 border-t border-white/10 pt-4 text-[11px]">
          <div className="flex items-center justify-between text-navy-200">
            <span>Hazard #047 reviewed</span>
            <span className="text-navy-500">2m</span>
          </div>
          <div className="flex items-center justify-between text-navy-200">
            <span>Model v2.3 deployed</span>
            <span className="text-navy-500">17m</span>
          </div>
          <div className="flex items-center justify-between text-navy-200">
            <span>DPIA refresh due</span>
            <span className="text-clinical-300">today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

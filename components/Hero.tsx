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
      <Container className="relative py-28 md:py-36">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-300">
            For Clinical Safety Officers
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tightish md:text-6xl">
            AI can pass the guideline and still harm the patient.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-navy-100 md:text-lg">
            Practical training and simulation for safe clinical AI deployment.
          </p>
          <div className="mt-10 space-y-3 text-sm md:text-base">
            <p className="text-navy-100">Grounded in real-world standards.</p>
            <p className="font-medium tracking-wide text-clinical-300">
              DCB0129. DCB0160. DTAC.
            </p>
            <p className="text-navy-100">Where policy meets practice.</p>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/modules"
              className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-100"
            >
              Explore the curriculum
            </Link>
            <Link
              href="/simulators/hazard-log-builder"
              className="inline-flex items-center rounded-md border border-navy-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
            >
              See the Hazard Log Builder
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

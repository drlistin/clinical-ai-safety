"use client";

import Section from "./Section";

export default function EmailCapture() {
  return (
    <Section tone="mist">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
          Waitlist
        </p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
          Get the launch modules when they go live.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-navy-700">
          One email when Module 5, Module 7 and Module 11 are published. No
          newsletter. No marketing. You can leave at any time.
        </p>

        <form
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          aria-label="Join the waitlist"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="email" className="sr-only">
            NHS or work email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@nhs.net"
            className="w-full rounded-md border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 focus:border-clinical-500"
          />
          <button
            type="submit"
            disabled
            className="inline-flex items-center justify-center rounded-md bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
            title="Form is a placeholder in the MVP"
          >
            Join waitlist
          </button>
        </form>
        <p className="mt-4 text-xs text-navy-500">
          Form placeholder — not yet connected to a backend.
        </p>
      </div>
    </Section>
  );
}

import Link from "next/link";
import Container from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clinical-700">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold leading-tight text-navy-900 md:text-5xl">
        That page does not exist.
      </h1>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-navy-700">
        The resource you are looking for may have moved or not yet been
        published. The curriculum is live on{" "}
        <Link
          href="/modules"
          className="font-semibold text-clinical-700 underline-offset-4 hover:underline"
        >
          the modules page
        </Link>
        .
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center rounded-md bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
      >
        Return home
      </Link>
    </Container>
  );
}

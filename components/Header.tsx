import Link from "next/link";
import { nav, site } from "@/lib/site";
import Container from "./Container";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-navy-900"
          aria-label={`${site.name} home`}
        >
          <span
            aria-hidden
            className="block h-3 w-3 rounded-sm bg-clinical-600"
          />
          <span className="text-sm font-semibold tracking-tight">
            {site.name}
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 text-sm font-medium text-navy-600 md:flex"
        >
          {nav
            .filter((item) => item.href !== "/")
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-navy-900"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        <Link
          href="/modules"
          className="hidden rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-800 md:inline-flex"
        >
          View curriculum
        </Link>
      </Container>
    </header>
  );
}

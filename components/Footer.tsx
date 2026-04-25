import Link from "next/link";
import { nav, site } from "@/lib/site";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-navy-950 text-navy-100">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="block h-3 w-3 rounded-sm bg-clinical-400"
              />
              <span className="text-sm font-semibold tracking-tight text-white">
                {site.name}
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-navy-200">
              {site.description}
            </p>
            <p className="mt-6 text-xs text-navy-300">
              {site.author.credentials}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-navy-300">
              Curriculum
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              {nav
                .filter((n) => n.href !== "/")
                .map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-navy-100 transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-navy-300">
              Independent resource
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-navy-200">
              {site.disclaimer}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-navy-800 pt-6 text-xs text-navy-300 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.author.name}. All rights
            reserved.
          </p>
          <p>{site.domain}</p>
        </div>
      </Container>
    </footer>
  );
}

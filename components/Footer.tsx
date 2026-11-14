import Link from "next/link";
import { nav, site } from "@/lib/site";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-navy-100 bg-white text-navy-900">
      <Container className="py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-lg font-semibold tracking-tight">{site.name}</p>
            <p className="mt-4 max-w-md text-sm leading-[1.85] text-navy-600">{site.description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-500">Explore</p>
            <nav aria-label="Footer" className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              {nav.filter((item) => item.href !== "/").map((item) => (
                <Link key={item.href} href={item.href} className="text-sm font-medium text-navy-700 hover:text-navy-950">{item.label}</Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-navy-100 pt-6 text-xs leading-relaxed text-navy-500 md:flex-row">
          <p>© {new Date().getFullYear()} {site.author.name}. All rights reserved.</p>
          <p>{site.disclaimer}</p>
        </div>
      </Container>
    </footer>
  );
}

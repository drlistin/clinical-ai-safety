import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/lib/site";
import Container from "./Container";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e5e5] bg-[#f5f5f5]">
      <Container className="flex h-16 items-center justify-between md:h-[72px]">
        <Link
          href="/"
          className="flex items-center"
          aria-label={`${site.name} home`}
        >
          <Image
            src="/logo.png"
            alt={site.name}
            width={760}
            height={200}
            priority
            sizes="(min-width: 768px) 220px, 160px"
            className="h-auto w-[160px] md:w-[220px]"
          />
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

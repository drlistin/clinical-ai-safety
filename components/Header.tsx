import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/lib/site";
import Container from "./Container";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/40 bg-white">
      <Container className="flex h-16 items-center justify-between md:h-[72px]">
        <Link
          href="/"
          className="flex items-center"
          aria-label={`${site.name} home`}
        >
          <span className="flex items-center gap-1.5 md:gap-2">
            <Image
              src="/logo-icon.png"
              alt=""
              width={241}
              height={250}
              priority
              sizes="(min-width: 768px) 56px, 40px"
              className="navlogo-glow h-10 w-auto md:h-14"
            />
            <Image
              src="/logo-wordmark.png"
              alt=""
              width={659}
              height={250}
              priority
              sizes="(min-width: 768px) 154px, 112px"
              className="h-10 w-auto md:h-14"
            />
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

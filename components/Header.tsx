import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/lib/site";
import Container from "./Container";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-white/95 backdrop-blur-md">
      <Container className="flex h-[76px] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${site.name} home`}>
          <span className="flex items-center gap-1.5">
            <Image src="/logo-icon.png" alt="" width={241} height={250} priority className="h-11 w-auto md:h-[52px]" />
            <Image src="/logo-wordmark.png" alt="" width={659} height={250} priority className="h-11 w-auto md:h-[52px]" />
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 text-[13px] font-semibold text-navy-600 lg:flex">
          {nav.filter((item) => item.href !== "/").map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-navy-950">{item.label}</Link>
          ))}
        </nav>
        <Link href="/contact" className="hidden rounded-full border border-navy-200 px-5 py-2.5 text-xs font-semibold text-navy-900 hover:bg-navy-50 lg:inline-flex">
          Get in touch
        </Link>
        <details className="group relative ml-auto lg:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
            Menu <span aria-hidden="true" className="text-lg leading-none">≡</span>
          </summary>
          <nav aria-label="Mobile" className="absolute right-0 top-[calc(100%+14px)] w-[min(280px,calc(100vw-48px))] rounded-xl border border-navy-100 bg-white p-2 shadow-xl">
            {nav.filter((item) => item.href !== "/").map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-lg px-4 py-3 text-sm font-semibold text-navy-800 hover:bg-navy-50">{item.label}</Link>
            ))}
          </nav>
        </details>
      </Container>
    </header>
  );
}

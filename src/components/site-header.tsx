import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";

const NAV_LINKS = [
  { href: "/tours", label: "Tours" },
  { href: "/journal", label: "Journal" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-limestone/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-jungle"
        >
          Kootenwaye <span className="text-teal">Tours</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink/80 transition-colors hover:text-teal"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-full bg-teal px-4 py-2 text-limestone transition-colors hover:bg-teal-dark"
          >
            Plan your trip
          </Link>
        </nav>

        <MobileNav links={NAV_LINKS} />
      </div>
    </header>
  );
}

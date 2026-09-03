import Link from "next/link";
import { BUSINESS } from "@/lib/business";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-jungle text-limestone/90">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold text-limestone">
            {BUSINESS.name}
          </p>
          <p className="mt-3 max-w-xs text-sm text-limestone/70">
            Small-group guided adventures through the cenotes, jungle trails,
            and coastline of the Yucatán Peninsula.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-limestone/50">
            Explore
          </p>
          <nav className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/tours" className="hover:text-teal">Tours</Link>
            <Link href="/journal" className="hover:text-teal">Journal</Link>
            <Link href="/gallery" className="hover:text-teal">Gallery</Link>
            <Link href="/about" className="hover:text-teal">About</Link>
          </nav>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-limestone/50">
            Contact
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-limestone/80">
            <a href={BUSINESS.phoneHref} className="hover:text-teal">{BUSINESS.phone}</a>
            <a href={`mailto:${BUSINESS.email}`} className="hover:text-teal">{BUSINESS.email}</a>
            <p>{BUSINESS.address}</p>
            <p>{BUSINESS.hours}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-limestone/10 px-5 py-5 text-center text-xs text-limestone/50">
        © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
      </div>
    </footer>
  );
}

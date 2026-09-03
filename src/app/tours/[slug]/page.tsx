import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getTourBySlug } from "@/lib/queries";
import { RichText } from "@/components/rich-text";
import { BUSINESS } from "@/lib/business";
import { formatDuration } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

// Rendered on demand rather than pre-listed at build time: tours are
// published dynamically through the (future) admin panel, so a build-time
// slug list would go stale the moment a new one is added. It also means
// the Docker build never needs a live database.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) return {};
  return {
    title: tour.seoTitle ?? tour.title,
    description: tour.seoDescription ?? tour.excerpt,
  };
}

export default async function TourDetailPage({ params }: Props) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);
  if (!tour) notFound();

  const cover = tour.media.find((link) => link.isCover)?.media ?? tour.media[0]?.media;
  const gallery = tour.media.filter((link) => link.media.id !== cover?.id);
  const highlights = tour.highlights as string[];
  const included = tour.included as string[];
  const excluded = tour.excluded as string[];
  const description = tour.description as string[];

  return (
    <article>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-jungle sm:aspect-[21/9]">
        {cover && (
          <img src={cover.storageKey} alt={cover.altText} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-jungle/80 via-jungle/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-5 pb-8">
          <span className="font-mono text-xs uppercase tracking-widest text-teal">
            {tour.difficulty} · {tour.location}
          </span>
          <h1 className="mt-2 text-balance font-display text-3xl font-semibold text-limestone sm:text-5xl">
            {tour.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="grid grid-cols-3 gap-4 rounded-2xl border border-ink/10 bg-white p-5 text-center">
            <Fact label="Duration" value={formatDuration(tour.durationMinutes)} />
            <Fact label="Group size" value={`${tour.groupSizeMin}–${tour.groupSizeMax}`} />
            <Fact label="From" value={`${tour.priceAmount.toString()} ${tour.priceCurrency}`} />
          </div>

          <h2 className="mt-10 font-display text-2xl font-semibold text-jungle">About this tour</h2>
          <div className="mt-4">
            <RichText blocks={description} />
          </div>

          {highlights?.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-2xl font-semibold text-jungle">Highlights</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-2 text-ink/80">
                    <span className="text-teal-dark">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-jungle">Included</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink/80">
                {included.map((item) => (
                  <li key={item}>+ {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-jungle">Not included</h3>
              <ul className="mt-3 space-y-2 text-sm text-ink/80">
                {excluded.map((item) => (
                  <li key={item}>− {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {gallery.length > 0 && (
            <>
              <h2 className="mt-10 font-display text-2xl font-semibold text-jungle">Photos</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((link) => (
                  <div key={link.media.id} className="aspect-square overflow-hidden rounded-xl bg-teal/10">
                    <img
                      src={link.media.storageKey}
                      alt={link.media.altText}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-ink/10 bg-white p-6 lg:sticky lg:top-24">
          <p className="font-display text-2xl font-semibold text-jungle">
            {tour.priceAmount.toString()} {tour.priceCurrency}
          </p>
          <p className="text-sm text-ink/60">per person</p>
          <Link
            href={`/contact?tour=${tour.slug}`}
            className="mt-5 block rounded-full bg-teal px-6 py-3 text-center text-sm font-semibold text-limestone transition-colors hover:bg-teal-dark"
          >
            Check availability
          </Link>
          <a
            href={BUSINESS.whatsappHref}
            className="mt-3 block rounded-full border border-teal-dark/40 px-6 py-3 text-center text-sm font-semibold text-teal-dark transition-colors hover:border-teal-dark"
          >
            Message on WhatsApp
          </a>
        </aside>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-lg font-semibold text-jungle">{value}</p>
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
    </div>
  );
}

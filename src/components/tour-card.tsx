import Link from "next/link";
import type { Tour, Media, TourMedia } from "@prisma/client";
import { formatDuration } from "@/lib/format";

type TourWithMedia = Tour & { media: (TourMedia & { media: Media })[] };

export function TourCard({ tour }: { tour: TourWithMedia }) {
  const cover = tour.media.find((link) => link.isCover)?.media ?? tour.media[0]?.media;

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-teal/10">
        {cover && (
          <img
            src={cover.storageKey}
            alt={cover.altText}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-teal-dark">
          {tour.difficulty}
        </span>
        <h3 className="font-display text-lg font-semibold text-ink">{tour.title}</h3>
        <p className="line-clamp-2 text-sm text-ink/70">{tour.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="font-mono text-ink/60">{formatDuration(tour.durationMinutes)}</span>
          <span className="font-mono font-semibold text-jungle">
            from {tour.priceAmount.toString()} {tour.priceCurrency}
          </span>
        </div>
      </div>
    </Link>
  );
}

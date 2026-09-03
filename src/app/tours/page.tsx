import type { Metadata } from "next";
import { getPublishedTours } from "@/lib/queries";
import { TourCard } from "@/components/tour-card";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = { title: "Tours" };

export default async function ToursPage() {
  const tours = await getPublishedTours();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading
        eyebrow="All tours"
        title="Find your next day in the jungle"
        dek="Every departure is small-group and led by a local guide."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </div>
  );
}

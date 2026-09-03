import Link from "next/link";
import { getFeaturedTours, getLatestPosts } from "@/lib/queries";
import { TourCard } from "@/components/tour-card";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { BUSINESS } from "@/lib/business";

export default async function HomePage() {
  const [tours, posts] = await Promise.all([getFeaturedTours(3), getLatestPosts(3)]);

  return (
    <>
      <section className="relative overflow-hidden bg-jungle text-limestone">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-teal">
              Yucatán Peninsula, Mexico
            </p>
            <h1 className="mt-4 text-balance font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Cenotes, jungle, and coastline — guided by people who grew up here.
            </h1>
            <p className="mt-5 max-w-md text-limestone/75">
              Small-group tours through hidden cenotes, canopy ziplines, and mangrove
              waterways — led by local guides, capped at a dozen travelers at a time.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/tours"
                className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-limestone transition-colors hover:bg-teal-dark"
              >
                Browse tours
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-limestone/30 px-6 py-3 text-sm font-semibold text-limestone transition-colors hover:border-limestone"
              >
                Ask a question
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <img
              src="/sample-images/hero-cenote.svg"
              alt="Sunlight beaming into a turquoise cenote pool"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          eyebrow="Featured"
          title="Start with one of these"
          dek="Every tour is capped at a small group and led by a licensed local guide."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/tours" className="font-semibold text-teal-dark hover:text-teal">
            View all tours →
          </Link>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:grid-cols-3">
          <TrustItem stat="12+ yrs" label="Guiding the Yucatán backcountry" />
          <TrustItem stat="≤12" label="Guests per departure, always small-group" />
          <TrustItem stat="100%" label="Local, licensed guides" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading eyebrow="From the journal" title="Field notes before you go" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="bg-teal/10 py-20">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-balance font-display text-3xl font-semibold text-jungle">
            Not sure which tour fits your trip?
          </h2>
          <p className="mt-3 text-ink/70">
            Tell us your dates and what you want to see — we&apos;ll put together a plan.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-limestone transition-colors hover:bg-teal-dark"
            >
              Send an enquiry
            </Link>
            <a
              href={BUSINESS.whatsappHref}
              className="rounded-full border border-teal-dark/40 px-6 py-3 text-sm font-semibold text-teal-dark transition-colors hover:border-teal-dark"
            >
              Message on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function TrustItem({ stat, label }: { stat: string; label: string }) {
  return (
    <div className="text-center sm:text-left">
      <p className="font-display text-3xl font-semibold text-jungle">{stat}</p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </div>
  );
}

import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <SectionHeading eyebrow="About us" title="Guided by people who grew up on this land" />
      <div className="mt-10 space-y-5 leading-relaxed text-ink/80">
        <p>
          Kootenwaye Tours is a small, local operation running guided trips through the
          cenotes, jungle trails, and coastal waterways of the Yucatán Peninsula. Every
          guide on our team was born and raised in the region — the routes we run are
          the same ones we grew up exploring.
        </p>
        <p>
          We keep groups small on purpose: most departures run with a dozen travelers
          or fewer, so your guide can actually teach you something about the cenotes,
          the reef system that feeds them, and the communities along the way — not just
          shuttle you between photo stops.
        </p>
        <p>
          This page is placeholder copy. Replace it with your real team bios,
          certifications, and safety practices once the admin content tools are in
          place (see <code>planning-design/</code> for the roadmap).
        </p>
      </div>
    </div>
  );
}

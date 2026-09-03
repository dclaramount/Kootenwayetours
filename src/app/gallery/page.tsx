import type { Metadata } from "next";
import { getGalleryItems } from "@/lib/queries";
import { GalleryGrid } from "@/components/gallery-grid";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading
        eyebrow="Gallery"
        title="The jungle, in photos"
        dek="A running collection from our guides and travelers. Click any photo to view it larger."
      />
      <div className="mt-12">
        <GalleryGrid items={items} />
      </div>
    </div>
  );
}

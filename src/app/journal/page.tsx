import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/queries";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <SectionHeading
        eyebrow="Journal"
        title="Field notes from the trail"
        dek="Trip planning tips, local ecology, and stories from our guides."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

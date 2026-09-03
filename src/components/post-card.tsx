import Link from "next/link";
import type { BlogPost, Media, BlogPostMedia } from "@prisma/client";
import { formatDate } from "@/lib/format";

type PostWithMedia = BlogPost & { media: (BlogPostMedia & { media: Media })[] };

export function PostCard({ post }: { post: PostWithMedia }) {
  const cover = post.media.find((link) => link.isCover)?.media ?? post.media[0]?.media;

  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-[16/9] overflow-hidden bg-teal/10">
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
        {post.publishedAt && (
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">
            {formatDate(post.publishedAt)}
          </span>
        )}
        <h3 className="font-display text-lg font-semibold text-ink">{post.title}</h3>
        <p className="line-clamp-3 text-sm text-ink/70">{post.excerpt}</p>
      </div>
    </Link>
  );
}

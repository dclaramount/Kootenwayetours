import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/queries";
import { RichText } from "@/components/rich-text";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

// Rendered on demand rather than pre-listed at build time — see the note
// in src/app/tours/[slug]/page.tsx.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
  };
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const cover = post.media.find((link) => link.isCover)?.media ?? post.media[0]?.media;
  const content = post.content as string[];

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <Link href="/journal" className="text-sm font-semibold text-teal-dark hover:text-teal">
        ← Back to journal
      </Link>
      {post.publishedAt && (
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-ink/50">
          {formatDate(post.publishedAt)}
        </p>
      )}
      <h1 className="mt-2 text-balance font-display text-3xl font-semibold text-jungle sm:text-4xl">
        {post.title}
      </h1>
      {cover && (
        <div className="mt-8 aspect-[16/9] overflow-hidden rounded-2xl bg-teal/10">
          <img src={cover.storageKey} alt={cover.altText} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="mt-8">
        <RichText blocks={content} />
      </div>
    </article>
  );
}

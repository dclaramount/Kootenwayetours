import { prisma } from "@/lib/db";

const tourMediaInclude = {
  media: { include: { media: true }, orderBy: { sortOrder: "asc" as const } },
};

const postMediaInclude = {
  media: { include: { media: true }, orderBy: { sortOrder: "asc" as const } },
  author: true,
};

export function getPublishedTours() {
  return prisma.tour.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: tourMediaInclude,
  });
}

export function getFeaturedTours(limit = 3) {
  return prisma.tour.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: tourMediaInclude,
  });
}

export function getTourBySlug(slug: string) {
  return prisma.tour.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: tourMediaInclude,
  });
}

export function getPublishedPosts() {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    include: postMediaInclude,
  });
}

export function getLatestPosts(limit = 3) {
  return prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: postMediaInclude,
  });
}

export function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: postMediaInclude,
  });
}

export function getGalleryItems() {
  return prisma.galleryItem.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
    include: { media: true },
  });
}

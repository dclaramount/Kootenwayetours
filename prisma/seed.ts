import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

type MediaSeed = {
  key: string;
  storageKey: string;
  altText: string;
  caption?: string;
};

const MEDIA: MediaSeed[] = [
  { key: "hero", storageKey: "/sample-images/hero-cenote.svg", altText: "Sunlight beaming into a turquoise cenote pool" },
  { key: "cenote-azul", storageKey: "/sample-images/tour-cenote-azul.svg", altText: "Turquoise cenote pool ringed by limestone" },
  { key: "canopy-zipline", storageKey: "/sample-images/tour-canopy-zipline.svg", altText: "Jungle canopy line against a pale morning sky" },
  { key: "kayak-mangrove", storageKey: "/sample-images/tour-kayak-mangrove.svg", altText: "Calm mangrove channel at sunrise" },
  { key: "atv-trail", storageKey: "/sample-images/tour-atv-trail.svg", altText: "Sandy backcountry trail winding through scrub" },
  { key: "cave-dive", storageKey: "/sample-images/tour-cave-dive.svg", altText: "Light filtering into an underwater cave chamber" },
  { key: "rainforest-hike", storageKey: "/sample-images/tour-rainforest-hike.svg", altText: "Dense rainforest canopy from below" },
  { key: "journal-geology", storageKey: "/sample-images/journal-geology.svg", altText: "Cross-section illustration of a limestone cave chamber" },
  { key: "journal-packing", storageKey: "/sample-images/journal-packing.svg", altText: "Flat-lay illustration of packed travel gear" },
  { key: "journal-guides", storageKey: "/sample-images/journal-guides.svg", altText: "Guide silhouette against the jungle canopy" },
  { key: "gallery-1", storageKey: "/sample-images/gallery-1.svg", altText: "Cenote pool detail with layered turquoise water" },
  { key: "gallery-2", storageKey: "/sample-images/gallery-2.svg", altText: "Mangrove water layered in green and teal" },
  { key: "gallery-3", storageKey: "/sample-images/gallery-3.svg", altText: "Sandy trail through dry scrubland" },
  { key: "gallery-4", storageKey: "/sample-images/gallery-4.svg", altText: "Abstract jungle canopy texture at dusk" },
];

async function upsertMedia() {
  const byKey = new Map<string, string>();
  for (const item of MEDIA) {
    const media = await prisma.media.upsert({
      where: { storageKey: item.storageKey },
      update: {},
      create: {
        storageKey: item.storageKey,
        originalFilename: item.storageKey.split("/").pop() ?? item.key,
        mimeType: "image/svg+xml",
        width: 1600,
        height: 1000,
        sizeBytes: 900,
        // Placeholder illustrations serve one file for every size class —
        // real uploads will populate distinct thumb/medium/large/original paths.
        variants: {
          thumbnail: item.storageKey,
          medium: item.storageKey,
          large: item.storageKey,
          original: item.storageKey,
        },
        altText: item.altText,
        caption: item.caption,
      },
    });
    byKey.set(item.key, media.id);
  }
  return byKey;
}

async function main() {
  console.log("Seeding database...");

  const passwordHash = await argon2.hash("ChangeMe123!");
  const admin = await prisma.user.upsert({
    where: { email: "admin@kootenwayetours.com" },
    update: {},
    create: {
      email: "admin@kootenwayetours.com",
      passwordHash,
      name: "Site Admin",
      role: "admin",
    },
  });

  const mediaId = await upsertMedia();

  const tours = [
    {
      slug: "cenote-azul-half-day",
      title: "Cenote Azul Half-Day Swim",
      excerpt: "Swim and snorkel a hidden freshwater cenote, then cool off in a second open-air pool.",
      description: [
        "This half-day trip visits two cenotes tucked into the jungle just off the coastal highway — one a semi-open cavern with stalactites overhead, the other a bright, open-air pool ringed by tree roots.",
        "Your guide covers the basics of cenote geology and the aquifer system that feeds the whole peninsula before you get in the water, then swims the route with you, pointing out fish, turtles, and rock formations along the way.",
      ],
      durationMinutes: 240,
      difficulty: "Easy",
      groupSizeMin: 2,
      groupSizeMax: 12,
      priceAmount: "890.00",
      location: "Inland cenote corridor, 35 min from the coast",
      highlights: ["Two cenotes in one trip", "Snorkel gear included", "Small groups, max 12"],
      included: ["Local guide", "Snorkel gear", "Round-trip transport", "Bottled water"],
      excluded: ["Lunch", "Hotel pickup outside the main corridor", "Gratuities"],
      coverKey: "cenote-azul",
      galleryKeys: ["gallery-1"],
    },
    {
      slug: "canopy-zipline-circuit",
      title: "Jungle Canopy Zipline Circuit",
      excerpt: "Eight linked ziplines through the treetops, finishing with a rappel into a cenote.",
      description: [
        "A circuit of eight ziplines strung through the upper canopy, built and maintained by a local family-run outfit we've worked with for years.",
        "The last line drops you at the mouth of a cenote, where you rappel the final few meters down to the water for a swim before the ride back.",
      ],
      durationMinutes: 180,
      difficulty: "Moderate",
      groupSizeMin: 2,
      groupSizeMax: 10,
      priceAmount: "1150.00",
      location: "Canopy park, 20 min inland",
      highlights: ["8 linked zipline sections", "Rappel finish into a cenote", "Certified harness gear"],
      included: ["Certified guide", "Full safety harness", "Helmet", "Cenote swim"],
      excluded: ["Photos/video package", "Lunch", "Gratuities"],
      coverKey: "canopy-zipline",
      galleryKeys: [],
    },
    {
      slug: "sunrise-kayak-mangrove",
      title: "Sunrise Kayak & Mangrove Paddle",
      excerpt: "Paddle a quiet mangrove channel at first light, when the wildlife is most active.",
      description: [
        "We meet before sunrise and paddle out as the mangrove channel wakes up — this is consistently the best time to spot herons, rays, and the occasional crocodile at a safe distance.",
        "The route is flat water the whole way, so no paddling experience is required, and we keep a slow pace built around stopping to look at things.",
      ],
      durationMinutes: 150,
      difficulty: "Easy",
      groupSizeMin: 2,
      groupSizeMax: 8,
      priceAmount: "760.00",
      location: "Mangrove estuary, coastal access point",
      highlights: ["Departs before sunrise", "Flat water, beginner friendly", "Wildlife spotting guide"],
      included: ["Kayak and paddle", "Life jacket", "Local guide", "Coffee before departure"],
      excluded: ["Hotel transport", "Breakfast", "Gratuities"],
      coverKey: "kayak-mangrove",
      galleryKeys: ["gallery-2"],
    },
    {
      slug: "sacred-valley-atv",
      title: "Sacred Valley ATV Expedition",
      excerpt: "Drive backcountry trails through farmland and scrub to a cenote most tours never reach.",
      description: [
        "A self-driven ATV route through working farmland and dry scrub forest, ending at a cenote well off the main tourist corridor.",
        "Trails are dusty and occasionally bumpy by design — this is the trip for travelers who want dirt under their nails, not a paved path.",
      ],
      durationMinutes: 210,
      difficulty: "Moderate",
      groupSizeMin: 2,
      groupSizeMax: 10,
      priceAmount: "1050.00",
      location: "Backcountry trail network, 40 min inland",
      highlights: ["Self-driven ATVs", "Remote, less-visited cenote", "Farmland and scrub forest trails"],
      included: ["ATV rental", "Fuel", "Guide vehicle escort", "Cenote swim stop"],
      excluded: ["Driver's license requirement — bring a valid one", "Lunch", "Gratuities"],
      coverKey: "atv-trail",
      galleryKeys: ["gallery-3"],
    },
    {
      slug: "cave-dive-certified",
      title: "Guided Cave Dive for Certified Divers",
      excerpt: "A guided cavern-zone dive for certified divers, exploring one of the region's clearest systems.",
      description: [
        "This trip is for certified divers only (open water minimum; cavern or cave certification preferred). We dive the cavern zone of a well-known cenote system with a specialized guide.",
        "Visibility here regularly exceeds 30 meters, with dramatic halocline layers where fresh and salt water meet.",
      ],
      durationMinutes: 200,
      difficulty: "Advanced",
      groupSizeMin: 1,
      groupSizeMax: 4,
      priceAmount: "2200.00",
      location: "Cenote dive system, permit-access site",
      highlights: ["Cavern-zone guided dive", "30m+ average visibility", "Small groups, max 4 divers"],
      included: ["Certified cave/cavern dive guide", "Tank and weights", "Site permit fee"],
      excluded: ["Dive certification (required in advance)", "Personal dive gear rental", "Gratuities"],
      coverKey: "cave-dive",
      galleryKeys: [],
    },
    {
      slug: "rainforest-trail-hike",
      title: "Rainforest Trail & Wildlife Walk",
      excerpt: "A slow-paced walk through old-growth rainforest with a naturalist guide.",
      description: [
        "A naturalist-led walk through a stretch of old-growth rainforest, paced deliberately slowly so there's time to actually see what's around you — birds, insects, medicinal plants, and the occasional troop of spider monkeys.",
        "Good footwear is all you need; the trail is well-marked and mostly flat.",
      ],
      durationMinutes: 165,
      difficulty: "Easy",
      groupSizeMin: 2,
      groupSizeMax: 12,
      priceAmount: "680.00",
      location: "Community-managed forest reserve",
      highlights: ["Naturalist guide", "Birdwatching and native plants", "Supports community forest reserve"],
      included: ["Guide", "Binoculars", "Bottled water"],
      excluded: ["Transport to trailhead", "Lunch", "Gratuities"],
      coverKey: "rainforest-hike",
      galleryKeys: ["gallery-4"],
    },
  ];

  for (const [index, tour] of tours.entries()) {
    const created = await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: {},
      create: {
        slug: tour.slug,
        title: tour.title,
        excerpt: tour.excerpt,
        description: tour.description,
        durationMinutes: tour.durationMinutes,
        difficulty: tour.difficulty,
        groupSizeMin: tour.groupSizeMin,
        groupSizeMax: tour.groupSizeMax,
        priceAmount: tour.priceAmount,
        priceCurrency: "MXN",
        location: tour.location,
        highlights: tour.highlights,
        included: tour.included,
        excluded: tour.excluded,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - index * 86_400_000),
      },
    });

    const coverMediaId = mediaId.get(tour.coverKey)!;
    await prisma.tourMedia.upsert({
      where: { tourId_mediaId: { tourId: created.id, mediaId: coverMediaId } },
      update: {},
      create: { tourId: created.id, mediaId: coverMediaId, isCover: true, sortOrder: 0 },
    });

    for (const [i, key] of tour.galleryKeys.entries()) {
      const id = mediaId.get(key)!;
      await prisma.tourMedia.upsert({
        where: { tourId_mediaId: { tourId: created.id, mediaId: id } },
        update: {},
        create: { tourId: created.id, mediaId: id, isCover: false, sortOrder: i + 1 },
      });
    }
  }

  const posts = [
    {
      slug: "how-cenotes-are-formed",
      title: "How Cenotes Are Formed: A Quick Geology Primer",
      excerpt: "The Yucatán sits on a limestone shelf riddled with sinkholes — here's why, and what it means for the water inside them.",
      content: [
        "The entire Yucatán Peninsula sits on a shelf of porous limestone laid down over millions of years by an ancient seabed. Limestone dissolves slowly in slightly acidic rainwater, and over time that process carves out vast underground cave systems.",
        "When a cave ceiling collapses, or erodes down to the water table, you get a cenote — an open or semi-open sinkhole exposing the aquifer below. Because there are almost no rivers on the surface here, cenotes are historically the region's main source of fresh water, which is part of why they carried deep significance for the ancient Maya.",
        "Today the peninsula has thousands of mapped cenotes, connected in places by some of the longest underwater cave systems on Earth.",
      ],
      coverKey: "journal-geology",
    },
    {
      slug: "what-to-pack-cenote-day",
      title: "What to Pack for a Day of Cenote Swimming",
      excerpt: "A short packing list for cenote tours, including why your regular sunscreen probably isn't allowed in the water.",
      content: [
        "Bring a swimsuit, a change of clothes, a towel, and water shoes if you have them — some cenote entries involve wet rock or uneven steps.",
        "Skip regular sunscreen and bug spray before swimming: most cenotes now require biodegradable, mineral-based sunscreen, since regular sunscreen chemicals build up in these closed water systems over time. We carry a limited backup supply, but it's worth bringing your own.",
        "A dry bag for your phone and any cash is genuinely useful — most sites don't have secure storage, and you'll want photos.",
      ],
      coverKey: "journal-packing",
    },
    {
      slug: "meet-our-guides",
      title: "Meet Our Guides: Life on the Yucatán Trails",
      excerpt: "Every guide on our team grew up near the routes we run today. Here's a little about how that came to be.",
      content: [
        "Most tour operators in this region hire guides from wherever they can find English speakers. We've done it differently from the start: every guide on our team was born within a few kilometers of the trails, cenotes, and reserves we take travelers to.",
        "That matters for more than trivia — it means our guides know which cenote is quiet on a Tuesday morning, which trail floods after heavy rain, and which families run the small restaurants worth stopping at afterward.",
        "This page will carry real guide profiles once the admin content tools are in place.",
      ],
      coverKey: "journal-guides",
    },
  ];

  for (const [index, post] of posts.entries()) {
    const created = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - index * 86_400_000 * 3),
        authorId: admin.id,
      },
    });

    const coverMediaId = mediaId.get(post.coverKey)!;
    await prisma.blogPostMedia.upsert({
      where: { blogPostId_mediaId: { blogPostId: created.id, mediaId: coverMediaId } },
      update: {},
      create: { blogPostId: created.id, mediaId: coverMediaId, isCover: true, sortOrder: 0 },
    });
  }

  const galleryEntries: { key: string; category: string; caption: string }[] = [
    { key: "cenote-azul", category: "Cenotes", caption: "Cenote Azul, mid-morning light" },
    { key: "gallery-1", category: "Cenotes", caption: "Layered turquoise water" },
    { key: "canopy-zipline", category: "Canopy", caption: "Zipline platform above the jungle" },
    { key: "kayak-mangrove", category: "Water", caption: "Mangrove channel at sunrise" },
    { key: "gallery-2", category: "Water", caption: "Mangrove reflections" },
    { key: "atv-trail", category: "Trails", caption: "Backcountry trail dust" },
    { key: "gallery-3", category: "Trails", caption: "Dry scrub trail" },
    { key: "cave-dive", category: "Diving", caption: "Cavern-zone light shaft" },
    { key: "rainforest-hike", category: "Trails", caption: "Rainforest canopy from below" },
    { key: "gallery-4", category: "Canopy", caption: "Canopy texture at dusk" },
  ];

  for (const [index, entry] of galleryEntries.entries()) {
    const id = mediaId.get(entry.key)!;
    await prisma.galleryItem.upsert({
      where: { id: `${entry.key}-gallery-item` },
      update: {},
      create: {
        id: `${entry.key}-gallery-item`,
        mediaId: id,
        category: entry.category,
        caption: entry.caption,
        sortOrder: index,
        isPublished: true,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login (dev only): admin@kootenwayetours.com / ChangeMe123!`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

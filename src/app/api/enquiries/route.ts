import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const enquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(2000),
  tourSlug: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = enquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, email, phone, message, tourSlug } = parsed.data;

  const tour = tourSlug ? await prisma.tour.findUnique({ where: { slug: tourSlug } }) : null;

  await prisma.enquiry.create({
    data: {
      name,
      email,
      phone: phone || null,
      message,
      tourId: tour?.id ?? null,
      source: "website",
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

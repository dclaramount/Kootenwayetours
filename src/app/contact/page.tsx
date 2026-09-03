import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionHeading } from "@/components/section-heading";
import { EnquiryForm } from "@/components/enquiry-form";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Let's plan your trip"
        dek="Send an enquiry or reach us directly — we're usually quickest on WhatsApp."
      />
      <div className="mt-12 grid gap-12 lg:grid-cols-[3fr_2fr]">
        <Suspense>
          <EnquiryForm />
        </Suspense>
        <div className="space-y-6">
          <InfoRow label="Phone" value={BUSINESS.phone} href={BUSINESS.phoneHref} />
          <InfoRow label="Email" value={BUSINESS.email} href={`mailto:${BUSINESS.email}`} />
          <InfoRow label="WhatsApp" value="Chat with us" href={BUSINESS.whatsappHref} />
          <InfoRow label="Address" value={BUSINESS.address} />
          <InfoRow label="Hours" value={BUSINESS.hours} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="border-b border-ink/10 pb-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 text-ink/90">
        {href ? (
          <a href={href} className="text-teal-dark hover:text-teal">
            {value}
          </a>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

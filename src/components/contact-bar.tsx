import { BUSINESS } from "@/lib/business";

export function ContactBar() {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">
      <a
        href={BUSINESS.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-limestone shadow-lg transition-colors hover:bg-teal-dark"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 20l1.3-3.8A8 8 0 1112 20a7.9 7.9 0 01-4-1.1L4 20z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M8.5 10.5c.5 2.5 2.5 4.5 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </a>
      <a
        href={BUSINESS.phoneHref}
        aria-label="Call us"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-jungle text-limestone shadow-lg transition-colors hover:bg-teal-dark"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 3h3l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v3a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-2z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}

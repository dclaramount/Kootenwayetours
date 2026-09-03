"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

export function EnquiryForm() {
  const searchParams = useSearchParams();
  const tourSlug = searchParams.get("tour") ?? "";
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    const response = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        message: data.get("message"),
        tourSlug,
      }),
    });

    if (response.ok) {
      setStatus("success");
      form.reset();
    } else {
      setStatus("error");
      setErrorMessage(
        "Something went wrong sending your enquiry. Please try again or reach us on WhatsApp.",
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-teal/30 bg-teal/10 p-6 text-jungle">
        <p className="font-display text-lg font-semibold">
          Thanks — we&apos;ve got your message.
        </p>
        <p className="mt-2 text-sm text-ink/70">We usually reply within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {tourSlug && (
        <p className="rounded-lg bg-teal/10 px-4 py-2 text-sm text-teal-dark">
          Asking about: <span className="font-semibold">{tourSlug.replace(/-/g, " ")}</span>
        </p>
      )}
      <Field label="Name" name="name" type="text" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone (optional)" name="phone" type="tel" />
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink/80">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
        />
      </div>
      {errorMessage && <p className="text-sm text-clay">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-limestone transition-colors hover:bg-teal-dark disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  required,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink/80">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
      />
    </div>
  );
}

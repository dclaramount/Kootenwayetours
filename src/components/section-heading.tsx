export function SectionHeading({
  eyebrow,
  title,
  dek,
}: {
  eyebrow?: string;
  title: string;
  dek?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-teal-dark">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance font-display text-3xl font-semibold text-jungle sm:text-4xl">
        {title}
      </h2>
      {dek && <p className="mt-3 text-ink/70">{dek}</p>}
    </div>
  );
}

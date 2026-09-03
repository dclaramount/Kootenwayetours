export function RichText({ blocks }: { blocks: string[] }) {
  return (
    <div className="space-y-4 leading-relaxed text-ink/90">
      {blocks.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
}

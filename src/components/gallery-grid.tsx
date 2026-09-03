"use client";

import { useEffect, useState } from "react";
import type { GalleryItem, Media } from "@prisma/client";

type Item = GalleryItem & { media: Media };

export function GalleryGrid({ items }: { items: Item[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? items[activeIndex] : null;

  function close() {
    setActiveIndex(null);
  }
  function next() {
    setActiveIndex((index) => (index === null ? null : (index + 1) % items.length));
  }
  function prev() {
    setActiveIndex((index) =>
      index === null ? null : (index - 1 + items.length) % items.length,
    );
  }

  useEffect(() => {
    if (activeIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, items.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`View photo: ${item.media.altText}`}
            className="group aspect-square overflow-hidden rounded-xl bg-teal/10"
          >
            <img
              src={item.media.storageKey}
              alt={item.media.altText}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          className="fixed inset-0 z-50 flex items-center justify-center bg-jungle/90 p-4"
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              close();
            }}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-limestone/10 text-2xl leading-none text-limestone hover:bg-limestone/20"
          >
            ×
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              prev();
            }}
            aria-label="Previous photo"
            className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-limestone/10 text-2xl leading-none text-limestone hover:bg-limestone/20 md:left-6"
          >
            ‹
          </button>
          <figure className="max-h-[80vh] max-w-3xl" onClick={(event) => event.stopPropagation()}>
            <img
              src={active.media.storageKey}
              alt={active.media.altText}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
            {active.caption && (
              <figcaption className="mt-3 text-center text-sm text-limestone/80">
                {active.caption}
              </figcaption>
            )}
          </figure>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
            aria-label="Next photo"
            className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-limestone/10 text-2xl leading-none text-limestone hover:bg-limestone/20 md:right-6"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";

/**
 * An icon-size photo thumbnail that opens the same image full-size in a lightbox on click — the
 * stored photo is already high resolution (see resizeImageToDataUrl call sites), the small
 * className here is only how it's displayed inline; clicking reveals the detail a tiny thumbnail
 * can't (tags, wear, labels).
 */
export function ZoomableThumb({ src, alt = "", className }: { src: string; alt?: string; className: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="cursor-zoom-in border-0 bg-transparent p-0" aria-label="View larger photo">
        {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo */}
        <img src={src} alt={alt} className={className} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={() => setOpen(false)}>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-neutral-900/80 px-3 py-1.5 text-sm text-neutral-100 hover:bg-neutral-800"
          >
            ✕ Close
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- user-provided photo */}
          <img src={src} alt={alt} className="max-h-full max-w-full cursor-default rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

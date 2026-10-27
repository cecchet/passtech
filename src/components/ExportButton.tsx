"use client";

import { useState } from "react";
import { ENTRY_PHOTO_KEYS, EquipmentEntry } from "@/lib/matcher";
import { downscaleDataUrl } from "@/lib/imageResize";

const buttonClass = "rounded border border-neutral-600 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-800";

export function downloadJson(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exporting a gear set, or one piece of gear, to a file: first asks whether to include the photos
 * at full size.
 *
 * Sharing a file via `navigator.share()` turned out not to be reliable enough to keep: on real
 * devices it silently rejected the file (tried both "application/json" and a "text/plain" retry —
 * see git history) and fell back to a plain download anyway, so the "Share / Email" option was
 * just a confusing extra click that landed on the same download every time. Exporting is just a
 * download now — on most phones, the browser's own download-complete notification already offers a
 * native Share action from there, which reaches the same Mail/Messages/Drive picker without
 * PassTech needing to drive it (and without the reliability problems of doing so).
 */
export function ExportButton({ label, onExport }: { label: string; onExport: (includeHighRes: boolean) => void }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        📄 {label}
      </button>
    );
  }

  const choose = (includeHighRes: boolean) => {
    onExport(includeHighRes);
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded border border-neutral-700 bg-neutral-900 p-2">
      <span className="text-xs text-neutral-300">Include high-resolution photos in the export?</span>
      <button
        type="button"
        onClick={() => choose(true)}
        className="rounded border border-emerald-700 bg-emerald-950 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-900"
      >
        Yes, include them
      </button>
      <button type="button" onClick={() => choose(false)} className={buttonClass}>
        No, keep it small
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-neutral-500 hover:text-neutral-300">
        Cancel
      </button>
    </div>
  );
}

const LIGHTWEIGHT_EXPORT_MAX_DIM = 480;
const LIGHTWEIGHT_EXPORT_QUALITY = 0.6;

/** A photo re-encoded smaller, for an export without high-resolution photos. */
export const shrinkPhoto = (url: string) => downscaleDataUrl(url, LIGHTWEIGHT_EXPORT_MAX_DIM, LIGHTWEIGHT_EXPORT_QUALITY);

/** A piece of gear with its photos (its own and each unit's) re-encoded smaller -- only the exported
 * copy; what's stored is untouched. */
export async function shrinkEntryPhotos(entry: EquipmentEntry): Promise<EquipmentEntry> {
  const shrinkAll = async <T extends { photoDataUrls?: string[] }>(x: T): Promise<T> =>
    x.photoDataUrls?.length ? { ...x, photoDataUrls: await Promise.all(x.photoDataUrls.map(shrinkPhoto)) } : x;
  const out = { ...entry };
  for (const k of ENTRY_PHOTO_KEYS) if (out[k]?.length) out[k] = await Promise.all(out[k]!.map(shrinkPhoto));
  if (out.extinguisherUnits) {
    out.extinguisherUnits = await Promise.all(
      out.extinguisherUnits.map(async (u) => {
        const x = await shrinkAll(u);
        return x.tagPhotoDataUrls?.length ? { ...x, tagPhotoDataUrls: await Promise.all(x.tagPhotoDataUrls.map(shrinkPhoto)) } : x;
      })
    );
  }
  if (out.windowBreakerUnits) out.windowBreakerUnits = await Promise.all(out.windowBreakerUnits.map(shrinkAll));
  if (out.triangleUnits) out.triangleUnits = await Promise.all(out.triangleUnits.map(shrinkAll));
  return out;
}

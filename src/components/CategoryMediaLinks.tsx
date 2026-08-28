import { CATEGORY_META } from "@/data/categoryMeta";
import { EquipmentCategory } from "@/data/types";

/**
 * Small clickable Frog Racing logos — a YouTube icon linking to an explainer video (e.g. SFI vs FIA
 * ratings), and/or a shopping-cart icon linking to a product to buy. Renders nothing when the
 * category has neither link set in CATEGORY_META. Deliberately not used anywhere in pdfReport.ts —
 * these are on-screen-only affordances, not part of the printable report.
 */
export function CategoryMediaLinks({
  category,
  size = "h-8 w-8",
  className = "flex gap-1.5",
}: {
  category: EquipmentCategory;
  /** Tailwind height/width classes for each icon — pass a smaller size for compact/inline placements (e.g. a collapsed card's summary row). */
  size?: string;
  /** Classes for the wrapping row — override when embedding inline among other summary content instead of as its own block. */
  className?: string;
}) {
  const meta = CATEGORY_META[category];
  if (!meta.videoUrl && !meta.productUrl) return null;

  return (
    <div className={className}>
      {meta.videoUrl && (
        <a
          href={meta.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={meta.videoTitle ?? "Watch a related video"}
          className={`block ${size} shrink-0 overflow-hidden rounded-md border border-neutral-600 bg-white shadow`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img src="/frog-racing-video.jpg" alt={meta.videoTitle ?? "Watch a related video"} className="h-full w-full object-cover" />
        </a>
      )}
      {meta.productUrl && (
        <a
          href={meta.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={meta.productTitle ?? "Shop this item"}
          className={`block ${size} shrink-0 overflow-hidden rounded-md border border-neutral-600 bg-white shadow`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img src="/frog-shopping-cart.jpg" alt={meta.productTitle ?? "Shop this item"} className="h-full w-full object-cover" />
        </a>
      )}
    </div>
  );
}

import { CATEGORY_META } from "@/data/categoryMeta";
import { EquipmentCategory } from "@/data/types";

/**
 * Small clickable Frog Racing logos — a YouTube icon linking to an explainer video (e.g. SFI vs FIA
 * ratings), and/or a shopping-cart icon linking to a product to buy. Renders nothing when the
 * category has neither link set in CATEGORY_META. Deliberately not used anywhere in pdfReport.ts —
 * these are on-screen-only affordances, not part of the printable report.
 */
// One standard icon size everywhere this renders — Option 1, and both the collapsed-summary and
// resolved-bottom placements in Options 2/3 — so the same logo never appears a different size
// depending on where it happens to be shown.
const ICON_SIZE = "h-6 w-6";

export function CategoryMediaLinks({
  category,
  className = "flex gap-1.5",
}: {
  category: EquipmentCategory;
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
          className={`block ${ICON_SIZE} shrink-0 overflow-hidden rounded-md border border-neutral-600 bg-white shadow`}
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
          className={`block ${ICON_SIZE} shrink-0 overflow-hidden rounded-md border border-neutral-600 bg-white shadow`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img src="/frog-shopping-cart.jpg" alt={meta.productTitle ?? "Shop this item"} className="h-full w-full object-cover" />
        </a>
      )}
    </div>
  );
}

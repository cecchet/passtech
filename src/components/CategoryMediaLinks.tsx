import { CATEGORY_META } from "@/data/categoryMeta";
import { EquipmentCategory } from "@/data/types";

/**
 * Small clickable logos for this category — in order left to right: this category's own section on
 * frogracing.us, a Frog Racing channel explainer video, a non-Frog-Racing YouTube video, and a
 * product to buy. Renders nothing when the category has none of the four set in CATEGORY_META.
 * Deliberately not used anywhere in pdfReport.ts — these are on-screen-only affordances, not part of
 * the printable report.
 */
// One standard icon size everywhere this renders — Option 1, and both the collapsed-summary and
// resolved-bottom placements in Options 2/3 — so the same logo never appears a different size
// depending on where it happens to be shown.
const ICON_SIZE = "h-[30px] w-[30px]";
const ICON_CLASS = `block ${ICON_SIZE} shrink-0 overflow-hidden rounded-md border border-neutral-600 bg-white shadow`;

export function CategoryMediaLinks({
  category,
  className = "flex gap-1.5",
}: {
  category: EquipmentCategory;
  /** Classes for the wrapping row — override when embedding inline among other summary content instead of as its own block. */
  className?: string;
}) {
  const meta = CATEGORY_META[category];
  if (!meta.webUrl && !meta.frogVideoUrl && !meta.youtubeVideoUrl && !meta.productUrl) return null;

  return (
    <div className={className}>
      {meta.webUrl && (
        <a href={meta.webUrl} target="_blank" rel="noopener noreferrer" title={meta.webTitle ?? "Learn more on frogracing.us"} className={ICON_CLASS}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img src="/frog-web.jpg" alt={meta.webTitle ?? "Learn more on frogracing.us"} className="h-full w-full object-cover" />
        </a>
      )}
      {meta.frogVideoUrl && (
        <a href={meta.frogVideoUrl} target="_blank" rel="noopener noreferrer" title={meta.frogVideoTitle ?? "Watch a related video"} className={ICON_CLASS}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img src="/frog-racing-video.jpg" alt={meta.frogVideoTitle ?? "Watch a related video"} className="h-full w-full object-cover" />
        </a>
      )}
      {meta.youtubeVideoUrl && (
        <a href={meta.youtubeVideoUrl} target="_blank" rel="noopener noreferrer" title={meta.youtubeVideoTitle ?? "Watch a related video"} className={ICON_CLASS}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img src="/youtube-logo.png" alt={meta.youtubeVideoTitle ?? "Watch a related video"} className="h-full w-full object-contain p-0.5" />
        </a>
      )}
      {meta.productUrl && (
        <a href={meta.productUrl} target="_blank" rel="noopener noreferrer" title={meta.productTitle ?? "Shop this item"} className={ICON_CLASS}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img src="/frog-shopping-cart.jpg" alt={meta.productTitle ?? "Shop this item"} className="h-full w-full object-cover" />
        </a>
      )}
    </div>
  );
}

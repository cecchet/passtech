import { CATEGORY_META } from "@/data/categoryMeta";
import { EquipmentCategory } from "@/data/types";

/**
 * Small clickable Frog Racing logos — a website icon linking to this category's own section on
 * frogracing.us, a YouTube icon linking to an explainer video (e.g. SFI vs FIA ratings), and/or a
 * shopping-cart icon linking to a product to buy, in that order left to right. Renders nothing when
 * the category has none of the three set in CATEGORY_META. Deliberately not used anywhere in
 * pdfReport.ts — these are on-screen-only affordances, not part of the printable report.
 */
// One standard icon size everywhere this renders — Option 1, and both the collapsed-summary and
// resolved-bottom placements in Options 2/3 — so the same logo never appears a different size
// depending on where it happens to be shown.
const ICON_SIZE = "h-6 w-6";
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
  if (!meta.webUrl && !meta.videoUrl && !meta.productUrl) return null;

  return (
    <div className={className}>
      {meta.webUrl && (
        <a href={meta.webUrl} target="_blank" rel="noopener noreferrer" title={meta.webTitle ?? "Learn more on frogracing.us"} className={ICON_CLASS}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img src="/frog-web.jpg" alt={meta.webTitle ?? "Learn more on frogracing.us"} className="h-full w-full object-cover" />
        </a>
      )}
      {meta.videoUrl && (
        <a href={meta.videoUrl} target="_blank" rel="noopener noreferrer" title={meta.videoTitle ?? "Watch a related video"} className={ICON_CLASS}>
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img
            src={meta.videoIcon === "youtube" ? "/youtube-logo.png" : "/frog-racing-video.jpg"}
            alt={meta.videoTitle ?? "Watch a related video"}
            className={meta.videoIcon === "youtube" ? "h-full w-full object-contain p-0.5" : "h-full w-full object-cover"}
          />
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

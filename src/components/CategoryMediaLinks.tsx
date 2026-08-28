import { CATEGORY_META } from "@/data/categoryMeta";
import { EquipmentCategory } from "@/data/types";

/**
 * Small clickable Frog Racing logos in the corner of a category's card — a YouTube icon linking to
 * an explainer video (e.g. SFI vs FIA ratings), and/or a shopping-cart icon linking to a product to
 * buy. Renders nothing when the category has neither link set in CATEGORY_META.
 */
export function CategoryMediaLinks({ category }: { category: EquipmentCategory }) {
  const meta = CATEGORY_META[category];
  if (!meta.videoUrl && !meta.productUrl) return null;

  return (
    <div className="mt-3 flex justify-end gap-1.5">
      {meta.videoUrl && (
        <a
          href={meta.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={meta.videoTitle ?? "Watch a related video"}
          className="block h-8 w-8 shrink-0 overflow-hidden rounded-md border border-neutral-600 bg-white shadow"
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
          className="block h-8 w-8 shrink-0 overflow-hidden rounded-md border border-neutral-600 bg-white shadow"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small static bundled icon, see CategoryIcons.tsx for why plain <img> */}
          <img src="/frog-shopping-cart.jpg" alt={meta.productTitle ?? "Shop this item"} className="h-full w-full object-cover" />
        </a>
      )}
    </div>
  );
}

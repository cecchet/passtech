import { EquipmentCategory } from "@/data/types";

/**
 * Frog Race Team mascot artwork for each category legend (public/frog-*.{jpg,png}).
 * Plain <img>, not next/image: these are small static icons where automatic
 * optimization buys nothing, and Next's /_next/image resizer has been observed to
 * hang indefinitely on at least one of these PNGs (frog-hans.png) despite the raw
 * file loading fine — not worth depending on Sharp handling every future asset.
 */

interface IconSpec {
  src: string;
  objectPosition: string;
  fit?: "cover" | "contain";
}

/**
 * Single source of truth for each category's icon file — both the on-screen <img> components
 * below and the PDF report generator (src/lib/pdfReport.ts, which has no JSX to render) read
 * from this map instead of duplicating the file paths.
 */
export const CATEGORY_ICON_SPEC: Record<EquipmentCategory, IconSpec> = {
  helmet: { src: "/frog-helmet.jpg", objectPosition: "62% 42%" },
  balaclava: { src: "/frog-balaclava.jpg", objectPosition: "50% 45%" },
  hnr: { src: "/frog-hans.png", objectPosition: "50% 45%" },
  firesuit: { src: "/frog-firesuit.png", objectPosition: "50% 45%" },
  gloves: { src: "/frog-gloves.png", objectPosition: "50% 38%" },
  shoes: { src: "/frog-shoes.jpg", objectPosition: "50% 55%" },
  socks: { src: "/frog-socks.jpg", objectPosition: "50% 45%" },
  undergarment: { src: "/frog-undergarment.png", objectPosition: "50% 45%" },
  arm_restraint: { src: "/frog-arm-restraints.png", objectPosition: "50% 45%" },
  seat: { src: "/race-seat.jpg", objectPosition: "50% 50%", fit: "contain" },
  belts_harness: { src: "/racing-harness.jpg", objectPosition: "50% 50%", fit: "contain" },
  window_net: { src: "/window-net.jpg", objectPosition: "50% 45%" },
  fire_extinguisher: { src: "/frog-extinguisher.jpg", objectPosition: "50% 45%" },
  fire_suppression: { src: "/frog-fire-suppression.jpg", objectPosition: "50% 45%" },
  fuel_cell: { src: "/fuel-cell.jpg", objectPosition: "50% 45%" },
  window_breaker: { src: "/window-breaker.jpg", objectPosition: "50% 45%" },
  kill_switch: { src: "/kill-switch.jpg", objectPosition: "50% 45%" },
  tow_hook: { src: "/tow-hook.jpg", objectPosition: "50% 45%" },
  tow_rope: { src: "/tow-rope.jpg", objectPosition: "50% 45%" },
  emergency_triangle: { src: "/triangles.jpg", objectPosition: "50% 45%" },
  first_aid_kit: { src: "/first-aid.jpg", objectPosition: "50% 45%" },
  rollover_protection: { src: "/rollcage-diagram.png", objectPosition: "50% 50%", fit: "contain" },
};

function CategoryIcon({ category }: { category: EquipmentCategory }) {
  const { src, objectPosition, fit = "cover" } = CATEGORY_ICON_SPEC[category];
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static bundled icon, optimizer unreliable on these (see file comment)
    <img
      src={src}
      alt=""
      className={`h-12 w-12 shrink-0 rounded-lg bg-neutral-800 ${fit === "contain" ? "object-contain" : "object-cover"}`}
      style={{ objectPosition }}
    />
  );
}

export const CATEGORY_ICONS: Record<EquipmentCategory, () => React.JSX.Element> = (
  Object.keys(CATEGORY_ICON_SPEC) as EquipmentCategory[]
).reduce(
  (acc, category) => {
    acc[category] = () => <CategoryIcon category={category} />;
    return acc;
  },
  {} as Record<EquipmentCategory, () => React.JSX.Element>
);

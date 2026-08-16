import { EquipmentCategory } from "@/data/types";

/**
 * Frog Race Team mascot artwork for each category legend (public/frog-*.{jpg,png}).
 * Plain <img>, not next/image: these are small static icons where automatic
 * optimization buys nothing, and Next's /_next/image resizer has been observed to
 * hang indefinitely on at least one of these PNGs (frog-hans.png) despite the raw
 * file loading fine — not worth depending on Sharp handling every future asset.
 */

function CategoryIcon({ src, objectPosition }: { src: string; objectPosition: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- static bundled icon, optimizer unreliable on these (see file comment)
  return <img src={src} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" style={{ objectPosition }} />;
}

const HelmetIcon = () => <CategoryIcon src="/frog-helmet.jpg" objectPosition="62% 42%" />;
const BalaclavaIcon = () => <CategoryIcon src="/frog-balaclava.jpg" objectPosition="50% 45%" />;
const HnrIcon = () => <CategoryIcon src="/frog-hans.png" objectPosition="50% 45%" />;
const FiresuitIcon = () => <CategoryIcon src="/frog-firesuit.png" objectPosition="50% 45%" />;
const GlovesIcon = () => <CategoryIcon src="/frog-gloves.png" objectPosition="50% 38%" />;
const ShoesIcon = () => <CategoryIcon src="/frog-shoes.jpg" objectPosition="50% 55%" />;
const UndergarmentIcon = () => <CategoryIcon src="/frog-undergarment.png" objectPosition="50% 45%" />;
const ArmRestraintIcon = () => <CategoryIcon src="/frog-arm-restraints.png" objectPosition="50% 45%" />;

export const CATEGORY_ICONS: Record<EquipmentCategory, () => React.JSX.Element> = {
  helmet: HelmetIcon,
  balaclava: BalaclavaIcon,
  hnr: HnrIcon,
  firesuit: FiresuitIcon,
  gloves: GlovesIcon,
  shoes: ShoesIcon,
  undergarment: UndergarmentIcon,
  arm_restraint: ArmRestraintIcon,
};

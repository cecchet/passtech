import { EquipmentCategory } from "@/data/types";

/**
 * Frog Race Team mascot artwork for each category legend (public/frog-*.{jpg,png}).
 * Plain <img>, not next/image: these are small static icons where automatic
 * optimization buys nothing, and Next's /_next/image resizer has been observed to
 * hang indefinitely on at least one of these PNGs (frog-hans.png) despite the raw
 * file loading fine — not worth depending on Sharp handling every future asset.
 */

function CategoryIcon({ src, objectPosition, fit = "cover" }: { src: string; objectPosition: string; fit?: "cover" | "contain" }) {
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

const HelmetIcon = () => <CategoryIcon src="/frog-helmet.jpg" objectPosition="62% 42%" />;
const BalaclavaIcon = () => <CategoryIcon src="/frog-balaclava.jpg" objectPosition="50% 45%" />;
const HnrIcon = () => <CategoryIcon src="/frog-hans.png" objectPosition="50% 45%" />;
const FiresuitIcon = () => <CategoryIcon src="/frog-firesuit.png" objectPosition="50% 45%" />;
const GlovesIcon = () => <CategoryIcon src="/frog-gloves.png" objectPosition="50% 38%" />;
const ShoesIcon = () => <CategoryIcon src="/frog-shoes.jpg" objectPosition="50% 55%" />;
const SocksIcon = () => <CategoryIcon src="/frog-socks.jpg" objectPosition="50% 45%" />;
const UndergarmentIcon = () => <CategoryIcon src="/frog-undergarment.png" objectPosition="50% 45%" />;
const ArmRestraintIcon = () => <CategoryIcon src="/frog-arm-restraints.png" objectPosition="50% 45%" />;

const SeatIcon = () => <CategoryIcon src="/race-seat.jpg" objectPosition="50% 50%" fit="contain" />;
const BeltsHarnessIcon = () => <CategoryIcon src="/racing-harness.jpg" objectPosition="50% 50%" fit="contain" />;
const WindowNetIcon = () => <CategoryIcon src="/window-net.jpg" objectPosition="50% 45%" />;
const FireExtinguisherIcon = () => <CategoryIcon src="/frog-extinguisher.jpg" objectPosition="50% 45%" />;
const FireSuppressionIcon = () => <CategoryIcon src="/frog-fire-suppression.jpg" objectPosition="50% 45%" />;
const FuelCellIcon = () => <CategoryIcon src="/fuel-cell.jpg" objectPosition="50% 45%" />;
const WindowBreakerIcon = () => <CategoryIcon src="/window-breaker.jpg" objectPosition="50% 45%" />;
const KillSwitchIcon = () => <CategoryIcon src="/kill-switch.jpg" objectPosition="50% 45%" />;
const TowHookIcon = () => <CategoryIcon src="/tow-hook.jpg" objectPosition="50% 45%" />;
const TowRopeIcon = () => <CategoryIcon src="/tow-rope.jpg" objectPosition="50% 45%" />;
const EmergencyTriangleIcon = () => <CategoryIcon src="/triangles.jpg" objectPosition="50% 45%" />;
const FirstAidKitIcon = () => <CategoryIcon src="/first-aid.jpg" objectPosition="50% 45%" />;

const RolloverProtectionIcon = () => <CategoryIcon src="/rollcage-diagram.png" objectPosition="50% 50%" fit="contain" />;

export const CATEGORY_ICONS: Record<EquipmentCategory, () => React.JSX.Element> = {
  helmet: HelmetIcon,
  balaclava: BalaclavaIcon,
  hnr: HnrIcon,
  firesuit: FiresuitIcon,
  gloves: GlovesIcon,
  shoes: ShoesIcon,
  socks: SocksIcon,
  undergarment: UndergarmentIcon,
  arm_restraint: ArmRestraintIcon,
  seat: SeatIcon,
  belts_harness: BeltsHarnessIcon,
  window_net: WindowNetIcon,
  fire_extinguisher: FireExtinguisherIcon,
  fire_suppression: FireSuppressionIcon,
  fuel_cell: FuelCellIcon,
  window_breaker: WindowBreakerIcon,
  kill_switch: KillSwitchIcon,
  tow_hook: TowHookIcon,
  tow_rope: TowRopeIcon,
  emergency_triangle: EmergencyTriangleIcon,
  first_aid_kit: FirstAidKitIcon,
  rollover_protection: RolloverProtectionIcon,
};

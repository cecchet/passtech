import { CategoryGroup, DisciplineGroup, EquipmentCategory } from "./types";

export const GROUP_ORDER: CategoryGroup[] = ["driver", "car", "rollcage"];

/** Canonical display order for the 10 discipline groups — used by the main ruleset picker, the Option 3 discipline filter/grouping, and the matching PDF report. */
export const DISCIPLINE_GROUP_ORDER: DisciplineGroup[] = [
  "Autocross",
  "RallyCross",
  "Rally",
  "Road Racing",
  "Hillclimb",
  "Ice Racing",
  "Endurance Racing",
  "HPDE / Track Day",
  "Drag Racing",
  "Karting",
];

export const GROUP_LABELS: Record<CategoryGroup, string> = {
  driver: "Driver Safety Gear",
  car: "Car Safety Gear",
  rollcage: "Rollover protection",
};

/** Section text/border color per group, so each group reads as visually distinct wherever its categories are shown. */
export const GROUP_COLORS: Record<CategoryGroup, { text: string; border: string }> = {
  driver: { text: "text-blue-400", border: "border-blue-800" },
  car: { text: "text-pink-400", border: "border-pink-800" },
  rollcage: { text: "text-teal-400", border: "border-teal-800" },
};

/** Categories whose group is currently selected, in CATEGORY_ORDER — used to filter what's shown/evaluated. */
export function filterCategoriesByGroups(categories: EquipmentCategory[], activeGroups: ReadonlySet<CategoryGroup>): EquipmentCategory[] {
  return categories.filter((c) => activeGroups.has(CATEGORY_META[c].group));
}

/**
 * Rally only: categories that need a separate entry per occupant when a ruleset has
 * `supportsCodriver` and the "Add codriver gear" toggle is on — the usual driver-group personal
 * gear plus seat/harness/window net, which rally treats as per-seat rather than car-shared.
 * Everything else (fuel cell, extinguisher, kill switch, rollover protection, etc.) stays a single
 * shared car-level entry regardless of occupant count.
 */
export const PER_OCCUPANT_CATEGORIES: EquipmentCategory[] = [
  "helmet",
  "balaclava",
  "hnr",
  "neck_collar",
  "firesuit",
  "undergarment",
  "gloves",
  "arm_restraint",
  "shoes",
  "socks",
  "seat",
  "belts_harness",
  "window_net",
];

export function isPerOccupantCategory(category: EquipmentCategory): boolean {
  return PER_OCCUPANT_CATEGORIES.includes(category);
}

export const CATEGORY_ORDER: EquipmentCategory[] = [
  // Driver safety gear
  "helmet",
  "balaclava",
  "hnr",
  "neck_collar",
  "firesuit",
  "undergarment",
  "gloves",
  "arm_restraint",
  "shoes",
  "socks",
  // Car safety gear
  "seat",
  "belts_harness",
  "window_net",
  "fuel_cell",
  "fire_extinguisher",
  "fire_suppression",
  "kill_switch",
  "tow_hook",
  "tow_rope",
  "emergency_triangle",
  "first_aid_kit",
  "window_breaker",
  "parachute",
  // Rollover protection
  "rollover_protection",
];

interface CategoryMeta {
  label: string;
  group: CategoryGroup;
  /** Pure standard-based categories (helmet/hnr/firesuit) always need a cert. Hybrid categories can be satisfied by plain material/stock equipment with no cert, depending on the body's rule. */
  hybrid: boolean;
  /** No certification/material concept at all — just a presence + free-text requirement (e.g. tow hook, first aid kit). */
  presenceOnly?: boolean;
  /** Hybrid categories only: overrides the form's "no certification" dropdown option text — defaults to apparel-flavored wording ("fire-resistant / non-flammable material"), which doesn't fit e.g. a stock fuel tank. */
  materialOnlyLabel?: string;
  /** Hybrid categories only: overrides the form's "certified" dropdown option text. */
  certifiedLabel?: string;
  /** Hybrid categories only: overrides the reference view's plain-material description sentence. */
  materialOnlyDescription?: string;
  hint: string;
  /** Link to this category's own section/page on the Frog Racing website (frogracing.us/tech/...) — shown as a small clickable logo, leftmost of the four (web, Frog Racing video, YouTube video, cart). */
  webUrl?: string;
  /** Hover title / accessible label for webUrl. */
  webTitle?: string;
  /** Link to a Frog Racing channel YouTube video explaining this category (e.g. SFI vs FIA ratings) — shown as a small clickable logo, third from the left (after web, before the non-Frog-Racing video). */
  frogVideoUrl?: string;
  /** Hover title / accessible label for frogVideoUrl. */
  frogVideoTitle?: string;
  /** Link to a non-Frog-Racing YouTube video (a third-party explainer) for this category — shown with the plain YouTube logo, rightmost of the two video slots. */
  youtubeVideoUrl?: string;
  /** Hover title / accessible label for youtubeVideoUrl. */
  youtubeVideoTitle?: string;
  /** Link to a Frog Racing Store product page for this category — same small-logo treatment as the video links. */
  productUrl?: string;
  /** Hover title / accessible label for productUrl. */
  productTitle?: string;
}

export const CATEGORY_META: Record<EquipmentCategory, CategoryMeta> = {
  // Driver safety gear
  helmet: {
    label: "Helmet",
    group: "driver",
    hybrid: false,
    hint: "Standard printed on the certification sticker inside the helmet.",
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.z6fq1ip4r155",
    webTitle: "Helmets — Frog Racing",
    youtubeVideoUrl: "https://youtu.be/7I-4aoiB6NU",
    youtubeVideoTitle: "Racing Helmet Buying Guide — Demon Tweeks",
    productUrl: "https://rally.build/collections/safety-equipment",
    productTitle: "Shop Helmets — Rally Build",
  },
  balaclava: {
    label: "Balaclava",
    group: "driver",
    hybrid: true,
    hint: "Often required for open-cockpit/open-wheel cars, or conditional if the driver has facial hair. Some bodies accept plain fire-resistant material; others require SFI or FIA certification.",
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.dlxliywclmq8",
    webTitle: "Balaclava — Frog Racing",
    frogVideoUrl: "https://youtu.be/AyHJl86mfNI",
    frogVideoTitle: "SFI vs. FIA Ratings Explained — Frog Racing",
    youtubeVideoUrl: "https://youtu.be/BwbCeYkPGY0",
    youtubeVideoTitle: "Walero Temp Regulating Racewear Review — HMS Motorsport",
  },
  hnr: {
    label: "Head & Neck Restraint (HANS/HNR)",
    group: "driver",
    hybrid: false,
    hint: "Standard printed on the device's conformance label. A rigid HANS-style device, distinct from a padded neck collar — see the separate Neck Collar category.",
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.nhm52e9cgi3c",
    webTitle: "Head & Neck Restraint (HANS) — Frog Racing",
    frogVideoUrl: "https://youtu.be/SOMf03LizOA",
    frogVideoTitle: "HANS Device Explained — FIA Safety Week",
    productUrl: "https://rally.build/collections/safety-equipment",
    productTitle: "Shop HANS Devices — Rally Build",
  },
  neck_collar: {
    label: "Neck Collar",
    group: "driver",
    hybrid: false,
    hint: "A padded fabric/foam collar worn around the neck — distinct from a HANS-style head & neck restraint device. Standard printed on the collar's certification label, where the body requires one.",
    // The safety-gear page doesn't have its own "Neck Collar" heading — it's covered alongside HANS
    // devices under the combined head & neck restraint section, so that's the closest section link.
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.nhm52e9cgi3c",
    webTitle: "Head & Neck Restraint — Frog Racing",
  },
  firesuit: {
    label: "Firesuit / Driving Suit",
    group: "driver",
    hybrid: true,
    hint: "Standard printed on the suit's homologation label — most bodies require a certified suit, but a few accept plain fire-resistant clothing at lower tiers.",
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.nw94q4z5fz2n",
    webTitle: "Firesuits — Frog Racing",
    frogVideoUrl: "https://youtu.be/AyHJl86mfNI",
    frogVideoTitle: "SFI vs. FIA Ratings Explained — Frog Racing",
    youtubeVideoUrl: "https://youtu.be/BR7oSWs7lMw",
    youtubeVideoTitle: "Driving Suit Guide | How to Choose a Race Suit — Summit Racing",
    productUrl: "https://rally.build/collections/safety-equipment",
    productTitle: "Shop Firesuits — Rally Build",
  },
  gloves: {
    label: "Gloves",
    group: "driver",
    hybrid: true,
    hint: "Some bodies accept plain fire-resistant material; others require SFI or FIA certification.",
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.1czw04elcuib",
    webTitle: "Gloves — Frog Racing",
    frogVideoUrl: "https://youtu.be/AyHJl86mfNI",
    frogVideoTitle: "SFI vs. FIA Ratings Explained — Frog Racing",
    youtubeVideoUrl: "https://youtu.be/XXSRplNwdXI",
    youtubeVideoTitle: "Driving Gloves Explained — Team O'Neil",
    productUrl: "https://rally.build/collections/safety-equipment",
    productTitle: "Shop Gloves — Rally Build",
  },
  shoes: {
    label: "Shoes",
    group: "driver",
    hybrid: true,
    hint: "Some bodies accept plain fire-resistant/non-flammable material; others require SFI or FIA certification.",
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.ijgnu1r3hlu9",
    webTitle: "Shoes — Frog Racing",
    frogVideoUrl: "https://youtu.be/AyHJl86mfNI",
    frogVideoTitle: "SFI vs. FIA Ratings Explained — Frog Racing",
    youtubeVideoUrl: "https://youtu.be/jSZ3xca4TrU",
    youtubeVideoTitle: "Rally Driver Explains Driving Shoes — Team O'Neil",
  },
  socks: {
    label: "Socks",
    group: "driver",
    hybrid: true,
    hint: "Some bodies accept plain fire-resistant/non-flammable material or don't address socks at all; others require SFI or FIA certification.",
    // No dedicated "Socks" heading on the safety-gear page — closest fit is its general "Other
    // safety equipment" section.
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.eiqvgprzq1ho",
    webTitle: "Other Safety Equipment — Frog Racing",
    frogVideoUrl: "https://youtu.be/AyHJl86mfNI",
    frogVideoTitle: "SFI vs. FIA Ratings Explained — Frog Racing",
    productUrl: "https://rally.build/collections/safety-equipment",
    productTitle: "Shop Socks — Rally Build",
  },
  undergarment: {
    label: "Fire-resistant Undergarment",
    group: "driver",
    hybrid: true,
    hint: "Optional/conditional for most bodies — depends on your suit's rating.",
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.8vowb1wpi2ap",
    webTitle: "Undergarments — Frog Racing",
    frogVideoUrl: "https://youtu.be/AyHJl86mfNI",
    frogVideoTitle: "SFI vs. FIA Ratings Explained — Frog Racing",
    youtubeVideoUrl: "https://youtu.be/BwbCeYkPGY0",
    youtubeVideoTitle: "Walero Temp Regulating Racewear Review — HMS Motorsport",
  },
  arm_restraint: {
    label: "Arm Restraint",
    group: "driver",
    hybrid: true,
    hint: "Typically required for open cars, cars without roll-up windows, or as an alternative to a window net.",
    webUrl: "https://www.frogracing.us/tech/safety-gear#h.t7gci3rt2g1i",
    webTitle: "Arm Restraints — Frog Racing",
    frogVideoUrl: "https://youtu.be/hicMMPx9aPk",
    frogVideoTitle: "Arm Restraints in a Stage Rally Car — Frog Racing",
  },

  // Car safety gear
  seat: {
    label: "Seat",
    group: "car",
    hybrid: true,
    materialOnlyLabel: "Stock/OEM seat (no certification)",
    certifiedLabel: "Certified racing seat (SFI or FIA rated)",
    materialOnlyDescription: "Stock/OEM seat accepted, no certification required.",
    hint: "Many bodies allow a stock/OEM seat, especially for non-caged cars — a certified racing seat is typically only mandated once a roll cage or higher competition tier is involved. Standard printed on the seat's certification label — FIA/SFI-rated seats expire, check the date. Also confirm separately whether this body allows seat sliders/rails, or requires a fixed mount.",
    webUrl: "https://www.frogracing.us/tech/seat-installation",
    webTitle: "Seat Installation — Frog Racing",
    frogVideoUrl: "https://youtu.be/O8sN53rURiI",
    frogVideoTitle: "Racing Seats Explained — FIA Safety Week",
    productUrl: "https://rally.build/collections/safety-equipment",
    productTitle: "Shop Racing Seats — Rally Build",
  },
  belts_harness: {
    label: "Belts / Harnesses",
    group: "car",
    hybrid: true,
    materialOnlyLabel: "Stock/OEM belts (no certification)",
    certifiedLabel: "Certified harness (SFI or FIA rated)",
    materialOnlyDescription: "Stock/OEM seatbelts accepted, no certification required.",
    hint: "Standard printed on the harness's certification label — most bodies require a certified harness at higher levels; some allow stock OEM belts for entry-level classes. Harnesses expire — check the date on the label.",
    webUrl: "https://www.frogracing.us/tech/harness-installation",
    webTitle: "Harness Installation — Frog Racing",
    frogVideoUrl: "https://youtu.be/I2CKH-Pt0yk",
    frogVideoTitle: "Shoulder Belts Safety Considerations — Frog Racing",
    youtubeVideoUrl: "https://youtu.be/xM0hm8V_puE",
    youtubeVideoTitle: "15 Minutes Can Save Your Life — Simpson Performance Products",
    productUrl: "https://rally.build/collections/safety-equipment",
    productTitle: "Shop Harnesses — Rally Build",
  },
  window_net: {
    label: "Window Net",
    group: "car",
    hybrid: true,
    hint: "Often interchangeable with an arm restraint — some bodies let you run one or the other, not both. Some accept a plain net; others require SFI or FIA certification.",
    frogVideoUrl: "https://youtu.be/O8sN53rURiI",
    frogVideoTitle: "Window Nets Explained — FIA Safety Week",
  },
  fire_extinguisher: {
    label: "Fire Extinguisher",
    group: "car",
    hybrid: false,
    presenceOnly: true,
    hint: "Minimum size/rating and mounting requirements vary by body — check the notes for specifics.",
    frogVideoUrl: "https://youtu.be/QMHmXz211uI",
    frogVideoTitle: "Fire Extinguisher Mounting & Anti-Torpedo Tabs — Frog Racing",
    productUrl: "https://amzn.to/4iz90ek",
    productTitle: "Shop Car Safety Essentials — Frog Racing (Amazon)",
  },
  fire_suppression: {
    label: "Fire Suppression System",
    group: "car",
    hybrid: false,
    hint: "Standard printed on the system's certification label, where required — usually an alternative or addition to a handheld extinguisher.",
    webUrl: "https://www.frogracing.us/tech/fire-suppression",
    webTitle: "Fire Suppression — Frog Racing",
    frogVideoUrl: "https://youtu.be/lmHZVpcb1Yw",
    frogVideoTitle: "Lifeline ZERO 2000 FIA Fire Suppression Install — Frog Racing",
  },
  fuel_cell: {
    label: "Fuel Cell",
    group: "car",
    hybrid: true,
    materialOnlyLabel: "Stock/OEM fuel tank (no certification)",
    certifiedLabel: "Certified fuel cell (SFI or FIA rated)",
    materialOnlyDescription: "Stock/OEM fuel tank accepted, no certification required.",
    hint: "Standard printed on the fuel cell's certification label, where required — often only mandated for full race cars, not street-based classes.",
  },
  window_breaker: {
    label: "Window Breaker / Seatbelt Cutter",
    group: "car",
    hybrid: false,
    presenceOnly: true,
    hint: "Usually just a presence requirement — no certification standard involved.",
    productUrl: "https://amzn.to/4iz90ek",
    productTitle: "Shop Car Safety Essentials — Frog Racing (Amazon)",
  },
  kill_switch: {
    label: "Kill Switch / Battery Cutoff",
    group: "car",
    hybrid: false,
    presenceOnly: true,
    hint: "Usually a presence + labeling/accessibility requirement — no certification standard involved.",
    webUrl: "https://www.frogracing.us/tech/kill-switch",
    webTitle: "Kill Switch — Frog Racing",
    frogVideoUrl: "https://youtu.be/ByflZEtWLA0",
    frogVideoTitle: "Kill Switch Install: 4-Pole vs Cartek GT — Frog Racing",
  },
  tow_hook: {
    label: "Tow Hook",
    group: "car",
    hybrid: false,
    presenceOnly: true,
    hint: "Usually just a presence requirement, sometimes with a color-marking rule — no certification standard involved.",
    productUrl: "https://amzn.to/4iz90ek",
    productTitle: "Shop Car Safety Essentials — Frog Racing (Amazon)",
  },
  tow_rope: {
    label: "Tow Rope / Strap",
    group: "car",
    hybrid: false,
    presenceOnly: true,
    hint: "Usually just a presence requirement — no certification standard involved.",
    frogVideoUrl: "https://youtu.be/ZuHoN8IQPd0",
    frogVideoTitle: "Rally Car Safety Equipment Install & Toolbox Content — Frog Racing",
    productUrl: "https://amzn.to/4iz90ek",
    productTitle: "Shop Car Safety Essentials — Frog Racing (Amazon)",
  },
  emergency_triangle: {
    label: "Emergency Triangle",
    group: "car",
    hybrid: false,
    presenceOnly: true,
    hint: "Usually just a presence requirement — no certification standard involved.",
    frogVideoUrl: "https://youtu.be/ZuHoN8IQPd0",
    frogVideoTitle: "Rally Car Safety Equipment Install & Toolbox Content — Frog Racing",
    productUrl: "https://amzn.to/4iz90ek",
    productTitle: "Shop Car Safety Essentials — Frog Racing (Amazon)",
  },
  first_aid_kit: {
    label: "First Aid Kit",
    group: "car",
    hybrid: false,
    presenceOnly: true,
    hint: "Usually just a presence requirement — no certification standard involved.",
    youtubeVideoUrl: "https://youtu.be/DAQ4s8DZH9o",
    youtubeVideoTitle: "Stage Rally First Aid Kit — Dan Shirley",
    productUrl: "https://amzn.to/4iz90ek",
    productTitle: "Shop Car Safety Essentials — Frog Racing (Amazon)",
  },
  parachute: {
    label: "Parachute",
    group: "car",
    hybrid: false,
    presenceOnly: true,
    hint: "Drag racing only — mandatory past a body's speed threshold (e.g. NHRA requires one at 150 mph and up). No certification standard involved.",
  },

  // Rollover protection
  rollover_protection: {
    label: "Rollover Protection",
    group: "rollcage",
    hybrid: false,
    // Not cert/standard-based (no registered standards for this category) — evaluateCategory has
    // its own dedicated branch, and this flag just keeps the generic certification dropdown off
    // the form (see EquipmentForm's showCertList).
    presenceOnly: true,
    hint: "Whether a cage/roll bar is required — and what's expected of it — usually depends on your car's body style: closed roof, convertible, open with no windshield frame, or open-wheel. Rally bodies typically also check when the cage was logbooked/built.",
    webUrl: "https://www.frogracing.us/tech/rollcage",
    webTitle: "Rollcage — Frog Racing",
    frogVideoUrl: "https://youtu.be/i2VvQxYf9qM",
    frogVideoTitle: "FIA Article 253 Rally Rollcages — Design, Rules, Failures, Logbooks",
  },
};

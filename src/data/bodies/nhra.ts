import { CategoryRule, Ruleset } from "../types";

// First NHRA pass: Section 5 "E.T. Handicap Racing" (5A: Super Pro/Pro/Sportsman, 7.50 sec &
// slower) plus Section 5B "Advanced E.T." (6.00-7.49 sec) — NHRA's grassroots Summit Racing Series
// bracket-racing tier, closest to this app's existing amateur/club-racer audience. Everything
// faster (Top Sportsman/Top Dragster, Pro classes, Top Fuel/Funny Car/Pro Stock) is out of scope
// for this pass. Motorcycle classes are also out of scope per the user's request.
//
// Unlike every other ruleset in this app, NHRA gates almost every requirement by a continuous
// elapsed-time (E.T.) or top-speed threshold ("mandatory on any car running 10.99 or quicker")
// rather than a named car class. This is modeled as a small set of discrete E.T. bands using the
// existing classes/classOverrides mechanism — each band's `condition`/`notes` text spells out the
// exact sub-threshold and any body-type caveat (convertible, dune-buggy-type, open-bodied,
// induction type) that the app's structured fields can't represent directly. A driver whose actual
// E.T. sits near a band edge should always double check the precise cited threshold, not just the
// band label.
const sourceDoc = {
  title: "2026 NHRA Rulebook",
  version: "2026 Edition",
  url: "https://www.nhraracer.com/rules",
};

const s5a = { ...sourceDoc, section: "Section 5A, E.T. Handicap Racing (Super Pro/Pro/Sportsman)" };
const s5b = { ...sourceDoc, section: "Section 5B, Advanced E.T." };

// Firesuit tiers — shared across the bands where the tier is identical, so the same object (and
// citation) isn't retyped per band.
const FIRESUIT_BASELINE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote:
    "Full-length pants, short- or long-sleeved shirt, closed shoes, and socks — no shorts, tank tops, or open-toe/open-heel shoes/sandals. No SFI-rated suit required at this E.T.",
  citation: { ...s5a, section: "Section 5A, PROTECTIVE EQUIPMENT" },
  confidence: "high",
  notes: "Synthetic clothing not recommended per the rulebook, though not outright prohibited at this E.T.",
};

const FIRESUIT_MID_TIER: CategoryRule = {
  requirement: "conditional",
  condition:
    "A single-layer SFI 3.2A/1 jacket becomes mandatory (10.00-13.99 sec) only for non-OEM supercharged, non-OEM turbocharged, or nitrous-equipped cars — and only jacket+pants SFI 3.2A/5 or 3.4/5 plus SFI 3.3/5 gloves if the car lacks a full OEM or .024\"-steel firewall. Naturally aspirated cars, and OEM-supercharged/turbocharged cars with a full OEM/.024\" firewall, stay on the base clothing requirement (see below) at this E.T.",
  materialOnlyAccepted: true,
  materialNote: "Base clothing (full-length pants, sleeved shirt, closed shoes, socks) suffices unless the induction-type/firewall trigger above applies.",
  acceptedStandards: [
    { standardId: "sfi-3.2a-1", note: "Single-layer jacket, cars with a full OEM or .024\" steel firewall." },
    { standardId: "sfi-3.2a-5", note: "Jacket+pants tier, cars without a full OEM/.024\" steel firewall." },
    { standardId: "sfi-3.4-5", note: "Jacket+pants tier, alternate to SFI 3.2A/5." },
  ],
  citation: { ...s5a, section: "Section 5A, PROTECTIVE EQUIPMENT" },
  confidence: "high",
};

const FIRESUIT_FAST_TIER: CategoryRule = {
  requirement: "required",
  acceptedStandards: [
    { standardId: "sfi-3.2a-5", note: "General case, 9.99 to 7.50 sec or any vehicle exceeding 135 mph." },
    { standardId: "sfi-3.4-5", note: "Alternate to SFI 3.2A/5." },
    { standardId: "sfi-3.2a-15", note: "Front-engine open-bodied or non-OEM-firewall closed-bodied cars with nitrous/supercharger/turbocharger — jacket AND pants required at this tier." },
  ],
  citation: { ...s5a, section: "Section 5A, PROTECTIVE EQUIPMENT" },
  confidence: "high",
  notes:
    "9.99 sec and quicker (or any car exceeding 135 mph): a certified jacket is mandatory for every car — plain clothing no longer suffices, unlike the slower tiers. Section 5B (Advanced E.T., 6.00-7.49 sec) doesn't restate this section, so the same tier carries forward unchanged.",
};

const GLOVES_RULE: CategoryRule = {
  requirement: "conditional",
  condition:
    "SFI 3.3/1 gloves are mandatory for any open-bodied car running 11.99 sec or quicker (alongside arm restraints), and for the same induction-type/firewall triggers that pull in a certified firesuit at 10.00-13.99 sec (see firesuit). SFI 3.3/5 gloves are mandatory for every car at 9.99 sec or quicker (or exceeding 135 mph), and for closed-bodied non-OEM-firewall forced-induction/nitrous cars at 9.99-7.50 sec.",
  acceptedStandards: [
    { standardId: "sfi-3.3-1" },
    { standardId: "sfi-3.3-5" },
  ],
  citation: { ...s5a, section: "Section 5A, PROTECTIVE EQUIPMENT / ARM RESTRAINTS" },
  confidence: "high",
};

const SHOES_RULE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Closed shoes with socks — no open-toe/open-heel shoes or sandals — satisfies the baseline for every E.T.",
  acceptedStandards: [{ standardId: "sfi-3.3-5", note: "SFI 3.3/5 boots/shoes become mandatory only for forced-induction/nitrous cars once inside the 9.99-7.50 sec tier, or any car with an automatic transmission and no floor covering it." }],
  citation: { ...s5a, section: "Section 5A, PROTECTIVE EQUIPMENT" },
  confidence: "high",
};

const SOCKS_RULE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Socks mandatory alongside closed shoes for every E.T. — no certification standard involved.",
  citation: { ...s5a, section: "Section 5A, PROTECTIVE EQUIPMENT" },
  confidence: "high",
};

const BELTS_BASELINE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Plain seat belt mandatory in all cars. A certified SFI 16.1 restraint system isn't triggered yet at this E.T. for a typical full-bodied car (see condition for the dune-buggy exception).",
  condition: "Dune-buggy-type vehicles need an SFI 16.1 restraint system regardless of E.T. — the rule's '12.00 or slower' trigger for that body type actually covers the whole slower range, not just cars right at 12.00.",
  acceptedStandards: [{ standardId: "sfi-16.1" }],
  citation: { ...s5a, section: "Section 5A, DRIVER RESTRAINT SYSTEM" },
  confidence: "high",
};

const BELTS_CONVERTIBLE_TRIGGER: CategoryRule = {
  requirement: "conditional",
  condition:
    "SFI 16.1 restraint system (with crotch strap, updated every 2 years from date of manufacture) is mandatory for convertibles at this E.T. (13.49 sec or quicker) and for dune-buggy-type vehicles regardless of E.T. A closed-bodied, non-dune-buggy car stays on the plain-seat-belt baseline until 11.49 sec.",
  materialOnlyAccepted: true,
  materialNote: "Plain seat belt suffices for a closed-bodied, non-dune-buggy car at this E.T.",
  acceptedStandards: [{ standardId: "sfi-16.1", validityYearsFromLabel: 2 }],
  citation: { ...s5a, section: "Section 5A, DRIVER RESTRAINT SYSTEM" },
  confidence: "high",
};

const BELTS_REQUIRED: CategoryRule = {
  requirement: "required",
  acceptedStandards: [{ standardId: "sfi-16.1", validityYearsFromLabel: 2 }],
  citation: { ...s5a, section: "Section 5A, DRIVER RESTRAINT SYSTEM" },
  confidence: "high",
  notes: "SFI 16.1 restraint system (crotch strap included) mandatory at 11.49 sec or quicker — this band is entirely at or below that threshold. Must be updated at 2-year intervals from date of manufacture.",
};

// NHRA's baseline device here is a padded fabric/foam SFI 3.3 neck collar — a distinct product
// from a rigid HANS-style head-and-neck restraint, modeled as its own neck_collar category. NHRA
// explicitly permits a head-and-neck restraint device/system in lieu of the collar, so the two are
// modeled as bidirectional alternatives via satisfiedByAlternative — either one, currently valid,
// satisfies the requirement.
const NECK_COLLAR_RULE: CategoryRule = {
  requirement: "required",
  condition: "Mandatory at 9.99 sec or quicker, or any car exceeding 135 mph. A head and neck restraint device/system may be used instead — see Head & Neck Restraint (HANS/HNR).",
  acceptedStandards: [{ standardId: "sfi-3.3-collar" }],
  satisfiedByAlternative: "hnr",
  citation: { ...s5a, section: "Section 5A, NECK COLLAR" },
  confidence: "high",
  notes: "If a head-and-neck restraint system is used instead of the collar, an SFI 3.3 head sock or skirted helmet is also required — not separately modeled in this app.",
};

const HNR_RULE: CategoryRule = {
  requirement: "required",
  condition: "May be used in lieu of an SFI 3.3 neck collar, mandatory at 9.99 sec or quicker or any car exceeding 135 mph — see Neck Collar.",
  acceptedStandards: [
    { standardId: "fia-8858-2002" },
    { standardId: "fia-8858-2010" },
    { standardId: "sfi-38.1" },
  ],
  satisfiedByAlternative: "neck_collar",
  citation: { ...s5a, section: "Section 5A, NECK COLLAR" },
  confidence: "high",
  notes: "Not itself independently mandated — NHRA's actual baseline requirement is the SFI 3.3 neck collar (see that category); this device is an accepted substitute for it, paired with an SFI 3.3 head sock or skirted helmet.",
};

const WINDOW_NET_999: CategoryRule = {
  requirement: "required",
  condition: "Ribbon-type or SFI 27.1 mesh-type window net mandatory on any full-bodied car at 9.99-7.50 sec, or any car exceeding 135 mph.",
  acceptedStandards: [{ standardId: "sfi-27.1", validityYearsFromLabel: 2 }],
  citation: { ...s5a, section: "Section 5A, WINDOW NET" },
  confidence: "high",
};

const WINDOW_NET_ADVANCED: CategoryRule = {
  requirement: "required",
  acceptedStandards: [{ standardId: "sfi-27.1", validityYearsFromLabel: 2 }],
  citation: { ...s5b, section: "Section 5B, WINDOW NET" },
  confidence: "high",
  notes: "SFI 27.1 ribbon- or mesh-type window net mandatory on any full-bodied car in this E.T. range, unconditionally — must be updated at 2-year intervals from date of manufacture.",
};

const KILL_SWITCH_RULE: CategoryRule = {
  requirement: "conditional",
  condition: "Only triggers if the battery is relocated into the trunk area — most cars at this E.T. don't need a master cutoff yet (the 9.99-or-quicker / 135mph+ trigger doesn't apply here).",
  citation: { ...s5a, section: "Section 5A, MASTER CUTOFF" },
  confidence: "high",
};

const KILL_SWITCH_REQUIRED: CategoryRule = {
  requirement: "required",
  citation: { ...s5a, section: "Section 5A, MASTER CUTOFF" },
  confidence: "high",
  notes: "Mandatory on any car with a battery at 9.99 sec or quicker, any car exceeding 135 mph, or any car with the battery relocated to the trunk area — this band is entirely at or below the E.T. threshold.",
};

const PARACHUTE_CONDITIONAL: CategoryRule = {
  requirement: "conditional",
  condition: "Mandatory only if the car runs 150 mph or faster — uncommon in this E.T. bracket but possible for a very light/aerodynamic car. Check your recorded trap speed, not just your E.T.",
  citation: { ...s5a, section: "Section 5A, FRAME (PARACHUTE)" },
  confidence: "high",
};

const PARACHUTE_REQUIRED: CategoryRule = {
  requirement: "required",
  citation: { ...s5b, section: "Section 5B, FRAME (PARACHUTE)" },
  confidence: "high",
  notes: "Unconditionally mandatory for every car in the Advanced E.T. bracket (6.00-7.49 sec) — no speed threshold stated, unlike the slower Section 5A tiers.",
};

const HELMET_BASE: CategoryRule = {
  requirement: "required",
  acceptedStandards: [
    { standardId: "snell-m2015", noExpiration: true },
    { standardId: "snell-m2020d", noExpiration: true },
    { standardId: "snell-m2020r", noExpiration: true },
    { standardId: "snell-m2025d", noExpiration: true },
    { standardId: "snell-m2025r", noExpiration: true },
    { standardId: "snell-sa2015", noExpiration: true },
    { standardId: "snell-sa2020", noExpiration: true },
    { standardId: "snell-sa2025", noExpiration: true },
    { standardId: "sfi-31.1-2015", noExpiration: true },
    { standardId: "sfi-31.1-2020", noExpiration: true },
    { standardId: "fia-8860-2010", noExpiration: true },
    { standardId: "fia-8859-2015", noExpiration: true },
    { standardId: "fia-8859-2024", noExpiration: true },
    { standardId: "fia-8860-2018", noExpiration: true },
  ],
  fullFaceRequirement: "conditional",
  fullFaceCondition:
    "Open-face permitted for 10.00-13.99 sec closed-bodied cars (with or without shield). Full-face + shield mandatory for all 10.00-and-slower dune-buggy-type vehicles and all 10.00-13.99 open-bodied cars (goggles prohibited) regardless of E.T. within that range.",
  citation: { ...s5a, section: "Section 5A, HELMET" },
  confidence: "high",
};

const NECK_COLLAR_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...s5a, section: "Section 5A, NECK COLLAR" },
  confidence: "high",
  notes: "Only becomes mandatory at 9.99 sec or quicker (or 135 mph+) — not addressed at this E.T.",
};

const HNR_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...s5a, section: "Section 5A, NECK COLLAR" },
  confidence: "high",
  notes: "Only relevant once the neck-collar requirement itself applies, at 9.99 sec or quicker (or 135 mph+).",
};

const BALACLAVA_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...s5a, section: "Section 5A, NECK COLLAR" },
  confidence: "high",
  notes: "The head-sock trigger only exists once the neck-collar/HNR choice itself applies, at 9.99 sec or quicker (or 135 mph+) — not in play at this E.T.",
};

const BALACLAVA_TRIGGER: CategoryRule = {
  requirement: "conditional",
  condition:
    "Required only if you satisfy the neck-collar requirement with a head-and-neck restraint (HANS-style) device instead of a plain SFI 3.3 collar. A 'skirted' helmet satisfies this instead of a separate head sock. Not required if you're using the plain collar.",
  balaclavaRequiredIfHnrUsed: true,
  citation: { ...s5a, section: "Section 5A, NECK COLLAR" },
  confidence: "high",
  notes: "Rule text: \"If SFI Spec 3.3 neck collar is required and driver opts to use head and neck restraint system instead, then SFI Spec 3.3 head sock or skirted helmet mandatory.\"",
};

const HELMET_FULLFACE: CategoryRule = {
  requirement: "required",
  acceptedStandards: HELMET_BASE.acceptedStandards,
  fullFaceRequirement: "required",
  fullFaceCondition: "Shield is mandatory (not just permitted) for open-bodied cars at this E.T.; permitted but not mandatory for closed-bodied cars. Goggles prohibited either way.",
  citation: { ...s5a, section: "Section 5A, HELMET" },
  confidence: "high",
  notes: "Full-face helmet mandatory for every car at 9.99 sec or quicker, regardless of body style or induction type.",
};

const nhraSportsmanET: Ruleset = {
  id: "nhra-sportsman-et",
  bodyId: "nhra",
  bodyName: "NHRA (National Hot Rod Association)",
  disciplineName: "Drag Racing — Sportsman E.T. Classes",
  disciplineGroup: "Drag Racing",
  lastReviewed: "2026-08-25",
  sourceDocuments: [s5a, s5b],
  classes: [
    { id: "et-1400-1999", label: "14.00–19.99 sec (Sportsman range)" },
    { id: "et-1200-1399", label: "12.00–13.99 sec (Pro range)" },
    { id: "et-1000-1199", label: "10.00–11.99 sec (Super Pro range)" },
    { id: "et-750-999", label: "7.50–9.99 sec (quickest Sportsman bracket)" },
    { id: "advanced-et-600-749", label: "6.00–7.49 sec (Advanced E.T. / Section 5B)" },
  ],
  categories: {
    helmet: HELMET_BASE,
    balaclava: {
      requirement: "conditional",
      condition:
        "Only comes into play at 9.99 sec or quicker (or 135 mph+), and even then only if you satisfy the neck-collar requirement with a head-and-neck restraint (HANS-style) device instead of a plain SFI 3.3 collar — a rigid HANS bar doesn't cover the same neck gap the fabric collar does. A 'skirted' helmet satisfies this instead of a separate head sock. Select the 7.50-9.99 or Advanced E.T. band to see this resolve against your actual gear.",
      balaclavaRequiredIfHnrUsed: true,
      citation: { ...s5a, section: "Section 5A, NECK COLLAR" },
      confidence: "high",
      notes: "Rule text: \"If SFI Spec 3.3 neck collar is required and driver opts to use head and neck restraint system instead, then SFI Spec 3.3 head sock or skirted helmet mandatory.\"",
    },
    hnr: {
      requirement: "conditional",
      condition: "May be used in lieu of an SFI 3.3 neck collar, but only relevant once that becomes mandatory at 9.99 sec or quicker (or 135 mph+) — see the 7.50-9.99 and Advanced E.T. bands. Using this instead of the plain collar also triggers a balaclava (head sock) requirement — see that category.",
      citation: { ...s5a, section: "Section 5A, NECK COLLAR" },
      confidence: "high",
    },
    neck_collar: {
      requirement: "conditional",
      condition: "Only becomes mandatory at 9.99 sec or quicker (or 135 mph+) — see the 7.50-9.99 and Advanced E.T. bands. A head and neck restraint device/system may be used instead — see Head & Neck Restraint (HANS/HNR).",
      citation: { ...s5a, section: "Section 5A, NECK COLLAR" },
      confidence: "high",
    },
    firesuit: FIRESUIT_BASELINE,
    gloves: GLOVES_RULE,
    shoes: SHOES_RULE,
    socks: SOCKS_RULE,
    undergarment: {
      requirement: "not_addressed",
      citation: { ...s5a },
      confidence: "high",
      notes: "No fire-resistant undergarment requirement or recommendation anywhere in Section 5A/5B, at any E.T.",
    },
    arm_restraint: {
      requirement: "conditional",
      condition: "Mandatory in open-bodied cars at 11.99 sec or quicker, and for dune-buggy-type vehicles regardless of E.T. (alongside a jacket and SFI 3.3/1 gloves).",
      citation: { ...s5a, section: "Section 5A, ARM RESTRAINTS" },
      confidence: "high",
    },

    // Car safety gear
    seat: {
      requirement: "conditional",
      condition: "No certification standard is cited — only a construction/material clause applies.",
      materialOnlyAccepted: true,
      materialNote: "Properly braced, framed, and supported seat of aluminum, fiberglass, carbon fiber, or double-layer poly (including automotive accessory seats) — no SFI/FIA seat certification is mandated at any E.T. in this section.",
      citation: { ...s5a, section: "Section 5A, INTERIOR (SEATS)" },
      confidence: "high",
    },
    belts_harness: BELTS_BASELINE,
    window_net: {
      requirement: "not_addressed",
      citation: { ...s5a, section: "Section 5A, WINDOW NET" },
      confidence: "high",
      notes: "Window net only becomes mandatory at 9.99 sec or quicker — see the 7.50-9.99 and Advanced E.T. bands.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...s5a, section: "Section 5A, FUEL SYSTEM" },
      confidence: "medium",
      notes: "No SFI/FIA fuel-cell certification is mandated at this level — the rulebook only regulates fuel-tank/filler-neck venting and a bulkhead when tank/battery/lines are located in the trunk, not the tank/cell's own construction standard.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...s5a, section: "Section 5A, SUPPORT GROUP" },
      confidence: "medium",
      notes: "No handheld fire-extinguisher mandate found in the Section 5A/5B text reviewed — only a fire-extinguisher SYSTEM is addressed, and only as 'permitted,' not required (see fire_suppression).",
    },
    fire_suppression: {
      requirement: "recommended",
      citation: { ...s5a, section: "Section 5A, SUPPORT GROUP (FIRE-EXTINGUISHER SYSTEM)" },
      confidence: "high",
      notes: "Rule text: 'Permitted; must be securely mounted.' No certification standard or mandate stated.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...s5a },
      confidence: "medium",
      notes: "Not mentioned in the Section 5A/5B text reviewed.",
    },
    kill_switch: KILL_SWITCH_RULE,
    tow_hook: {
      requirement: "not_addressed",
      citation: { ...s5a, section: "Section 5A, SUPPORT GROUP (PUSH BAR)" },
      confidence: "medium",
      notes: "The rulebook addresses a push-bar interface for the track's own push vehicle, not a driver-carried tow hook/point.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...s5a },
      confidence: "medium",
      notes: "Not mentioned in the Section 5A/5B text reviewed — drag strips push-start or retrieve cars via the return road, not a driver-carried tow rope.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...s5a },
      confidence: "medium",
      notes: "Not mentioned in the Section 5A/5B text reviewed.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...s5a },
      confidence: "medium",
      notes: "Not mentioned in the Section 5A/5B text reviewed — track-provided safety crew/medical is standard at NHRA events rather than a per-car first aid kit mandate.",
    },
    parachute: PARACHUTE_CONDITIONAL,

    rollover_protection: {
      requirement: "not_addressed",
      condition:
        "Dune-buggy-type vehicles need a roll bar regardless of E.T. (see the band-specific rule for other body types once a class is selected).",
      citation: { ...s5a, section: "Section 5A, FRAME (ROLL BAR / ROLL CAGE)" },
      confidence: "high",
      notes: "A full picture requires picking an E.T. band — the roll bar/cage/padding thresholds are entirely E.T.-driven in this section.",
    },
  },
  classOverrides: {
    "et-1400-1999": {
      belts_harness: BELTS_BASELINE,
      firesuit: FIRESUIT_BASELINE,
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      balaclava: BALACLAVA_NOT_YET,
      parachute: PARACHUTE_CONDITIONAL,
      rollover_protection: {
        requirement: "conditional",
        condition:
          "No general roll bar/cage mandate at this E.T. for a typical full-bodied car. Dune-buggy-type vehicles need a roll bar regardless of E.T. (§Section 5A, ROLL BAR: '...in all dune-buggy-type vehicles running 12.00 (*7.50) seconds and slower'). Convertibles aren't yet triggered (that starts at 13.49 sec — see the 12.00-13.99 band).",
        citation: { ...s5a, section: "Section 5A, FRAME (ROLL BAR)" },
        confidence: "high",
      },
    },
    "et-1200-1399": {
      belts_harness: BELTS_CONVERTIBLE_TRIGGER,
      firesuit: FIRESUIT_MID_TIER,
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      balaclava: BALACLAVA_NOT_YET,
      parachute: PARACHUTE_CONDITIONAL,
      rollover_protection: {
        requirement: "conditional",
        rolloverProtectionByBodyStyle: { convertible: "required", closed_roof: "not_addressed", open_wheel: "not_addressed", open_no_windshield: "conditional" },
        condition:
          "Convertibles need a roll bar throughout this E.T. range (mandatory 11.00-13.49 sec). Dune-buggy-type vehicles need one regardless of E.T. A closed-roof, non-convertible, non-dune-buggy car has no roll bar/cage mandate yet at this E.T. — that starts at 11.49 sec (see the 10.00-11.99 band). 'Open, no windshield' is mapped here loosely as a stand-in for dune-buggy/altered-type bodies, which this app doesn't model as its own body style — verify against your actual construction.",
        citation: { ...s5a, section: "Section 5A, FRAME (ROLL BAR)" },
        confidence: "medium",
      },
    },
    "et-1000-1199": {
      belts_harness: BELTS_REQUIRED,
      firesuit: FIRESUIT_MID_TIER,
      gloves: GLOVES_RULE,
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      balaclava: BALACLAVA_NOT_YET,
      parachute: PARACHUTE_CONDITIONAL,
      rollover_protection: {
        requirement: "conditional",
        rolloverProtectionRequiresFullCage: false,
        condition:
          "Roll bar mandatory for ALL cars at 11.00-11.49 sec. Roll cage (full multi-point) mandatory at 10.99 sec or quicker — within this band that's essentially 10.00-10.99 sec, EXCEPT a full-bodied car with an unaltered firewall/floor/body (wheel tubs permitted) running 10.00-10.99 sec may use a roll bar in place of a full cage. Convertibles at 10.99 sec or quicker need a full cage outright, no roll-bar exception. Cars in the 11.50-11.99 sec sliver of this band have no general mandate unless a convertible or dune-buggy-type vehicle (see the 12.00-13.99 band's carveouts, which still apply here).",
        citation: { ...s5a, section: "Section 5A, FRAME (ROLL BAR / ROLL CAGE)" },
        confidence: "high",
        notes: "Padding isn't mandated yet in this band — SFI 45.1 roll-cage padding only becomes mandatory at 9.99 sec or quicker (see the 7.50-9.99 band).",
      },
    },
    "et-750-999": {
      helmet: HELMET_FULLFACE,
      hnr: HNR_RULE,
      neck_collar: NECK_COLLAR_RULE,
      balaclava: BALACLAVA_TRIGGER,
      firesuit: FIRESUIT_FAST_TIER,
      gloves: GLOVES_RULE,
      belts_harness: BELTS_REQUIRED,
      window_net: WINDOW_NET_999,
      kill_switch: KILL_SWITCH_REQUIRED,
      parachute: PARACHUTE_CONDITIONAL,
      rollover_protection: {
        requirement: "required",
        rolloverProtectionRequiresFullCage: true,
        rolloverProtectionRequiresPadding: true,
        rolloverProtectionPaddingCertRequired: true,
        condition: "This entire band (7.50-9.99 sec) is at or past the 10.99-sec roll-cage and 9.99-sec padding thresholds — full multi-point cage and SFI 45.1 padding are both unconditionally mandatory here, not just conditionally.",
        citation: { ...s5a, section: "Section 5A, FRAME (ROLL CAGE / ROLL-CAGE PADDING)" },
        confidence: "high",
        notes:
          "SFI 45.1 padding required anywhere the driver's helmet may come in contact with roll-cage components. No welded-joint or welded-plate requirement is separately stated in the text reviewed (beyond whatever the general SFI cage-construction standards themselves require) — not modeled as a hard gate here.",
      },
    },
    "advanced-et-600-749": {
      helmet: HELMET_FULLFACE,
      hnr: HNR_RULE,
      neck_collar: NECK_COLLAR_RULE,
      balaclava: BALACLAVA_TRIGGER,
      firesuit: FIRESUIT_FAST_TIER,
      gloves: GLOVES_RULE,
      belts_harness: BELTS_REQUIRED,
      window_net: WINDOW_NET_ADVANCED,
      kill_switch: KILL_SWITCH_REQUIRED,
      parachute: PARACHUTE_REQUIRED,
      rollover_protection: {
        requirement: "required",
        rolloverProtectionRequiresFullCage: true,
        rolloverProtectionRequiresPadding: true,
        rolloverProtectionPaddingCertRequired: true,
        condition:
          "On top of the SFI 45.1 padding and full-cage requirements carried over from Section 5A, Section 5B additionally requires the cage itself to carry a specific SFI certification by vehicle type: full-bodied cars need SFI 25.1, 25.2, or 25.3; Funny Cars and open-bodied altereds need SFI 10.1 or 10.2; front-engine dragsters need SFI 2.2 or 2.4; rear-engine dragsters need SFI 2.1 or 2.5. This app doesn't yet capture a named cage-certification number (only tube dimensions) — confirm your cage's specific SFI cert against your vehicle type at tech.",
        citation: { ...s5b, section: "Section 5B, FRAME (ROLL CAGE / ROLL-CAGE PADDING)" },
        confidence: "high",
      },
    },
  },
};

export const nhraRulesets: Ruleset[] = [nhraSportsmanET];

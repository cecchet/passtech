import { CategoryRule, Ruleset } from "../types";

// IHRA (International Hot Rod Association) — third drag-racing body in this pass, after NHRA and
// WDRA. Structurally very close to WDRA (same "SN, SA, M, or K-2015" helmet phrasing, same 150mph
// quarter / 125mph eighth parachute threshold, same neck-collar-or-HNR substitution rule, same
// SFI 16.1/16.5 driver restraint, same four-ET-band shape) — modeled the same way: the "Sportsman
// Safety and General Guidelines" chapter's four E.T. bands become classes/classOverrides. Teen
// Championship Racing, Junior Dragster, Special Vehicles, Street Legal Vehicles, motorcycles, and
// the Outlaw Nitro Series are out of scope for this pass, matching the NHRA/WDRA scoping.
const sourceDoc = {
  title: "IHRA Rulebook",
  version: "Published 3/30/2026",
  url: "https://www.ihra.com/racing/rules",
};

const sSportsman = { ...sourceDoc, section: "Sportsman Safety and General Guidelines" };
const sGeneral = { ...sourceDoc, section: "General Regulations - All Classes" };

// Like WDRA, IHRA's rulebook consistently lists helmet certifications as "Snell SN, SA, M, or K" —
// SA/M/K are real Snell categories with SFI cross-specs given in the rulebook itself (31.1/31.2 for
// SA, 41.1/41.2 for M), but "SN" doesn't correspond to any known Snell or SFI designation.
const HELMET_STANDARDS = [
  { standardId: "snell-sa2015", noExpiration: true },
  { standardId: "snell-sa2020", noExpiration: true },
  { standardId: "snell-sa2025", noExpiration: true },
  { standardId: "snell-m2015", noExpiration: true },
  { standardId: "snell-m2020d", noExpiration: true },
  { standardId: "snell-m2020r", noExpiration: true },
  { standardId: "snell-m2025d", noExpiration: true },
  { standardId: "snell-m2025r", noExpiration: true },
  { standardId: "snell-k2015", noExpiration: true },
  { standardId: "snell-k2020", noExpiration: true },
  { standardId: "snell-k2025", noExpiration: true },
  { standardId: "sfi-31.1-2015", noExpiration: true },
  { standardId: "sfi-31.1-2020", noExpiration: true },
];

const HELMET_NOTE =
  "The rulebook lists helmet certifications as 'Snell SN, SA, M, or K' — SA/M/K are real Snell auto-racing/motorcycle/karting categories (with SFI 31.1/31.2/41.1/41.2 cross-specs given elsewhere in the rulebook: \"SFI Spec 31.1= SNELL SA, open face helmet Spec 31.2 = SNELL SA full face helmet SFI Spec 41.1 = SNELL M, open face helmet SFI Spec 41.2 = SNELL M Full face helmet\"), but the 'SN' designation doesn't correspond to any known Snell or SFI spec. Modeled here with the real SA/M/K standards; confirm with IHRA tech if your helmet is only marked 'SN'.";

const HELMET_BASE: CategoryRule = {
  requirement: "required",
  acceptedStandards: HELMET_STANDARDS,
  fullFaceRequirement: "conditional",
  fullFaceCondition: "Open-bodied entries must use a full-face helmet regardless of E.T.; closed-bodied cars may use open-face.",
  citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, HELMET" },
  confidence: "high",
  notes: HELMET_NOTE,
};

const NECK_COLLAR_BASE: CategoryRule = {
  requirement: "conditional",
  condition: "Only becomes mandatory within the quickest E.T. band (at 9.00 sec quarter mile / 6.00 sec eighth mile or quicker). Select that band to see this resolve against your actual gear. A head and neck restraint device/system may be used instead — see Head & Neck Restraint (HANS/HNR).",
  citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
  confidence: "high",
};

const NECK_COLLAR_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
  confidence: "high",
  notes: "Only becomes mandatory within the quickest E.T. band (9.00 sec quarter mile / 6.00 sec eighth mile or quicker) — not addressed at this E.T.",
};

const HNR_BASE: CategoryRule = {
  requirement: "conditional",
  condition: "May be used in lieu of the neck collar (\"In all classes that mandate the use of a neck collar, a Head and Neck Restraint System may be used with or without the neck collar\"), but only relevant once that becomes mandatory — at 9.00 sec quarter mile / 6.00 sec eighth mile or quicker. Select that band to see this resolve against your actual gear.",
  citation: { ...sGeneral, section: "General Regulations - All Classes, PROTECTIVE CLOTHING" },
  confidence: "high",
};

const HNR_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sGeneral, section: "General Regulations - All Classes, PROTECTIVE CLOTHING" },
  confidence: "high",
  notes: "Only relevant once the neck-collar requirement itself applies (9.00 sec quarter mile / 6.00 sec eighth mile or quicker) — not in play at this E.T.",
};

const PARACHUTE_RULE: CategoryRule = {
  requirement: "conditional",
  condition: "Required at 150 mph or faster (quarter mile) or 125 mph or faster (eighth mile) — a speed threshold, not an E.T. threshold, so this applies the same way regardless of which E.T. band your car falls in.",
  citation: { ...sGeneral, section: "General Regulations - All Classes, PARACHUTE" },
  confidence: "high",
  notes: "200 mph (quarter mile) vehicles need dual parachutes with one release handle, each with its own independent mounting bracket (not shared with the shoulder-harness mount).",
};

const SEAT_RULE: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sGeneral },
  confidence: "medium",
  notes: "No seat construction, bracing, or certification requirement was found in the chapters reviewed — General Regulations addresses seat belts, harness mounting, and roll cage/bar construction in detail, but not the seat itself.",
};

const SHOES_RULE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Closed-toe shoes with socks satisfies the baseline for every E.T. where SFI-rated shoes/boots aren't otherwise mandated. General clothing rule: \"In any class where SFI pants are not required, short pants, tank tops, and nylon, or flannel pants are prohibited... All clothing worn by competitors in all classes must be free of holes and excessive wear.\"",
  citation: { ...sGeneral, section: "General Regulations - All Classes, PROTECTIVE CLOTHING" },
  confidence: "medium",
};

const SOCKS_RULE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Socks alongside closed shoes satisfies the baseline for every E.T. — no certification standard involved.",
  citation: { ...sGeneral, section: "General Regulations - All Classes, PROTECTIVE CLOTHING" },
  confidence: "medium",
};

const FIRESUIT_BASELINE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote:
    "No shorts, tank tops, bare torso/legs, or nylon/flannel pants — full-length pants and a shirt satisfy the baseline where no specific SFI jacket requirement applies at this E.T. No SFI-rated jacket required at this E.T.",
  citation: { ...sGeneral, section: "General Regulations - All Classes, PROTECTIVE CLOTHING" },
  confidence: "medium",
};

const BALACLAVA_RULE: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sGeneral, section: "General Regulations - All Classes, PROTECTIVE CLOTHING" },
  confidence: "medium",
  notes:
    "A 'head sock' (balaclava) is listed among items a class MAY require to be SFI-tagged (\"See Class Requirements for type of protective clothing required for a class, such as an SFI jacket, pants, gloves, boots, shoes, head sock, or arm restraints. All above must be SFI tagged\"), but unlike NHRA, IHRA's rulebook doesn't state an explicit trigger condition (e.g. required specifically when using a head-and-neck restraint device instead of the neck collar) for the Sportsman E.T. bands covered here — so no specific requirement is modeled without one.",
};

const ihraSportsmanET: Ruleset = {
  id: "ihra-sportsman-et",
  bodyId: "ihra",
  bodyName: "IHRA (International Hot Rod Association)",
  disciplineName: "Drag Racing — Sportsman E.T. Classes",
  disciplineGroup: "Drag Racing",
  lastReviewed: "2026-08-25",
  sourceDocuments: [sSportsman, sGeneral],
  classes: [
    { id: "et-a", label: "9.99 sec & quicker Q. (6.49 sec & quicker E.)" },
    { id: "et-b", label: "10.00–11.49 sec Q. (6.50–7.49 sec E.)" },
    { id: "et-c", label: "11.50–13.99 sec Q. (7.50–8.59 sec E.)" },
    { id: "et-d", label: "14.00 sec & slower Q. (8.60 sec & slower E.)" },
  ],
  categories: {
    helmet: HELMET_BASE,
    balaclava: BALACLAVA_RULE,
    hnr: HNR_BASE,
    neck_collar: NECK_COLLAR_BASE,
    firesuit: FIRESUIT_BASELINE,
    gloves: {
      requirement: "not_addressed",
      citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
      confidence: "high",
      notes: "Mandatory on open-bodied cars in every band, and on all cars at a fast enough sub-threshold in the two quickest bands — see those bands.",
    },
    shoes: SHOES_RULE,
    socks: SOCKS_RULE,
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sGeneral },
      confidence: "high",
      notes: "No fire-resistant undergarment requirement or recommendation found in the chapters reviewed.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sGeneral, section: "General Regulations - All Classes, PROTECTIVE CLOTHING" },
      confidence: "high",
      notes: "Mandatory on all open-bodied cars regardless of E.T. (\"Drivers in all open-bodied cars must wear SFI spec 3.3 gloves and arm restraints\") — see any band for a closed-bodied car's E.T.-specific picture.",
    },
    seat: SEAT_RULE,
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "\"All cars not required by Class Requirements to use an SFI driver restraint system must be equipped with an accepted quick re-lease-type driver seat belt.\" A certified SFI 16.1/16.5 system is only mandated once a roll bar/cage is required for your car, or at a specific E.T. — see the two quickest E.T. bands.",
      citation: { ...sGeneral, section: "General Regulations - All Classes, SEAT BELTS (DRIVER RESTRAINT SYSTEMS)" },
      confidence: "medium",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...sGeneral, section: "General Regulations - All Classes, WINDOW NET" },
      confidence: "high",
      notes: "Tied to whether a roll cage (not just a roll bar) is required for your car: \"If class mandates a roll cage the entry must have an SFI 27.1 safety net properly attached.\" See the rollover-protection rule for your E.T. band to determine whether a cage applies to you.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...sGeneral, section: "General Regulations - All Classes, FUEL SYSTEM" },
      confidence: "medium",
      notes: "No SFI/FIA fuel-cell certification is mandated — the rulebook only regulates fuel-tank/filler-neck venting and mounting height, and notes a fuel cell is \"recommended\" (not required).",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, FIRE SYSTEM / FIRE EXTINGUISHERS" },
      confidence: "high",
      notes: "Mandatory (or a full fire SYSTEM mandatory) in the quickest E.T. band only, for closed-body entries — see that band. \"Recommended,\" not required, on closed-body cars in the second-quickest band. No UL rating is specified in the text reviewed, so this app falls back to a simple presence check where required.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, FIRE SYSTEM" },
      confidence: "high",
      notes: "A dedicated fire system (one nozzle to the driver's compartment near the feet, one to the engine) is only mandated in the quickest E.T. band for closed-body cars, front-engine dragsters, and open-bodied supercharged/turbocharged (gas/methanol) cars — see that band.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sGeneral },
      confidence: "medium",
      notes: "Not mentioned in the chapters reviewed.",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...sGeneral },
      confidence: "medium",
      notes: "The official ihra.com rules page and rulebook PDFs returned a Cloudflare access-denied response and could not be fetched directly; checked instead against a third-party-hosted mirror of the 2024 IHRA Rulebook (one year older than this ruleset's cited 2026 edition). That copy's class-specific HOOD entries only cross-reference \"See General Regulations,\" but General Regulations itself has no HOOD entry (alphabetically it jumps straight from HARMONIC BALANCERS to IGNITION) — an apparent gap in the rulebook's own cross-reference. A full-text search of that mirror found no \"hood pin,\" \"hood fastener,\" \"hood latch,\" or \"positive latch\" requirement anywhere. Confirm directly with IHRA tech given the unverified current-edition source.",
    },
    spill_kit: {
      requirement: "conditional",
      condition: "Mandatory (an Engine Containment System — diaper or belly pan — with a non-flammable absorbent pad) only for supercharged/nitrous-assisted vehicles running 5.00 sec (eighth mile) / 7.99 sec (quarter mile) or quicker. Not required for naturally-aspirated cars or slower forced-induction/nitrous cars.",
      citation: { ...sGeneral, section: "General Regulations - All Classes, ENGINE CONTAINMENT SYSTEM" },
      confidence: "medium",
      notes: "The official ihra.com rules page and rulebook PDFs returned a Cloudflare access-denied response and could not be fetched directly; checked instead against a third-party-hosted mirror of the 2024 IHRA Rulebook (one year older than this ruleset's cited 2026 edition). That copy's General Regulations separately require a coolant catch-can (min. 1 pint) for every car regardless of E.T. band — but that's a fixed container plumbed to the cooling system, not a portable kit of absorbent material, so it's treated as a related-but-distinct requirement rather than satisfying this category (consistent with how this app treats similar catch-tank/catch-can rules elsewhere, e.g. SCCA GCR's coolant catch tank). The actual match for a portable absorbent spill kit is the mandatory non-flammable absorbent pad in the Engine Containment System required of quicker supercharged/nitrous cars. Confirm directly with IHRA tech given the unverified current-edition source.",
    },
    kill_switch: {
      requirement: "conditional",
      condition: "Mandatory if the battery is relocated or a class specifically requires it (\"Mandatory if the battery is relocated or is specified by class requirements\"). Unconditionally mandatory in the quickest E.T. band regardless of battery location — see that band.",
      citation: { ...sGeneral, section: "General Regulations - All Classes, MASTER CUTOFF" },
      confidence: "high",
    },
    tow_hook: {
      requirement: "conditional",
      towHookSidesRequired: "front",
      condition: "Only mandatory for entries competing in National or SSNC (Summit SuperSeries National Championship) events — not a blanket requirement for every Sportsman entry at a member track.",
      citation: { ...sGeneral, section: "General Regulations - All Classes, TOW HOOK" },
      confidence: "high",
      notes: "Rule text: \"All vehicles competing in National or SSNC events must incorporate a device on the front of the chassis that will facilitate ease in hookup for towing entry from the racing surface. It is recommended that all receiver pins be 1/2\" in diameter.\" This is a fixed tow point built into the car, not a loose rope/strap the driver carries — see tow_rope for that distinction.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sGeneral },
      confidence: "medium",
      notes: "Not mentioned in the chapters reviewed — the TOW HOOK rule addresses a fixed towing point on the car, not a loose rope/strap carried by the driver.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sGeneral },
      confidence: "medium",
      notes: "Not mentioned in the chapters reviewed.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sGeneral },
      confidence: "medium",
      notes: "Not mentioned in the chapters reviewed.",
    },
    parachute: PARACHUTE_RULE,

    rollover_protection: {
      requirement: "not_addressed",
      citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines (ROLL CAGE / ROLL BAR)" },
      confidence: "high",
      notes: "A full picture requires picking an E.T. band — the roll bar/cage/padding thresholds are entirely E.T.- and body-style-driven in this chapter.",
    },
  },
  classOverrides: {
    "et-a": {
      hnr: {
        requirement: "conditional",
        condition: "May be used in lieu of the SFI 3.3 neck collar once that becomes mandatory (9.00 sec quarter mile / 6.00 sec eighth mile or quicker) — see Neck Collar.",
        acceptedStandards: [
          { standardId: "fia-8858-2002" },
          { standardId: "fia-8858-2010" },
          {
            standardId: "sfi-38.1",
            validityYearsFromLabel: 3,
            note: "⚠️ IHRA's own SFI Specifications appendix lists Spec 38.1 (Head and Neck Restraint System) at a 3-year recertification interval — shorter than the 5-year interval most other bodies in this app cite for the same spec. Possibly a document error, but this app models what IHRA's own rulebook states; confirm with IHRA tech if your device's label is between 3 and 5 years old.",
          },
        ],
        satisfiedByAlternative: "neck_collar",
        citation: { ...sGeneral, section: "General Regulations - All Classes, SFI Specifications" },
        confidence: "high",
      },
      neck_collar: {
        requirement: "conditional",
        condition: "Mandatory (alongside SFI 3.2A-5 jacket and pants) at 9.00 sec quarter mile or 6.00 sec eighth mile or quicker — the fast sub-range within this band. A head and neck restraint device/system may be used instead — see Head & Neck Restraint (HANS/HNR).",
        acceptedStandards: [{ standardId: "sfi-3.3-collar" }],
        satisfiedByAlternative: "hnr",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
        confidence: "high",
      },
      gloves: {
        requirement: "conditional",
        condition: "SFI 3.3/1 gloves mandatory at 8.49 sec quarter mile or 5.49 sec eighth mile or quicker (any body style), and mandatory on all open-bodied cars regardless of E.T. within this band (alongside arm restraints).",
        acceptedStandards: [{ standardId: "sfi-3.3-1" }],
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
        confidence: "high",
      },
      arm_restraint: {
        requirement: "conditional",
        condition: "Mandatory on all open-bodied vehicles in this band (alongside SFI 3.3/1 gloves), regardless of the specific E.T. within it.",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
        confidence: "high",
      },
      firesuit: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-3.2a-5", note: "Jacket-only tier, this band's baseline (\"A 3.2 A-5 jacket is mandatory in all other configurations\")." }],
        condition: "Escalates to jacket AND pants (still SFI 3.2A-5) once at 9.00 sec quarter mile or 6.00 sec eighth mile or quicker.",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
        confidence: "high",
      },
      belts_harness: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-16.1", validityYearsFromLabel: 2 }, { standardId: "sfi-16.5", validityYearsFromLabel: 2 }],
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, DRIVER RESTRAINT SYSTEM" },
        confidence: "high",
        notes: "Must be updated at 2-year intervals from date of manufacture.",
      },
      window_net: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-27.1" }],
        citation: { ...sGeneral, section: "General Regulations - All Classes, WINDOW NET" },
        confidence: "high",
        notes: "A roll cage is unconditionally required throughout this band (roll bar permitted instead only for an unaltered full-bodied car at 6.40 sec eighth mile or slower), which triggers the window-net requirement per the general rule.",
      },
      fire_extinguisher: {
        requirement: "conditional",
        condition: "Mandatory on closed-body entries that DON'T already trigger the dedicated fire SYSTEM requirement below (i.e. naturally aspirated closed-body cars, and closed-body cars slower than 7.49 sec quarter mile / 4.49 sec eighth mile).",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, FIRE SYSTEM" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "conditional",
        condition: "Mandatory (one nozzle in the driver's compartment in front of the feet, one on the engine, with red-flagged safety pins) for closed-body cars, front-engine dragsters, and open-bodied supercharged/turbocharged (gas/methanol) vehicles at 7.49 sec quarter mile or 4.49 sec eighth mile or quicker.",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, FIRE SYSTEM" },
        confidence: "high",
      },
      kill_switch: {
        requirement: "required",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, MASTER CUTOFF" },
        confidence: "high",
        notes: "Unconditionally mandatory throughout this band, unlike the slower bands (where it's only triggered by a relocated battery or specific class rule).",
      },
      rollover_protection: {
        requirement: "required",
        rolloverProtectionRequiresFullCage: true,
        rolloverProtectionRequiresPadding: true,
        condition:
          "A full multi-point cage is required throughout this band, EXCEPT a full-bodied car with an unaltered floor/firewall running 6.40 sec eighth mile or slower (the slow end of this band) may use a roll bar instead. A current SFI chassis certification is mandatory at 9.99 sec quarter mile / 6.50 sec eighth mile or quicker (essentially all of this band).",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, ROLL CAGE" },
        confidence: "high",
        notes: "Roll bar/cage padding is mandatory (minimum 1/4\" compression) throughout this band. Unlike NHRA and WDRA, this app did NOT find an explicit E.T.-gated escalation to certified SFI 45.1 padding within the Sportsman chapter reviewed — SFI 45.1 IS a real, recognized IHRA spec (listed in the SFI Specifications appendix as \"Roll Cage Padding\"), just not tied to a specific E.T. threshold in the text covered here. Confirm with IHRA tech whether certified padding is expected at this E.T.",
      },
    },
    "et-b": {
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      firesuit: {
        requirement: "required",
        acceptedStandards: [
          { standardId: "sfi-3.2a-1", note: "Closed-body entries." },
          { standardId: "sfi-3.2a-5", note: "Open-bodied entries." },
        ],
        condition: "Closed-body cars need only SFI 3.2A-1 (single layer); open-bodied cars need the heavier SFI 3.2A-5.",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
        confidence: "high",
      },
      gloves: {
        requirement: "conditional",
        condition: "SFI 3.3/1 gloves mandatory on open-bodied vehicles only (alongside arm restraints).",
        acceptedStandards: [{ standardId: "sfi-3.3-1" }],
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
        confidence: "high",
      },
      arm_restraint: {
        requirement: "conditional",
        condition: "Mandatory on open-bodied vehicles only.",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, PROTECTIVE CLOTHING" },
        confidence: "high",
      },
      belts_harness: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-16.1", validityYearsFromLabel: 2 }, { standardId: "sfi-16.5", validityYearsFromLabel: 2 }],
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, DRIVER RESTRAINT SYSTEM" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "recommended",
        condition: "Recommended (not required) on closed-body entries.",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, FIRE EXTINGUISHERS" },
        confidence: "high",
      },
      kill_switch: {
        requirement: "conditional",
        condition: "Only triggers if the battery is relocated or a class specifically requires it — see General Regulations, MASTER CUTOFF.",
        citation: { ...sGeneral, section: "General Regulations - All Classes, MASTER CUTOFF" },
        confidence: "high",
      },
      window_net: {
        requirement: "conditional",
        condition: "Required only if a roll cage (not just a roll bar) applies to your car — see the rollover-protection rule below. Most cars in this band only need a roll bar.",
        acceptedStandards: [{ standardId: "sfi-27.1" }],
        citation: { ...sGeneral, section: "General Regulations - All Classes, WINDOW NET" },
        confidence: "high",
      },
      rollover_protection: {
        requirement: "conditional",
        rolloverProtectionRequiresPadding: true,
        condition:
          "A roll BAR is mandatory for every car in this band (10.00-11.49 sec quarter / 6.50-7.35 sec eighth). A full CAGE is required instead only if the floor/firewall has been altered, or the car exceeds 135 mph. Convertibles (T-tops included) additionally need a roll bar across 11.00-13.49 sec quarter / 7.00-8.25 sec eighth — already covered by the general bar mandate in this band. Dune-buggy-type vehicles need a roll bar at 12.00 sec quarter mile and slower / 7.50 sec eighth mile — covered by the top of this band and the next one. Roll bar/cage padding (minimum 1/4\" compression) is mandatory.",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, ROLL CAGE/ROLL BAR" },
        confidence: "high",
      },
    },
    "et-c": {
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      window_net: {
        requirement: "not_addressed",
        citation: { ...sGeneral, section: "General Regulations - All Classes, WINDOW NET" },
        confidence: "high",
        notes: "No roll cage is mandated for most cars in this band (only convertibles need a roll bar, and only 135mph+ cars need a full cage) — window net only triggers if a cage actually applies to you.",
      },
      rollover_protection: {
        requirement: "conditional",
        rolloverProtectionByBodyStyle: { convertible: "required", closed_roof: "not_addressed", open_wheel: "not_addressed", open_no_windshield: "not_addressed" },
        condition:
          "No general roll bar/cage mandate for a typical closed-roof car in this band. A full cage is mandatory for any car exceeding 135 mph. Convertibles need a 6-point roll bar at 11.00-13.49 sec quarter mile or 8.25 sec eighth mile or quicker — essentially this entire band. Dragsters are prohibited from this band entirely.",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, ROLL BAR/ROLL CAGE" },
        confidence: "high",
      },
    },
    "et-d": {
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      helmet: {
        requirement: "conditional",
        acceptedStandards: HELMET_STANDARDS,
        condition: "Only recommended, not required, in this band — EXCEPT mandatory on any entry with a roll bar or roll cage installed.",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, HELMET" },
        confidence: "high",
        notes: HELMET_NOTE,
      },
      rollover_protection: {
        requirement: "not_addressed",
        citation: { ...sSportsman, section: "Sportsman Safety and General Guidelines, ROLL BAR" },
        confidence: "high",
        notes: "No roll bar/cage is mandated at this E.T. (\"Roll Bar: Recommended\") — dragsters and altereds are prohibited from this band entirely, so the open-bodied cage scenarios don't arise here. A voluntarily installed roll bar must still meet the general padding/construction rules (General Regulations - All Classes, ROLL BARS) and, per the HELMET rule above, triggers a mandatory helmet.",
      },
    },
  },
};

export const ihraRulesets: Ruleset[] = [ihraSportsmanET];

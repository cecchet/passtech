import { CategoryRule, EquipmentCategory, Ruleset, SourceDocument } from "../types";

// Formula Drift publishes three separate documents that between them cover the three
// competition tiers' safety equipment: PRO and PROSPEC each have their own full "Technical
// Regulations" PDF (of which only a few sections are safety-equipment-relevant to this app),
// while PRO/AM (the developmental/regional-affiliate tier) has a dedicated, safety-only
// "PRO/AM Safety Regulations" PDF. All three are "2026 Version 1.1" per their own title pages,
// linked from https://www.formulad.com/rulebook as retrieved 2026-09-02.
const proDoc: SourceDocument = { title: "Formula Drift PRO Technical Regulations", version: "2026 Version 1.1", url: "https://www.formulad.com/rulebook" };
const prospecDoc: SourceDocument = { title: "Formula Drift PROSPEC Technical Regulations", version: "2026 Version 1.1", url: "https://www.formulad.com/rulebook" };
const proamDoc: SourceDocument = { title: "Formula Drift PRO/AM Safety Regulations", version: "2026 Version 1.1", url: "https://www.formulad.com/rulebook" };

/** Section numbers for the categories that read word-for-word identically between PRO and PROSPEC (only the numbering differs, since PROSPEC's document has one fewer preceding chapter). */
interface TierSections {
  helmet: string;
  suit: string;
  seats: string;
  belts: string;
  arm: string;
  hnr: string;
  fireSuppression: string;
  rollCage: string;
  fuelCell: string;
  masterCutoff: string;
  windows: string;
  hoodPins: string;
  tow: string;
}

const proSections: TierSections = {
  helmet: "8.1",
  suit: "8.2",
  seats: "8.4",
  belts: "8.5",
  arm: "8.6",
  hnr: "8.7",
  fireSuppression: "8.8",
  rollCage: "2.2",
  fuelCell: "4.5",
  masterCutoff: "6.2",
  windows: "7.5",
  hoodPins: "7.8",
  tow: "7.10",
};

const prospecSections: TierSections = {
  helmet: "7.1",
  suit: "7.2",
  seats: "7.4",
  belts: "7.5",
  arm: "7.6",
  hnr: "7.7",
  fireSuppression: "7.8",
  rollCage: "2.2",
  fuelCell: "4.3",
  masterCutoff: "5.2",
  windows: "6.5",
  hoodPins: "6.8",
  tow: "6.10",
};

// "SFI spec 3.3/5 or greater" excludes the /1 tier (below /5) that GENERIC_APPAREL_STANDARDS
// would otherwise include, so the accepted tiers are listed explicitly rather than reused.
const glovesShoesSocksStandards = [{ standardId: "sfi-3.3-5" }, { standardId: "sfi-3.3-10" }, { standardId: "sfi-3.3-20" }, { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018" }];

/**
 * Categories confirmed word-for-word (or functionally) identical across all three tiers' own
 * documents: helmet, balaclava trigger, driving suit + gloves/shoes/socks + undergarment, arm
 * restraints, seat belts, head-and-neck restraint, roll cage (PRO 2.2.1-2.2.9 vs PRO/AM
 * 3.1.1-3.1.8 read side-by-side, general/padding/welding/material/mounting-plate/main-hoop/cage-
 * configuration/rear-hoop-support/side-protection sub-sections all match), fuel cell, hood pins,
 * tow hooks, and the categories this app tracks that none of the three documents address at all.
 * Seats, master cutoff (kill switch), fire suppression triggering, and window/window-net text
 * have real PRO/AM deltas and are NOT included here — each tier builds those separately.
 */
function sharedCategories(doc: SourceDocument, s: TierSections): Partial<Record<EquipmentCategory, CategoryRule>> {
  return {
    helmet: {
      requirement: "required",
      acceptedStandards: [{ standardId: "snell-sa2020" }, { standardId: "sfi-31.2a" }, { standardId: "fia-8860-2010" }, { standardId: "fia-8859-2015" }, { standardId: "fia-8860-2018" }],
      fullFaceRequirement: "required",
      citation: { ...doc, section: s.helmet },
      confidence: "high",
      notes:
        "Rule text: 'Only helmets certified to meet the following standards are permitted: 1. Snell Memorial Foundation – SA2020 2. SFI Foundation – Spec 31.2A 3. FIA 8860-2010, 8859-2015, 8860-2018. Full-faced helmets are required.' Visors must be closed and chin straps fastened while on course. No modifications/attachments (e.g. cameras) are permitted unless approved in the original homologation.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required (as a fire-resistant balaclava or helmet skirt) only for drivers with facial hair that would break the helmet's seal; otherwise not required beyond keeping hair fully covered by fire-resistant material under the helmet.",
      materialOnlyAccepted: true,
      citation: { ...doc, section: s.helmet },
      confidence: "high",
      notes: "Rule text: 'Hair protruding from beneath a driver's helmet must be completely covered by fire-resistant material. Drivers with facial hair must wear face shields of fire-resistant material (i.e. balaclava or helmet skirt).' No certification standard is cited for the balaclava itself.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [{ standardId: "sfi-3.2a-5" }, { standardId: "sfi-3.2a-10" }, { standardId: "sfi-3.2a-15" }, { standardId: "sfi-3.2a-20" }, { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018" }],
      citation: { ...doc, section: s.suit },
      confidence: "high",
      notes:
        "Rule text: 'One-piece driving suits are required and must be made of fire-resistant material and certified to SFI spec 3.2/A/5 or greater, or homologated to FIA 8856-2000, 8856-2018 specs, which effectively covers the body, including neck, ankles and wrists. Multi-layer driving suits are recommended.' \"Or greater\" excludes SFI 3.2A/1 and 3.2A/3. One-piece is explicitly required.",
    },
    gloves: {
      requirement: "required",
      acceptedStandards: glovesShoesSocksStandards,
      citation: { ...doc, section: s.suit },
      confidence: "high",
      notes: "Rule text: 'Gloves, shoes, and socks are required and must be fire-resistant material and certified to SFI spec 3.3/5 or greater, or FIA 8856-2000, 8856-2018 specs.' Articles must be free of holes/tears/openings except those made by the manufacturer.",
    },
    shoes: {
      requirement: "required",
      acceptedStandards: glovesShoesSocksStandards,
      citation: { ...doc, section: s.suit },
      confidence: "high",
      notes: "Same 'SFI spec 3.3/5 or greater, or FIA 8856-2000, 8856-2018' requirement as gloves — see that category's notes for the full rule text.",
    },
    socks: {
      requirement: "required",
      acceptedStandards: glovesShoesSocksStandards,
      citation: { ...doc, section: s.suit },
      confidence: "high",
      notes: "Same 'SFI spec 3.3/5 or greater, or FIA 8856-2000, 8856-2018' requirement as gloves — see that category's notes for the full rule text.",
    },
    undergarment: {
      requirement: "recommended",
      materialOnlyAccepted: true,
      materialNote: "Rule text: 'Fire-resistant underwear is recommended.' Not required, and no specific certification standard is cited.",
      citation: { ...doc, section: s.suit },
      confidence: "high",
    },
    neck_collar: {
      requirement: "not_addressed",
      citation: { ...doc },
      confidence: "high",
      notes: "Not addressed as its own item — neck protection is covered via the head-and-neck restraint requirement (see hnr), with no separate padded-collar option offered.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [{ standardId: "sfi-38.1" }, { standardId: "fia-8858-2002" }, { standardId: "fia-8858-2010" }],
      citation: { ...doc, section: s.hnr },
      confidence: "high",
      notes:
        "Rule text: 'A Head and neck restraint certified in accordance with SFI 38.1, FIA 8858-2002 or 8858-2010 are required at all times on track during practice and competition.' SFI 38.1 devices need recertification every 5 years from the label date; FIA 8858 devices don't require recertification but the tether's printed dating year must be under 5 years old.",
    },
    arm_restraint: {
      requirement: "conditional",
      condition: "Optional alternative to a window net/Lexan panel across both front window openings on a closed car; mandatory for convertible vehicles.",
      materialOnlyAccepted: true,
      satisfiedByAlternative: "window_net",
      citation: { ...doc, section: s.arm },
      confidence: "high",
      notes: "Rule text: 'Competitors may choose to use arm restraints on both arms in lieu of windows or a window net. Competitors with convertible vehicles must use arm restraints.' No certification standard is cited for the restraint itself. Arm restraints built into the racing suit are acceptable in the manufacturer's designed position.",
    },
    belts_harness: {
      requirement: "required",
      acceptedStandards: [{ standardId: "sfi-16.1" }, { standardId: "sfi-16.5" }, { standardId: "fia-8853-98" }],
      citation: { ...doc, section: s.belts },
      confidence: "high",
      notes:
        "Rule text: 'All occupants ... must utilize either a five-point, or six-point, restraint harness ... a two or three in lap belt, three-inch shoulder straps or two-inch shoulder straps when used with an approved SFI 38.1 Head and Neck Restraint, and a single or double sub strap with a minimum two-inch webbing.' SFI 16.1/16.5 or FIA 8853/98 only. \"Y-type\"/\"H-type\" and sternum straps are not allowed; extremely detailed mounting-angle geometry is specified. Occupants of convertible vehicles must use arm restraints.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition: "Required only for vehicles with a relocated fuel tank; a factory tank kept in its factory location/mounting/sheet metal is fully accepted with no cell needed.",
      materialOnlyAccepted: true,
      acceptedStandards: [{ standardId: "sfi-28.1" }],
      materialNote:
        "Rule text: 'Safety fuel cells shall consist of a bladder enclosed in a metal container. Safety fuel cell support structures must be welded to the vehicle. Bolt on support structures are prohibited. ... Fuel cells meeting SFI 28.1 are recommended.' Also required: a permanently mounted steel/aluminum firewall bulkhead sealing the cell from the driver's compartment, a flapper valve to prevent rollover spillage, and pressurized refueling is prohibited. No fuel lines may be routed through the driver's compartment.",
      citation: { ...doc, section: s.fuelCell },
      confidence: "high",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionRequiresWelded: true,
      rolloverProtectionRequiresWeldedPlates: true,
      rolloverProtectionRequiresPadding: true,
      rolloverProtectionPaddingCertRequired: true,
      rolloverProtectionTubingSpec: [{ minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.095 }], materialNote: "Seamless SAE 1020/1025 mild steel, DOM, and/or chromoly — ERW tubing is not permitted." }],
      citation: { ...doc, section: s.rollCage },
      confidence: "high",
      notes:
        "8-point chassis/unibody attachment, no bolt-in cages, padding must meet SFI 45.1 or FIA 8857-2001 anywhere the driver's helmet may contact the cage (and along the base of the driver's side A-pillar bar/box). Welding must conform to AWS D1.1:2002; mounting plates/boxes must be fully welded, at least .08\" steel, 2\"-12\" per side, max 100 sq in. Main hoop is a single continuous-tube piece, max 4 bends totaling 180°±10°, with a diagonal or horizontal brace. Side Hoop / Front Hoop / Halo / Forward Hoops are the allowed cage configurations. Rear hoop shall have two rear braces at ≥30° included angle. Minimum two door bars (parallel or 'X') across each front door opening. Vehicles over 3500 lbs with driver require Competition Director approval.",
    },
    hood_pins: {
      requirement: "required",
      citation: { ...doc, section: s.hoodPins },
      confidence: "high",
      notes: "Rule text: 'Two hood pins, equally spaced across the front of hood and are required within 24-inches of the leading edge of the hood. The original stock latch must be removed.'",
    },
    tow_hook: {
      requirement: "required",
      towHookSidesRequired: "both",
      citation: { ...doc, section: s.tow },
      confidence: "high",
      notes:
        "Rule text: 'Must be equipped front and rear as follows: Load Rating of not less than the gross vehicle weight. Minimum internal hole diameter of 2 inches. If made of a metal it must not protrude more than 3in from a blunt surface. Colored in a contrasting color to the surrounding body work.' If not clearly visible, must be marked with the word \"TOW\" or a contrasting-color arrow.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...doc },
      confidence: "high",
      notes: "Not offered as an alternative — every vehicle must have the on-board fire suppression system described under fire_suppression; a handheld extinguisher isn't mentioned as an option in place of it.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...doc },
      confidence: "high",
      notes: "Not mentioned in the safety-equipment sections reviewed.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...doc },
      confidence: "high",
      notes: "Not mentioned in the safety-equipment sections reviewed.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...doc },
      confidence: "high",
      notes: "Not mentioned in the safety-equipment sections reviewed — Formula Drift is a closed-course event series, not an on-road discipline.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...doc },
      confidence: "high",
      notes: "Not mentioned in the safety-equipment sections reviewed.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...doc, section: s.tow },
      confidence: "high",
      notes: "The towing-apparatus requirement is a fixed, car-mounted front-and-rear attachment point (see tow_hook) — no separate loose/carried tow rope or strap is required.",
    },
    parachute: {
      requirement: "not_addressed",
      citation: { ...doc },
      confidence: "high",
      notes: "Not applicable to this discipline; not mentioned in the rulebook.",
    },
  };
}

const proAndProspecKnownGap =
  "The rulebook requires BOTH required seats (driver and passenger) to be individually FIA-homologated (8855-1999/8862-2009/8855-2021) with a 5-year usable life from the manufacture date on the seat label, and the driver's seat has been 'Halo style' (side-impact head protection) since 2015. This app only tracks a single driver-side seat entry — verify the passenger seat separately.";

const pro: Ruleset = {
  id: "formulad-pro",
  bodyId: "formulad",
  bodyName: "Formula Drift",
  disciplineName: "PRO",
  disciplineGroup: "Drifting",
  lastReviewed: "2026-09-02",
  sourceDocuments: [{ ...proDoc, section: "Driver's Safety Equipment / Roll Cage / Fuel System / Master Cutoff / Body Exterior and Interior" }],
  categories: {
    ...sharedCategories(proDoc, proSections),
    seat: {
      requirement: "required",
      acceptedStandards: [{ standardId: "fia-8855-1999" }, { standardId: "fia-8862-2009" }, { standardId: "fia-8855-2021" }],
      citation: { ...proDoc, section: proSections.seats },
      confidence: "high",
      notes:
        "Rule text: 'All vehicles must have at least two seats, one for the driver, and one for a passenger. ... Each of the two required seats must be homologated to FIA standard 8855-1999, 8862-2009, 8855-2021. As of 2015 the driver's seat must be \"Halo style\" for side impact head protection. The usable life of an FIA homologated seat is 5 years from the date of manufacture indicated on the seat label.'",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...proDoc, section: proSections.masterCutoff },
      confidence: "high",
      notes:
        "Rule text: 'As of 2025, The master electric cutoff switch must be: RED E-stop style switch must be located on the driver's side A-pillar and be easily accessible. Push off type - push in to disconnect circuit. Honeywell part number- 87941 ... Labeled with the decal.' Must shut off all engine and electrical functions, and be reachable by the driver when seated normally, belted, with the steering wheel in place.",
    },
    fire_suppression: {
      requirement: "required",
      fireSuppressionRequiresCurrentService: true,
      acceptedStandards: [{ standardId: "fia-technical-list-16" }, { standardId: "sfi-17.1" }],
      citation: { ...proDoc, section: proSections.fireSuppression },
      confidence: "high",
      notes:
        "Rule text: 'All vehicles must have an on-board fire extinguishing system. All fire systems shall be serviced and recertified every two years ... Only fire extinguisher systems specifically approved by the FIA on Technical List No.16, or those meeting SFI spec 17.1 will be permitted.' As of 2025 (§8.8.1), when a system expires it must be replaced with one that is pull-cable actuated, minimum 10 lbs with 4 nozzles. Primary activation is a RED pull T-handle on the driver's side A-pillar (§8.8.2). Nozzle placement (§8.8.3): one under the dashboard into the footwell, two in the engine bay, one over the fuel cell. Safety pins must be removed while in staging, grid, and on course.",
    },
    window_net: {
      requirement: "required",
      satisfiedByAlternative: "arm_restraint",
      materialOnlyAccepted: true,
      materialNote: "A piece of Lexan/polycarbonate across both front window openings satisfies this in place of an actual net.",
      citation: { ...proDoc, section: proSections.windows },
      confidence: "high",
      notes: "Rule text: 'Door windows shall have a window net, or a piece of Lexan/polycarbonate in place of both front window openings whenever the vehicle is on-track.' Competitors may use arm restraints instead; convertible occupants must use arm restraints.",
    },
  },
  knownGaps: [proAndProspecKnownGap],
};

const prospec: Ruleset = {
  id: "formulad-prospec",
  bodyId: "formulad",
  bodyName: "Formula Drift",
  disciplineName: "PROSPEC",
  disciplineGroup: "Drifting",
  lastReviewed: "2026-09-02",
  sourceDocuments: [{ ...prospecDoc, section: "Driver's Safety Equipment / Roll Cage / Fuel System / Master Cutoff / Windows and Window Restraints" }],
  categories: {
    ...sharedCategories(prospecDoc, prospecSections),
    seat: {
      requirement: "required",
      acceptedStandards: [{ standardId: "fia-8855-1999" }, { standardId: "fia-8862-2009" }, { standardId: "fia-8855-2021" }],
      citation: { ...prospecDoc, section: prospecSections.seats },
      confidence: "high",
      notes:
        "PROSPEC's Driver's Safety Equipment section (7.1-7.8) reads near-word-for-word identical to PRO's section 8, including this seats rule: two required seats, each homologated to FIA 8855-1999/8862-2009/8855-2021, driver's seat 'Halo style' as of 2015, 5-year usable life from the manufacture date on the seat label.",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...prospecDoc, section: prospecSections.masterCutoff },
      confidence: "high",
      notes:
        "PROSPEC's Master Cutoff section reads identically to PRO's: as of 2025, a RED E-stop push-type switch (Honeywell part #87941) on the driver's side A-pillar, decal-labeled, reachable by the belted driver.",
    },
    fire_suppression: {
      requirement: "required",
      fireSuppressionRequiresCurrentService: true,
      acceptedStandards: [{ standardId: "fia-technical-list-16" }, { standardId: "sfi-17.1" }],
      citation: { ...prospecDoc, section: prospecSections.fireSuppression },
      confidence: "high",
      notes:
        "PROSPEC's Fire Suppression System section reads identically to PRO's: mandatory on-board system (no handheld-extinguisher alternative), FIA Technical List No.16 or SFI 17.1, 2-year recert, and (as of 2025) pull-cable actuated with a minimum 10 lb/4-nozzle spec and a RED pull T-handle on the driver's side A-pillar.",
    },
    window_net: {
      requirement: "required",
      satisfiedByAlternative: "arm_restraint",
      materialOnlyAccepted: true,
      materialNote: "A piece of Lexan/polycarbonate across both front window openings satisfies this in place of an actual net.",
      citation: { ...prospecDoc, section: prospecSections.windows },
      confidence: "high",
      notes: "PROSPEC's Windows and Window Restraints section reads identically to PRO's — window net or Lexan/polycarbonate at both front openings, or arm restraints instead; mandatory arm restraints for convertibles.",
    },
  },
  knownGaps: [proAndProspecKnownGap],
};

const proam: Ruleset = {
  id: "formulad-proam",
  bodyId: "formulad",
  bodyName: "Formula Drift",
  disciplineName: "PRO/AM",
  disciplineGroup: "Drifting",
  lastReviewed: "2026-09-02",
  sourceDocuments: [{ ...proamDoc }],
  categories: {
    ...sharedCategories(proamDoc, {
      helmet: "1.1",
      suit: "1.2",
      seats: "1.4",
      belts: "1.5",
      arm: "1.6",
      hnr: "1.7",
      fireSuppression: "1.8",
      rollCage: "3.1",
      fuelCell: "4.6",
      masterCutoff: "2.2",
      windows: "4.14",
      hoodPins: "4.16",
      tow: "4.17",
    }),
    seat: {
      requirement: "required",
      acceptedStandards: [{ standardId: "fia-8855-1999" }, { standardId: "fia-8862-2009" }, { standardId: "fia-8855-2021" }],
      citation: { ...proamDoc, section: "1.4" },
      confidence: "high",
      notes:
        "Rule text: 'Driver's seat must be homologated to FIA standard 8855-1999, 8862-2009, 8855-2021. As of 2021, FIA seats with \"Halo style\" side impact head protection will be required on the driver's side. If vehicles have two seats, the passenger seat must also be homologated to FIA standard 8855-1999.' Differs from PRO/PROSPEC: a passenger seat isn't itself mandatory here — the homologation requirement only applies to it if the car has one — and the Halo-style cutover is 2021, not 2015. Usable life is 5 years from the manufacture date on the seat label.",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...proamDoc, section: "2.2" },
      confidence: "high",
      notes:
        "Rule text: 'A master electrical cutoff switch is mandatory and must be wired to completely shut off all engine and electrical system functions ... The master electrical cutoff switch must be mounted outside the vehicle on the driver's side cowl just below the windshield ... clearly marked with the decal.' Differs from PRO/PROSPEC: mounted at the driver's side cowl below the windshield, not the A-pillar, and no specific part number is given.",
    },
    fire_suppression: {
      requirement: "required",
      fireSuppressionRequiresCurrentService: true,
      acceptedStandards: [{ standardId: "fia-technical-list-16" }, { standardId: "sfi-17.1" }],
      citation: { ...proamDoc, section: "1.8" },
      confidence: "high",
      notes:
        "Rule text: 'All vehicles must have an on-board fire extinguishing system ... Only fire extinguisher systems specifically approved by the FIA on Technical List No.16, or those meeting SFI spec 17.1 will be permitted.' Differs from PRO/PROSPEC: no fixed 10 lb/4-nozzle 2025 upgrade mandate — instead (§1.8.1) teams must use at least the minimum extinguishant amounts FIA Technical List No.16 §3 specifies for Category N/A/B vehicles' driver compartment and engine. Triggering (§1.8.4) is more flexible: any self-powered triggering system, activated by a spark-proof breaker switch or manual push/pull apparatus, located on the dashboard, center console, OR driver's side A-pillar — a second switch at the A-pillar is only required if the primary activation point isn't already there. Nozzle placement (§1.8.5) follows the system manufacturer's own spec rather than PRO's fixed footwell/engine-bay/fuel-cell locations, though nozzles into the driver compartment, fuel cell area, and engine compartment are all still described in §1.8. 2-year recert, safety pins removed while in staging/grid/on course.",
    },
    window_net: {
      requirement: "required",
      satisfiedByAlternative: "arm_restraint",
      materialOnlyAccepted: true,
      materialNote: "OEM glass or a piece of Lexan/polycarbonate across both front window openings satisfies this in place of an actual net.",
      citation: { ...proamDoc, section: "4.14" },
      confidence: "high",
      notes:
        "Rule text: 'Side windows shall have a window net, OEM glass, or a piece of Lexan/polycarbonate in place of both front window openings whenever the vehicle is on-track.' Differs from PRO/PROSPEC only in explicitly naming OEM glass as a third accepted alternative alongside net/Lexan. Competitors may use arm restraints instead; convertible occupants must use arm restraints.",
    },
  },
  knownGaps: [
    "If the car has a passenger seat, it must also be individually FIA-homologated (8855-1999) with a 5-year usable life from the manufacture date on the seat label — this app only tracks a single driver-side seat entry. Verify a passenger seat separately if your car has one.",
  ],
};

export const formuladRulesets: Ruleset[] = [pro, prospec, proam];

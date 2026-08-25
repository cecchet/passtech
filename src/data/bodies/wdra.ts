import { CategoryRule, Ruleset } from "../types";

// WDRA (World Drag Racing Alliance) — second drag-racing body in this pass, after NHRA. Modeled
// the same way: the "Elapsed Time Specific Rules" chapter gates almost every requirement by a
// continuous quarter-/eighth-mile E.T. or top-speed threshold, so it's represented as discrete E.T.
// bands via classes/classOverrides, matching the four bands WDRA's own rulebook already breaks
// its equipment rules into (rather than the separate license-tier CLASS 1-5 partition, which is
// about competition-number eligibility, not safety equipment). Junior Dragster, Teen Racing,
// electric vehicles, motorcycles, snowmobiles, ATVs, and the "Special Vehicles"
// (professional/exhibition) chapter are out of scope for this pass, matching the NHRA scoping.
const sourceDoc = {
  title: "2025 WDRA Rulebook",
  version: "Effective January 1, 2025",
  url: "https://www.racewdra.com/online-rulebook/",
};

const sEtRules = { ...sourceDoc, section: "Elapsed Time Specific Rules" };
const sGeneral = { ...sourceDoc, section: "General Technical Regulations" };

// WDRA's rulebook consistently lists helmet certifications as "Snell SN, SA, M, or K" — SA
// (auto racing), M (motorcycle), and K (karting) are real Snell categories with SFI cross-specs
// given in the rulebook itself (31.1/31.2 for SA, 41.1/41.2 for M), but "SN" doesn't correspond to
// any known Snell or SFI designation. Modeled here using the real SA/M/K standards already in this
// app's registry; the "SN" listing is flagged in notes rather than silently dropped.
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
  "The rulebook lists helmet certifications as 'Snell SN, SA, M, or K' — SA/M/K are real Snell auto-racing/motorcycle/karting categories (with SFI 31.1/31.2/41.1/41.2 cross-specs given elsewhere in the rulebook), but the 'SN' designation doesn't correspond to any known Snell or SFI spec. Modeled here with the real SA/M/K standards; confirm with WDRA tech if your helmet is only marked 'SN'.";

const HELMET_BASE: CategoryRule = {
  requirement: "required",
  acceptedStandards: HELMET_STANDARDS,
  fullFaceRequirement: "conditional",
  fullFaceCondition: "Open-bodied entries must use a full-face helmet regardless of E.T.; closed-bodied cars may use open-face.",
  citation: { ...sEtRules, section: "Elapsed Time Specific Rules, HELMET" },
  confidence: "high",
  notes: HELMET_NOTE,
};

const NECK_COLLAR_BASE: CategoryRule = {
  requirement: "conditional",
  condition: "Only becomes mandatory within the quickest E.T. band (at 9.00 sec quarter mile / 6.00 sec eighth mile or quicker). Select that band to see this resolve against your actual gear. A head and neck restraint device/system may be used instead — see Head & Neck Restraint (HANS/HNR).",
  citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
  confidence: "high",
};

const NECK_COLLAR_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
  confidence: "high",
  notes: "Only becomes mandatory within the quickest E.T. band (9.00 sec quarter mile / 6.00 sec eighth mile or quicker) — not addressed at this E.T.",
};

const HNR_BASE: CategoryRule = {
  requirement: "conditional",
  condition: "May be used in lieu of the neck collar (\"Where a neck collar is required, a Head and Neck Restraint System may be used with or without neck collar\"), but only relevant once that becomes mandatory — at 9.00 sec quarter mile / 6.00 sec eighth mile or quicker. Select that band to see this resolve against your actual gear.",
  citation: { ...sGeneral, section: "General Technical Regulations, DRIVER PROTECTIVE GEAR" },
  confidence: "high",
};

const HNR_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sGeneral, section: "General Technical Regulations, DRIVER PROTECTIVE GEAR" },
  confidence: "high",
  notes: "Only relevant once the neck-collar requirement itself applies (9.00 sec quarter mile / 6.00 sec eighth mile or quicker) — not in play at this E.T.",
};

const PARACHUTE_RULE: CategoryRule = {
  requirement: "conditional",
  condition: "Required at 150 mph or faster (quarter mile) or 125 mph or faster (eighth mile) — a speed threshold, not an E.T. threshold, so this applies the same way regardless of which E.T. band your car falls in.",
  citation: { ...sGeneral, section: "General Technical Regulations, PARACHUTE" },
  confidence: "high",
  notes: "200 mph (quarter mile) vehicles need dual parachutes with independent mounting brackets and one release handle.",
};

const SEAT_RULE: CategoryRule = {
  requirement: "conditional",
  condition: "No certification standard is cited — only a construction/bracing clause applies.",
  materialOnlyAccepted: true,
  materialNote: "Driver's seat must be constructed and secured so it won't shift in a collision. An aftermarket seat must be braced/supported (carbon fiber, aluminum, fiberglass, or double-layer plastic) and, in any car with a roll bar/cage, also braced to the rear cross bar — no SFI/FIA seat certification is mandated.",
  citation: { ...sGeneral, section: "General Technical Regulations, SEATS" },
  confidence: "high",
};

const SHOES_RULE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Closed-toe shoes with socks — no sandals or bare legs — satisfies the baseline for every E.T. under the general fallback clause (no specific requirement stated beyond full-length pants, sleeved shirt, closed shoes, and socks).",
  citation: { ...sGeneral, section: "General Technical Regulations, DRIVER PROTECTIVE GEAR" },
  confidence: "high",
};

const SOCKS_RULE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Socks mandatory alongside closed shoes for every E.T. — no certification standard involved. Nylon or flannel pants are explicitly prohibited alongside this baseline.",
  citation: { ...sGeneral, section: "General Technical Regulations, DRIVER PROTECTIVE GEAR" },
  confidence: "high",
};

const FIRESUIT_BASELINE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote:
    "Full-length pants, short- or long-sleeved shirt, closed-toe shoes, and socks — no shorts, bare legs, tank tops, sandals, or nylon/flannel pants. No SFI-rated jacket required at this E.T. (general fallback clause: \"If no specific requirement is stated then the minimum requirements are...\").",
  citation: { ...sGeneral, section: "General Technical Regulations, DRIVER PROTECTIVE GEAR" },
  confidence: "high",
};

const wdraSportsmanET: Ruleset = {
  id: "wdra-sportsman-et",
  bodyId: "wdra",
  bodyName: "WDRA (World Drag Racing Alliance)",
  disciplineName: "Drag Racing — Sportsman E.T. Classes",
  disciplineGroup: "Drag Racing",
  lastReviewed: "2026-08-25",
  sourceDocuments: [sEtRules, sGeneral],
  classes: [
    { id: "et-a", label: "9.99 sec & quicker Q. (6.49 sec & quicker E.)" },
    { id: "et-b", label: "10.00–11.49 sec Q. (6.50–7.49 sec E.)" },
    { id: "et-c", label: "11.50–13.49 sec Q. (7.50–9.00 sec E.)" },
    { id: "et-d", label: "13.50 sec & slower Q. (9.00 sec & slower E.)" },
  ],
  categories: {
    helmet: HELMET_BASE,
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sGeneral, section: "General Technical Regulations, DRIVER PROTECTIVE GEAR" },
      confidence: "medium",
      notes:
        "A 'head sock' (balaclava) is listed among items that must be SFI-tagged when a body-specific requirement calls for one (\"Where SFI specifications are required for jacket, pants, gloves, boots, shoes, head sock or arm restraints, units must be SFI tagged...\"), but unlike NHRA, WDRA's rulebook doesn't state an explicit trigger condition (e.g. required specifically when using a head-and-neck restraint device instead of the neck collar) — so no specific requirement is modeled here without one.",
    },
    hnr: HNR_BASE,
    neck_collar: NECK_COLLAR_BASE,
    firesuit: FIRESUIT_BASELINE,
    gloves: {
      requirement: "not_addressed",
      citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
      confidence: "high",
      notes: "Only mandated in the two quickest E.T. bands, and only for open-bodied cars (or all cars at faster sub-thresholds) — see those bands.",
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
      citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
      confidence: "high",
      notes: "Mandatory for open-bodied cars in the two quickest E.T. bands only — see those bands.",
    },
    seat: SEAT_RULE,
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "No certified-harness requirement is stated at this E.T. — a plain factory seat belt satisfies WDRA's rule here. A certified SFI 16.1/16.5 system is only mandated at 11.49 sec (quarter mile) or quicker — see the two quickest E.T. bands.",
      citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER RESTRAINT SYSTEM" },
      confidence: "medium",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...sGeneral, section: "General Technical Regulations, WINDOW NET" },
      confidence: "high",
      notes: "Tied to whether a roll cage (not just a roll bar) is required for your car, per the general rule: \"If a roll cage is necessary, an SFI 27.1 window net is required.\" See the rollover-protection rule for your E.T. band to determine whether a cage applies to you.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...sEtRules, section: "Elapsed Time Specific Rules, FUEL SYSTEM" },
      confidence: "medium",
      notes: "No SFI/FIA fuel-cell certification is mandated — the rulebook only regulates fuel-tank/filler-neck venting and mounting height, not the tank/cell's own construction standard.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...sEtRules, section: "Elapsed Time Specific Rules, FIRE EXTINGUISHER(S)" },
      confidence: "high",
      notes: "Mandatory for closed-body entries in the two quickest E.T. bands only — see those bands. No UL rating is specified in the text reviewed, so this app falls back to a simple presence check where required.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...sEtRules, section: "Elapsed Time Specific Rules, FIRE SYSTEM" },
      confidence: "high",
      notes: "A dedicated fire system (one nozzle to the driver compartment, one to the engine) is only mandated in the quickest E.T. band for closed-body cars, front-engine dragsters, and open-bodied supercharged/turbocharged (gas/methanol) cars — see that band.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sGeneral },
      confidence: "medium",
      notes: "Not mentioned in the chapters reviewed.",
    },
    kill_switch: {
      requirement: "conditional",
      condition: "Only triggers if the battery is relocated (\"If battery is relocated or if guidelines require it, a master electrical kill switch is required\"). Unconditionally mandatory in the quickest E.T. band regardless of battery location — see that band.",
      citation: { ...sGeneral, section: "General Technical Regulations, MASTER ELECTRICAL CUTOFF" },
      confidence: "high",
    },
    tow_hook: {
      requirement: "not_addressed",
      citation: { ...sGeneral },
      confidence: "medium",
      notes: "Not mentioned in the chapters reviewed.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sGeneral },
      confidence: "medium",
      notes: "Not mentioned in the chapters reviewed.",
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
      citation: { ...sEtRules, section: "Elapsed Time Specific Rules (ROLL CAGE / ROLL BAR)" },
      confidence: "high",
      notes: "A full picture requires picking an E.T. band — the roll bar/cage/padding thresholds are entirely E.T.- and body-style-driven in this chapter.",
    },
  },
  classOverrides: {
    "et-a": {
      neck_collar: {
        requirement: "conditional",
        condition: "Mandatory (alongside SFI 3.2A-5 jacket and pants) at 9.00 sec quarter mile or 6.00 sec eighth mile or quicker — the fast sub-range within this band. A head and neck restraint device/system may be used instead — see Head & Neck Restraint (HANS/HNR).",
        acceptedStandards: [{ standardId: "sfi-3.3-collar" }],
        satisfiedByAlternative: "hnr",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
        confidence: "high",
      },
      hnr: {
        requirement: "conditional",
        condition: "May be used in lieu of the SFI 3.3 neck collar once that becomes mandatory (9.00 sec quarter mile / 6.00 sec eighth mile or quicker) — see Neck Collar.",
        acceptedStandards: [{ standardId: "fia-8858-2002" }, { standardId: "fia-8858-2010" }, { standardId: "sfi-38.1" }],
        satisfiedByAlternative: "neck_collar",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
        confidence: "high",
      },
      gloves: {
        requirement: "conditional",
        condition: "SFI 3.3/1 gloves mandatory at 8.49 sec quarter mile or 5.49 sec eighth mile or quicker (any body style), and mandatory on all open-bodied cars regardless of E.T. within this band.",
        acceptedStandards: [{ standardId: "sfi-3.3-1" }],
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
        confidence: "high",
      },
      arm_restraint: {
        requirement: "conditional",
        condition: "Mandatory on all open-bodied vehicles in this band (alongside SFI 3.3/1 gloves), regardless of the specific E.T. within it.",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
        confidence: "high",
      },
      firesuit: {
        requirement: "required",
        acceptedStandards: [
          { standardId: "sfi-3.2a-5", note: "Jacket-only tier, this band's baseline." },
        ],
        condition: "Escalates to jacket AND pants (still SFI 3.2A-5) once at 9.00 sec quarter mile or 6.00 sec eighth mile or quicker.",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
        confidence: "high",
      },
      belts_harness: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-16.1" }, { standardId: "sfi-16.5" }],
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER RESTRAINT SYSTEM" },
        confidence: "high",
        notes: "Rule text: 'SFI 16.1 or 16.5 within manufacturers expiration date mandatory' — a fixed manufacture-based expiration rather than a rolling re-certification interval, so no validityYearsFromLabel is modeled beyond the tag's own printed expiration.",
      },
      window_net: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-27.1" }],
        citation: { ...sGeneral, section: "General Technical Regulations, WINDOW NET" },
        confidence: "high",
        notes: "A roll cage is unconditionally required throughout this band, which triggers the window-net requirement per the general rule.",
      },
      fire_extinguisher: {
        requirement: "conditional",
        condition: "Mandatory on closed-body entries that DON'T already trigger the dedicated fire system requirement below (i.e. naturally aspirated closed-body cars, and closed-body cars slower than 7.49 sec quarter mile / 4.49 sec eighth mile).",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, FIRE SYSTEM" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "conditional",
        condition: "Mandatory (one nozzle to the driver's compartment, one to the engine, both with clearly identifiable release pins) for closed-body cars, front-engine dragsters, and open-bodied supercharged/turbocharged (gas/methanol) vehicles at 7.49 sec quarter mile or 4.49 sec eighth mile or quicker.",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, FIRE SYSTEM" },
        confidence: "high",
      },
      kill_switch: {
        requirement: "required",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, MASTER CUTOFF" },
        confidence: "high",
        notes: "Unconditionally mandatory throughout this band, unlike the slower bands (where it's only triggered by a relocated battery).",
      },
      rollover_protection: {
        requirement: "required",
        rolloverProtectionRequiresFullCage: true,
        rolloverProtectionRequiresPadding: true,
        rolloverProtectionPaddingCertRequired: true,
        condition:
          "A full multi-point cage is required throughout this band, EXCEPT a full-bodied car with an unaltered floor/firewall running 6.40 sec eighth mile or slower (i.e. the slow end of this band) may use a roll bar instead. A current SFI chassis certification is mandatory at 9.00 sec quarter mile / 6.00 sec eighth mile or quicker (essentially all of this band). SFI 45.1 padding is mandatory throughout this band (9.99 sec or quicker) — the plain 1/4\"-minimum-compression foam alternative available at slower E.T.s doesn't apply here.",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, ROLL CAGE" },
        confidence: "high",
      },
    },
    "et-b": {
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      firesuit: {
        requirement: "required",
        acceptedStandards: [
          { standardId: "sfi-3.2a-1", note: "Full-bodied vehicles." },
          { standardId: "sfi-3.2a-5", note: "Open-bodied vehicles." },
        ],
        condition: "Full-bodied cars need only SFI 3.2A-1 (single layer); open-bodied cars need the heavier SFI 3.2A-5.",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
        confidence: "high",
      },
      gloves: {
        requirement: "conditional",
        condition: "SFI 3.3/1 gloves mandatory on open-bodied vehicles only (alongside a jacket and arm restraints).",
        acceptedStandards: [{ standardId: "sfi-3.3-1" }],
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
        confidence: "high",
      },
      arm_restraint: {
        requirement: "conditional",
        condition: "Mandatory on open-bodied vehicles only.",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER PROTECTIVE GEAR" },
        confidence: "high",
      },
      belts_harness: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-16.1" }, { standardId: "sfi-16.5" }],
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, DRIVER RESTRAINT SYSTEM" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "required",
        condition: "Mandatory on all closed-body entries.",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, FIRE EXTINGUISHERS" },
        confidence: "high",
      },
      kill_switch: {
        requirement: "conditional",
        condition: "Only triggers if the battery is relocated — see General Technical Regulations, MASTER ELECTRICAL CUTOFF.",
        citation: { ...sGeneral, section: "General Technical Regulations, MASTER ELECTRICAL CUTOFF" },
        confidence: "high",
      },
      window_net: {
        requirement: "conditional",
        condition: "Required only if a roll cage (not just a roll bar) applies to your car — see the rollover-protection rule below. Most cars in this band only need a roll bar.",
        acceptedStandards: [{ standardId: "sfi-27.1" }],
        citation: { ...sGeneral, section: "General Technical Regulations, WINDOW NET" },
        confidence: "high",
      },
      rollover_protection: {
        requirement: "conditional",
        rolloverProtectionRequiresPadding: true,
        rolloverProtectionPaddingCertRequired: false,
        condition:
          "A roll BAR is mandatory for every car in this band (10.00-11.49 sec quarter / 6.50-7.49 sec eighth). A full CAGE is required instead only if the floor/firewall has been altered, or the car exceeds 135 mph. Convertibles (T-tops included) additionally need a 6-point roll bar across 11.00-13.49 sec quarter / 7.00-8.25 sec eighth — already covered by the general bar mandate in this band. Dune-buggy-type or open-top vehicles need a roll bar regardless of E.T. Roll bar/cage padding is mandatory (1/4\" minimum compression foam, or SFI 45.1) — SFI 45.1 certified padding specifically is NOT required at this E.T. (that only starts at 9.99 sec or quicker, the band above this one).",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, ROLL CAGE/ROLL BAR" },
        confidence: "high",
      },
    },
    "et-c": {
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      helmet: {
        requirement: "required",
        acceptedStandards: HELMET_STANDARDS,
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, HELMET" },
        confidence: "high",
        notes: HELMET_NOTE + " No full-face-for-open-bodied clause is restated at this E.T. tier in the text reviewed.",
      },
      window_net: {
        requirement: "not_addressed",
        citation: { ...sGeneral, section: "General Technical Regulations, WINDOW NET" },
        confidence: "high",
        notes: "No roll cage is mandated for most cars in this band (only convertibles need a roll BAR, and only 135mph+ cars need a full cage) — window net only triggers if a cage actually applies to you.",
      },
      rollover_protection: {
        requirement: "conditional",
        rolloverProtectionByBodyStyle: { convertible: "required", closed_roof: "not_addressed", open_wheel: "not_addressed", open_no_windshield: "not_addressed" },
        condition:
          "No general roll bar/cage mandate for a typical closed-roof car in this band. A full cage is mandatory for any car exceeding 135 mph. Convertibles need a 6-point roll bar at 11.00-13.49 sec quarter mile / 7.00-8.25 sec eighth mile — which is this entire band.",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, ROLL BAR/ROLL CAGE" },
        confidence: "high",
      },
    },
    "et-d": {
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      helmet: {
        requirement: "conditional",
        acceptedStandards: HELMET_STANDARDS,
        condition: "Required at 13.99 sec quarter mile or 8.59 sec eighth mile or quicker (the fast sub-range within this band). At 14.00 sec quarter mile / 8.60 sec eighth mile and slower, a helmet is only recommended — or required if a roll bar happens to be installed.",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, HELMET" },
        confidence: "high",
        notes: HELMET_NOTE,
      },
      rollover_protection: {
        requirement: "not_addressed",
        citation: { ...sEtRules, section: "Elapsed Time Specific Rules, ROLL BAR" },
        confidence: "high",
        notes: "No roll bar/cage is mandated at this E.T. — dragsters, altereds, and roadsters are prohibited from this band entirely, so the open-bodied cage scenarios don't arise here. A voluntarily installed roll bar must still meet the general padding/construction rules (General Technical Regulations, ROLL BARS).",
      },
    },
  },
};

export const wdraRulesets: Ruleset[] = [wdraSportsmanET];

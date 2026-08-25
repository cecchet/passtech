import { CategoryRule, Ruleset } from "../types";

// PDRA (Professional Drag Racing Association) — fourth and last drag-racing body in this pass,
// after NHRA, WDRA, and IHRA. Unlike the other three, PDRA publishes rules as separate per-class
// PDFs rather than one combined rulebook (see https://www.pdra660.com/competition/rules/) — this
// models "Bracket Bash" (BB.pdf), PDRA's grassroots sportsman bracket class, closest in spirit and
// audience to the Sportsman/Summit/E.T.-Handicap chapters modeled for the other three bodies.
// Bracket Bash's own rule text is essentially NHRA's Section 5A re-expressed for eighth-mile-only
// competition (dial-in 3.70-7.49 sec) — same breakpoints, same neck-collar/HNR/head-sock
// substitution clause verbatim, same SFI spec numbers — so it's modeled the same way: discrete E.T.
// bands via classes/classOverrides. Motorcycles/snowmobiles are excluded (per Bracket Bash's own
// text) and every other PDRA class (Pro Street, Pro Bracket, Top Sportsman, Top Dragster, Jr.
// Dragster, etc.) is out of scope for this pass.
const sourceDoc = {
  title: "PDRA Bracket Bash Class Rules",
  version: "2026 Season",
  url: "https://www.pdra660.com/competition/rules/BB.pdf",
};

const sBB = { ...sourceDoc, section: "Bracket Bash" };

const HELMET_STANDARDS = [
  { standardId: "snell-sa2010", noExpiration: true },
  { standardId: "snell-sa2015", noExpiration: true },
  { standardId: "snell-sa2020", noExpiration: true },
  { standardId: "snell-m2010", noExpiration: true },
  { standardId: "snell-m2015", noExpiration: true },
  { standardId: "sfi-31.1-2010", noExpiration: true },
  { standardId: "sfi-31.1-2015", noExpiration: true },
];

const HELMET_LENIENT: CategoryRule = {
  requirement: "required",
  acceptedStandards: HELMET_STANDARDS,
  fullFaceRequirement: "conditional",
  fullFaceCondition: "Open-bodied entries (front- or rear-engine, any induction) must use a full-face helmet and shield (goggles prohibited), regardless of E.T. within this band. Closed-bodied cars may use open-face, with or without a shield.",
  citation: { ...sBB, section: "Bracket Bash, HELMET" },
  confidence: "high",
};

const HELMET_STRICT: CategoryRule = {
  requirement: "required",
  acceptedStandards: HELMET_STANDARDS,
  fullFaceRequirement: "required",
  fullFaceCondition: "Shield is mandatory (not just permitted) for open-bodied cars at this E.T.; permitted but not mandatory for closed-bodied cars. Goggles prohibited either way.",
  citation: { ...sBB, section: "Bracket Bash, HELMET" },
  confidence: "high",
  notes: "Full-face helmet mandatory for every car at 6.39 sec or quicker, regardless of body style or induction type.",
};

const NECK_COLLAR_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sBB, section: "Bracket Bash, NECK COLLAR" },
  confidence: "high",
  notes: "Only becomes mandatory at 6.39 sec or quicker (or 135 mph+) — not addressed at this E.T.",
};

const HNR_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sBB, section: "Bracket Bash, NECK COLLAR" },
  confidence: "high",
  notes: "Only relevant once the neck-collar requirement itself applies, at 6.39 sec or quicker (or 135 mph+).",
};

const BALACLAVA_NOT_YET: CategoryRule = {
  requirement: "not_addressed",
  citation: { ...sBB, section: "Bracket Bash, NECK COLLAR" },
  confidence: "high",
  notes: "The head-sock trigger only exists once the neck-collar/HNR choice itself applies, at 6.39 sec or quicker (or 135 mph+) — not in play at this E.T.",
};

const BALACLAVA_TRIGGER: CategoryRule = {
  requirement: "conditional",
  condition:
    "Required only if you satisfy the neck-collar requirement with a head-and-neck restraint (HANS-style) device instead of a plain SFI 3.3 collar. A 'skirted' helmet satisfies this instead of a separate head sock. Not required if you're using the plain collar.",
  balaclavaRequiredIfHnrUsed: true,
  citation: { ...sBB, section: "Bracket Bash, NECK COLLAR" },
  confidence: "high",
  notes: "Rule text: \"If SFI Spec 3.3 neck collar is required and driver opts to use a head and neck restraint system instead, then SFI Spec 3.3 head sock or SFI Spec 3.3 skirted helmet is mandatory.\"",
};

const SHOES_RULE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Closed shoes with socks — no open-toe/open-heel shoes or sandals — satisfies the baseline for every E.T. under the general fallback clause (full-length pants, sleeved shirt, closed shoes, socks).",
  acceptedStandards: [{ standardId: "sfi-3.3-5", note: "SFI 3.3/5 boots/shoes become mandatory only for forced-induction/nitrous cars without a firewall, or any car with an automatic transmission and no floor covering it, within the quickest band." }],
  citation: { ...sBB, section: "Bracket Bash, PROTECTIVE CLOTHING" },
  confidence: "high",
};

const SOCKS_RULE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Socks mandatory alongside closed shoes for every E.T. — no certification standard involved.",
  citation: { ...sBB, section: "Bracket Bash, PROTECTIVE CLOTHING" },
  confidence: "high",
};

const FIRESUIT_BASELINE: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote:
    "Full-length pants, short- or long-sleeved shirt, closed shoes, and socks — no shorts, tank tops, or open-toe/open-heel shoes or sandals. No SFI-rated suit required at this E.T.",
  citation: { ...sBB, section: "Bracket Bash, PROTECTIVE CLOTHING" },
  confidence: "high",
};

const SEAT_RULE: CategoryRule = {
  requirement: "conditional",
  condition: "No certification standard is cited — only a construction/material clause applies.",
  materialOnlyAccepted: true,
  materialNote: "Properly braced, framed, and supported seat of aluminum, fiberglass, carbon fiber, or double-layer poly (including automotive accessory seats) — no SFI/FIA seat certification is mandated at any E.T. in this class.",
  citation: { ...sBB, section: "Bracket Bash, INTERIOR (SEATS)" },
  confidence: "high",
};

const PARACHUTE_RULE: CategoryRule = {
  requirement: "conditional",
  condition: "Mandatory only if the car runs 150 mph or faster — uncommon in this class's E.T. range but possible for a very light/aerodynamic car.",
  citation: { ...sBB, section: "Bracket Bash, FRAME (PARACHUTE)" },
  confidence: "high",
};

const KILL_SWITCH_NOT_YET: CategoryRule = {
  requirement: "conditional",
  condition: "Only triggers if the battery is located in the trunk area — most cars at this E.T. don't need a master cutoff yet (the 6.39-or-quicker / 135mph+ trigger doesn't apply here).",
  citation: { ...sBB, section: "Bracket Bash, MASTER CUT-OFF" },
  confidence: "high",
};

const KILL_SWITCH_REQUIRED: CategoryRule = {
  requirement: "required",
  citation: { ...sBB, section: "Bracket Bash, MASTER CUT-OFF" },
  confidence: "high",
  notes: "Mandatory on any car with a battery at 6.39 sec or quicker, any car exceeding 135 mph, or any car with the battery located in the trunk area (this last trigger applies regardless of E.T. — see the slower bands).",
};

const ARM_RESTRAINT_RULE: CategoryRule = {
  requirement: "conditional",
  condition: "Mandatory on all open-bodied cars running 7.49 sec or quicker — since this entire class runs at 7.49 sec or quicker by definition (Bracket Bash's dial-in ceiling), this applies to every open-bodied car in the class regardless of which E.T. band you're in.",
  citation: { ...sBB, section: "Bracket Bash, DRIVER (ARM RESTRAINTS)" },
  confidence: "high",
};

const pdraBracketBash: Ruleset = {
  id: "pdra-bracket-bash",
  bodyId: "pdra",
  bodyName: "PDRA (Professional Drag Racing Association)",
  disciplineName: "Drag Racing — Bracket Bash",
  disciplineGroup: "Drag Racing",
  lastReviewed: "2026-08-25",
  sourceDocuments: [sBB],
  classes: [
    { id: "et-c", label: "7.00–7.49 sec (slowest Bracket Bash tier)" },
    { id: "et-b", label: "6.40–6.99 sec" },
    { id: "et-a", label: "6.39 sec & quicker (fastest Bracket Bash tier)" },
  ],
  categories: {
    helmet: HELMET_LENIENT,
    balaclava: {
      requirement: "conditional",
      condition:
        "Only comes into play at 6.39 sec or quicker (or 135 mph+), and even then only if you satisfy the neck-collar requirement with a head-and-neck restraint (HANS-style) device instead of a plain SFI 3.3 collar. Select the 6.39-and-quicker band to see this resolve against your actual gear.",
      balaclavaRequiredIfHnrUsed: true,
      citation: { ...sBB, section: "Bracket Bash, NECK COLLAR" },
      confidence: "high",
      notes: "Rule text: \"If SFI Spec 3.3 neck collar is required and driver opts to use a head and neck restraint system instead, then SFI Spec 3.3 head sock or SFI Spec 3.3 skirted helmet is mandatory.\"",
    },
    hnr: {
      requirement: "conditional",
      condition: "May be used in lieu of an SFI 3.3 neck collar, but only relevant once that becomes mandatory at 6.39 sec or quicker (or 135 mph+). Using this instead of the plain collar also triggers a balaclava (head sock) requirement — see that category.",
      citation: { ...sBB, section: "Bracket Bash, NECK COLLAR" },
      confidence: "high",
    },
    neck_collar: {
      requirement: "conditional",
      condition: "Only becomes mandatory at 6.39 sec or quicker (or 135 mph+). A head and neck restraint device/system may be used instead — see Head & Neck Restraint (HANS/HNR).",
      citation: { ...sBB, section: "Bracket Bash, NECK COLLAR" },
      confidence: "high",
    },
    firesuit: FIRESUIT_BASELINE,
    gloves: {
      requirement: "conditional",
      condition: "SFI 3.3/1 gloves mandatory for open-bodied cars once arm restraints apply (this whole class, since it runs at 7.49 sec or quicker throughout), and for the same induction-type/firewall triggers that pull in a certified firesuit within the quickest band (see that band).",
      acceptedStandards: [{ standardId: "sfi-3.3-1" }, { standardId: "sfi-3.3-5" }],
      citation: { ...sBB, section: "Bracket Bash, PROTECTIVE CLOTHING" },
      confidence: "high",
    },
    shoes: SHOES_RULE,
    socks: SOCKS_RULE,
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sBB },
      confidence: "high",
      notes: "No fire-resistant undergarment requirement or recommendation anywhere in the Bracket Bash rules, at any E.T.",
    },
    arm_restraint: ARM_RESTRAINT_RULE,

    seat: SEAT_RULE,
    belts_harness: {
      requirement: "conditional",
      condition: "SFI 16.1 restraint system (with crotch strap, updated every 2 years from date of manufacture) is mandatory at 7.35 sec or quicker — covering most of this class. Convertibles need it at 8.25 sec or quicker (covers the entire class); dune-buggy-type vehicles need it regardless of E.T. A plain seat belt is the baseline requirement for every car.",
      materialOnlyAccepted: true,
      materialNote: "Plain seat belt mandatory in all cars, at minimum.",
      acceptedStandards: [{ standardId: "sfi-16.1", validityYearsFromLabel: 2 }],
      citation: { ...sBB, section: "Bracket Bash, DRIVER RESTRAINT SYSTEM" },
      confidence: "high",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...sBB, section: "Bracket Bash, WINDOW NET" },
      confidence: "high",
      notes: "Only mandatory for a full-bodied car at 4.50-6.39 sec or 135 mph+ — see the quickest E.T. band.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...sBB, section: "Bracket Bash, FUEL SYSTEM" },
      confidence: "high",
      notes: "No SFI/FIA fuel-cell certification is mandated — the rulebook only regulates fuel-tank/filler-neck venting and a bulkhead when tank/battery/lines are located in the trunk, not the tank/cell's own construction standard.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...sBB, section: "Bracket Bash, SUPPORT GROUP" },
      confidence: "high",
      notes: "No handheld fire-extinguisher mandate found in the Bracket Bash rules — only a fire-extinguisher SYSTEM is addressed, and only as 'permitted,' not mandatory (see fire_suppression).",
    },
    fire_suppression: {
      requirement: "recommended",
      citation: { ...sBB, section: "Bracket Bash, SUPPORT GROUP (FIRE EXTINGUISHER SYSTEM)" },
      confidence: "high",
      notes: "Rule text: 'Permitted, must be securely mounted.' No certification standard or mandate stated.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sBB },
      confidence: "medium",
      notes: "Not mentioned anywhere in the Bracket Bash rules.",
    },
    kill_switch: KILL_SWITCH_NOT_YET,
    tow_hook: {
      requirement: "not_addressed",
      citation: { ...sBB, section: "Bracket Bash, SUPPORT GROUP (TOW VEHICLES)" },
      confidence: "medium",
      notes: "The rulebook addresses labeling for the track's own tow/push vehicle interface, not a driver-carried tow hook/point on the car.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sBB },
      confidence: "medium",
      notes: "Not mentioned anywhere in the Bracket Bash rules.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sBB },
      confidence: "medium",
      notes: "Not mentioned anywhere in the Bracket Bash rules.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sBB },
      confidence: "medium",
      notes: "Not mentioned anywhere in the Bracket Bash rules.",
    },
    parachute: PARACHUTE_RULE,

    rollover_protection: {
      requirement: "not_addressed",
      condition: "Dune-buggy-type vehicles need a roll bar regardless of E.T. (see the band-specific rule for other body types once a class is selected).",
      citation: { ...sBB, section: "Bracket Bash, FRAME (ROLL BAR / ROLL CAGE)" },
      confidence: "high",
      notes: "A full picture requires picking an E.T. band — the roll bar/cage/padding thresholds are entirely E.T.-driven in this class.",
    },
  },
  classOverrides: {
    "et-c": {
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      balaclava: BALACLAVA_NOT_YET,
      belts_harness: {
        requirement: "conditional",
        condition: "SFI 16.1 mandatory at 7.35 sec or quicker — covering most of this band (7.00-7.35). The remaining sliver (7.36-7.49) stays on the plain-seat-belt baseline UNLESS it's a convertible (needs SFI 16.1 at 8.25 sec or quicker — covers this whole band) or dune-buggy-type vehicle (needs it regardless of E.T.).",
        materialOnlyAccepted: true,
        materialNote: "Plain seat belt suffices for a closed-bodied, non-convertible, non-dune-buggy car at 7.36-7.49 sec.",
        acceptedStandards: [{ standardId: "sfi-16.1", validityYearsFromLabel: 2 }],
        citation: { ...sBB, section: "Bracket Bash, DRIVER RESTRAINT SYSTEM" },
        confidence: "high",
      },
      firesuit: {
        requirement: "conditional",
        condition: "A single-layer SFI 3.2A/1 jacket becomes mandatory (6.40-7.35 sec) for naturally aspirated, OEM-supercharged, or OEM-turbocharged cars with a full OEM or .024\" steel firewall. Cars outside that description stay on the base clothing requirement in this band (the heavier non-OEM-firewall/forced-induction tiers only start at 6.40-8.59, which reaches into this band too — see notes).",
        materialOnlyAccepted: true,
        materialNote: "Base clothing (full-length pants, sleeved shirt, closed shoes, socks) suffices unless one of the induction-type/firewall triggers above applies.",
        acceptedStandards: [
          { standardId: "sfi-3.2a-1", note: "NA/OEM-forced-induction cars with a full OEM/.024\" firewall (6.40-7.35 sec), or any non-OEM-forced-induction/nitrous car with that firewall (6.40-8.59 sec)." },
          { standardId: "sfi-3.2a-5", note: "Non-OEM-forced-induction or nitrous cars WITHOUT a full OEM/.024\" firewall (6.40-8.59 sec) — gloves meeting SFI 3.3A/1 also required at this tier." },
        ],
        citation: { ...sBB, section: "Bracket Bash, PROTECTIVE CLOTHING" },
        confidence: "high",
      },
      rollover_protection: {
        requirement: "conditional",
        condition:
          "Roll bar mandatory for ALL cars at 7.00-7.35 sec (most of this band). Convertibles need a roll bar throughout this band (mandatory 7.00-8.25 sec). Dune-buggy-type vehicles need one regardless of E.T. A closed-roof, non-convertible, non-dune-buggy car in the 7.36-7.49 sec sliver has no general roll bar/cage mandate.",
        citation: { ...sBB, section: "Bracket Bash, FRAME (ROLL BAR)" },
        confidence: "high",
      },
    },
    "et-b": {
      hnr: HNR_NOT_YET,
      neck_collar: NECK_COLLAR_NOT_YET,
      balaclava: BALACLAVA_NOT_YET,
      belts_harness: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-16.1", validityYearsFromLabel: 2 }],
        citation: { ...sBB, section: "Bracket Bash, DRIVER RESTRAINT SYSTEM" },
        confidence: "high",
        notes: "SFI 16.1 restraint system mandatory at 7.35 sec or quicker — this band is entirely at or below that threshold.",
      },
      firesuit: {
        requirement: "required",
        acceptedStandards: [
          { standardId: "sfi-3.2a-1", note: "NA/OEM-forced-induction cars with a full OEM/.024\" firewall, or any non-OEM-forced-induction/nitrous car with that firewall." },
          { standardId: "sfi-3.2a-5", note: "Non-OEM-forced-induction or nitrous cars WITHOUT a full OEM/.024\" firewall — gloves meeting SFI 3.3A/1 also required at this tier." },
        ],
        condition: "Single-layer SFI 3.2A/1 jacket for cars with a full OEM/.024\" steel firewall (regardless of induction type in this band); SFI 3.2A/5 jacket + SFI 3.3A/1 gloves for forced-induction/nitrous cars without one.",
        citation: { ...sBB, section: "Bracket Bash, PROTECTIVE CLOTHING" },
        confidence: "high",
      },
      rollover_protection: {
        requirement: "required",
        rolloverProtectionRequiresFullCage: false,
        rolloverProtectionRequiresPadding: true,
        rolloverProtectionPaddingCertRequired: false,
        condition:
          "A full multi-point cage is mandatory throughout this band, EXCEPT a full-bodied car with an unaltered firewall/floor/body (wheel tubs permitted) may use a roll bar in place of a cage. Convertibles need a full cage outright, no roll-bar exception. Roll bar/cage padding is mandatory (general construction rule, minimum 1/4\" compression) — certified SFI 45.1 padding specifically is NOT required yet at this E.T. (that starts at 6.39 sec or quicker, the band above this one).",
        citation: { ...sBB, section: "Bracket Bash, FRAME (ROLL CAGE)" },
        confidence: "high",
      },
    },
    "et-a": {
      helmet: HELMET_STRICT,
      hnr: {
        requirement: "required",
        condition: "May be used in lieu of an SFI 3.3 neck collar, mandatory at 6.39 sec or quicker or any car exceeding 135 mph — see Neck Collar.",
        acceptedStandards: [{ standardId: "fia-8858-2002" }, { standardId: "fia-8858-2010" }, { standardId: "sfi-38.1" }],
        satisfiedByAlternative: "neck_collar",
        citation: { ...sBB, section: "Bracket Bash, NECK COLLAR" },
        confidence: "high",
        notes: "Not itself independently mandated — Bracket Bash's actual baseline requirement is the SFI 3.3 neck collar (see that category); this device is an accepted substitute for it, paired with an SFI 3.3 head sock or skirted helmet.",
      },
      neck_collar: {
        requirement: "required",
        condition: "Mandatory at 6.39 sec or quicker, or any car exceeding 135 mph. A head and neck restraint device/system may be used instead — see Head & Neck Restraint (HANS/HNR).",
        acceptedStandards: [{ standardId: "sfi-3.3-collar" }],
        satisfiedByAlternative: "hnr",
        citation: { ...sBB, section: "Bracket Bash, NECK COLLAR" },
        confidence: "high",
      },
      balaclava: BALACLAVA_TRIGGER,
      firesuit: {
        requirement: "required",
        acceptedStandards: [
          { standardId: "sfi-3.2a-5", note: "General case (6.39-4.50 sec, or any vehicle exceeding 135 mph) — jacket and pants, plus SFI 3.3/1 gloves." },
          { standardId: "sfi-3.2a-15", note: "Front-engine open-bodied or non-OEM-firewall closed-bodied cars with nitrous/supercharger/turbocharger, or any alcohol-burning forced-induction car — jacket AND pants required at this tier, with SFI 3.3/5 gloves (and boots for the alcohol case)." },
        ],
        citation: { ...sBB, section: "Bracket Bash, PROTECTIVE CLOTHING" },
        confidence: "high",
        notes: "6.39 sec and quicker (or any car exceeding 135 mph): a certified jacket is mandatory for every car — plain clothing no longer suffices, unlike the slower bands. An automatic transmission with no floor covering it also triggers the SFI 3.2A/15 + SFI 3.3/5 gloves/boots tier regardless of induction type.",
      },
      gloves: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-3.3-1" }, { standardId: "sfi-3.3-5" }],
        citation: { ...sBB, section: "Bracket Bash, PROTECTIVE CLOTHING" },
        confidence: "high",
        notes: "SFI 3.3/1 for the general case; SFI 3.3/5 for forced-induction/nitrous cars without a firewall, alcohol-burning forced-induction cars, or automatic-transmission cars with no floor covering the transmission.",
      },
      belts_harness: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-16.1", validityYearsFromLabel: 2 }],
        citation: { ...sBB, section: "Bracket Bash, DRIVER RESTRAINT SYSTEM" },
        confidence: "high",
      },
      window_net: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-27.1" }],
        citation: { ...sBB, section: "Bracket Bash, WINDOW NET" },
        confidence: "high",
        notes: "Ribbon-type or SFI 27.1 mesh-type window net mandatory on any full-bodied car at 6.39 sec or quicker (down to 4.50 sec, this class's practical floor), or any car exceeding 135 mph.",
      },
      kill_switch: KILL_SWITCH_REQUIRED,
      rollover_protection: {
        requirement: "required",
        rolloverProtectionRequiresFullCage: true,
        rolloverProtectionRequiresPadding: true,
        rolloverProtectionPaddingCertRequired: true,
        condition: "This entire band (6.39 sec and quicker) is at or past the 6.99-sec roll-cage and 6.39-sec padding thresholds — full multi-point cage and SFI 45.1 padding are both unconditionally mandatory here. A current SFI-certified chassis is additionally required for anything quicker than 6.39 sec.",
        citation: { ...sBB, section: "Bracket Bash, FRAME (ROLL CAGE / ROLL BAR PADDING)" },
        confidence: "high",
      },
    },
  },
};

export const pdraRulesets: Ruleset[] = [pdraBracketBash];

import { Ruleset } from "../types";
import { GENERIC_FUEL_CELL_STANDARDS } from "../standards";

// The site's "2026 Rule Book" page links to a PDF whose own intro text ("we are extremely proud
// to bring you the 2025 rulebook") and filename (KK2025Rulebook_v2.pdf) both say 2025 — flagged
// rather than silently trusting the page title, since the two disagree.
const sourceDoc = {
  title: "Klutch Kickers Rule Book",
  version: "2025 edition per the PDF's own intro text and filename (KK2025Rulebook_v2.pdf), linked from the site's \"2026 Rule Book\" page as retrieved 2026-09-02",
  url: "https://klutchkickers.com/s/KK2025Rulebook_v2.pdf",
};

// FIA-only lists (not the broader SFI-or-FIA GENERIC_* constants in standards.ts) — the rulebook
// specifically says "FIA approved" for both seat and harness, never offering an SFI alternative
// the way most US club rulesets do.
const fiaSeatStandards = [{ standardId: "fia-8855-1999" }, { standardId: "fia-8855-2010" }, { standardId: "fia-8855-2021" }, { standardId: "fia-8862-2009" }];
const fiaHarnessStandards = [{ standardId: "fia-8853-2016" }, { standardId: "fia-8853-98" }, { standardId: "fia-8854-98" }, { standardId: "fia-8853-1985" }];

const driftSeries: Ruleset = {
  id: "klutchkickers-drift-series",
  bodyId: "klutchkickers",
  bodyName: "Klutch Kickers",
  disciplineName: "Drift Series",
  disciplineGroup: "Drifting",
  lastReviewed: "2026-09-02",
  sourceDocuments: [{ ...sourceDoc, section: "Safety Equipment" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [{ standardId: "snell-sa2015" }, { standardId: "snell-sa2020" }, { standardId: "snell-sa2025" }],
      fullFaceRequirement: "required",
      citation: { ...sourceDoc, section: "Safety Equipment 1" },
      confidence: "high",
      notes: "Rule text: 'Helmets must be certified to one of the following standards. Sa2015, 2020, 2025' (i.e. Snell SA2015/SA2020/SA2025 — SA2010 not listed). 'Full Face helmets are required for competition use' and 'Helmets must be fastened while on course.' No FIA/SFI alternative is offered.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook.",
    },
    hnr: {
      requirement: "recommended",
      acceptedStandards: [{ standardId: "fia-8858-2002" }, { standardId: "fia-8858-2010" }, { standardId: "sfi-38.1" }],
      citation: { ...sourceDoc, section: "Safety Equipment 5d" },
      confidence: "high",
      notes: "Rule text: 'Hans' device is not required at this time but is recommended.' No specific standard is named for it, so the standard registry's usual FIA/SFI head-and-neck-restraint specs are offered.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
      ],
      citation: { ...sourceDoc, section: "Safety Equipment 2" },
      confidence: "high",
      notes:
        "Rule text: 'One-piece driving suits are required and must be made of fire-resistant material and certified to SFI spec 3.2/A/5 or greater, or homologated to FIA 8856-2000, 8856-2018 specs.' \"Or greater\" excludes SFI 3.2A/1 and 3.2A/3 (the tiers below /5). One-piece is explicitly required — no two-piece jacket/pants option is mentioned.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook — a genuine gap given a full firesuit/helmet/harness standard is otherwise specified.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Rule text: 'Closed toed shoes are required, with no exceptions.' No fire-resistant certification standard (e.g. SFI 3.3) is cited — any closed-toe shoe satisfies this.",
      citation: { ...sourceDoc, section: "Safety Equipment 3" },
      confidence: "high",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook.",
    },
    arm_restraint: {
      requirement: "conditional",
      condition: "Required for any vehicle not running front windows; recommended (not required) if front windows are present.",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited for the arm restraint itself.",
      citation: { ...sourceDoc, section: "Body Panels 7a; Safety Equipment 5c" },
      confidence: "high",
      notes:
        "Two places in the rulebook describe the same rule from different angles: Body Panels §7a ('Front windows are not required, but will require arm restraints if not present') and Safety Equipment §5c ('Arm restraints are required for any vehicle not running front windows but are recommended for all others').",
    },

    // Car safety gear
    seat: {
      requirement: "required",
      acceptedStandards: fiaSeatStandards,
      citation: { ...sourceDoc, section: "Safety Equipment 4" },
      confidence: "high",
      notes:
        "Rule text: 'Seats need to be properly mounted to the rails and contain all mounting hardware and be FIA approved. If seats do not feel sturdy and secure in the car, the tech team has the right to have you fix it prior to passing tech.' Only 'FIA approved' is specified — no SFI alternative is offered, unlike most US club rulesets. No specific FIA seat spec number is named, so the standard registry's FIA seat certs are offered generically.",
    },
    belts_harness: {
      requirement: "required",
      acceptedStandards: fiaHarnessStandards,
      citation: { ...sourceDoc, section: "Safety Equipment 5" },
      confidence: "high",
      notes:
        "Rule text: 'FIA approved harnesses are in date. All harnesses must be properly routed to either a roll cage or harness bar' (with a link to the SFI Foundation's seatbelt installation guide for routing reference). Only 'FIA approved' is specified — no SFI alternative, and no specific FIA harness spec number is named, so the standard registry's FIA harness certs are offered generically.",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook — front-window omission is instead addressed via the arm_restraint requirement (see that category).",
    },

    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionRequiresWelded: true,
      rolloverProtectionTubingSpec: [{ minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.095 }] }],
      citation: { ...sourceDoc, section: "Roll Cages" },
      confidence: "high",
      notes:
        "Rule text highlights: cage must attach to the chassis at a minimum of 8 points, with anti-intrusion bars required; 'Bolt in cages will not be allowed' (excluding aluminum-frame Corvettes with specific permission) — welded construction only; permitted materials are mild steel tubing, DOM, or chromoly (chromoly must be TIG welded); all roll cage tubing must be a minimum of 1.5 x .095 (1.5\" OD, .095\" wall); main hoops must be single-piece tubing, not welded together, with continuous crack-free welds (no grinding/polishing of welds permitted); door bars must be parallel or an X-shape, with a minimum of 2 support bars if they don't intersect. No padding requirement is stated, and the club doesn't reference an external cage-logbook/certification system — cages are inspected directly by Klutch Kickers' own technical team.",
    },
    fire_extinguisher: {
      requirement: "conditional",
      condition: "Required unless the car instead has a qualifying fire suppression system installed (see fire_suppression) — one or the other is mandatory, not both.",
      citation: { ...sourceDoc, section: "Safety Equipment 6" },
      confidence: "high",
      notes:
        "Rule text: 'All vehicles must be equipped with a fire extinguisher in reach of the driver.' No minimum size, weight, or UL rating is specified anywhere in the rulebook, so this is modeled as a plain presence requirement rather than with fireExtinguisherOptions.",
    },
    fire_suppression: {
      requirement: "conditional",
      condition: "An alternative to a handheld fire extinguisher, not an addition to it — fitting a compliant handheld extinguisher instead fully satisfies the rule.",
      citation: { ...sourceDoc, section: "Safety Equipment 6a" },
      confidence: "high",
      notes:
        "Rule text: 'No fire extinguisher is required if you have a fire suppression system plumbed into your vehicle with nozzles and a remote trigger mounted to the drivers side \"A\" pillar and clearly marked with an Extinguisher Sticker.' No certification standard (e.g. SFI 17.1 / FIA 8865) is specified for the system itself — only the mounting/labeling/trigger-location construction requirements above.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition: "Required only for vehicles not using their factory fuel tank.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
      materialNote:
        "Rule text: 'If using a factory fuel tank, it must be mounted in the factory location, using the factory equipment and protected by the factory floor.' A stock/OEM tank kept in its factory location and mounting is fully accepted — no cell is required unless the tank itself has been changed.",
      citation: { ...sourceDoc, section: "Fuel Systems/Fuel Cells" },
      confidence: "high",
      notes:
        "When a cell is used, the rulebook specifies construction rather than a certification standard: 'a bladder enclosed fully of a metal container,' structure fully welded or bolted to the vehicle with 6 grade-8 10mm bolts through 1/8\" steel mounting plates, firewalled off from the driver, floor pan modifications allowed to accommodate it, a flapper valve/rollover ball to prevent spilling in a rollover, and a vent that exits outside the vehicle (not into the driver's compartment). No SFI 28.1/28.3 or FIA FT3/FT3.5/FT5 certification is mentioned anywhere -- since no specific spec is named, any registered fuel-cell homologation is treated as satisfying this (a certified cell inherently clears the construction spec described).",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook.",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...sourceDoc, section: "Electrical Systems 3" },
      confidence: "high",
      notes:
        "Rule text: 'ALL VEHICLES must be equipped with two master cutoff switches. It must be wired in a way that when turned off it shuts off all power to the vehicle and stops the engine as well, with the exception of an electrical fire suppression system. Kill switch needs to be located on the outside of the vehicle driver's side lower cowl and clearly labeled on/off labels and one within reach of the driver when fully buckled into the car. A single cut off switch can be mounted to the drivers side A pillar of the car, which can be reached by both track safety crews and driver of vehicle.' Read as: either a pair of switches (one exterior lower-cowl, one driver-reachable) or a single combined switch at the driver's side A-pillar reachable by both crew and driver satisfies the rule.",
    },
    tow_hook: {
      requirement: "required",
      towHookSidesRequired: "both",
      materialNote: "Rule text says 'tow strap,' not a rigid hook/eye — a fixed-mounted strap-style attachment point (like several other bodies' 'tow hook or strap' framing) satisfies this the same way a rigid hook would.",
      citation: { ...sourceDoc, section: "Chassis 7" },
      confidence: "high",
      notes: "Rule text: 'All vehicles must be equipped with a front and rear tow strap. If not clearly visible it must be marked with a TOW decal.'",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Chassis 7" },
      confidence: "high",
      notes: "The 'tow strap' requirement (Chassis §7) is a fixed, car-mounted attachment point front and rear, modeled under tow_hook — no separate loose/carried tow rope or strap is required.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook.",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Body Panels 9" },
      confidence: "high",
      notes:
        "Not mandated — the rulebook only states a construction condition for cars that choose to run them: 'Hood pins are only permitted with the removal of the stock latch. Trunk pins are the same requirement.' A car may keep its stock hood latch and skip pins entirely.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook.",
    },
    parachute: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not applicable to this discipline; not mentioned in the rulebook.",
    },
  },
  knownGaps: [
    "The rulebook requires a specific electrical master-cutoff configuration (either two switches — one exterior lower-cowl-mounted, one driver-reachable — or a single combined switch at the driver's side A-pillar reachable by both crew and driver) that this app can only track as a plain kill-switch presence requirement, not the exact mounting/count configuration. Verify your setup directly against the rulebook's Electrical Systems section.",
  ],
};

export const klutchkickersRulesets: Ruleset[] = [driftSeries];

import { CategoryRule, EquipmentCategory, Ruleset } from "../types";
import { GENERIC_FUEL_CELL_STANDARDS } from "../standards";

const sourceDoc = {
  title: "2026 AMEC Ice Racing Rules",
  version: "Revision 1, January 2026",
  url: "https://icerace.com/wp-content/uploads/2026/01/AMEC-rules-2026.pdf",
};

// AMEC's driver-equipment rules (§2.2) apply uniformly across all of its car classes (Street
// Legal, Street Legal Modified, Stock Sportsman, Modified, Super Modified Closed/Open,
// All-Wheel-Drive, Open) — the classes differ in car prep and roll cage/harness requirements,
// not driver-worn PPE, so a single ruleset covers the whole club. Car-gear categories (seat,
// belts_harness, fuel_cell, fire_extinguisher, fire_suppression, window_net) DO vary by class —
// the base `categories` below keeps the general, all-classes-caveated picture for a driver who
// hasn't picked a class yet, and `classOverrides` (below the ruleset) refines each of those
// categories once a class is selected, decomposing the same rulebook citations already in the
// base rule's prose into per-class structured rules rather than re-researching anything new.
const harnessAcceptedStandards = [
  { standardId: "sfi-16.1", note: "Rule cites only '2007 SFI or newer tagged harness' generically, without a slash-level — all three current SFI harness specs offered so users can match their tag." },
  { standardId: "sfi-16.5", note: "Rule cites only '2007 SFI or newer tagged harness' generically, without a slash-level — all three current SFI harness specs offered so users can match their tag." },
  { standardId: "sfi-16.6", note: "Rule cites only '2007 SFI or newer tagged harness' generically, without a slash-level — all three current SFI harness specs offered so users can match their tag." },
];

const iceRacing: Ruleset = {
  id: "amec-ice-racing",
  bodyId: "amec",
  bodyName: "AMEC (Adirondack Motor Enthusiast Club)",
  disciplineName: "Ice Racing",
  disciplineGroup: "Ice Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "2.2 Driver Equipment" }],
  classes: [
    { id: "street-legal", label: "Street Legal (SL / SLS / SL4 / SLS4)" },
    { id: "street-legal-modified", label: "Street Legal Modified (SLM / SLM4)" },
    { id: "stock-sportsman", label: "Stock Sportsman (SS)" },
    { id: "modified", label: "Modified Class (MC)" },
    { id: "super-modified-closed", label: "Super Modified Closed (SMC)" },
    { id: "super-modified-open", label: "Super Modified Open (SMO)" },
    { id: "awd", label: "All-Wheel-Drive (AWD)" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2010", noExpiration: true },
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "2.2.1" },
      confidence: "high",
      notes:
        "Rule text: 'SNELL SA2010 or newer helmets are required.' No FIA/SFI alternative is offered, and no full-face requirement is stated for the general driver population (the narrow 14-17-year-old no-license exception in §2.1.3.7 does specify full-face, but that's not the general rule — see notes on other categories). Helmet must be presented at tech inspection; an AMEC sticker is affixed to the left side once approved.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the current rulebook.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "2.1.3.7" },
      confidence: "high",
      notes:
        "Confirmed real gap for the general driver population: §2.2 Driver Equipment names only the helmet. A 'neck brace' is required only under the narrow 14-17-year-old no-driver's-license exception (§2.1.3.7: 'A SNELL SA2010 or newer full-face helmet, neck brace, safety-approved racing uniform and safety-approved set of racing gloves must be worn') — not modeled as the general rule since it's a minor-specific carve-out, not the base requirement.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "2.1.3.7" },
      confidence: "high",
      notes:
        "Confirmed real gap: no firesuit/driving-suit requirement, standard, or recommendation for the general driver population anywhere in §2.2 or elsewhere. A 'safety-approved racing uniform' is required only under the same narrow 14-17-year-old exception noted for HNR (§2.1.3.7).",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "2.1.3.7" },
      confidence: "high",
      notes:
        "Confirmed real gap: no glove requirement for the general driver population. A 'safety-approved set of racing gloves' is required only under the same narrow 14-17-year-old exception noted for HNR and firesuit (§2.1.3.7).",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the current rulebook, for any driver.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the current rulebook.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "3.5.2.7" },
      confidence: "high",
      notes:
        "No general driver-worn arm restraint requirement. The only mention is class-specific: Super Modified Closed (SMC) cars with the driver's door glass removed must have a Lexan window, window net, OR arm restraint at that door (§3.5.2.7) — a per-class vehicle-equipment choice, not a universal driver PPE mandate, so it isn't modeled as required here.",
    },

    // Car safety gear
    seat: {
      requirement: "conditional",
      condition:
        "A seat rule is stated only for the Stock Sportsman (SS) Class (§3.3.3.3): 'The drivers' seat may be replaced with a racing seat.' That permissive phrasing means the stock/OEM seat is the assumed baseline and a racing seat is an optional upgrade, not a mandate — SS is not caged-and-therefore-certified-seat-required the way belts_harness escalates by class. No other class (SL/SLS/SL4/SLS4, SLM/SLM4, MC, SMC, SMO, AWD — AWD follows SMC rules per §3.6) has any seat-construction or mounting text anywhere in the document, despite several of those classes mandating a roll cage and a 4- or 5-point harness.",
      materialOnlyAccepted: true,
      materialNote:
        "Stock/OEM seat is accepted — even in SS, the one class that addresses seats at all, replacement with a racing seat is optional ('may be replaced'), not required. Rule text (§3.3.3.3): 'The drivers' seat may be replaced with a racing seat. Any seat must be securely attached to either a part of the roll cage or on non-rusted solid factory mounting locations.' That mounting clause applies however the seat is sourced (stock or racing) once a car has a roll cage to mount to — it is not itself a certification requirement.",
      citation: { ...sourceDoc, section: "3.3.3.3" },
      confidence: "high",
      notes:
        "No seat certification standard (SFI/FIA, e.g. SFI 39.1/39.2 or FIA 8855-1999/8862-2009) is cited anywhere in the document — the SS mounting clause implies a fixed attachment to the cage or a non-rusted factory point rather than a slider/rail, but sliders aren't explicitly prohibited. Re-checked against the full 2026 AMEC Ice Racing Rules PDF (rulebooks/amec-ice-racing-rules-2026.pdf): confirmed no seat text exists outside §3.3.3.3, so 'not_addressed' undersold the one real (if narrow) data point AMEC gives — SS drivers get an explicit stock-seat-is-fine, racing-seat-optional answer, while every other class remains a genuine gap.",
    },
    belts_harness: {
      requirement: "conditional",
      condition:
        "Street Legal (SL, SLS, SL4, SLS4) cars may use stock 3-point belts; a competition harness is optional there but if fitted MUST be 2007-SFI-or-newer tagged (§3.1.3.1). Every other class requires a certified competition harness, no stock belts allowed: Street Legal Modified and Stock Sportsman and Modified Class require a minimum 4-point harness (§3.2.2.6, §3.3.3.4, §3.4.2.3); Super Modified Closed and Super Modified Open require a minimum 5-point harness (§3.5.2.8, §3.7.2.5); AWD follows SMC rules (§3.6). All competition harnesses across every class must be '2007 SFI or newer tagged.'",
      materialOnlyAccepted: true,
      materialNote: "Stock 3-point belts accepted only in the Street Legal (SL/SLS/SL4/SLS4) classes; every other class requires a certified harness.",
      acceptedStandards: [
        { standardId: "sfi-16.1", note: "Rule cites only '2007 SFI or newer tagged harness' generically, without a slash-level — all three current SFI harness specs offered so users can match their tag." },
        { standardId: "sfi-16.5", note: "Rule cites only '2007 SFI or newer tagged harness' generically, without a slash-level — all three current SFI harness specs offered so users can match their tag." },
        { standardId: "sfi-16.6", note: "Rule cites only '2007 SFI or newer tagged harness' generically, without a slash-level — all three current SFI harness specs offered so users can match their tag." },
      ],
      citation: { ...sourceDoc, section: "3.1.3.1" },
      confidence: "high",
      notes:
        "'2007 SFI or newer tagged' is a fixed manufacture-date cutoff repeated in every class's harness rule, not a rolling expiration window — the document states no separate expiration/re-certification interval, so acceptance here is modeled without an expiresOn/validityYearsFromLabel. No FIA harness standard is mentioned anywhere.",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "Applies only within the Super Modified Closed (SMC) Class (§3.5.2.7); AWD Class cars must otherwise comply with all SMC Class rules (§3.6), so this reaches AWD too. Not a standing requirement — it triggers only if the driver's door glass is removed (an SMC/AWD car that keeps its door glass has no window-net/Lexan/arm-restraint obligation at all under this clause). Once triggered, exactly one of THREE alternatives is required at the driver's door: a Lexan window, a window net, OR an arm restraint — and the rule text restricts the arm-restraint option to 'open top cars' only, so a closed-roof SMC/AWD car with its door glass removed may choose only between a Lexan window or a window net, while an open-top SMC/AWD car with its door glass removed may choose any of the three. Not addressed for Street Legal (SL/SLS/SL4/SLS4), Street Legal Modified (SLM/SLM4), Stock Sportsman (SS), Modified Class (MC), or Super Modified Open (SMO) — a full-document search found this single SMC clause (§3.5.2.7) as the only window-net mention anywhere in the rulebook.",
      materialOnlyAccepted: true,
      materialNote:
        "Rule text (§3.5.2.7) just says 'window net' generically alongside the Lexan-window and arm-restraint alternatives — no SFI 27.1 / FIA 8863-2015 certification tag or other spec is cited for the net itself, so a plain net satisfies this option.",
      citation: { ...sourceDoc, section: "3.5.2.7" },
      confidence: "high",
      notes:
        "Deliberately NOT modeled with satisfiedByAlternative to arm_restraint, unlike the clean bidirectional either/or at bodies like PHA (src/data/bodies/pha.ts). This is a genuine 3-way, class-and-condition-scoped choice that breaks the simple bidirectional pattern in three ways: (1) there's a third alternative — a Lexan window — that isn't a category this app tracks at all, so a driver satisfying the rule with Lexan wouldn't have a qualifying entry under window_net OR arm_restraint; (2) the arm-restraint leg is narrower than the window-net leg — arm restraint only qualifies on 'open top cars,' while a Lexan window or window net qualifies on any SMC/AWD car with its door glass removed — so the two categories aren't symmetrically interchangeable; (3) the whole choice is itself conditional on the driver having removed their door glass in the first place, unlike PHA's unconditional closed-cockpit framing. arm_restraint's existing entry in this file (marked not_addressed, since this SMC-only vehicle-equipment choice isn't a universal driver PPE mandate) and this window_net entry each document the real mechanic in full independently rather than cross-referencing.",
    },

    fire_extinguisher: {
      requirement: "conditional",
      condition:
        "Mandatory in every class except Street Legal (SL, SLS, SL4, SLS4), where installation is merely allowed, not required (§2.4.12, §3.1.2.4). Confirmed mandatory in Street Legal Modified (§3.2.2.5), Stock Sportsman (§3.3.3.6), Modified Class (§3.4.2.4), Super Modified Closed (§3.5.2.3), and Super Modified Open (§3.7.2.4); AWD follows SMC rules (§3.6). Per §2.4.12, a fire suppression system may be installed as an alternative to a handheld extinguisher — see fire_suppression category.",
      fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2.5 }],
      citation: { ...sourceDoc, section: "2.4.12" },
      confidence: "high",
      notes:
        "Rule text (§2.4.12): 'Each must be at least a 2½ lb. dry-type, Halogenated, or Clean Agent extinguisher mounted in a metal fire extinguisher bracket or holder with a steel strap and latch,' fully charged and within reach of the driver. Only a weight minimum is given — no UL B:C rating is specified in the rulebook.",
    },
    fire_suppression: {
      requirement: "conditional",
      condition:
        "Permitted as an alternative to a handheld fire extinguisher in every class except Street Legal, per §2.4.12: 'fire extinguishers in metal brackets or fire suppression systems are required.' Not itself mandatory since fitting a compliant handheld extinguisher instead fully satisfies the rule.",
      citation: { ...sourceDoc, section: "2.4.12" },
      confidence: "high",
      notes: "No certification standard (e.g., SFI 17.1 / FIA 8865) is specified for a fire suppression system if one is used in place of a handheld extinguisher.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition:
        "Fuel tank/cell containment rules are stated for Street Legal Modified (§3.2.2.7), Modified Class (§3.4.1.10), Super Modified Closed (§3.5.2.5), and Super Modified Open (§3.7.1.7); AWD follows SMC rules (§3.6). Not addressed for Street Legal (SL/SLS/SL4/SLS4) or Stock Sportsman (SS) classes.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
      materialNote:
        "Stock/OEM fuel tank accepted in every class — an aftermarket racing fuel cell is optional, not required, even where containment is regulated. Rule text (§3.2.2.7): 'A racing fuel cell may be added or used to replace the factory fuel tank. All fuel tanks or cells must be in a safe position and firmly mounted. Fuel tanks and filler necks must be completely enclosed, and behind a firmly mounted metal partition away from the driver.'",
      citation: { ...sourceDoc, section: "3.2.2.7" },
      confidence: "high",
      notes:
        "No certification standard (SFI 28.1 / FIA FT3 etc.) is cited anywhere for the fuel tank or an optional fuel cell — since AMEC doesn't name a specific spec, any registered fuel-cell homologation is treated as acceptable for a driver who does choose to run a certified cell.",
    },
    window_breaker: {
      requirement: "required",
      citation: { ...sourceDoc, section: "2.4.7" },
      confidence: "high",
      notes:
        "Rule text: 'All cars must have a window breaker with seat belt cutter firmly attached or enclosed within reach of the driver' (§2.4.7, general Minimum Car Requirements — applies to every class).",
    },
    kill_switch: {
      requirement: "recommended",
      citation: { ...sourceDoc, section: "2.4.10" },
      confidence: "high",
      notes:
        "Rule text: 'Installation of a kill switch is recommended' (§2.4.10). No labeling or accessibility spec is stated. Appears alongside general battery-mounting/containment requirements in the same section, not as its own mandate.",
    },
    tow_hook: {
      requirement: "recommended",
      citation: { ...sourceDoc, section: "2.4.9" },
      confidence: "high",
      notes:
        "Rule text: 'Marked (e.g., arrow or contrasting paint) tow hooks are recommended (including retractable or recessed types)' (§2.4.9). Marking convention recommended, not mandated; AMEC and tow vehicle operators disclaim responsibility for towing damage regardless of whether tow hooks are fitted.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the current rulebook. Only tow hooks (§2.4.9, recommended) are addressed; no requirement to carry a tow rope/strap.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the current rulebook.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "5.4" },
      confidence: "high",
      notes:
        "Not mentioned anywhere in the current rulebook. Pit equipment requirements (§5.4) cover spill pillows and an empty bucket/shovel for fluid cleanup only — no first aid kit is mandated for drivers or teams.",
    },
  },
  classOverrides: {
    "street-legal": {
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "Stock 3-point belts accepted; an optional competition harness, if fitted, must be 2007-SFI-or-newer tagged.",
        acceptedStandards: harnessAcceptedStandards,
        citation: { ...sourceDoc, section: "3.1.3.1" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "recommended",
        fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2.5 }],
        citation: { ...sourceDoc, section: "2.4.12, 3.1.2.4" },
        confidence: "high",
        notes: "Installation is allowed but not required for Street Legal cars, unlike every other AMEC class. If fitted, must meet the same 2½ lb minimum as the mandatory classes.",
      },
      fire_suppression: {
        requirement: "recommended",
        citation: { ...sourceDoc, section: "2.4.12" },
        confidence: "high",
        notes: "May be installed instead of a handheld extinguisher, but neither is mandatory for Street Legal cars.",
      },
      fuel_cell: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "2.2" },
        confidence: "high",
        notes: "No fuel tank/cell containment rule is stated for Street Legal (SL/SLS/SL4/SLS4) — a stock/OEM tank is assumed.",
      },
      seat: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "2.2" },
        confidence: "high",
        notes: "No seat-construction or mounting text applies to this class.",
      },
      window_net: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "3.5.2.7" },
        confidence: "high",
        notes: "AMEC's only window-net clause (§3.5.2.7) is scoped to the Super Modified Closed class (and AWD, which follows SMC rules) — it doesn't reach Street Legal.",
      },
    },
    "street-legal-modified": {
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: false,
        materialNote: "Minimum 4-point harness required, no stock belts — must be 2007-SFI-or-newer tagged.",
        acceptedStandards: harnessAcceptedStandards,
        citation: { ...sourceDoc, section: "3.2.2.6" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "required",
        fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2.5 }],
        citation: { ...sourceDoc, section: "3.2.2.5" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "conditional",
        condition: "May be installed instead of a handheld extinguisher; not itself mandatory since a compliant handheld extinguisher fully satisfies the rule.",
        citation: { ...sourceDoc, section: "2.4.12" },
        confidence: "high",
      },
      fuel_cell: {
        requirement: "conditional",
        condition: "Fuel tank/cell containment rules apply to this class.",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
        materialNote:
          "Stock/OEM fuel tank accepted — an aftermarket racing fuel cell is optional, not required. Rule text: 'A racing fuel cell may be added or used to replace the factory fuel tank. All fuel tanks or cells must be in a safe position and firmly mounted. Fuel tanks and filler necks must be completely enclosed, and behind a firmly mounted metal partition away from the driver.'",
        citation: { ...sourceDoc, section: "3.2.2.7" },
        confidence: "high",
      },
      seat: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "2.2" },
        confidence: "high",
        notes: "No seat-construction or mounting text applies to this class.",
      },
      window_net: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "3.5.2.7" },
        confidence: "high",
        notes: "AMEC's only window-net clause (§3.5.2.7) is scoped to the Super Modified Closed class (and AWD, which follows SMC rules) — it doesn't reach Street Legal Modified.",
      },
    },
    "stock-sportsman": {
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: false,
        materialNote: "Minimum 4-point harness required, no stock belts — must be 2007-SFI-or-newer tagged.",
        acceptedStandards: harnessAcceptedStandards,
        citation: { ...sourceDoc, section: "3.3.3.4" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "required",
        fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2.5 }],
        citation: { ...sourceDoc, section: "3.3.3.6" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "conditional",
        condition: "May be installed instead of a handheld extinguisher; not itself mandatory since a compliant handheld extinguisher fully satisfies the rule.",
        citation: { ...sourceDoc, section: "2.4.12" },
        confidence: "high",
      },
      seat: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote:
          "Rule text (§3.3.3.3): 'The drivers' seat may be replaced with a racing seat. Any seat must be securely attached to either a part of the roll cage or on non-rusted solid factory mounting locations.' The permissive 'may be replaced' phrasing means the stock/OEM seat is the assumed baseline and a racing seat is an optional upgrade, not a mandate.",
        citation: { ...sourceDoc, section: "3.3.3.3" },
        confidence: "high",
        notes: "No seat certification standard (SFI/FIA) is cited — the mounting clause applies however the seat is sourced, once the car has a roll cage to mount to.",
      },
      fuel_cell: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "2.2" },
        confidence: "high",
        notes: "No fuel tank/cell containment rule is stated for Stock Sportsman — a stock/OEM tank is assumed.",
      },
      window_net: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "3.5.2.7" },
        confidence: "high",
        notes: "AMEC's only window-net clause (§3.5.2.7) is scoped to the Super Modified Closed class (and AWD, which follows SMC rules) — it doesn't reach Stock Sportsman.",
      },
    },
    modified: {
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: false,
        materialNote: "Minimum 4-point harness required, no stock belts — must be 2007-SFI-or-newer tagged.",
        acceptedStandards: harnessAcceptedStandards,
        citation: { ...sourceDoc, section: "3.4.2.3" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "required",
        fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2.5 }],
        citation: { ...sourceDoc, section: "3.4.2.4" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "conditional",
        condition: "May be installed instead of a handheld extinguisher; not itself mandatory since a compliant handheld extinguisher fully satisfies the rule.",
        citation: { ...sourceDoc, section: "2.4.12" },
        confidence: "high",
      },
      fuel_cell: {
        requirement: "conditional",
        condition: "Fuel tank/cell containment rules apply to this class.",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
        materialNote:
          "Stock/OEM fuel tank accepted — an aftermarket racing fuel cell is optional, not required. Rule text: 'A racing fuel cell may be added or used to replace the factory fuel tank. All fuel tanks or cells must be in a safe position and firmly mounted. Fuel tanks and filler necks must be completely enclosed, and behind a firmly mounted metal partition away from the driver.'",
        citation: { ...sourceDoc, section: "3.4.1.10" },
        confidence: "high",
      },
      seat: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "2.2" },
        confidence: "high",
        notes: "No seat-construction or mounting text applies to this class.",
      },
      window_net: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "3.5.2.7" },
        confidence: "high",
        notes: "AMEC's only window-net clause (§3.5.2.7) is scoped to the Super Modified Closed class (and AWD, which follows SMC rules) — it doesn't reach the Modified Class.",
      },
    },
    ...smcClassOverrides("super-modified-closed"),
    "super-modified-open": {
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: false,
        materialNote: "Minimum 5-point harness required, no stock belts — must be 2007-SFI-or-newer tagged.",
        acceptedStandards: harnessAcceptedStandards,
        citation: { ...sourceDoc, section: "3.7.2.5" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "required",
        fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2.5 }],
        citation: { ...sourceDoc, section: "3.7.2.4" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "conditional",
        condition: "May be installed instead of a handheld extinguisher; not itself mandatory since a compliant handheld extinguisher fully satisfies the rule.",
        citation: { ...sourceDoc, section: "2.4.12" },
        confidence: "high",
      },
      fuel_cell: {
        requirement: "conditional",
        condition: "Fuel tank/cell containment rules apply to this class.",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
        materialNote:
          "Stock/OEM fuel tank accepted — an aftermarket racing fuel cell is optional, not required. Rule text: 'A racing fuel cell may be added or used to replace the factory fuel tank. All fuel tanks or cells must be in a safe position and firmly mounted. Fuel tanks and filler necks must be completely enclosed, and behind a firmly mounted metal partition away from the driver.'",
        citation: { ...sourceDoc, section: "3.7.1.7" },
        confidence: "high",
      },
      seat: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "2.2" },
        confidence: "high",
        notes: "No seat-construction or mounting text applies to this class.",
      },
      window_net: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "3.5.2.7" },
        confidence: "high",
        notes: "AMEC's only window-net clause (§3.5.2.7) is scoped to the Super Modified Closed class (and AWD, which follows SMC rules) — Super Modified Open, despite the similar name, is not included.",
      },
    },
    ...smcClassOverrides("awd"),
  },
};

/**
 * Super Modified Closed's category overrides, reused verbatim for AWD — AMEC §3.6 states AWD
 * cars must comply with all SMC Class rules, so this encodes that inheritance directly in code
 * instead of duplicating the same five rules under a second key.
 */
function smcClassOverrides(key: "super-modified-closed" | "awd"): Record<string, Partial<Record<EquipmentCategory, CategoryRule>>> {
  return {
    [key]: {
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: false,
        materialNote: "Minimum 5-point harness required, no stock belts — must be 2007-SFI-or-newer tagged.",
        acceptedStandards: harnessAcceptedStandards,
        citation: { ...sourceDoc, section: "3.5.2.8" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "required",
        fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2.5 }],
        citation: { ...sourceDoc, section: "3.5.2.3" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "conditional",
        condition: "May be installed instead of a handheld extinguisher; not itself mandatory since a compliant handheld extinguisher fully satisfies the rule.",
        citation: { ...sourceDoc, section: "2.4.12" },
        confidence: "high",
      },
      fuel_cell: {
        requirement: "conditional",
        condition: "Fuel tank/cell containment rules apply to this class.",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
        materialNote:
          "Stock/OEM fuel tank accepted — an aftermarket racing fuel cell is optional, not required. Rule text: 'A racing fuel cell may be added or used to replace the factory fuel tank. All fuel tanks or cells must be in a safe position and firmly mounted. Fuel tanks and filler necks must be completely enclosed, and behind a firmly mounted metal partition away from the driver.'",
        citation: { ...sourceDoc, section: "3.5.2.5" },
        confidence: "high",
      },
      seat: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "2.2" },
        confidence: "high",
        notes: "No seat-construction or mounting text applies to this class.",
      },
      window_net: {
        requirement: "conditional",
        condition:
          "Triggers only if the driver's door glass is removed — an SMC/AWD car that keeps its door glass has no window-net/Lexan/arm-restraint obligation at all. Once triggered, exactly one of THREE alternatives is required at the driver's door: a Lexan window, a window net, OR an arm restraint — the arm-restraint option is restricted to 'open top cars,' so a closed-roof car with its door glass removed may choose only between a Lexan window or a window net.",
        materialOnlyAccepted: true,
        materialNote:
          "Rule text (§3.5.2.7) just says 'window net' generically alongside the Lexan-window and arm-restraint alternatives — no SFI 27.1 / FIA 8863-2015 certification tag or other spec is cited for the net itself, so a plain net satisfies this option.",
        citation: { ...sourceDoc, section: "3.5.2.7" },
        confidence: "high",
        notes:
          "Deliberately NOT modeled with satisfiedByAlternative to arm_restraint (see src/data/bodies/pha.ts for that pattern). This is a genuine 3-way choice that breaks the simple bidirectional pattern: a Lexan window isn't a category this app tracks, and the arm-restraint leg is narrower (open-top cars only) than the window-net leg (any car with its door glass removed) — the two aren't symmetrically interchangeable.",
      },
    },
  };
}

export const amecRulesets: Ruleset[] = [iceRacing];

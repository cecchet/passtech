import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

// "NEQ" = Northeast Chapter of the Audi Club of North America (ACNA), historically named for its
// "North East Quattro" roots and still branded "NEQ" (neqclub.org). It runs non-competitive HPDE
// (High Performance Driver Education / "high speed education") days at Lime Rock Park, Watkins
// Glen, NJMP, and Mont Tremblant — open to all makes, not just Audis. Confirmed via neqclub.org
// and its own downloadable tech-inspection paperwork (see sourceDocuments).
const techForms = {
  title: "NEQ Pre-Event Tech Inspection / Event Tech Confirmation / Responsibility Statement",
  version: "Revision 2026.1",
  url: "https://www.neqclub.org/tech-forms/",
};

const helmetsPage = {
  title: "NEQ — Helmets",
  url: "https://www.neqclub.org/helmets/",
};

const clothingPage = {
  title: "NEQ — Clothing",
  url: "https://www.neqclub.org/clothing/",
};

const openTopPage = {
  title: "NEQ — Open Top Cars / Convertibles",
  url: "https://www.neqclub.org/open-top-cars/",
};

const vehicleRequirementsPage = {
  title: "NEQ — Vehicle Requirements",
  url: "https://www.neqclub.org/vehicle-requirements/",
};

// NEQ does not run tiered run groups with different equipment (their "non-solo" vs "solo" split is
// about driving privileges/experience, confirmed via the vehicle-requirements page, not gear) — a
// single ruleset covers all participants. There IS one genuine, well-cited car-category split,
// though: per the Open Top Cars page (quoting ACNA Event Guidelines §2.13.2), a convertible/
// open-top car WITHOUT factory-installed rollover protection must run a mandatory four-point
// harness with ASM (anti-submarining) technology — no factory 3-point belt option, unlike every
// other car in this program (closed cars, and convertibles WITH factory rollover protection, both
// of which the base belts_harness rule below already covers). classOverrides below models that
// one category for that one car-type class; everything else (helmet, firesuit, shoes, seat, etc.)
// is confirmed identical across all car types and isn't overridden. The page also requires a
// four-point roll cage and enforces the "broomstick rule" clearance for this car type — modeled
// below as the class's rollover_protection override, alongside the base rule's general "ROLL BAR
// (If Present)" clearance check that applies to every other car. arm_restraint's existing
// conditional rule (top-down driving) already applies identically to both convertible sub-types
// per the source text ("recommended in any case"), so it isn't part of this class's overrides.
const hpde: Ruleset = {
  id: "neq-hpde",
  bodyId: "neq",
  bodyName: "NEQ (Audi Club North America — Northeast Chapter)",
  disciplineName: "HPDE / Driver Education (High-Speed Events)",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [techForms, helmetsPage, clothingPage, openTopPage, vehicleRequirementsPage],
  classes: [
    { id: "open-top-no-protection", label: "Open-Top Car / Convertible WITHOUT Factory Rollover Protection" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true, note: "NEQ: 'Your helmet MUST say on it: SA2015 or SA2020.' No stated expiration beyond generation." },
        { standardId: "snell-sa2020", noExpiration: true },
      ],
      citation: { ...helmetsPage, section: "Helmet certification requirements" },
      confidence: "high",
      notes:
        "M-rated (motorcycle) Snell helmets are explicitly NOT accepted, even though they are Snell-certified: 'The primary difference between SA (Special Application) and M (Motorcycle) helmets are a Nomex (fire resistant) lining... M rated helmets are not allowed.' Not required at NEQ's separate winter (frozen-lake) driving schools. Full-face helmets (or effective eye protection with an open-face helmet) are only 'strongly recommended,' not mandated, for open-top cars/convertibles driven with the top down (see Open Top Cars page) — not modeled as fullFaceRequirement since it isn't stated as compulsory.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from NEQ's public materials, just not yet re-checked.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes: "No HANS/HNR requirement or mention found anywhere across NEQ's tech forms, helmets page, clothing page, or open-top-cars page.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "'At all driver education events, long sleeved cotton shirts and pants must be worn for safety reasons.' Plain natural-fiber clothing, not a certified racing suit — no SFI/FIA-rated suit is required or even offered as an alternative anywhere in NEQ's materials.",
      citation: { ...clothingPage, section: "Clothing requirements" },
      confidence: "high",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...clothingPage },
      confidence: "high",
      notes: "Not mentioned in NEQ's clothing page, tech forms, or anywhere else reviewed.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "'Light weight, smooth-soled footwear with socks is also required.' Sneakers are fine unless soles extend beyond the sides of the feet (reduces pedal feel). 'Open shoes will not be allowed.' The onsite Event Tech Confirmation form simply checks for 'closed toe shoes' — no fire-resistance material or certification requirement of any kind.",
      citation: { ...clothingPage, section: "Clothing requirements" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "'Light weight, smooth-soled footwear with socks is also required.' Just plain socks worn with shoes — no fire-resistance material or certification requirement.",
      citation: { ...clothingPage, section: "Clothing requirements" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...clothingPage },
      confidence: "high",
      notes: "Not mentioned; consistent with no certified-suit requirement at this org (no suit rating exists that would trigger a fire-resistant-underwear condition).",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Applies to open-top cars/convertibles driven with the soft top down. NEQ's own wording is internally ambiguous — 'SFI and/or FIA approved arm restraint system(s) must be used and is recommended in any case' — but is treated here as a real (if loosely drafted) requirement for open-top/top-down driving rather than a mere suggestion. Closed cars, and open-top cars with the top up and windows raised, are not addressed by this rule.",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Must be SFI and/or FIA approved per the Open Top Cars page — no specific slash-level or FIA spec number is cited.",
      citation: { ...openTopPage, section: "Open Top Cars / Convertibles" },
      confidence: "medium",
      notes:
        "Confidence is medium rather than high specifically because of the source's self-contradictory phrasing ('must be used and is recommended'). Open-top cars without factory rollover protection also face separate roll-cage/harness vehicle requirements (four-point cage, four-point ASM harness, 'broomstick rule' clearance) — out of scope for this app's driver-PPE categories.",
    },

    // Car safety gear
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "Stock/OEM seat accepted — no certification is required or even offered anywhere in NEQ's materials. Pre-Event Tech Inspection checklist: 'SEAT & RESTRAINTS: Factory three-point required unless harnesses installed and bolted to factory points. Passenger seat & belts must be of similar design as the driver's.' The onsite Event Tech Confirmation checklist reduces this to 'BELTS & SEATS: Equivalent for driver and passenger.' Neither line addresses seat construction or certification — only that the driver's and passenger's seat/belt setup must match each other.",
      citation: { ...techForms, section: "Pre-Event Tech Inspection checklist — SEAT & RESTRAINTS; Event Tech Confirmation — BELTS & SEATS" },
      confidence: "high",
      notes:
        "Checked every source page cited in this file (tech forms, Vehicle Requirements, Open Top Cars, Clothing, Helmets) — none mandate a certified racing seat, not even for the highest-risk scenario this program addresses: a convertible with no factory rollover protection running an aftermarket four-point roll cage for high-speed events. The Open Top Cars page's equipment rule for that exact case is 'Equivalent equipment (harness and seat) is required for driver and passenger' — read here as a driver/passenger-parity rule (whatever seat you run, the passenger's must match), not a seat-certification mandate; no SFI/FIA seat spec (e.g. 39.1/39.2, 8855/8862) is named anywhere in NEQ's materials. This is a member's-own-car HPDE program where most cars aren't caged, so a stock/OEM seat being the norm for the large majority of participants is consistent with everything checked. acceptedStandards (GENERIC_SEAT_STANDARDS) is offered for the minority who do run a certified racing seat, even though NEQ itself never requires or names a spec. Not addressed anywhere: seat sliders/rails vs. fixed mount, or any run-group-based seat tiering (NEQ's run groups differ only in driving privileges/experience per the Vehicle Requirements page, not equipment — see the ruleset-level comment above).",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [
        {
          standardId: "sfi-16.1",
          note: "NEQ cites 'a current SFI or FIA certification' generically without a spec number or slash-level; all currently-registered SFI/FIA belts_harness standards are listed here to match.",
        },
        { standardId: "sfi-16.5" },
        { standardId: "sfi-16.6" },
        { standardId: "fia-8853-2016" },
        { standardId: "fia-8853-98" },
      ],
      materialNote:
        "Vehicle Requirements page: 'Required for driver and passenger, both must be fully functional.' Factory belts are accepted as-is. 'Non-factory restraint belts must carry a current SFI or FIA certification' and 'may not be used beyond the expiration date printed on the belt' — no fixed validity window (e.g. a stated number of years) is given, so this defers to whatever date is printed on the belt's own label rather than a computed expiration. Aftermarket belts must also be installed per the manufacturer's instructions, and the passenger's belts must match the driver's (equal restraints). The Pre-Event Tech Inspection checklist separately states: 'Factory three-point required unless harnesses installed and bolted to factory points.'",
      citation: { ...vehicleRequirementsPage, section: "Lap and Shoulder Belts" },
      confidence: "high",
      notes:
        "Open-top cars/convertibles without factory rollover protection face a stricter, separate requirement per the Open Top Cars page: 'Minimum four-point harness with ASM (anti-submarining) technology must be used,' alongside the four-point roll cage and 'broomstick rule' clearance (neither modeled — this app doesn't yet track a rollcage category). See the 'open-top-no-protection' classOverrides entry below, which replaces this base rule (factory 3-point OK) with that mandatory certified 4-point ASM harness for that car type.",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes:
        "Full document search found no mention of a window net anywhere in NEQ's materials — checked the 3-page Pre-Event Tech Inspection / Event Tech Confirmation / Responsibility Statement PDF (including its SEAT & RESTRAINTS, ROLL BAR, and GLASS & MIRRORS lines), the Vehicle Requirements page, the Open Top Cars / Convertibles page, and the Clothing page. The Open Top Cars page requires an SFI/FIA arm restraint for open-top cars with the top down (see arm_restraint) but never offers a window net as an alternative or otherwise, so satisfiedByAlternative is intentionally not set here or on arm_restraint — NEQ simply doesn't address window nets at all, unlike bodies (e.g. PHA) that frame the two as interchangeable.",
    },
    fire_extinguisher: {
      requirement: "recommended",
      fireExtinguisherMounting: { requireMetalBracket: true },
      citation: { ...techForms, section: "Pre-Event Tech Inspection checklist — FIRE EXTINGUISHER" },
      confidence: "high",
      notes:
        "Checklist states in full: 'FIRE EXTINGUISHER: Recommended, not required. If present must be metal to metal mounted.' No size, UL rating, or quantity is specified anywhere in NEQ's materials, so fireExtinguisherOptions is left unset rather than guessed.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes:
        "No mention of a fire suppression system anywhere across the tech forms, Vehicle Requirements page, or Open Top Cars page — consistent with a run-what-you-brung HPDE program where the only extinguisher provision is a recommended handheld unit (see fire_extinguisher).",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...techForms, section: "Pre-Event Tech Inspection checklist — FUEL SYSTEM" },
      confidence: "high",
      notes:
        "The checklist's 'FUEL SYSTEM' line only covers leak/condition inspection of the stock fuel system ('No leaks at injectors, seals, lines or fittings. No pinching or abrasion of lines.') — it does not mandate a certified fuel cell or otherwise address stock tank vs. cell. Not mentioned on the Vehicle Requirements or Open Top Cars pages either, consistent with a street-car-based HPDE program where the OEM fuel tank is implicitly acceptable.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes:
        "No window net, window breaker, or seatbelt cutter tool requirement found anywhere in NEQ's tech forms, Vehicle Requirements page, or Open Top Cars page. The checklist's 'GLASS & MIRRORS' line only covers crack/mirror condition and requires the driver's and front passenger's windows to roll down.",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes:
        "No kill switch or master battery cutoff requirement found anywhere in NEQ's materials — the checklist's 'BATTERY' line only covers mounting/venting/cable condition, not a driver- or corner-worker-accessible cutoff switch.",
    },
    tow_hook: {
      requirement: "conditional",
      condition:
        "The onsite Event Tech Confirmation checklist lists 'TOW HOOK: Installed if available' — read here as: if the car has a (often removable, factory-supplied) tow hook, it must be installed/attached rather than left in the trunk, but a car with no factory tow-hook provision isn't required to add an aftermarket one.",
      citation: { ...techForms, section: "Event Tech Confirmation — TOW HOOK" },
      confidence: "medium",
      notes:
        "Confidence is medium because the four-word checklist phrase 'Installed if available' is terse and not elaborated on elsewhere in NEQ's materials — the reading above matches common HPDE tech-inspection convention but isn't spelled out.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes: "No tow rope/strap requirement found anywhere in NEQ's tech forms, Vehicle Requirements page, or Open Top Cars page.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes: "No warning/emergency triangle requirement found anywhere in NEQ's materials.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes: "No first aid kit requirement found anywhere in NEQ's materials.",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes:
        "No hood pin, hood fastener, or positive hood-latching requirement found anywhere across the 3-page Pre-Event Tech Inspection / Event Tech Confirmation / Responsibility Statement PDF (full-text search), the Vehicle Requirements page, or the Open Top Cars / Convertibles page.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...techForms },
      confidence: "high",
      notes:
        "No spill kit, spill containment, or absorbent-material requirement found anywhere across the tech forms PDF, the Vehicle Requirements page, or the Open Top Cars / Convertibles page.",
    },
    rollover_protection: {
      requirement: "conditional",
      condition:
        "NEQ's Pre-Event Tech Inspection checklist regulates a roll bar only 'if present' — never mandatory for closed cars or convertibles with factory rollover protection. Open-top cars/convertibles WITHOUT factory rollover protection instead have a mandatory four-point roll cage requirement — see the open-top-no-protection class override.",
      citation: { ...techForms, section: "Pre-Event Tech Inspection — ROLL BAR (If Present)" },
      confidence: "high",
      notes:
        "Where a roll bar is present: 'A straight edge from the windshield to the roll bar must have at least two inches between it and the helmet of both driver and passenger in their normal sitting position' — no material/tubing/mounting spec is given, only this clearance check.",
    },
  },
  classOverrides: {
    "open-top-no-protection": {
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: false,
        acceptedStandards: [
          {
            standardId: "sfi-16.1",
            note: "NEQ cites 'a current SFI or FIA certification' generically without a spec number or slash-level (same generic phrasing as the base belts_harness rule); all currently-registered SFI/FIA belts_harness standards are listed here to match.",
          },
          { standardId: "sfi-16.5" },
          { standardId: "sfi-16.6" },
          { standardId: "fia-8853-2016" },
          { standardId: "fia-8853-98" },
        ],
        materialNote:
          "Open Top Cars page (quoting ACNA Event Guidelines §2.13.2): 'Minimum four-point harness with ASM (anti-submarining) technology must be used. Equivalent equipment (harness and seat) is required for driver and passenger.' Unlike the base/general rule, a factory three-point belt does NOT satisfy this — a certified 4-point-or-greater harness with anti-submarining strap geometry is mandatory for any convertible/open-top car lacking factory rollover protection.",
        citation: { ...openTopPage, section: "2.13.2 Convertibles — minimum requirements for convertibles without factory rollover protection" },
        confidence: "high",
        notes:
          "This is one of two confirmed structural equipment differences by car type at NEQ (see the ruleset-level comment above and rollover_protection below) — everything else (helmet, firesuit, shoes, seat spec, fire extinguisher, etc.) is unchanged for this class. 'ASM (anti-submarining) technology' isn't itself a distinguishable attribute of the SFI/FIA standardIds listed above (this app doesn't track harness geometry/point-count per standard), so acceptedStandards here mirrors the base rule's generic 'current SFI or FIA' list rather than narrowing it.",
      },
      rollover_protection: {
        requirement: "required",
        rolloverProtectionRequiresFullCage: true,
        citation: { ...openTopPage, section: "2.13.2 Convertibles — minimum requirements for convertibles without factory rollover protection" },
        confidence: "medium",
        notes:
          "Open Top Cars page (quoting ACNA Event Guidelines §2.13.2) requires 'a four-point roll cage consisting of a main roll bar behind the front seats with two rear-triangulated braces,' for any convertible/open-top car lacking factory rollover protection, and enforces a 'broomstick rule' helmet-clearance fitment check (conceptually the same kind of straight-edge clearance the base ruleset's 'ROLL BAR (If Present)' rule checks for other cars, per the tech-inspection form). No tubing size, material, mounting-point count beyond '4-point,' or padding standard/thickness is given anywhere in this source (confirmed via a direct re-check for padding specifically) — confidence is medium since the construction detail is thinner here than for bodies with a dedicated roll-cage appendix.",
      },
    },
  },
};

export const neqRulesets: Ruleset[] = [hpde];

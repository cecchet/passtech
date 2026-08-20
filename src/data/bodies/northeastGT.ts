import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_FUEL_CELL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

// ============================================================================================
// IMPORTANT SCOPE FLAG — READ BEFORE INTEGRATING
// This body file was researched as part of a batch of three assumed-HPDE (non-competitive) New
// England track day organizers. Research shows Northeast GT (NEGT, "Real Clean Racing",
// northeast-gt.com) is NOT a non-competitive HPDE/lapping club — it is a genuine competitive
// wheel-to-wheel racing series (the "NEGT Cup": Time Attack, Sprint Racing, and multi-hour
// Endurance racing), gated by holding a competition license or completing NEGT's own "GT Race
// School." Cars must be "fully prepared for wheel-to-wheel racing" (roll cage, fire system,
// master switch, in-date harnesses, racing seat, window net). MassTuning (see masstuning.ts, a
// separate org in this same batch) runs the actual non-competitive HPDE practice/lapping days at
// the same tracks and is explicitly where NEGT drivers go to "meet, practice, and test" outside
// of race weekends.
// The equipment rules below are therefore modeled honestly as what NEGT actually requires
// (race-tier gear), not as HPDE-tier gear — flagged here so the integrator can decide whether
// this belongs in an "HPDE" batch at all, or should be relabeled/held for a competitive-racing
// batch instead.
//
// UPDATE (car safety gear research pass): the official rulebook PDF (linked from
// northeast-gt.com/rules-and-forms/, hosted on Google Drive) was successfully fetched and its text
// layer read in full this pass — it is NOT image-based/scanned as previously believed, and turned
// out to be "Northeast GT 2026 Real Clean Rulebook", Version 3.0.0 (February 2026) — a full
// version ahead of the "2.0.0" previously assumed from the site's marketing copy alone. Car safety
// gear (seat, belts/harness, window net, fuel cell, fire extinguisher/suppression, kill switch, tow
// hook, tow rope, emergency triangle, first aid kit, window breaker) below is sourced directly from
// this rulebook (Chapter 6, Section E "Safety (Sprint & Endurance Racing)", plus Section 6C where
// noted) with real section numbers and high confidence. The pre-existing DRIVER gear entries below
// (helmet, balaclava, hnr, firesuit, gloves, shoes, undergarment, arm_restraint) were left untouched
// in this pass and still rely on the weaker `eventListing` marketing-page sourcing described below
// — a follow-up pass re-sourcing those against the now-readable rulebook's own Chapter 7 "Safety
// Gear Requirements" (which has real section numbers for all of them) is recommended.
//
// UPDATE (class-refinement pass): the rulebook's own Chapter 7 "Safety Gear Requirements" is
// itself split into Section A (driver gear for "wheel-to-wheel sessions" — i.e. Sprint &
// Endurance, the NEGT Cup's two race formats, which share one gear list throughout the rulebook)
// and Section B (a separate, materially lighter driver gear list for Time Attack sessions).
// Separately, Chapter 6's own opening line states plainly: "Endurance and sprint race cars shall
// meet all rules in Chapter 6 Section E. All time attack cars shall meet standard HPDE tech." —
// and Section E is itself titled "Safety (Sprint & Endurance Racing)", confirming every car-gear
// rule sourced from it (seat, belts_harness, window_net, fuel_cell, fire_extinguisher,
// fire_suppression, kill_switch, tow_hook — the whole car-gear block below) is explicitly
// Sprint/Endurance-only and does not reach Time Attack cars. This is genuine, well-cited,
// rulebook-native equipment variation by event format, not just a difference in on-track format —
// so a "Time Attack" class with `classOverrides` was added below. Sprint, Endurance, and the
// overall "NEGT Cup" championship branding do NOT differ from each other in equipment (they share
// Chapter 7 Section A and Chapter 6 Section E identically) so no separate class was created for
// them — the base `categories` below (still sourced from `eventListing` for driver gear, per the
// note above) stands in as that shared Sprint/Endurance picture, consistent with how a driver who
// hasn't picked a class sees the general/default rules. See Chapter 7 Section B and the Chapter 6
// intro line for the Time Attack citations used in `classOverrides` below — those two passages
// were read directly from the rulebook this pass (high confidence), unlike the base driver-gear
// entries above which still rely on the weaker `eventListing` source.
// ============================================================================================

const eventListing = {
  title: "Northeast GT — event registration listing, \"Safety Gear\" section",
  url: "https://www.motorsportreg.com/events/northeast-gt-race-1-2-school-thompson-speedway-motorsports-park-725382",
};

const rulebook = {
  title: "Northeast GT 2026 Real Clean Rulebook",
  version: "3.0.0 (February 2026)",
  url: "https://www.northeast-gt.com/rules-and-forms/",
  section: "Chapter 6, Section E — Safety (Sprint & Endurance Racing)",
};

// Shared note for every Time Attack car-gear override below (see the file-level "class-refinement
// pass" comment for the full reasoning) — pulled out once since it's identical across all 8
// car-gear categories sourced from rulebook Chapter 6 Section E.
const TIME_ATTACK_CAR_GEAR_NOTE =
  "NEGT's Chapter 6 opens: 'Endurance and sprint race cars shall meet all rules in Chapter 6 Section E. All time attack cars shall meet standard HPDE tech.' Section E is itself titled 'Safety (Sprint & Endurance Racing)' — every car-safety-gear rule sourced from it in this file's base `categories` (seat, belts_harness, window_net, fuel_cell, fire_extinguisher, fire_suppression, kill_switch, tow_hook) is therefore explicitly scoped to Sprint & Endurance cars only and does not reach Time Attack cars. Time attack cars instead need only 'standard HPDE tech' — a bar this rulebook doesn't itself itemize (it likely defers to the host track's own driver's-ed/time-trial tech requirements, or partner organizer MassTuning's HPDE standard). Modeled as not_addressed rather than guessing at an unstated external standard.";

const raceGear: Ruleset = {
  id: "northeastgt-race",
  bodyId: "northeastgt",
  bodyName: "Northeast GT (NEGT / \"Real Clean Racing\")",
  disciplineName: "Wheel-to-Wheel Racing — Time Attack / Sprint / Endurance (NEGT Cup)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-15",
  sourceDocuments: [eventListing, rulebook],
  // Only Time Attack gets its own class here — see the file-level "class-refinement pass" note
  // above for why Sprint/Endurance/NEGT Cup all share the base `categories` below instead of each
  // needing their own entry.
  classes: [{ id: "time-attack", label: "Time Attack" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true, note: "Event listing: 'SA 2015 or newer helmet (2010 for crew only), FIA or SFI rated.' Crew (e.g. fueling crew) minimum is Snell 2010; this app models the driver, not crew." },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "fia-8859-2015", noExpiration: true, note: "'FIA or SFI rated' offered as an alternative to Snell SA in the same sentence; exact FIA/SFI generations accepted are not itemized by NEGT, so current generations are listed here as a best-effort mapping." },
        { standardId: "fia-8859-2020", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
        { standardId: "sfi-31.1-2015", noExpiration: true },
        { standardId: "sfi-31.1-2020", noExpiration: true },
        { standardId: "sfi-41.1-2015", noExpiration: true },
        { standardId: "sfi-41.1-2020", noExpiration: true },
      ],
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
      notes:
        "SEE FILE-LEVEL NOTE AT TOP: this is a competitive wheel-to-wheel racing org, not an HPDE club. Requirement itself (some current Snell SA / FIA / SFI helmet) is reasonably confident; the exact accepted-standards list is this app's interpretation of a short marketing-page summary, not a verbatim enumeration from the rulebook — spot-check recommended.",
    },
    balaclava: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
      notes:
        "Event listing: 'HNR for drivers and balaclava (required for fueling crew, recommended for all).' Mandatory only for fueling crew (out of scope for this app, which models the driver); recommended, not required, for drivers.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
      notes:
        "Event listing: 'HNR for drivers and balaclava (required for fueling crew, recommended for all).' HNR (head-and-neck restraint) is stated as required for drivers; no specific device brand or spec number is named, so the standard SFI 38.1 / FIA 8858 devices are listed as a best-effort mapping.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.2a-1" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "sfi-3.4-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
      ],
      materialNote: "Event listing just says 'fire suit... FIA or SFI rated' with no specific spec or slash-level named.",
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Event listing just says 'gloves... FIA or SFI rated' with no specific spec or slash-level named.",
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Event listing just says 'shoes... FIA or SFI rated' with no specific spec or slash-level named.",
      citation: { ...eventListing, section: "Safety Gear" },
      confidence: "medium",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...rulebook },
      confidence: "low",
      notes:
        "Not mentioned in the sourcing we could access (the event-listing 'Safety Gear' summary). The full rulebook PDF is image-based and could not be reliably parsed during this research pass, so this may be an incomplete picture rather than a confirmed absence — a wheel-to-wheel series requiring FIA/SFI-rated suits often also addresses fire-resistant underwear as a suit-rating-dependent condition (see e.g. this app's SCCA GCR or NEHA competitive rulesets for the typical pattern). Spot-check the rulebook directly before trusting this as 'not required.'",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...rulebook },
      confidence: "low",
      notes:
        "Not mentioned in the sourcing we could access. NEGT cars are described as fully caged wheel-to-wheel race cars with window nets, which typically substitutes for a driver arm-restraint requirement in closed-cockpit racing — but this substitution is inferred, not confirmed in NEGT's own text. The full rulebook PDF could not be reliably parsed during this research pass; spot-check directly before trusting this as 'not required.'" +
        " CAR-GEAR PASS UPDATE: the rulebook PDF *was* successfully read this pass (see file-level note) and DOES address arm restraints, but only for one specific scenario, left undisturbed here per this pass's scope (driver-gear entries were not to be touched): §6C.12 — 'Convertibles may run with hard top or without. If no hard top is installed, roof nets are required or all drivers must wear arm restraints.' That's a convertible-only, roof-net alternative — a different item and scenario from the closed-cockpit window_net entry added below (§6E.10), so satisfiedByAlternative was NOT set between arm_restraint and window_net in this pass. A follow-up pass should properly populate this arm_restraint entry (conditional/required for convertibles without a hard top) directly from §6C.12.",
    },

    // ============================================================================================
    // Car safety gear — sourced from the rulebook (see file-level UPDATE note), Chapter 6 Section E
    // "Safety (Sprint & Endurance Racing)" unless noted otherwise. Confirmed by direct read of the
    // rulebook's text layer (not the event-listing marketing page used for driver gear above).
    // ============================================================================================
    seat: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "NEGT §6E.11: 'One-piece driver seat with a rigid shell, designed specifically for auto racing is required.' A stock/OEM seat does not satisfy this — NEGT's cars are fully caged wheel-to-wheel race cars (§6E.I roll cage mandatory), and the rulebook's own construction language ('rigid shell, designed specifically for auto racing') rules out an unmodified factory seat outright, independent of any certification label. NEGT itself does not cite a specific SFI (39.1/39.2) or FIA (8855/8862) seat certification number, but a certified racing seat obviously satisfies the rigid-shell/purpose-built bar the rulebook does set — the generic seat standards list is offered on that basis, not because NEGT names those specs directly.",
      citation: { ...rulebook, section: "6E.11, 6E.13" },
      confidence: "high",
      notes:
        "\"The seat must be securely mounted at a minimum of four points at the base. If bolting through the floor, minimum 3\" diameter washers or backing plates are required.\" (6E.11) Separately, a seat that lacks 'a current FIA rating' (or a slider) is recommended (not required) to get a seat back brace if the seat back sits more than 3\" from the cage (6E.13). Cars without a 'halo' seat are also separately recommended (not required) to install an SFI 37.1 / FIA 8863-2013 approved center net (6E.14) — a distinct item not modeled as its own category in this app.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-16.1" },
        { standardId: "sfi-16.5" },
        { standardId: "sfi-16.6" },
        { standardId: "fia-8853-2016" },
        { standardId: "fia-8853-98" },
        { standardId: "fia-8854-98" },
      ],
      materialNote: "Rulebook just says '5, 6, or 7-point racing harnesses with current FIA or SFI rating' with no specific spec/slash-level named; all currently-registered belt/harness standards are listed here as a best-effort mapping.",
      citation: { ...rulebook, section: "6E.9" },
      confidence: "high",
      notes:
        "\"5, 6, or 7-point racing harnesses with current FIA or SFI rating are required to be installed and used per manufacturer specifications. Webbing must not be stretched, cut, frayed, or deteriorated from weather. Sub belts and lap belts must be attached to structural members or bolted through the floor with minimum 2\" diameter backing washers or plates. Shoulder straps shall be properly secured to the harness bar.\" (6E.9)",
    },
    window_net: {
      requirement: "recommended",
      condition: "\"Strongly recommended\" (not required) for cars not running Lexan side windows — i.e. cars with an open driver window per §6C.7.",
      acceptedStandards: [
        { standardId: "sfi-27.1" },
        { standardId: "fia-8863-2015", note: "Rulebook just says 'FIA specification' with no generation named; FIA 8863-2015 is this app's currently-registered FIA window-net standard, listed as a best-effort mapping." },
      ],
      citation: { ...rulebook, section: "6E.10" },
      confidence: "high",
      notes:
        "\"Window nets meeting SFI 27.1 or FIA specification are strongly recommended for cars not running lexan windows and should be installed to manufacturer specification.\" (6E.10) NOT modeled as interchangeable with arm_restraint (no satisfiedByAlternative set either direction): the rulebook's only arm-restraint-as-alternative language is §6C.12, a convertible-only 'roof net OR arm restraints' provision — a different item/scenario from this closed-cockpit window net. See the updated note on the arm_restraint entry above. Also distinct from the separate SFI 37.1/FIA 8863-2013 center net recommended for non-halo seats (6E.14), not modeled as its own category here.",
    },
    fuel_cell: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
      materialNote:
        "Rulebook does not mandate a specific certified fuel-cell standard (SFI 28.1 / FIA FT3 etc. are never cited) — a stock/OEM fuel tank is acceptable as long as it complies with the capacity and firewall rules below. Since NEGT doesn't name a specific spec, any registered fuel-cell homologation is treated as acceptable for a driver who does choose to run a certified cell.",
      citation: { ...rulebook, section: "6E.5-7" },
      confidence: "high",
      notes:
        "\"Fuel cells are allowed if properly installed and maintained, including rollover valves.\" (6E.5) Total fuel holding capacity — tank, additional fuel/surge tanks, fuel cells, etc. combined — must not exceed 25 gallons (6E.6). Firewalls must be present between the fuel cell/fuel tank/fuel filler neck and the driver, and between the engine and driver, with any holes or gaps closed/sealed (6E.7).",
    },
    fire_extinguisher: {
      requirement: "required",
      satisfiedByAlternative: "fire_suppression",
      condition: "Either a hand-held fire extinguisher OR a fire suppression system is required — not both (6E.2).",
      fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 2 }],
      citation: { ...rulebook, section: "6E.2-3" },
      confidence: "high",
      notes:
        "\"Hand-held fire extinguishers must hold a minimum of a 'BC' rating and a minimum of two pounds of solid extinguishant or 2.25 liters of liquid extinguishant. All such bottles shall be securely quick-release mounted. Gauges must be in the green range. If using handheld extinguishers, two installed bottles are recommended.\" (6E.3) No numeric UL B:C class is given (just the 'BC' letter rating), so minBcRating is left unset rather than guessed; the 2.25-liter liquid-extinguishant alternative isn't representable in this schema's lbs-only minWeightLbs field, so only the 2 lb solid-extinguishant minimum is encoded. Two bottles are recommended, not required. Pit lane rules (3F.11.b) separately require endurance teams to keep their own ABC-rated 10 lb extinguisher for fueling — a crew/pit-equipment item, out of scope for this app (which models the car).",
    },
    fire_suppression: {
      requirement: "required",
      satisfiedByAlternative: "fire_extinguisher",
      condition: "Either a fire suppression system OR a hand-held fire extinguisher is required — not both (6E.2).",
      acceptedStandards: [
        { standardId: "fia-technical-list-16" },
        { standardId: "fia-technical-list-52" },
        { standardId: "sfi-17.1" },
      ],
      citation: { ...rulebook, section: "6E.4" },
      confidence: "high",
      notes:
        "\"Fire suppression systems must be FIA technical list #16 or 52, or SFI 17.1, must be installed per manufacturer's instructions and there must be an activation point within easy reach of the driver(s) when seated and belts are tight (ideally a location that can be activated outside the car by safety personnel, if there is not a secondary activation point). Gauges must be in the green range. The traditional 'E' decal shall be used to mark all activation points.\" (6E.4)",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...rulebook, section: "6E.8" },
      confidence: "high",
      notes:
        "\"Master switch required: switch location should be easily located and deactivated by the driver(s), crew member, or safety worker. The switch must isolate the battery from all circuits over 10 amps and must interrupt the ignition circuit. Positive terminals of the switch must be insulated. A 'Master Switch' decal with the universal 'lightning bolt' and the word 'OFF' must be displayed on the exterior as near the switch as possible.\" (6E.8)",
    },
    tow_hook: {
      requirement: "required",
      citation: { ...rulebook, section: "6E.20" },
      confidence: "high",
      notes:
        "\"Tow hooks must be installed securely at the front and rear of the vehicle. No solid metal tow hooks shall protrude beyond either bumper.\" (6E.20)",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...rulebook },
      confidence: "high",
      notes:
        "Not mentioned anywhere in the rulebook (fully read this pass — see file-level note; this is a genuine absence, not a parsing gap). Only front/rear tow hooks are addressed (6E.20), not a tow rope/strap itself.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...rulebook },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook (fully read this pass — see file-level note).",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...rulebook },
      confidence: "high",
      notes:
        "Not mentioned anywhere in the rulebook (fully read this pass — see file-level note). Pit equipment requirements for endurance teams (3F.11) cover oil dry/broom/dustpan/waste can and a fire extinguisher, but no first aid kit.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...rulebook },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook (fully read this pass — see file-level note).",
    },
  },
  classOverrides: {
    "time-attack": {
      // --- Driver gear: rulebook Chapter 7, Section B is a separate, standalone gear list for
      // Time Attack sessions, distinct from Section A (wheel-to-wheel / Sprint & Endurance,
      // which the base `categories` above models). Helmet is not overridden below because
      // Section B states the identical requirement as Section A ("Full-face with visor
      // installed... Rated Snell SA/SAH-2015 or newer, FIA 8858 or FIA 8860") — no real
      // difference to encode. Balaclava is also not overridden: Section B only mentions it (same
      // beard/long-hair condition as Section A) inside the non-production/gutted-interior list
      // below, and even there it's merely "strongly recommended" for everyone else — no change
      // to the base's already-"recommended", non-blocking status worth modeling.
      hnr: {
        requirement: "recommended",
        acceptedStandards: [
          { standardId: "sfi-38.1", noExpiration: true },
          { standardId: "fia-8858-2002", noExpiration: true },
          { standardId: "fia-8858-2010", noExpiration: true },
        ],
        citation: { ...rulebook, section: "7B.2" },
        confidence: "high",
        notes:
          "Rulebook Chapter 7, Section B (Time Attack driver gear): 'An FIA 8858 or SFI 38.1 rated Head and Neck restraint with an in-date certification is strongly recommended.' Downgraded from 'required' (Section 7A, wheel-to-wheel/Sprint & Endurance sessions) to 'strongly recommended' here — this is the rulebook's own explicit, separate Time Attack gear list, not an inference.",
      },
      firesuit: {
        requirement: "conditional",
        materialOnlyAccepted: false,
        acceptedStandards: [
          { standardId: "sfi-3.2a-1" },
          { standardId: "sfi-3.2a-5" },
          { standardId: "sfi-3.2a-10" },
          { standardId: "sfi-3.2a-15" },
          { standardId: "sfi-3.2a-20" },
          { standardId: "sfi-3.4-5" },
          { standardId: "fia-8856-2000" },
          { standardId: "fia-8856-2018" },
          { standardId: "fia-1986" },
        ],
        condition:
          "Rulebook §7B: required only 'for time attack drivers of non-production cars and cars with a gutted interior.' A time attack driver in a production car with an intact interior has no NEGT-mandated firesuit requirement at all — contrast with wheel-to-wheel/Sprint & Endurance sessions (§7A), where a firesuit is required of every driver regardless of car.",
        materialNote: "Rulebook §7B: 'Fire-retardant racing suit rated FIA 8856-2000 (or later), or SFI 3.2A/5, or higher. SFI 3.2A/1 suits may be worn with SFI 3.3 rated underwear, top and bottom.' Same suit spec as §7A when the condition above applies.",
        citation: { ...rulebook, section: "7B.3" },
        confidence: "high",
      },
      gloves: {
        requirement: "conditional",
        materialOnlyAccepted: false,
        acceptedStandards: GENERIC_APPAREL_STANDARDS,
        condition:
          "Rulebook §7B: required only 'for time attack drivers of non-production cars and cars with a gutted interior' — not required for a time attack driver in a production car with an intact interior.",
        materialNote: "Rulebook §7B: 'SFI 3.3/5 or FIA 8856/2000 minimum rated gloves.'",
        citation: { ...rulebook, section: "7B.5" },
        confidence: "high",
      },
      shoes: {
        requirement: "conditional",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_APPAREL_STANDARDS,
        condition:
          "Rulebook §7B: required only 'for time attack drivers of non-production cars and cars with a gutted interior' — not required for a time attack driver in a production car with an intact interior.",
        materialNote:
          "Rulebook §7B: 'Shoes or boots, made of leather or nonflammable material that at a minimum cover the foot up to the ankle. SFI 3.3/5 & FIA 8856/2000 rated shoes are strongly recommended' — certification itself is only recommended, not required, even when the condition above applies.",
        citation: { ...rulebook, section: "7B.6" },
        confidence: "high",
      },

      // --- Car gear: NEGT's Chapter 6 opens with "Endurance and sprint race cars shall meet all
      // rules in Chapter 6 Section E. All time attack cars shall meet standard HPDE tech." Section
      // E is itself titled "Safety (Sprint & Endurance Racing)" — every category below is sourced
      // from it in the base `categories` above, so all are explicitly out of scope for Time
      // Attack cars per NEGT's own text. "Standard HPDE tech" isn't itemized anywhere in this
      // rulebook (it likely defers to the host track's own driver's-ed/time-trial tech sheet, or
      // partner organizer MassTuning's HPDE standard) — modeled as not_addressed rather than
      // guessing at an unstated external standard. window_breaker/tow_rope/emergency_triangle/
      // first_aid_kit are already not_addressed in the base rules for every format, so they need
      // no override here.
      seat: { requirement: "not_addressed", citation: { ...rulebook, section: "Chapter 6 intro; 6E title" }, confidence: "high", notes: TIME_ATTACK_CAR_GEAR_NOTE },
      belts_harness: { requirement: "not_addressed", citation: { ...rulebook, section: "Chapter 6 intro; 6E title" }, confidence: "high", notes: TIME_ATTACK_CAR_GEAR_NOTE },
      window_net: { requirement: "not_addressed", citation: { ...rulebook, section: "Chapter 6 intro; 6E title" }, confidence: "high", notes: TIME_ATTACK_CAR_GEAR_NOTE },
      fuel_cell: { requirement: "not_addressed", citation: { ...rulebook, section: "Chapter 6 intro; 6E title" }, confidence: "high", notes: TIME_ATTACK_CAR_GEAR_NOTE },
      fire_extinguisher: { requirement: "not_addressed", citation: { ...rulebook, section: "Chapter 6 intro; 6E title" }, confidence: "high", notes: TIME_ATTACK_CAR_GEAR_NOTE },
      fire_suppression: { requirement: "not_addressed", citation: { ...rulebook, section: "Chapter 6 intro; 6E title" }, confidence: "high", notes: TIME_ATTACK_CAR_GEAR_NOTE },
      kill_switch: { requirement: "not_addressed", citation: { ...rulebook, section: "Chapter 6 intro; 6E title" }, confidence: "high", notes: TIME_ATTACK_CAR_GEAR_NOTE },
      tow_hook: { requirement: "not_addressed", citation: { ...rulebook, section: "Chapter 6 intro; 6E title" }, confidence: "high", notes: TIME_ATTACK_CAR_GEAR_NOTE },
    },
  },
};

export const northeastGTRulesets: Ruleset[] = [raceGear];

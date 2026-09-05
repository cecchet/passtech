import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_FUEL_CELL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

const sourceDoc = {
  title: "Pikes Peak International Hill Climb (PPIHC) Rule Book",
  version: "2026 Rule Book, effective Dec 5, 2025",
  // If this direct PDF link breaks, https://ppihc.org/competitors/ at least gets users close.
  url: "https://ppihc.org/wp-content/uploads/2026-Rule-Book.pdf",
};

const hillClimb: Ruleset = {
  id: "pikespeak-hillclimb",
  bodyId: "pikespeak",
  bodyName: "Pikes Peak International Hill Climb (PPIHC)",
  disciplineName: "Hill Climb",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "114 Required Safety Equipment" }],
  // A single combined PDF covering the technical inspection form for each division separately
  // (Pikes Peak Open, Unlimited, GT4, etc. each get their own page/section within it), published
  // directly by PPIHC rather than something this app hosts a copy of.
  techSheet: { url: "https://ppihc.org/wp-content/uploads/2026-PPIHC-Tech-Sheets.pdf.pdf", format: "PDF" },
  // Of PPIHC's seven divisions (§7.6.1: Unlimited, Time Attack 1, Pikes Peak GT4, Open Wheel,
  // Pikes Peak Open, Exhibition, plus Unlimited's Super Unlimited class), only Pikes Peak GT4
  // (§400) runs on a genuinely separate rulebook: an SRO/FIA GT4 homologation-based technical
  // section rather than PPIHC's own general Section 100 car-safety rules. That separate section
  // diverges from the general rules across multiple equipment categories with real citations: seat
  // (§414.3 — FIA-homologated seat only, not modified), belts_harness (§414.2 — FIA 8853-2016
  // specifically, min. 5 anchorage points, no elastic devices, not anchored to the seat), fuel_cell
  // (§406.2 — FIA FT3-1999 rubber bladder + crushable-structure housing), window_net (§403.2/414.5
  // — a net of some kind, protective or FIA 8863-2013 racing net, is compulsory outright rather
  // than framed as an alternative to arm restraints), and tow_hook (§414.5 — a 60mm towing-eye
  // spec that explicitly supersedes the general 1.5" ring size). All other divisions (including
  // Time Attack 1, which only adds a fuel-cell bulkhead requirement in §304.2 without changing the
  // accepted standards or requirement level, and a re-statement rather than a carve-out of the
  // general master-switch rule in §305.1) explicitly "adhere to General Competition Rules" on top
  // of their division-specific rules and don't diverge from the base categories below across
  // enough categories to warrant their own class — so only GT4 gets one.
  classes: [{ id: "gt4", label: "Pikes Peak GT4 Division" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2020", noExpiration: true },
        {
          standardId: "snell-sa2025",
          noExpiration: true,
          note: "Rule Book: 'Three years after helmets have been upgraded by Snell, competitors will be required to meet or exceed the new standards' — no specific date given, so not encoded as a hard cutoff here.",
        },
        { standardId: "sfi-31.2" },
        { standardId: "sfi-31.2a" },
        { standardId: "bs-6658-1985" },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8859-2020", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
        { standardId: "fia-8859-2024-abp", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
      ],
      fullFaceRequirement: "required",
      fullFaceCondition:
        "Rule Book §114.2.2: 'Helmets should be equipped with a face shield; if not, the use of goggles is required.' A face shield is a component of full-face/modular helmet construction — it isn't a part that can be fitted to an open-face shell — so this rule effectively mandates a full-face or modular helmet. An open-face helmet paired with goggles does not satisfy it.",
      citation: { ...sourceDoc, section: "114.2.1, 114.2.2" },
      confidence: "medium",
      notes:
        "Corrected from an earlier read that took §114.2.2's 'if not, the use of goggles is required' clause as a general allowance for open-face helmets — a face shield requires full-face/modular construction, so open-face + goggles doesn't satisfy the rule regardless of that fallback wording. Confidence remains medium: the exact scope of the goggles fallback isn't independently re-verified against a second source. Name/blood-type lettering on the helmet and safety-glass corrective lenses are also required by this rule but aren't modeled here.",
    },
    balaclava: {
      requirement: "conditional",
      condition:
        "Rule Book §114.1: hair protruding from beneath the helmet must be completely covered by fire-resistant material, and drivers with facial hair must wear a face shield of fire-resistant material — a balaclava or helmet skirt satisfies either trigger. Not a blanket requirement for every driver.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rule Book just requires 'fire-resistant material' — no specific certification number cited for the balaclava/skirt itself.",
      citation: { ...sourceDoc, section: "114.1" },
      confidence: "high",
      notes:
        "Verbatim: 'Hair protruding from beneath a driver's helmet must be completely covered by fire-resistant material. Drivers with facial hair must wear face shields of fire-resistant material (i.e. balaclava or helmet skirt).'",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1" },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "114.2.5" },
      confidence: "medium",
      notes: "Rule Book just requires an 'SFI/FIA approved' device with no specific spec number named. Go-kart 'donut' restraints are explicitly not approved.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "sfi-3.2a-1",
          noExpiration: true,
          note: "Acceptable only when paired with Nomex (or equivalent) long-sleeve fire-retardant underwear, unless the suit has 3+ layers. Rule Book's 10-year age cap (see notes) can't be checked against this tag — SFI 3.2A patches don't print a manufacture/certification date the way HANS/belts/fire-suppression tags do, and the spec number itself (3.2A/1) carries no generation year to compute a fixed cutoff from either.",
        },
        {
          standardId: "sfi-3.2a-5",
          noExpiration: true,
          note: "Recommended tier over 3.2A/1. Same date-check gap as sfi-3.2a-1 above — no manufacture date is printed on this tag, and no generation year is encoded in the spec number.",
        },
        { standardId: "fia-8856-2000", validityYearsFromLabel: 10 },
        { standardId: "fia-8856-2018", validityYearsFromLabel: 10 },
      ],
      citation: { ...sourceDoc, section: "114.2.3" },
      confidence: "medium",
      notes: "Rule Book: 'as of 2025, all fire suits are not to exceed 10 years of age' — applied as a 10-year cap measured from the label date for FIA 8856 (which prints one). SFI 3.2A patches carry no date at all, so that same cap can't be verified for the SFI path here — see the acceptedStandards notes above. The rule book text only names FIA 8856-2000, but FIA 8856-2018 (which superseded it) is also accepted in practice — confirmed by a Pikes Peak competitor; the rule book's own text is incomplete here.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [{ standardId: "sfi-3.3-5" }, { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018" }],
      materialNote: "Rule Book: 'SFI approved flame-retardant ... (SFI 3.3/5), (FIA 8856-2000) gloves ... are required' — a certified item, not just fire-resistant material.",
      citation: { ...sourceDoc, section: "114.2.4" },
      confidence: "medium",
      notes: "The rule book text only names FIA 8856-2000, but FIA 8856-2018 is also accepted in practice — confirmed by a Pikes Peak competitor.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [{ standardId: "sfi-3.3-5" }, { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018" }],
      materialNote: "Rule Book: 'SFI approved flame-retardant shoes (SFI 3.3/5), (FIA 8856-2000) ... are required.'",
      citation: { ...sourceDoc, section: "114.2.4" },
      confidence: "low",
      notes: "SFI 3.3/5 is unusual as a shoe-specific citation (it's normally the glove/apparel family spec) — transcribed as written from the rule book; the rule may intend the broader SFI 3.3 apparel family rather than a glove-only spec. Worth spot-checking against a current copy. The rule book text also only names FIA 8856-2000, but FIA 8856-2018 is also accepted in practice — confirmed by a Pikes Peak competitor.",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [{ standardId: "sfi-3.3-5" }, { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018" }],
      materialNote: "Rule Book §114.2.4: socks worn with your shoes must be SFI 3.3/5 or FIA 8856-2000 certified — a certified item, not just fire-resistant material.",
      citation: { ...sourceDoc, section: "114.2.4" },
      confidence: "low",
      notes: "Same citation and same SFI 3.3/5-as-shoe/sock-spec caveat as the shoes rule above. The rule book text only names FIA 8856-2000, but FIA 8856-2018 is also accepted in practice — confirmed by a Pikes Peak competitor.",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required if your driving suit is single- or double-layer (Nomex or equivalent long-sleeve fire-retardant underwear); not required with 3-or-more-layer suits unless the suit manufacturer specifies otherwise.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rule Book just says 'Nomex or equivalent long sleeved fire-retardant underwear' when required — no specific certification number cited for the underwear itself.",
      citation: { ...sourceDoc, section: "114.2.3" },
      confidence: "medium",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required in all open-cockpit/open-air vehicles, positioned per the restraint manufacturer's recommendation (§108, §114.2.7). Closed-cockpit cars must have arm restraints OR a window net instead (§114.2.6) — not both.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No specific certification standard cited by PPIHC for arm restraints — an SFI 3.3-rated device obviously qualifies.",
      satisfiedByAlternative: "window_net",
      citation: { ...sourceDoc, section: "108, 114.2.6-114.2.7" },
      confidence: "medium",
    },

    // Car safety gear
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "Rule Book §107.1-107.2: 'All vehicles must have an approved seat designed to stabilize and protect the driver... It is necessary to be in a reclining position, to provide a kick-up (roll-up) forward of the buttocks... Only metal or approved composite seats are allowed' — a construction/mounting requirement, not a certification. An uncertified/untested upright seat is still accepted, but §107.3.2 (second clause of that number) then requires: 'In vehicles where the seat is upright and has not been tested or rated, the back of the seat is required to have a seat back brace mounted to the cage, unless preapproved by the Director of Competition or his designee.' A seat homologated to FIA 8855-1999 or higher is exempted from that brace (and from having its seatback attached to the roll structure at all) per §107.3.1.",
      citation: { ...sourceDoc, section: "107, 107.1-107.3.2" },
      confidence: "high",
      notes:
        "Confirmed against the rulebook text directly: PPIHC doesn't mandate a specific seat certification as a hard requirement — only metal or 'approved composite' seats are allowed, firmly mounted to the vehicle structure (§107.3), providing lateral support on both sides with a reclining position and a kick-up forward of the buttocks (§107.1-107.2). The tradeoff for going uncertified is the seat back brace: certified FIA 8855-1999+ seats are exempt from it (and from attaching the seatback to the roll structure at all, §107.3.1); an uncertified upright seat needs the brace unless the Director of Competition preapproves an exception (§107.3.2). §107.3.1 is the only certification PPIHC names by number, but a certified SFI 39.1/39.2 or higher-generation FIA 8855/8862 seat obviously also satisfies the underlying stabilize-and-protect intent, so GENERIC_SEAT_STANDARDS is offered as the certified-mode list on that basis (mirroring the PHA seat rule). Non-integral-seat head restraints need a minimum 36 sq. in. area, 1\" of non-resilient padding (SFI 45.1 recommended), and must withstand 200 lbs of rearward force — not modeled here. Seat sliders/rails vs. a fixed mount aren't explicitly addressed; 'firmly mounted to the structure of the car' (§107.3) suggests a fixed mount is expected, though this isn't stated outright.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-16.1",
          validityYearsFromLabel: 2,
          note:
            "Rule Book: SFI-certified harnesses must show a conformance label dated less than 2 years before the competition date, or a label indicating certification hasn't yet expired (§108.6.1) — modeled here as a 2-year validity window from the label date.",
        },
        { standardId: "sfi-16.5", validityYearsFromLabel: 2 },
        { standardId: "sfi-16.6", validityYearsFromLabel: 2 },
        { standardId: "fia-8853-98" },
        { standardId: "fia-8854-98" },
        {
          standardId: "fia-8853-2016",
          note:
            "Not named directly in the Rule Book, but the rule text accepts FIA 8853/98, 8854/98, 'or newer' (§108.6) — included here as the newer FIA 8853 generation.",
        },
      ],
      materialNote: "Stock/OEM belts are not accepted — a 5, 6, or 7-point restraint harness meeting SFI or FIA spec is mandatory (7-point recommended, §108).",
      citation: { ...sourceDoc, section: "108, 108.6" },
      confidence: "high",
      notes:
        "FIA 8853/98 and 8854/98 harnesses expire on the last day of the year printed on the label (§108.6.2) — an absolute date already printed on the tag rather than a computed window, so it isn't separately encoded via validityYearsFromLabel here. Also mandates: over-the-shoulder harness with a single release common to belt and harness, no 'Y'-type shoulder straps ('H' type allowed), individual mounting points (min. 2 for lap belt, 2 for shoulder belt), and SAE Grade 5/Metric 8.8 minimum mounting hardware (§108.2-108.5) — not modeled in this schema.",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "Required as an alternative to arm restraints in closed-cockpit cars (§114.2.6: 'All closed cockpit cars shall have arm restraints or a window net') — either one satisfies the rule, not both. Open-cockpit cars must instead wear arm restraints outright (§114.2.7); a window net is only 'recommended' for them, not required.",
      materialOnlyAccepted: true,
      materialNote:
        "No specific certification standard is cited by PPIHC's general driver-equipment rule (§114.2.6-114.2.7) for the window net itself — an SFI 27.1 or FIA 8863-rated net obviously qualifies.",
      satisfiedByAlternative: "arm_restraint",
      citation: { ...sourceDoc, section: "114.2.6-114.2.7" },
      confidence: "medium",
      notes:
        "Mirrors the either/or framing already modeled on arm_restraint. Confirmed via a full-text search of the Rule Book for 'net'/'8863'/'27.1' — no SFI 27.1 citation exists anywhere in this document. The roll cage rules separately note the driver's window safety net may be mounted to the door-opening side tube and top cage tube (§314/§1913) — not modeled here as it's an installation detail, not a requirement trigger. The Pikes Peak GT4 Division (§403.2, §414.5) has its own distinct, and stricter, net rule — modeled separately under classOverrides.gt4 below rather than here, since it changes the requirement from an arm-restraint alternative to an outright mandate.",
    },
    fire_extinguisher: {
      requirement: "required",
      fireExtinguisherOptions: [
        { quantity: 1, minWeightLbs: 5 },
        { quantity: 1, minWeightLbs: 10 },
      ],
      citation: { ...sourceDoc, section: "112.1, 112.5" },
      confidence: "high",
      notes:
        "Mandatory item is a pit extinguisher, not necessarily an in-vehicle one: the entrant/crew chief must display in the pit a fully charged handheld extinguisher rated at least 5 lb dry powder or clean agent gas, or 10 lb firefighting foam, with a pressure gauge, current inspection tag, the vehicle's number labeled on it, and a certification date of one year or less (§112.5, §112.5.1). Separately, §112.1 only recommends (doesn't require) an in-vehicle handheld extinguisher of at least 2.5 lb, preferably a clean gas agent (Novec 1230, FE36, Halotron) — Halon and powder extinguishers are barred for that unit. A fire extinguisher must also be manned with pin pulled during refueling operations (§120.2) — not modeled as a separate requirement.",
    },
    fire_suppression: {
      requirement: "required",
      acceptedStandards: [{ standardId: "sfi-17.1" }, { standardId: "fia-technical-list-16" }, { standardId: "fia-technical-list-52" }],
      citation: { ...sourceDoc, section: "112.1" },
      confidence: "high",
      notes:
        "Rule Book: 'All vehicles are required to have an FIA Technical List 16, FIA Technical List 52, or SFI 17.1 plumbed-in fire suppression system[s]' (§112.1) — a plumbed-in system is mandatory for every vehicle, not merely offered as an alternative to a handheld extinguisher. Must be identified with two 'circle E' decals (activation point + nearby exterior bodywork); a second activation point for emergency responders is strongly recommended. EV/hybrid/lithium-battery vehicles and vehicles on alternative/biofuel/alcohol fuels must specifically use a cooling, non-conductive suppressant (e.g. Novec 1230, FE36, Halotron — Halon barred) capable of suppressing the applicable fuel fire (§112.2). Must be securely mounted within the caged crash structure with metal brackets and a quick-release strap system, display a charge/pressure gauge, and be serviced/recertified every 2 years (or per manufacturer's schedule, whichever is sooner) with a dated service label (§112.3-112.4). Must be active (mechanical pins pulled, or electric system armed) before the vehicle leaves the stage start.",
    },
    fuel_cell: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
      materialNote:
        "Rule Book (§117): fuel cell must be 'purpose-built by a recognized manufacturer,' consisting of an outer protective shell/case, internal bladder, proper venting, and a check valve that stops flow if the vehicle isn't upright; a manufacturer's fuel cell certificate must be provided if requested. A stock/OEM fuel tank is not an accepted alternative — a fuel cell is mandatory in every division (§117.1). The general §117 rule that applies to all divisions other than GT4 doesn't name a specific SFI/FIA spec number, so any registered fuel-cell homologation is treated as satisfying the 'purpose-built by a recognized manufacturer' requirement. The Pikes Peak GT4 Division specifically requires FIA FT3-1999 or higher per §406.2 ('rubber bladders conforming to or exceeding FIA/FT3 1999') — not modeled as a separate ruleset here, so this is offered as one of the generally-accepted options rather than the sole one.",
      citation: { ...sourceDoc, section: "117, 117.1" },
      confidence: "high",
      notes:
        "Time Attack 1 Division separately states 'Certified fuel cells are mandatory' (§304.1) without naming a spec number, and requires the cell be separated from the cockpit by a steel/aluminum bulkhead (§304.2). A second fuel cell/canister is required for any additional combustion fuel source and must be contained within the roll cage; nitrogen-based sources are Unlimited-Division-only (§117.1). Max cell capacity is 22 US gallons (§117.2.3), and a vent pipe with ball check valves (or an approved equivalent) is mandatory (§117.2.2).",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "No requirement for a dedicated window-breaking tool or seatbelt cutter was found anywhere in the Rule Book. PPIHC does require, for closed-cockpit cars, either arm restraints or a window net (§114.2.6) — modeled under the arm_restraint category, not here, since a window net is a restraint device rather than a glass-breaking/belt-cutting tool.",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionRequiresWelded: true,
      rolloverProtectionTubingSpec: [
        { underWeightLbs: 1000, minSizes: [{ outerDiameterIn: 1.375, wallThicknessIn: 0.09 }], materialNote: "Mild steel or D.O.M.; Alloy Steel 1.25x0.095; Aluminum 6061-T6 1.5x0.125; Docol R8 1.25x0.095" },
        { underWeightLbs: 2000, minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.09 }], materialNote: "Mild steel or D.O.M.; Alloy Steel 1.375x0.095; Aluminum 6061-T6 1.5x0.188; Docol R8 1.375x0.095" },
        { underWeightLbs: 3000, minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.12 }], materialNote: "Mild steel; D.O.M. 1.5x0.095; Alloy Steel 1.625x0.095; Aluminum 6061-T6 1.5x0.188; Docol R8 1.375x0.095" },
        { underWeightLbs: 4000, minSizes: [{ outerDiameterIn: 1.75, wallThicknessIn: 0.12 }], materialNote: "Mild steel or D.O.M.; Alloy Steel 1.75x0.095; Aluminum 6061-T6 1.625x0.188; Docol R8 1.625x0.083" },
        { minSizes: [{ outerDiameterIn: 2.0, wallThicknessIn: 0.12 }], materialNote: "For over 4000 lbs. Mild steel or D.O.M.; Alloy Steel 1.75x0.095; Aluminum 6061-T6 1.75x0.188 or 2.0x0.188; Docol R8 1.75x0.095" },
      ],
      rolloverProtectionRequiresPadding: true,
      condition:
        "Main hoop geometry differs for Open Wheel Division (§504.4: extend 4\" above the competitor's helmet, headrest support attached to the cage; roll cage is never a tow point) versus all other divisions (§105.1: full width of the compartment, 2\"-10\" above/behind the helmet). Monocoque/full-safety-pod chassis are allowed in place of a tube-frame cage if the integrated rollover structure is tested and results submitted for approval.",
      citation: { ...sourceDoc, section: "105, 105.1-105.5, 504.4" },
      confidence: "high",
      notes:
        "§105: 'All vehicles must incorporate the use of a roll cage,' required outright with no class exemption. Steel tubing or 6061-T6 aluminum only (must match the frame material) — titanium barred; two fore-aft braces at least equal to the main hoop's tubing, minimum 2 passenger-side + 3 competitor-side sidebars; gusseted at all four corners; mounting plates minimum 3/16\" thick; AWS D1.1:2002 welding standard. Production vehicles over 4,000 lbs need a non-factory dash bar of the same cage material; under 4,000 lbs may use the factory dash bar if tied into the A-pillar on both sides. The Pikes Peak GT4 Division instead follows its own FIA/SRO-homologated safety cage spec — see the gt4 class override. Padding (§105.6): except where it would block forward/side vision, any portion of the roll structure that could contact the competitor's helmet must be covered with high-density energy-absorbing material (Styrofoam/Ensolite are named examples) at least 1/2\" thick, itself covered by protective wrapping — no SFI/FIA certification number is cited for this general rule (contrast with the GT4 Division's own padding rule, which does require FIA 8857-2001 Type A).",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...sourceDoc, section: "116.4" },
      confidence: "high",
      notes:
        "Master electrical cut-off switch must be operable both by emergency responders from outside the vehicle and by the belted-in driver from inside, and must disable fuel and electrical systems completely (§116.4); doors must remain operable after cutoff, with a mechanical release inside and outside if power-operated (§116.4.1). A 'Master Electrical Shut-Off' decal must be displayed near the switch (Diagram A). For EV entries, the battery disconnect switch must additionally be clearly marked 'Battery Switch' with ON/OFF positions, capable of interrupting the full load current, and located as near the battery as practical (§129.1.2). Ignition on/off switches must also be clearly labeled and reachable by the belted-in driver (§116.3) — not modeled separately here.",
    },
    tow_hook: {
      requirement: "required",
      towHookSidesRequired: "both",
      citation: { ...sourceDoc, section: "123" },
      confidence: "high",
      notes:
        "Baseline rule (§123): an accessible, labeled tow ring/hook is required on both front and rear, must not be mounted under the vehicle, minimum 1.5\" ring size, and minimum 4\" from the ground; preferred material is rigid, non-flammable, and heat-resistant (won't melt/deform under extreme heat). FIA-certified tow hooks are an accepted alternative, provided they sit at least 12\" from the exhaust and clear scrutineering (§123.2-123.3). Open Wheel Division vehicles must mount tow points forward of the front wheels and behind the rear wheels — the roll cage itself does not count as a tow point (§504.4.6). Pikes Peak GT4 Division vehicles instead follow a distinct spec (§414.5): a visible towing eye front and rear, painted yellow/red/orange, that clears passage of a 60mm/2.37\" diameter cylinder — this explicitly supersedes the 1.5\" ring size used elsewhere in the Rule Book, for GT4 cars only.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "The Rule Book doesn't require competitors to carry a tow rope/strap — towing on the mountain is instead provided by PPIHC itself (§2.10), and vehicles are required to have tow rings/hooks (§123) for that purpose rather than a rope or strap the competitor supplies.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "No requirement for a warning/emergency triangle was found. The only 'triangle' reference in the Rule Book is the triangular 'O2 on board' decal required for vehicles running on-board oxygen (§115.3), which is an unrelated labeling requirement.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "No requirement for competitors to carry a first aid kit was found. PPIHC instead states that PPAHCEM itself secures medical facilities, ambulances, and medical support for the event (§100 intro) rather than requiring one on board or in the pit.",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "No hood pin / positive hood-latching requirement is stated in the General Competition Rules (Section 100). Some divisions' own technical regs carry a general 'all body work must be securely latched or fastened' clause (Time Attack 1, §301.5; the Production Records Appendix, §1901.5) — that's satisfied by a functioning stock latch, not a hood-pin-specific mandate, and isn't restated as a general-rule requirement. The Pikes Peak GT4 Division has its own explicit bonnet/boot-lid fastener rule instead — see classOverrides.gt4.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "No onboard spill-kit / absorbent-material requirement found anywhere in the Rule Book. §120.4-120.5 cover what to do if fuel spills during refueling (immediate dilution, reporting to officials, and proper hazmat disposal of contaminated fuel) but don't require the competitor to carry any onboard spill-containment kit.",
    },
  },
  classOverrides: {
    gt4: {
      seat: {
        requirement: "required",
        materialOnlyAccepted: false,
        acceptedStandards: [
          { standardId: "fia-8855-1999" },
          { standardId: "fia-8855-2010" },
          { standardId: "fia-8855-2021" },
          { standardId: "fia-8862-2009" },
        ],
        materialNote:
          "Rule Book §414.3: 'The driver's seat must be homologated by the FIA and not modified.' Unlike the general seat rule (§107), which accepts an uncertified metal/composite seat with a brace, GT4 requires FIA homologation outright — SFI 39.1/39.2 is not offered here since the rule text specifically names FIA homologation, not 'SFI or FIA.'",
        citation: { ...sourceDoc, section: "414.3" },
        confidence: "high",
        notes:
          "If the seat is part of an FIA-approved safety structure, seat and headrest are defined in the homologation form. If a foam insert is used between the homologated seat and driver, minimum lateral support dimensions apply (230mm at head, 180mm at shoulder, 100mm at pelvis, verified with a template) — not modeled here as a pass/fail item. All cockpit equipment mountings (including the seat) must withstand 25G deceleration (§413.1.3). No noExpiration/validityYearsFromLabel is encoded — checked §414.3, the general seat rule (§107.1-107.3.2), and its duplicate at §1908.2 for 'expir'/'recertif'/'date of manufacture' and found nothing, while the Rule Book does carry explicit age language for belts (§108.6: 2-year SFI label rule, FIA 8853/98 end-of-year expiration) and fire suppression — seats are the one category left silent on age here too.",
      },
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: false,
        acceptedStandards: [
          {
            standardId: "fia-8853-2016",
            note: "Rule Book §414.2 names this specific generation ('FIA Standard 8853-2016, Technical List n°57') rather than the broader SFI/older-FIA list the general belts_harness rule accepts.",
          },
        ],
        materialNote:
          "Rule Book §414.2: two shoulder straps, two lap straps, and two crotch straps are compulsory, with a minimum of five (5) anchorage points. Elastic devices attached to the shoulder straps are forbidden, and the belts may not be anchored to the seat or its supports.",
        citation: { ...sourceDoc, section: "414.2" },
        confidence: "high",
        notes:
          "Must be installed and used per FIA Article 253-6 of Appendix J. Unlike the general belts_harness rule (§108, §108.6), which accepts SFI 16.1/16.5/16.6 and several FIA generations with various expiration schemes, GT4 narrows this to FIA 8853-2016 specifically — no SFI option and no older FIA 8853/98 or 8854/98 generation named.",
      },
      fuel_cell: {
        requirement: "required",
        materialOnlyAccepted: false,
        acceptedStandards: [
          {
            standardId: "fia-ft3-1999",
            note: "Rule Book §406.2: 'All fuel tanks must be rubber bladders conforming to or exceeding the specifications of FIA/FT3 1999.' Named as a floor ('or exceeding'), but no higher-generation FIA fuel-cell spec is separately named in this section, so only FT3-1999 is listed here.",
          },
        ],
        materialNote:
          "Rule Book §406.2: fuel tank must be a rubber bladder placed in the original location or the luggage compartment, contained in a flameproof/liquid-proof housing with a crushable structure (min. 10mm sandwich construction) on all surfaces not already protected by the main chassis. Fuel fittings that are part of the tank walls must be metal or composite and bonded into the tank.",
        citation: { ...sourceDoc, section: "406, 406.2" },
        confidence: "high",
        notes:
          "Differs from the general fuel_cell rule (§117), which accepts any 'purpose-built by a recognized manufacturer' cell (modeled as GENERIC_FUEL_CELL_STANDARDS) — GT4 instead names one specific FIA spec. GT4 vehicles must also carry a self-sealing fuel-sample connector approved by the FIA (§406.3) and are subject to PPIHC-adjustable fuel capacity for balance-of-performance purposes (§406.1) — not modeled as pass/fail items here.",
      },
      window_net: {
        requirement: "required",
        materialOnlyAccepted: true,
        acceptedStandards: [
          {
            standardId: "fia-8863-2013",
            note: "Rule Book §414.5 ('Racing nets'): not compulsory on its own, but if a racing net is fitted instead of the plain protective net, it must be homologated to FIA 8863-2013 (FIA Technical List n°48) and mounted at the car's homologated points.",
          },
        ],
        materialNote:
          "Rule Book §403.2: a protective net is compulsory unless the car is instead equipped with a homologated racing net (see acceptedStandards). The protective net must be made of woven strips at least 19mm (3/4') wide, with meshes 25x25mm to 60x60mm, non-flammable and sewn at each crossing point, reaching (viewed from the side) from the center of the steering wheel to the B-pillar, and released by a one-handed rapid-release system with dayglo-orange markings.",
        citation: { ...sourceDoc, section: "403.2, 414.5" },
        confidence: "high",
        notes:
          "Unlike the general window_net rule, which is conditional and interchangeable with arm_restraint for closed-cockpit cars (§114.2.6), GT4's own rule mandates a net of one type or the other outright — §400 doesn't offer arm restraints as an alternative for this division, so satisfiedByAlternative isn't carried over here. A net satisfying this GT4-specific rule also necessarily satisfies the general §114.2.6 either/or, so arm_restraint doesn't need its own GT4 override.",
      },
      tow_hook: {
        requirement: "required",
        towHookSidesRequired: "both",
        materialNote:
          "Rule Book §414.5: a visible towing eye, front and rear, painted yellow, red, or orange, that allows passage of a 60mm (2.37') diameter cylinder — this explicitly supersedes the general 1.5' ring size (§123.2). Must allow the car to be towed on a dry surface with traction applied at up to ±15° from the car's longitudinal centerline, wheels blocked by the main braking system, checked with event-spec tires fitted.",
        citation: { ...sourceDoc, section: "414.5" },
        confidence: "high",
        notes: "Replaces the general tow_hook rule (§123) in full for GT4 cars rather than adding to it — the Rule Book frames this as a supersession, not an additional option.",
      },
      rollover_protection: {
        requirement: "required",
        rolloverProtectionRequiresFullCage: true,
        rolloverProtectionRequiresWelded: false,
        rolloverProtectionAcceptedLogbookBodies: ["fia"],
        rolloverProtectionRequiresPadding: true,
        rolloverProtectionPaddingCertRequired: true,
        citation: { ...sourceDoc, section: "415, 415.1" },
        confidence: "high",
        notes:
          "Rule Book §415.1: 'The safety cage must have no more than six mounting points... must be certified or homologated by an ASN or homologated by the FIA' — an authentic copy of the homologation document/certificate, signed by qualified technicians representing the manufacturer, must be presented to scrutineers. Cars homologated in GT4 after 01/01/2016 use the cage defined in the car's Homologation Form (VO). Unlike the general §105 weight-tiered tubing spec, GT4's cage is accepted purely on FIA/ASN homologation paperwork, not measured tube dimensions — rolloverProtectionTubingSpec isn't carried over from the base rule. Padding must comply with FIA 8857-2001 Type A per Appendix J art. 253-8.3 (FIA Technical List n°23).",
      },
      hood_pins: {
        requirement: "required",
        materialNote:
          "Rule Book §403.1.1 ('Bonnet and boot lids'): 'They must have at least two safety fasteners, both of which are clearly indicated by red (or contrasting color) arrows. It must be possible to remove or open them without the use of tools.' A waiver for special constructions can be granted by the SRO Technical Department, described in the car's homologation document.",
        citation: { ...sourceDoc, section: "403.1.1" },
        confidence: "high",
        notes:
          "Replaces the general division's plain 'all body work must be securely latched or fastened' language (§301.5/§1901.5, neither of which reaches GT4 specifically) with an explicit positive-fastener mandate: at least two quick-release (no-tools) safety fasteners on both the bonnet (hood) and boot (trunk) lid, each marked with a contrasting-color arrow.",
      },
    },
  },
};

export const pikespeakRulesets: Ruleset[] = [hillClimb];

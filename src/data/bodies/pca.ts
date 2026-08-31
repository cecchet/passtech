import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

const sourceDoc = {
  title: "PCA National HPDE Committee - Minimum Standards",
  version: "Rev. 1/15/26, FINAL 2026",
  url: "https://mediaassets.pca.org/docs/formsanddocs/94/2026%20HPDE%20Minimum%20Standards.pdf",
};

// PCA's national Minimum Standards apply uniformly to Driver Education (DE) / HPDE events across
// all run groups (Novice/Beginner/Intermediate/Advanced/Solo naming varies by region). The one
// run-group-flavored nuance — Snell M-rated helmets being explicitly called out as permitted only
// for novice run groups, with higher groups merely "encouraged" (not required) to move to SA — is
// a soft distinction, not a hard block, so it's captured in a note rather than split into a
// separate ruleset. Regions may impose stricter rules than this national floor; none may be looser.
const de: Ruleset = {
  id: "pca-de",
  bodyId: "pca",
  bodyName: "PCA (Porsche Club of America)",
  disciplineName: "Driver Education (DE) — HPDE",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [sourceDoc],
  techSheet: { url: "https://web.pca.org/includes/formsAndDocs/94/TECH%20FORM%20PCA%2012-20-18.pdf", format: "PDF" },
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2025", validityYearsFromLabel: 10, note: "Current Snell SA generation." },
        { standardId: "snell-sa2020", validityYearsFromLabel: 10, note: "Immediately-preceding Snell SA generation. This entry will need to roll forward once a newer SA generation supersedes SA2025 as 'current'." },
        { standardId: "snell-m2025d", validityYearsFromLabel: 10, note: "M-rated Snell helmets are explicitly 'permitted for HPDE Events novice run groups'; the document doesn't name a specific M-generation, so current-era M ratings are listed here as a reasonable default." },
        { standardId: "snell-m2025r", validityYearsFromLabel: 10 },
        { standardId: "snell-m2020d", validityYearsFromLabel: 10 },
        { standardId: "snell-m2020r", validityYearsFromLabel: 10 },
        { standardId: "sfi-31.1-2020", validityYearsFromLabel: 10, note: "Document cites 'SFI 31.1' generically without a year/slash-level." },
        { standardId: "sfi-31.1-2015", validityYearsFromLabel: 10 },
        { standardId: "bs-6658-1985", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2020", validityYearsFromLabel: 10, note: "Document cites 'FIA (for racing automobiles)' generically without a specific spec number." },
        { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
      ],
      citation: { ...sourceDoc, section: "11(b) Helmet" },
      confidence: "medium",
      notes:
        "'Helmets with a printed manufacture date expire at the end of the 10th year following the year of manufacture' — applied uniformly above as a 10-year validity window from the label date. Snell M-rated helmets are explicitly permitted only for novice run groups per this document ('Snell M-rated helmets are permitted for HPDE Events novice run groups, however, participants are encouraged to upgrade to a Snell SA helmet when moving into higher run groups') — that's a soft encouragement rather than a hard rule for higher groups, so it isn't modeled as a separate ruleset; some regional programs may enforce SA-only for higher groups more strictly. The SFI/FIA/BS entries above are reasonable representative generations for those generically-named specs, not verified name-for-name against the document. 'Other helmets may also be acceptable if they are approved for PCA Club Racing (SFI, FIA)' per the Club Racing rulebook — not modeled here as Club Racing is a separate wheel-to-wheel program out of scope for this app.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the national Minimum Standards document, just not yet re-checked.",
    },
    hnr: {
      requirement: "conditional",
      condition:
        "Required only when the car is fitted with a competition harness system of five or more attachment points (SFI or FIA approved). Not required when using the stock/factory 3-point seatbelt. §10(g): 'An approved head and neck restraint device is required for all cars using harness systems. Cars must not be allowed on track if the Entrants do not have a head and neck restraint device while using harnesses.'",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true, note: "Document: 'it is recommended that the straps be replaced every five years' — stated as a recommendation, not a hard expiration rule." },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "10(g) Harness Systems" },
      confidence: "high",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "11(c) Footwear and Clothing" },
      confidence: "high",
      notes:
        "Not required at the national minimum-standard level. The document explicitly leaves this to individual Regions/Facilities: 'Facilities or Regions may have more specific requirements for footwear and clothing, including the possibility of fire-resistant race suits.' Check your specific PCA region's supplemental rules.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the national Minimum Standards document.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "'Footwear must be enclosed (not open-toe), non-slip, with a relatively smooth sole. Hiking-type deep lugged soles are not acceptable.' No fire-resistance or certification required at the national level.",
      citation: { ...sourceDoc, section: "11(c) Footwear and Clothing" },
      confidence: "high",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "11(c) Footwear and Clothing" },
      confidence: "high",
      notes: "Not mentioned anywhere in the national Minimum Standards document.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the national Minimum Standards document.",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required for (1) convertible/cabriolet cars driven with the top down — §10(d): 'If the top is in the down position, an SFI and/or FIA approved arm restraint system must be used'; and (2) all occupants of open-wheel/open-cockpit cars, regardless of run group — §10(e). Not required for closed cars, or convertibles driven top-up/hardtop-installed with factory rollover protection.",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Must be SFI and/or FIA approved when required — plain fire-resistant material does not qualify.",
      citation: { ...sourceDoc, section: "10(d)-10(e)" },
      confidence: "high",
    },
    seat: {
      requirement: "conditional",
      condition:
        "No seat requirement applies to cars running the stock/factory 3-point seatbelt. Only triggered if the Entrant chooses to install an (optional — see belts_harness) 5-or-more-point competition harness: §10(g), 'Harnesses must be used in conjunction with a seat that has the supplied routing holes for the shoulder and antisubmarine belts.' Porsche GT seats get a specific stock-mount allowance instead (§10(h)).",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "No seat certification (SFI/FIA) is required anywhere in this document — stock/factory seats are acceptable, including once a harness is installed, as long as the seat has the supplied shoulder/antisubmarine routing holes. §10(h) Porsche GT Seats: 'the lap belts of the harness system may be attached to the carbon seat stock mounts. The harness shoulder belts shall be attached to either a properly mounted harness bar or to the roll bar' — and the factory anti-submarine belt punch-out on the passenger seat may be removed to match the driver side per the Equal Restraints rule (§10(f)), described as 'the only permissible way to implement an anti-submarine belt for these seats.'",
      citation: { ...sourceDoc, section: "10(g)-10(h)" },
      confidence: "high",
      notes:
        "Corrected from a prior 'not_addressed' placeholder — re-reading §10(g)-(h) directly confirms the document does briefly address seats, just not as a standalone requirement: it's a routing-holes/mounting constraint tied to installing an optional competition harness, not something imposed on cars using the stock 3-point belt. A certified FIA/SFI seat obviously also satisfies the routing-holes requirement even though PCA doesn't itself name a minimum seat cert spec here — the generic seat standards list is offered on that basis. The document doesn't address seat sliders/rails vs. a fixed mount at all.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [
        {
          standardId: "sfi-16.1",
          validityYearsFromLabel: 2,
          note: "Document cites 'SFI' generically for 5-or-more-point harnesses without naming a specific slash-level; SFI 16.1/16.5/16.6 offered as reasonable representative specs, not verified name-for-name against the document.",
        },
        { standardId: "sfi-16.5", validityYearsFromLabel: 2 },
        { standardId: "sfi-16.6", validityYearsFromLabel: 2 },
        {
          standardId: "fia-8853-2016",
          validityYearsFromLabel: 5,
          note: "Document cites 'FIA' generically without naming a specific spec number.",
        },
        { standardId: "fia-8853-98", validityYearsFromLabel: 5 },
      ],
      materialNote:
        "Stock/OEM 3-point seatbelts are the accepted baseline restraint system. Installing a 5-or-more-point competition harness is optional, not mandated ('If the Entrant chooses to install a driving harness of five or more attachment points...'). If installed, it must be an SFI- or FIA-approved harness (no Y-type shoulder harnesses), mounted to the chassis/roll bar rather than the seat or seat rail (except the specific Porsche GT seat lap-belt stock-mount allowance in §10(h)), and it triggers a mandatory head-and-neck restraint device (see hnr category, §10(g)). Driver and passenger must use equal restraint types per §10(f) — a harness on one side requires a harness (not a 3-point belt) on the other.",
      citation: { ...sourceDoc, section: "10(f)-10(g) Equal Restraints / Harness Systems" },
      confidence: "high",
      notes:
        "'The SFI standard requires harnesses to be replaced every two years based on date of manufacture. The FIA standard allows the harness to be used until an expiration date at the end of the fifth year after the year of manufacture.' A narrow four-point-harness exception exists for non-Porsches using a vehicle-specific Schroth belt meeting FMVSS 209 attached to factory mounting points — not modeled as a separate acceptedStandards entry since it's a street-legal-belt allowance tied to a specific vehicle/product, not a general competition-harness certification.",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "Full document search found no mention of window nets anywhere in the national Minimum Standards document. Cabriolet/convertible cars driven top-down (§10(d)) and all occupants of open-cockpit cars (§10(e)) must use an SFI and/or FIA approved arm restraint system instead — but unlike some other bodies (e.g. PHA), this document never frames a window net as an available alternative/substitute for that arm restraint requirement, so satisfiedByAlternative isn't wired here.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "5(o) Corner Workers" },
      confidence: "high",
      notes:
        "No fire extinguisher is required to be carried in the Entrant's car anywhere in this document. The only extinguisher requirement stated is track-side: 'Fire extinguishers must be readily available at either the worker station or with the emergency / safety services teams' (§5(o)), and the site must have a fire truck and/or a tow truck equipped with fire emergency equipment on hand while cars are on track (§5(n) Fire and Emergency at the Site) — both event-infrastructure requirements, not car-mounted equipment.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the national Minimum Standards document.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "Not mentioned anywhere in the national Minimum Standards document — consistent with this being a run-what-you-brung HPDE program for street-based cars, where a stock/OEM fuel tank is assumed.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "Not mentioned anywhere in the national Minimum Standards document. Cabriolet/convertible and open-cockpit cars have arm-restraint requirements instead (§10(d)-10(e), see arm_restraint category) — no window net or seatbelt-cutter tool requirement is stated.",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "10(b) Final Safety Inspection" },
      confidence: "high",
      notes:
        "No master battery cutoff / kill switch is required. The Final Safety Inspection checklist only requires the battery to be secure ('Gas cap and battery secure'), not switched or externally accessible.",
    },
    tow_hook: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the national Minimum Standards document.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "Not mentioned anywhere in the national Minimum Standards document. §5(n) requires the site/facility to have a tow truck on hand, but that's event infrastructure, not driver-carried equipment.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the national Minimum Standards document.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "5(m) Medical Personnel at the Site" },
      confidence: "high",
      notes:
        "No personal/car-carried first aid kit is required. The document requires event-level medical coverage instead: 'At minimum, one EMT trained attendant and one emergency equipped vehicle must be on-site at all times while cars are on track' (§5(m)).",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "No hood pin, hood fastener, or positive hood-latching requirement found anywhere in the national Minimum Standards document (17-page document searched in full).",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "No spill kit, spill containment, or absorbent-material requirement found anywhere in the national Minimum Standards document.",
    },
    rollover_protection: {
      requirement: "conditional",
      rolloverProtectionByBodyStyle: {
        closed_roof: "not_addressed",
        convertible: "conditional",
        open_wheel: "not_addressed",
      },
      rolloverProtectionFactoryExempt: true,
      condition:
        "Only convertibles WITHOUT factory-installed rollover protection need an aftermarket roll bar/cage — it must pass the \"broomstick\" rule and meet PCA Club Racing Rules Appendix A. Open-wheel/open-cockpit cars have no cage rule here, but separately require fenders at all four corners and arm restraints for all occupants.",
      citation: { ...sourceDoc, section: "10(d)" },
      confidence: "high",
      notes:
        "\"If a car does not have factory installed rollover protection, a roll bar or roll cage must be installed, which meets the 'broomstick' rule... Design, installation and materials of roll bars or cages...must meet PCA Club Racing specifications, contained in Appendix A–Roll Cage Specifications of the PCA Club Racing Rules.\" That external Club Racing document isn't locally cached, so its specific tube/material table isn't modeled here.",
    },
  },
};

// ============================================================================================
// PCA Club Racing — a separate wheel-to-wheel program from the DE/HPDE ruleset above, governed by
// its own rulebook and its own National Stewards. Read directly and in full (63 pages, 2026
// edition) — confidence is high throughout except where explicitly noted. Class differences
// (Stock/Prepared/Modified/GT/GTA/GTC/GTP) are almost entirely car-prep/eligibility rules, not
// driver-PPE rules — "Driver Requirements" and most of "Car Requirements Applicable to All Cars in
// All Classes" apply uniformly, so one ruleset covers the whole program, same reasoning bmwcca.ts
// uses for its own Club Racing ruleset above.
// ============================================================================================

const clubRacingSourceDoc = {
  title: "PCA Club Racing Rules",
  version: "2026 Rules Book",
  url: "https://pcaclubracing.org/wp-content/uploads/2026/03/2026-PCA-Club-Racing-Rules.pdf",
};

const clubRacing: Ruleset = {
  id: "pca-club-racing",
  bodyId: "pca",
  bodyName: "PCA Club Racing",
  disciplineName: "Club Racing (Stock / Prepared / Modified / GT / GTA / GTC / GTP)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-31",
  sourceDocuments: [{ ...clubRacingSourceDoc, section: "Driver Requirements; Car Requirements Applicable to All Cars in All Classes" }],
  techSheet: { url: "https://pcaclubracing.org/wp-content/uploads/forms/current/Technical-Compliance.pdf", format: "PDF" },
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2025", validityYearsFromLabel: 10 },
        { standardId: "snell-sa2020", validityYearsFromLabel: 10 },
        { standardId: "snell-sa2015", validityYearsFromLabel: 10 },
        { standardId: "snell-sah2010", validityYearsFromLabel: 10 },
        { standardId: "sfi-31.1-2020", validityYearsFromLabel: 10, note: "Rulebook cites bare 'SFI 31.1' without a slash-level or generation year — mapped to the two most recent registered SFI 31.1 generations as a reasonable representative match, not verified name-for-name." },
        { standardId: "sfi-31.1-2015", validityYearsFromLabel: 10 },
        { standardId: "bs-6658-1985", validityYearsFromLabel: 10, note: "Rulebook: 'BS6658-85 type A/FR.'" },
        { standardId: "fia-8859-2020", validityYearsFromLabel: 10, note: "Rulebook cites 'FIA for racing automobiles' generically without a specific spec number or generation — current-era FIA generations offered as a reasonable interpretation." },
        { standardId: "fia-8859-2024", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2024", validityYearsFromLabel: 10 },
      ],
      fullFaceRequirement: "conditional",
      fullFaceCondition: "Required only for drivers of vehicles without full windshields, or running without a top in place (e.g. Targas without the top on) — closed cars with a full windshield may use an open-face helmet.",
      citation: { ...clubRacingSourceDoc, section: "Driver Requirements 1-3" },
      confidence: "high",
      notes:
        "'Helmets expire at the end of the 10th year after the year of manufacture' — applied uniformly above as a 10-year validity window from the label date, regardless of which listed standard the helmet meets. Helmet must have the driver's name on the rear and the approved PCA Club Racing Inspection sticker on the left side; replacement/relining after 5 years of actual use is recommended but not mandatory.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required for drivers with mustaches, beards, or long hair extending below the helmet.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook just specifies 'fire-retardant balaclava' — no specific certification number cited.",
      citation: { ...clubRacingSourceDoc, section: "Driver Requirements 5" },
      confidence: "high",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true, note: "No expiration date per the rulebook, but 'racers should consider replacing straps after five years of use' — a recommendation, not a hard rule." },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true, note: "Not explicitly named by the rulebook (which only cites 'FIA 8858 or its successor'), offered as the current FIA generation." },
      ],
      citation: { ...clubRacingSourceDoc, section: "Driver Requirements 4" },
      confidence: "high",
      notes: "Required for all drivers unconditionally — unlike PCA's own DE/HPDE ruleset, this isn't gated on whether a competition harness is fitted.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.2a-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "sfi-3.2a-1", note: "Only acceptable if fire-retardant long underwear is also worn — see undergarment." },
      ],
      citation: { ...clubRacingSourceDoc, section: "Driver Requirements 5" },
      confidence: "high",
      notes: "Must be a one-piece suit. Display of the PCA Club Racing patch is 'strongly encouraged' but not required.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [{ standardId: "sfi-3.3-5" }, { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018" }],
      citation: { ...clubRacingSourceDoc, section: "Driver Requirements 5" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [{ standardId: "sfi-3.3-5" }, { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018" }],
      citation: { ...clubRacingSourceDoc, section: "Driver Requirements 5" },
      confidence: "high",
      notes: "Rulebook cites the same SFI 3.3/5 or FIA 8856-2000/2018 standards for driving shoes as for gloves.",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'Fire retardant socks are required' — no specific certification number cited.",
      citation: { ...clubRacingSourceDoc, section: "Driver Requirements 5" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Mandatory (fire retardant long underwear) only if the driving suit is SFI 3.2A/1. For the SFI 3.2A/5 or FIA 8856 suit tiers, no undergarment requirement is stated.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'fire retardant long underwear' — a material description, no specific certification number cited.",
      citation: { ...clubRacingSourceDoc, section: "Driver Requirements 5" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required for drivers of open cars, cabriolets, and cars with non-stock non-metal roofs — except stock roofs on Targas/914s/factory sunroofs, and except Boxsters with the allowed aftermarket plastic top plus a custom-fabricated roof net filling the roll cage's halo area. Also not required if a triangular window net approved by FIA or SFI for sedan race cars is used instead (see window_net) — though PCA advises a triangular net alone doesn't provide equivalent protection to a rectangular net plus arm restraints.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook just says 'approved arm restraints' — no specific certification standard named.",
      citation: { ...clubRacingSourceDoc, section: "Driver Requirements 6; Car Requirements 12" },
      confidence: "high",
    },
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [
        { standardId: "fia-8855-1999", validityYearsFromLabel: 6, note: "Appendix I: an FIA 8855-1999 approved seat within 6 years of manufacture, installed per FIA/manufacturer spec with a compliant metal seat mount, exempts the car from the seat back brace requirement below." },
        { standardId: "fia-8862-2009", validityYearsFromLabel: 11, note: "Appendix I: same seat-back-brace exemption, but with an 11-year manufacture window instead of 6." },
      ],
      materialNote:
        "No seat certification is required by default — the base rule (Car Requirements 4) just requires 'a dedicated one-piece race seat with routing for straps,' with a headrest extending above the midpoint of the helmet's back, plus a seat back brace (metal seat: min. 12 sq. in. contact + bolted; composite seat: min. 30 sq. in. contact + 0.5-2in high-density foam padding, not bolted unless the seat is designed for it). Two exceptions to the brace: (1) seat within 3\" of the firewall (padding recommended instead), or (2) an Appendix I FIA-certified seat + compliant mount per acceptedStandards above.",
      citation: { ...clubRacingSourceDoc, section: "Car Requirements 4-7; Appendix I" },
      confidence: "high",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-16.1", validityYearsFromLabel: 2, note: "Rulebook cites 'SFI' generically for 5/6/7-point harnesses without naming a specific slash-level; SFI 16.1/16.5/16.6 offered as reasonable representative specs." },
        { standardId: "sfi-16.5", validityYearsFromLabel: 2 },
        { standardId: "sfi-16.6", validityYearsFromLabel: 2 },
        { standardId: "fia-8853-2016", validityYearsFromLabel: 5, note: "Rulebook cites 'FIA' generically without naming a specific spec number." },
        { standardId: "fia-8853-98", validityYearsFromLabel: 5 },
      ],
      citation: { ...clubRacingSourceDoc, section: "Car Requirements 8; Appendix B" },
      confidence: "high",
      notes:
        "5, 6, or 7-point harnesses required — no Y-type shoulder harnesses allowed. Strap material must be replaced no later than 2 years after manufacture (SFI) or the printed expiration date (FIA). Must mount to the chassis or roll cage (backed by large-diameter washers if not using stock mounts) — never to the seat or seat rail — with no two straps sharing a single mounting bolt. Appendix B: shoulder harness angle from the driver's shoulders must be no more than 30° above nor more than 10° below horizontal.",
    },
    window_net: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-27.1", note: "Rulebook doesn't cite a specific product certification for the standard rectangular/string-or-strap net — an SFI 27.1 net obviously also satisfies the 'adequate coverage' test in materialNote." },
        { standardId: "fia-8863-2013" },
        { standardId: "fia-8863-2015" },
      ],
      materialOnlyAccepted: true,
      materialNote:
        "Base requirement (Appendix D) is functional, not a certification number: both front door windows down/removed, with a net that 'adequately covers' the driver's window opening area — meaning it covers everywhere a hand or helmet could protrude in a crash. If a net covers the helmet but not the hands, arm restraints (both arms) must be added. Separately, a triangular net specifically must be 'approved by FIA or SFI for sedan race cars' to be used without arm restraints — that narrower cert requirement applies only to the triangular-net path, not the standard rectangular net.",
      citation: { ...clubRacingSourceDoc, section: "Car Requirements 12-13; Appendix D" },
      confidence: "high",
      notes:
        "Exceptions: GTP-class factory-built/recognized prototypes may run windows-up without a net if that matched their professional-era rules; GT/GTC3-and-higher/GTA cars may run factory-style plastic side windows instead (with conditions on sourcing/removability) — removing a plastic door window still triggers the window net requirement. Net must mount securely to the roll cage (not the door) with a top-release mechanism so it falls when released; plastic tie wraps and elastic cords are explicitly disallowed as attachment means.",
    },
    fuel_cell: {
      requirement: "recommended",
      materialOnlyAccepted: true,
      acceptedStandards: [],
      materialNote:
        "Fuel cells are allowed in all classes (never mandatory) and 'strongly recommended' specifically for Modified Class cars only — the stock gas tank is an accepted baseline everywhere else. Unlike some other bodies (e.g. BMW CCA), this rulebook states no FIA FT-3/FT-5-style certification requirement for an installed fuel cell — only that it be in the stock gas tank location outside GT/GTP classes.",
      citation: { ...clubRacingSourceDoc, section: "Car Requirements — Fuel System 3" },
      confidence: "high",
    },
    fire_extinguisher: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Rulebook: 'a 2-1/2 lb. or larger SFI, FIA, UL, or NFPA approved fire extinguisher capable of extinguishing B/C type fires' — no SFI/FIA extinguisher StandardDef is registered in this app, so this is checked on capacity/rating text rather than a certification lookup.",
      satisfiedByAlternative: "fire_suppression",
      citation: { ...clubRacingSourceDoc, section: "Car Requirements 2" },
      confidence: "high",
      notes: "Must be securely metal-to-metal mounted in the cockpit, convenient to the driver while seated and restrained. An on-board fire suppression system of equal or larger capacity may be substituted (see fire_suppression) — the rulebook frames the two as interchangeable, so satisfiedByAlternative is wired both ways.",
    },
    fire_suppression: {
      requirement: "recommended",
      acceptedStandards: [],
      satisfiedByAlternative: "fire_extinguisher",
      citation: { ...clubRacingSourceDoc, section: "Car Requirements 2" },
      confidence: "high",
      notes:
        "'An on-board fire suppression system of equal or larger capacity may be substituted for a hand-held extinguisher, and is strongly recommended' — optional, not mandatory, and no specific system certification (e.g. SFI 17.1, FIA 8865) is cited in this rulebook, unlike the car-equipment specs elsewhere in the same document. If installed, it should include external actuation on the cowl (in addition to driver actuation), identified with the standard red-circled 'E' decal.",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...clubRacingSourceDoc, section: "Car Requirements 3; Appendix C" },
      confidence: "high",
      notes:
        "An externally accessible pull wire or externally mounted electrically operated switch, preferably on the driver's side, marked with the approved 'lightning bolt / OFF' decal. Must disconnect the battery from all circuits except an electrically operated on-board fire system, and must shut off the engine while running well above idle speed.",
    },
    tow_hook: {
      requirement: "required",
      citation: { ...clubRacingSourceDoc, section: "General Requirements 3" },
      confidence: "high",
      notes: "Front and rear tow hook, strap, or other suitable device. Recommended (not required) to be positioned for easy access in a gravel trap and to not protrude beyond the bumper.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...clubRacingSourceDoc },
      confidence: "high",
      notes: "The rulebook requires front/rear tow points on the car itself (see tow_hook) but never requires the driver/team to carry their own tow rope or strap.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...clubRacingSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...clubRacingSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook as a car-carried or driver-carried item.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...clubRacingSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook. The window net's own top-release mechanism (Appendix D) is the closest related provision, but no separate window-breaker tool or seatbelt cutter is required.",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...clubRacingSourceDoc },
      confidence: "high",
      notes: "Hood pins are mentioned only as an allowed alternative to stock hood latches ('If hood pins are installed, stock hood latches may be removed or disabled') — a permissive car-prep note, not a requirement of any kind.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...clubRacingSourceDoc, section: "Enduro Pit Stop rules" },
      confidence: "high",
      notes: "No onboard spill kit, absorbent material, or drip pan requirement was found. Fuel spill handling during Enduro pit stops is addressed as a penalty/procedure matter (spills over 9\" diameter are penalized), not car-carried equipment.",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionTubingSpec: [
        { underWeightLbs: 2500, minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.095 }], materialNote: "Mild steel, under 2500 lbs without driver. An alloy-steel alternative of 1.375\" x 0.095\" is also listed for this weight tier." },
        { minSizes: [{ outerDiameterIn: 1.75, wallThicknessIn: 0.095 }, { outerDiameterIn: 1.5, wallThicknessIn: 0.12 }], materialNote: "Mild steel, 2500 lbs and over without driver. An alloy-steel alternative of 1.5\" x 0.095\" is also listed for this weight tier." },
      ],
      rolloverProtectionRequiresPadding: true,
      rolloverProtectionPaddingCertRequired: true,
      citation: { ...clubRacingSourceDoc, section: "Car Requirements 1; Appendix A" },
      confidence: "high",
      notes:
        "Full cockpit-width cage (except as originally supplied by the factory for open race cars) with two fore/aft braces at the main hoop (≥30° included angle) plus a diagonal cross brace, mounted metal-to-metal to the floor/unibody with ≥3/16\" backing plates and grade-5+ bolts. Full-width main hoop plus a full-width front hoop or two side-halo hoops connected across the windshield top; at least one door bar per side below window level. Carbon fiber cages are not allowed. Factory roll cages as delivered in factory race cars are allowed; Porsche-installed street-car cages are allowed in stock class if FIA-certified. Padding: high-density foam ≥3/4\" thick on any portion the driver's helmet could contact, equivalent to SFI 45.1 or FIA 8857 hardness. Exceptions to the roll cage requirement entirely: GTP-class factory-built prototypes retaining original safety systems, and GT-6 class open-top 356s/historically significant cars approved by the PCA Club Racing Technical and Rules Committee.",
    },
  },
};

export const pcaRulesets: Ruleset[] = [de, clubRacing];

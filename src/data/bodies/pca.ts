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
  },
};

export const pcaRulesets: Ruleset[] = [de];

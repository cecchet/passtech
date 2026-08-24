import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_SEAT_STANDARDS, SFI_3_3_IDS } from "../standards";

// Shared across roadRacing's base helmet rule and its two "open car" classOverrides below —
// the accepted certification ladder doesn't change for open cars, only the full-face mandate does.
const roadRacingHelmetAcceptedStandards = [
  { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "CCR: SA2020-minimum becomes required starting Jan 1, 2027." },
  { standardId: "snell-ea2016", expiresOn: "2026-12-31" },
  { standardId: "snell-sa2020", noExpiration: true },
  { standardId: "snell-sa2025", noExpiration: true },
  { standardId: "fia-8860-2010", expiresOn: "2026-12-31", note: "Alone (without a newer FIA 8859 pairing) drops out when the Jan 1, 2027 cutover takes effect." },
  { standardId: "fia-8859-2015", noExpiration: true },
  { standardId: "fia-8860-2018", noExpiration: true },
  { standardId: "fia-8860-2024", noExpiration: true },
  { standardId: "fia-8859-2020", noExpiration: true },
  { standardId: "fia-8859-2024", noExpiration: true },
];

const roadRacing: Ruleset = {
  id: "nasa-road-racing",
  bodyId: "nasa",
  bodyName: "NASA",
  disciplineName: "Road Racing",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "NASA Club Codes and Regulations (CCR)",
      version: "2026.3 Edition",
      url: "https://members.drivenasa.com/rules/ccr.pdf",
      section: "15.17 Driver's Attire",
    },
  ],
  // CCR §15 (Racing) doesn't define named competition classes (Spec Miata, ST, GTS, etc.) at all —
  // those live in separate, non-NASA-published class rulesets that this app doesn't have access to
  // (§17.7: "Each competition vehicle must conform to the published set(s) of rules for its class,"
  // and §15.24 sends non-NASA-classed vehicles like Legends Cars back to their OWN sanctioning
  // body's equipment rules entirely). A full-document search of the CCR's Racing chapter found
  // exactly two driver/car-equipment rules that DO turn on a body-style class NASA's own CCR text
  // names directly: full-face helmets are required (not just "highly recommended") in "open" cars —
  // CCR's own term for FFR, sports racers, and formula cars (§15.17.5) — and tow eyes are required
  // for "all race vehicles, except formula cars" (§15.12, narrower than the full-face group). A
  // third formula-car exemption exists (right-side impact head restraint, §15.17.9) but isn't
  // modeled here since this app doesn't track that as its own category (see the seat category's
  // notes). No other car-safety-gear category (seat, belts_harness, fuel_cell, fire_suppression,
  // window_net) cites any class- or body-style-specific split anywhere in the CCR.
  classes: [
    { id: "formula", label: "Formula Cars" },
    { id: "sports-racer-ffr", label: "Sports Racers / FFR (Factory Five Racing) — Open, Non-Formula" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: roadRacingHelmetAcceptedStandards,
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.3" },
      confidence: "high",
      notes:
        "Snell M-rated (motorcycle) helmets — M2015, M2020, CMR2007, etc. — are explicitly NOT acceptable for NASA road racing competition (they are allowed for HPDE/Time Trial under a separate, more lenient CCR §11.3.1 rule, which this app does not cover). 'Strongly recommended' to replace after any substantial impact, though that is not a hard rule. CCR §15.17.5: a full-face helmet with an impact-resistant face shield is required in 'open' cars — FFR, sports racers, and formula cars — and merely 'highly recommended' (not mandatory) for everyone else; select the Formula Cars or Sports Racers / FFR class above for the full-face-required version of this rule.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { title: "NASA CCR", version: "2026.3" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the CCR, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true, note: "CCR Appendix D: SFI-certified devices over 5 years old 'should' be sent back for recertification — worded as a recommendation, not a hard mandate, so not encoded as a hard expiration here." },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.8, Appendix D §29.1.1" },
      confidence: "high",
      notes: "Mandatory for all drivers, no class/speed threshold.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-1", note: "Minimum tier. Diesel/diesel-mix vehicles require 3.2A/5 or higher instead." },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "sfi-3.4-5", note: "CCR: 'SFI 3.4 is an acceptable substitute where 3.2 is used.'" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-1986" },
        { standardId: "fia-8856-2018" },
      ],
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.1" },
      confidence: "high",
      notes: "One-piece suits required.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Fire-resistant material, fully covering the hands with no exposed skin when worn with the driving suit. No specific SFI/FIA certification number cited by the CCR.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.4" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Fire-resistant material OR plain cowhide leather, covering the entire foot with no exposed skin. No specific certification number cited by the CCR.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.6" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "CCR §15.17.7: 'Socks made of fire-resistant material must be worn.' No specific certification number cited.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.7" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required unless the driving suit is already rated SFI 3.2A/5 or higher, or FIA 8856-2000/2018 — in which case it's 'strongly recommended' but not mandatory. Diesel/diesel-mix vehicles require it if suit rating is below 3.2A/10.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "CCR: 'Long underwear made of fire-resistant material.' Certification to SFI 3.3 or FIA 8856-2000 is 'strongly recommended in all cases' but plain fire-resistant material satisfies the base requirement.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.2" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required in open cars, and in cars with open T-tops, open Targa tops, a missing moon/sunroof, or a glass moon/sunroof (§15.5, item 1).",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No SFI or FIA certification number cited by the CCR for this item (contrast: window nets separately cite SFI 27.1 or FIA, at §15.10).",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.5" },
      confidence: "high",
      notes:
        "Not framed as interchangeable with a window net: §15.5 mandates arm restraints purely by car body style (open cars/T-tops/Targa/sunroof), while §15.10 separately mandates a driver's-side window net on essentially all cars regardless of body style — both apply independently, not as alternatives to each other (contrast NASA RallySport, where the two ARE interchangeable — see the rallySport ruleset).",
    },

    // --- Car safety gear ---------------------------------------------------------------------
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "CCR §15.16: seat must be securely fastened/braced to minimize breaking loose in an impact; large fender washers and solid fabricated mounts recommended. Seats made primarily of plastic, polymer, PVC, or ABS are prohibited; fiberglass/carbon-fiber/Kevlar seats made for road racing are permitted. §15.16.1: 'A racing seat is of solid design; not \"tube and cloth\" designs commonly found in passenger cars' — despite the label 'racing seat,' this defines the requirement purely by construction (a rigid shell, not a folding tube-and-cloth frame), with no certification or aftermarket-only mandate, so an unmodified factory shell/bucket-style sport seat (common in many OEM sport trims) can qualify as-is; a factory seat that is genuinely tube-and-cloth construction or has a plastic/PVC/ABS shell would not. §15.16.2: seat shall be mounted to a steel floor pan with reinforcements, or through a frame member with added reinforcement.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.16, 15.16.1, 15.16.2" },
      confidence: "high",
      notes:
        "Re-verified against the CCR PDF: §15.16/.1/.2 never cite a specific SFI (39.1/39.2) or FIA (8855/8862) seat certification number — the requirement is a construction/material/mounting rule, not a labeled certification. That construction rule (solid-shell design, no plastic/PVC/ABS, no tube-and-cloth) does not by itself foreclose a genuine unmodified stock seat, so materialOnlyAccepted is true, matching PHA's pattern — a certified racing seat trivially satisfies the same construction rule too, hence acceptedStandards lists the app's generic seat-standard set even though the CCR itself never names a spec. Also relevant: §15.17.9 separately requires a right-side impact head restraint (bolstered seat or side-impact head net) for all non-formula cars — not modeled as its own category here.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-16.1",
          validityYearsFromLabel: 2,
          note: "CCR §15.5: belts must 'bear a dated label of no more than two (2) years old, or show an expiration date' — belts produced from 2017 onward print their own expiration date directly; older/undated stock falls back to the 2-year-from-label-date rule modeled here.",
        },
        { standardId: "sfi-16.5", validityYearsFromLabel: 2, note: "Same 2-year-from-label (or printed-expiration for 2017+ production) rule as SFI 16.1 — CCR §15.5." },
        {
          standardId: "fia-8853-98",
          note: "CCR §15.5: 'FIA 8853/98, or D-###.T/98, or higher, including amendment 1/92' — FIA-labeled belts print their own expiration date directly on the label; usable through December 31 of the year shown.",
        },
      ],
      materialNote: "CCR §15.5: 'All vehicles should have a five (5), six (6), or seven (7) point seat belt system... all belts must meet at least one of the following [SFI or FIA cert]' — a certified harness is required for Racing (contrast the CCR's separate, more lenient HPDE-only §11.4.8, which allows stock/OEM belts; not covered by this app's Road Racing ruleset).",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.5" },
      confidence: "high",
      notes:
        "5-point is the floor; 6-point recommended for upright/semi-reclined seating (to 30°), 7-point recommended for seats reclined more than 30°. Only separate shoulder straps permitted ('H' belts OK, 'Y' belts prohibited). Any driver involved in a high-impact crash must send all belts back to the manufacturer for inspection/re-webbing/re-certification before reuse. CCR §15.5 doesn't explicitly name FIA 8853-2016 or FIA 8854-98 — only 'FIA 8853/98... or higher' — so those aren't added here without further confirmation, matching this file's existing firesuit-note convention of not over-extending an 'or higher' clause without seeing exact newer designations named.",
    },
    window_net: {
      requirement: "required",
      condition:
        "Required on the driver's side, with a narrow exception: vehicles originally designed and delivered from the factory with lexan (polycarbonate) side windows may keep those installed instead (§15.10).",
      acceptedStandards: [{ standardId: "sfi-27.1", noExpiration: true, note: "CCR §15.10: 'shall carry an SFI 27.1 or FIA label' — no specific FIA spec number is named for the window net itself; mapped generically to FIA 8863-2015, the app's only registered window-net FIA standard." }, { standardId: "fia-8863-2015", noExpiration: true, note: "CCR only says 'FIA label' generically for window nets, without naming 8863-2015 specifically." }],
      citation: { title: "NASA CCR", version: "2026.3", section: "15.10" },
      confidence: "high",
      notes:
        "CCR §15.10 also requires both side glass windows to be run fully open during Racing sessions (except the lexan-window exception above) — the window net is what keeps the driver's arm/body inside the car with the window open, not an interchangeable alternative to the arm restraint (§15.5), which is a separate, body-style-driven requirement. See the arm_restraint notes above for why the two are NOT wired as satisfiedByAlternative here, unlike NASA RallySport.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition:
        "CCR §15.4.1: 'A fuel cell is not required, except as specified by class rules.' A stock/OEM fuel tank is acceptable where no class-specific fuel cell mandate applies. However, ANY vehicle that does have a fuel cell installed — mandated or not — must comply with the full §15.4 fuel cell ruleset regardless of whether the class required one.",
      materialOnlyAccepted: true,
      acceptedStandards: [
        { standardId: "fia-ft3-1999", validityYearsFromLabel: 5, note: "CCR §15.4: bladder must be FIA FT-3 (or higher) rated; §15.4.1 item 9: 'Bladders older than 5 years may not be used' (measured from the manufacture date printed on the bladder — no re-certification/extension mechanism is mentioned)." },
        { standardId: "fia-ft3.5-1999", validityYearsFromLabel: 5, note: "Treated as a 'higher' tier than FT3 per CCR §15.4's 'FT-3 (or higher)' wording; same 5-year bladder-age cutoff applies." },
        { standardId: "fia-ft5-1999", validityYearsFromLabel: 5, note: "Treated as a 'higher' tier than FT3 per CCR §15.4's 'FT-3 (or higher)' wording; same 5-year bladder-age cutoff applies." },
      ],
      materialNote: "Stock/OEM fuel tank accepted for any vehicle whose class doesn't mandate a fuel cell (§15.4.1). Where a cell IS installed, the bladder must be FIA FT3 (or higher) certified, housed in a container meeting minimum-thickness steel/aluminum/Marlex/carbon-fiber specs, separated from the driver by a solid bulkhead, and mounted forward of the seat's front mount or rearward of its rear mount (not laterally beside the driver). Rotary-molded cells (e.g. most JAZ/RCI) are prohibited unless the bladder itself carries a current FIA FT3 mark.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.4, 15.4.1, 15.4.3" },
      confidence: "high",
      notes: "CCR names only 'FIA FT-3 (or higher)' without spelling out FT3.5/FT5 by name — those are included here as the registry's next tiers up from FT3, consistent with an 'or higher' reading, but not verbatim-cited standard numbers. SFI 28.1 is not mentioned anywhere in the CCR for fuel cells.",
    },
    fire_extinguisher: {
      requirement: "recommended",
      materialNote:
        "CCR §15.1: 'A fire extinguisher is recommended in addition to the required fire system' (see fire_suppression) — purely optional, not a substitute for or alternative to the mandatory on-board fire system. If fitted, it must be securely mounted within the driver's reach (seated, belted, wheel in place) using a metal, quick-release bracket with metal mounting hardware (no sheet-metal screws or rivets).",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.1" },
      confidence: "high",
      notes: "CCR does not specify a minimum size, weight, or UL rating for this optional handheld extinguisher — full document search found no numeric spec, unlike the mandatory on-board fire system in §15.2. No fireExtinguisherOptions are modeled here as a result.",
    },
    fire_suppression: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-17.1", noExpiration: true },
        { standardId: "sfi-17.2", noExpiration: true },
        { standardId: "fia-technical-list-16", noExpiration: true },
      ],
      materialNote:
        "CCR §15.2: on-board fire system required, meeting SFI 17.1 or 17.2, or listed by the FIA on Technical List No. 16, with a visible SFI/FIA certification decal. Must include at least 2 nozzles (1 cockpit, 1 engine bay), with the activation point (if manual) reachable by the belted driver. An electric solenoid/switch activator must not lose power when the master switch or ignition is cut. Two 'E' decals required (§15.3): one inside at the activation point, one outside nearest the most accessible activation switch.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.2, 15.3" },
      confidence: "high",
      notes: "CCR explicitly names 'SFI specification 17.1 or 17.2' — both are now registered in src/data/standards.ts.",
    },
    kill_switch: {
      requirement: "required",
      materialNote:
        "CCR §15.8: an electrical master switch is required, mounted so it's easily accessible from outside the vehicle (e.g. cowling near wipers, away from likely damage), cutting the engine and all power except the on-board fire system, radio communication, and life-support/medical devices. Location must be clearly marked with a master switch cut-off decal.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.8" },
      confidence: "high",
    },
    tow_hook: {
      requirement: "required",
      materialNote:
        "CCR §15.12 ('Tow Eyes'): all race vehicles except formula cars must have at least two easily accessible, usable tow eyes/points — one front, one rear. Must not protrude dangerously or require removing bodywork/panels to access. CCR warns that without them, the tow crew will hook onto whatever's available (at the competitor's own risk) — NASA and the tow crew disclaim liability for resulting damage.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.12" },
      confidence: "high",
      notes:
        "Unlike PHA (where towing eyes are only 'strongly recommended'), NASA CCR §15.12 makes this a hard requirement for Road Racing (formula cars excepted — select the Formula Cars class above to see the exemption applied). No color-marking rule is stated, unlike NASA RallySport's painted/colored tow points.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { title: "NASA CCR", version: "2026.3" },
      confidence: "high",
      notes: "Full document search (all ~112 pages) found no requirement for a competitor to carry a tow rope/strap in the car — CCR §15.12 covers only fixed tow eyes/points, not a rope or strap to be carried.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { title: "NASA CCR", version: "2026.3" },
      confidence: "high",
      notes: "Full document search found no mention of a warning/emergency triangle anywhere in the CCR.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { title: "NASA CCR", version: "2026.3" },
      confidence: "high",
      notes: "Full document search found no requirement for competitors to carry a first aid kit in their car.",
    },
  },
  classOverrides: {
    formula: {
      helmet: {
        requirement: "required",
        acceptedStandards: roadRacingHelmetAcceptedStandards,
        fullFaceRequirement: "required",
        fullFaceCondition: "CCR §15.17.5: 'A full-face helmet with an impact-resistant face shield is required in \"open\" cars (FFR, sports racers, and formula cars).' Formula cars are one of the three named open-car categories.",
        citation: { title: "NASA CCR", version: "2026.3", section: "15.17.3, 15.17.5" },
        confidence: "high",
        notes:
          "Same certification ladder and Snell-M-not-accepted rule as the base helmet category — only the full-face mandate changes for this class.",
      },
      tow_hook: {
        requirement: "not_addressed",
        citation: { title: "NASA CCR", version: "2026.3", section: "15.12" },
        confidence: "high",
        notes:
          "CCR §15.12: 'It is required that all race vehicles, except formula cars, have at least two (2) easily accessible... tow eyes.' Formula cars are the one named exemption from this Racing-chapter mandate. Not modeled as 'recommended' — the CCR states no fallback recommendation specific to formula cars here (contrast the separate HPDE-only §11.4.19, 'STRONGLY recommended' for all vehicles, which is out of scope for this Racing ruleset).",
      },
    },
    "sports-racer-ffr": {
      helmet: {
        requirement: "required",
        acceptedStandards: roadRacingHelmetAcceptedStandards,
        fullFaceRequirement: "required",
        fullFaceCondition: "CCR §15.17.5: 'A full-face helmet with an impact-resistant face shield is required in \"open\" cars (FFR, sports racers, and formula cars).' Sports racers and FFR (Factory Five Racing-style kit cars) are two of the three named open-car categories.",
        citation: { title: "NASA CCR", version: "2026.3", section: "15.17.3, 15.17.5" },
        confidence: "high",
        notes:
          "Same certification ladder and Snell-M-not-accepted rule as the base helmet category — only the full-face mandate changes for this class. Unlike formula cars, sports racers/FFR are NOT named in the §15.12 tow-eye exemption, so tow_hook is left un-overridden here and falls back to the base 'required' rule.",
      },
    },
  },
};

const rallySport: Ruleset = {
  id: "nasa-rallysport",
  bodyId: "nasa",
  bodyName: "NASA",
  disciplineName: "RallySport",
  disciplineGroup: "Rally",
  supportsCodriver: true,
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "NASA Rally Sport GRR, Section 3: Technical Regulations for Cars",
      version: "16.0",
      url: "https://nasarallysport.com/rules-forms/2025%20NASA-Rally-Sport-GRR-Section-3.pdf",
      section: "3.36 Personal Safety Items for Occupants",
    },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", validityYearsFromLabel: 10, note: "GRR: 'Helmets over 10 years old are not permitted' — applies to all accepted standards, measured from date on the helmet." },
        { standardId: "snell-sa2020", validityYearsFromLabel: 10 },
        { standardId: "snell-sa2025", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2010", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2024", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2024", validityYearsFromLabel: 10 },
      ],
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.36.1.1" },
      confidence: "high",
      notes: "Helmets must also be unmodified. Applies to all crew (driver and navigator).",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the current GRR Section 3, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", note: "GRR: 'SFI rated devices must not be expired' — a hard requirement, but the GRR does not itself state a numeric years-old cutoff the way it does for helmets; follow the date on the SFI tag." },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true, note: "An FIA sticker supersedes an SFI sticker. FIA devices don't expire, but tethers are dated and expire at (manufacture year + 5) — not modeled separately here; check tether date independently." },
      ],
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.36.1.3" },
      confidence: "high",
      notes: "Mandatory for both driver and co-driver/navigator.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with fire-resistant underwear meeting an FIA or SFI specification." },
      ],
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.36.1.2" },
      confidence: "high",
      notes: "Required for both crew members. Narrower SFI ladder than NASA Road Racing (no 3.2A/10, /15, /20 tiers named) and no diesel-specific carve-out.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0" },
      confidence: "high",
      notes: "Confirmed real gap: no glove requirement, standard, or recommendation anywhere in the current GRR Section 3.",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0" },
      confidence: "high",
      notes: "Confirmed real gap: no shoe requirement anywhere in the current GRR Section 3.",
    },
    socks: {
      requirement: "not_addressed",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0" },
      confidence: "high",
      notes: "Confirmed real gap: no sock requirement anywhere in the current GRR Section 3, consistent with the absent shoe/glove requirements.",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Required only if the suit worn is the minimum-tier SFI 3.2A/1; not addressed (not even recommended) for higher-rated suits.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "GRR requires underwear 'meeting an FIA or SFI specification' — a certified item, not just generic fire-resistant material. No exact spec number named; mapped here to SFI 3.3 / FIA 8856-2000/2018.",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.36.1.2" },
      confidence: "medium",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "An alternative to a window safety net, for vehicles running without closed windows in the driver's or co-driver's door (§3.22.3). If a window net is fitted instead, no arm restraint is required.",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({
        standardId,
        noExpiration: true,
        note: "GRR: 'SFI certified window nets or arm restraints... may be used beyond the expiration date.'",
      })),
      materialNote: "GRR requires arm restraints used as a window-net alternative to specifically meet SFI 3.3 — plain material doesn't qualify for this substitution.",
      satisfiedByAlternative: "window_net",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.22.3" },
      confidence: "high",
    },

    // --- Car safety gear ---------------------------------------------------------------------
    seat: {
      requirement: "required",
      materialOnlyAccepted: false,
      seatRailsForbidden: true,
      acceptedStandards: [
        { standardId: "fia-8855-1999", noExpiration: true, note: "GRR §3.9: 'Seats do not expire but must be in good condition and should be replaced if involved in a significant accident.'" },
        { standardId: "fia-8855-2021", noExpiration: true, note: "Using the mount supplied with the seat is required to meet this standard — GRR §3.9." },
        { standardId: "fia-8862-2009", noExpiration: true, note: "Using the mount supplied with the seat is required to meet this standard — GRR §3.9." },
      ],
      materialNote:
        "GRR §3.9: seat must be one-piece racing-use construction, firmly mounted to the shell/chassis to prevent movement in an accident; fasteners at least 8mm SAE grade 5 (or metric grade 8.8) or better. Sliders are explicitly prohibited. A certified/homologated FIA seat (8855-1999, 8855-2021, or 8862-2009) is required — unlike NASA Road Racing, RallySport does not accept an uncertified seat of any construction.",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.9" },
      confidence: "high",
      notes:
        "Re-verified against the GRR Section 3 PDF: §3.9 states plainly 'Use of FIA certified/homologated seats is required,' immediately after the one-piece/racing-use construction language — a certified-only mandate with no material/construction-only path, confirming materialOnlyAccepted: false. §3.9 also states verbatim: 'The use of sliders is prohibited' — same rule as ARA's RTR 2.3.2, now enforced via seatRailsForbidden rather than prose-only.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-16.1", note: "GRR §3.10: 'All SFI certified restraints must be maintained, inspected, and replaced or rewebbed on or before the expiration date on the SFI tag' — follow the printed tag date; GRR doesn't state a computed years-from-label default the way NASA Road Racing's CCR does." },
        { standardId: "sfi-16.5", note: "Same 'follow the SFI tag's own expiration date' rule as SFI 16.1 — GRR §3.10." },
        { standardId: "sfi-16.6", note: "GRR names only 'current FIA or SFI specification' generically, without listing exact spec numbers; SFI 16.6 included here as another current SFI harness standard in the app's registry." },
        { standardId: "fia-8853-98", note: "GRR §3.10: FIA-certified restraints usable through December 31 of the year of expiration printed on the label (label shows expiration date, not manufacture date)." },
        { standardId: "fia-8853-2016", note: "GRR names only 'current FIA... specification' generically; included as a current FIA harness generation. Same label-prints-its-own-expiration-date rule applies." },
        { standardId: "fia-8854-98", note: "GRR names only 'current FIA... specification' generically; included as a current FIA harness generation. Same label-prints-its-own-expiration-date rule applies." },
      ],
      materialNote:
        "GRR §3.10: 5-, 6-, or 7-point harness required for BOTH crew members; mixing parts between belt sets is not permitted. 'All harnesses shall be of current FIA or SFI specification' — no exact spec numbers are named in the GRR text, so the standards above are mapped generically from the app's harness registry rather than quoted verbatim. Dual-certified (FIA+SFI) harnesses may use whichever certification's expiration date is later.",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.10" },
      confidence: "medium",
      notes:
        "Must be replaced after any severe collision, or if webbing is cut/frayed/weakened by chemicals or sunlight (§3.10.1). Preferred/required mounting, anchorage, and reinforcement-bar specs are detailed at length in §3.10.2–3.10.13 (largely referencing FIA Article 253 diagrams) — not modeled here since this app tracks equipment certification, not installation geometry.",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "Required for vehicles running without closed windows in the driver's or co-driver's door (§3.22.3) — i.e. windows must stay fully rolled up during special stages UNLESS a window net is in use (§3.22.2). An arm restraint meeting SFI 3.3 may be used INSTEAD of a window net for this same scenario — see arm_restraint.",
      acceptedStandards: [{ standardId: "sfi-27.1", noExpiration: true, note: "GRR §3.22.3: 'All SFI certified window nets or arm restraints must be in good condition and may be used beyond the expiration date' — GRR doesn't name an exact SFI spec number for the net itself; mapped to SFI 27.1, the app's registered window-net standard." }],
      satisfiedByAlternative: "arm_restraint",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.22.2, 3.22.3" },
      confidence: "high",
      notes: "If present, the window net must be installed and shown at technical inspection.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition:
        "GRR §3.25: an OEM fuel tank may be used as-is, provided it stays in its OEM location and secured with OEM equipment. Alternatively, a fuel cell may be installed. A cell is only mandatory where the OEM tank can't meet the bulkhead-separation rule of §3.25.1 (which applies regardless of whether a cell or the OEM tank is used) or where the competitor chooses/needs a non-OEM tank.",
      materialOnlyAccepted: true,
      acceptedStandards: [
        { standardId: "sfi-28.3", note: "GRR §3.25.2 literally names 'SFI 28.3', now registered in src/data/standards.ts." },
        { standardId: "fia-ft3-1999", validityYearsFromLabel: 5, note: "GRR §3.25.2: bladder aging 'entails a considerable reduction in strength... after approximately five years' — no bladder may be used more than 5 years past its manufacture date UNLESS inspected and recertified by the manufacturer for up to 2 more years (extension not separately modeled here)." },
        { standardId: "fia-ft3.5-1999", validityYearsFromLabel: 5, note: "Same 5-year (extendable by manufacturer recert) bladder-age rule as FT3 — GRR §3.25.2." },
        { standardId: "fia-ft5-1999", validityYearsFromLabel: 5, note: "Same 5-year (extendable by manufacturer recert) bladder-age rule as FT3 — GRR §3.25.2." },
      ],
      materialNote:
        "GRR §3.25.2: 'The original fuel tank may be replaced or supplemented by a fuel cell meeting either SFI 28.3, FIA FT3 1999, FIA FT3.5, or FIA FT 5 specifications.' The cell must be a bladder type in a fully surrounding metal container (in addition to the fuel tank bulkhead required by §3.25.1 for ANY tank, OEM or cell), with a non-return fill valve and proper external venting. Any supplemental container holding more than 0.4 gal is itself treated as a fuel cell.",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.25, 3.25.1, 3.25.2" },
      confidence: "high",
      notes: "FIA FT3/FT3.5/FT5 are cited by name; SFI 28.3 is now also registered in src/data/standards.ts.",
    },
    fire_extinguisher: {
      requirement: "required",
      fireExtinguisherOptions: [{ quantity: 2, minBcRating: 10 }],
      materialNote:
        "GRR §3.15.1: two or more fire extinguishers, each minimum UL 10-B:C rating, installed in the passenger compartment; at least one within easy reach of the driver or co-driver while seated. A permanently mounted (on-board) fire system does NOT count toward this — a removable, hand-usable extinguisher is specifically required regardless of any on-board system also being fitted. §3.15.2 lists accepted-chemical mass/volume equivalents for a 10-B:C rating (e.g. AFFF 2.4L, Halotron I 5.0kg, Novec 1230 2.0kg) and recommends Halotron or similar gas over dry powder.",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.15.1, 3.15.2" },
      confidence: "high",
      notes:
        "§3.15.3: proof of purchase/inspection/recharge within the preceding 2 years is required for the extinguishers counted toward the minimum (extras beyond the minimum may exceed 2 years old); any extinguisher within the driver/co-driver's reach specifically must be within that 2-year window. This 2-year maintenance-proof rule isn't modeled as a certification expiration here (no acceptedStandards concept applies — this is a presence + rating category), but is worth surfacing to users.",
    },
    fire_suppression: {
      requirement: "recommended",
      acceptedStandards: [
        { standardId: "sfi-17.1", noExpiration: true, note: "GRR §3.15.4: must 'display a manufacturer appearing on the current respective list of SFI Spec 17.1 manufacturers at sfifoundation.com.'" },
        { standardId: "fia-8865-2015", noExpiration: true },
        { standardId: "fia-technical-list-16", noExpiration: true, note: "GRR: 'Currently listed as homologated for Rally on Technical List n°16 of the FIA website.'" },
      ],
      materialNote:
        "GRR §3.15.4: 'On-board fire suppression systems are not required. However, if present they must be installed safely in accordance with one of the following standards' [SFI 17.1, FIA 8865-2015, or current FIA Technical List 16 Rally homologation]. Must include at least 2 circle-'E' decals (one at the release point, one on the outside bodywork near it), a visible fill gauge and certification-date sticker, metal-strapped bottles, and an activation point reachable by both driver and co-driver while seated.",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.15.4" },
      confidence: "high",
      notes:
        "Purely optional — does not reduce or replace the separately mandatory 2-extinguisher requirement (fire_extinguisher, §3.15.1). GRR explicitly tolerates a system whose pressure/fill gauge looks fine but whose certification date has lapsed ('will not be cause for failing... technical inspection'), provided the system is still functional — a notably more lenient stance than most bodies take on expired fire-system certifications.",
    },
    kill_switch: {
      requirement: "required",
      materialNote:
        "GRR §3.20: a spark-proof Master Electrical Disconnect Switch is required in the passenger compartment, capable of disconnecting all electrical circuits (including starter wiring) and shutting off the engine. Must be operable by either crew member, or by someone outside the vehicle through either front door (§3.20.1). Location must be marked with a red-spark-in-a-white-edged-blue-triangle label (§3.20.2).",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.20, 3.20.1, 3.20.2" },
      confidence: "high",
      notes: "§3.20.3: limited fused supplemental circuits (computer memory backup power, amateur radio, NRS-required car tracking systems) are permitted to stay live past the switch.",
    },
    tow_hook: {
      requirement: "required",
      materialNote:
        "GRR §3.26: fixed, all-metal towing attachment points (plates, rings, or hoops) required front and rear, attached directly to the chassis/shell, made obvious with paint and/or arrows in yellow/red/orange, and readily accessible without crawling or reaching under the car. The opening must be large enough to pass a standard golf ball through and shaped so it won't cut a soft shackle or strap threaded through it. A separate hook may optionally be added in addition to these points, installed close to the bumper/bodywork without protruding to the side (pedestrian-safety consideration).",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.26" },
      confidence: "high",
      notes:
        "GRR §3.26 mainly mandates metal tow POINTS (rings/loops/plates) front and rear, not specifically a hook — a discrete hook is an optional addition on top of the required points. Mapped to this app's tow_hook category since it's the closest match to 'front/rear fixed metal towing attachment.' A grandfather clause let pre-existing tow points from the prior rules edition remain legal 'until 2026' — given today's date, that grandfathering window has likely lapsed; not modeled as a live exception here.",
    },
    tow_rope: {
      requirement: "required",
      materialNote:
        "GRR §3.27: all vehicles must carry a tow rope or strap (not left connected/hanging outside the car except during an actual recovery/tow). Starting in 2026, it must be a kinetic-recovery style rope/strap at least 3/4 inch thick and at least 19 feet long, with no metal end fittings (used with soft shackles and/or installed hooks instead).",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.27" },
      confidence: "high",
      notes: "Given today's date, the 2026 kinetic-recovery-style requirement (3/4in+, 19ft+, no metal ends) should be treated as already in effect, not a future change.",
    },
    emergency_triangle: {
      requirement: "required",
      materialNote:
        "GRR §3.17: minimum of three self-supporting, light-reflecting, daylight-visible triangular warning devices must be carried, at least 14 inches tip-to-opposing-side. One must be within easy reach of the driver or co-driver while seated.",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.17" },
      confidence: "high",
    },
    first_aid_kit: {
      requirement: "required",
      materialNote:
        "GRR §3.16: a comprehensive first aid kit must be carried in the passenger compartment, containing at minimum: antiseptic (ointment or liquid), gauze pads or rolls, adhesive tape, an arm sling, safety pins, scissors, two 'space' blankets, and a first aid manual. A tourniquet is currently optional but flagged in the GRR as something that 'may be required in the future.'",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.16" },
      confidence: "high",
    },
  },
};

export const nasaRulesets: Ruleset[] = [roadRacing, rallySport];

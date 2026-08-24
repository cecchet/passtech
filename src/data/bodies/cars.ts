import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const sourceDoc = {
  title: "CARS Rule Book (National Rally Regulations)",
  version: "2026-03 (updated 2026-05-22)",
  url: "https://carsrally.ca/wp-content/uploads/2015/09/CARS-2026-03-En-Rule-Book.pdf",
};

const ARM_RESTRAINT_NOTE =
  "No dedicated arm-restraint requirement found in the CARS rulebook (checked for 'arm restraint,' 'restraint,' 'sleeve,' 'window net,' 'convertible,' 'open car/top'). Window nets (FIA and/or SFI certified, per the vehicle-eligibility technical rules) are the mechanism CARS actually uses for open-window/no-net conditions — that's vehicle equipment, not driver-worn PPE, so it's out of scope here.";

const performanceRally: Ruleset = {
  id: "cars-performance-rally",
  bodyId: "cars",
  bodyName: "CARS (Canadian Rally Championship)",
  disciplineName: "Performance Rally",
  disciplineGroup: "Rally",
  supportsCodriver: true,
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "NRR 11.1.6-11.1.8" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8860-2010", expiresOn: "2028-12-31" },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "NRR 11.1.6" },
      confidence: "high",
      notes:
        "CARS does NOT accept Snell SA2015 for Performance Rally (unlike ARA, which does with a 12/31/2026 cutoff) — a real cross-body difference, so don't assume equivalence with ARA. CARS also non-bindingly recommends discarding any helmet after 5 years of regular use or after a serious accident — this is a recommendation, not a hard rule, so it is not encoded as an expiration here.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 11.1" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the CARS rulebook, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Conformance label must be less than 5 years old." },
      ],
      citation: { ...sourceDoc, section: "NRR 11.1.7" },
      confidence: "high",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with approved fire-resistant underwear." },
      ],
      citation: { ...sourceDoc, section: "NRR 11.1.8" },
      confidence: "high",
      notes: "One-piece suits highly recommended, not mandatory.",
    },
    gloves: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "'FIA or SFI gloves ... are recommended' — no specific certification number cited, and not mandatory. FIA 8856-2000/2018 and SFI 3.3 are mapped here as the practical standards, though CARS's own text doesn't name a number.",
      citation: { ...sourceDoc, section: "NRR 11.1.8" },
      confidence: "medium",
    },
    shoes: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "'FIA or SFI ... shoes are recommended' — no specific certification number cited, and not mandatory. FIA 8856-2000/2018 and SFI 3.3 are mapped here as the practical standards, though CARS's own text doesn't name a number.",
      citation: { ...sourceDoc, section: "NRR 11.1.8" },
      confidence: "medium",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 11.1.8" },
      confidence: "medium",
      notes: "Not mentioned anywhere in the rule book, unlike gloves/shoes which are at least recommended.",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Required only as a substitute when the driving suit itself is SFI 3.2A/1 (not addressed as a standalone recommendation otherwise).",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "CARS just says 'approved fire-resistant underwear' when required — no standard number attached in the rulebook.",
      citation: { ...sourceDoc, section: "NRR 11.1.8d" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 11.1" },
      confidence: "high",
      notes: ARM_RESTRAINT_NOTE,
    },
    seat: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "fia-8855-1999", validityYearsFromLabel: 10, note: "CARS allows 10 years from date of manufacture — 5 years past the standard FIA 5-year expiration." },
        { standardId: "fia-8862-2009", validityYearsFromLabel: 10, note: "CARS allows 10 years from date of manufacture — 5 years past the standard FIA 5-year expiration." },
        { standardId: "fia-8855-2021", validityYearsFromLabel: 10, note: "CARS allows 10 years from date of manufacture — 5 years past the standard FIA 5-year expiration." },
      ],
      materialNote:
        "CARS Technical Rule 12.3.12.1a: 'Use of hinged-back and OEM seats is prohibited.' 12.3.12.1b: 'All the occupants' seats must be homologated by the FIA standards 8855-1999 or 8862-2009, 8855-2021 and not modified.' These FIA standards are cited as the only acceptable option (not a 'when applicable'/higher-tier-only certification) — a stock/OEM seat does NOT satisfy this rule for Performance Rally.",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.12.1" },
      confidence: "high",
      notes:
        "Seats must be mounted per FIA Appendix J Article 253 Article 16 (securely attached to the floor to prevent movement in an accident, end plates may be fully welded instead of bolted); CARS's technical rules don't separately call out whether slider/rail mounts vs. a fixed mount are permitted beyond that general anchorage requirement. Replacement recommended after 5 years from date of manufacture, mandatory after 10 years.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "fia-8853-98", note: "FIA homologated harness sets must not be used after the expiration date printed on the harness's own label — CARS doesn't give a fixed calendar cutoff in the rulebook text, so no expiresOn is encoded here; check the physical label." },
        { standardId: "fia-8853-2016", note: "Same per-label FIA expiration rule as FIA 8853/98." },
        { standardId: "sfi-16.1", validityYearsFromLabel: 2, note: "Date-of-manufacture label must be less than 2 years old." },
        { standardId: "sfi-16.5", validityYearsFromLabel: 2, note: "Date-of-manufacture label must be less than 2 years old." },
      ],
      materialNote:
        "Stock/OEM belts are NOT accepted — CARS requires an unmodified, proprietary-manufacture 5- or 6-point harness meeting one of the listed standards; mixing parts between sets is prohibited.",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.3.1" },
      confidence: "high",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "CARS Technical Rule 12.3.9.2 limits driver/co-driver door windows to 2.5 cm (1 in) rolled down during stages. If a window is opened beyond that, NRR 17.3.5.n makes traversing the stage without 'window net(s) in place' a penalizable infraction — keeping all windows within the 2.5 cm limit avoids the requirement outright.",
      materialOnlyAccepted: true,
      materialNote:
        "Neither Technical Rule 12.3.9 nor the NRR 17.3.5.n infraction clause cites a certification standard for the Performance Rally window net — 'window net(s) in place' is all that's specified, so a plain, uncertified net satisfies this rule. (Contrast with Rally Cross's ROV/UTV window-net rule, NRR 27.3.2.2g, which explicitly requires FIA and/or SFI certification — that requirement is not restated here for Performance Rally.)",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.9.2; NRR 17.3.5.n" },
      confidence: "medium",
      notes:
        "Full document search for 'window net'/'net' found only this penalty-clause mention for Performance Rally — no standalone Technical Rule dedicated to window nets exists for this discipline. Not framed as interchangeable with an arm restraint: arm_restraint is entirely not_addressed for Performance Rally (see that category), so no satisfiedByAlternative wiring is added on either category.",
    },
    fire_extinguisher: {
      requirement: "required",
      fireExtinguisherOptions: [{ quantity: 2, minBcRating: 5 }],
      citation: { ...sourceDoc, section: "Technical Rule 12.3.4.1" },
      confidence: "high",
      notes:
        "Two 5-B:C (or higher) extinguishers must be installed inside the passenger compartment, with quick-release metal fastenings (two minimum) and anti-torpedo tabs; one must be within easy reach of the driver or co-driver when seated. Evidence of recharge/inspection within the preceding two years is required, and a fire-extinguisher location label (available through CARS) must be affixed to the outside of the vehicle at the nearest point of access. If an on-board extinguishing system is also fitted, these two handheld extinguishers are still required in addition to it.",
    },
    fire_suppression: {
      requirement: "recommended",
      acceptedStandards: [{ standardId: "fia-8865-2015" }, { standardId: "sfi-17.1" }],
      citation: { ...sourceDoc, section: "Technical Rule 12.3.4.2" },
      confidence: "high",
      notes:
        "An on-board extinguishing system is 'highly recommended,' not mandatory. Must be mounted per manufacturer instructions with metal piping only, minimum 3kg of extinguishant, mountings rated to withstand 25g deceleration in any direction, minimum two metal fastenings, and anti-torpedo tabs. Does not replace the two required handheld extinguishers (see Fire Extinguisher).",
    },
    fuel_cell: {
      requirement: "conditional",
      condition:
        "A certified fuel cell is only required if the original/stock fuel tank has been replaced — CARS does not mandate replacing the stock tank in the first place.",
      materialOnlyAccepted: true,
      acceptedStandards: [
        { standardId: "sfi-28.1" },
        { standardId: "sfi-28.3" },
        { standardId: "fia-ft3-1999" },
        { standardId: "fia-ft3.5-1999" },
        { standardId: "fia-ft5-1999" },
      ],
      materialNote:
        "CARS just requires 'an FIA- or SFI- approved fuel cell' if the stock tank is replaced — no specific standard number/tier is named in the rulebook, so all registered SFI/FIA fuel-cell standards are listed here as the practical options. Supplementary fuel tanks are not permitted; a fitted cell must be vented outside the vehicle, and if installed in a hatchback-style passenger/luggage compartment the filler must be sealed or use quick-connects.",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.11.3" },
      confidence: "high",
    },
    window_breaker: {
      requirement: "required",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.23-12.3.24" },
      confidence: "high",
      notes:
        "Two related but distinct tools required, each within reach of BOTH driver and co-driver while harnesses are worn: (1) a seatbelt cutter designed specifically for cutting seat belts (12.3.23), and (2) a window breaker capable of breaking the windshield or glass side windows for egress, secured against movement (12.3.24).",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.8" },
      confidence: "high",
      notes:
        "A spark-proof general circuit breaker capable of disconnecting all electrical circuits (including the fuel pump) is required, mounted in the passenger compartment and operable by either crew member or by persons outside the vehicle through either front door; its location must be clearly identified. The fuel pump must also shut off with the ignition switch. A single 5A-fused circuit is permitted to stay powered for a vehicle tracking system.",
    },
    tow_hook: {
      requirement: "required",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.13" },
      confidence: "high",
      notes:
        "A metal tow eye is required at both the front and rear of the vehicle, marked with a 'TOW' sticker, painted yellow, red, or orange, with a minimum internal diameter of 3/4 inch and sufficient strength to support the vehicle's weight during recovery.",
    },
    tow_rope: {
      requirement: "required",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.16" },
      confidence: "high",
      notes: "A recovery strap must be carried; all parts of it must stay inside the competition vehicle at all times when not in use.",
    },
    emergency_triangle: {
      requirement: "required",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.6" },
      confidence: "high",
      notes:
        "Three self-supporting, light-reflecting, daylight-visible triangular warning devices (minimum 30cm per side) must be carried, with one located within easy reach of the driver or co-driver when seated.",
    },
    first_aid_kit: {
      requirement: "required",
      citation: { ...sourceDoc, section: "Technical Rule 12.3.5" },
      confidence: "high",
      notes:
        "A comprehensive, itemized first-aid kit (CARS specifies an extensive contents list — bandages, gauze, gloves, scissors, tweezers, space blankets, etc.) must be carried in the passenger compartment, easily accessible and clearly identified with a first-aid-kit label (available through CARS) on the outside of the vehicle.",
    },
  },
};

const rallySprint: Ruleset = {
  id: "cars-rally-sprint",
  bodyId: "cars",
  bodyName: "CARS (Canadian Rally Championship)",
  disciplineName: "Rally Sprint",
  disciplineGroup: "Rally",
  supportsCodriver: true,
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "NRR 28.3.3" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        ...(performanceRally.categories.helmet!.acceptedStandards ?? []),
        { standardId: "snell-sa2005", noExpiration: true, note: "Rally Sprint accepts the lower Snell SA2005+ bar in addition to full NRR 11.1.6 compliance." },
      ],
      citation: { ...sourceDoc, section: "NRR 28.3.3a" },
      confidence: "high",
      notes: "Lower bar than Performance Rally: 'Helmets meeting CARS NRR 11.1.6 or meeting the Snell SA 2005 standard.'",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 28.3.3" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the CARS rulebook, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: performanceRally.categories.hnr!.acceptedStandards,
      citation: { ...sourceDoc, section: "NRR 28.3.3b, cross-references NRR 11.1.7" },
      confidence: "high",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: performanceRally.categories.firesuit!.acceptedStandards,
      citation: { ...sourceDoc, section: "NRR 28.3.3g, cross-references NRR 11.1.8" },
      confidence: "high",
    },
    gloves: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same as Performance Rally: FIA/SFI rated recommended, not mandatory.",
      citation: { ...sourceDoc, section: "NRR 11.1.8 (cross-referenced)" },
      confidence: "medium",
    },
    shoes: {
      requirement: "recommended",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same as Performance Rally: FIA/SFI rated recommended, not mandatory.",
      citation: { ...sourceDoc, section: "NRR 11.1.8 (cross-referenced)" },
      confidence: "medium",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 11.1.8 (cross-referenced)" },
      confidence: "medium",
      notes: "Same as Performance Rally: not mentioned anywhere in the rule book.",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Same as Performance Rally: required only as a substitute when the suit itself is SFI 3.2A/1.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same as Performance Rally — 'approved fire-resistant underwear,' no standard number attached.",
      citation: { ...sourceDoc, section: "NRR 11.1.8d (cross-referenced)" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 28.3.3" },
      confidence: "high",
      notes: ARM_RESTRAINT_NOTE,
    },
    seat: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "fia-8855-1999", noExpiration: true },
        { standardId: "fia-8862-2009", noExpiration: true },
        { standardId: "fia-8855-2021", noExpiration: true },
      ],
      materialNote:
        "CARS NRR 28.3.3f: 'Seats must be fixed back, one-piece FIA approved racing seats. There will be no expiry date restriction. Seats must be in good condition with no visible defects. Seats must be solidly mounted.' No stock/OEM/factory-seat alternative is offered — an FIA-approved racing seat is the only option stated for Rally Sprint (contrast with Rally Cross's 27.3.2.2j, 'Factory seats may be replaced with a racing seat,' which is permissive and applies to a different discipline).",
      citation: { ...sourceDoc, section: "NRR 28.3.3f" },
      confidence: "high",
      notes:
        "Rally Sprint's own equipment list requires a fixed-back, one-piece 'FIA approved' racing seat, solidly mounted, in good condition — it does not cite a specific FIA standard number (unlike Performance Rally, which references FIA 8855-1999/8862-2009/8855-2021 via Technical Rule 12.3.12), so the registered FIA seat standards are mapped here as the practical options. Notably there is explicitly NO expiry date restriction for Rally Sprint (a real difference from Performance Rally, which recommends replacement after 5 years and mandates it after 10). SFI seat standards are not mentioned for Rally Sprint. Seat sliders/rails vs. a fixed mount are not separately addressed beyond 'solidly mounted.'",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      materialNote:
        "Rally Sprint requires a minimum 5-point harness for both driver and co-driver, in good condition with no visible defects — CARS does not cite a specific SFI/FIA certification standard for this discipline (unlike Performance Rally's Technical Rule 12.3.3, which requires FIA 8853/SFI 16.1/16.5 with per-label expiration), so no certification standards are populated here. There is explicitly no expiry-date restriction.",
      citation: { ...sourceDoc, section: "NRR 28.3.3d" },
      confidence: "high",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 28.3.2-28.3.3" },
      confidence: "high",
      notes:
        "Rally Sprint's mandatory/recommended equipment list (28.3.2-28.3.3) cross-references specific CARS Technical Rule numbers item by item (fuel/tanks, tow eyes, noise, extinguishers, first aid, triangles, tow rope, harnesses, roll cage, seats, driving suits) but never cross-references Technical Rule 12.3.9 (Windows) or mentions window nets — same not-addressed pattern already found for window_breaker and kill_switch in this discipline. Full document search found no other window-net mention scoped to Rally Sprint.",
    },
    fire_extinguisher: {
      requirement: "required",
      fireExtinguisherOptions: [{ quantity: 2, minBcRating: 5 }],
      citation: { ...sourceDoc, section: "NRR 28.3.3c, cross-references Technical Rule 12.3.4" },
      confidence: "high",
      notes:
        "Rally Sprint's equipment list cross-references CARS Technical Rule 12.3.4: two 5-B:C (or higher) extinguishers installed inside the passenger compartment with quick-release metal fastenings, one within easy reach of the driver or co-driver.",
    },
    fire_suppression: {
      requirement: "recommended",
      acceptedStandards: [{ standardId: "fia-8865-2015" }, { standardId: "sfi-17.1" }],
      citation: { ...sourceDoc, section: "NRR 28.3.3c, cross-references Technical Rule 12.3.4.2" },
      confidence: "medium",
      notes:
        "Rally Sprint's supplementary regulations cross-reference Technical Rule 12.3.4 in full for 'fire extinguishers,' which as a parent section includes the highly-recommended (not mandatory) on-board extinguishing sub-rule 12.3.4.2 — flagged medium confidence since Rally Sprint's own bullet text names only the parent rule number, not the suppression system specifically.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition:
        "Same as Performance Rally: a certified fuel cell is only required if the stock fuel tank has been replaced; CARS Technical Rule 12.3.11 (fully cross-referenced by Rally Sprint) permits a stock/OEM tank otherwise.",
      materialOnlyAccepted: true,
      acceptedStandards: [
        { standardId: "sfi-28.1" },
        { standardId: "sfi-28.3" },
        { standardId: "fia-ft3-1999" },
        { standardId: "fia-ft3.5-1999" },
        { standardId: "fia-ft5-1999" },
      ],
      materialNote: "No specific standard number is cited — same generic 'FIA- or SFI- approved fuel cell' language as Performance Rally, cross-referenced via Technical Rule 12.3.11.",
      citation: { ...sourceDoc, section: "NRR 28.3.2d, cross-references Technical Rule 12.3.11" },
      confidence: "high",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 28.3.2-28.3.3" },
      confidence: "high",
      notes:
        "Rally Sprint's vehicle/equipment requirements (NRR 28.3.2-28.3.3) cross-reference specific CARS Technical Rule numbers item by item for extinguishers, first aid, triangles, tow rope, and tow eyes, but do not include Technical Rule 12.3.23 (belt cutters) or 12.3.24 (window breakers) — genuinely not addressed for this discipline.",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 28.3.2-28.3.3" },
      confidence: "high",
      notes: "Rally Sprint's equipment list does not cross-reference Technical Rule 12.3.8 (general circuit breaker/master switch) — not addressed for this discipline.",
    },
    tow_hook: {
      requirement: "required",
      citation: { ...sourceDoc, section: "NRR 28.3.2e, cross-references Technical Rule 12.3.13" },
      confidence: "high",
      notes: "Same as Performance Rally: metal tow eye front and rear, 'TOW' sticker, painted yellow/red/orange, minimum 3/4 inch internal diameter.",
    },
    tow_rope: {
      requirement: "required",
      citation: { ...sourceDoc, section: "NRR 28.3.3c, cross-references Technical Rule 12.3.16" },
      confidence: "high",
      notes: "Same as Performance Rally: a recovery strap must be carried, kept entirely inside the vehicle when not in use.",
    },
    emergency_triangle: {
      requirement: "required",
      citation: { ...sourceDoc, section: "NRR 28.3.3c, cross-references Technical Rule 12.3.6" },
      confidence: "high",
      notes: "Same as Performance Rally: three self-supporting, daylight-visible triangles, minimum 30cm per side, one within easy reach of the driver or co-driver.",
    },
    first_aid_kit: {
      requirement: "required",
      citation: { ...sourceDoc, section: "NRR 28.3.3c, cross-references Technical Rule 12.3.5" },
      confidence: "high",
      notes: "Same comprehensive, itemized kit requirement as Performance Rally.",
    },
  },
};

const rallyCross: Ruleset = {
  id: "cars-rally-cross",
  bodyId: "cars",
  bodyName: "CARS (Canadian Rally Championship)",
  disciplineName: "Rally Cross",
  disciplineGroup: "RallyCross",
  lastReviewed: "2026-08-04",
  sourceDocuments: [{ ...sourceDoc, section: "NRR 27.3.3" }],
  // ROV/UTV gets its own class for belts_harness/window_net, where it has genuinely distinct
  // rules — but not for helmet, where the general list already correctly includes its ASTM F3103
  // carve-out alongside everything else, so overriding it wouldn't change anything.
  classes: [
    { id: "passenger-no-rollover", label: "Passenger car / light truck — no roll-over protection" },
    { id: "passenger-with-rollover", label: "Passenger car / light truck — with roll-over protection" },
    { id: "rov-utv", label: "ROV / UTV" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      condition:
        "Vehicles WITH roll-over protection must meet the full Performance Rally standard (NRR 11.1.6). The looser list below applies only to vehicles WITHOUT roll-over protection — check your vehicle type before relying on the lower bar.",
      acceptedStandards: [
        ...(performanceRally.categories.helmet!.acceptedStandards ?? []),
        { standardId: "dot-2010plus", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "snell-m2005", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "snell-sa2005", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "ece-22.05", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "ece-22.06", noExpiration: true, note: "No roll-over protection only." },
        { standardId: "astm-f3103-2005plus", noExpiration: true, note: "UTVs only." },
      ],
      citation: { ...sourceDoc, section: "NRR 27.3.3.1-27.3.3.2" },
      confidence: "high",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the CARS rulebook, just not yet re-checked.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
      notes: "Not listed among Rally Cross mandatory items (unlike Performance Rally and Rally Sprint).",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
      notes: "No driving-suit requirement found for Rally Cross — only helmet and harness are mandated.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.3" },
      confidence: "high",
      notes: "Open-top (convertible) vehicles are instead required to fit a hard top and/or roll-over protection approved by the regional scrutineer — not an arm restraint. " + ARM_RESTRAINT_NOTE,
    },
    seat: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2" },
      confidence: "high",
      notes:
        "Rally Cross's own vehicle-eligibility rules (NRR 27.3.2) don't address seat certification or mounting at all — no cross-reference to CARS Technical Rule 12.3.12. Rally Cross vehicles (which may be stock-based passenger cars/light trucks or ROVs/UTVs, and explicitly may NOT be tube/box-frame builds) are governed by a self-contained rule set separate from the Performance Rally Technical Rules.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "Rally Cross sets minimum belt point-counts rather than requiring a certified harness: for passenger cars/light trucks WITHOUT roll-over protection, a minimum 3-point harness is required for driver and passenger; for those WITH roll-over protection, a minimum 5-point harness is required. For ROVs/UTVs, a minimum 4-point harness is required regardless of roll-over protection. No expiry-date restriction applies in any case, but the harness must be in good condition with no visible defects. No specific SFI/FIA certification standard is cited for Rally Cross belts.",
      citation: { ...sourceDoc, section: "NRR 27.3.3.1b-c, 27.3.3.2b" },
      confidence: "high",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "Required only for ROV's/UTV's (NRR 27.3.2.2g): 'The vehicle must be equipped with side window nets. Window nets must meet FIA and/or SFI Certification.' Not addressed for passenger cars/light trucks (NRR 27.3.2.1) — that vehicle class's rules say nothing about window nets; open-top convertibles in that class must instead fit a hard top and/or scrutineer-approved roll-over protection (see arm_restraint).",
      acceptedStandards: [{ standardId: "sfi-27.1" }, { standardId: "fia-8863-2015" }],
      materialOnlyAccepted: false,
      materialNote:
        "NRR 27.3.2.2g requires FIA and/or SFI certification for ROV/UTV window nets — no specific generation/version number is cited, so both registered window-net standards are listed as the practical options; a plain uncertified net does not satisfy this rule for ROV/UTVs.",
      citation: { ...sourceDoc, section: "NRR 27.3.2.2g" },
      confidence: "high",
      notes:
        "Not framed as interchangeable with an arm restraint — Rally Cross's arm_restraint category is not_addressed (open-top passenger cars/light trucks instead need a hard top and/or roll-over protection, per NRR 27.3.2.1g), so no satisfiedByAlternative wiring is added. This mirrors the existing window_breaker note for this discipline, which already flagged the ROV/UTV window-net rule as out of scope for that category.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2-27.3.3" },
      confidence: "high",
      notes: "No fire-extinguisher requirement for competing vehicles found in the Rally Cross rules — CARS Technical Rule 12.3.4 is not cross-referenced and Rally Cross has no equivalent of its own.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2-27.3.3" },
      confidence: "high",
      notes: "No on-board fire-suppression-system provision found for Rally Cross.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2-27.3.3" },
      confidence: "high",
      notes: "No fuel tank/fuel cell rule found in the Rally Cross section.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2-27.3.3" },
      confidence: "high",
      notes:
        "No seatbelt-cutter or window-breaker tool requirement found for Rally Cross. (UTVs must fit FIA/SFI-certified side window NETS per NRR 27.3.2.2g, but that's occupant-containment vehicle equipment, not an egress tool — out of scope for this category, similar to how window nets are treated as out-of-scope vehicle equipment elsewhere in this file.)",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2-27.3.3" },
      confidence: "high",
      notes: "No general circuit breaker/master switch requirement found for Rally Cross.",
    },
    tow_hook: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2-27.3.3" },
      confidence: "high",
      notes: "No tow-hook/tow-eye requirement found for Rally Cross.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2-27.3.3" },
      confidence: "high",
      notes: "No tow rope/strap requirement found for Rally Cross.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2-27.3.3" },
      confidence: "high",
      notes: "No warning-triangle requirement found for Rally Cross.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "NRR 27.3.2-27.3.3" },
      confidence: "high",
      notes: "No first-aid-kit requirement found for Rally Cross.",
    },
  },
  classOverrides: {
    "passenger-no-rollover": {
      helmet: {
        requirement: "required",
        acceptedStandards: [
          ...(performanceRally.categories.helmet!.acceptedStandards ?? []),
          { standardId: "dot-2010plus", noExpiration: true },
          { standardId: "snell-m2005", noExpiration: true },
          { standardId: "snell-sa2005", noExpiration: true },
          { standardId: "ece-22.05", noExpiration: true },
          { standardId: "ece-22.06", noExpiration: true },
        ],
        citation: { ...sourceDoc, section: "NRR 27.3.3.1" },
        confidence: "high",
        notes: "The looser DOT/older-Snell/ECE options are available specifically because this vehicle has no roll-over protection — a car that gains a cage no longer qualifies for this list.",
      },
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "Minimum 3-point harness required for driver and passenger. No expiry-date restriction, but the harness must be in good condition with no visible defects. No specific SFI/FIA certification standard is cited.",
        citation: { ...sourceDoc, section: "NRR 27.3.3.1b" },
        confidence: "high",
      },
      window_net: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "NRR 27.3.2.1" },
        confidence: "high",
        notes: "Window nets are only mandated for ROV/UTV (NRR 27.3.2.2g) — not addressed for passenger cars/light trucks. Open-top convertibles in this class must instead fit a hard top and/or scrutineer-approved roll-over protection (see arm_restraint).",
      },
    },
    "passenger-with-rollover": {
      helmet: {
        requirement: "required",
        acceptedStandards: performanceRally.categories.helmet!.acceptedStandards,
        citation: { ...sourceDoc, section: "NRR 11.1.6" },
        confidence: "high",
        notes: "This vehicle has roll-over protection, so it must meet the full Performance Rally helmet standard — none of Rally Cross's loosened DOT/older-Snell/ECE allowances apply.",
      },
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "Minimum 5-point harness required for driver and passenger. No expiry-date restriction, but the harness must be in good condition with no visible defects. No specific SFI/FIA certification standard is cited.",
        citation: { ...sourceDoc, section: "NRR 27.3.3.1c" },
        confidence: "high",
      },
      window_net: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "NRR 27.3.2.1" },
        confidence: "high",
        notes: "Window nets are only mandated for ROV/UTV (NRR 27.3.2.2g) — not addressed for passenger cars/light trucks. Open-top convertibles in this class must instead fit a hard top and/or scrutineer-approved roll-over protection (see arm_restraint).",
      },
    },
    "rov-utv": {
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "Minimum 4-point harness required, regardless of roll-over-protection status. No expiry-date restriction, but the harness must be in good condition with no visible defects. No specific SFI/FIA certification standard is cited.",
        citation: { ...sourceDoc, section: "NRR 27.3.3.2b" },
        confidence: "high",
      },
      window_net: {
        requirement: "required",
        acceptedStandards: [{ standardId: "sfi-27.1" }, { standardId: "fia-8863-2015" }],
        materialOnlyAccepted: false,
        materialNote:
          "NRR 27.3.2.2g: 'The vehicle must be equipped with side window nets. Window nets must meet FIA and/or SFI Certification.' No specific generation/version number is cited, so both registered window-net standards are listed as the practical options — a plain uncertified net does not satisfy this rule.",
        citation: { ...sourceDoc, section: "NRR 27.3.2.2g" },
        confidence: "high",
      },
    },
  },
};

export const carsRulesets: Ruleset[] = [performanceRally, rallySprint, rallyCross];

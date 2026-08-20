import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_FUEL_CELL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

const sourceDoc = {
  title: "PHA Supplementary Regulations to the SCCA HillClimb and Time Trial Rules",
  version: "2026.1, March 2026",
  url: "https://pahillclimb.org/wp-content/uploads/2026/03/2026-Hillclimb-Supplementary-Regulations-Final.pdf",
};

const timeTrialHillclimb: Ruleset = {
  id: "pha-time-trial-hillclimb",
  bodyId: "pha",
  bodyName: "SCCA Time Trial — Pennsylvania Hillclimb Association (PHA)",
  disciplineName: "Time Trial / Hillclimb",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "9.20 Required Driver Safety Equipment" }],
  // PHA's own class table (§9.1, §9.37) splits every car into three top-level buckets: GCR Classes
  // (§9.37 table), Supplemental Classes (§9.38 — Vintage/Historic, Rally, Special, INEX, FVCC, Solo
  // V, SMR, Electric, Club Ford), and Solo & Time Trial Derived Classes (§9.39 — Sport/Super
  // Sport/Sport Max/Sport Unlimited/Modified/Super Modified/Outlaw). Only fuel_cell (§9.11) and
  // kill_switch (§9.24) genuinely diverge by class — both are framed by PHA as "GCR class car vs.
  // everything else," with §9.11 additionally carving a handful of specific GCR classes back OUT of
  // its own fuel-cell mandate. Seat (§8.3.L) and belts_harness (§11.1) apply identically to every
  // class with no carve-out in PHA's own text (the Safety Level 2/3 tiers referenced in the shared
  // SCCA-TT lineage — src/data/bodies/scca-time-trial-base.ts, appalachian.ts — are a different
  // club's rules, not PHA's; PHA's SUPPS restate its own equipment rules independent of those
  // tiers), so they're left as the single base rule rather than split into classOverrides. The GCR
  // side is broken into three groups rather than one entry per named GCR class (which would be a
  // dozen+ near-identical entries): the classes §9.11 exempts from the fuel-cell mandate split
  // further into "Touring/B-Spec/C-Spec" (which the underlying SCCA GCR's own kill-switch rule,
  // §9.3.35 — modeled in this app's SCCA Road Racing ruleset, src/data/bodies/scca.ts — also exempts
  // from the kill-switch mandate) vs. "Spec Miata/Improved Touring/American Sedan" (fuel-cell-exempt
  // but NOT kill-switch-exempt), since PHA's kill-switch rule explicitly defers to "otherwise
  // specified as exempt in the current GCR" (§9.24) and that GCR exemption list is narrower than the
  // fuel-cell one.
  classes: [
    { id: "solo-tt-derived", label: "Solo & Time Trial Derived Classes (Sport, Super Sport, Sport Max, Sport Unlimited, Modified, Super Modified, Outlaw)" },
    { id: "special-supplemental", label: "PHA Supplemental Classes (Vintage/Historic, Rally, Special S1-S3, INEX, FVCC, Solo V, SMR, Electric, Club Ford)" },
    { id: "gcr-touring-bspec-cspec", label: "GCR Touring (T1-T4/ET) / B-Spec / C-Spec" },
    { id: "gcr-fuel-exempt-other", label: "GCR Spec Miata / Improved Touring / American Sedan (restricted prep)" },
    { id: "gcr-other", label: "Other GCR Classes (Grand Touring, Production, Super Touring, Super Production, Sports Racing, Formula, Sedan, etc.)" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "sfi-31.1a", noExpiration: true, note: "Open-face spec — see full-face requirement below; not usable except under the narrow legacy exemption." },
        { standardId: "sfi-31.2a", noExpiration: true },
      ],
      fullFaceRequirement: "required",
      fullFaceCondition:
        "PHA §9.20.B.1: 'Full face helmets for all drivers are required.' A narrow legacy exemption exists for SA2020 open-face helmets bought before 3/5/2022, paired with a DOT-approved windshield, through the end of the first full PHA season SA2025 full-face helmets are available — not modeled here since it's date/receipt-dependent and likely already lapsed; treat an open-face result as a strong signal to double-check with PHA tech.",
      citation: { ...sourceDoc, section: "9.20.B.1" },
      confidence: "high",
      notes: "Snell M-rated helmets are explicitly NOT allowed for PHA Time Trial/Hillclimb events (only allowed for HPDE-style events elsewhere, not modeled here).",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required for drivers with beards/mustaches, and for open-face helmets generally (a full fire-resistant helmet skirt is accepted as an alternative, not modeled separately here).",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "PHA does not cite a specific certification number for the balaclava itself.",
      citation: { ...sourceDoc, section: "9.20.A" },
      confidence: "medium",
      notes: "Carried over from the original PHA research pass, which surfaced this rule as an aside under the underwear section rather than a dedicated clause — worth a re-check against the source PDF if precision matters.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { ...sourceDoc, section: "9.20.B.2" },
      confidence: "high",
      notes: "PHA: 'H&NR devices do not time out irrespective of any stated expiration date, but they must be maintained in acceptable condition.'",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-1", note: "Underwear becomes required with this tier — see undergarment." },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "fia-1986" },
        { standardId: "fia-8856-2000" },
      ],
      citation: { ...sourceDoc, section: "9.20.A" },
      confidence: "high",
      notes:
        "Rule text only names FIA 1986 Standard and FIA Standard 8856-2000 — FIA 8856-2018 is not explicitly listed here (unlike most other bodies in this app). Not adding it without confirmation from PHA, given this rulebook was read directly and doesn't mention it. One-piece suits strongly recommended, not mandatory.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "PHA: 'Gloves made of leather and/or accepted fire resistant material containing no holes' — no certification number required, plain material qualifies.",
      citation: { ...sourceDoc, section: "9.20.C" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "PHA: 'Shoes, with uppers of leather and/or nonflammable material that at a minimum cover the instep' — no certification number required. Separately, §9.20.D requires socks of accepted fire-resistant material — not modeled as its own category here since this app's undergarment category covers body underwear, not socks.",
      citation: { ...sourceDoc, section: "9.20.H" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required unless the driving suit itself carries an FIA 1986 Standard, FIA 8856-2000, or SFI 3-2A/5-or-higher (3.2A/10, /15, /20) label — in which case fire-resistant underwear becomes optional.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "PHA just says 'underwear of fire resistant material' when required — no specific certification number cited.",
      citation: { ...sourceDoc, section: "9.20.A" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required on all open cars, including open Targa tops, sunroofs, and T-tops (§11). Closed-cockpit cars may use EITHER arm restraints OR a driver's-side window net instead (§9.27) — not both required. Worn per the restraint manufacturer's instructions, wrists/hands kept inside the bodywork/roll cage envelope.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No specific certification standard cited by PHA for the arm restraint itself.",
      satisfiedByAlternative: "window_net",
      citation: { ...sourceDoc, section: "9.27, 11" },
      confidence: "high",
    },

    // --- Car safety gear ---------------------------------------------------------------------
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "PHA §8.3.L: 'Must be a one-piece, bucket-type race seat, be securely mounted and provide fore/aft and lateral support. Seats must accommodate, with appropriate routing, 5 (or more) point safety belts including sub-strap. OE seats may not be modified to accommodate belts, aftermarket seats must be installed per manufacture guidelines.' An upper brace is STRONGLY RECOMMENDED if the seat is not FIA homologated.",
      citation: { ...sourceDoc, section: "8.3.L" },
      confidence: "high",
      notes:
        "PHA does not cite a specific SFI (e.g. 39.1/39.2) or FIA (e.g. 8855-1999/8862-2009) seat certification number anywhere in this rulebook — the requirement is purely a one-piece, bucket-type construction and secure-mounting rule, not a labeled certification. materialOnlyAccepted is true because no cert is required, but note the bucket-type construction requirement still applies — this isn't a green light for an unmodified stock bench/OE seat, which generally won't meet the bucket-type/lateral-support bar (§8.3.L's 'OE seats may not be modified to accommodate belts' language implies an OE seat is only usable unmodified, i.e. effectively excluded once 5-point belts are required). A certified FIA/SFI seat obviously also satisfies this, even though PHA doesn't itself name a minimum spec — the generic seat standards list is offered on that basis. The rulebook also never addresses seat sliders/rails vs. a fixed mount — only that the seat be 'securely mounted' per manufacturer guidelines for aftermarket units.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-16.1",
          validityYearsFromLabel: 5,
          note: "SFI-labeled systems expire December 31 of the 5th year after the manufacture date printed on the label (e.g. a 2014-dated label expires end of 2019) — PHA §11.1.I.1.",
        },
        { standardId: "sfi-16.5", validityYearsFromLabel: 5, note: "Same 5-year-from-label-date expiration rule as SFI 16.1 — PHA §11.1.I.1." },
        {
          standardId: "fia-8853-98",
          note: "FIA-labeled systems (type designation 'C-###.T/98' or 'D-###.T/98') print their own fixed expiration date directly on the label rather than a computed offset — PHA §11.1.I.2.",
        },
        {
          standardId: "fia-8853-2016",
          note: "Accepted per PHA §11.1.I; the rulebook's label-states-its-own-date expiration language is written specifically for the 8853/98 and 8854/98 generations and isn't explicitly restated for 8853/2016.",
        },
        { standardId: "fia-8854-98", note: "FIA-labeled systems print their own expiration date directly on the label — PHA §11.1.I.2." },
      ],
      materialNote:
        "PHA requires a certified 5-, 6-, or 7-point restraint harness meeting SFI 16.1/16.5 or FIA 8853/98, 8853/2016, or 8854/98 (§11.1.I) — stock/OEM belts are not offered as an accepted alternative for competition.",
      citation: { ...sourceDoc, section: "11.1" },
      confidence: "high",
      notes:
        "Five-point is the minimum system; 6- or 7-point is STRONGLY RECOMMENDED for all cars (§11, §11.1.A-B). Certified nominal 2-inch shoulder straps are allowed only when the driver is also using a head-and-neck restraint (SFI 38.1 or FIA 8858) — otherwise 3-inch shoulder straps are required (§11.1.C). Also cross-referenced at §8.3.M ('Seat Belts and Shoulder Harness - Shall conform to... section 9.20 and Section 11') and §9.20.G.",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "Closed-cockpit cars may use a driver's-side window net INSTEAD of arm restraints (§9.27) — not both required. Not a legal substitute on open cars (open Targa tops, sunroofs, T-tops), which must use arm restraints outright (§11).",
      acceptedStandards: [{ standardId: "sfi-27.1", noExpiration: true }],
      satisfiedByAlternative: "arm_restraint",
      citation: { ...sourceDoc, section: "9.27" },
      confidence: "high",
      notes: "PHA cites SFI 27.1 specifically for the window net (a vehicle item, distinct from the driver-worn arm restraint it substitutes for).",
    },
    fire_extinguisher: {
      requirement: "conditional",
      condition:
        "PHA §9.19 treats the car's fire-fighting equipment as ONE of three interchangeable minimum requirements — a handheld extinguisher (options modeled here) satisfies it, OR the car can instead carry an on-board automatic fire system per §9.19.A (see the fire_suppression category), with no handheld extinguisher then required.",
      fireExtinguisherOptions: [
        { quantity: 1, minWeightLbs: 2 },
        { quantity: 1, minBcRating: 10, minWeightLbs: 2 },
        { quantity: 1, minClassARating: 1, minBcRating: 10, minWeightLbs: 2 },
      ],
      materialNote:
        "PHA §9.19: Halon 1301 or 1211, 2 lb minimum capacity by weight (no UL rating specified) — OR dry chemical, 2 lb minimum with a positive charge indicator, rated either 10-B:C (potassium bicarbonate/'Purple K' recommended) or 1-A:10-B:C (multipurpose ammonium phosphate and barium sulfate, or Monnex). Must be securely mounted in the cockpit with metal, quick-release-type brackets, and reachable by the driver while seated (case-by-case exceptions approved by Tech).",
      citation: { ...sourceDoc, section: "9.19.B, 9.19.C" },
      confidence: "high",
      notes:
        "The original placeholder guess of 'one 10-B:C, or two 5-B:C' does NOT match the real rulebook — PHA §9.19 has no 'two smaller units' alternative at all. The actual accepted options are: one Halon 1301/1211 extinguisher (2 lb min, no UL rating stated), one 2-lb-min dry chemical extinguisher rated 10-B:C, or one 2-lb-min dry chemical extinguisher rated 1-A:10-B:C.",
    },
    fire_suppression: {
      requirement: "conditional",
      condition:
        "Not independently mandatory — PHA §9.19 lets a car satisfy its overall fire-system requirement with EITHER an on-board automatic fire system (this option, §9.19.A) OR a handheld extinguisher (see fire_extinguisher category, §9.19.B/C). Only one of the two is needed.",
      citation: { ...sourceDoc, section: "9.19.A" },
      confidence: "medium",
      notes:
        "PHA's own text only says 'On-board fire system per GCR 9.3.23.A' — it does not itself name a specific SFI or FIA system standard (e.g. SFI 17.1, FIA 8865-2015) within this document; that detail lives in the external SCCA GCR, which wasn't part of this fetch. Not asserting acceptance of a specific certification here without confirming the GCR text directly — treat this as 'an on-board system meeting the GCR's on-board fire system spec,' not a labeled standard confirmed in this PDF.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition:
        "PHA §9.11: fuel cell requirements are waived entirely for PHA's own Solo/TT-Derived and Special/Supplemental classes. Within GCR-based classes, a safety fuel cell complying with GCR specifications IS required, except for Touring, B-Spec, C-Spec, Spec Miata, Improved Touring, American Sedan restricted prep, production-based Vintage cars, and any car whose stock fuel tank sits between the axle centerlines and within the main chassis/frame rails (the stock tank may stay in its stock location in that case).",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
      materialNote:
        "Stock/OEM fuel tank is accepted for all PHA Solo/TT-Derived and Special classes, and for the listed GCR-class exemptions, provided it remains in its stock location (or as otherwise specified in the GCR).",
      citation: { ...sourceDoc, section: "9.11" },
      confidence: "medium",
      notes:
        "PHA's text requires compliance with 'the GCR specifications' for the classes where a cell is mandated, but does not itself name a specific SFI/FIA cell standard (e.g. SFI 28.1, FIA FT3/FT3.5/FT5) within this document — that detail lives in the external SCCA GCR (which itself accepts SFI 28.3 or FIA FT-3-or-higher, per this app's own SCCA Road Racing research). Since PHA doesn't name a specific spec in its own text, any registered fuel-cell homologation is treated as acceptable here.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "Full document search found no mention of a window breaker or seatbelt cutter tool as required driver/car equipment. The only related items are: window safety nets, which PHA models as an alternative to arm restraints for closed cars (§9.27, see the arm_restraint category above), and cutting tools (sharp knife, bolt cutters) required on the event's Course Response Vehicle (§5.16.2.5) — neither is a requirement placed on the competitor's own car.",
    },
    kill_switch: {
      requirement: "conditional",
      condition:
        "Required only for purpose-built race cars — 'any GCR class car unless otherwise specified as exempt in the current GCR' (§9.24). STRONGLY RECOMMENDED, but not mandatory, for all other cars.",
      citation: { ...sourceDoc, section: "9.24" },
      confidence: "high",
      notes:
        "Where fitted or required, the master switch must: install directly in either battery cable and cut all electrical circuits EXCEPT an on-board fire system; have insulated terminals; be marked with the international spark-in-a-blue-triangle symbol with OFF clearly indicated; and sit in one of PHA's standard locations for the car's category (formula/sports racer near the right roll-bar upright; closed sports racing/production/IT/Spec Miata/GT in front of the windshield or below the rear window; open production/GT/IT cars may choose either) — §9.24.A-C.",
    },
    tow_hook: {
      requirement: "recommended",
      materialNote:
        "PHA §9.28: 'Towing eyes are STRONGLY RECOMMENDED on all cars. If one is installed, it shall be of a closed design (i.e., not a hook).' Note this is the opposite of an open hook — PHA specifically requires a closed eye/loop, not a hook, if one is fitted.",
      citation: { ...sourceDoc, section: "9.28" },
      confidence: "high",
      notes: "Not mandatory. No color-marking requirement is stated.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "Full document search found no requirement for competitors to carry a tow rope/strap in their car. The only 'tow strap' mention in the document is among the equipment required on the event's Course Response Vehicle (§5.16.2.2.C), not the competitor's own vehicle.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Full document search found no mention of a warning/emergency triangle anywhere in this rulebook.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "Full document search found no requirement for competitors to carry a first aid kit in their car. PHA does mandate event-level medical provisions — a BLS unit with at least two certified caregivers including one EMT, a course response vehicle, and a wrecker (§5.16.2) — but nothing about driver-carried first aid supplies.",
    },
  },
  classOverrides: {
    "solo-tt-derived": {
      fuel_cell: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "9.11" },
        confidence: "high",
        notes: "PHA §9.11: fuel cell requirements are waived entirely for PHA's own Solo/TT-Derived classes — a stock/OEM fuel tank is assumed.",
      },
      kill_switch: {
        requirement: "recommended",
        citation: { ...sourceDoc, section: "9.24" },
        confidence: "high",
        notes: "Not a GCR class, so PHA's §9.24 kill-switch mandate ('any GCR class car') doesn't apply — STRONGLY RECOMMENDED, per the same section, for all non-GCR cars.",
      },
    },
    "special-supplemental": {
      fuel_cell: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "9.11" },
        confidence: "high",
        notes: "PHA §9.11: fuel cell requirements are waived entirely for PHA's Special/Supplemental classes — a stock/OEM fuel tank is assumed.",
      },
      kill_switch: {
        requirement: "recommended",
        citation: { ...sourceDoc, section: "9.24" },
        confidence: "high",
        notes: "Not a GCR class, so PHA's §9.24 kill-switch mandate ('any GCR class car') doesn't apply — STRONGLY RECOMMENDED, per the same section, for all non-GCR cars.",
      },
    },
    "gcr-touring-bspec-cspec": {
      fuel_cell: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "9.11" },
        confidence: "high",
        notes: "PHA §9.11 explicitly exempts Touring, B-Spec, and C-Spec from its fuel-cell mandate — a stock/OEM fuel tank is accepted, provided it stays in its stock location.",
      },
      kill_switch: {
        requirement: "recommended",
        citation: { ...sourceDoc, section: "9.24" },
        confidence: "medium",
        notes:
          "PHA §9.24 requires a kill switch on 'any GCR class car unless otherwise specified as exempt in the current GCR.' The underlying SCCA GCR's own kill-switch rule (§9.3.35, modeled in this app's SCCA Road Racing ruleset) exempts Touring/B-Spec/C-Spec — so these classes fall under PHA's 'STRONGLY RECOMMENDED, but not mandatory' language for non-required cars rather than the hard mandate.",
      },
    },
    "gcr-fuel-exempt-other": {
      fuel_cell: {
        requirement: "not_addressed",
        citation: { ...sourceDoc, section: "9.11" },
        confidence: "high",
        notes: "PHA §9.11 explicitly exempts Spec Miata, Improved Touring, and American Sedan (restricted prep) from its fuel-cell mandate — a stock/OEM fuel tank is accepted, provided it stays in its stock location.",
      },
      kill_switch: {
        requirement: "required",
        materialNote:
          "Master switch must: install directly in either battery cable and cut all electrical circuits EXCEPT an on-board fire system; have insulated terminals; be marked with the international spark-in-a-blue-triangle symbol with OFF clearly indicated; and sit in one of PHA's standard locations for the car's category.",
        citation: { ...sourceDoc, section: "9.24" },
        confidence: "high",
        notes:
          "These classes are exempted from PHA's fuel-cell mandate (§9.11) but are NOT among the classes the underlying SCCA GCR exempts from the kill-switch mandate (§9.3.35, unlike Touring/B-Spec/C-Spec) — so the §9.24 'any GCR class car' requirement still applies in full here.",
      },
    },
    "gcr-other": {
      fuel_cell: {
        requirement: "required",
        materialOnlyAccepted: false,
        acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
        materialNote: "A safety fuel cell complying with GCR specifications is required — the stock/OEM-tank exemption listed in §9.11 doesn't reach this group of classes.",
        citation: { ...sourceDoc, section: "9.11" },
        confidence: "medium",
        notes:
          "PHA's text requires compliance with 'the GCR specifications' but doesn't itself name a specific SFI/FIA cell standard within this document — that detail lives in the external SCCA GCR (which accepts SFI 28.3 or FIA FT-3-or-higher, per this app's own SCCA Road Racing research). Since PHA doesn't name a specific spec in its own text, any registered fuel-cell homologation is treated as acceptable here.",
      },
      kill_switch: {
        requirement: "required",
        materialNote:
          "Master switch must: install directly in either battery cable and cut all electrical circuits EXCEPT an on-board fire system; have insulated terminals; be marked with the international spark-in-a-blue-triangle symbol with OFF clearly indicated; and sit in one of PHA's standard locations for the car's category.",
        citation: { ...sourceDoc, section: "9.24" },
        confidence: "high",
        notes: "GCR class car with no stated exemption — the §9.24 'any GCR class car' requirement applies in full.",
      },
    },
  },
};

export const phaRulesets: Ruleset[] = [timeTrialHillclimb];

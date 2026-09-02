import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, SFI_3_3_IDS } from "../standards";

const sourceDoc = {
  title: "American Endurance Racing Rulebook",
  version: "Current online rulebook (verified Aug 2026)",
  url: "https://race.americanenduranceracing.com/rulebook",
};

const endurance: Ruleset = {
  id: "aer-endurance",
  bodyId: "aer",
  bodyName: "American Endurance Racing (AER)",
  disciplineName: "Endurance Racing",
  disciplineGroup: "Endurance Racing",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "1.4-1.6 Driver Equipment; 2.5.6 Arm Restraints" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true, note: "Rulebook says 'SA2015 or later' — later Snell generations (SA2020, SA2025) are assumed included under 'or later.'" },
        {
          standardId: "fia-8860-2004",
          noExpiration: true,
          note: "Rulebook cites 'FIA 8860-2004' by name — this exact generation is NOT currently in this app's standards registry (which has FIA 8860-2010/2018/2018-ABP/2024/2024-ABP but not the original 2004 issue). Flagged for the maintainer to add or map to the nearest registered generation.",
        },
      ],
      fullFaceRequirement: "required",
      citation: { ...sourceDoc, section: "1.4.4" },
      confidence: "high",
      notes:
        "Rulebook: 'A full-face helmet with a rating of SA2015 or later, or FIA 8860-2004. No open-face helmets will be allowed under any circumstances.' No stated expiration/sunset for the helmet rating itself.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required for any driver with hair or facial hair protruding from the helmet.",
      materialOnlyAccepted: false,
      acceptedStandards: [...SFI_3_3_IDS.map((standardId) => ({ standardId })), { standardId: "fia-8856-2000" }, { standardId: "fia-8856-2018", note: "Not explicitly named by AER's rule text (which only cites FIA 8856-2000), but assumed acceptable as the current FIA suit-family standard, matching this app's convention for other AER categories with the same gap." }],
      materialNote: "Rulebook §1.4.3: 'SFI 3.3 or FIA 8856-2000 or better' — a certified item, not just fire-resistant material.",
      citation: { ...sourceDoc, section: "1.4.3" },
      confidence: "high",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Rulebook: recertified every 5 years by the manufacturer; if a device is dual-certified by both FIA and SFI, AER requires the SFI 5-year recertification specifically." },
        { standardId: "fia-8858-2010", validityYearsFromLabel: 5 },
      ],
      citation: { ...sourceDoc, section: "1.5" },
      confidence: "high",
      notes:
        "Rulebook: 'Head and neck restraint, with a rating of SFI 38.1 or FIA 8858-2010 or better' (older FIA 8858-2002 not named, so not included here). Head and neck restraints may be shared among teammates (unusual — most bodies require personal equipment); not modeled since this app tracks per-item compliance, not sharing policy. No driver is allowed on track for qualifying or racing without a head and neck restraint.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", note: "Not explicitly named by AER's rule text (which only cites FIA 8856-2000), but the superseding FIA 8856-2018 standard is assumed acceptable in practice, matching this app's convention for other bodies with the same gap." },
        {
          standardId: "sfi-3.2a-1",
          note: "Only acceptable when paired with an FIA 8856-2000-rated or SFI 3.3-approved base layer (see undergarment category) — a bare SFI 3.2A/1 suit alone does not satisfy AER's rule.",
        },
      ],
      materialOnlyAccepted: false,
      citation: { ...sourceDoc, section: "1.4.1" },
      confidence: "high",
      notes:
        "Rulebook: driving suit must be 'SFI 3.2A/5 or FIA 8856-2000' OR 'SFI 3.2A/1 with FIA 8856-2000 or SFI 3.3 approved base layer.' No suit age/expiration limit is stated — only that it 'must be in good condition (no rips or tears, zippers operating properly, etc.).'",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'Shoes, socks and gloves, all to be rated at SFI 3.3 or FIA 8856-2000 or better' — no specific SFI 3.3 tier named, and no plain-material allowance (must be a certified item).",
      citation: { ...sourceDoc, section: "1.4.2" },
      confidence: "high",
      notes: "Gear 'must also be in good condition' — no separate age/expiration limit stated.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Same rule and citation as gloves — SFI 3.3 or FIA 8856-2000 or better, no plain-material allowance.",
      citation: { ...sourceDoc, section: "1.4.2" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'Shoes, socks and gloves, all to be rated at SFI 3.3 or FIA 8856-2000 or better' — no specific SFI 3.3 tier named, and no plain-material allowance (must be a certified item).",
      citation: { ...sourceDoc, section: "1.4.2" },
      confidence: "high",
      notes: "Gear 'must also be in good condition' — no separate age/expiration limit stated.",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required (fire-resistant base layer, top and bottom) only if the driving suit is a single-layer SFI 3.2A/1 suit. Not required if the suit is rated SFI 3.2A/5 or FIA 8856-2000 or higher.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: false,
      acceptedStandards: [
        ...SFI_3_3_IDS.map((standardId) => ({ standardId })),
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", note: "Not explicitly named by AER's rule text but assumed acceptable as the current FIA suit-family standard." },
      ],
      materialNote: "Rulebook: base layer must be 'FIA 8856-2000 or SFI 3.3 approved' — a certified base layer, not just any fire-resistant material.",
      citation: { ...sourceDoc, section: "1.4.1" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required for any car with no roof or a convertible/removable roof. Not required if the car has a positively fastened hardtop.",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({ standardId })),
      materialNote: "Rulebook: 'required to wear arm restraints that meet the SFI 3.3 specification' — no tier named, and a certified item is required (not just fire-resistant material).",
      citation: { ...sourceDoc, section: "2.5.6" },
      confidence: "high",
    },
    seat: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "fia-8855-1999" },
        { standardId: "fia-8862-2009" },
        { standardId: "sfi-39.1" },
        { standardId: "sfi-39.2" },
      ],
      materialNote:
        "Rulebook §2.5.8.1: 'The seat must be a one-piece, purpose-built racing seat that is manufactured to one of the following standards: FIA 8855-1999, FIA 8862-2009, SFI 39.1 or SFI 39.2' — no stock/OEM alternative is offered. Unlike PHA and other bodies with a non-caged tier, this isn't conditional on class or car type: AER §2.5.3 requires 'a minimum of a six-point cage' on 'all cars that will be used in qualifying sessions or races,' with no exemption for lower classes — since every AER car is caged, every AER car also needs the certified seat.",
      citation: { ...sourceDoc, section: "2.5.8.1" },
      confidence: "high",
      notes:
        "Re-checked against the current online rulebook specifically to confirm whether AER, like PHA, allows a stock/OEM seat for some tier — it does not. AER runs a single uniform car-prep standard (no street/non-caged class): §2.5.3 mandates a minimum six-point roll cage on every car used in qualifying or racing, with class assignment (§2.4, done post-qualifying by lap time) affecting only competitive grouping, not safety-equipment requirements. Because there's no non-caged path in this series, materialOnlyAccepted is explicitly false — a purpose-built certified seat is mandatory for every car, no exceptions found. §2.5.8.2: seat back must extend 'at least halfway up the helmet of the driver.' §2.5.8.3-2.5.8.4: sliders/brackets are explicitly contemplated and allowed (not a fixed-mount-only rule) — 'attachment hardware, brackets, sliders, load spread plates, and washers must be adequately sized for the application,' and installation methods, seat age, and any bracing/brackets/sliders used must be compliant with the seat manufacturer's recommendations and applicable standards.",
    },
    belts_harness: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8853-98" },
        { standardId: "sfi-16.1" },
        { standardId: "sfi-16.5" },
      ],
      citation: { ...sourceDoc, section: "2.5.5" },
      confidence: "high",
      notes:
        "Rulebook §2.5.5: 'Five-, six-, or seven-point harnesses are required and must meet either FIA 8853/98 or SFI 16.1 or SFI 16.5.' Belts must be compatible with any head and neck restraint used in the car; 'no expired belts will be accepted' but AER's own text does not state a specific expiration interval — defer to the expiration printed on the belt's own certification label. Belts in poor condition or lacking proper identification will not be accepted. Regardless of which of the three certifications the webbing carries, harnesses must be installed to SFI 16.5 installation standards.",
    },
    window_net: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "sfi-27.1",
          validityYearsFromLabel: 5,
          note: "AER §2.5.12: driver-side window net, required on ALL cars regardless of roof type. Rulebook text also names 'FIA J253-11' as an accepted alternative for this specific net — that generation is not currently in this app's standards registry, so only the SFI cross-reference is modeled here.",
        },
        {
          standardId: "fia-8863-2015",
          validityYearsFromLabel: 5,
          note: "AER §2.5.13 separately requires a CENTER net (a distinct physical net from the driver-side one above), rated 'SFI 37.1 or FIA 8863-2013' — required on ALL cars regardless of roof type. Neither the SFI 37.1 spec (a different design standard than the driver-side SFI 27.1 net) nor the exact FIA 8863-2013 generation is currently in this app's standards registry (which only has FIA 8863-2015 and SFI 27.1 under window_net), so FIA 8863-2015 is used here as the closest available match. Flagged for the maintainer to add SFI 37.1 and the FIA 8863-2013/J253-11 generations as distinct registry entries so the two nets can be tracked separately.",
        },
      ],
      citation: { ...sourceDoc, section: "2.5.12-2.5.13" },
      confidence: "high",
      notes:
        "AER requires TWO separate window nets, not one: §2.5.12 mandates an SFI 27.1 or FIA J253-11 approved net on the driver's side, and §2.5.13 separately mandates an SFI 37.1 or FIA 8863-2013 approved center net — both required on every car regardless of roof configuration. Both nets are 'valid up to five years from date of manufacture' and reviewed as part of annual Tech. Window nets and arm restraints are NOT interchangeable under AER's rules (confirmed by direct read of the current online rulebook): window nets are mandatory on every car, while arm restraints (§2.5.6, see arm_restraint category) are only required on cars with no roof or a convertible/removable roof, and are waived solely for cars with a positively fastened hardtop. A hardtop car is exempt from arm restraints but still needs both required window nets; an open car needs arm restraints in addition to both nets. Because neither ever substitutes for the other, no satisfiedByAlternative wiring is used here, unlike bodies (e.g. PHA) that treat window nets and arm restraints as interchangeable alternatives.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "2.5.7 / 8.8" },
      confidence: "high",
      notes:
        "AER's §2.5.7 'On-Board Fire System' is a fixed suppression system with routed lines and actuator(s), not a handheld extinguisher — that requirement is modeled under the fire_suppression category instead. Separately, §8.8 requires a dedicated crew member ('fireman') to stand by with a ten-pound, UL Class A/B/C-rated fire extinguisher during fueling stops — but that is pit-crew procedural equipment held by a person in the hot pits, not a unit carried in or mounted on the competition car itself, so it isn't modeled here as an onboard fire_extinguisher requirement. No distinct handheld-extinguisher-in-the-car requirement was found anywhere in the rulebook.",
    },
    fire_suppression: {
      requirement: "required",
      citation: { ...sourceDoc, section: "2.5.7" },
      confidence: "high",
      notes:
        "Rulebook §2.5.7.1: 'All cars must have an on-board fire system installed,' using lines routed through the car with actuator(s), at least one of which must be reachable by the belted driver. §2.5.7.2 lists acceptable agents: Novec 1230, Halon 1301/1211, Halotron I, hexafluoropropane, HFC-236a, CC0610, or FE-36 at five (5) pound minimum (other agents acceptable only 'in SFI certified systems' — no specific SFI/FIA system standard number is named anywhere in the rule text, so no acceptedStandards entry is modeled here to avoid fabricating one); or AFFF material (e.g. SPA Lite, ZERO 2000, Coldfire 302) at 2.25 liter minimum, or Lifeline Zero 360 Novec at 2.25L+, with appropriate atomizing nozzles, a working pressure gauge, and bottles marked with filled weight; or CEA614 with lines/nozzles replaced per the manufacturer's (3M) instructions. §2.5.7.3: minimum two nozzles, one in the cockpit and one in the engine bay, manual or auto-release. §2.5.7.4: cylinders must be through-bolted. §2.5.7.5: an electric solenoid/switch used to activate the system must not lose power when the master electrical or ignition switch is off; cars must display a circular 'E' decal at the location of easiest access to the actuator (exterior or interior) and another at the interior actuator itself. §2.5.7.6: systems must be inspected/serviced/maintained per the manufacturer's requirements, 'typically... every two years,' checked as part of annual Tech.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition:
        "Only applies if an aftermarket fuel cell is installed (any fuel tank that is not the car's original tank in its original position). Keeping the original factory tank in its original position carries no fuel-cell certification requirement under this rule.",
      acceptedStandards: [
        {
          standardId: "fia-ft3-1999",
          note: "Rulebook §2.6.1 cites only 'the FIA FT-3 standard' by name, without a generation year — mapped to this app's fia-ft3-1999 registry entry as the closest match; AER's text does not itself specify 2009/2015/etc.",
        },
      ],
      citation: { ...sourceDoc, section: "2.6.1" },
      confidence: "high",
      notes:
        "Rulebook §2.6: aftermarket fuel cells of any size are 'permitted but not required.' If installed, per §2.6.1 the entire cell (enclosure, construction method, bladder, foam) must comply with the FIA FT-3 standard. §2.6.2: a cell without an exterior metallic case must be enclosed in metal. §2.6.3: must have appropriate discriminator and/or rollover valves to prevent fuel spillage if the car rolls over. §2.6.4: the original tank may be kept and used if left in the car's original position. §2.6.5: a new or relocated fuel filler port must not allow gasoline to drip onto hot components (exhaust, brakes, etc.). §2.7 (general, all cars): fuel system components must be separated from the driver's compartment by a metal bulkhead, added vents need a discriminator valve, and venting must exit outside the car only.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "No handheld window-breaker or seatbelt-cutter tool requirement was found anywhere in the rulebook. (Not to be confused with the required window nets — an SFI 27.1 or FIA J253-11 approved driver-side net per §2.5.12, and an SFI 37.1 or FIA 8863-2013 approved center net per §2.5.13, both valid up to five years from date of manufacture — those are nets covering the window/cockpit openings, a different piece of equipment from a glass-breaking or belt-cutting tool, and window nets aren't one of this app's tracked categories.)",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...sourceDoc, section: "2.5.11" },
      confidence: "high",
      notes:
        "Rulebook §2.5.11: 'A master electrical shut-off is required,' must be within reach of the driver when belted in with all required safety equipment (2.5.11.1), marked with the appropriate decal (2.5.11.2), and must isolate the battery, completely shut the car down, interrupt fuel supply, and turn off all lighting (2.5.11.3) — exceptions to lighting may be made for night races per event supplements (2.5.11.3.1). A low-amperage (max 10A, fused within 12 inches of the battery) circuit may remain powered for items like cameras/routers/comms even with the master switch activated, but never for the fuel system or engine management (2.5.11.4); exceptions for alternative battery isolation devices are considered case-by-case (2.5.11.4.1). Related battery-mounting rule (§2.5.10): battery terminals and cable clamps must be covered with non-conductive material; a battery inside the driver's compartment must be in a marine-type case, fully covered and secured to the chassis; lithium-ion batteries must be outside the passenger compartment entirely. During fueling, the master electrical shut-off must be switched off (§8.7).",
    },
    tow_hook: {
      requirement: "required",
      towHookSidesRequired: "both",
      citation: { ...sourceDoc, section: "2.17" },
      confidence: "high",
      notes:
        "Rulebook §2.17: 'Cars must have a tow point on both the front and rear of the car. These tow points must be securely installed to a point on the chassis that can withstand the pulling forces needed to extract the car from a gravel trap, muddy or soft ground. \"TOW\" indicators must be clearly marked on the body panel.' No specific hook diameter or hardware spec is given.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "2.17" },
      confidence: "high",
      notes:
        "The rulebook does not require teams to carry a separate tow rope/strap as recovery equipment — §2.17 only mandates fixed front and rear tow points on the car's chassis (see tow_hook category).",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "No warning-triangle or roadside-emergency-triangle requirement was found anywhere in the rulebook.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "No first aid kit requirement was found anywhere in the rulebook.",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "Checked the rulebook for hood pin / hood fastener / hood latch / positive latch language (both a fetch of the rulebook page and a direct download-and-grep of the underlying rulebook HTML for 'hood') — not addressed; no requirement, recommendation, or mention found anywhere in the current text.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "8.10" },
      confidence: "high",
      notes:
        "Checked the rulebook for spill kit / spill containment / absorbent-material / oil-dry / kitty-litter language (both a fetch of the rulebook page and a direct download-and-grep of the underlying rulebook HTML) — not addressed; no requirement for teams to carry an absorbent spill-containment kit was found. Separately, §8.10 requires 'a sturdy metal, non-sparking catch pan at least two and a half inches deep' positioned to catch spilled fuel during all fueling operations — that's fueling-procedure equipment with no absorbent-material component, so it isn't treated as satisfying this category (the same catch-pan-without-absorbent distinction drawn for other bodies in this app).",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionAcceptedLogbookBodies: ["scca", "nasa"],
      rolloverProtectionRequiresPadding: true,
      rolloverProtectionPaddingCertRequired: true,
      citation: { ...sourceDoc, section: "2.5.3-2.5.4 Cage Construction & Padding" },
      confidence: "medium",
      notes:
        "§2.5.3: 'All cars that will be used in qualifying sessions or races must have a minimum of a six-point cage' — required outright, universal across the series, no class exemption. AER accepts cage construction complying with SCCA, NASA, BMW CCA, PCA, IMSA, or FIA standards rather than publishing its own tubing/material spec, and permits chassis stiffening. Padding (§2.5.4): 'All surfaces of roll cage tubing that the driver's head or body may contact must be covered in SFI 45.1 or FIA Type A padding.' Confidence is medium since this was sourced via an AI-summarized read of the rulebook's web page rather than a direct verbatim PDF read, and no weight-tiered tubing size table (unlike bodies with their own published spec) was found.",
    },
  },
};

export const aerRulesets: Ruleset[] = [endurance];

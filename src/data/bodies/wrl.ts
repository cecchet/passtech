import { Ruleset } from "../types";
import { GENERIC_FUEL_CELL_STANDARDS, SFI_3_3_IDS } from "../standards";

const sourceDoc = {
  title: "World Racing League Rules",
  version: "2026 Rules Version 2026.1.3",
  url: "https://www.racewrl.com/rules",
};

// WRL's driver/car safety-equipment rules are, per a full re-read of the current 2026.1.3
// rulebook, genuinely universal across its GTO and GTU classes (Grand Touring, split by a
// 2,400 lb weight threshold per Appx. A - Section E) for every category EXCEPT window_net: helmet,
// balaclava, HNR, firesuit, gloves, shoes, undergarment, arm restraint, seat, belts/harness, fire
// extinguisher, fire suppression, fuel cell, kill switch, tow hook, tow rope, emergency triangle,
// first aid kit, and window breaker none name GTO or GTU differently anywhere in the text — the
// prior research note on the seat category ("Appendix A is the single, universal vehicle-prep
// section covering both its classes") holds for the whole file except this one rule. Appx. A.3.f
// (cross-referencing A.4.b) gives GTU a real, narrowly-scoped exception GTO does not get: a GTU
// car with a cut door-window opening of 8"x14" or smaller may run an uncertified triangular
// containment net instead of an SFI 27.1-rated one; GTO has no equivalent small-opening allowance
// anywhere in the current text and must always use a certified net (or the lexan-window
// alternative, which isn't itself a tracked category). classOverrides below refines window_net
// per class on that basis; every other category is left to the general base `categories` picture.
const endurance: Ruleset = {
  id: "wrl-endurance",
  bodyId: "wrl",
  bodyName: "World Racing League (WRL)",
  disciplineName: "Endurance Racing",
  disciplineGroup: "Endurance Racing",
  lastReviewed: "2026-08-15",
  sourceDocuments: [{ ...sourceDoc, section: "B.2 Personal Safety Gear; Appendix A.3.f Window Net" }],
  classes: [
    { id: "gto", label: "GTO (Grand Touring, over 2,400 lbs)" },
    { id: "gtu", label: "GTU (Grand Touring, under 2,400 lbs)" },
  ],
  classOverrides: {
    gto: {
      window_net: {
        requirement: "conditional",
        condition:
          "Required, meeting SFI 27.1 (intrusion) spec, unless the car instead runs a lexan/rigid front quarter-window covering (extending no more than 12\" rearward from the front of the factory window opening) or, if built and raced with door windows in place under the A.4.b AC/driver-cooling conditions, polycarbonate/lexan door windows. GTO does NOT get GTU's small-window-opening carve-out — there's no path to an uncertified net for this class.",
        materialOnlyAccepted: false,
        acceptedStandards: [
          {
            standardId: "sfi-27.1",
            validityYearsFromLabel: 2,
            note: "Rulebook: 'Window nets should be installed to manufacturer specification and be updated at two-year intervals from the date of manufacture.'",
          },
        ],
        materialNote:
          "A plain, uncertified net never satisfies this rule for GTO — an SFI 27.1-certified net is required unless the car qualifies for the lexan-window car-equipment substitute described in the condition above.",
        citation: { ...sourceDoc, section: "Appendix A, Section A.3.f / A.4.b (Window Net)" },
        confidence: "high",
      },
    },
    gtu: {
      window_net: {
        requirement: "conditional",
        condition:
          "Required, meeting SFI 27.1 (intrusion) spec, for most GTU cars — with two carve-outs. A car is exempt from the net entirely if it runs a lexan/rigid front quarter-window covering, or (for factory-built cars raced with door windows in place under the A.4.b AC/driver-cooling conditions) polycarbonate/lexan door windows. Separately, and unique to GTU: a car with a cut window opening of 8\"x14\" or smaller (per Appx. A-4.b) may run a triangular containment net that does NOT meet SFI 27.1, in place of a certified net.",
        materialOnlyAccepted: true,
        acceptedStandards: [
          {
            standardId: "sfi-27.1",
            validityYearsFromLabel: 2,
            note: "Rulebook: 'Window nets should be installed to manufacturer specification and be updated at two-year intervals from the date of manufacture.'",
          },
        ],
        materialNote:
          "The uncertified-net path only applies to the narrow small-window-opening case described above (8\"x14\" or smaller) — a GTU car with a larger opening still needs a certified SFI 27.1 net, same as GTO. This app's materialOnlyAccepted flag can't cleanly represent that scoped exception, so treat 'material only' here as 'qualifies for GTU's small-opening triangular-net carve-out,' not a blanket pass.",
        citation: { ...sourceDoc, section: "Appendix A, Section A.3.f / A.4.b (Window Net)" },
        confidence: "high",
      },
    },
  },
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8859-2020", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
        { standardId: "fia-8859-2024-abp", noExpiration: true },
      ],
      fullFaceRequirement: "required",
      citation: { ...sourceDoc, section: "B.2.a" },
      confidence: "medium",
      notes:
        "Rulebook: 'Full-face with visor (face shield). No structural damage. Rated Snell SA/SAH-2015 or 2020 for drivers... Helmets meeting current FIA standards are permitted.' Two ambiguities: (1) the 'SAH' reference has no matching SAH2015/SAH2020 entries in this app's standards registry (only 'snell-sah2010' exists) — possibly a rulebook holdover/typo, flagged for the maintainer; (2) 'current FIA standards' isn't itemized, so the current FIA 8859 (auto racing helmet) generations are assumed — FIA 8860 (higher-spec) generations were not added since WRL doesn't reference them. Notably WRL does NOT list Snell SA2025, unlike most other bodies in this app — confirmed from the current 2026.1.3 rulebook text, not an oversight.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "D.3" },
      confidence: "high",
      notes:
        "No balaclava requirement for drivers. Rule D.3.d/e allows crew members (not drivers) to substitute an open-face helmet with a full-face balaclava and goggles when not directly fueling — a crew-only allowance, not a driver requirement.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1" },
        { standardId: "fia-8858-2002" },
        { standardId: "fia-8858-2010" },
      ],
      citation: { ...sourceDoc, section: "B.2.f" },
      confidence: "medium",
      notes:
        "Rulebook: 'Drivers must wear a FIA 8858 or SFI 38.1 rated Head and Neck device and must carry an in-date certification.' No FIA generation year or SFI slash-level is specified. WRL does not itself state a recertification interval (unlike AER's stated 5-year rule) — 'in-date certification' is read here as deferring to the device's own manufacturer-issued recertification date, so no expiresOn/validityYearsFromLabel is encoded; this should be spot-checked.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        {
          standardId: "sfi-3.2a-1",
          note: "Only acceptable when paired with SFI 3.3-rated underwear, top and bottom (see undergarment category) — a bare SFI 3.2A/1 suit alone does not satisfy WRL's rule.",
        },
      ],
      materialOnlyAccepted: false,
      citation: { ...sourceDoc, section: "B.2.b" },
      confidence: "high",
      notes:
        "Rulebook: 'Fire retardant racing suit rated FIA 8856-2000 (or later), or SFI 3.2A/5, or higher. SFI 3.2A/1 suits may be worn with SFI 3.3 rated underwear top and bottom. The suit must be in good condition - no holes, oil stains, etc.' No suit age/expiration limit is stated by WRL.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.3-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", note: "Not explicitly named by WRL's rule text (which only cites FIA 8856-2000) but assumed acceptable as the current FIA suit-family standard, matching this app's convention for other bodies with the same gap." },
      ],
      materialNote: "Rulebook: 'SFI 3.3/5 & FIA 8856/2000 rated gloves & shoes are required for all drivers' — a certified item, not just fire-resistant material.",
      citation: { ...sourceDoc, section: "B.2.d" },
      confidence: "medium",
      notes: "SFI 3.3/5 is an unusual glove-specific citation (SFI 3.3 normally covers the whole apparel family across several tiers) — transcribed as written; worth spot-checking against a current copy, same caveat noted for Pikes Peak's near-identical phrasing.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.3-5" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", note: "Not explicitly named by WRL's rule text but assumed acceptable as the current FIA suit-family standard." },
      ],
      materialNote: "Same rule and citation as gloves — 'SFI 3.3/5 & FIA 8856/2000 rated gloves & shoes are required for all drivers.'",
      citation: { ...sourceDoc, section: "B.2.d" },
      confidence: "medium",
      notes:
        "SFI 3.3/5 as a shoe-specific citation is unusual for the same reason noted on gloves. Separately, §B.2.e requires socks rated SFI 3.3 or FIA 8856/2000 for drivers — not modeled since socks aren't a tracked category in this app; shown here as an adjacent requirement to check for.",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required (SFI 3.3-rated underwear, top and bottom) only if the driving suit is a single-layer SFI 3.2A/1 suit. Not required with SFI 3.2A/5-or-higher or FIA 8856-2000/2018-rated suits.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({ standardId })),
      materialNote: "Rulebook just says 'SFI 3.3 rated underwear' when required — no specific tier named, but a certified item is required, not just fire-resistant material.",
      citation: { ...sourceDoc, section: "B.2.b" },
      confidence: "high",
      notes: "Section B.2.e separately requires SFI 3.3 or FIA 8856/2000 rated socks for drivers — not modeled since socks aren't a tracked category in this app.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Appendix A, Section A.3.f (Window Net)" },
      confidence: "high",
      notes:
        "Confirmed via full read of the current rulebook (2026.1.3 — a second full-document pass was done specifically to research the new window_net category below, including a text search for \"arm\" — no hits): WRL requires an SFI 27.1-rated window net (or a lexan/rigid quarter-window covering per Appx. A-4.b) on essentially all cars, with no arm-restraint alternative or requirement mentioned anywhere in the current text — see the window_net category (Appx. A.3.f) below for the actual net requirement, now modeled directly. No satisfiedByAlternative is set on either arm_restraint or window_net for WRL: unlike PHA, which frames the two as a genuine driver-facing either/or, WRL's rulebook never offers arm restraints as a substitute for anything — the window net's own escape hatch is a car-equipment substitute (lexan window coverings), not arm restraints. Note this is a change from WRL's older 2022.1.1 rulebook, which explicitly allowed arm restraints as an alternative to a window net and required them on open-top/convertible cars — that language has been removed from the current rulebook.",
    },

    // --- Car safety gear ---------------------------------------------------------------
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [
        {
          standardId: "fia-8855-1999",
          note: "WRL's rule text only references a 'current FIA rating' generically, without naming a specific FIA seat standard number — both current FIA seat homologation standards in this app's registry are listed here on that basis, the same convention used by this file's helmet entry for WRL's equally generic 'current FIA standards' phrasing.",
        },
        { standardId: "fia-8862-2009", note: "Same basis as fia-8855-1999 above — not itemized by WRL." },
      ],
      materialNote:
        "Appx. A, A.3.g: 'One-piece seat with a rigid shell, designed specifically for auto racing is required. The seat must be securely mounted at a minimum of four points at the base... Seats that don't have a current FIA rating must have a seat back brace installed if the seat back will be more than 3\" from the harness bar for any driver.' A certification label is NOT actually mandatory for compliance in this caged wheel-to-wheel series — an uncertified rigid-shell, purpose-built racing seat is fully compliant provided the back-brace condition is met when applicable; an FIA rating only exempts the car from that back-brace requirement. This is NOT a green light for a genuine unmodified stock/OEM seat, though — WRL still mandates a one-piece, rigid-shell seat 'designed specifically for auto racing,' which a factory seat does not meet; materialOnlyAccepted here just means no certification number is required on that racing seat, mirroring PHA's identical §8.3.L construction-not-certification pattern for this category.",
      citation: { ...sourceDoc, section: "Appendix A, Section A.3.g" },
      confidence: "high",
      notes:
        "Re-checked directly against the cached rulebook PDF (rulebooks/wrl-rules.pdf, version 2026.1.3 per its cover page — sourceDoc.version now corrected to match, was previously stuck at 2026.1.2). No SFI seat standard (e.g. SFI 39.1/39.2) is mentioned anywhere in the current text, so acceptedStandards is left FIA-only. Appendix A - Vehicle Preparation and Classing is the single, universal car-prep section for WRL's caged classes (GTO and GTU) — there is no separate lower tier or class with a distinct, more permissive seat rule; a full-text search for 'stock seat'/'OEM seat'/'bench seat'/'factory seat' returned no hits. Seat sliders/rails vs. a fixed mount: not addressed either way — WRL only specifies '4 points at the base' with 3\" dia. (min) backing washers/plates if bolted through the floor, with no explicit ruling on adjustable slider mounts.",
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
      ],
      materialNote:
        "Rulebook: '5, 6, or 7-point racing harnesses with current FIA or SFI rating are required to be installed and used per manufacturer specifications' — stock/OEM belts do not satisfy this; a certified aftermarket harness is required.",
      citation: { ...sourceDoc, section: "Appendix A, Section A.3.e" },
      confidence: "medium",
      notes:
        "WRL cites 'current FIA or SFI rating' generically without naming a specific SFI 16.x tier or FIA 8853 generation — all registered SFI 16.x and FIA 8853 standards are listed here on that basis. No harness expiration interval (e.g. a stated 2-year or 5-year window) is given by WRL itself; 'current' is read as deferring to the harness's own manufacturer-printed expiration date, the same convention used by this file's hnr entry for 'in-date certification.' Mounting: sub belts and lap belts must attach to structural members or be bolted through the floor with 3\" dia. (min) backing washers/plates; shoulder straps must be properly secured to the harness bar.",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "Required, meeting SFI 27.1 (intrusion) spec, for ALL CARS not running lexan windows per Appx. A-4.b. A car is entirely exempt from the net if it instead runs a lexan/rigid front quarter-window covering (extending no more than 12\" rearward from the front of the factory window opening) or, for factory-built GTO/GTU cars raced with door windows in place under the A.4.b AC/driver-cooling conditions, polycarbonate/lexan door windows. Separately, GTU cars with a cut window opening of 8\"x14\" or smaller (per Appx. A-4.b) may run a triangular containment net that does NOT meet SFI 27.1 in place of a certified net.",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-27.1",
          validityYearsFromLabel: 2,
          note: "Rulebook: 'Window nets should be installed to manufacturer specification and be updated at two-year intervals from the date of manufacture' — modeled as a 2-year validity window measured from the net's manufacture date.",
        },
      ],
      materialNote:
        "Rulebook: 'Window nets must completely cover the window opening such that the driver's hands or arms cannot extend outside of the window opening when belted... Triangular containment nets not meeting SFI 27.1 specifications will not be permitted for use as \"window nets\"' — a plain, uncertified net does not satisfy this rule for the general case; an SFI 27.1-certified net is required unless the car qualifies for one of the two carve-outs described in the condition above (lexan windows in lieu of any net, or a GTU small-opening triangular net in lieu of a certified one). Penetration of the net webbing is prohibited except as performed by the manufacturer.",
      citation: { ...sourceDoc, section: "Appendix A, Section A.3.f (Window Net)" },
      confidence: "high",
      notes:
        "No satisfiedByAlternative to arm_restraint is set: confirmed via a full read of the current 2026.1.3 rulebook, including a targeted text search for 'arm', that WRL never mentions arm restraints anywhere in the current text — there is no either/or relationship between window nets and arm restraints for WRL (unlike PHA's model, where satisfiedByAlternative is set symmetrically on both categories). WRL's actual escape hatch from the SFI 27.1 net requirement is a car-equipment substitute — a lexan/rigid quarter-window covering, or factory-style lexan/poly door windows for eligible GTO/GTU cars — not a driver-worn arm restraint; since 'lexan window covering' isn't itself a tracked category in this app, that exemption is captured only in the condition/materialNote text above. This app's materialOnlyAccepted flag is a single boolean for the whole category, so it can't cleanly represent the narrow GTU small-opening carve-out (an uncertified triangular net IS accepted, but only for that one scoped case) — flagged here rather than set generally, matching this file's seat entry's approach to a similar schema-fit gap.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Appendix A, Section A.3.b; D.3.j" },
      confidence: "high",
      notes:
        "Confirmed via full read of the current rulebook: WRL does not require a handheld fire extinguisher mounted in the car itself. Instead, an onboard automatic FIRE SUPPRESSION system (FIA technical list #16/52 or SFI 17.1) is a mandatory minimum safety requirement — see the fire_suppression category. Separately, §D.3.j requires the pit crew's 'Fireman' to man a fully charged and inspected 10lb handheld fire bottle during fueling, positioned roughly 10' from the fuel port — this is pit-crew/fueling-process equipment, not a car-mounted item, so it isn't modeled under this vehicle-equipment category.",
    },
    fire_suppression: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-17.1" },
        {
          standardId: "fia-8865-2015",
          note: "WRL's rule text literally cites 'FIA technical list # 16 or 52' rather than 'FIA 8865-2015' by standard number. FIA technical list 52 covers fire-extinguishing systems homologated to FIA 8865-2015, the only FIA fire-suppression standard in this app's registry, so it's listed here as the closest match. 'FIA technical list # 16' appears to reference a separate/older FIA list with no corresponding entry in this app's registry — flagged for a maintainer to verify rather than guessed at.",
        },
      ],
      citation: { ...sourceDoc, section: "Appendix A, Section A.3.b" },
      confidence: "medium",
      notes:
        "Rulebook: 'Fire Suppression Systems must be FIA technical list # 16 or 52, Or SFI 17.1' — listed under 'Safety Requirements... the following are the minimum safety requirements,' i.e. mandatory, not optional. Service/cylinder life: both FIA and SFI systems must be serviced by an authorized service center every 2 years; FIA systems have a 10-year cylinder life, SFI systems a 6-year cylinder life — not encoded as expiresOn/validityYearsFromLabel since these are service/cylinder-replacement intervals rather than a simple label-date expiration, but flagged here for the UI's benefit. An activation point within easy reach of the belted driver is required; an externally-activatable point (marked with a round 'E' label, ideally near the master switch) is highly recommended, not mandatory. Recommended minimum charge for larger cockpits: 3kg/6.6lb or ~3L for FIA tech-list-16 systems, or 10lb for SFI 17.1 systems — stated as a recommendation ('it is recommended'), not a hard minimum, so not modeled as a strict requirement.",
    },
    fuel_cell: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_FUEL_CELL_STANDARDS,
      materialNote:
        "Rulebook: 'Fuel cells are allowed if properly installed and maintained' — the factory/OEM fuel tank is the assumed default (the fuel-capacity formulas throughout Appx A - A.4.f are built around '1 factory fuel tank plus one auxiliary/surge tank'); no certification is required to keep the stock tank.",
      citation: { ...sourceDoc, section: "Appendix A, Section A.4.e" },
      confidence: "high",
      notes:
        "If an aftermarket fuel cell IS used, WRL does not cite a specific SFI/FIA certification standard number anywhere in the current text (no SFI 28.1 / FIA FT3-FT5 reference) — it instead requires the cell to be 'designed for automotive use, consist of a deformable bladder or rotary-molded plastic vessel with a metallic enclosure, and be manufactured by recognized manufacturers approved by WRL,' a construction/approval requirement rather than a named certification. Since WRL doesn't name a specific spec, any registered fuel-cell homologation is treated as acceptable for a driver who does choose to run a certified cell. Spring-loaded 'Monza-style' caps are explicitly disallowed. An auxiliary/surge tank is permitted alongside the primary tank/cell with WRL pre-approval (photos/description submitted 30+ days before the event); both tanks must be vented independently with a check valve (a rollover valve is also required if the check valve isn't itself a rollover valve).",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...sourceDoc, section: "Appendix A, Section A.3.c" },
      confidence: "high",
      notes:
        "Rulebook: the master switch 'must isolate the battery from all circuits and must interrupt the ignition circuit. Positive terminals of the battery and switch must be insulated. A \"Master Switch\" decal with the universal \"lightning bolt\" and the word \"OFF\" must be displayed on the exterior as near the switch as possible.' Switch location itself is open/unspecified, as long as it can be easily located and deactivated by the driver, a crew member, or a safety worker. Separately (§A.3.b, fire suppression), it's highly recommended — not required — to locate the external fire-suppression activation point close to the master switch, marked with a distinct triangle-lightning-bolt label.",
    },
    tow_hook: {
      requirement: "required",
      citation: { ...sourceDoc, section: "Appendix A, Section A.4.d" },
      confidence: "high",
      notes:
        "Rulebook: tow hooks 'must be installed securely on the front and rear of all vehicles and easily visible.' Hidden, folding, or otherwise obscured tow hooks must be marked with a 'TOW' sticker. The rulebook explicitly warns that cars without a tow point that become disabled will be moved by 'any means necessary,' which may damage the body/suspension — i.e. there's no fallback; a working, visible tow point at both ends is expected.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Appendix A" },
      confidence: "high",
      notes: "Confirmed via full read of the current rulebook: no tow rope/strap requirement is mentioned anywhere in the current text.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Appendix A" },
      confidence: "high",
      notes: "Confirmed via full read of the current rulebook: no warning-triangle requirement is mentioned anywhere in the current text.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Appendix A" },
      confidence: "high",
      notes: "Confirmed via full read of the current rulebook: no first aid kit requirement is mentioned anywhere in the current text.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Appendix A, Section A.3.f (Window Net)" },
      confidence: "high",
      notes:
        "Confirmed via full read of the current rulebook: no window-breaker/seatbelt-cutter tool requirement is mentioned anywhere in the current text. WRL does require a separate SFI 27.1-rated window net (a containment device, not a breaker/cutter tool) on essentially all cars — see the arm_restraint entry's notes above for that requirement, which also isn't modeled as its own category since 'window net' isn't one of this app's tracked categories.",
    },
  },
};

export const wrlRulesets: Ruleset[] = [endurance];

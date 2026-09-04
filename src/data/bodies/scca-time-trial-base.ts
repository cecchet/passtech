import { CategoryRule, EquipmentCategory, SourceDocument } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

/**
 * SCCA Time Trials "Safety Level 2" driver-gear rules, shared by any club/series whose own
 * rules just say "meet SCCA Time Trial Safety Level 2/3" rather than restating equipment
 * requirements themselves (e.g. Appalachian HillClimb Series). Safety Level 3 adds only a
 * roll cage on top of Level 2 — no additional driver-gear items — so it's driver-PPE-identical
 * to Level 2 and doesn't need its own copy here for every other category. rollover_protection
 * below IS the one place Level 2 and Level 3 genuinely diverge (4-point roll bar vs. full
 * cage) — modeled as the Level 2 baseline (required for every Level-2-or-higher vehicle, not
 * just convertibles) with the Level 3 upgrade documented in its notes, since a client using
 * this shared base (e.g. Appalachian HillClimb Series) doesn't currently split its own classes
 * by safety level.
 *
 * A club with its OWN restated/superseding equipment rules (e.g. PHA, whose SUPPS explicitly
 * take precedence over the base SCCA Time Trial Rules) should NOT use this — write its own
 * CategoryRule set instead, since it may differ from this base (PHA's full-face rule is
 * stricter, for instance).
 */
export const SCCA_TT_LEVEL2_SOURCE: SourceDocument = {
  title: "SCCA Time Trials Full Safety Rules",
  version: "Safety Level 2",
  section: "IV.2 Safety Level 2 — 3. Driver Safety Gear",
  url: "https://timetrials.scca.com/pages/full-safety-rules",
};

export const SCCA_TT_LEVEL2_CATEGORIES: Partial<Record<EquipmentCategory, CategoryRule>> = {
  helmet: {
    requirement: "required",
    acceptedStandards: [
      { standardId: "snell-sa2025", noExpiration: true },
      { standardId: "snell-sa2020", noExpiration: true },
      { standardId: "snell-ea2016", noExpiration: true },
      { standardId: "snell-sa2015", noExpiration: true },
      { standardId: "sfi-31.1-2015", noExpiration: true },
      { standardId: "sfi-31.1-2020", noExpiration: true },
      { standardId: "fia-8859-2015", noExpiration: true },
      { standardId: "fia-8860-2010", noExpiration: true },
      { standardId: "fia-8860-2018", noExpiration: true },
      { standardId: "fia-8860-2018-abp", noExpiration: true },
      { standardId: "fia-8860-2024", noExpiration: true, note: "'8860-2010 or newer' per the rule text." },
      { standardId: "fia-8860-2024-abp", noExpiration: true },
    ],
    fullFaceRequirement: "conditional",
    fullFaceCondition:
      "Full face (with a shield) is required in any vehicle without a DOT-approved windshield or with less than a standard-size windshield (kit cars, sports racers, formula cars, Specials). A shield or goggles (not eyeglasses) are required in any other car without a full-size windshield too.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Rule text names only FIA 8859-2015 (not 2020/2024) but '8860-2010 or newer' for the 8860 family — transcribed literally even though it reads like an odd asymmetry.",
  },
  balaclava: {
    requirement: "conditional",
    condition: "Required for drivers with beards/mustaches.",
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote: "No certification number cited for the balaclava itself.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  hnr: {
    requirement: "recommended",
    acceptedStandards: [
      { standardId: "sfi-38.1", noExpiration: true },
      { standardId: "fia-8858-2002", noExpiration: true },
      { standardId: "fia-8858-2010", noExpiration: true },
    ],
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "medium",
    notes: "Rule text only says a head-and-neck support system is 'highly recommended' where belts/seat are compatible — not a hard requirement, and no exact spec number is named (mapped to the usual SFI 38.1/FIA 8858 family).",
  },
  firesuit: {
    requirement: "required",
    acceptedStandards: [
      { standardId: "fia-1986" },
      { standardId: "fia-8856-2000" },
      { standardId: "fia-8856-2018" },
      { standardId: "sfi-3.2a-5" },
      { standardId: "sfi-3.2a-10" },
      { standardId: "sfi-3.2a-15" },
      { standardId: "sfi-3.2a-20" },
      { standardId: "sfi-3.2a-1", note: "May only be worn with fire-resistant underwear — see undergarment." },
    ],
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  gloves: {
    requirement: "required",
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote: "'Gloves made of leather and/or accepted fire-resistant material containing no holes' — no certification number required.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  shoes: {
    requirement: "required",
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote: "'Shoes, with uppers of leather and/or nonflammable material that, at a minimum, cover the instep' — no certification number required.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  socks: {
    requirement: "required",
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote: "Socks of accepted fire-resistant material are required — no certification number cited.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  undergarment: {
    requirement: "conditional",
    condition: "Required only if the driving suit itself carries an SFI 3-2A/1 label; suits rated FIA 1986/8856-2000/8856-2018 or SFI 3-2A/5-or-higher don't require it separately.",
    undergarmentTriggerStandards: ["sfi-3.2a-1"],
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote: "No specific certification number cited for the underwear itself.",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
  },
  arm_restraint: {
    requirement: "conditional",
    condition: "HillClimb-specific rule: required in any open car; closed cars must have either a driver's-side window net OR arm restraints (not both).",
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_APPAREL_STANDARDS,
    materialNote: "No specific certification standard cited for the arm restraint itself.",
    satisfiedByAlternative: "window_net",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "This is the HillClimb variant of the rule — the Time Attack/TrackSprint (track-event) variant of SCCA TT only 'highly recommends' a net/restraints rather than requiring them; not used here since this base is intended for HillClimb-style clubs. Rule text (§3, Driver Accessory Gear, item 3): 'For a HillClimb event, arm restraints are required in any open car and a window net or arm restraints are required for closed cars.' Open cars must specifically use arm restraints — a window net alone doesn't satisfy the rule for an open car — so the satisfiedByAlternative relationship below is really only exercised on closed cars in practice.",
  },

  // Car safety gear — Safety Level 2, "2. Vehicle Equipment"
  seat: {
    requirement: "required",
    materialOnlyAccepted: true,
    acceptedStandards: GENERIC_SEAT_STANDARDS,
    materialNote:
      "Rule text (§2.2, Seats): 'Replacement Seats must a one-piece, bucket-type race seat, be securely mounted and provide fore/aft and lateral support. Replacement Seats must accommodate, with appropriate routing, 5 (or more) point safety belts including sub-strap. OE seats may not be modified to accommodate belts, aftermarket seats must be installed per manufacture guidelines.' No SFI (39.1/39.2) or FIA (8855/8862) seat certification label is named anywhere in the rulebook — SCCA's own construction/mounting spec is the requirement, not a third-party cert.",
    citation: { ...SCCA_TT_LEVEL2_SOURCE, section: "IV.2 Safety Level 2 — 2. Vehicle Equipment — 2. Seats" },
    confidence: "high",
    notes:
      "materialOnlyAccepted is true because the rule names no certification label at all — it's purely a one-piece, bucket-type construction and secure-mounting/belt-routing spec, not a third-party cert (a certified FIA/SFI seat obviously also satisfies it, even though none is required). This is NOT, however, a green light for an unmodified stock/OE seat: the qualifier 'Replacement Seats must [be] a one-piece, bucket-type race seat...' only binds seats that replace the OE unit, but Level 2 separately mandates a 5-, 6-, or 7-point harness including a sub-strap (§2.3.A), and this same rule states 'OE seats may not be modified to accommodate belts.' A factory seat generally lacks sub-strap routing from the factory and can't legally be modified to add it, so an OE seat is effectively excluded once the mandatory 5-point-minimum harness is fitted — in practice this means a purpose-built bucket seat, not the stock seat, for any car actually meeting Level 2. Also 'highly recommended that the passenger side has the same or better equipment as the driver's side' — advisory only, not modeled as a separate requirement. Sliders/rails vs. fixed mount aren't separately addressed beyond 'securely mounted' and 'installed per manufacture[r] guidelines.'",
  },
  belts_harness: {
    requirement: "required",
    acceptedStandards: [
      { standardId: "sfi-16.1", note: "Rule text cites 'SFI specification 16.1 or 16' — the bare '16' reference doesn't match any separately registered SFI harness spec (only 16.1/16.5/16.6 exist in our registry), so it's transcribed as an ambiguous addition rather than mapped to a distinct standard." },
      { standardId: "fia-8853-1985", note: "Rule text: 'FIA specification 8853/1985 including amendment 1/92.'" },
      { standardId: "fia-8853-98" },
      { standardId: "fia-8854-98" },
    ],
    citation: { ...SCCA_TT_LEVEL2_SOURCE, section: "IV.2 Safety Level 2 — 2. Vehicle Equipment — 3. Driver Restraints" },
    confidence: "high",
    notes:
      "Rule text (§2.3.A-B): 'All drivers shall utilize either a 5-, 6- or 7-point restraint harness... Shoulder straps shall be separate. Two inch shoulder straps shall only be used with head and neck devices... All harnesses shall bear labels bearing either of the following SFI or FIA certifications: (a) SFI specification 16.1 or 16; (b) FIA specification 8853/1985 including amendment 1/92 or FIA specifications 8853/98 and 8854/98.' The FIA 8853/98-and-8854/98 pairing is listed as two separate accepted entries here (consistent with how this app models other FIA belt-standard pairs), rather than as a single AND-combination the schema doesn't directly support. 'Harnesses shall be in good condition... It is highly recommended that harnesses are not utilized past their expiration date' — advisory only, no fixed expiresOn/validityYearsFromLabel is stated, so none is encoded.",
  },
  window_net: {
    requirement: "conditional",
    condition:
      "HillClimb-specific rule: a driver's-side window net satisfies the requirement on closed cars only, as an alternative to arm restraints (not both required). Open cars must use arm restraints instead — a window net alone doesn't apply to an open car.",
    materialOnlyAccepted: true,
    materialNote: "No specific certification standard (e.g. SFI 27.1 / FIA 8863) is cited for the window net itself — rule text just says 'a window net or arm restraints.'",
    satisfiedByAlternative: "arm_restraint",
    citation: { ...SCCA_TT_LEVEL2_SOURCE, section: "IV.2 Safety Level 2 — 3. Driver Safety Gear — 3. Driver Accessory Gear" },
    confidence: "high",
    notes:
      "Rule text (§3, Driver Accessory Gear, item 3): 'For a HillClimb event, arm restraints are required in any open car and a window net or arm restraints are required for closed cars.' The Time Attack/TrackSprint (track-event) variant only 'highly recommends' a net/restraints rather than requiring them on any car — not used here since this base is intended for HillClimb-style clubs.",
  },
  fuel_cell: {
    requirement: "not_addressed",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes:
      "Not addressed anywhere across Safety Levels 1-3. The only related text is in the Safety Level 3 roll cage rules, which permit optional tube elements to 'pass through any mandatory or optional bulkhead or panel separating the driver/passenger compartment from the trunk/cargo area/fuel tank/fuel cell area provided the bulkhead is sealed around such tube elements' — a roll-cage clearance note, not a fuel-cell equipment requirement.",
  },
  fire_extinguisher: {
    requirement: "required",
    condition:
      "The vehicle's mandated fire-suppression device may be a handheld extinguisher/fire bottle meeting one of the ratings below, OR an on-board fire suppression system / GCR-compliant on-board fire system instead — see the fire_suppression category.",
    fireExtinguisherOptions: [
      { quantity: 1, minWeightLbs: 2 },
      { quantity: 1, minBcRating: 10, minWeightLbs: 2 },
      { quantity: 1, minClassARating: 1, minBcRating: 10, minWeightLbs: 2 },
    ],
    fireExtinguisherMounting: { requireMetalBracket: true },
    satisfiedByAlternative: "fire_suppression",
    citation: { ...SCCA_TT_LEVEL2_SOURCE, section: "IV.2 Safety Level 2 — 2. Vehicle Equipment — 4. Fire Suppression" },
    confidence: "high",
    notes:
      "Rule text (§2.4): 'All vehicles shall have a device (such as a fire bottle/fire extinguisher/fire suppression system) securely mounted with metal mounting brackets of the quick-release type within reach of the driver to suppress fires. The device should meet at least one of the following minimum requirements: 1. On-board fire systems per SCCA Road Racing General Competition Rules (GCR). 2. Halon 1301 or 1211, 2 pound minimum capacity by weight. 3. Dry chemical, 2 pound minimum with a positive indicator showing charge. Chemical: 10 BC or 1A10BC Underwriters Laboratory rating.' Mapped: 'Halon... 2 pound minimum capacity by weight' -> weight-only; 'Dry chemical... 10 BC... rating' -> minBcRating:10 plus the same 2 lb minimum; 'Dry chemical... 1A10BC... rating' -> minClassARating:1, minBcRating:10, plus the same 2 lb minimum.",
  },
  fire_suppression: {
    requirement: "required",
    condition:
      "May be satisfied by a handheld fire extinguisher/fire bottle instead — see the fire_extinguisher category. This single rule ('a device such as a fire bottle/fire extinguisher/fire suppression system') covers both; only one is needed.",
    satisfiedByAlternative: "fire_extinguisher",
    acceptedStandards: [{ standardId: "sfi-17.1" }, { standardId: "sfi-17.2" }, { standardId: "fia-technical-list-16" }],
    citation: { ...SCCA_TT_LEVEL2_SOURCE, section: "IV.2 Safety Level 2 — 2. Vehicle Equipment — 4. Fire Suppression" },
    confidence: "medium",
    notes:
      "Rule text (§2.4): the device 'should meet at least one of the following minimum requirements: 1. On-board fire systems per SCCA Road Racing General Competition Rules (GCR). 2. Halon 1301 or 1211, 2 pound minimum capacity by weight. 3. Dry chemical, 2 pound minimum with a positive indicator showing charge...' Option 1 defers to the separate SCCA Road Racing GCR's own on-board fire system rule (GCR §9.3.22.A: SFI 17.1, SFI 17.2, or FIA Technical List n°16) rather than naming a standard directly — acceptedStandards here mirrors that GCR rule (see scca.ts's fire_suppression category) since this document doesn't restate it. Options 2/3 (Halon/dry chemical minimums) match the handheld fire_extinguisher category's fireExtinguisherOptions, not modeled twice.",
  },
  kill_switch: {
    requirement: "not_addressed",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Not mentioned anywhere across Safety Levels 1-3 of this document.",
  },
  tow_hook: {
    requirement: "not_addressed",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Not mentioned anywhere across Safety Levels 1-3 of this document.",
  },
  tow_rope: {
    requirement: "not_addressed",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Not mentioned anywhere across Safety Levels 1-3 of this document.",
  },
  emergency_triangle: {
    requirement: "not_addressed",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Not mentioned anywhere across Safety Levels 1-3 of this document.",
  },
  first_aid_kit: {
    requirement: "not_addressed",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Not mentioned anywhere across Safety Levels 1-3 of this document.",
  },
  window_breaker: {
    requirement: "not_addressed",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Not mentioned anywhere across Safety Levels 1-3 of this document.",
  },
  hood_pins: {
    requirement: "not_addressed",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Not mentioned anywhere across Safety Levels 1-3 of this document — confirmed via a direct read of the full rules page, including the Safety Level 1/2 vehicle-equipment and body-panel clauses.",
  },
  spill_kit: {
    requirement: "not_addressed",
    citation: SCCA_TT_LEVEL2_SOURCE,
    confidence: "high",
    notes: "Not mentioned anywhere across Safety Levels 1-3 of this document.",
  },
  rollover_protection: {
    requirement: "required",
    rolloverProtectionRequiresFullCage: false,
    rolloverProtectionTubingSpec: [
      { underWeightLbs: 1500, minSizes: [{ outerDiameterIn: 1.25, wallThicknessIn: 0.09 }] },
      { underWeightLbs: 1701, minSizes: [{ outerDiameterIn: 1.375, wallThicknessIn: 0.08 }] },
      { underWeightLbs: 2700, minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.095 }, { outerDiameterIn: 1.625, wallThicknessIn: 0.08 }] },
      { minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.12 }, { outerDiameterIn: 1.75, wallThicknessIn: 0.095 }, { outerDiameterIn: 2.0, wallThicknessIn: 0.08 }], materialNote: "For 2700 lbs and up." },
    ],
    rolloverProtectionRequiresPadding: true,
    citation: { ...SCCA_TT_LEVEL2_SOURCE, section: "IV.2 Safety Level 2 — 2. Vehicle Equipment — 1. Roll Bars" },
    confidence: "high",
    notes:
      "'Safety Level 2 generally means an appropriate racing-specific seat, 4-point roll bar, 5-point racing harness, arm restraints or window net, and fire-retardant helmets and clothing' — a roll bar is required for every Safety Level 2 vehicle, not just convertibles/open cars. The tubing spec 'applies to all vehicles (other than those issued an SCCA Logbook before 1/1/19)' — seamless or DOM mild steel (SAE 1010/1020/1025) or alloy steel (SAE 4130); pre-2016-logbook vehicles may retain existing ERW tubing. One continuous length of tubing for the hoop, smooth bends, vertical members more than 15\" apart (interior), extending to (ideally) the full cockpit width, top clearing the driver's helmet when seated normally. Padding: non-resilient material (e.g. Ethafoam/Ensolite), minimum 1/2\" thick, wherever the driver's or passenger's helmet could contact the main hoop/braces — SFI 45.1 or FIA 8857-2001-rated padding is strongly recommended but not required; the plain 1/2\"-minimum-thickness option alone satisfies the rule. Mounted to the frame with SAE Grade 5-or-better bolts, 5/16\" minimum diameter. Safety Level 3 upgrades this to a full roll CAGE (main hoop, front hoop, side protection across door openings, main-hoop diagonal bracing, shoulder- and dash-level horizontal braces, ≥30° rearward braces, minimum 6 attachment points on production chassis) — a strict superset of the Level 2 spec, using its own weight-tiered tubing table (as light as 1.00\"x0.060\" under 1000 lbs, up to the same 2.00\"x0.080\" top tier), seamless/DOM mild steel (SAE 1020/1025) or alloy steel (SAE 4130/T45) or Docol R8 (ERW prohibited), full-penetration welds, and 0.080\"-minimum-thick mounting plates. Level 3 padding is a minimum 1\" of material, with SFI 45.1/FIA 8857-2001 (curved) or SFI 45.2/FIA sports car head rest material (flat) again recommended, not required. A client using this shared base whose own classes require Level 3 for specific classes should override this category with the full-cage spec for those classes.",
  },
};

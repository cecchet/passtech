import { Ruleset } from "../types";
import { GENERIC_SEAT_STANDARDS } from "../standards";

const faq = {
  title: "Hooked On Driving HPDE FAQ",
  url: "https://www.hookedondriving.com/faq/",
};

const policies = {
  title: "Hooked On Driving Important Policies & Forms",
  url: "https://www.hookedondriving.com/important-policies-forms/",
};

const techSheet = {
  title: "Hooked On Driving Self-Tech / Car Inspection Checklist",
  url: "https://www.hookedondriving.com/wp-content/uploads/2024/05/Techical_Inspection.pdf",
};

// HOD's run groups (Novice/Intermediate/Advanced, naming varies A/B/C/D by region) differ in
// coaching structure and passing rules but not in required safety equipment — confirmed via HOD's
// own run-groups page, which describes group-by-group driving privileges with no equipment
// distinctions. A separate "Time Trials" add-on program exists (Rulebook v26.1) but explicitly
// defers to "HOD's existing HPDE rules" for helmets/harnesses/roll cages rather than adding its
// own equipment requirements, so it isn't modeled as a separate ruleset here.
const hpde: Ruleset = {
  id: "hod-hpde",
  bodyId: "hookedondriving",
  bodyName: "Hooked on Driving (HOD)",
  disciplineName: "HPDE Track Day",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-15",
  sourceDocuments: [faq, policies, techSheet],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "snell-sa2025",
          expiresOn: "2035-12-31",
          note: "HOD's FAQ says 'within 10 years of the event date,' but Snell certification tags don't print a date (unlike SFI/FIA), so this is computed as 10 years from the SA2025 standard's own release year rather than a per-item label date.",
        },
        { standardId: "snell-sa2020", expiresOn: "2030-12-31", note: "Same 10-years-from-generation-year computation as SA2025 above." },
        { standardId: "snell-sa2015", expiresOn: "2025-12-31", note: "Same 10-years-from-generation-year computation as SA2025 above." },
        { standardId: "snell-sa2010", expiresOn: "2020-12-31", note: "Same 10-years-from-generation-year computation as SA2025 above — already outside its 10-year window by today's date." },
        { standardId: "snell-sah2010", expiresOn: "2020-12-31", note: "Same 10-years-from-generation-year computation as SA2025 above — already outside its 10-year window by today's date." },
      ],
      citation: { ...faq, section: "FAQ: 'Can I wear my motorcycle helmet?'" },
      confidence: "high",
      notes:
        "'HOD requires auto racing helmets with a Snell Foundation SA rating that is within 10 years of the event date... A DOT rating does not qualify.' Any SA generation qualifies as long as it's within the 10-year window from its manufacture date — HOD does not restrict to only the most recent generations the way SCDA/PCA do. M-rated Snell helmets are explicitly treated by HOD's FAQ as motorcycle helmets and are NOT accepted ('If it says M, it is a motorcycle helmet') — unlike most other bodies in this app, which treat Snell M as a distinct valid auto-racing spec. No SFI, FIA, ECE, or BS alternative is mentioned anywhere in HOD's public materials, so none are listed as accepted here. No full-face requirement is stated; for open cars (e.g. Boxster) HOD requires 'some form of eye protection' and says 'an enclosed helmet with a visor is highly recommended' but does not mandate full-face — goggles or another form of eye protection would satisfy the letter of this rule.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from HOD's public materials, just not yet re-checked.",
    },
    hnr: {
      requirement: "conditional",
      condition:
        "Mandatory only when the car is fitted with a 5- or 6-point competition harness (per HOD's equal-restraint policy, this then applies to both driver and passenger seats if either has one). Not required with a stock/factory 3-point seatbelt. HOD names specific accepted devices/brands: NecksGen, HANS, Schroth SHR Flex, Stand 21 (Ultimate, Hitech, and Club Series), Z Neck Tech (Zamp), and Simpson Hybrid S.",
      acceptedStandards: [
        { standardId: "sfi-38.1" },
        { standardId: "fia-8858-2002" },
        { standardId: "fia-8858-2010" },
      ],
      citation: { ...policies, section: "Head & Neck Restraint (HNR) policy" },
      confidence: "medium",
      notes:
        "HOD's policy page lists specific accepted device models/brands rather than a certification spec number; mapped here to the SFI 38.1 / FIA 8858 standards those named devices are certified under. Worth spot-checking whether HOD would also accept other SFI 38.1/FIA 8858-certified devices not on their named list.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes:
        "Not mentioned anywhere in HOD's FAQ, policies page, or Time Trials rulebook (which explicitly defers to 'HOD's existing HPDE rules' for helmets/harnesses/roll cages without adding a suit requirement). Consistent with HOD's HPDE program being novice-friendly and lightly equipped by design.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes: "Not mentioned anywhere in HOD's public FAQ, policies page, or Time Trials rulebook.",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "medium",
      notes:
        "HOD's own FAQ and policies pages (searched directly for footwear/shoe mentions) do not state a footwear requirement. Some third-party aggregator summaries mention 'closed-toe shoes' as a general expectation for HOD events, but this was not found verbatim in HOD's official materials during this research pass — closed-toe/athletic shoes are standard track-day practice regardless, but it isn't confirmed here as an HOD-stated rule. Worth a direct spot-check with HOD or a regional waiver/registration form if precision matters.",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "medium",
      notes: "Not mentioned anywhere in HOD's public FAQ, policies page, or self-tech checklist — consistent with the absent shoe requirement.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes: "Not mentioned anywhere in HOD's public materials.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes:
        "Not mentioned. HOD's convertible/high-center-of-gravity (HCG) vehicle policy addresses rollover protection for the car itself, not a driver arm-restraint requirement.",
    },

    // --- Car safety gear ---------------------------------------------------------------------
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "HOD's Self-Tech Sheet lists 'Functional headrest' under its Safety Equipment checklist — the only seat-related item found anywhere in HOD's public materials (FAQ, policies page, and tech sheet). No bucket-type construction, no seat certification (e.g. SFI 39.1/39.2, FIA 8855/8862), and no sliders/rails-vs-fixed-mount rule is stated — a stock/OEM factory seat with a working headrest satisfies this.",
      citation: { ...techSheet, section: "Safety Equipment checklist" },
      confidence: "high",
      notes:
        "Consistent with HOD being a member's-own-car HPDE program built around street cars — most participants run their factory seat. A certified racing seat obviously also satisfies this even though HOD doesn't itself name a minimum spec, so GENERIC_SEAT_STANDARDS is offered on that basis (mirrors the pha.ts seat treatment). Re-confirmed via direct fetch of the tech sheet PDF, FAQ, and policies page during this research pass (2026-08-19) — none mention seat construction or certification. HOD's Time Trials add-on program explicitly defers to 'HOD's existing HPDE rules' for equipment rather than adding its own seat spec, so this rule is treated as covering that program too. Worth a spot-check with HOD directly for caged/harnessed cars, which this rulebook doesn't separately address.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "HOD's Self-Tech Sheet requires 'Seat belts in good condition' under its Safety Equipment checklist — no certification standard or expiration is specified for the belt/harness itself, so factory/stock belts satisfy this.",
      citation: { ...techSheet, section: "Safety Equipment checklist" },
      confidence: "high",
      notes:
        "Consistent with the FAQ's pre-event check that 'belts and safety equipment are all the factory equipment in good shape.' Aftermarket 5- or 6-point harnesses are also clearly contemplated (they're what triggers the mandatory HNR requirement above, per the policies page), but no minimum harness certification spec (e.g. SFI 16.1 or FIA 8853) is stated anywhere in HOD's public materials — only the belt's general condition is checked.",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...techSheet, section: "Safety Equipment checklist" },
      confidence: "high",
      notes:
        "Not mentioned anywhere in the Self-Tech Sheet's Safety Equipment checklist (which itemizes 'Seat belts in good condition,' the highlighted 5-/6-point-harness HNR trigger, and 'Open cars with roll bar or other rollover protection' but no net line item), the FAQ, or the policies page (full document search of all three). Unlike PHA, HOD's materials never frame a window net as an alternative to an arm restraint — arm_restraint is itself not_addressed here, so there's no interchangeable pairing to wire up (satisfiedByAlternative intentionally omitted on both). Consistent with window_breaker also being not_addressed for this body.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...techSheet, section: "Safety Equipment checklist" },
      confidence: "high",
      notes: "Not mentioned anywhere in the Self-Tech Sheet, FAQ, or policies page — no extinguisher presence, size, or rating requirement is stated for HOD's HPDE program.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes: "Not mentioned anywhere in HOD's public materials — expected for a run-what-you-brung HPDE program; only Group D's race-prepared cars are noted (FAQ) as sometimes carrying 'fire bottles,' but that's driver-owned race-car equipment, not an HOD-stated requirement.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      materialOnlyAccepted: true,
      materialNote: "No fuel cell certification is required — the Self-Tech Sheet's only fuel-system item is 'Gas cap secured,' a general check on the stock/OEM filler cap rather than a fuel cell/tank requirement.",
      citation: { ...techSheet, section: "Miscellaneous checklist" },
      confidence: "high",
      notes: "Consistent with HOD being a street-car-friendly HPDE program with no stated fuel cell mandate anywhere in its public materials.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...techSheet, section: "Safety Equipment checklist" },
      confidence: "high",
      notes: "No window net or seatbelt cutter tool is mentioned anywhere in the Self-Tech Sheet, FAQ, or policies page.",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { ...techSheet, section: "Miscellaneous checklist" },
      confidence: "high",
      notes:
        "No master battery cutoff/kill switch is mentioned. The Self-Tech Sheet's 'Battery secured properly' and 'Positive battery terminal covered' items are general battery-safety checks, distinct from a kill switch requirement.",
    },
    tow_hook: {
      requirement: "conditional",
      condition:
        "The Self-Tech Sheet's Miscellaneous checklist reads 'Tow hook installed (if any)' — a tow hook/tow point isn't itself mandated as standard equipment, but if the car has one it must be properly installed.",
      citation: { ...techSheet, section: "Miscellaneous checklist" },
      confidence: "high",
      notes: "No color-marking or visibility rule is stated, unlike some wheel-to-wheel bodies.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...techSheet, section: "Miscellaneous checklist" },
      confidence: "high",
      notes: "Not mentioned anywhere in the Self-Tech Sheet, FAQ, or policies page.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes: "Not mentioned anywhere in HOD's public materials.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...faq },
      confidence: "high",
      notes: "Not mentioned anywhere in HOD's public materials.",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...techSheet, section: "Safety Equipment / Miscellaneous checklist" },
      confidence: "high",
      notes: "No hood pin, hood fastener, or positive hood-latching requirement found in the Self-Tech Sheet's checklist (full-text search), the FAQ, or the policies page.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...techSheet, section: "Safety Equipment / Miscellaneous checklist" },
      confidence: "high",
      notes: "No spill kit, spill containment, or absorbent-material requirement found in the Self-Tech Sheet's checklist, the FAQ, or the policies page. The checklist's 'Catch container on radiator overflow' item covers coolant catch-tanks specifically, not a general onboard spill kit.",
    },
    rollover_protection: {
      requirement: "conditional",
      rolloverProtectionByBodyStyle: { closed_roof: "not_addressed", convertible: "required", open_no_windshield: "required", open_wheel: "required" },
      rolloverProtectionFactoryExempt: true,
      rolloverProtectionTubingSpec: [
        { underWeightLbs: 1000, minSizes: [{ outerDiameterIn: 1.0, wallThicknessIn: 0.06 }] },
        { underWeightLbs: 1501, minSizes: [{ outerDiameterIn: 1.25, wallThicknessIn: 0.09 }, { outerDiameterIn: 1.375, wallThicknessIn: 0.08 }] },
        { underWeightLbs: 2501, minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.095 }, { outerDiameterIn: 1.625, wallThicknessIn: 0.08 }] },
        {
          minSizes: [
            { outerDiameterIn: 1.5, wallThicknessIn: 0.12 },
            { outerDiameterIn: 1.75, wallThicknessIn: 0.095 },
            { outerDiameterIn: 2.0, wallThicknessIn: 0.08 },
          ],
          materialNote: "For over 2500 lbs.",
        },
      ],
      condition:
        "Self-Tech Sheet: 'Convertibles on track: Hooked On Driving allows convertibles on track assuming the manufacturer states they have rollover protection, or if they have aftermarket rollover protection meeting or exceeding the most current SCCA Solo1 standards.' The checklist itself lists 'Open cars with roll bar or other rollover protection' as an item to verify. Not addressed for fixed-roof/closed cars, which have no rollover-protection line item on the checklist.",
      citation: { ...techSheet, section: "Convertibles on track; Safety Equipment checklist" },
      confidence: "medium",
      notes:
        "'Hooked On Driving makes no judgment as to the safety of allowed convertibles compared to hardtop cars.' No specific tubing/material spec is given directly by HOD itself — instead the aftermarket path is required to meet or exceed 'the most current SCCA Solo1 standards.' 'Solo1' is an older/informal SCCA autocross-program name; SCCA's current National Solo Rules Appendix C (its own roll bar standard, since read in full for this app's SCCA Solo ruleset) is the closest current equivalent and is what the tubing spec above reflects — confidence is medium rather than high because HOD's own text uses the retired 'Solo1' name rather than citing Appendix C directly, so this mapping is inferred, not verbatim-confirmed. Appendix C has no padding requirement.",
    },
  },
};

export const hookedOnDrivingRulesets: Ruleset[] = [hpde];

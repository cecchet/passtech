import { CategoryRule, Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

const gravelTrials: Ruleset = {
  id: "sccnh-gravel-trials",
  bodyId: "sccnh",
  bodyName: "SCCNH",
  disciplineName: "Gravel Trials",
  disciplineGroup: "Rally",
  supportsCodriver: true,
  lastReviewed: "2026-08-15",
  sourceDocuments: [
    {
      title: "2026 SCCNH Gravel Trials Rules",
      version: "Rev 1, 12/2025",
      url: "https://drive.google.com/file/d/1_amv00NYUuAPriUGi6P5owtz8c5BZzrg/view?usp=sharing",
      section: "12. Required Personal Safety Equipment",
    },
  ],
  techSheet: { url: "/tech-sheets/sccnh-gravel-trials-tech-form.png", format: "PNG" },
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "Rule 13.1.1: SA2015 expires at the end of the 2026 season." },
        { standardId: "snell-ea2016", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "fia-8860-2010", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2024", validityYearsFromLabel: 10 },
      ],
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "12.1" },
      confidence: "high",
      notes:
        "Required for both driver and co-driver. New this year (2026 rulebook): Snell SA2025 and FIA 8859-2024 added to the accepted list, and FIA-homologated helmets now carry an explicit 10-years-from-manufacture-date validity window (§13.1.2) — previously undated in the app. Rule 13.1.3: for helmets with dual FIA/Snell certification, the later expiration date takes precedence — enter whichever certification is more favorable if the helmet has both.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the 2026 rulebook, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Conformance label must be less than 5 years old." },
      ],
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "12.2" },
      confidence: "high",
      notes: "Required for all competitors (driver and co-driver), no lower-tier exception.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.4-5", note: "Rulebook writes this as 'SFI 3-4A/5.'" },
        { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with fire-resistant underwear." },
      ],
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "12.3" },
      confidence: "high",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "Confirmed real gap in the 2026 rulebook too: gloves still do not appear anywhere in the document. Consider defaulting to a conservative SFI/FIA-rated expectation or contacting the club directly.",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "Confirmed real gap in the 2026 rulebook too: no shoe requirement in this document, unlike NEHA which has one.",
    },
    socks: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "Confirmed real gap: no sock requirement in this document, unlike SCCNH's own Climb to the Clouds rules which do have one.",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Required only if using an SFI 3.2A/1 driving suit (no specific standard number given for the underwear itself in this document).",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Document just says 'approved fire resistant underwear' when required — no standard number attached.",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "12.3.6" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "Re-checked the complete 2026 document (all numbered sections 1-35 plus Appendix A) — 'arm restraint' and 'window net' still do not appear anywhere. Plausible for closed rally cars, but the rulebook is silent rather than explicitly exempting them.",
    },
    seat: {
      requirement: "required",
      acceptedStandards: [{ standardId: "fia-8855-1999" }, { standardId: "fia-8862-2009" }],
      materialOnlyAccepted: false,
      materialNote:
        "Rule 9.3: 'Driver and co-driver seats shall be firmly mounted to the structure of the vehicle and be installed per the manufacturer's recommendations. The use of hinged-back and OEM seats is prohibited.' A stock/OEM seat is explicitly not an accepted path — every seat must be homologated to FIA 8855-1999 or 8862-2009, or otherwise be 'specifically designed for motor racing' (e.g. an SFI-certified seat) subject to Chief Scrutineer approval.",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "9.3" },
      confidence: "high",
      notes:
        "Rule 9.3: driver and co-driver seats must be firmly mounted to the vehicle structure per the manufacturer's recommendations; hinged-back and OEM seats are explicitly prohibited. Seats not homologated to FIA 8855-1999 or 8862-2009 may still be accepted if 'specifically designed for motor racing' (e.g. an SFI-certified seat), subject to Chief Scrutineer approval on a case-by-case basis rather than a pre-approved standard number. Sliders/rails aren't separately addressed beyond the firm-mounting requirement.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "fia-8853-98", validityYearsFromLabel: 5 },
        { standardId: "fia-8853-2016", validityYearsFromLabel: 5 },
        { standardId: "sfi-16.1", validityYearsFromLabel: 5 },
        { standardId: "sfi-16.5", validityYearsFromLabel: 5 },
      ],
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "9.4" },
      confidence: "high",
      notes:
        "Rule 9.4: 5-, 6-, or 7-point harness required for driver and co-driver, single-latch release, labeled to one of the four listed standards. Not usable past the printed expiration date, and not older than 5 years from date of manufacture even if otherwise unexpired. No stock/OEM belt allowance stated.",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes:
        "Re-checked the complete 2026 document (all numbered sections 1-35 plus Appendix A) — 'window net' still does not appear anywhere, matching the arm_restraint category's finding. Independently verified for this ruleset (not assumed from Climb to the Clouds' window-net-or-arm-restraint rule) — no either/or relationship exists here since neither item is addressed at all.",
    },
    hood_pins: {
      requirement: "required",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "9.9" },
      confidence: "high",
      notes:
        "Rule 9.9 ('Hood pins'): 'Hoods shall be fixed closed with hood pins accessible from the outside. Other fastening devices (inside or outside) shall be rendered inoperative, except for the secondary catch, which may be retained.'",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "Full document reviewed (sections 1-35 plus Appendix A) — no spill kit / absorbent material requirement found anywhere in the document.",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresWelded: true,
      rolloverProtectionTubingSpec: [{ minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.095 }] }],
      rolloverProtectionRequiresPadding: true,
      rolloverProtectionPaddingCertRequired: true,
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "9.1" },
      confidence: "high",
      notes:
        "Rule 9.1: 'All cages, regardless of log book must have' a six-point mounting design; A-pillar support bars; two door bars per side minimum; diagonals to each corner of the top of the main hoop (single or double, either in the plane of the main hoop or as rear stays); minimum tubing size 1.5\"x0.095\". Required outright for every car — this event log-books through Rally America/SCCA Pro Rally/CARS/ARA/FIA/NASA Rallysport (§8), and §9.1 applies the cage spec 'regardless of log book.' Padding is separately required (§9.2) on any bar that could contact the driver/co-driver's helmet — SFI 45.1 or FIA 8857-2001 Type A energy-absorbing material.",
    },
    fire_extinguisher: {
      requirement: "required",
      fireExtinguisherOptions: [
        { quantity: 1, minBcRating: 10 },
        { quantity: 2, minBcRating: 5 },
      ],
      materialNote:
        "Rule 9.8: installed inside the passenger compartment, at least one within easy reach of the driver or co-driver when seated. Secured with a metal strap and metal mounting bracket, with a fill gauge visible for scrutineering.",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "9.8" },
      confidence: "high",
      notes: "Rule 20.2.1 separately requires a team member to stand by with a fire extinguisher while fueling — a procedural requirement, not modeled as an additional unit here.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "Full document reviewed (sections 1-35 plus Appendix A) — no onboard fire suppression system requirement, only the handheld extinguisher(s) required by Rule 9.8.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "No fuel cell/fuel tank construction or certification requirement anywhere in the document — Section 20 covers fueling procedure (fire extinguisher standby, no-smoking radius) only, not tank spec.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "No seatbelt cutter or window-breaking tool requirement found anywhere in the document.",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "No battery cutoff/kill switch requirement found anywhere in the document.",
    },
    tow_hook: {
      requirement: "required",
      towHookSidesRequired: "both",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "9.7" },
      confidence: "high",
      notes: "Rule 9.7: front and rear tow points required. No marking/color spec given.",
    },
    tow_rope: {
      requirement: "required",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "9.6" },
      confidence: "high",
      notes: "Rule 9.6: an 'appropriate tow strap' must be carried in the vehicle. No specific rating/spec given.",
    },
    emergency_triangle: {
      requirement: "required",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025", section: "9.5" },
      confidence: "high",
      notes:
        "Rule 9.5: 3 triangles carried per vehicle, one within easy reach of the driver/co-driver when seated. Appendix A describes on-stage placement procedure: one at the stopped vehicle, one ~150 ft back and one ~300 ft back toward the start of the stage.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { title: "2026 SCCNH Gravel Trials Rules", version: "Rev 1, 12/2025" },
      confidence: "high",
      notes: "No vehicle-carried first aid kit requirement — Section 21 requires an event Ambulance on site at the stage start, not a kit in each competition car.",
    },
  },
};

// Climb to the Clouds' own class table (cover page + §3-13) lists eleven competition classes.
// Reading the full document (General Vehicle Rules §1, Safety Rules §2, and each class's own
// section §3-13) against this app's tracked equipment categories, almost everything driver/car
// safety-related — helmet, balaclava, HNR, firesuit, gloves, shoes, undergarment, arm_restraint/
// window_net, seat, belts_harness, fuel_cell, window_breaker — is written under §1 "General
// Vehicle Rules (These rules apply to all vehicles)" or §2 "Safety Rules (All competitors must
// comply)," with no class-specific carve-out anywhere in the eleven class sections. Roll cage
// construction (cage A vs. cage B) varies by class — see the rollover_protection category's
// `condition` field below for which classes use which cage type; the tubing spec itself is
// weight-tiered rather than class-tiered so it's modeled once at the base level. The two other
// categories that genuinely do diverge by class, each with its own explicit
// rule text: kill_switch (§1.9.1 names only Unlimited and Open; §10.2 separately mandates a master
// disconnect switch for Modified Electric; no other class is addressed) and fire_suppression
// (§9.1 makes an onboard system mandatory for Rally specifically, where it's merely an optional
// addition to the portable extinguisher for every other class per §1.3.1).
const killSwitchNotAddressed: CategoryRule = {
  requirement: "not_addressed",
  citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.9" },
  confidence: "high",
  notes:
    "Rule 1.9.1 requires a battery shut-off switch only for the Unlimited and Open classes, and Rule 10.2 separately requires a master disconnect switch only for Modified Electric — neither clause reaches this class, and no other rule in the document addresses a kill switch/battery cutoff.",
};

const fireSuppressionOptionalAddition: CategoryRule = {
  requirement: "conditional",
  condition:
    "Rule 1.3.1 allows a fire system to be installed in addition to the mandatory portable extinguisher(s), but doesn't require one for this class — only the Rally class (Rule 9.1) makes an onboard fire suppression system itself mandatory.",
  citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.3.1" },
  confidence: "high",
};

const climbToTheClouds: Ruleset = {
  id: "sccnh-climb-to-the-clouds",
  bodyId: "sccnh",
  bodyName: "SCCNH",
  disciplineName: "Climb to the Clouds (Mount Washington Hillclimb)",
  disciplineGroup: "Hillclimb",
  lastReviewed: "2026-08-16",
  sourceDocuments: [
    {
      title: "2026 Climb to the Clouds Competition Classes & Safety Rules",
      version: "Last updated 7/12/2026",
      url: "https://sccnh.org/wp-content/uploads/2026/07/2026-Climb-to-the-Clouds-Competition-Classes-Safety-Rules.pdf",
      section: "2. Driver Safety Equipment",
    },
  ],
  classes: [
    { id: "unlimited", label: "Unlimited (U)" },
    { id: "unlimited-sport", label: "Unlimited Sport (US)" },
    { id: "open", label: "Open (O)" },
    { id: "open-lite", label: "Open Lite (OL)" },
    { id: "prepared", label: "Prepared (P1/P2/P3)" },
    { id: "hpss", label: "High Performance Showroom Stock (HPSS)" },
    { id: "rally", label: "Rally (R1/R2)" },
    { id: "modified-electric", label: "Modified Electric (ME)" },
    { id: "stock-electric", label: "Stock Electric (SE)" },
    { id: "vintage-exhibition", label: "Vintage Exhibition (VE)" },
    { id: "vintage-driver", label: "Vintage Driver (VD)" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "fia-8860-2000", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2004", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2010", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2024", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2020", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2024", validityYearsFromLabel: 10 },
      ],
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "2.3.1" },
      confidence: "high",
      notes: "Rule 2.3.1: Snell SA2015 or newer, or FIA 8860-20XX/8859-20XX with a manufacture date less than 10 years old.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required for competitors with facial hair (SFI or FIA rated balaclava).",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "2.3.2" },
      confidence: "high",
      notes: "Rule 2.3.8 separately requires a fire-retardant hood/helmet skirt for open-engine vehicles — a related but distinct item, not modeled here.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
        { standardId: "sfi-38.1", validityYearsFromLabel: 5 },
      ],
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "2.3.3" },
      confidence: "high",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.4-5", note: "Rule 2.3.3.4: 'SFI 3.2A/5 or 3.4/5.'" },
        { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with fire-resistant underwear — see undergarment." },
      ],
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "2.3.3" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Required only if using an SFI 3.2A/1 driving suit.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: false,
      acceptedStandards: [{ standardId: "fia-8856-2000" }, ...GENERIC_APPAREL_STANDARDS.filter((s) => s.standardId !== "fia-8856-2000")],
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "2.3.3.4" },
      confidence: "high",
      notes: "Unlike most bodies, this rulebook names specific standards (FIA 8856-2000 or SFI 3.3) rather than allowing plain fire-resistant material.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "2.3.5" },
      confidence: "high",
      notes: "Rule 2.3.5: 'SFI or FIA rated gloves... in good condition' — no plain-material allowance.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Leather or nonflammable material, must cover the instep — no certification cited.",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "2.3.7" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Rule 2.3.6: 'Socks made of fire resistant material (e.g., cotton, Nomex). No thermoplastic (meltable) synthetic materials (e.g., nylon, polyester, polypropylene).' No certification cited.",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "2.3.6" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition: "Either an SFI/FIA window net with a labeled expiration date, or SFI/FIA arm restraints, are required for each occupant.",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      satisfiedByAlternative: "window_net",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.4.1" },
      confidence: "high",
      notes:
        "General Vehicle Rules 1.4.1 frames this as a window-net-or-arm-restraints choice per occupant, not scoped to open cars specifically. Verified directly against the rulebook text: 'SFI or FIA window net, must have a label with the expiration date or SFI or FIA arm restraints are required for each occupant.' window_net is now modeled as the bidirectional alternative.",
    },
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "Rule 1.11.2: 'All seats used with 5+ point harness must be fixed-back (as mounted), fully supportive type, (i.e., \"racing seat\") with back extending to shoulder harness points' of intersection with seatback, as worn.' Since a 5+ point harness is always required (§2.5.1), this construction rule applies to every car — but no SFI/FIA certification label is actually mandated on the seat itself. Rule 1.11.4 names FIA 8855-2010 only as one of three acceptable MOUNTING structures (alongside OE reinforced mountings or the integrated chassis/roll cage), not as a required tag on the seat. materialOnlyAccepted is true because no certification is required, but this isn't a green light for an unaltered stock/OEM seat — most factory seats have a reclining/hinged back and won't meet the fixed-back 'racing seat' bar (§1.11.1: 'Any altered seat may be considered unsafe and fail technical inspection').",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.11" },
      confidence: "high",
      notes:
        "Rule 1.11.2 also requires the seat be sized to the driver, and headrest within 3\" of the driver's helmet as seated. Rule 1.11.4: seat must mount to substantial structure — OE reinforced mountings, FIA 8855-2010, or the integrated chassis/roll cage — with no play in the seat regardless of mounting type; sliders/rails aren't separately addressed. GENERIC_SEAT_STANDARDS is offered on the same basis as PHA's seat rule: a certified FIA/SFI seat obviously satisfies this even though the rulebook doesn't itself name a minimum cert spec for the seat construction.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-16.1", validityYearsFromLabel: 2 },
        { standardId: "sfi-16.5", validityYearsFromLabel: 2 },
        { standardId: "fia-8853-2016", validityYearsFromLabel: 2 },
        { standardId: "fia-8853-98", validityYearsFromLabel: 2 },
      ],
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "2.5" },
      confidence: "high",
      notes:
        "Rule 2.5.1: SFI (16.1 or 16.5) or FIA (8853/2016 or 8853/98) 5-, 6-, or 7-point harness mandatory; Y/V-type shoulder harness not permitted (2.5.2); belts may not be mixed and matched (2.5.5). Rule 2.5.6: not usable beyond the tagged expiration date or more than 2 years from date of manufacture — an untagged belt is considered out of date. Rule 2.5.8: anchor points must handle 3300 lbf (15,000 N) in line with harness load (half that for sub-belts); OE anchor points are considered adequate.",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "Rule 1.4.1 frames this as a window-net-or-arm-restraints choice for each occupant — an SFI or FIA window net with a labeled expiration date, OR SFI/FIA arm restraints, not both required.",
      acceptedStandards: [{ standardId: "sfi-27.1" }, { standardId: "fia-8863-2015" }],
      materialOnlyAccepted: false,
      satisfiedByAlternative: "arm_restraint",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.4.1" },
      confidence: "high",
      notes:
        "Rule 1.4.1: 'SFI or FIA window net, must have a label with the expiration date or SFI or FIA arm restraints are required for each occupant.' The rulebook doesn't cite a specific spec number, so both registered window-net standards (SFI 27.1, FIA 8863-2015) are offered — the net's own printed label date governs its expiration, no computed validity-years-from-label offset is stated. Framed under General Vehicle Rules (applies to all vehicles per §1's heading), not scoped to open cars only.",
    },
    fire_extinguisher: {
      requirement: "required",
      fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 5 }],
      materialNote:
        "Rule 1.3.1: 5 lbs total of portable fire suppression required, which may be split across one or two units mounted with steel bracket(s) — the rulebook states the 5 lb total but doesn't give a minimum weight per unit for the two-unit configuration. Rule 1.3.2: inspection tag or manufacture date must be within the last 3 years. Rules 1.3.3-1.3.4: metal straps/brackets only, mounted within the driver's reach, not in the footwell.",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.3" },
      confidence: "high",
      notes: "Rule 1.3.1 also allows an onboard fire system in addition to (not instead of) the portable extinguisher(s). Rally (R) class has an additional requirement — see fire_suppression.",
    },
    fire_suppression: {
      requirement: "conditional",
      condition:
        "Required for Rally (R) class only (Rule 9.1). Optional for other classes as an addition to, not a substitute for, the required portable extinguisher(s) (Rule 1.3.1).",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "9.1" },
      confidence: "high",
      notes:
        "Rule 9.1 also references 'fire extinguishers in accordance with rule 12.2' for the Rally class, but this document has no section 12.2 (it ends at section 13.8) — likely a leftover reference from another rulebook; treated as a drafting inconsistency rather than an actual cross-reference. No specific fire-suppression-system certification standard (e.g. SFI 17.1/FIA 8865-2015) is named anywhere in the document.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition:
        "Only triggered when a non-stock fuel tank is mounted inside the passenger compartment (Rule 1.6.1) — a stock/OEM tank, or a non-stock tank mounted outside the passenger compartment, isn't addressed as needing certification.",
      materialOnlyAccepted: true,
      acceptedStandards: [
        {
          standardId: "sfi-28.1",
          note: "Document just says 'FIA or SFI approved fuel cell' without naming a specific spec — all registered FIA/SFI fuel cell standards are offered here.",
        },
        { standardId: "sfi-28.3" },
        { standardId: "fia-ft3-1999" },
        { standardId: "fia-ft3.5-1999" },
        { standardId: "fia-ft5-1999" },
      ],
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.6.1" },
      confidence: "high",
      notes:
        "Related fuel rules not modeled here: fuel system components sharing the occupant enclosure (not bulkheaded) must be metal (1.6.2); fuel pumps must auto-shutoff on stall (1.6.3); nitrous oxide is banned (1.6.4); methanol, even mixed with water, is treated as fuel (1.6.5).",
    },
    kill_switch: {
      requirement: "conditional",
      condition:
        "Required for Unlimited (U) and Open (O) classes: a battery shut-off switch accessible to the seated driver and to outside workers (Rule 1.9.1). Modified Electric (ME) class separately requires a master disconnect switch, clearly marked for on/off, accessible to the seated driver and to outside safety personnel (Rule 10.2). Not stated as required for other classes.",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.9" },
      confidence: "high",
      notes: "Rules 1.9.2-1.9.3: batteries/cables kept a safe distance from fuel; a liquid acid-filled battery inside the occupant area must be sealed in a marine battery box and properly mounted.",
    },
    tow_hook: {
      requirement: "not_addressed",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026" },
      confidence: "high",
      notes: "Full document reviewed (sections 1-13) — no tow hook/tow point requirement found.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026" },
      confidence: "high",
      notes: "No tow rope/strap requirement found anywhere in the document.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026" },
      confidence: "high",
      notes: "No warning triangle requirement found anywhere in the document.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026" },
      confidence: "high",
      notes: "No first aid kit requirement found anywhere in the document.",
    },
    window_breaker: {
      requirement: "required",
      materialNote:
        "Rule 1.2.1: a seatbelt cutter must be in the vehicle and within reach of the driver. No separate window-breaking tool is addressed beyond the polycarbonate (Lexan) window material requirement (Rule 1.4.2).",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.2" },
      confidence: "high",
    },
    hood_pins: {
      requirement: "not_addressed",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026" },
      confidence: "high",
      notes:
        "Full-document search for 'hood pin'/'hood latch'/'hood strap'/'positive latch' and for the bare word 'pin'/'pins' found zero matches. The only hood-adjacent text is Rule 2.3.8's fire-retardant hood/helmet skirt (a driver-worn item, not a fastener) and Rule 8.6.3's under-hood insulation allowance — neither addresses securing the hood itself. Not addressed.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026" },
      confidence: "high",
      notes: "Full-document search found no spill kit / absorbent material requirement anywhere in the document.",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionRequiresWelded: true,
      rolloverProtectionTubingSpec: [
        { underWeightLbs: 1200, minSizes: [{ outerDiameterIn: 1.25, wallThicknessIn: 0.095 }], materialNote: "DOM or Docol R8, ≥350N/mm² tensile" },
        {
          underWeightLbs: 2501,
          minSizes: [
            { outerDiameterIn: 1.5, wallThicknessIn: 0.095 },
            { outerDiameterIn: 1.25, wallThicknessIn: 0.12 },
          ],
          materialNote: "DOM or Docol R8, ≥350N/mm² tensile",
        },
        {
          minSizes: [
            { outerDiameterIn: 1.75, wallThicknessIn: 0.095 },
            { outerDiameterIn: 1.5, wallThicknessIn: 0.12 },
          ],
          materialNote: "DOM or Docol R8, ≥350N/mm² tensile — for 2501 lbs and up",
        },
      ],
      rolloverProtectionRequiresPadding: true,
      rolloverProtectionPaddingCertRequired: true,
      condition:
        "Two cage types apply depending on class: Cage A (FIA Art. 253 Appendix J rally-style) for Unlimited/Unlimited Sport/Open Lite/Modified Electric/Rally; Cage A or B (full sedan cage, two side-protection bars per side, sill bar) for Open/Prepared/HPSS/Stock Electric/Vintage Exhibition; Vintage Driver may use A or B but excludes open-wheel/Unlimited-type cars from that class. FIA-homologated cages built after 2005 are accepted as designed, with supporting paperwork required at tech; pre-2005 FIA cages need an A-pillar-support + X-bracing retrofit.",
      citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.12–1.22" },
      confidence: "high",
      notes:
        "Bolt-in footplates are explicitly allowed (≥3/16\" steel, 5\" square, minimum 3× 3/8\" grade-5 bolts) — the ban is specifically on bolt-together/sleeved tube joints, not the chassis mounting plates. No aluminum cages allowed, even if otherwise compliant. Padding must be SFI or FIA high-density.",
    },
  },
  classOverrides: {
    unlimited: {
      kill_switch: {
        requirement: "required",
        citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.9.1" },
        confidence: "high",
        notes: "Rule 1.9.1: 'Unlimited and Open classes shall have a battery shut-off switch accessible by the driver when seated, and by workers from outside the vehicle.'",
      },
      fire_suppression: fireSuppressionOptionalAddition,
    },
    "unlimited-sport": {
      kill_switch: killSwitchNotAddressed,
      fire_suppression: fireSuppressionOptionalAddition,
    },
    open: {
      kill_switch: {
        requirement: "required",
        citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "1.9.1" },
        confidence: "high",
        notes: "Rule 1.9.1: 'Unlimited and Open classes shall have a battery shut-off switch accessible by the driver when seated, and by workers from outside the vehicle.'",
      },
      fire_suppression: fireSuppressionOptionalAddition,
    },
    "open-lite": {
      kill_switch: killSwitchNotAddressed,
      fire_suppression: fireSuppressionOptionalAddition,
    },
    prepared: {
      kill_switch: killSwitchNotAddressed,
      fire_suppression: fireSuppressionOptionalAddition,
    },
    hpss: {
      kill_switch: killSwitchNotAddressed,
      fire_suppression: fireSuppressionOptionalAddition,
    },
    rally: {
      kill_switch: killSwitchNotAddressed,
      fire_suppression: {
        requirement: "required",
        citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "9.1" },
        confidence: "high",
        notes:
          "Rule 9.1: 'A fire suppression system is required and fire extinguishers in accordance with rule 12.2 must be onboard.' Unlike every other class, where an onboard system is merely an optional addition to the mandatory portable extinguisher(s) (§1.3.1), Rally makes the onboard system itself mandatory. The 'rule 12.2' cross-reference has no corresponding section in this document (it ends at §13.8) — likely a leftover reference from another rulebook; the general portable extinguisher requirement (§1.3, still applicable — see fire_extinguisher) is treated as governing instead. No specific fire-suppression-system certification standard (e.g. SFI 17.1/FIA 8865-2015) is named.",
      },
    },
    "modified-electric": {
      kill_switch: {
        requirement: "required",
        citation: { title: "2026 Climb to the Clouds Competition Classes & Safety Rules", version: "Last updated 7/12/2026", section: "10.2" },
        confidence: "high",
        notes:
          "Rule 10.2: the vehicle must have a master disconnect switch that completely disconnects the vehicle from the power source, clearly marked for both on and off positions, and accessible by the driver when seated and by safety personnel from outside the vehicle. Framed as an electric-vehicle-specific master disconnect distinct from §1.9.1's 'battery shut-off switch' wording for Unlimited/Open, but serves the same kill-switch function tracked by this category.",
      },
      fire_suppression: fireSuppressionOptionalAddition,
    },
    "stock-electric": {
      kill_switch: killSwitchNotAddressed,
      fire_suppression: fireSuppressionOptionalAddition,
    },
    "vintage-exhibition": {
      kill_switch: killSwitchNotAddressed,
      fire_suppression: fireSuppressionOptionalAddition,
    },
    "vintage-driver": {
      kill_switch: killSwitchNotAddressed,
      fire_suppression: fireSuppressionOptionalAddition,
    },
  },
};

export const sccnhRulesets: Ruleset[] = [gravelTrials, climbToTheClouds];

import { CategoryRule, Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

const sourceDoc = {
  title: "BMW CCA Club Racing Rules",
  version: "2026 Q2, 7/27/2026",
  url: "https://bmwccaclubracing.com/wp-content/uploads/2026/07/BMW-CCA-Club-Racing-Rules-2026-Q2-Final.pdf",
};

// Section III "Safety" applies identically "to all cars in all classes" (Sport, Prepared, Modified,
// SpecE36, Spec E30, Spec Mini, Spec E46, E30 M3 Touring Car, PWR) — driver PPE doesn't vary by
// class, only car-prep/weight rules do (out of this app's scope), so a single ruleset covers the
// whole Club Racing program.
const clubRacing: Ruleset = {
  id: "bmwcca-club-racing",
  bodyId: "bmwcca",
  bodyName: "BMW CCA Club Racing",
  disciplineName: "Club Racing (Sport / Prepared / Modified / Spec Classes / PWR)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "III. Safety, B. Equipment" }],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "Rule text: 'SA-2015 will be allowed until the end of 2026' — after that, SA-2020 or newer only." },
        { standardId: "sfi-31.1a", note: "Rulebook table: open-faced SFI spec." },
        { standardId: "sfi-31.2a", note: "Rulebook table: 'Closed-faced purchased before 12/31/2014' — gated by purchase date, not manufacture date." },
        { standardId: "sfi-31.1-2015", note: "Rulebook table just says bare 'SFI 31.1' for 'Closed-faced purchased after 1/1/2015,' with no generation year given. This app's registry only has yeared SFI 31.1 entries — mapped here to the 2015/2020 generations as a reasonable approximation, not a literal match." },
        { standardId: "sfi-31.1-2020", note: "Same mapping gap as above." },
        { standardId: "fia-8859-2015", note: "Rulebook table just says 'FIA 8859/8860, All' with no generation specified — current-era FIA generations listed as a reasonable interpretation." },
        { standardId: "fia-8859-2020" },
        { standardId: "fia-8859-2024" },
        { standardId: "fia-8860-2010" },
        { standardId: "fia-8860-2018" },
        { standardId: "fia-8860-2024" },
      ],
      fullFaceRequirement: "conditional",
      fullFaceCondition:
        "Required only for drivers of vehicles without a full windshield (e.g. open-wheel/formula cars) — and even then, protective goggles with an open-face helmet are an explicit accepted alternative to a full-face helmet, so this isn't a hard full-face mandate the way it is at some other bodies.",
      citation: { ...sourceDoc, section: "III.B.2 Helmets" },
      confidence: "high",
      notes:
        "Snell M-rated helmets are explicitly not allowed. The SFI table is purchase-date gated ('purchased before/after 12/31/2014'), not manufacture-date gated like most other bodies' SFI rules — not modeled as expiresOn/validityYearsFromLabel for that reason. Helmet must be replaced after any significant impact with the ground or contact with the roll cage.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required specifically for drivers with a mustache and/or beard.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook just specifies 'fire-retardant balaclava' — no specific certification number cited.",
      citation: { ...sourceDoc, section: "III.B.1.e" },
      confidence: "high",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", validityYearsFromLabel: 5, note: "Must be inspected and recertified by the original manufacturer every 5 years from the date of manufacture." },
        {
          standardId: "fia-8858-2002",
          noExpiration: true,
          note: "⚠️ The device itself doesn't expire and needs no recertification unless damaged — but its tethers are dated separately and must be replaced 5 years after their own manufacture date. This app only tracks one date for this entry (the device's), so check your tether's date independently even if the device passes here.",
        },
        { standardId: "fia-8858-2010", noExpiration: true, note: "Not explicitly named by the rulebook (which only cites FIA 8858-2002), but assumed acceptable as the current FIA generation, matching this app's usual convention for bodies with this gap." },
      ],
      citation: { ...sourceDoc, section: "III.B.3 Head and Neck Restraints" },
      confidence: "high",
      notes:
        "Required for all drivers, no exemption based on harness type (unlike bodies that only require HNR when a competition harness is fitted). Devices that merely claim to meet SFI or FIA specs but don't carry an actual certification sticker are explicitly not approved.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-3.2a-1", note: "Must be worn with full-length upper and lower fire-rated underwear — see undergarment." },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "sfi-3.4-5", note: "Rulebook lists this as 'SFI 3.4A.'" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986", note: "Rulebook cites this standard twice, oddly worded both as 'FIA NORME 1986/1986' and 'FIA 8856-1986' — read here as the same FIA 1986 Standard." },
      ],
      citation: { ...sourceDoc, section: "III.B.1 Driving Apparel" },
      confidence: "high",
      notes: "Suit must cover the entire body except hands, feet, and head.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'Fire-retardant... gloves are required' — no specific certification number is cited, just fire-retardant material; a certified SFI 3.3/FIA 8856 item obviously also qualifies.",
      citation: { ...sourceDoc, section: "III.B.1.d" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'Driving shoes of a fire-retardant material are required' — no specific certification number cited.",
      citation: { ...sourceDoc, section: "III.B.1.d" },
      confidence: "high",
    },
    socks: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook §III.B.1.d.i: 'Fire-retardant socks and gloves are required' — no specific certification number cited.",
      citation: { ...sourceDoc, section: "III.B.1.d" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Mandatory (full-length upper and lower) if the driving suit is SFI 3.2A/1. For all other suit tiers, fire-retardant underwear is 'strongly recommended' rather than required — cotton underwear is explicitly discouraged due to steam-burn risk.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook: 'fire retardant NOMEX or Carbon-X underwear' — a material description, no specific certification number cited.",
      citation: { ...sourceDoc, section: "III.B.1.c" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required for open cars, including convertibles with an installed hardtop — i.e. fitting a hardtop does not exempt a convertible from this requirement, unlike most other bodies.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Rulebook just says 'approved arm restraints' — no specific certification standard named.",
      citation: { ...sourceDoc, section: "III.B, Arm Restraints" },
      confidence: "high",
    },
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [
        {
          standardId: "fia-8855-1999",
          note: "Rulebook: 'FIA 8855-1999 or higher' — homologation label must be visible; seat supports must be the type listed on FIA Technical List No. 12 (lateral, bottom, etc.). A homologated seat used this way doesn't need a seat back attached to the roll structure.",
        },
      ],
      materialNote:
        "Confirmed directly against the Club Racing rulebook's own 'Seats and Seat Back Braces' section (III.B.8) — this is a genuine uncertified path, not just a guess: 'Expired FIA certification (over 5 years) or no certification evident require seat back bracing, even if the back of the seat is close to the horizontal roll cage tube.' So an uncertified seat is explicitly allowed, traded off against mandatory seat-back bracing attached to the horizontal tube on the cage's main hoop — this isn't a hard FIA-homologation-only mandate. The uncertified path isn't a blank check for any stock/OEM seat, though: III.B.8.b.i separately requires 'a one-piece bucket-type racing-style seat... for the driver' regardless of certification status, so the alternative is an uncertified racing-style bucket seat with bracing, not an unmodified factory seat. Applies identically across Sport, Prepared, Modified, Spec, and PWR — Section III 'Safety' is written to apply to all classes, and III.B.8 makes no class-specific carve-out. Aluminum seats must be sized to the driver's weight/strength (consult the manufacturer above 200 lbs; 'rib-protector' options are not recommended). Headrests, integral or separate, are required and must extend above the midpoint of the back of the helmet.",
      citation: { ...sourceDoc, section: "III.B.8, Seats and Seat Back Braces" },
      confidence: "high",
      notes:
        "Minimum seat-fastening hardware diameter is 8mm (2002/530i/early 320i models with original 6mm hardware must upgrade). This app doesn't yet track seat sliders/rails vs. a fixed mount as a separate question, but the rulebook doesn't address that distinction for Club Racing either. materialOnlyAccepted set to true after re-checking the rulebook directly against this task's HYBRID-category update for `seat` (see categoryMeta.ts) — the previous version of this rule cited only FIA 8855-1999 as an accepted standard with no materialOnlyAccepted flag set; the rulebook's own text (quoted in materialNote) confirms the uncertified-plus-brace alternative is real, matching the pattern PHA and Pikes Peak use for seats.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        { standardId: "sfi-16.1", validityYearsFromLabel: 2, note: "Expires 2 years after the date of manufacture, at the end of the manufactured month." },
        { standardId: "sfi-16.5", validityYearsFromLabel: 2, note: "Same 2-year-from-manufacture-month expiration as SFI 16.1." },
        {
          standardId: "fia-8853-98",
          validityYearsFromLabel: 5,
          note: "Rulebook cites only generic 'FIA 8853 standards' without a generation year — both current FIA harness generations in this app's registry are offered on that basis. FIA certifications expire December 31st five years after the date of manufacture; modeled here as an approximate 5-year window from the label — check the tag itself for the exact expiration year.",
        },
        { standardId: "fia-8853-2016", validityYearsFromLabel: 5, note: "Same generic-citation and Dec-31/5-year expiration basis as fia-8853-98 above." },
      ],
      citation: { ...sourceDoc, section: "III.B, Safety Harnesses" },
      confidence: "high",
      notes:
        "A 6- or 7-point harness is required — not a 3-point belt. Measurements: lap belt 2-3in, anti-sub strap 2in, shoulder straps 2in (with a HANS) or 3in (without). Sternum straps are not permitted with a HANS device. Harnesses without certification are explicitly prohibited — there's no stock/OEM-belt fallback at this level, unlike HPDE. Two-inch lap belts are strongly recommended (currently only available with FIA-certified harnesses) — not modeled as its own field. Belt must be replaced if webbing is cut, frayed, significantly faded, or visibly damaged, if buckles are bent/cracked, or after a severe impact — the Tech Steward will cut the certification labels off in that case. See Appendix B for approved harness configuration/installation standards (not covered by this research pass).",
    },
    window_net: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-27.1", validityYearsFromLabel: 2, note: "Expires 2 years after the date of manufacture, at the end of the manufactured month." },
        {
          standardId: "fia-8863-2013",
          validityYearsFromLabel: 5,
          note: "Rulebook names this exact generation ('FIA 8863-2013 window nets'). Expires 5 years from the year of manufacture, on December 31st of the year printed on the net — modeled here as an approximate 5-year window from the label; check the net itself for the exact expiration year.",
        },
      ],
      citation: { ...sourceDoc, section: "III.B, Window Nets" },
      confidence: "high",
      notes:
        "Required on essentially all cars (both front door windows must be completely down with an approved net fitted to the driver's window area) — not conditioned on car type the way arm restraints are. The only exception is factory-delivered race cars that were FIA-homologated to race with windows in the up position. A net without a visible certification label is treated as expired and must be replaced. Must attach to the cage (not the door) with no drilled holes or zip-ties, and have a quick one-handed release visible from outside. The rulebook separately also requires a triangular interior right-side net (captures the head/shoulder in angled/side impacts, attached near the seat) — an additional, distinct net not modeled as its own category here. Not framed as an alternative to arm restraints anywhere in this rulebook — both are independently required where applicable, so satisfiedByAlternative is intentionally not set on either category here (unlike some other bodies that treat the two as interchangeable).",
    },
    fuel_cell: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: [{ standardId: "fia-ft3-1999" }, { standardId: "fia-ft3.5-1999" }, { standardId: "fia-ft5-1999" }],
      materialNote:
        "Fuel cells are optional, not mandatory — 'Fuel cells may be used in classes where allowed,' and the stock tank may be retained instead. If a fuel cell IS used, it must be constructed and certified to FIA FT-3 or higher (FT-3, FT-5, etc.); a Fuel Cell Waiver must be executed, and only one of the fuel cell or stock tank may actually supply fuel for combustion (the other must be emptied of all substances, though the fuel cell may retain its bladder/foam).",
      citation: { ...sourceDoc, section: "III.B, Fuel System" },
      confidence: "high",
      notes:
        "A sealed metal bulkhead between the driver/passenger compartment and the compartment containing the fuel cell (or a non-under-floor fuel tank) is required. Fuel cell bladders require manufacturer recertification after 5 years, with one further 2-year recertification permitted (7-year total bladder life). Location is generally within 12 inches of the stock tank location (or the trunk, if the stock tank was under the rear seats) — with a factory-specific exception allowing the 'Merin' fuel cell in certain rear-seat-tank models (E36/E46/E87/E90/E92), and an exemption for BMW factory-delivered race cars using their as-delivered fuel cell and location.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "III.B, Fire Safety" },
      confidence: "high",
      notes:
        "The rulebook mandates an on-board fire SUPPRESSION SYSTEM for every car (see fire_suppression) but never separately requires a handheld/portable fire extinguisher mounted in the car itself. The only actual 'fire extinguisher' requirement anywhere in this rulebook (10 lb minimum nominal capacity, 60-B:C minimum UL rating) is for the pit crew's dedicated fireman during hot-pit refueling — a team/pit-crew item, not equipment carried in the race car.",
    },
    fire_suppression: {
      requirement: "required",
      acceptedStandards: [
        {
          standardId: "sfi-17.1",
          validityYearsFromLabel: 2,
          note: "Certification is valid for 2 years as designated by the applied certification decal; the fire bottle must be re-certified every 2 years by the manufacturer or a designated agent.",
        },
        { standardId: "fia-technical-list-16", validityYearsFromLabel: 2, note: "Same 2-year recertification cycle as the SFI 17.1 path." },
        { standardId: "fia-technical-list-52", validityYearsFromLabel: 2, note: "Same 2-year recertification cycle as the SFI 17.1 path." },
      ],
      citation: { ...sourceDoc, section: "III.B, Fire Safety" },
      confidence: "high",
      notes:
        "On-board fire systems are required for all cars, with a minimum of two nozzle locations (one in the driver's compartment, one in either the engine bay or the fuel cell area). Manual, electric, or automatic activation is allowed; a manual/electric activation control must be within the driver's reach when belted in. A red-and-white circle 'E' decal must mark the activation point of all onboard fire systems. Mechanical firing safety pins must be removed (and electrical control boxes switched on) before going on track.",
    },
    kill_switch: {
      requirement: "required",
      citation: { ...sourceDoc, section: "III.B, Electrical Cut-off Switch" },
      confidence: "high",
      notes:
        "A standard, approved decal must be mounted externally to mark the switch (preferably on the driver's side). The switch must disconnect the battery from all circuits — except an electrically operated fire system — and must shut off the engine and alternator while it's running. May be operated by a pull wire requiring no external body modification; see Appendix C for the electrical disconnect specification (not covered by this research pass).",
    },
    tow_hook: {
      requirement: "required",
      citation: { ...sourceDoc, section: "II.D, General Requirements — Tow Points" },
      confidence: "high",
      notes:
        "All race cars must be equipped with front AND rear tow points, minimum 2 inches in diameter, that don't protrude dangerously from the bodywork, are accessible without removing/manipulating other panels, and can sustain the stresses of towing. Recommended styles are a webbed nylon strap or a folding hook.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "II.D, General Requirements" },
      confidence: "high",
      notes: "The rulebook requires front/rear tow POINTS on the car itself (see tow_hook) but never requires the driver/team to carry their own tow rope or strap.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the rulebook — on-site medical/ambulance coverage is an event-organizer obligation, not a per-car equipment requirement.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "high",
      notes:
        "Not mentioned anywhere in the rulebook. The Driver Egress Requirement (must be able to exit within 15 seconds with all safety equipment in place, harnesses buckled, and nets in place) and the window net's own quick one-handed release are the closest related provisions, but no window-breaker tool or seatbelt cutter is required.",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionRequiresWelded: true,
      rolloverProtectionTubingSpec: [
        { underWeightLbs: 1500, minSizes: [{ outerDiameterIn: 1.375, wallThicknessIn: 0.095 }], materialNote: "Source rulebook prints this tier as '.375\" x 0.095\"' — almost certainly a scan-dropped leading digit, since every other body's under-1500lb tier uses 1.25-1.375\" OD; treated here as 1.375\" x 0.095\" DOM/chromoly/seamless. Verify against the original PDF if precision matters." },
        { underWeightLbs: 2501, minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.095 }], materialNote: "DOM/chromoly/seamless. ERW 1.5\"x0.120\" also referenced but only for grandfathered vehicles — no ERW logbooks issued after 07/01/03." },
        { underWeightLbs: 3001, minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.12 }, { outerDiameterIn: 1.75, wallThicknessIn: 0.095 }], materialNote: "DOM/chromoly/seamless. ERW 1.75\"x0.120\" also referenced but only for grandfathered vehicles." },
        { underWeightLbs: 4001, minSizes: [{ outerDiameterIn: 1.75, wallThicknessIn: 0.12 }], materialNote: "DOM/chromoly/seamless only, no ERW allowed." },
        { minSizes: [{ outerDiameterIn: 2.0, wallThicknessIn: 0.12 }], materialNote: "For over 4000 lbs. DOM/chromoly/seamless only, no ERW allowed." },
      ],
      rolloverProtectionRequiresPadding: true,
      rolloverProtectionPaddingCertRequired: true,
      citation: { ...sourceDoc, section: "III.B Roll Cages; Appendix A" },
      confidence: "high",
      notes:
        "'All classes require a full roll cage' — mandatory outright, no class exemption. FIA-approved (not bolt-in) or documented Factory/BMW Motorsport cages are allowed with required braces added; bolt-in cages are barred for logbooks issued after 1/1/2007. Requires a diagonal brace in the rear hoop, metal-to-metal mounting at 6-8 points, at least one door bar per side, and (if the car runs without a solidly-affixed roof/hard top) 2\" of helmet clearance below the front/main-hoop plane. Sport/Prepared/SpecE36/E30-M3-Touring classes get a more prescriptive 6-point spec (Appendix A); Modified/PWR classes have free cage construction provided it meets the basic Appendix A structure. Padding: half-round SFI 45.1 or FIA 8857-2001 Type A required on any tube within 12\" of the head; lower-density padding permitted elsewhere (door bars, shin bars) but not in head-contact zones.",
    },
  },
};

// ============================================================================================
// BMW CCA Driving Events Operations Manual — a separate program from Club Racing above (chapter-
// run HPDE, autocross/gymkhana/car-control clinics, and ice autocross, governed by the National
// Driving Events Committee rather than Club Racing's own rules body). Read directly and in full
// (32 pages) — confidence is high throughout. This manual is far thinner on driver PPE than Club
// Racing: it only ever mandates a helmet (with narrow exceptions), plus a convertible-specific
// arm-restraint requirement for HPDE and a shoe requirement for autocross. It never mentions a
// firesuit, gloves, HANS/HNR, undergarment, or balaclava requirement anywhere for any of these
// three event types — those are modeled as honest not_addressed gaps, not omissions.
// ============================================================================================

const deSourceDoc = {
  title: "BMW CCA Driving Events Operations Manual",
  version: "Last updated 3/24/2025",
  url: "https://www.bmwcca.org/sites/default/files/2025-12/Driving-Events-Manual03242025.pdf",
};

// Section 2.2.10's helmet-rating table is the club-wide standard referenced by both Driving
// Schools/HPDE (§2.3.3.1) and Autocross/Gymkhana/Car-Control Clinics (§2.4.6.1).
const deHelmetRule: CategoryRule = {
  requirement: "required",
  acceptedStandards: [
    { standardId: "snell-sa2020", noExpiration: true },
    { standardId: "snell-sa2025", noExpiration: true, note: "Not literally named in this manual (dated 3/24/2025, before this generation's release), but obviously covered as the current Snell SA standard." },
    { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "Manual: a helmet is allowed 'until the end of the eleventh year of its standard's release' — SA2015 through end of calendar year 2026." },
    { standardId: "snell-m2020d", expiresOn: "2026-12-31", note: "Manual: 'On the release of the Snell 2025 standard, M-rated (motorcycle) helmets will no longer be allowed. M2020 helmets will be grandfathered until 12/31/2026.' M2015 is not mentioned in this grandfather clause and isn't included here for that reason. The manual doesn't distinguish Duro (D) vs Race (R) M2020 variants — both are listed as a best-effort mapping." },
    { standardId: "snell-m2020r", expiresOn: "2026-12-31", note: "Same M2020 grandfather clause as snell-m2020d." },
    { standardId: "fia-8860-2010", expiresOn: "2028-12-31" },
    { standardId: "fia-8860-2018", noExpiration: true },
    { standardId: "fia-8860-2018-abp", noExpiration: true },
    { standardId: "fia-8859-2015", noExpiration: true },
    { standardId: "fia-8859-2024", noExpiration: true },
  ],
  citation: { ...deSourceDoc, section: "2.2.10 Helmets" },
  confidence: "high",
  notes:
    "Open-face helmets are allowed; full-face is only recommended, not required. Face shields are recommended and should be down/locked whenever a helmet is required; if no shield, some form of eye protection should be worn. Cars with airbags: the helmet must not have a sun visor extending above the face shield, and any face shield present must be down and locked (an open/partial shield could snag an exploding airbag and load the neck).",
};

// Driving Schools / HPDE (§2.3). In-car instruction, run groups, etc. are out of this app's scope.
const hpde: Ruleset = {
  id: "bmwcca-de-hpde",
  bodyId: "bmwcca",
  bodyName: "BMW CCA",
  disciplineName: "Driving Schools / HPDE",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...deSourceDoc, section: "2.3 Driving Schools" }],
  categories: {
    helmet: {
      ...deHelmetRule,
      citation: { ...deSourceDoc, section: "2.3.3.1 Helmets; 2.2.10 Helmets" },
      notes:
        deHelmetRule.notes +
        " Must be worn by all drivers and passengers during all in-car sessions except low-speed track-familiarization sessions (50 mph or less) or touring laps.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section — only a helmet and lap/shoulder belts are addressed.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned in the Driving Schools/HPDE section — the closed-toe/closed-heel shoe rule elsewhere in this manual is written specifically for §2.4 (Autocross/Gymkhana/Car-Control Clinics), not HPDE.",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned in the Driving Schools/HPDE section.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required specifically for soft-top convertibles (cars with a retractable soft top and/or fully removable hardtop — not cars with an integrated retractable factory hardtop, which aren't considered 'convertibles' here) in order to participate in any session where helmets are required. A roll bar/cage meeting the manual's Appendix 1 spec is also required for the same cars. At the chapter's discretion, a car with factory-fixed rollover protection and a removable roof section may be allowed instead, if that protection clears the same Helmet Reference Plane spec.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Manual just says 'arm restraints' — no specific certification standard named.",
      citation: { ...deSourceDoc, section: "2.3.18 Convertibles" },
      confidence: "high",
      notes: "Chapters may also elect to exclude convertibles/removable-roof cars from helmet-required sessions entirely, regardless of this equipment.",
    },
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "Manual's example Pre-Event Technical Inspection Report form (which every chapter's own form must at least cover): 'Seats: Must be in sound condition and securely mounted.' No certification, sliders-vs-fixed-mount, or racing-seat-construction requirement is stated — a stock/OEM seat in good condition and properly secured satisfies this.",
      citation: { ...deSourceDoc, section: "2.3.19 Pre-event Technical Inspection Report form" },
      confidence: "high",
      notes:
        "Chapters are free to design their own inspection criteria/form, but the manual requires it to cover 'at least the items included in this example' — so this minimum substance is treated as an actual (if lightly specified) HPDE requirement, not merely a suggestion.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "Manual: 'Lap and shoulder belts are required for driver and passenger. Vehicle manufacturer's standard three-point systems are acceptable; however, they must be in good condition with no evidence of cuts, damage, or extensive wear.' No certification standard is cited for either a stock 3-point belt or an aftermarket multi-point harness.",
      citation: { ...deSourceDoc, section: "2.3.3.2 Lap and shoulder belts" },
      confidence: "high",
      notes:
        "Equal restraints (driver and passenger) are required. Multipoint (4-, 5-, or 6-point) harnesses are permitted but come with specific seat-headrest compatibility rules: NOT permitted with any integrated-headrest seat unless the headrest has pass-throughs for dual shoulder belts (or a compatible adjustable-post design), and 5-/6-point anti-sub straps may never be installed around the front of the seat bottom — the seat needs a proper pass-through opening 8-12in from the bottom of the seat back. The pre-event tech form separately reiterates: 'At least 3-point lap/shoulder belts in both seats. Must be securely mounted; belts not frayed.'",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section — only arm restraints are addressed for convertibles (see arm_restraint above), never a window net.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc, section: "2.3.17.4" },
      confidence: "high",
      notes:
        "'Fire extinguishers that are charged and operational shall be in the pit areas and at all manned corner stations' — this is event-level firefighting equipment the organizer must provide, not a requirement that each participating car carry its own extinguisher.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    tow_hook: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in the Driving Schools/HPDE section.",
    },
    rollover_protection: {
      requirement: "conditional",
      rolloverProtectionByBodyStyle: { closed_roof: "not_addressed", convertible: "required", open_no_windshield: "required", open_wheel: "required" },
      rolloverProtectionRequiresWelded: true,
      rolloverProtectionTubingSpec: [
        { underWeightLbs: 2000, minSizes: [{ outerDiameterIn: 1.5, wallThicknessIn: 0.12 }, { outerDiameterIn: 1.75, wallThicknessIn: 0.075 }] },
        { underWeightLbs: 3501, minSizes: [{ outerDiameterIn: 1.75, wallThicknessIn: 0.12 }, { outerDiameterIn: 2.0, wallThicknessIn: 0.075 }] },
        { minSizes: [{ outerDiameterIn: 2.0, wallThicknessIn: 0.12 }], materialNote: "For over 3500 lbs curb weight." },
      ],
      rolloverProtectionRequiresPadding: true,
      condition:
        "§2.3.18: convertibles (retractable soft top and/or fully removable hard top — NOT cars with an integrated retractable factory hardtop) may not run any session requiring helmets unless equipped with a roll bar/cage meeting Appendix 1. A car with factory-fixed rollover protection and a removable roof section may be allowed at the chapter's discretion if that structure clears the same Helmet Reference Plane spec. Chapters may also elect to exclude convertibles/removable-roof cars from helmet-required sessions entirely, avoiding the requirement. A fixed hard-roof car isn't addressed by this section at all.",
      citation: { ...deSourceDoc, section: "2.3.18 Convertibles; Appendix 1" },
      confidence: "high",
      notes:
        "Appendix 1 spec: full cockpit width; Helmet Reference Plane (top of roll bar to structural chassis points ahead of the windshield base) must clear both occupants' helmets by 2\"; seamless ERW or DOM mild steel (SAE 1010/1020/1025) or chromoly (SAE 4125/4130); one continuous hoop, max 4 bends totaling 180°±10°; two fore/aft braces plus a diagonal brace, sized per the same weight table; mounting plates ≥3/16\" thick, welded full-perimeter or bolted with a same-size backup plate and ≥3 bolts. AWS D1.1 welding standard. A 3/16\" inspection hole is required in the hoop. Padding (§1.4): any portion of the roll bar/bracing that might contact an occupant's helmet must be covered with non-resilient material (Ethafoam, Ensolite, or similar), minimum 1/2\" thick, firmly attached — no SFI/FIA certification number is cited, just the plain-material minimum.",
    },
  },
};

// Autocross, Gymkhana, and Car-Control Clinics (§2.4) — the manual states its minimum standards
// apply to all three event types unless stated otherwise, so one ruleset covers all three.
const autocross: Ruleset = {
  id: "bmwcca-de-autocross",
  bodyId: "bmwcca",
  bodyName: "BMW CCA",
  disciplineName: "Autocross / Gymkhana / Car-Control Clinics",
  disciplineGroup: "Autocross",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...deSourceDoc, section: "2.4 Autocross, Gymkhana, and Car-Control Clinics" }],
  categories: {
    helmet: {
      ...deHelmetRule,
      citation: { ...deSourceDoc, section: "2.4.6.1 Helmets; 2.2.10 Helmets" },
      notes: deHelmetRule.notes + " Must be worn by both driver and passenger — no low-speed exception is stated for this event type (unlike HPDE).",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes:
        "Not mentioned for autocross/gymkhana/car-control clinics generally. §2.4.6.3 does require a full-face helmet, a motorsports-style collar neck brace, and gloves/jacket/full-length pants of leather, vinyl, or abrasion-resistant nylon — but only for competitors driving go-karts, a narrow vehicle-type exception not modeled as the general rule here.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics generally — see the go-kart-specific exception noted under firesuit.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Manual: 'Closed-toe and closed-heel shoes are required when on course or within any restricted area' — no fire-resistance or certification requirement.",
      citation: { ...deSourceDoc, section: "2.4.6.4 Footwear" },
      confidence: "high",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned anywhere in this section, including for open cars.",
    },
    seat: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc, section: "2.4.8 Technical/safety requirements" },
      confidence: "high",
      notes:
        "Section 2.4.8's safety-review checklist (wheels, seatbelts/harnesses, brakes, roll bars, etc.) never mentions seats. Unlike Driving Schools/HPDE (§2.3.19's example tech form), Autocross/Gymkhana/Car-Control Clinics has no equivalent seat-condition checklist item.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "Manual: 'Lap and shoulder belts are required for driver and passenger and must always be used when the vehicle is in motion. Vehicle manufacturer's standard 3-point systems are acceptable. Multi-point harnesses must be fully functional and installed in compliance with the harness manufacturer's installation instructions.' No certification standard is cited for either option.",
      citation: { ...deSourceDoc, section: "2.4.6.2 Lap and shoulder belts" },
      confidence: "high",
      notes:
        "Equal restraints must be present for driver and passenger if a passenger is in the vehicle. §2.4.8.5's safety checklist reiterates: 'Seatbelts and/or harnesses must be properly installed to the manufacturer's specifications and in good condition with no fraying found.' Karts are explicitly exempt from seat belt requirements 'due to their special safety considerations' — a narrow vehicle-type exception not modeled as the general rule here.",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc, section: "2.4.2.21" },
      confidence: "high",
      notes:
        "'Appropriate fire extinguishers, flags, and material for cleaning up fluid spills must be present' — this is event/course-level firefighting equipment the organizer must provide, not a requirement that each competing car carry its own extinguisher.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    tow_hook: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for autocross/gymkhana/car-control clinics.",
    },
    rollover_protection: {
      requirement: "conditional",
      condition:
        "§2.4.8.10: 'Roll bars, if installed, must be properly and securely mounted' — never mandatory for autocross/gymkhana/car-control clinics (unlike HPDE's convertible-specific Appendix 1 mandate, §2.3.18), but regulated for mounting security if a competitor chooses to fit one voluntarily. No construction, tubing, or padding spec is given.",
      citation: { ...deSourceDoc, section: "2.4.8.10" },
      confidence: "high",
    },
  },
};

// Ice Autocross (§2.5) — "all minimum standards in this manual for autocross also apply to ice
// autocross, except as detailed" in §2.5, which only overrides the helmet rule (and car
// classification/vehicle-type rules out of this app's scope) — so shoes are still required here
// via that inheritance clause, same as regular autocross.
const iceAutocross: Ruleset = {
  id: "bmwcca-de-ice-autocross",
  bodyId: "bmwcca",
  bodyName: "BMW CCA",
  disciplineName: "Ice Autocross",
  disciplineGroup: "Ice Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...deSourceDoc, section: "2.5 Ice Autocross" }],
  categories: {
    helmet: {
      requirement: "recommended",
      citation: { ...deSourceDoc, section: "2.5.4 Helmets" },
      confidence: "high",
      notes: "Manual: 'Helmets are not required due to the low speed (40 mph max) of these events... Use of helmets is suggested for all timed/competitive events.'",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Inherited from the regular Autocross section's closed-toe/closed-heel shoe rule via §2.5.1's 'all standards also apply' clause — no fire-resistance or certification requirement.",
      citation: { ...deSourceDoc, section: "2.4.6.4 Footwear (applies via 2.5.1)" },
      confidence: "high",
    },
    socks: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    seat: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc, section: "2.4.8 Technical/safety requirements (applies via 2.5.1)" },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "Inherited from the regular Autocross section's lap/shoulder belt rule via §2.5.1's 'all standards also apply' clause: 'Lap and shoulder belts are required for driver and passenger... Vehicle manufacturer's standard 3-point systems are acceptable... Multi-point harnesses must be fully functional and installed in compliance with the harness manufacturer's installation instructions.' No certification standard is cited for either option.",
      citation: { ...deSourceDoc, section: "2.4.6.2 Lap and shoulder belts (applies via 2.5.1)" },
      confidence: "high",
      notes:
        "Inherited from regular Autocross — see that ruleset's belts_harness for the full checklist text. Karts and similar vehicles are not allowed to participate in ice autocross at all (see vehicle types), so the kart seatbelt exemption that applies to regular autocross is moot here.",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc, section: "2.4.2.21 (applies via 2.5.1)" },
      confidence: "high",
      notes:
        "Inherited from regular Autocross: 'Appropriate fire extinguishers, flags, and material for cleaning up fluid spills must be present' — event/course-level firefighting equipment the organizer must provide, not a per-car requirement.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    kill_switch: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    tow_hook: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { ...deSourceDoc },
      confidence: "high",
      notes: "Not mentioned for ice autocross or, via inheritance, for regular autocross.",
    },
    rollover_protection: {
      requirement: "conditional",
      condition:
        "Inherited from Autocross (§2.5.1: 'All minimum standards in this manual for autocross also apply to ice autocross, except as detailed below' — roll bars aren't among the listed ice-autocross exceptions). §2.4.8.10: 'Roll bars, if installed, must be properly and securely mounted' — never mandatory, only regulated for mounting security if voluntarily fitted. No construction, tubing, or padding spec is given.",
      citation: { ...deSourceDoc, section: "2.4.8.10 (inherited via 2.5.1)" },
      confidence: "high",
    },
  },
};

export const bmwccaRulesets: Ruleset[] = [clubRacing, hpde, autocross, iceAutocross];

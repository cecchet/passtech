import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, GENERIC_SEAT_STANDARDS } from "../standards";

const solo: Ruleset = {
  id: "scca-solo",
  bodyId: "scca",
  bodyName: "SCCA",
  disciplineName: "Solo (Autocross)",
  disciplineGroup: "Autocross",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "SCCA National Solo Rules",
      version: "2026 Edition, 53rd Printing (Jan 2026)",
      url: "https://www.scca.com/pages/solo-cars-and-rules",
      section: "4.3 Driver Safety Equipment",
    },
  ],
  // Only the 4 broad class families with their own distinctly-cited equipment rules (seat
  // substitution latitude, and the Master Switch/kill_switch and fire-extinguisher carve-outs) are
  // modeled here. Street Touring, Street Modified, CAM, Xtreme, and other Solo class families exist
  // in the rulebook but haven't been separately researched for equipment differences yet — a driver
  // in one of those picks "All classes" and gets the general Street-category-equivalent answer.
  classes: [
    { id: "street", label: "Street (S / STR / AS-HS, etc.)" },
    { id: "street-prepared", label: "Street Prepared (SSP / ASP-FSP, etc.)" },
    { id: "prepared", label: "Prepared (CP / DP / EP / FP, etc.) / X Prepared" },
    { id: "modified", label: "Modified (AM / BM / CM / DM / EM / FM)" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        "snell-sa2025", "snell-sa2020", "snell-sa2015", "snell-sa2010", "snell-sah2010",
        "snell-m2025d", "snell-m2025r", "snell-m2020d", "snell-m2020r", "snell-m2015", "snell-m2010",
        "snell-k2025", "snell-k2020", "snell-k2015", "snell-k2010", "snell-ea2016",
        "sfi-31.1-2020", "sfi-31.1-2015", "sfi-31.1-2010",
        "sfi-41.1-2020", "sfi-41.1-2015", "sfi-41.1-2010",
        "fia-8859-2024", "fia-8859-2024-abp", "fia-8859-2020", "fia-8859-2015",
        "fia-8860-2018", "fia-8860-2018-abp", "fia-8860-2010",
      ].map((standardId) => ({ standardId, noExpiration: true })),
      fullFaceRequirement: "conditional",
      fullFaceCondition: "Required for open-wheel, formula, and kart cars — full-face or modular helmets only. Not required for other car classes.",
      citation: {
        title: "SCCA National Solo Rules",
        version: "2026 Edition",
        section: "4.3.1",
      },
      confidence: "high",
      notes:
        "Solo core rules state no expiration/sunset for any listed helmet rating — unusually permissive (still accepts Snell SA2010).",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from core Solo rules, just not yet re-checked.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes: "Not required and not mentioned in core Solo rules.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes: "Not required, not even recommended, in core Solo rules.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote:
        "Must attach securely to the foot and not interfere with or obstruct pedal operation. No fire-resistance or certification requirement at all in core Solo — any secure, non-obstructive shoe qualifies.",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "4.3.3" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes:
        "Core Solo (pylon autocross) has no arm-restraint requirement. The separate, optional 'Solo Trials' sub-discipline (Appendix D) does require arm restraints on open cars, but that appendix is out of scope for this app (it's a distinct rally-style event within the same rulebook, not standard autocross).",
    },
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "Core Solo Vehicle Safety rules require only that the seat be securely mounted (§3.3.3.B.3: 'Passenger's seat back and all cushions, bolsters, headrests, etc. must be secured. All allowed aftermarket replacement seats ... must be securely and safely mounted.'). The base Street category goes further and locks in the stock seat: §13.2.A: 'Accessories, gauges, indicators, lights and other appearance, comfort and convenience modifications ... are permitted. This does not allow driver's seat substitutions'; §13.2.G: 'Seats may not be cut to allow for the installation of alternate seat belts or harnesses.' A stock/OEM seat always satisfies this requirement — no certification is ever mandated.",
      citation: {
        title: "SCCA National Solo Rules",
        version: "2026 Edition",
        section: "3.3.3.B.3; 13.2.A/G (Street); 15.2.F (Street Prepared); 17.2.I (Prepared); 18.1 (Modified)",
      },
      confidence: "high",
      notes:
        "Reclassified from 'not_addressed' — Section 3.3 (Vehicle Safety) itself is silent on seat type/certification, but the rulebook does substantively address seats once category-specific sections are checked, so 'not_addressed' undersold it. No SFI/FIA seat certification (e.g. 39.1/39.2, 8855-1999/8862-2009) is required or even mentioned anywhere in the document — confirmed via full-document search. A prior version of these notes claimed seats 'may not be substituted or cut/modified at all' outside the elective SCCA Safety Level 2 package — re-verification against the PDF shows that overstated the restriction: it's true only for the base Street category (§13.2.A/G, and per-model Appendix A/B 'Vehicles that do not meet SCCA Level 2 Safety' clauses, which impose their own narrower swap allowances). Street Prepared explicitly permits substitution to 'a full back, bucket-type automobile seat incorporating a functional headrest' with no cert cited (§15.2.F: 'Kart seats, low-back dune buggy seats, and other similar types of seat are expressly prohibited'), and Prepared goes further still — 'The driver's seat may be replaced with a seat of any origin' (§17.2.I) — as does Modified ('Front seat(s) may be modified or replaced', §18.1) — again with no certification requirement in either case. Separately, the elective 'SCCA Safety Level 2' package (referenced from some Appendix A/B model-specific sections, e.g. Club Spec) permits a 'fixed back racing seat' once a compliant rollbar is also added. Net effect across every path: a stock/OEM seat is always sufficient, and a certified racing seat, if installed, obviously also qualifies even though the rulebook never names a minimum spec.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "Seat lap belts are required in all cars (and must be installed in any car whose passive-restraint system doesn't already include one). Shoulder belts/harnesses are strongly recommended but not mandatory. Non-factory upper-body restraints (aftermarket shoulder harnesses) may only be used in open cars, or cars with targa-tops/T-tops in the open position, and only when the roll structure meets Appendix C or Club Racing GCR 9.4 with its top at or above the driver's helmet. No specific SFI/FIA harness certification is cited by core Solo rules — a certified harness is naturally acceptable but not mandated. The 'CG-Lock' is explicitly deemed compliant.",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "3.3.1 Driver Restraints; 4.3.2 Seat Belts" },
      confidence: "high",
    },
    window_net: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes:
        "No window net requirement, and no net/arm-restraint either-or, in core Solo (pylon autocross) rules — confirmed via full-document search. The separate, optional 'Solo Trials' sub-discipline (Appendix D) does require a window net OR an approved arm restraint (for open cars and cars lacking OE roll-up windows), but that appendix is out of scope for this app — see the arm_restraint entry's notes.",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "3.1 item 27; 18.0.B.9.a" },
      confidence: "high",
      notes:
        "No Solo class requires a fuel cell — stock/OEM fuel tanks are standard, and fuel cells are explicitly listed among GCR items NOT required in Modified Category (18.0.B.9.a). Fuel cells/tank modifications are only ever 'permitted' for categories whose rules allow fuel-system modification. Where one is installed voluntarily, Section 3.1 item 27 imposes installation rules (6\" min ground clearance unless bulkhead-isolated, metal bulkhead separating it from the driver compartment, positively-fastened non-metallic filler doors) — but having one at all is never mandatory.",
    },
    fire_extinguisher: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "17.11; 17.12.D; 18.0.B.9.k" },
      confidence: "high",
      notes:
        "No core Solo class requires a hand-held fire extinguisher or on-board fire system — confirmed via full-document search. Explicitly optional: 'Fire extinguishers or fire systems are permitted' for Prepared category (17.12.D); a hand-held extinguisher and on-board fire systems are both explicitly listed among GCR items 'recommended' but 'not required' for X Prepared (17.11) and Modified Category (18.0.B.9.k) cars. The separate Appendix D 'Solo Trials' sub-discipline recommends (not requires) an extinguisher meeting specific Halon/dry-chemical ratings, but that appendix is out of scope for this app.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "18.0.B.9.k" },
      confidence: "high",
      notes:
        "No Solo class requires an on-board fire suppression system. On-board fire systems are explicitly listed among GCR items not required in Modified Category (18.0.B.9.k), and one model-specific Appendix A safety section states outright: 'Level 2 Fire Suppression is not required for Solo Events.'",
    },
    kill_switch: {
      requirement: "conditional",
      condition:
        "Required (as a 'Master Switch') on all Modified Category vehicles (AM/BM/CM/DM/EM/FM classes) — installed directly in a battery cable, cutting all electrical circuits (but not an on-board fire system if equipped), easily accessible from outside the car, marked with the international spark-in-a-blue-triangle symbol, and mounted at a class-specified standard location. DM and EM vehicles are exempt from this requirement if competing on DOT-approved tires. Not required for Street, Street Touring, Street Prepared, Street Modified, or Prepared category vehicles.",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "18.0.E.2 Master Switch" },
      confidence: "high",
    },
    tow_hook: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "3.1 (general modification allowances)" },
      confidence: "high",
      notes:
        "No Solo class requires a tow hook. Factory tow hooks/tie-down loops may not be removed under the general weight-reduction allowances, and aftermarket tow hooks may be freely added (unrestricted location, serving no other function), but nothing mandates having one at all.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes: "Not required and not mentioned anywhere in the rulebook — confirmed via full-document search.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes:
        "Not required and not mentioned anywhere in the rulebook — confirmed via full-document search. (The only 'triangle' reference in the rulebook is the international spark-in-a-triangle symbol used to mark a Modified Category master/kill switch, unrelated to a roadside warning triangle.)",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes:
        "No requirement for a first aid kit carried in the car. The rulebook's only first-aid provision is an event-organizational one in the separate 'Solo Trials' sub-discipline (Appendix D), requiring an Advanced-First-Aid-certified individual and kit on site — an event safety requirement, not car equipment — and that appendix is out of scope for this app.",
    },
    window_breaker: {
      requirement: "not_addressed",
      citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
      confidence: "high",
      notes: "Not required and not mentioned anywhere in the rulebook — confirmed via full-document search.",
    },
  },
  classOverrides: {
    street: {
      seat: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote:
          "§13.2.A: 'Accessories, gauges, indicators, lights and other appearance, comfort and convenience modifications ... are permitted. This does not allow driver's seat substitutions.' §13.2.G: 'Seats may not be cut to allow for the installation of alternate seat belts or harnesses.' The stock/OEM seat is the only option in Street — not just accepted, but mandatory as-is.",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "13.2.A, 13.2.G" },
        confidence: "high",
        notes: "Unlike every other Solo category, Street doesn't offer a seat-substitution path at all — there's no certified-seat option to select here because installing any non-stock seat isn't legal in this category, not because certification is unavailable.",
      },
      kill_switch: {
        requirement: "not_addressed",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "18.0.E.2" },
        confidence: "high",
        notes: "Master Switch is only required for Modified Category (AM/BM/CM/DM/EM/FM) vehicles — not required for Street.",
      },
      fire_extinguisher: {
        requirement: "not_addressed",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
        confidence: "high",
        notes: "No mention of a fire extinguisher or fire system anywhere in the Street category rules.",
      },
    },
    "street-prepared": {
      seat: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote:
          "§15.2.F allows substitution to 'a full back, bucket-type automobile seat incorporating a functional headrest' — 'Kart seats, low-back dune buggy seats, and other similar types of seat are expressly prohibited.' No certification is cited; the stock seat also remains an option.",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "15.2.F" },
        confidence: "high",
      },
      kill_switch: {
        requirement: "not_addressed",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "18.0.E.2" },
        confidence: "high",
        notes: "Master Switch is only required for Modified Category (AM/BM/CM/DM/EM/FM) vehicles — not required for Street Prepared.",
      },
      fire_extinguisher: {
        requirement: "not_addressed",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition" },
        confidence: "high",
        notes: "No mention of a fire extinguisher or fire system anywhere in the Street Prepared category rules.",
      },
    },
    prepared: {
      seat: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "§17.2.I: 'The driver's seat may be replaced with a seat of any origin.' No certification is cited; the stock seat also remains an option.",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "17.2.I" },
        confidence: "high",
      },
      kill_switch: {
        requirement: "not_addressed",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "18.0.E.2" },
        confidence: "high",
        notes: "Master Switch is only required for Modified Category (AM/BM/CM/DM/EM/FM) vehicles — not required for Prepared.",
      },
      fire_extinguisher: {
        requirement: "recommended",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "17.11, 17.12.D" },
        confidence: "high",
        notes:
          "§17.12.D: 'Fire extinguishers or fire systems are permitted.' §17.11 separately lists a hand-held extinguisher and on-board fire systems among GCR items 'recommended' but 'not required' for X Prepared specifically. Not mandatory in either case.",
      },
    },
    modified: {
      seat: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "§18.1: 'Front seat(s) may be modified or replaced.' No certification is cited; the stock seat also remains an option.",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "18.1" },
        confidence: "high",
      },
      kill_switch: {
        requirement: "required",
        materialNote:
          "Required (as a 'Master Switch') on all Modified Category vehicles — installed directly in a battery cable, cutting all electrical circuits (but not an on-board fire system if equipped), easily accessible from outside the car, marked with the international spark-in-a-blue-triangle symbol, and mounted at a class-specified standard location.",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "18.0.E.2 Master Switch" },
        confidence: "high",
        notes:
          "DM and EM classes specifically are exempt from this requirement if competing on DOT-approved tires — that sub-class distinction isn't modeled separately here since DM/EM aren't broken out as their own selectable class; a DM/EM driver on DOT tires should treat a 'Required' result here as not applicable to them.",
      },
      fire_extinguisher: {
        requirement: "recommended",
        citation: { title: "SCCA National Solo Rules", version: "2026 Edition", section: "18.0.B.9.k" },
        confidence: "high",
        notes: "§18.0.B.9.k lists a hand-held fire extinguisher and on-board fire systems among GCR items 'recommended' but 'not required' for Modified Category. Not mandatory.",
      },
    },
  },
};

const rallycross: Ruleset = {
  id: "scca-rallycross",
  bodyId: "scca",
  bodyName: "SCCA",
  disciplineName: "RallyCross",
  disciplineGroup: "RallyCross",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "SCCA RallyCross Rules",
      version: "RX2026, 2026 Edition (Jan 2026)",
      url: "https://www.scca.com/pages/rallycross-cars-and-rules",
      section: "3.2 Vehicle/Driver Safety",
    },
  ],
  // Truck category is omitted from this list — every citation that names it (fuel_cell §3.3.F.10)
  // lands on the exact same answer as every other class, so there's no distinct rule to refine to.
  classes: [
    { id: "stock", label: "Stock" },
    { id: "prepared", label: "Prepared" },
    { id: "modified", label: "Modified" },
    { id: "constructors", label: "Constructors (Exhibition Only, regional)" },
    { id: "utv", label: "UTV (side-by-side)" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2015", noExpiration: true },
        { standardId: "snell-sa2010", noExpiration: true },
        { standardId: "snell-sah2010", noExpiration: true },
        { standardId: "snell-m2025d", noExpiration: true },
        { standardId: "snell-m2025r", noExpiration: true },
        { standardId: "snell-m2020d", noExpiration: true },
        { standardId: "snell-m2020r", noExpiration: true },
        { standardId: "snell-m2015", noExpiration: true },
        { standardId: "snell-m2010", noExpiration: true },
        { standardId: "snell-k2020", noExpiration: true },
        { standardId: "snell-k2015", noExpiration: true },
        { standardId: "snell-k2010", noExpiration: true },
        { standardId: "snell-ea2016", noExpiration: true },
        { standardId: "sfi-31.1-2020", expiresOn: "2026-12-31", note: "Older SFI ratings not valid after 12/31/2026 per SCCA RallyCross rules." },
        { standardId: "sfi-31.1-2015", expiresOn: "2026-12-31" },
        { standardId: "sfi-31.1-2010", expiresOn: "2026-12-31" },
        { standardId: "sfi-41.1-2020", expiresOn: "2026-12-31" },
        { standardId: "sfi-41.1-2015", expiresOn: "2026-12-31" },
        { standardId: "sfi-41.1-2010", expiresOn: "2026-12-31" },
        { standardId: "sfi-24.1-2020", expiresOn: "2026-12-31" },
        { standardId: "sfi-24.1-2015", expiresOn: "2026-12-31" },
        { standardId: "sfi-24.1-2010", expiresOn: "2026-12-31" },
        { standardId: "fia-8860-2024", noExpiration: true },
        { standardId: "fia-8860-2024-abp", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
        { standardId: "fia-8860-2018-abp", noExpiration: true },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8860-2010", noExpiration: true },
      ],
      citation: {
        title: "SCCA RallyCross Rules",
        version: "RX2026",
        section: "3.2.P",
      },
      confidence: "high",
      notes: "Required for all drivers and passengers. No DOT-only allowance.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from RX2026, just not yet re-checked.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
      notes: "Confirmed via full-document search — not required, not mentioned.",
    },
    firesuit: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
    },
    gloves: {
      requirement: "conditional",
      condition:
        "Only required for open/no-windshield vehicles (e.g. Constructors/UTV-type builds lacking a full windshield, side glass, or window nets).",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No specific certification standard cited — general requirement to wear gloves.",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3 (vehicle construction), item 11.d" },
      confidence: "high",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required when: (1) the driver's window is down more than 1\" without a window net installed (§3.2.D); (2) in a UTV, any occupant's hands/arms can extend beyond the roll cage's plane without hardware-secured windows/nets/screens (item 11); or (3) in the Constructors (Exhibition Only) category, the vehicle lacks a full windshield/side windows (item 11.d/e). Must be anchored per the restraint manufacturer's specifications.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No certification standard cited — functional requirement only (anchored per manufacturer spec).",
      satisfiedByAlternative: "window_net",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.2.D; vehicle construction items 11, 11.d/e" },
      confidence: "high",
      notes:
        "RX2026 frames the window/arm-restraint requirement as a clean either/or in all three places it appears: §3.2.D ('unless the vehicle is equipped with a window net and/or the driver is using arm restraints'), UTV item 11 ('hardware-secured windows/nets/screens' OR 'arm restraints'), and Constructors item 11.d/e ('window nets or arm restraints'). Wired bidirectionally with window_net.",
    },

    // --- Car safety gear ---------------------------------------------------------------------
    seat: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "Seats must be securely mounted to the vehicle structure per the seat manufacturer's installation instructions/recommendations, and must be intended by their manufacturer for automotive (or, in Modified/Constructors categories, competition) use. A substituted front passenger seat (Prepared category) must be fully upholstered and sufficiently large/strong to safely support an occupant.",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.3.D.11 (Prepared); 3.3.E.20 (Modified); 3.3.H.16 (Constructors)" },
      confidence: "high",
      notes:
        "No SFI or FIA seat certification (e.g. SFI 39.1/39.2, FIA 8855/8862) is required or even mentioned anywhere in RX2026 — confirmed via full-document search. Stock category retains the OEM seat as-is (no substitution allowed), and it satisfies the requirement outright since 'securely mounted, manufacturer-intended-use' is the entire bar. A certified racing seat obviously also qualifies even though no specific spec is named.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: ["sfi-16.1", "sfi-16.5", "sfi-16.6", "fia-8853-2016", "fia-8853-98", "fia-8854-98", "fia-8853-1985"].map(
        (standardId) => ({ standardId }),
      ),
      materialNote:
        "Seat lap belts are required in all vehicles/categories (§3.2.G) — shoulder belts strongly recommended but not mandatory, and no certification is required for this base lap-belt requirement (plain lap belts qualify). A certified 5-point-or-greater SFI- or FIA-rated harness becomes required in two narrower cases: (1) Prepared category, only if the competitor voluntarily installs a roll cage meeting SCCA Time Trial Safety Level 3 (§3.3.D.4.d.2); and (2) the Constructors (Exhibition Only) category, where it's mandatory outright since a roll cage is always required there (§3.3.H.17). RX2026 doesn't name specific SFI/FIA spec numbers beyond 'SFI or FIA rated' — the standards listed here are the generic belts_harness set from this app's registry, not numbers quoted verbatim from the rulebook.",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.2.G; 3.3.D.4.d.2; 3.3.H.17" },
      confidence: "high",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "Satisfies the same requirement as arm restraints — required (as an alternative to arm restraints) when: (1) the driver's window is down more than 1\" during course runs (§3.2.D); (2) in a UTV, any occupant's hands/arms can extend beyond the roll cage's plane without hardware-secured windows/nets/screens (item 11); or (3) in the Constructors (Exhibition Only) category, the vehicle lacks a full windshield/side windows (item 11.d/e).",
      materialOnlyAccepted: true,
      materialNote: "No certification standard (e.g. SFI 27.1, FIA 8863) is cited anywhere in RX2026 for the window net itself — a plain net satisfies the requirement.",
      satisfiedByAlternative: "arm_restraint",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.2.D; vehicle construction items 11, 11.d/e" },
      confidence: "high",
    },
    fuel_cell: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.3.E.27-28 (Modified); 3.3.F.10 (Truck); 3.3.H.5 (Constructors)" },
      confidence: "high",
      notes:
        "No RallyCross category requires a fuel cell — stock/OEM fuel tanks are standard in all categories, confirmed via full-document search. A fuel cell is only ever described as optional: 'Safety fuel cells are encouraged and, if installed...' for Truck class (§3.3.F.10), and 'any non-stock fuel cell' installation constraints (metal bulkhead shielding if in the passenger compartment, non-pressurized, vent must not admit fuel vapor into the passenger compartment) apply only where one is voluntarily added (Modified §3.3.E.27-28, Constructors §3.3.H.5) — never mandatory.",
    },
    fire_extinguisher: {
      requirement: "conditional",
      condition:
        "Not a standing car-equipment requirement. RX2026's only fire-extinguisher rule is a paddock/refueling-area presence rule: 'While refueling a vehicle, at least one (1) 10 lb. minimum Class B fire extinguisher must be present' (Appendix B §7.f.ii). It applies only during on-site refueling and doesn't specify the extinguisher must be mounted in or carried on the competition vehicle itself, and there's no extinguisher requirement during course runs or at any other time — confirmed via full-document search for any other extinguisher requirement.",
      fireExtinguisherOptions: [{ quantity: 1, minWeightLbs: 10 }],
      materialNote: "Minimum 10 lb, Class B rated — no specific UL numeric B:C rating is given, just the class letter and weight.",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "Appendix B, National Event Operating Rules, 7.f.ii" },
      confidence: "high",
      notes:
        "This is a refueling-area presence rule (an event/paddock operational requirement), not a requirement that the extinguisher be carried in or mounted on the competition vehicle — distinct in kind from the car-mounted fire extinguisher requirements modeled for other sanctioning bodies in this app. Treat with that caveat in mind.",
    },
    fire_suppression: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
      notes: "Full document search found no mention of an on-board fire suppression/fire system requirement in RX2026, for any category.",
    },
    kill_switch: {
      requirement: "conditional",
      condition:
        "Required only in the Constructors (Exhibition Only) category (§3.3.H.14) — a regional-only, exhibition class not offered at national events. Not required (and not mentioned) for Stock, Prepared, Modified, Truck, or UTV categories.",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.3.H.14" },
      confidence: "high",
      notes:
        "Where required, the master switch must: install directly on the positive battery cable and cut all electrical circuits when OFF; have insulated terminals; be marked with the international spark-in-a-blue-triangle symbol with OFF clearly indicated; be securely fastened (no drilling holes in the roll cage for the mounting bracket); and sit in one of three standard locations (near the right roll-bar upright; in front of the windshield on the cowl/fender; or below the center of the rear window/on the roll cage or dash) — §3.3.H.14.a-c.",
    },
    tow_hook: {
      requirement: "recommended",
      materialNote:
        "'Entrants are advised to install permanent tow hooks on their vehicles to facilitate towing. If an entrant's vehicle is equipped with removable factory tow hooks, it is recommended that these be installed prior to tech inspection and remain installed for the duration of the event' (Appendix B §7.b.i).",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "Appendix B, National Event Operating Rules, 7.b.i" },
      confidence: "high",
      notes: "Advisory only, not mandatory. No color-marking requirement is stated.",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "Appendix B, National Event Operating Rules, 7.b" },
      confidence: "medium",
      notes:
        "RX2026 states 'each entrant is responsible for hooking up tow straps to their vehicle if the vehicle becomes disabled on course' — this assigns responsibility for the act of hooking up a tow strap during an on-course tow, but doesn't clearly mandate that the entrant carry a tow rope/strap in the car at all times. Treated as not_addressed given that ambiguity rather than asserting a requirement the text doesn't clearly state.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
      notes:
        "Not required and not mentioned anywhere in the rulebook — confirmed via full-document search. (The only 'triangle' reference in RX2026 is the international spark-in-a-triangle symbol used to mark a Constructors-category master/kill switch, unrelated to a roadside warning triangle.)",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
      confidence: "high",
      notes: "No requirement for a first aid kit carried in the car, and no event-level medical-provision rule either — confirmed via full-document search.",
    },
  },
  classOverrides: {
    stock: {
      seat: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "Stock category retains the OEM seat as-is — no substitution is allowed at all, so the factory seat both satisfies and is the only option.",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.3 Vehicle Construction (Stock category)" },
        confidence: "high",
      },
    },
    prepared: {
      seat: {
        requirement: "required",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_SEAT_STANDARDS,
        materialNote:
          "Seat must be securely mounted to the vehicle structure per the seat manufacturer's installation instructions, and manufacturer-intended for automotive use. A substituted front passenger seat must be fully upholstered and sufficiently large/strong to safely support an occupant.",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.3.D.11" },
        confidence: "high",
      },
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote:
          "Lap belts are the baseline requirement (§3.2.G) — no certification needed. A certified 5-point-or-greater SFI-/FIA-rated harness only becomes required if you voluntarily install a roll cage meeting SCCA Time Trial Safety Level 3 (§3.3.D.4.d.2); without a cage, plain lap belts remain sufficient.",
        acceptedStandards: ["sfi-16.1", "sfi-16.5", "sfi-16.6", "fia-8853-2016", "fia-8853-98", "fia-8854-98", "fia-8853-1985"].map((standardId) => ({ standardId })),
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.2.G; 3.3.D.4.d.2" },
        confidence: "high",
      },
    },
    modified: {
      seat: {
        requirement: "required",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_SEAT_STANDARDS,
        materialNote: "Seat must be securely mounted to the vehicle structure per the seat manufacturer's installation instructions, and manufacturer-intended for automotive OR competition use.",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.3.E.20" },
        confidence: "high",
      },
    },
    constructors: {
      seat: {
        requirement: "required",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_SEAT_STANDARDS,
        materialNote: "Seat must be securely mounted to the vehicle structure per the seat manufacturer's installation instructions, and manufacturer-intended for automotive or competition use.",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.3.H.16" },
        confidence: "high",
      },
      belts_harness: {
        requirement: "required",
        materialOnlyAccepted: false,
        materialNote:
          "A certified 5-point-or-greater SFI- or FIA-rated harness is mandatory outright — Constructors is the one category where a roll cage is always required (§3.3.H.17), so the lap-belt-only baseline that applies elsewhere never comes into play here.",
        acceptedStandards: ["sfi-16.1", "sfi-16.5", "sfi-16.6", "fia-8853-2016", "fia-8853-98", "fia-8854-98", "fia-8853-1985"].map((standardId) => ({ standardId })),
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.3.H.17" },
        confidence: "high",
      },
      kill_switch: {
        requirement: "required",
        materialNote:
          "Master switch must: install directly on the positive battery cable and cut all electrical circuits when OFF; have insulated terminals; be marked with the international spark-in-a-blue-triangle symbol with OFF clearly indicated; be securely fastened (no drilling holes in the roll cage for the mounting bracket); and sit in one of three standard locations (near the right roll-bar upright; in front of the windshield on the cowl/fender; or below the center of the rear window/on the roll cage or dash).",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "3.3.H.14.a-c" },
        confidence: "high",
        notes: "Constructors is the only RallyCross category where this is required — Stock, Prepared, Modified, Truck, and UTV don't mention a kill switch at all.",
      },
      gloves: {
        requirement: "conditional",
        condition: "Required if the vehicle lacks a full windshield or side glass — common for Constructors builds, but not universal, so check your car's actual configuration.",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_APPAREL_STANDARDS,
        materialNote: "No specific certification standard cited — general requirement to wear gloves.",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "vehicle construction item 11.d" },
        confidence: "high",
      },
      arm_restraint: {
        requirement: "conditional",
        condition: "Required if the vehicle lacks a full windshield/side windows — the driver may instead fit a window net (either satisfies this).",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_APPAREL_STANDARDS,
        materialNote: "No certification standard cited — functional requirement only (anchored per manufacturer spec).",
        satisfiedByAlternative: "window_net",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "vehicle construction item 11.d/e" },
        confidence: "high",
      },
      window_net: {
        requirement: "conditional",
        condition: "Satisfies the same requirement as arm restraints — required (as an alternative) if the vehicle lacks a full windshield/side windows.",
        materialOnlyAccepted: true,
        materialNote: "No certification standard cited — a plain net satisfies the requirement.",
        satisfiedByAlternative: "arm_restraint",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "vehicle construction item 11.d/e" },
        confidence: "high",
      },
    },
    utv: {
      kill_switch: {
        requirement: "not_addressed",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026" },
        confidence: "high",
        notes: "Constructors is the only RallyCross category that requires a kill switch — UTVs aren't included.",
      },
      gloves: {
        requirement: "conditional",
        condition: "Required unless the vehicle has hardware-secured windows, nets, or screens keeping occupants' hands/arms inside the roll cage's plane — UTVs are open by design, so this applies by default unless that hardware is added.",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_APPAREL_STANDARDS,
        materialNote: "No specific certification standard cited — general requirement to wear gloves.",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "vehicle construction item 11" },
        confidence: "high",
      },
      arm_restraint: {
        requirement: "conditional",
        condition:
          "Required unless the vehicle has hardware-secured windows, nets, or screens keeping any occupant's hands/arms inside the roll cage's plane — an alternative to fitting a window net (either satisfies this). UTVs are open by design, so this applies by default unless that hardware is added.",
        materialOnlyAccepted: true,
        acceptedStandards: GENERIC_APPAREL_STANDARDS,
        materialNote: "No certification standard cited — functional requirement only (anchored per manufacturer spec).",
        satisfiedByAlternative: "window_net",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "vehicle construction item 11" },
        confidence: "high",
      },
      window_net: {
        requirement: "conditional",
        condition:
          "Satisfies the same requirement as arm restraints — required (as an alternative) unless the vehicle has hardware-secured windows, nets, or screens keeping occupants' hands/arms inside the roll cage's plane.",
        materialOnlyAccepted: true,
        materialNote: "No certification standard cited — a plain net satisfies the requirement.",
        satisfiedByAlternative: "arm_restraint",
        citation: { title: "SCCA RallyCross Rules", version: "RX2026", section: "vehicle construction item 11" },
        confidence: "high",
      },
    },
  },
};

const roadRacing: Ruleset = {
  id: "scca-road-racing",
  bodyId: "scca",
  bodyName: "SCCA",
  disciplineName: "Road Racing (Club Racing / GCR)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "SCCA General Competition Rules (GCR)",
      version: "2026 GCR, updated through Technical Bulletin 26-08 (Aug 2026)",
      url: "https://www.scca.com/pages/cars-and-rules",
      section: "9.3.18-9.3.19 Driver's Restraint System / Driver's Safety Equipment",
    },
  ],
  // The base categories below already cite the GCR's own class-based exemption lists in prose
  // (fuel_cell §9.3.26, fire system §9.3.22, kill_switch §9.3.35, tow_hook §9.3.50, window_net
  // §9.3.56). Those four lists don't line up with each other class-for-class, so classes here are
  // grouped by their ACTUAL shared override profile rather than by informal category name:
  // Touring 3/4 + B-Spec + C-Spec are exempt from all three of fuel_cell/kill_switch/fire system
  // (hand-held only); Touring 1/2 + Electric Touring share the fuel_cell/kill_switch exemption but
  // are NOT in §9.3.22's hand-held-extinguisher list (only T3/T4 are — T1/T2 are not), so they need
  // an on-board fire system; Spec Miata + Improved Touring are fuel_cell- and fire-system-exempt but
  // NOT kill_switch-exempt (§9.3.35 only names Touring/B-Spec/C-Spec); Spec MX-5 + American Sedan
  // (restricted prep) + production-based Vintage cars are fuel_cell-exempt only (not named in either
  // the fire-system or kill-switch lists); Super Touring Lite (STL) is named only in the fire-system
  // list, not fuel_cell or kill_switch; Formula/Sports Racing classes are uniquely exempt from
  // tow_hook (§9.3.50) but aren't exempt from anything else; Legends Cars are the one class GCR
  // names as flatly exempt from window_net (§9.3.56). Other named classes/categories (GT, Production,
  // Super Touring Under, American Sedan non-restricted-prep, Sports Racing sub-classes beyond the
  // Formula/Sports Racing towing exemption, etc.) aren't broken out since they fall through to the
  // same "default/required" answer the base categories already give — there's no distinct override
  // to cite for them.
  classes: [
    { id: "touring-t3-t4-bspec-cspec", label: "Touring 3/4 (T3/T4) / B-Spec / C-Spec" },
    { id: "touring-t1-t2-et", label: "Touring 1/2 (T1/T2) / Electric Touring (ET)" },
    { id: "spec-miata-improved-touring", label: "Spec Miata / Improved Touring (ITR/ITS/ITA/ITB/ITC)" },
    { id: "spec-mx5-as-vintage", label: "Spec MX-5 / American Sedan (restricted prep) / Production-based Vintage" },
    { id: "stl", label: "Super Touring Lite (STL)" },
    { id: "formula-sports-racing", label: "Formula & Sports Racing Category Classes" },
    { id: "legends", label: "Legends Cars" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "GCR states 'SA2015 Helmets will be valid through 2026' — no exact month/day given; treated as end-of-year cutoff. Re-verify against the 2027 GCR once published." },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "sfi-31.1-2015", noExpiration: true, note: "SFI-labeled helmets must have a year printed on the label to be valid." },
        { standardId: "sfi-31.1-2020", noExpiration: true },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8860-2010", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
      ],
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.2" },
      confidence: "high",
      notes:
        "Annual scrutineer sticker process applies (9.3.19.A). 'or newer' generations beyond what's listed here should also qualify — verify against current GCR if unsure.",
    },
    balaclava: {
      requirement: "not_addressed",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08" },
      confidence: "medium",
      notes: "Balaclava wasn't a tracked category when this ruleset was researched — not confirmed absent from the GCR, just not yet re-checked.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true, note: "GCR: 'H&NR devices do not time out irrespective of any stated expiration date,' but must be undamaged and in acceptable condition." },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.3" },
      confidence: "high",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-1" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "sfi-3.4-5" },
        { standardId: "fia-1986" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018", noExpiration: true, note: "GCR: FIA 8856-2018 suits do not expire regardless of manufacture date, provided undamaged." },
      ],
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.1" },
      confidence: "high",
      notes: "One-piece suits highly recommended but not mandatory. Must cover neck to ankles/wrists.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Leather and/or accepted fire-resistant material, containing no holes. No specific SFI/FIA certification number cited by the GCR — a certified SFI 3.3 or FIA 8856 glove also satisfies this.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.4" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Uppers of leather and/or nonflammable material, covering at minimum the instep. Manufacturer ventilation pinholes allowed. No specific certification number cited by the GCR.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.9" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required unless the driving suit itself is rated FIA 1986 Standard, FIA 8856-2000, or SFI 3.2A/5 or higher — in which case fire-resistant underwear becomes optional.",
      undergarmentTriggerStandards: ["sfi-3.2a-1"],
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "GCR just says 'underwear of fire resistant material' when required — no specific SFI/FIA certification number cited, though SFI 3.3 or FIA 8856 obviously qualifies.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.19.C.1" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required on all open cars, including open Targa tops, sunroofs, and T-tops (§9.3.18). May be worn as an alternative to a window safety net in closed-cockpit Sports Racing cars (§9.3.56). Must not limit the driver's ability to signal other competitors.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No certification standard cited by the GCR.",
      satisfiedByAlternative: "window_net",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.18; 9.3.56" },
      confidence: "high",
    },

    // --- Car safety gear ---------------------------------------------------------------------
    seat: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_SEAT_STANDARDS,
      materialNote:
        "GCR §9.3.43: the driver's seat 'shall be a one-piece bucket-type seat and shall be securely mounted, so as to provide fore/aft and lateral support.' A head rest system is also required on all vehicles — satisfied automatically by a racing seat with an integral headrest; non-integral headrests need a minimum 36 sq in area, 1\" padding, and must withstand 200 lbs rearward force (SFI 45.2 or FIA Sports Car Head Rest Material padding strongly recommended, not mandatory). A passenger seat, if installed, must meet the same spec as the driver's seat.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.43" },
      confidence: "high",
      notes:
        "No SFI (e.g. 39.1/39.2) or FIA (e.g. 8855-1999/8862-2009) seat certification number is cited anywhere in this section — confirmed via full-document search — so acceptedStandards here is the generic list, offered on the basis that a certified racing seat obviously satisfies a 'one-piece bucket-type' construction rule even though GCR itself never names a minimum spec. materialOnlyAccepted is set to false (unlike PHA's identically-worded seat rule) because GCR §9.3.43 has no carve-out for an unmodified OE/stock seat — PHA's rule softens its bucket-type mandate with 'OE seats may not be modified to accommodate belts' (implying an unmodified OE seat is otherwise usable), but GCR's text has no equivalent hedge, just an unconditional 'shall be.' That reading is reinforced by two other GCR requirements that apply to every Club Racing car with no stock-equipment path: a roll cage is always mandatory (§9.3.40, 'Shall comply with Section 9.4, Driver Protection Structures') and a certified 5/6/7-point harness is always mandatory with no stock-belt alternative (§9.3.18: 'All drivers ... shall utilize either a 5, 6, or 7 point restraint harness' — SFI 16.1/16.5 or FIA 8853/8854 only). A genuine unmodified factory seat is not built to route or anchor a 5+ point harness or to provide the required lateral support once caged, so it does not realistically satisfy §9.3.43 in this discipline.",
    },
    belts_harness: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: [
        {
          standardId: "sfi-16.1",
          note: "GCR §9.3.18.E.1.a: SFI-labeled systems display the spec number, expiration month/year, and a final expiration date of June 30 or December 31 of the labeled year — labels with a June 30 date remain valid through December 31 of that same labeled year.",
        },
        { standardId: "sfi-16.5", note: "Same label-printed expiration rule as SFI 16.1 — GCR §9.3.18.E.1.a." },
        { standardId: "fia-8853-2016", note: "GCR §9.3.18.E.1.b: FIA 8853/2016-labeled systems display their own expiration date directly on the label." },
        { standardId: "fia-8853-98" },
        { standardId: "fia-8854-98" },
      ],
      materialNote:
        "GCR §9.3.18: 'All drivers... shall utilize either a 5, 6, or 7 point restraint harness meeting the following specifications' — SFI 16.1, 16.5, or FIA 8853/98, 8853-2016, or 8854/98. A 7-point harness is recommended. Unlike Solo and RallyCross, the GCR never offers a stock/OEM-belt alternative — a certified harness is always required for GCR road racing.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.18" },
      confidence: "high",
      notes:
        "Detailed installation rules also apply: shoulder harness must be over-the-shoulder type with a single release shared with the seat belt, mounted behind the driver and supported above a line drawn 20° down from the shoulder point (guide must be part of the roll cage/car structure, not the seat); only separate shoulder straps or 'H' configuration allowed (no 'Y' type); minimum SAE Grade 5/Metric 8.8 mounting hardware (§9.3.18.A-D). If a restraint has multiple/mixed certification labels, the one with the latest expiration date governs (§9.3.18.E.2-3).",
    },
    window_net: {
      requirement: "conditional",
      condition:
        "Required on the driver's-side window of all closed cars, EXCEPT factory (OEM)/FIA GT3-GT4 race-prepared cars with fixed Lexan front door windows (as noted on the car's Spec Line), and Legends Cars (exempt outright). Closed-cockpit Sports Racing cars may use arm restraints INSTEAD of a window net — not both required. All other closed-car categories (Production, GT, Improved Touring, Formula, etc.) have no such substitution — the net itself is mandatory there.",
      acceptedStandards: [
        { standardId: "sfi-27.1", noExpiration: true, note: "GCR: 'Window nets do not time out irrespective of SFI expiration date.'" },
        { standardId: "fia-8863-2015", note: "GCR cites 'FIA J253.11' specifically, not 8863-2015 by name — competitors must provide proof of meeting the FIA standard via certification or physical measurement. Mapped to this app's closest registered FIA window-net standard; verify the exact FIA document number with SCCA tech if precision matters." },
      ],
      satisfiedByAlternative: "arm_restraint",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.56" },
      confidence: "high",
      notes:
        "Must be equipped with a quick release that drops the net down (not flipped onto the roof) and attached to the roll cage — plastic buckles, cable ties, hose clamps, and elastic cords are explicitly not permitted. Distinct from the separate 'Inside Net' (§9.3.31, recommended-only, running between the main hoop and dash for production-based/two-seater Sports Racing cars) — not modeled as its own category here since it's not a window-opening net and is never mandatory.",
    },
    fuel_cell: {
      requirement: "conditional",
      condition:
        "Required on all cars EXCEPT Touring, B-Spec, C-Spec, Spec Miata, Spec MX-5, Improved Touring, American Sedan restricted prep, production-based Vintage cars, and any car whose stock fuel tank sits between the axle centerlines and within the main chassis structure (frame rails, etc.) — the stock tank may remain in its stock location in that case.",
      materialOnlyAccepted: true,
      acceptedStandards: [
        { standardId: "sfi-28.3", noExpiration: true, note: "GCR §9.3.26 names 'SFI 28.3' specifications as an alternative to the FIA FT-3-or-higher spec." },
        { standardId: "fia-ft3-1999", noExpiration: true, note: "GCR: 'FIA FT-3 or higher (FT-3.5, FT-5, etc.)' — fuel cells do not time out and have no expiration date." },
        { standardId: "fia-ft3.5-1999", noExpiration: true },
        { standardId: "fia-ft5-1999", noExpiration: true },
      ],
      materialNote:
        "Stock/OEM fuel tank accepted for the exempted classes listed above, provided it stays in its stock location. Where a cell is required, GCR §9.3.26 accepts either FIA FT-3-or-higher or SFI 28.3. All safety fuel cells must consist of a foam-filled bladder in a metal container at minimum, with a metal bulkhead separating it from the driver/passenger compartment.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.26" },
      confidence: "high",
      notes: "SFI 28.3 is now registered in src/data/standards.ts, resolving the earlier registry gap.",
    },
    fire_extinguisher: {
      requirement: "conditional",
      condition:
        "GCR §9.3.22 treats the car's fire-fighting equipment as ONE of two alternatives: cars in T3, T4, STL, Spec Miata, B-Spec, C-Spec, and Improved Touring use a hand-held extinguisher (options modeled here); all other classes instead carry an on-board automatic fire system (see the fire_suppression category), with no hand-held extinguisher then required.",
      fireExtinguisherOptions: [
        { quantity: 1, minWeightLbs: 2 },
        { quantity: 1, minBcRating: 10, minWeightLbs: 2 },
        { quantity: 1, minClassARating: 1, minBcRating: 10, minWeightLbs: 2 },
      ],
      materialNote:
        "GCR §9.3.22.B: Halon 1301, 1211, or DuPont FE-36, 2 lb minimum capacity by weight — OR dry chemical, 2 lb minimum with a positive charge indicator, rated either 10-B:C (potassium bicarbonate/'Purple K' recommended) or 1-A:10-B:C (multipurpose ammonium phosphate and barium sulfate, or Monnex) — OR AFFF (aqueous film forming foam) or equivalent surfactant foam, 2.25 liter minimum by volume with a functional pressure gauge (not modeled in fireExtinguisherOptions above since that field only supports weight-based minimums, not volume). Must be securely mounted in the cockpit with metal, quick-release-type brackets.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22.B" },
      confidence: "high",
    },
    fire_suppression: {
      requirement: "conditional",
      condition:
        "Required on all cars EXCEPT T3, T4, STL, Spec Miata, B-Spec, C-Spec, and Improved Touring — those excepted classes instead carry a hand-held extinguisher (see fire_extinguisher category). Only one of the two is needed for any given car.",
      acceptedStandards: [
        { standardId: "sfi-17.1", note: "GCR also accepts SFI 17.2, which this app's standards registry doesn't separately list — SFI 17.1 is offered here as the closest registered match." },
        { standardId: "fia-technical-list-16" },
      ],
      materialNote:
        "GCR §9.3.22.A: minimum two nozzle locations (one in the driver's compartment, one in the engine or fuel cell area); release mechanism within the belted driver's reach (manual or automatic); cylinder securely mounted and inspectable/weighable; firing safety pin removed before going on track; identified with a circle 'E' decal (two decals for GT/Production, one for Formula/Sports Racing).",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22.A" },
      confidence: "high",
    },
    kill_switch: {
      requirement: "conditional",
      condition:
        "Required on all cars EXCEPT Touring, B-Spec, and C-Spec. Spec Racer Fords (SRF/SRF3) are wired per RFSRII instead of this general rule.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.35" },
      confidence: "high",
      notes:
        "Where required, the master switch must: install directly in either battery cable and cut all electrical circuits EXCEPT an on-board fire system; have insulated terminals; be marked with the international spark-in-a-blue-triangle symbol with OFF clearly indicated; and sit in a standard location depending on car type — near the right-hand roll bar member for Formula/Sports Racing cars; in front of the windshield (cowl or fender) or below the center of the rear window for closed Sports Racing/Production/Improved Touring/GT cars; either location for open Production/GT/Improved Touring cars (§9.3.35.A-C). Cars using a lithium-ion battery must display a Lithium Battery decal near the kill switch (or near the driver's door window opening, for the exempted classes without one) — §9.3.35.D.",
    },
    tow_hook: {
      requirement: "conditional",
      condition:
        "Required, front and rear, on all cars EXCEPT Formula and Sports Racing category classes. Formula/Sports Racing cars may instead use their exposed roll bar for towing, or (uniquely among all classes) carry a removable towing eye inside the car.",
      materialNote:
        "GCR §9.3.50: a fixed 'towing eye or strap' (not a loose/removable tow rope — see the separate tow_rope category) with minimum 2\" ID, that doesn't dangerously protrude from the bodywork while racing. Towing straps or folding towing eyes are required specifically where the towing point falls in the front/rear bumper area; rigid OEM-style protruding towing eyes that screw/bolt into bumper covers are prohibited. Must be accessible without removing/manipulating bodywork. Closed-top cars may mount the front tow eye in the driver/passenger window openings, attached to the forward roll cage down tube near the base of the windshield, one per side.",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.50" },
      confidence: "high",
      notes: "This app's tow_hook category models the fixed front/rear towing attachment point required by §9.3.50 — distinct from a separate loose tow rope/strap carried to actually perform a tow, which the GCR doesn't address (see tow_rope).",
    },
    tow_rope: {
      requirement: "not_addressed",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08" },
      confidence: "high",
      notes:
        "Not required and not mentioned anywhere in the GCR — confirmed via full-document search. §9.3.50's 'towing eye or strap' language refers to the fixed front/rear attachment point on the car (see tow_hook), not a separate loose tow rope/strap carried for performing a tow.",
    },
    emergency_triangle: {
      requirement: "not_addressed",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08" },
      confidence: "high",
      notes:
        "Not required and not mentioned anywhere in the GCR — confirmed via full-document search. (The only 'triangle' references in the GCR are the international spark-in-a-triangle master-switch symbol and unrelated racing-line geometry diagrams — 'Vortex of Danger' — nothing about a roadside warning triangle.)",
    },
    first_aid_kit: {
      requirement: "not_addressed",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08" },
      confidence: "high",
      notes: "No requirement for a first aid kit carried in the car — confirmed via full-document search. (Event-level medical staffing/facilities are addressed elsewhere in the GCR but are an event-organizational requirement, not car equipment, and out of scope for this app.)",
    },
    rollover_protection: {
      requirement: "required",
      rolloverProtectionRequiresFullCage: true,
      rolloverProtectionByBodyStyle: {
        closed_roof: "required",
        convertible: "required",
        open_no_windshield: "required",
        open_wheel: "required",
      },
      condition:
        "Geometry requirement differs by body style: closed cars need the main hoop as close as possible to the roof/B-pillars with a high front hoop; open cars retaining the windshield frame need a full-height main hoop ≥2\" above the driver's helmet; open cars without a windshield frame may use an asymmetric main hoop with either a high or low front hoop. Formula/Sports Racing cars follow a separate GCR §9.4.5 spec (low or high front hoop, no diagonal brace requirement).",
      citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.4" },
      confidence: "high",
      notes:
        "Own weight-tiered tubing spec (SAE 1020/1025 mild/DOM, 4130/T45 alloy, or Docol R8 — ERW banned): roughly 1.375\"×0.080\" up to 1700 lbs, up to 2.00\"×0.095\"/1.75\"×0.120\" over 4000 lbs. Mounting points required vary 6–12 by class (Improved Touring/Spec Miata/B-Spec/C-Spec limited to 6; T2/T3/T4 allow up to 12). FIA or FIA-Approved-Test-House homologated cages accepted with an FIA ID plate plus a letter from SCCA Technical Services (Motorsport UK ROPS-certified cages likewise); the car's logbook records a full description of the roll bar/cage, and its identity number is permanently stamped on the roll bar itself.",
    },
  },
  classOverrides: {
    "touring-t3-t4-bspec-cspec": {
      fuel_cell: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.26" },
        confidence: "high",
        notes: "GCR §9.3.26 exempts Touring (which includes T3/T4) and B-Spec/C-Spec outright from the fuel cell mandate — a stock/OEM fuel tank is accepted, provided it stays in its stock location.",
      },
      fire_extinguisher: {
        requirement: "required",
        fireExtinguisherOptions: [
          { quantity: 1, minWeightLbs: 2 },
          { quantity: 1, minBcRating: 10, minWeightLbs: 2 },
          { quantity: 1, minClassARating: 1, minBcRating: 10, minWeightLbs: 2 },
        ],
        materialNote:
          "GCR §9.3.22 names T3, T4, STL, Spec Miata, B-Spec, C-Spec, and Improved Touring as the classes that use a hand-held extinguisher instead of an on-board system — Halon 1301/1211/DuPont FE-36 (2 lb min), OR dry chemical (2 lb min, 10-B:C or 1-A:10-B:C rated), OR AFFF (2.25 L min, functional pressure gauge). Securely mounted in the cockpit with metal, quick-release-type brackets.",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22.B" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22" },
        confidence: "high",
        notes: "Not required for this class — the hand-held extinguisher alternative applies instead (see fire_extinguisher).",
      },
      kill_switch: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.35" },
        confidence: "high",
        notes:
          "GCR §9.3.35: 'All cars, except Touring, B-Spec and C-Spec, shall be equipped with a master switch.' Cars in this group using a lithium-ion battery must still display the Lithium Battery decal — on top of the driver-side door near the window opening rather than near a kill switch, since there isn't one (§9.3.35.D).",
      },
    },
    "touring-t1-t2-et": {
      fuel_cell: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.26" },
        confidence: "high",
        notes: "GCR §9.3.26 exempts the whole Touring category — including T1/T2/ET — outright from the fuel cell mandate. Stock/OEM fuel tank accepted, provided it stays in its stock location.",
      },
      kill_switch: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.35" },
        confidence: "high",
        notes:
          "GCR §9.3.35: 'All cars, except Touring, B-Spec and C-Spec, shall be equipped with a master switch' — Touring is exempted as a whole category, so this covers T1/T2/ET too. Lithium-ion battery cars in this group must display the decal on top of the driver-side door near the window opening instead (§9.3.35.D).",
      },
      fire_suppression: {
        requirement: "required",
        acceptedStandards: [
          { standardId: "sfi-17.1", note: "GCR also accepts SFI 17.2, which this app's standards registry doesn't separately list — SFI 17.1 is offered here as the closest registered match." },
          { standardId: "fia-technical-list-16" },
        ],
        materialNote:
          "T1, T2, and ET are NOT among the classes GCR §9.3.22 exempts from the on-board fire system requirement — only T3, T4, STL, Spec Miata, B-Spec, C-Spec, and Improved Touring get the hand-held-only alternative. An on-board automatic fire system is required here: minimum two nozzle locations (driver's compartment, and engine or fuel cell area), driver-reachable release, circle 'E' decal.",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22.A" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22" },
        confidence: "high",
        notes: "A hand-held extinguisher alone doesn't satisfy this class's fire-system requirement — an on-board system is mandatory (see fire_suppression). T3/T4 differ from T1/T2/ET on this point; see the separate Touring 3/4 / B-Spec / C-Spec class.",
      },
    },
    "spec-miata-improved-touring": {
      fuel_cell: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.26" },
        confidence: "high",
        notes: "GCR §9.3.26 exempts Spec Miata and Improved Touring outright from the fuel cell mandate — a stock/OEM fuel tank is accepted, provided it stays in its stock location.",
      },
      fire_extinguisher: {
        requirement: "required",
        fireExtinguisherOptions: [
          { quantity: 1, minWeightLbs: 2 },
          { quantity: 1, minBcRating: 10, minWeightLbs: 2 },
          { quantity: 1, minClassARating: 1, minBcRating: 10, minWeightLbs: 2 },
        ],
        materialNote:
          "GCR §9.3.22 names Spec Miata and Improved Touring among the classes that use a hand-held extinguisher instead of an on-board system — Halon 1301/1211/DuPont FE-36 (2 lb min), OR dry chemical (2 lb min, 10-B:C or 1-A:10-B:C rated), OR AFFF (2.25 L min, functional pressure gauge). Securely mounted in the cockpit with metal, quick-release-type brackets.",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22.B" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22" },
        confidence: "high",
        notes: "Not required for this class — the hand-held extinguisher alternative applies instead (see fire_extinguisher).",
      },
      kill_switch: {
        requirement: "required",
        materialNote:
          "Master switch must: install directly in either battery cable and cut all electrical circuits EXCEPT an on-board fire system; have insulated terminals; be marked with the international spark-in-a-blue-triangle symbol with OFF clearly indicated; and sit in the standard location for closed Sports Racing/Production/Improved Touring/GT cars — in front of the windshield (cowl or fender) or below the center of the rear window.",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.35" },
        confidence: "high",
        notes: "GCR §9.3.35 only exempts Touring, B-Spec, and C-Spec from the master switch mandate — Spec Miata and Improved Touring are not on that list, so it's mandatory here despite both being fuel_cell- and fire-system-exempt.",
      },
    },
    "spec-mx5-as-vintage": {
      fuel_cell: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.26" },
        confidence: "high",
        notes: "GCR §9.3.26 exempts Spec MX-5, American Sedan (restricted prep), and production-based Vintage cars outright from the fuel cell mandate — a stock/OEM fuel tank is accepted, provided it stays in its stock location.",
      },
      fire_suppression: {
        requirement: "required",
        acceptedStandards: [
          { standardId: "sfi-17.1", note: "GCR also accepts SFI 17.2, which this app's standards registry doesn't separately list — SFI 17.1 is offered here as the closest registered match." },
          { standardId: "fia-technical-list-16" },
        ],
        materialNote:
          "None of Spec MX-5, American Sedan (restricted prep), or production-based Vintage is among the classes GCR §9.3.22 exempts from the on-board fire system (that list is T3, T4, STL, Spec Miata, B-Spec, C-Spec, and Improved Touring — 'Spec MX-5' and unrestricted-prep American Sedan are notably absent). An on-board automatic fire system is required: minimum two nozzle locations (driver's compartment, and engine or fuel cell area), driver-reachable release, circle 'E' decal.",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22.A" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22" },
        confidence: "high",
        notes: "A hand-held extinguisher alone doesn't satisfy this class's fire-system requirement — an on-board system is mandatory (see fire_suppression).",
      },
      kill_switch: {
        requirement: "required",
        materialNote:
          "Master switch must: install directly in either battery cable and cut all electrical circuits EXCEPT an on-board fire system; have insulated terminals; be marked with the international spark-in-a-blue-triangle symbol with OFF clearly indicated; and sit in the standard location for closed Sports Racing/Production/Improved Touring/GT cars (or either standard location, if the car is an open Production/GT/Improved Touring body style).",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.35" },
        confidence: "high",
        notes: "GCR §9.3.35 only exempts Touring, B-Spec, and C-Spec — none of Spec MX-5, American Sedan (restricted prep), or production-based Vintage is on that list, so the master switch is mandatory here.",
      },
    },
    stl: {
      fuel_cell: {
        requirement: "required",
        materialOnlyAccepted: false,
        acceptedStandards: [
          { standardId: "sfi-28.3", noExpiration: true },
          { standardId: "fia-ft3-1999", noExpiration: true },
          { standardId: "fia-ft3.5-1999", noExpiration: true },
          { standardId: "fia-ft5-1999", noExpiration: true },
        ],
        materialNote:
          "Super Touring Lite is not among the classes GCR §9.3.26 exempts from the fuel cell mandate (Touring, B-Spec, C-Spec, Spec Miata, Spec MX-5, Improved Touring, American Sedan restricted prep, and production-based Vintage cars) — a safety fuel cell meeting FIA FT-3-or-higher or SFI 28.3 is required.",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.26" },
        confidence: "high",
      },
      fire_extinguisher: {
        requirement: "required",
        fireExtinguisherOptions: [
          { quantity: 1, minWeightLbs: 2 },
          { quantity: 1, minBcRating: 10, minWeightLbs: 2 },
          { quantity: 1, minClassARating: 1, minBcRating: 10, minWeightLbs: 2 },
        ],
        materialNote:
          "GCR §9.3.22 names STL specifically among the classes that use a hand-held extinguisher instead of an on-board system — Halon 1301/1211/DuPont FE-36 (2 lb min), OR dry chemical (2 lb min, 10-B:C or 1-A:10-B:C rated), OR AFFF (2.25 L min, functional pressure gauge). Securely mounted in the cockpit with metal, quick-release-type brackets.",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22.B" },
        confidence: "high",
      },
      fire_suppression: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.22" },
        confidence: "high",
        notes: "Not required for STL — the hand-held extinguisher alternative applies instead (see fire_extinguisher).",
      },
      kill_switch: {
        requirement: "required",
        materialNote:
          "Master switch must: install directly in either battery cable and cut all electrical circuits EXCEPT an on-board fire system; have insulated terminals; be marked with the international spark-in-a-blue-triangle symbol with OFF clearly indicated; and sit in a standard GCR-specified location.",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.35" },
        confidence: "high",
        notes: "GCR §9.3.35 only exempts Touring, B-Spec, and C-Spec from the master switch mandate — STL is not on that list, so it's mandatory here despite being fire-system-exempt.",
      },
    },
    "formula-sports-racing": {
      tow_hook: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.50" },
        confidence: "high",
        notes:
          "GCR §9.3.50: 'All cars with the exception of Formula and Sports Racing Category classes must have a towing eye or strap, front and rear...' Formula/Sports Racing cars are the one group GCR exempts from the fixed towing-eye mandate — they may instead use their exposed roll bar for towing, or (uniquely among all classes) carry a removable towing eye inside the car.",
      },
    },
    legends: {
      window_net: {
        requirement: "not_addressed",
        citation: { title: "SCCA GCR", version: "2026, TB 26-08", section: "9.3.56" },
        confidence: "high",
        notes:
          "GCR §9.3.56: 'Legends Cars are not required to have a window net.' Legends Cars are also specifically exempt from the GCR's exhaust system requirements — not modeled as its own category in this app.",
      },
    },
  },
};

export const sccaRulesets: Ruleset[] = [solo, rallycross, roadRacing];

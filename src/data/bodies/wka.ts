import { Ruleset } from "../types";

// WKA (World Karting Association) — fifth karting body in this pass, after NKA, SKUSA, USPKS, and
// AKRA. Only DRIVER safety gear is modeled (see nka.ts for why car/rollover-protection categories
// are omitted entirely). Section 409 ("Safety and Responsibilities") of the Dirt series'
// Competition and Chassis Rules covers driver equipment; it defers helmet certifications to a
// separate document (a supplement to "TM-115.1 Head Gear"), fetched separately below. Unlike NKA/
// SKUSA/USPKS, WKA's neck collar rule doesn't vary by age/division — it's mandatory across the
// board — so this ruleset has no `classes`.
const sourceDoc = {
  title: "WKA Dirt Series — Competition and Chassis Rules",
  version: "2025 Edition",
  url: "https://www.worldkarting.com/rules/",
};

const helmetDoc = {
  title: "WKA 2026 Supplement to TM-115.1, Head Gear",
  version: "Revised February 3, 2026",
  url: "https://www.worldkarting.com/documents/2026/02/2026-helmet-certification-identification-revised.pdf/",
};

const s409 = { ...sourceDoc, section: "409, Safety and Responsibilities" };

// Chest protectors (SFI 20.1, mandatory for Rookie/Junior drivers up to 12) and rib protectors
// (recommended) are real WKA requirements but not modeled — this app has no chest-protector
// category (declined when scoping this pass).

const wkaKarting: Ruleset = {
  id: "wka-karting",
  bodyId: "wka",
  bodyName: "WKA (World Karting Association)",
  disciplineName: "Karting — Dirt/Oval",
  disciplineGroup: "Karting",
  lastReviewed: "2026-08-25",
  sourceDocuments: [sourceDoc, helmetDoc],
  knownGaps: [
    "Chest protector: SFI 20.1-rated device required for Rookie/Junior drivers up to 12 (up to 8 years: SFI 20.1/1; 9–12 years: SFI 20.1/2) — this app doesn't track this as its own category.",
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-k2020", expiresOn: "2030-12-31" },
        { standardId: "snell-sa2020", expiresOn: "2030-12-31" },
        { standardId: "snell-m2020d", expiresOn: "2030-12-31" },
        { standardId: "snell-m2020r", expiresOn: "2030-12-31" },
        { standardId: "snell-k2025", expiresOn: "2035-12-31" },
        { standardId: "snell-sa2025", expiresOn: "2035-12-31" },
        { standardId: "snell-m2025d", expiresOn: "2035-12-31" },
        { standardId: "snell-m2025r", expiresOn: "2035-12-31" },
        { standardId: "snell-cmr2016", validityYearsFromLabel: 10, note: "Youth kart-specific rating — no explicit expiration rule stated in this document; using the same 10-years-from-manufacture convention every other karting body in this app cites for it." },
        { standardId: "snell-cms2016", validityYearsFromLabel: 10, note: "Youth kart-specific rating — see CMR2016 note." },
        { standardId: "sfi-24.1-2020", expiresOn: "2030-12-31" },
        { standardId: "sfi-31.1-2020", expiresOn: "2030-12-31" },
        { standardId: "sfi-41.1-2020", expiresOn: "2030-12-31" },
        { standardId: "sfi-24.1-2025", expiresOn: "2035-12-31" },
        { standardId: "sfi-31.1-2025", expiresOn: "2035-12-31" },
        { standardId: "sfi-41.1-2025", expiresOn: "2035-12-31" },
        { standardId: "fia-8859-2024", expiresOn: "2034-12-31" },
        { standardId: "fia-8860-2018", expiresOn: "2028-12-31" },
      ],
      fullFaceRequirement: "required",
      citation: helmetDoc,
      confidence: "high",
      notes:
        "This is a narrower accepted list than NKA/SKUSA/USPKS/AKRA — WKA's own current supplement only lists the 2020 and 2025 helmet generations (no 2015 or 2010 generation accepted), and only FIA 8859-2024/8860-2018 (not the older FIA generations some other karting bodies still take). \"For any duplicate models to Snell and/or SFI Standards, the Snell and/or SFI Standards will prevail\" per the source document. A helmet found removable without adjusting the straps, or that comes off during a session, gets that driver excluded from the rest of the event.",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required if you have long hair — it must be secured with a balaclava. If visible during competition, the driver is removed from the course.",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited.",
      citation: { ...s409, section: "409.11, Long Hair" },
      confidence: "high",
    },
    hnr: {
      requirement: "not_addressed",
      citation: s409,
      confidence: "high",
      notes: "Not addressed as its own category — most karts don't have the multi-point harness a HANS-style device tethers to. WKA's own Neck Collar requirement (see that category) is the accepted form of neck protection here.",
    },
    neck_collar: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited — WKA calls this \"Helmet Support\" interchangeably with \"Neck Collar.\"",
      citation: { ...s409, section: "409.12, Neck Collar" },
      confidence: "high",
      notes: "Mandatory in all divisions (unlike NKA/SKUSA/USPKS, which only require it for Junior/youth divisions). A driver who loses their helmet support during a session is removed and not allowed to re-enter.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "One-piece abrasion-resistant suit required, OR a racing-grade jacket paired with long pants — NOT a fire-resistance requirement the way car-racing firesuit rules are. No certification standard (e.g. CIK-FIA Level 2) is cited.",
      citation: { ...s409, section: "409.8, Suits/Jackets" },
      confidence: "high",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Required in all classes. No certification standard is cited.",
      citation: { ...s409, section: "409.7, Gloves" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Closed-toe shoes required, intact and properly secured. High-top racing footwear is recommended but not required.",
      citation: { ...s409, section: "409.9, Footwear" },
      confidence: "high",
    },
    socks: {
      requirement: "not_addressed",
      citation: s409,
      confidence: "medium",
      notes: "Not mentioned in the safety section reviewed.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: s409,
      confidence: "medium",
      notes: "Not mentioned in the safety section reviewed.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: s409,
      confidence: "medium",
      notes: "Not mentioned anywhere in the rules reviewed — not a typical kart safety item given the open cockpit design.",
    },
    // hood_pins/spill_kit are car-group categories, unlike the driver-gear-only categories above
    // (see the file-header note on why car categories are otherwise omitted entirely for karting).
    // These two are newly tracked app-wide, so they're checked and recorded explicitly here even
    // though the answer for karting is a confident "not applicable."
    hood_pins: {
      requirement: "not_addressed",
      citation: { ...s409, section: "404, Bodywork" },
      confidence: "high",
      notes: "WKA dirt karts have no hood/engine cover — bodywork is a nosecone, side panels, and fairing. Section 404.2.11 explicitly prohibits adding extra fasteners (\"bolts, screws, pop rivets, etc.\") to attach bolt-on pieces to the nose, the opposite of a hood-pin requirement, confirming this is genuinely not addressed rather than an oversight.",
    },
    spill_kit: {
      requirement: "not_addressed",
      citation: { ...s409, section: "405.1, Fuel System" },
      confidence: "high",
      notes: "No onboard spill-kit requirement anywhere in the rulebook. Section 409.43 only prohibits disposing of fuel/oil on the ground, and Section 405.1 just requires fuel caps that \"prevent fuel spillage\" by design — neither amounts to a requirement to carry absorbent material to contain a spill.",
    },
  },
};

export const wkaRulesets: Ruleset[] = [wkaKarting];

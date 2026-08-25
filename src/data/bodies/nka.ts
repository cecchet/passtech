import { Ruleset } from "../types";

// NKA (National Karting Alliance) — first karting body modeled in this app. Karting only tracks
// DRIVER safety gear here (helmet, suit, gloves, shoes, neck support, balaclava) — no car/rollover-
// protection categories are populated at all (they're simply omitted from `categories` below, so
// they don't render for this ruleset), since a kart's construction (open cockpit, no doors/window
// net, typically no full harness, no fuel cell/fire-system concerns the way a full-size race car
// has) makes those categories inapplicable rather than merely "not addressed." Per NKA's own
// framing (Article 10, Section 10.4.6): "NKA is the largest sanctioning organization for karting in
// the United States."
//
// Karting introduces several genuinely new certification standards not seen in this app's other
// (all car-racing) rulesets: SFI 24.1 (youth helmet), SFI 41.1 (Snell-M-equivalent), Snell
// CMR/CMS2016 (Snell's dedicated child-motorsport helmet ratings), and CIK-FIA Level 2 (karting's
// own suit rating, which is primarily an abrasion/tear-resistance spec rather than the fire-
// resistance spec car-racing firesuit standards are). None of these are accepted by any car-racing
// body already in this app's registry, so a kart racer's gear correctly reads as "not accepted" if
// checked against a car ruleset, and vice versa — exactly the cross-discipline incompatibility this
// pass was meant to surface.
const sourceDoc = {
  title: "NKA (National Karting Alliance) Sporting Regulations",
  version: "Amendment 2/1/2026",
  url: "https://www.nkaonline.com/rules",
};

const s = { ...sourceDoc, section: "Section 10.4.6, Personal Safety Equipment" };

// Chest/rib protectors (SFI 20.1, mandatory for Rookie/Junior drivers up to 13) and rib protectors
// (recommended) are real NKA requirements but not modeled — this app has no chest-protector
// category (declined when scoping this pass, since it doesn't map to any existing category).

const HELMET_STANDARDS = [
  // FIA — 10 years from manufacture date across the board (8860-2018-ABP: 10 years after spec if printed in the helmet).
  { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2010", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
  { standardId: "fia-8860-2018-abp", validityYearsFromLabel: 10 },
  // Snell
  { standardId: "snell-sa2015", expiresOn: "2025-12-31" },
  { standardId: "snell-m2015", expiresOn: "2025-12-31" },
  { standardId: "snell-cmr2016", validityYearsFromLabel: 10, note: "Youth kart-specific rating." },
  { standardId: "snell-cms2016", validityYearsFromLabel: 10, note: "Youth kart-specific rating." },
  { standardId: "snell-k2020", expiresOn: "2030-12-31" },
  { standardId: "snell-m2020d", expiresOn: "2030-12-31" },
  { standardId: "snell-m2020r", expiresOn: "2030-12-31" },
  { standardId: "snell-sa2020", expiresOn: "2030-12-31" },
  // SFI — 24.1 is the youth-specific tier; 31.1 (SA-equivalent) and 41.1 (M-equivalent) are the adult tiers.
  { standardId: "sfi-24.1-2010", expiresOn: "2022-01-01" },
  { standardId: "sfi-31.1-2010", expiresOn: "2022-01-01" },
  { standardId: "sfi-41.1-2010", expiresOn: "2022-01-01" },
  { standardId: "sfi-24.1-2015", expiresOn: "2027-01-01" },
  { standardId: "sfi-31.1-2015", expiresOn: "2027-01-01" },
  { standardId: "sfi-41.1-2015", expiresOn: "2027-01-01" },
  { standardId: "sfi-24.1-2020", expiresOn: "2032-01-01" },
  { standardId: "sfi-31.1-2020", expiresOn: "2032-01-01" },
  { standardId: "sfi-41.1-2020", expiresOn: "2032-01-01" },
  { standardId: "sfi-24.1-2025", expiresOn: "2037-01-01" },
  { standardId: "sfi-31.1-2025", expiresOn: "2037-01-01" },
  { standardId: "sfi-41.1-2025", expiresOn: "2037-01-01" },
];

const nkaKarting: Ruleset = {
  id: "nka-karting",
  bodyId: "nka",
  bodyName: "NKA (National Karting Alliance)",
  disciplineName: "Karting — Sprint",
  disciplineGroup: "Karting",
  lastReviewed: "2026-08-25",
  sourceDocuments: [sourceDoc],
  knownGaps: [
    "Chest protector: SFI 20.1-rated device required for Rookie/Junior drivers up to 13 (up to 8 years: SFI 20.1/1; 9–13 years: SFI 20.1/2) — this app doesn't track this as its own category.",
  ],
  classes: [
    { id: "rookie-junior", label: "Rookie / Junior divisions" },
    { id: "senior", label: "Senior divisions" },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: HELMET_STANDARDS,
      fullFaceRequirement: "required",
      citation: s,
      confidence: "high",
      notes:
        "Helmet must be full coverage (full-face) with the face-shield installed, in \"factory condition\" with no visible shell damage, and all certification stickers present/visible. The youth-specific SFI 24.1 / Snell CMR2016 / CMS2016 tiers exist as options primarily intended for children; adult drivers should use one of the other tiers. Cameras may not be mounted to the helmet in any way (including inside the shell).",
    },
    balaclava: {
      requirement: "conditional",
      condition: "Required only if your hair extends appreciably from beneath the helmet — must be fully contained, no hair visible when \"race ready.\" Not required otherwise.",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited — any balaclava that fully contains the hair satisfies this.",
      citation: { ...sourceDoc, section: "Section 10.4.6.6, Long Hair" },
      confidence: "high",
    },
    hnr: {
      requirement: "not_addressed",
      citation: s,
      confidence: "high",
      notes: "Not addressed as its own category — most karts don't have the multi-point harness a HANS-style device tethers to. NKA's own \"neck collar\"/\"Helmet Support\" requirement (see Neck Collar) is the accepted form of neck protection here; \"advanced neck and head supports\" are separately mentioned as recommended for all ages but not tied to a specific certification.",
    },
    neck_collar: {
      requirement: "conditional",
      condition: "Mandatory for Rookie and Junior divisions; recommended but not mandatory for Senior divisions. Select a division to see which applies to you.",
      materialOnlyAccepted: true,
      materialNote: "No certification standard is cited for the collar itself — NKA calls this a \"neck collar\" or \"Helmet Support\" interchangeably. \"Advanced neck and head supports\" (a HANS-style upgrade) are separately recommended for drivers of all ages, on top of whichever tier applies to your division.",
      citation: { ...sourceDoc, section: "Section 10.4.6.7, Neck Collar" },
      confidence: "high",
      notes: "If a Rookie or Junior driver loses their neck collar/Helmet Support on-track, they're removed from the session and can't return to competition — a Senior driver using one voluntarily doesn't face that penalty for losing it.",
    },
    firesuit: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote:
        "One-piece driving suit of abrasion-resistant material — NOT a fire-resistance requirement the way car-racing firesuit rules are (NKA doesn't cite a specific homologation number like CIK-FIA Level 2 or FIA 8856). A racing jacket (nylon or leather, made for competition) plus long pants is accepted as an alternative to a one-piece suit, provided both are free of rips/holes.",
      citation: { ...sourceDoc, section: "Section 10.4.6.3, Suits/Jackets" },
      confidence: "high",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Required in all divisions — no certification standard is cited.",
      citation: { ...sourceDoc, section: "Section 10.4.6.2, Gloves" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      materialNote: "Closed-toe shoes, properly laced/buckled, free of holes or excessive wear. High-top shoes/boots designed for motorsports use are recommended but not required.",
      citation: { ...sourceDoc, section: "Section 10.4.6.4, Footwear" },
      confidence: "high",
    },
    socks: {
      requirement: "not_addressed",
      citation: s,
      confidence: "medium",
      notes: "Not mentioned in the driver equipment section reviewed.",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: s,
      confidence: "medium",
      notes: "Not mentioned in the driver equipment section reviewed.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: s,
      confidence: "medium",
      notes: "Not mentioned anywhere in the regulations reviewed — not a typical kart safety item given the open cockpit design.",
    },
  },
  classOverrides: {
    "rookie-junior": {
      neck_collar: {
        requirement: "required",
        materialOnlyAccepted: true,
        materialNote: "No certification standard is cited for the collar itself. \"Advanced neck and head supports\" (a HANS-style upgrade) are separately recommended, on top of this requirement.",
        citation: { ...sourceDoc, section: "Section 10.4.6.7, Neck Collar" },
        confidence: "high",
        notes: "Mandatory for all Rookie and Junior divisions. If lost on-track, the driver is removed from the session and can't return to competition for that event.",
      },
    },
    senior: {
      neck_collar: {
        requirement: "recommended",
        materialOnlyAccepted: true,
        materialNote: "No certification standard is cited for the collar itself. \"Advanced neck and head supports\" (a HANS-style upgrade) are separately recommended for drivers of all ages.",
        citation: { ...sourceDoc, section: "Section 10.4.6.7, Neck Collar" },
        confidence: "high",
        notes: "Not mandatory for Senior divisions, but recommended — a Senior driver who elects to use one doesn't face the same on-track-loss penalty Rookie/Junior drivers do.",
      },
    },
  },
};

export const nkaRulesets: Ruleset[] = [nkaKarting];

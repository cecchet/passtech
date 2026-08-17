import { CategoryRule, Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS } from "../standards";

// ============================================================================================
// IMPORTANT SCOPE FLAG — READ BEFORE INTEGRATING
// The source is a Google-Docs-"published" HTML page (2026 GRIDLIFE GTCR Rules), not a PDF —
// it could only be read here via an AI-summarization pass over the page rather than a direct
// verbatim read of the source text. That summarization pass itself flagged a real ambiguity in
// the source: §6 "Driver's Safety Equipment" requires the full suit/HANS/gloves/fire-shoes/
// balaclava/underwear kit for "Unlimited Time Attack" and "Unlimited or GLTC" participants, but
// the document never defines what makes a TrackBattle Time Attack car/entry "Unlimited" versus
// any other tier — no class list, cage/harness threshold, or other criterion is given anywhere
// in the rulebook. Confidence is medium throughout this file as a result. The base TrackBattle
// Time Attack ruleset below models the plainly-stated tier (long pants, closed-toe shoes,
// helmet) rather than guessing at the Unlimited threshold — every category's notes flag the
// stricter Unlimited-tier requirement that may also apply. Recommend a direct read of the
// published doc, and confirmation from GridLife tech, before treating this as final.
// GRIDLIFE Drift is not modeled here — the source states it has no distinct driver PPE rules of
// its own beyond the general competitive standard (roll cage requirements aside, which are
// vehicle equipment, out of this app's scope).
// ============================================================================================

const sourceDoc = {
  title: "GRIDLIFE GTCR 2026 Rules",
  version: "2026",
  url: "https://docs.google.com/document/d/e/2PACX-1vRgYXp-ejrfBFQSysJcY9RzJDpQY1mTGazF82qOWZRZFTj3EkJJ-yBQU6BK2ODdZHdFrhIZSNUdPop2/pub",
};

const helmetRule: CategoryRule = {
  requirement: "required",
  acceptedStandards: [
    { standardId: "snell-sa2015", noExpiration: true },
    { standardId: "snell-sa2020", noExpiration: true },
    { standardId: "snell-sa2025", noExpiration: true },
  ],
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
  notes:
    "'Snell SA 2015 or newer' required — no FIA/SFI alternative and no stated expiration/sunset for any accepted generation. Motorcycle (M-rated) helmets are explicitly prohibited. Applies identically across all GRIDLIFE formats.",
};

// HPDE and base-tier TrackBattle Time Attack share the same plain-clothing requirement.
const basicShoesRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Closed-toe shoes required; no sandals. No fire-resistance or certification required at this tier.",
  citation: { ...sourceDoc, section: "Clothing (general)" },
  confidence: "medium",
};

const basicFiresuitRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: true,
  materialNote: "Long pants required (non-synthetic material, e.g. cotton is acceptable); no shorts. Long sleeves are highly encouraged but not mandatory at this tier.",
  citation: { ...sourceDoc, section: "Clothing (general)" },
  confidence: "medium",
};

// Unlimited Time Attack / GLTC / GLGT / RUSH SR share this full driver-PPE tier per §6.
const competitiveFiresuitRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: false,
  acceptedStandards: [
    { standardId: "sfi-3.2a-1" },
    { standardId: "sfi-3.2a-5" },
    { standardId: "sfi-3.2a-10" },
    { standardId: "sfi-3.2a-15" },
    { standardId: "sfi-3.2a-20" },
    { standardId: "fia-8856-2000" },
  ],
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
  notes:
    "Suit must cover neck-to-ankles/wrists, rated SFI 3.2A/1 or higher, or FIA 8856-2000. One-piece strongly recommended. FIA 8856-2018 is not explicitly confirmed by this research pass — not added without direct confirmation from GridLife, unlike this app's usual convention for bodies read directly from source text.",
};

const competitiveGlovesRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: false,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Fire-resistant gloves required, no holes permitted. No specific SFI 3.3 tier or FIA spec number was identified in this research pass.",
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
};

const competitiveShoesRule: CategoryRule = {
  requirement: "required",
  materialOnlyAccepted: false,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Fire-resistant shoes required, no holes from wear. Nomex socks are also required at this tier — not modeled separately since socks aren't a tracked category in this app.",
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
};

const competitiveHnrRule: CategoryRule = {
  requirement: "required",
  acceptedStandards: [
    { standardId: "sfi-38.1" },
    { standardId: "fia-8858-2002" },
    { standardId: "fia-8858-2010" },
  ],
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
  notes: "Named examples: HANS, NEXTGEN. No specific slash-level or generation stated beyond the SFI 38.1 / FIA 8858-2002/2010 spec families. Only 'encouraged,' not required, for HPDE.",
};

const competitiveUndergarmentRule: CategoryRule = {
  requirement: "conditional",
  condition: "Required unless the driving suit itself is rated FIA 8856-2000 or SFI 3.2A/5-or-higher, in which case it's not required.",
  undergarmentTriggerStandards: ["sfi-3.2a-1"],
  materialOnlyAccepted: true,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Fire-resistant underwear required at lower suit tiers — no specific certification number given for the underwear itself.",
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
};

const competitiveBalaclavaRule: CategoryRule = {
  requirement: "conditional",
  condition: "Highly recommended for all drivers at this tier; required specifically for drivers with facial hair.",
  materialOnlyAccepted: false,
  acceptedStandards: GENERIC_APPAREL_STANDARDS,
  materialNote: "Described as a 'Nomex/fireproof balaclava worn under helmets' — no specific certification number stated.",
  citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
  confidence: "medium",
};

const armRestraintNotRequiredNote =
  "Not required for GLTC/GLGT or Time Attack per this rulebook — arm restraints are encouraged for classes running with a competition harness, but not mandated. Mandatory only in RUSH SR (see that ruleset).";

// HPDE: beginner/intermediate/advanced run groups share identical driver-equipment rules per
// the source (no tiered PPE by skill level, only by driving-privilege/passing protocols, which
// are out of this app's scope).
const hpde: Ruleset = {
  id: "gridlife-hpde",
  bodyId: "gridlife",
  bodyName: "GRIDLIFE",
  disciplineName: "HPDE (Beginner / Intermediate / Advanced)",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "General HPDE Safety Devices; Clothing" }],
  categories: {
    helmet: helmetRule,
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "The balaclava recommendation/facial-hair requirement in §6 is written for the competitive tiers (Unlimited Time Attack/GLTC/GLGT/RUSH SR) — not stated as applying to HPDE.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "HANS/NEXTGEN-type devices are 'encouraged but not mandated' for HPDE specifically.",
    },
    firesuit: basicFiresuitRule,
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "Clothing (general)" },
      confidence: "medium",
      notes: "No glove requirement stated for HPDE.",
    },
    shoes: basicShoesRule,
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: "Not mentioned for HPDE; no certified-suit requirement exists at this tier that would trigger a fire-resistant-underwear condition.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: armRestraintNotRequiredNote,
    },
  },
};

// TrackBattle Time Attack: models the plainly-stated base tier. See file-level note above —
// the source also references a stricter "Unlimited Time Attack" tier requiring the full
// suit/HANS/gloves/fire-shoes/balaclava/underwear kit, but never defines what makes an entry
// "Unlimited." Every category below flags that unresolved ambiguity.
const trackBattleTimeAttack: Ruleset = {
  id: "gridlife-trackbattle-time-attack",
  bodyId: "gridlife",
  bodyName: "GRIDLIFE",
  disciplineName: "TrackBattle Time Attack",
  disciplineGroup: "HPDE / Track Day",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "6. Driver's Safety Equipment" }],
  categories: {
    helmet: helmetRule,
    balaclava: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
      confidence: "medium",
      notes: "Required/recommended only for 'Unlimited Time Attack' participants per §6 — the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    hnr: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
      confidence: "medium",
      notes: "Required only for 'Unlimited Time attack' per §6 — the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    firesuit: {
      ...basicFiresuitRule,
      notes: "Base tier: long pants (non-synthetic). §6 separately requires a full SFI 3.2A/1+ or FIA 8856-2000 suit for 'Unlimited Time attack' participants — the source doesn't define the Unlimited threshold (see file-level note).",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
      confidence: "medium",
      notes: "Required only for 'Unlimited or GLTC' participants per §6 — the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    shoes: {
      ...basicShoesRule,
      notes: "Base tier: closed-toe shoes, no certification. §6 separately requires fire-resistant shoes and Nomex socks for 'Unlimited or GLTC' participants — the source doesn't define the Unlimited threshold (see file-level note).",
    },
    undergarment: {
      requirement: "not_addressed",
      citation: { ...sourceDoc, section: "6. Driver's Safety Equipment" },
      confidence: "medium",
      notes: "Required only at the Unlimited tier (unless the suit itself is FIA 8856-2000/SFI 3.2A/5+) — the source doesn't define the Unlimited threshold (see file-level note). Not modeled as the general rule for this ruleset.",
    },
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: armRestraintNotRequiredNote,
    },
  },
};

// GLTC and GLGT are treated identically for driver PPE per §6 (car-classification differences
// between the two are out of this app's scope) — modeled as a single ruleset.
const gltcGlgt: Ruleset = {
  id: "gridlife-gltc-glgt",
  bodyId: "gridlife",
  bodyName: "GRIDLIFE",
  disciplineName: "Touring Cup (GLTC) / Grand Touring (GLGT)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [{ ...sourceDoc, section: "6. Driver's Safety Equipment" }],
  categories: {
    helmet: helmetRule,
    balaclava: competitiveBalaclavaRule,
    hnr: competitiveHnrRule,
    firesuit: competitiveFiresuitRule,
    gloves: competitiveGlovesRule,
    shoes: competitiveShoesRule,
    undergarment: competitiveUndergarmentRule,
    arm_restraint: {
      requirement: "not_addressed",
      citation: { ...sourceDoc },
      confidence: "medium",
      notes: armRestraintNotRequiredNote,
    },
  },
};

// RUSH SR: same competitive-tier driver PPE as GLTC/GLGT, plus its own mandatory arm-restraint
// rule. Full vehicle/driver specs are deferred by GRIDLIFE to a separate "2026 RUSH SR Spec
// Series Technical Regulations" document not covered by this research pass.
const rushSr: Ruleset = {
  id: "gridlife-rush-sr",
  bodyId: "gridlife",
  bodyName: "GRIDLIFE",
  disciplineName: "RUSH SR (Spec Series)",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-16",
  sourceDocuments: [
    { ...sourceDoc, section: "GLRSR (RUSH SR)" },
    { title: "2026 RUSH SR Spec Series Technical Regulations", version: "2026" },
  ],
  categories: {
    helmet: helmetRule,
    balaclava: competitiveBalaclavaRule,
    hnr: competitiveHnrRule,
    firesuit: competitiveFiresuitRule,
    gloves: competitiveGlovesRule,
    shoes: competitiveShoesRule,
    undergarment: competitiveUndergarmentRule,
    arm_restraint: {
      requirement: "required",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      citation: { ...sourceDoc, section: "GLRSR (RUSH SR)" },
      confidence: "medium",
      notes:
        "Mandatory for all drivers, all on-track sessions. GRIDLIFE defers the exact certification/spec to the separate '2026 RUSH SR Spec Series Technical Regulations' document, which this research pass didn't cover — this ruleset reflects only the overview-level mention in the main GTCR rules.",
    },
  },
};

export const gridlifeRulesets: Ruleset[] = [hpde, trackBattleTimeAttack, gltcGlgt, rushSr];

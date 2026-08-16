import { Ruleset } from "../types";
import { GENERIC_APPAREL_STANDARDS, SFI_3_3_IDS } from "../standards";

const roadRacing: Ruleset = {
  id: "nasa-road-racing",
  bodyId: "nasa",
  bodyName: "NASA",
  disciplineName: "Road Racing",
  disciplineGroup: "Road Racing",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "NASA Club Codes and Regulations (CCR)",
      version: "2026.3 Edition",
      url: "https://members.drivenasa.com/rules/ccr.pdf",
      section: "15.17 Driver's Attire",
    },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", expiresOn: "2026-12-31", note: "CCR: SA2020-minimum becomes required starting Jan 1, 2027." },
        { standardId: "snell-ea2016", expiresOn: "2026-12-31" },
        { standardId: "snell-sa2020", noExpiration: true },
        { standardId: "snell-sa2025", noExpiration: true },
        { standardId: "fia-8860-2010", expiresOn: "2026-12-31", note: "Alone (without a newer FIA 8859 pairing) drops out when the Jan 1, 2027 cutover takes effect." },
        { standardId: "fia-8859-2015", noExpiration: true },
        { standardId: "fia-8860-2018", noExpiration: true },
        { standardId: "fia-8860-2024", noExpiration: true },
        { standardId: "fia-8859-2020", noExpiration: true },
        { standardId: "fia-8859-2024", noExpiration: true },
      ],
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.3" },
      confidence: "high",
      notes:
        "Snell M-rated (motorcycle) helmets — M2015, M2020, CMR2007, etc. — are explicitly NOT acceptable for NASA road racing competition (they are allowed for HPDE/Time Trial under a separate, more lenient CCR §11.3.1 rule, which this app does not cover). 'Strongly recommended' to replace after any substantial impact, though that is not a hard rule.",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", noExpiration: true, note: "CCR Appendix D: SFI-certified devices over 5 years old 'should' be sent back for recertification — worded as a recommendation, not a hard mandate, so not encoded as a hard expiration here." },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true },
      ],
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.8, Appendix D §29.1.1" },
      confidence: "high",
      notes: "Mandatory for all drivers, no class/speed threshold.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-3.2a-1", note: "Minimum tier. Diesel/diesel-mix vehicles require 3.2A/5 or higher instead." },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-10" },
        { standardId: "sfi-3.2a-15" },
        { standardId: "sfi-3.2a-20" },
        { standardId: "sfi-3.4-5", note: "CCR: 'SFI 3.4 is an acceptable substitute where 3.2 is used.'" },
        { standardId: "fia-8856-2000" },
        { standardId: "fia-1986" },
        { standardId: "fia-8856-2018" },
      ],
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.1" },
      confidence: "high",
      notes: "One-piece suits required.",
    },
    gloves: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Fire-resistant material, fully covering the hands with no exposed skin when worn with the driving suit. No specific SFI/FIA certification number cited by the CCR.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.4" },
      confidence: "high",
    },
    shoes: {
      requirement: "required",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "Fire-resistant material OR plain cowhide leather, covering the entire foot with no exposed skin. No specific certification number cited by the CCR.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.6" },
      confidence: "high",
    },
    undergarment: {
      requirement: "conditional",
      condition:
        "Required unless the driving suit is already rated SFI 3.2A/5 or higher, or FIA 8856-2000/2018 — in which case it's 'strongly recommended' but not mandatory. Diesel/diesel-mix vehicles require it if suit rating is below 3.2A/10.",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "CCR: 'Long underwear made of fire-resistant material.' Certification to SFI 3.3 or FIA 8856-2000 is 'strongly recommended in all cases' but plain fire-resistant material satisfies the base requirement.",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.17.2" },
      confidence: "high",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "Required in open cars, and in cars with open T-tops, open Targa tops, a missing moon/sunroof, or a glass moon/sunroof (§15.5, item 1).",
      materialOnlyAccepted: true,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "No SFI or FIA certification number cited by the CCR for this item (contrast: window nets separately cite SFI 27.1 or FIA, at §15.10).",
      citation: { title: "NASA CCR", version: "2026.3", section: "15.5" },
      confidence: "high",
    },
  },
};

const rallySport: Ruleset = {
  id: "nasa-rallysport",
  bodyId: "nasa",
  bodyName: "NASA",
  disciplineName: "RallySport",
  disciplineGroup: "Rally",
  lastReviewed: "2026-08-04",
  sourceDocuments: [
    {
      title: "NASA Rally Sport GRR, Section 3: Technical Regulations for Cars",
      version: "16.0",
      url: "https://nasarallysport.com/rules-forms/2025%20NASA-Rally-Sport-GRR-Section-3.pdf",
      section: "3.36 Personal Safety Items for Occupants",
    },
  ],
  categories: {
    helmet: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "snell-sa2015", validityYearsFromLabel: 10, note: "GRR: 'Helmets over 10 years old are not permitted' — applies to all accepted standards, measured from date on the helmet." },
        { standardId: "snell-sa2020", validityYearsFromLabel: 10 },
        { standardId: "snell-sa2025", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2010", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2018", validityYearsFromLabel: 10 },
        { standardId: "fia-8860-2024", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2015", validityYearsFromLabel: 10 },
        { standardId: "fia-8859-2024", validityYearsFromLabel: 10 },
      ],
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.36.1.1" },
      confidence: "high",
      notes: "Helmets must also be unmodified. Applies to all crew (driver and navigator).",
    },
    hnr: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "sfi-38.1", note: "GRR: 'SFI rated devices must not be expired' — a hard requirement, but the GRR does not itself state a numeric years-old cutoff the way it does for helmets; follow the date on the SFI tag." },
        { standardId: "fia-8858-2002", noExpiration: true },
        { standardId: "fia-8858-2010", noExpiration: true, note: "An FIA sticker supersedes an SFI sticker. FIA devices don't expire, but tethers are dated and expire at (manufacture year + 5) — not modeled separately here; check tether date independently." },
      ],
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.36.1.3" },
      confidence: "high",
      notes: "Mandatory for both driver and co-driver/navigator.",
    },
    firesuit: {
      requirement: "required",
      acceptedStandards: [
        { standardId: "fia-8856-2000" },
        { standardId: "fia-8856-2018" },
        { standardId: "fia-1986" },
        { standardId: "sfi-3.2a-5" },
        { standardId: "sfi-3.2a-1", note: "Acceptable only when paired with fire-resistant underwear meeting an FIA or SFI specification." },
      ],
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.36.1.2" },
      confidence: "high",
      notes: "Required for both crew members. Narrower SFI ladder than NASA Road Racing (no 3.2A/10, /15, /20 tiers named) and no diesel-specific carve-out.",
    },
    gloves: {
      requirement: "not_addressed",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0" },
      confidence: "high",
      notes: "Confirmed real gap: no glove requirement, standard, or recommendation anywhere in the current GRR Section 3.",
    },
    shoes: {
      requirement: "not_addressed",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0" },
      confidence: "high",
      notes: "Confirmed real gap: no shoe requirement anywhere in the current GRR Section 3.",
    },
    undergarment: {
      requirement: "conditional",
      condition: "Required only if the suit worn is the minimum-tier SFI 3.2A/1; not addressed (not even recommended) for higher-rated suits.",
      materialOnlyAccepted: false,
      acceptedStandards: GENERIC_APPAREL_STANDARDS,
      materialNote: "GRR requires underwear 'meeting an FIA or SFI specification' — a certified item, not just generic fire-resistant material. No exact spec number named; mapped here to SFI 3.3 / FIA 8856-2000/2018.",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.36.1.2" },
      confidence: "medium",
    },
    arm_restraint: {
      requirement: "conditional",
      condition:
        "An alternative to a window safety net, for vehicles running without closed windows in the driver's or co-driver's door (§3.22.3). If a window net is fitted instead, no arm restraint is required.",
      materialOnlyAccepted: false,
      acceptedStandards: SFI_3_3_IDS.map((standardId) => ({
        standardId,
        noExpiration: true,
        note: "GRR: 'SFI certified window nets or arm restraints... may be used beyond the expiration date.'",
      })),
      materialNote: "GRR requires arm restraints used as a window-net alternative to specifically meet SFI 3.3 — plain material doesn't qualify for this substitution.",
      citation: { title: "NASA Rally Sport GRR Section 3", version: "16.0", section: "3.22.3" },
      confidence: "high",
    },
  },
};

export const nasaRulesets: Ruleset[] = [roadRacing, rallySport];
